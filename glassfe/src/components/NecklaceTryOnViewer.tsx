"use client";

import React, { useEffect, useRef, useState } from "react";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import { Loader2, CameraOff } from "lucide-react";
import type { ArModelFitMetadata } from "@/lib/types";
import { drawFaceMeshOverlay } from "@/utils/faceMeshOverlay";

type Props = {
  modelUrl: string;
  fitMetadata?: ArModelFitMetadata;
};

const LEFT_EAR_TRAGUS = 234;
const RIGHT_EAR_TRAGUS = 454;
const CHIN = 152;
const FOREHEAD = 10;
const LEFT_EYE_OUTER = 33;
const RIGHT_EYE_OUTER = 263;

type CalibState = {
  offsetX: number;
  offsetY: number;
  offsetZ: number;
  dropAmount: number; // % of face height to drop below chin (0–100 maps to 0–1)
  rotX: number;
  rotY: number;
  rotZ: number;
  scaleMultiplier: number;
  smoothing: number;
};

const defaultCalib: CalibState = {
  offsetX: 0,
  offsetY: 0,
  offsetZ: 20,
  dropAmount: 25,
  rotX: 0,
  rotY: 0,
  rotZ: 0,
  scaleMultiplier: 1,
  smoothing: 0.28,
};

const DEFAULT_FIT: Required<ArModelFitMetadata> = {
  offset: { x: 0, y: 0, z: 0 },
  rotation: { x: 0, y: 0, z: 0 },
  scaleMultiplier: 1,
};

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const clampDelta = (n: number, p: number, m: number) => {
  const d = clamp(n - p, -m, m);
  return p + d;
};

const fileName = (url: string) => {
  const s = url.split("?")[0].split("/");
  return (s[s.length - 1] || "").toLowerCase();
};

export default function NecklaceTryOnViewer({ modelUrl, fitMetadata }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const debugCanvasRef = useRef<HTMLCanvasElement>(null);
  const rendererMountRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>();
  const lastVideoTimeRef = useRef(-1);
  const calibRef = useRef<CalibState>(defaultCalib);

  const [isLoading, setIsLoading] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [showCalib, setShowCalib] = useState(false);
  const [showMesh, setShowMesh] = useState(true);
  const showMeshRef = useRef(true);
  const [calib, setCalib] = useState<CalibState>(defaultCalib);

  useEffect(() => {
    const key = `ar-neck-fit:${fileName(modelUrl)}`;
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const p = JSON.parse(raw) as Partial<CalibState>;
        const next = { ...defaultCalib, ...p };
        calibRef.current = next;
        setCalib(next);
      } else {
        calibRef.current = defaultCalib;
        setCalib(defaultCalib);
      }
    } catch {
      calibRef.current = defaultCalib;
      setCalib(defaultCalib);
    }
  }, [modelUrl]);

  const updateCalib = (patch: Partial<CalibState>) => {
    setCalib((prev) => {
      const next = { ...prev, ...patch };
      calibRef.current = next;
      localStorage.setItem(`ar-neck-fit:${fileName(modelUrl)}`, JSON.stringify(next));
      return next;
    });
  };

  useEffect(() => {
    let active = true;
    let landmarker: FaceLandmarker | null = null;
    let stream: MediaStream | null = null;
    let renderer: THREE.WebGLRenderer | null = null;
    let scene: THREE.Scene | null = null;
    let cam: THREE.PerspectiveCamera | null = null;
    let necklaceAnchor: THREE.Group | null = null;
    let resizeObserver: ResizeObserver | null = null;

    const smooth = {
      pos: new THREE.Vector3(),
      scale: new THREE.Vector3(1, 1, 1),
      quat: new THREE.Quaternion(),
    };
    let hasPose = false;
    let baseScaleByEarSpan = 0.012;
    let smoothing = 0.28;
    let predictErrorCount = 0;

    const merged = {
      offset: { ...DEFAULT_FIT.offset, ...(fitMetadata?.offset ?? {}) },
      rotation: { ...DEFAULT_FIT.rotation, ...(fitMetadata?.rotation ?? {}) },
      scaleMultiplier: fitMetadata?.scaleMultiplier ?? DEFAULT_FIT.scaleMultiplier,
    };
    const ox = merged.offset.x ?? 0;
    const oy = merged.offset.y ?? 0;
    const oz = merged.offset.z ?? 0;
    const frx = merged.rotation.x ?? 0;
    const fry = merged.rotation.y ?? 0;
    const frz = merged.rotation.z ?? 0;

    const v1 = new THREE.Vector3();
    const v2 = new THREE.Vector3();
    const v3 = new THREE.Vector3();
    const m = new THREE.Matrix4();
    const prevE = new THREE.Euler();
    const nextE = new THREE.Euler();

    const stop = () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      stream?.getTracks().forEach((t) => t.stop());
      landmarker?.close();
      resizeObserver?.disconnect();
      if (scene) {
        scene.traverse((o) => {
          const mesh = o as THREE.Mesh;
          mesh.geometry?.dispose();
          const mats = mesh.material
            ? Array.isArray(mesh.material)
              ? mesh.material
              : [mesh.material]
            : [];
          mats.forEach((mat) => mat.dispose?.());
        });
      }
      if (renderer) {
        renderer.dispose();
        const el = renderer.domElement;
        el.parentElement?.removeChild(el);
      }
    };

    const predict = () => {
      const video = videoRef.current;
      if (!video || !landmarker || !active || !renderer || !scene || !cam || !necklaceAnchor)
        return;

      const w = video.videoWidth;
      const h = video.videoHeight;
      if (!w || !h) {
        frameRef.current = requestAnimationFrame(predict);
        return;
      }

      if (video.readyState >= 2 && video.currentTime !== lastVideoTimeRef.current) {
        try {
          lastVideoTimeRef.current = video.currentTime;
          const c = calibRef.current;
          smoothing = clamp(c.smoothing, 0.08, 0.75);
          const fx = ox + c.offsetX;
          const fy = oy + c.offsetY;
          const fz = oz + c.offsetZ;
          const frX = frx + c.rotX;
          const frY = fry + c.rotY;
          const frZ = frz + c.rotZ;
          const scaleM = merged.scaleMultiplier * c.scaleMultiplier;
          const dropFraction = c.dropAmount / 100;

          const res = landmarker.detectForVideo(video, performance.now());
          const lm = res.faceLandmarks?.[0];

          const dbg = debugCanvasRef.current?.getContext("2d");
          if (dbg) {
            if (debugCanvasRef.current!.width !== w || debugCanvasRef.current!.height !== h) {
              debugCanvasRef.current!.width = w;
              debugCanvasRef.current!.height = h;
            }
            dbg.clearRect(0, 0, w, h);
          }

          if (lm) {
            const le = lm[LEFT_EAR_TRAGUS];
            const re = lm[RIGHT_EAR_TRAGUS];
            const chin = lm[CHIN];
            const fore = lm[FOREHEAD];
            const eyeOL = lm[LEFT_EYE_OUTER];
            const eyeOR = lm[RIGHT_EYE_OUTER];

            if (le && re && chin && fore && eyeOL && eyeOR) {
              const mountEl = rendererMountRef.current;
              const mw = mountEl ? mountEl.clientWidth : w;
              const mh = mountEl ? mountEl.clientHeight : h;
              const coverScale = Math.max(mw / w, mh / h);

              const toW = (p: { x: number; y: number; z: number }) =>
                new THREE.Vector3(
                  (p.x - 0.5) * w * coverScale,
                  (0.5 - p.y) * h * coverScale,
                  -p.z * w * coverScale * 1.2,
                );

              const leW = toW(le);
              const reW = toW(re);
              const chinW = toW(chin);
              const foreW = toW(fore);
              const eyeLW = toW(eyeOL);
              const eyeRW = toW(eyeOR);

              const earSpan = Math.max(40, leW.distanceTo(reW));
              const faceHeight = Math.max(60, foreW.distanceTo(chinW));

              // Face basis vectors
              const up = v1.subVectors(foreW, chinW).normalize();
              const eyeAxis = v2.subVectors(eyeRW, eyeLW).normalize();
              let fwd = v3.crossVectors(eyeAxis, up).normalize();
              fwd.negate();

              // Necklace anchor: chin, pushed downward by dropFraction of face height
              const neckPos = chinW.clone();
              neckPos.addScaledVector(up, -dropFraction * faceHeight);

              // Apply fit and calibration offsets in face basis
              neckPos.addScaledVector(eyeAxis, fx);
              neckPos.addScaledVector(up, fy);
              neckPos.addScaledVector(fwd, fz);
              neckPos.z = clamp(neckPos.z, -260, 190);

              // Face-aligned orientation
              m.makeBasis(eyeAxis, up, fwd);
              const targetQ = new THREE.Quaternion().setFromRotationMatrix(m);
              targetQ.multiply(
                new THREE.Quaternion().setFromEuler(new THREE.Euler(frX, frY, frZ)),
              );

              const targetScale = Math.max(0.15, earSpan * baseScaleByEarSpan) * scaleM;

              if (!hasPose) {
                smooth.pos.copy(neckPos);
                smooth.scale.setScalar(targetScale);
                smooth.quat.copy(targetQ);
                hasPose = true;
              } else {
                smooth.pos.set(
                  clampDelta(neckPos.x, smooth.pos.x, 35),
                  clampDelta(neckPos.y, smooth.pos.y, 35),
                  clampDelta(neckPos.z, smooth.pos.z, 28),
                );
                smooth.pos.lerp(neckPos, smoothing);
                smooth.scale.lerp(
                  new THREE.Vector3(targetScale, targetScale, targetScale),
                  smoothing,
                );

                prevE.setFromQuaternion(smooth.quat);
                nextE.setFromQuaternion(targetQ);
                nextE.x = clampDelta(nextE.x, prevE.x, 0.18);
                nextE.y = clampDelta(nextE.y, prevE.y, 0.18);
                nextE.z = clampDelta(nextE.z, prevE.z, 0.18);
                smooth.quat.slerp(
                  new THREE.Quaternion().setFromEuler(nextE),
                  smoothing,
                );
              }

              necklaceAnchor.visible = true;
              necklaceAnchor.position.copy(smooth.pos);
              necklaceAnchor.scale.copy(smooth.scale);
              necklaceAnchor.quaternion.copy(smooth.quat);

              if (dbg && showMeshRef.current) {
                drawFaceMeshOverlay(dbg, lm, w, h, {
                  mirrorX: false,
                  sampleStep: 2,
                  pointRadius: 1,
                  color: "#3b82f6",
                });
                dbg.fillStyle = "#fb923c";
                dbg.strokeStyle = "#000";
                dbg.lineWidth = 2;
                dbg.beginPath();
                dbg.arc(chin.x * w, chin.y * h, 6, 0, Math.PI * 2);
                dbg.fill();
                dbg.stroke();
                dbg.fillStyle = "#fff";
                dbg.font = "11px sans-serif";
                dbg.fillText("C", chin.x * w + 8, chin.y * h - 4);
              }
            } else {
              necklaceAnchor.visible = false;
              if (dbg && lm && showMeshRef.current)
                drawFaceMeshOverlay(dbg, lm, w, h, { mirrorX: false, sampleStep: 2, pointRadius: 1, color: "#3b82f6" });
            }
          } else {
            necklaceAnchor.visible = false;
          }
          predictErrorCount = 0;
        } catch (error) {
          predictErrorCount += 1;
          if (predictErrorCount === 1 || predictErrorCount % 30 === 0) {
            console.warn("AR necklace frame error:", error);
          }
          if (predictErrorCount > 120) {
            setCameraError("Theo dõi khuôn mặt bị gián đoạn. Vui lòng tải lại trang.");
            setIsLoading(false);
            stop();
            return;
          }
        }
      }

      renderer.render(scene, cam);
      frameRef.current = requestAnimationFrame(predict);
    };

    const setupThree = async () => {
      const mount = rendererMountRef.current;
      if (!mount) return;
      while (mount.firstChild) mount.removeChild(mount.firstChild);

      const mw = mount.clientWidth || 640;
      const mh = mount.clientHeight || 480;
      const fov = 47;
      const cz = (mh * 0.5) / Math.tan(THREE.MathUtils.degToRad(fov / 2));

      scene = new THREE.Scene();
      cam = new THREE.PerspectiveCamera(fov, mw / mh, 1, 5000);
      cam.position.set(0, 0, cz);
      cam.lookAt(0, 0, 0);

      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(mw, mh);
      renderer.setClearColor(0x000000, 0);
      mount.appendChild(renderer.domElement);

      scene.add(new THREE.AmbientLight(0xffffff, 1.8));
      const dir = new THREE.DirectionalLight(0xffffff, 1.2);
      dir.position.set(0, 0, 1);
      scene.add(dir);

      necklaceAnchor = new THREE.Group();
      necklaceAnchor.visible = false;
      scene.add(necklaceAnchor);

      const gltf = await new GLTFLoader().loadAsync(modelUrl);
      const root = gltf.scene;
      const box = new THREE.Box3().setFromObject(root);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      root.position.sub(center);
      const maxS = Math.max(size.x, size.y, size.z);
      const norm = maxS > 0 ? 100 / maxS : 1;
      root.scale.setScalar(norm);
      necklaceAnchor.add(root);

      const mb = new THREE.Box3().setFromObject(root);
      const ms = mb.getSize(new THREE.Vector3());
      if (ms.x > 0) baseScaleByEarSpan = 1.2 / ms.x;

      resizeObserver = new ResizeObserver(() => {
        if (!renderer || !cam || !rendererMountRef.current) return;
        const rw = rendererMountRef.current.clientWidth || 640;
        const rh = rendererMountRef.current.clientHeight || 480;
        renderer.setSize(rw, rh);
        cam.aspect = rw / rh;
        cam.updateProjectionMatrix();
      });
      resizeObserver.observe(mount);
    };

    const run = async () => {
      try {
        setIsLoading(true);
        setCameraError(null);
        await setupThree();
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm",
        );
        landmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numFaces: 1,
          outputFaceBlendshapes: false,
        });
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: false,
        });
        if (!videoRef.current || !active) return;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        if (active) {
          setIsLoading(false);
          frameRef.current = requestAnimationFrame(predict);
        }
      } catch (e) {
        console.error(e);
        setIsLoading(false);
        setCameraError("Không thể khởi động camera AR vòng cổ.");
        stop();
      }
    };

    run();
    return () => {
      active = false;
      stop();
    };
  }, [modelUrl, fitMetadata]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full -scale-x-100 object-cover"
        playsInline
        muted
      />
      <div
        ref={rendererMountRef}
        className="absolute inset-0 h-full w-full -scale-x-100 object-cover"
      />
      <canvas
        ref={debugCanvasRef}
        className="pointer-events-none absolute inset-0 z-10 h-full w-full -scale-x-100 object-cover"
      />

      <div className="absolute right-2 top-2 z-20 flex gap-2">
        <button
          type="button"
          onClick={() => setShowCalib((v) => !v)}
          className="rounded bg-black/60 px-3 py-1 text-xs text-white hover:bg-black/75"
        >
          {showCalib ? "Ẩn Fit" : "Fit AR"}
        </button>
        <button
          type="button"
          onClick={() => {
            setShowMesh((v) => {
              const next = !v;
              showMeshRef.current = next;
              return next;
            });
          }}
          className="rounded bg-black/60 px-3 py-1 text-xs text-white hover:bg-black/75"
        >
          {showMesh ? "Ẩn Mesh" : "Hiện Mesh"}
        </button>
      </div>

      {showCalib && (
        <div className="absolute bottom-2 left-2 right-2 z-20 rounded-md bg-black/70 p-3 text-white backdrop-blur-sm">
          <div className="mb-2 text-xs font-semibold">AR Vòng cổ (local)</div>
          <div className="grid grid-cols-2 gap-2 text-[11px] md:grid-cols-4">
            {(
              [
                ["offsetX", "Offset X (trái/phải)", -150, 150, 1, calib.offsetX],
                ["offsetY", "Offset Y (lên/xuống)", -150, 150, 1, calib.offsetY],
                ["offsetZ", "Offset Z (trước/sau)", -200, 200, 1, calib.offsetZ],
                ["dropAmount", "Thả xuống (%)", 0, 80, 1, calib.dropAmount],
                ["scaleMultiplier", "Scale", 0.2, 3.0, 0.01, calib.scaleMultiplier],
                ["rotX", "Rot X", -1.5, 3, 0.01, calib.rotX],
                ["rotY", "Rot Y", -1.5, 1.5, 0.01, calib.rotY],
                ["rotZ", "Rot Z", -1.5, 1.5, 0.01, calib.rotZ],
                ["smoothing", "Smooth", 0.08, 0.75, 0.01, calib.smoothing],
              ] as const
            ).map(([key, label, min, max, step, val]) => (
              <label key={key} className="flex flex-col gap-1">
                <span className="text-[10px] text-white/90">
                  {label}: {val.toFixed(2)}
                </span>
                <input
                  type="range"
                  min={min}
                  max={max}
                  step={step}
                  value={val}
                  onChange={(e) =>
                    updateCalib({ [key]: Number(e.target.value) } as Partial<CalibState>)
                  }
                />
              </label>
            ))}
          </div>
          <div className="mt-2 flex justify-end">
            <button
              type="button"
              className="rounded bg-white/10 px-2 py-1 text-[11px] hover:bg-white/20"
              onClick={() => {
                calibRef.current = defaultCalib;
                setCalib(defaultCalib);
                localStorage.removeItem(`ar-neck-fit:${fileName(modelUrl)}`);
              }}
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {cameraError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/90 p-4 text-center text-white">
          <CameraOff className="h-8 w-8 text-red-400" />
          <p className="text-sm">{cameraError}</p>
        </div>
      )}

      {isLoading && !cameraError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-white">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Đang khởi tạo AR vòng cổ...
        </div>
      )}
    </div>
  );
}

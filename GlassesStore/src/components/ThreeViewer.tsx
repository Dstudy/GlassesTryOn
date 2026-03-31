"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { GLTFLoader } from "three/examples/jsm/Addons.js";

type Props = {
  modelUrl: string;
};

export default function ThreeViewer({ modelUrl }: Props) {
  const [error, setError] = React.useState<string | null>(null);
  const mountRef = useRef<HTMLDivElement>(null);

  if (error) {
    return (
      <div className="flex items-center justify-center w-full h-full text-red-500 p-4 border border-red-500">
        {error}
      </div>
    );
  }

  useEffect(() => {
    if (!mountRef.current) return;

    // Clear any existing canvas elements to prevent duplicates (React Strict Mode issue)
    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }

    /* Scene */
    const scene = new THREE.Scene();
    scene.background = null;
    const envTexture = new THREE.DataTexture(
      new Uint8Array([255, 255, 255]),
      1,
      1,
      THREE.RGBFormat
    );
    envTexture.needsUpdate = true;
    scene.environment = envTexture;

    /* Camera */
    const camera = new THREE.PerspectiveCamera(
      45,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 3);

    /* Renderer */
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setSize(
      mountRef.current.clientWidth,
      mountRef.current.clientHeight
    );
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;

    /* Lights */
    scene.add(new THREE.AmbientLight(0xffffff, 3));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    /* Controls (rotate only) */
    const controls = new (OrbitControls as any)(camera, renderer.domElement);
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.autoRotate = false;
    // Mặc định tắt controls để tránh xoay khi click ra ngoài ngay từ đầu
    controls.enabled = false;

    /* Load GLTF */
    const loader = new GLTFLoader();
    // Biến để lưu trữ tham chiếu đến model cho việc Raycasting
    let loadedModel: THREE.Object3D | null = null;

    loader.load(
      modelUrl,
      (gltf) => {
        loadedModel = gltf.scene; // Lưu tham chiếu model

        /* 🔥 Auto-scale to fit */
        const box = new THREE.Box3().setFromObject(loadedModel);
        const size = box.getSize(new THREE.Vector3()).length();
        const center = box.getCenter(new THREE.Vector3());

        console.log("Model loaded. Size:", size, "Center:", center);

        if (size === 0) {
          console.error("Model has 0 size. Check if it contains meshes.");
        }

        loadedModel.position.set(0, -0.5, 0);
        const scale = 1.5 / size || 1;
        loadedModel.scale.setScalar(scale);

        scene.add(loadedModel);
        console.log("load model successfully");
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      },
      (error) => {
        console.error("An error happened loading the model:", error);
        setError("Error loading model: " + (error as Error).message);
      }
    );

    /* 🔥 LOGIC MỚI: Raycasting để kiểm tra click chuột */
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerDown = (event: PointerEvent) => {
      // Nếu chưa load xong model thì không làm gì cả
      if (!loadedModel) return;

      // 1. Tính toán tọa độ chuột chuẩn hóa (Normalized Device Coordinates) (-1 đến +1)
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      // 2. Cập nhật tia chiếu từ camera
      raycaster.setFromCamera(mouse, camera);

      // 3. Kiểm tra va chạm với model (recursive = true để kiểm tra tất cả mesh con)
      const intersects = raycaster.intersectObject(loadedModel, true);

      // 4. Nếu có va chạm -> Bật controls. Không thì tắt.
      if (intersects.length > 0) {
        controls.enabled = true;
      } else {
        controls.enabled = false;
      }
    };

    // Lắng nghe sự kiện pointerdown (chuột nhấn xuống)
    // Sử dụng { capture: true } để đảm bảo logic của ta chạy trước logic của OrbitControls
    renderer.domElement.addEventListener("pointerdown", onPointerDown, { capture: true });

    /* Animation */
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    /* Resize */
    const onResize = () => {
      if (!mountRef.current) return;
      camera.aspect =
        mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(
        mountRef.current.clientWidth,
        mountRef.current.clientHeight
      );
    };
    window.addEventListener("resize", onResize);

    /* Cleanup */
    return () => {
      window.removeEventListener("resize", onResize);
      renderer.domElement.removeEventListener("pointerdown", onPointerDown, { capture: true } as any);
      renderer.dispose();
      if (mountRef.current && renderer.domElement.parentNode === mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [modelUrl]);

  return <div ref={mountRef} className="w-full h-full" />;
}
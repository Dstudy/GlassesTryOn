"use client";

import React, { useEffect, useRef, useState } from "react";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { classifyFaceShape, FaceShape } from "@/utils/faceShapeClassifier";
import { Loader2 } from "lucide-react";

interface FaceShapeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShapeDetected: (shape: FaceShape) => void;
}

export default function FaceShapeModal({ isOpen, onClose, onShapeDetected }: FaceShapeModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [faceLandmarker, setFaceLandmarker] = useState<FaceLandmarker | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [detectedShape, setDetectedShape] = useState<FaceShape | null>(null);

  const requestRef = useRef<number>();
  const lastVideoTimeRef = useRef<number>(-1);

  // Initialize MediaPipe model
  useEffect(() => {
    let active = true;

    const setupModel = async () => {
      try {
        setIsModelLoading(true);
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        const landmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            delegate: "GPU",
          },
          outputFaceBlendshapes: false,
          runningMode: "VIDEO",
          numFaces: 1,
        });

        if (active) {
          setFaceLandmarker(landmarker);
          setIsModelLoading(false);
        }
      } catch (err) {
        console.error("Error loading MediaPipe model:", err);
      }
    };

    if (isOpen) {
      setupModel();
    }

    return () => {
      active = false;
      if (faceLandmarker) {
        faceLandmarker.close();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Handle Camera
  useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play();
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setCameraError("Không thể truy cập camera. Vui lòng cấp quyền sử dụng camera.");
      }
    };

    if (isOpen && faceLandmarker && !isModelLoading) {
      startCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, faceLandmarker, isModelLoading]);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  // Prediction Loop
  const predictWebcam = () => {
    if (!videoRef.current || !faceLandmarker || !canvasRef.current || !stream) {
      return;
    }

    const video = videoRef.current;
    
    // Ensure video is ready
    if (
      video.readyState >= 2 &&
      video.videoWidth > 0 &&
      video.currentTime !== lastVideoTimeRef.current
    ) {
      lastVideoTimeRef.current = video.currentTime;
      const results = faceLandmarker.detectForVideo(video, performance.now());
      
      const canvasCtx = canvasRef.current.getContext("2d");
      if (canvasCtx) {
        // Adjust Canvas Size
        canvasRef.current.width = video.videoWidth;
        canvasRef.current.height = video.videoHeight;
        
        canvasCtx.save();
        canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        
        if (results.faceLandmarks && results.faceLandmarks.length > 0) {
          const landmarks = results.faceLandmarks[0];
          
          // Draw Mesh Points
          canvasCtx.fillStyle = "#3b82f6"; // primary color
          for (const landmark of landmarks) {
            canvasCtx.beginPath();
            canvasCtx.arc(
              landmark.x * canvasRef.current.width,
              landmark.y * canvasRef.current.height,
              1,
              0,
              2 * Math.PI
            );
            canvasCtx.fill();
          }

          // Classify Shape
          // We limit shape calculations so UI doesn't jitter too much, or use a moving average.
          // For simplicity, we just calculate each frame and lock it after a few confident clicks or manual button.
          const shape = classifyFaceShape(landmarks);
          if (shape !== "Unknown") {
            setDetectedShape(shape);
          }
        }
        canvasCtx.restore();
      }
    }

    requestRef.current = requestAnimationFrame(predictWebcam);
  };

  useEffect(() => {
    if (isOpen && faceLandmarker && stream) {
      // Start predicting
      requestRef.current = requestAnimationFrame(predictWebcam);
    }
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, faceLandmarker, stream]);

  const confirmShape = () => {
    if (detectedShape) {
      onShapeDetected(detectedShape);
      handleClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>AI nhận diện dáng khuôn mặt</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          {cameraError ? (
            <div className="text-red-500 text-center">{cameraError}</div>
          ) : (
            <div className="relative w-full max-w-sm aspect-[3/4] bg-muted rounded-xl overflow-hidden shadow-inner flex items-center justify-center">
              {isModelLoading ? (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span>Đang tải mô hình AI...</span>
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover -scale-x-100" 
                  />
                  <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full object-cover -scale-x-100 pointer-events-none"
                  />
                  <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-xl pointer-events-none" />
                </>
              )}
            </div>
          )}

          {detectedShape && !cameraError && !isModelLoading && (
            <div className="flex flex-col items-center gap-2">
              <span className="text-sm text-muted-foreground">Dáng khuôn mặt được nhận diện:</span>
              <span className="text-2xl font-bold text-primary">{detectedShape}</span>
            </div>
          )}

          <div className="flex w-full justify-end gap-3 mt-4">
            <Button variant="outline" onClick={handleClose}>
              Hủy
            </Button>
            <Button onClick={confirmShape} disabled={!detectedShape || isModelLoading || !!cameraError}>
              Tìm kính phù hợp
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

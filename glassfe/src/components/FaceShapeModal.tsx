"use client";

import React, { useEffect, useRef, useState } from "react";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { classifyFaceShape, FaceShape } from "@/utils/faceShapeClassifier";
import { drawFaceMeshOverlay } from "@/utils/faceMeshOverlay";
import { Loader2, Sparkles } from "lucide-react";
import { productApi } from "@/lib/api";
import { Product } from "@/lib/types";
import ProductCard from "@/components/ProductCard";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FaceShapeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FaceShapeModal({
  isOpen,
  onClose,
}: FaceShapeModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [faceLandmarker, setFaceLandmarker] = useState<FaceLandmarker | null>(
    null,
  );
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // States cho logic tích hợp
  const [detectedShape, setDetectedShape] = useState<FaceShape | null>(null);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [isFetchingProducts, setIsFetchingProducts] = useState(false);

  const [isScanning, setIsScanning] = useState(false);
  const requestRef = useRef<number>();
  const lastVideoTimeRef = useRef<number>(-1);

  // 1. Initialize MediaPipe (Giữ nguyên logic cũ)
  useEffect(() => {
    let active = true;
    const setupModel = async () => {
      try {
        setIsModelLoading(true);
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm",
        );
        const landmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
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
    if (isOpen) setupModel();
    return () => {
      active = false;
      if (faceLandmarker) faceLandmarker.close();
    };
  }, [isOpen]);

  // 2. Handle Camera
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
        setCameraError("Cannot access camera.");
      }
    };
    if (isOpen && faceLandmarker && !isModelLoading) startCamera();
    return () => stopCamera();
  }, [isOpen, faceLandmarker, isModelLoading]);

  const stopCamera = () => {
    if (stream) stream.getTracks().forEach((track) => track.stop());
    setStream(null);
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
  };

  // 3. Logic lấy sản phẩm gợi ý khi phát hiện khuôn mặt
  const fetchProducts = async (shape: FaceShape) => {
    setIsFetchingProducts(true);
    try {
      const res = await productApi.getAllProducts({ face_suitable: shape });
      setRecommendedProducts(res.products || []);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setIsFetchingProducts(false);
    }
  };

  // 4. Prediction Loop & Auto-detect
  const predictWebcam = () => {
    if (!videoRef.current || !faceLandmarker || !canvasRef.current || !stream)
      return;
    const video = videoRef.current;
    if (
      video.readyState >= 2 &&
      video.currentTime !== lastVideoTimeRef.current
    ) {
      lastVideoTimeRef.current = video.currentTime;
      const results = faceLandmarker.detectForVideo(video, performance.now());
      const canvasCtx = canvasRef.current.getContext("2d");
      if (
        canvasCtx &&
        results.faceLandmarks &&
        results.faceLandmarks.length > 0
      ) {
        canvasRef.current.width = video.videoWidth;
        canvasRef.current.height = video.videoHeight;
        const landmarks = results.faceLandmarks[0];

        // Vẽ mesh cơ bản dùng chung với TryOnARViewer
        canvasCtx.clearRect(
          0,
          0,
          canvasRef.current.width,
          canvasRef.current.height,
        );
        drawFaceMeshOverlay(
          canvasCtx,
          landmarks,
          canvasRef.current.width,
          canvasRef.current.height,
          {
            mirrorX: false,
            sampleStep: 1,
            pointRadius: 1,
            color: "#3b82f6",
          },
        );
      }
    }
    requestRef.current = requestAnimationFrame(predictWebcam);
  };

  useEffect(() => {
    if (isOpen && faceLandmarker && stream) {
      requestRef.current = requestAnimationFrame(predictWebcam);
    }

    return () => {
      // Kiểm tra tường minh bằng if thay vì dùng toán tử &&
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isOpen, faceLandmarker, stream]);

  const handleManualScan = async () => {
    if (!videoRef.current || !faceLandmarker) return;

    setIsScanning(true);

    // Thực hiện nhận diện tại thời điểm bấm nút
    const results = faceLandmarker.detectForVideo(
      videoRef.current,
      performance.now(),
    );

    if (results.faceLandmarks && results.faceLandmarks.length > 0) {
      const shape = classifyFaceShape(results.faceLandmarks[0]);
      if (shape !== "Không xác định") {
        setDetectedShape(shape);
        await fetchProducts(shape); // Chỉ gọi API khi nhấn nút
      }
    }
    setIsScanning(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      {/* Tăng độ rộng Modal lên max-w-5xl để chứa 2 cột */}
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-500" />
            AI Smart Recommendation
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* CỘT TRÁI: Camera & Phân tích */}
          <div className="w-full md:w-[60%] p-6 flex flex-col items-center bg-muted/30 border-r">
            <h3 className="text-sm font-semibold mb-4 self-start text-muted-foreground uppercase tracking-wider">
              Step 1: Face Analysis
            </h3>

            <div className="relative w-full aspect-[3/4] bg-black rounded-2xl overflow-hidden shadow-2xl">
              {isModelLoading ? (
                <div className="flex flex-col items-center justify-center h-full text-white gap-2">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span>Loading AI Engine...</span>
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
                </>
              )}
            </div>

            <Button
              onClick={handleManualScan}
              disabled={isScanning || isModelLoading}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 py-6 text-lg font-bold shadow-lg"
            >
              {isScanning ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Scan My Face Shape"
              )}
            </Button>

            {detectedShape && (
              <div className="mt-6 p-4 bg-white rounded-xl border shadow-sm w-full text-center">
                <span className="text-xs text-muted-foreground block mb-1">
                  Detected Shape
                </span>
                <span className="text-2xl font-black text-blue-600 tracking-tight">
                  {detectedShape}
                </span>
              </div>
            )}
          </div>

          {/* CỘT PHẢI: Kết quả gợi ý (Thay thế cho Sidebar cũ) */}
          <div className="w-full md:w-1/2 flex flex-col bg-background">
            <div className="p-6 border-b">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Step 2: Recommendations
              </h3>
            </div>

            <ScrollArea className="flex-1 p-6">
              {/* Container chính để căn giữa nội dung bên trong ScrollArea */}
              <div className="min-h-full flex flex-col justify-center items-center">
                {!detectedShape ? (
                  <div className="flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-muted-foreground/40 animate-pulse" />
                    </div>
                    <p className="text-muted-foreground max-w-[250px]">
                      Please position your face in the camera to see
                      personalized recommendations.
                    </p>
                  </div>
                ) : isFetchingProducts ? (
                  <div className="flex flex-col items-center justify-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    <span className="text-sm font-medium">
                      Finding the perfect frames for {detectedShape}...
                    </span>
                  </div>
                ) : recommendedProducts.length > 0 ? (
                  /* Khi có sản phẩm: Căn giữa các card và chiếm toàn bộ chiều rộng có sẵn */
                  <div className="flex flex-col gap-4 w-full max-w-md mx-auto">
                    {recommendedProducts.map((product) => (
                      <div key={product.id} className="w-full max-w-[350px]">
                        <ProductCard product={product} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground">
                    No specific glasses found for{" "}
                    <span className="font-bold">{detectedShape}</span> shape
                    yet.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        <div className="p-4 border-t bg-muted/10 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          <Button
            onClick={onClose}
            disabled={!detectedShape}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Apply Selection
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// utils/faceShapeClassifier.ts
// Based on Google MediaPipe Face Landmarks indices

export type FaceShape = "Round" | "Square" | "Oval" | "Long" | "Diamond" | "Heart" | "Unknown";

interface Landmark {
  x: number;
  y: number;
  z: number;
}

export function classifyFaceShape(landmarks: Landmark[]): FaceShape {
  if (!landmarks || landmarks.length < 468) return "Unknown";

  const getDistance = (point1: Landmark, point2: Landmark) => {
    return Math.sqrt(
      Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2) + Math.pow(point1.z - point2.z, 2)
    );
  };

  // Landmark indices based on canonical face mesh
  const topForehead = landmarks[10];
  const chin = landmarks[152];
  
  const leftCheekbone = landmarks[234];
  const rightCheekbone = landmarks[454];
  
  const leftJawline = landmarks[132];
  const rightJawline = landmarks[361];
  
  const leftForehead = landmarks[54];
  const rightForehead = landmarks[284];

  // Distances
  const faceLength = getDistance(topForehead, chin);
  const faceWidth = getDistance(leftCheekbone, rightCheekbone);
  const jawlineWidth = getDistance(leftJawline, rightJawline);
  const foreheadWidth = getDistance(leftForehead, rightForehead);

  // Ratios
  const lengthToWidthRatio = faceLength / faceWidth;

  // Simple heuristic classifier
  
  // 1. Long/Oblong: Length is significantly greater than width
  if (lengthToWidthRatio >= 1.45) {
    return "Long";
  }
  
  // 2. Oval: Length is > width, forehead is slightly wider than jawline, rounded chin
  if (lengthToWidthRatio >= 1.25 && lengthToWidthRatio < 1.45) {
    if (jawlineWidth < foreheadWidth && jawlineWidth < faceWidth * 0.9) {
      return "Oval";
    }
  }

  // 3. Heart: Forehead > Cheekbones > Jawline, sharp chin
  if (foreheadWidth > faceWidth * 0.95 && jawlineWidth < faceWidth * 0.8) {
    return "Heart";
  }

  // 4. Diamond: Cheekbones > Forehead AND Cheekbones > Jawline
  if (faceWidth > foreheadWidth * 1.05 && faceWidth > jawlineWidth * 1.05) {
    return "Diamond";
  }

  // 5. Round: Length ≈ Width, jawline is not sharp
  if (lengthToWidthRatio < 1.2) {
    if (jawlineWidth < faceWidth * 0.9) {
      return "Round";
    }
  }

  // 6. Square: Length ≈ Width, jawline is wide/strong (similar to forehead/cheekbones)
  return "Square";
}

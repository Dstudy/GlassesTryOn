// utils/faceShapeClassifier.ts
// Dựa trên chỉ số Google MediaPipe Face Landmarks

export type FaceShape = 
  | "mặt tròn" 
  | "mặt vuông" 
  | "mặt trái xoan" 
  | "mặt dài" 
  | "mặt kim cương" 
  | "Không xác định";

interface Landmark {
  x: number;
  y: number;
  z: number;
}

export function classifyFaceShape(landmarks: Landmark[]): FaceShape {
  if (!landmarks || landmarks.length < 468) return "Không xác định";

  const getDistance = (point1: Landmark, point2: Landmark) => {
    return Math.sqrt(
      Math.pow(point1.x - point2.x, 2) + 
      Math.pow(point1.y - point2.y, 2) + 
      Math.pow(point1.z - point2.z, 2)
    );
  };

  // Các chỉ số Landmark dựa trên Face Mesh chuẩn
  const topForehead = landmarks[10];
  const chin = landmarks[152];
  
  const leftCheekbone = landmarks[234];
  const rightCheekbone = landmarks[454];
  
  const leftJawline = landmarks[132];
  const rightJawline = landmarks[361];
  
  const leftForehead = landmarks[54];
  const rightForehead = landmarks[284];

  // Các kích thước đo đạc
  const faceLength = getDistance(topForehead, chin);
  const faceWidth = getDistance(leftCheekbone, rightCheekbone);
  const jawlineWidth = getDistance(leftJawline, rightJawline);
  const foreheadWidth = getDistance(leftForehead, rightForehead);

  // Tỷ lệ
  const lengthToWidthRatio = faceLength / faceWidth;

  // --- Bộ phân loại logic (Heuristic Classifier) ---

  // 1. Mặt dài (Long): Chiều dài lớn hơn đáng kể so với chiều rộng
  if (lengthToWidthRatio >= 1.45) {
    return "mặt dài";
  }
  
  // 2. Mặt trái xoan (Oval): Dài > Rộng, trán rộng hơn hàm một chút
  if (lengthToWidthRatio >= 1.25 && lengthToWidthRatio < 1.45) {
    if (jawlineWidth < foreheadWidth && jawlineWidth < faceWidth * 0.9) {
      return "mặt trái xoan";
    }
  }

  // 3. Mặt kim cương (Diamond): Gò má là phần rộng nhất (Rộng hơn trán và hàm)
  // Lưu ý: Tôi ưu tiên Diamond lên trước vì logic Heart/Oval có thể bị chồng lấn
  if (faceWidth > foreheadWidth * 1.05 && faceWidth > jawlineWidth * 1.05) {
    return "mặt kim cương";
  }

  // 4. Mặt tròn (Round): Chiều dài ≈ Chiều rộng, hàm không góc cạnh
  if (lengthToWidthRatio < 1.2) {
    if (jawlineWidth < faceWidth * 0.9) {
      return "mặt tròn";
    }
  }

  // 5. Mặt vuông (Square): Chiều dài ≈ Chiều rộng, hàm rộng và khỏe
  return "mặt vuông";
}
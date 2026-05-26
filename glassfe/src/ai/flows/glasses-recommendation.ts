'use server';

// 1. Import thực thể `ai` mà bạn đã cấu hình từ file genkit.ts
import { ai } from '../genkit'; 
import { productApi } from '@/lib/api';
import { z } from 'zod';
import { type Product } from '@/lib/types'; 
import { llama3x8b } from 'genkitx-groq';


// ===== 2. Định nghĩa Schema Output mong muốn bằng Zod =====
// Genkit sẽ tự động ép model ép trả về cấu trúc JSON y hệt schema này
const GlassesRecommendationOutputSchema = z.object({
  recommendation: z.string(),
  recommendedProductIds: z.array(z.number()).length(3),
});

export type GlassesRecommendationInput = { needsDescription: string };
export type GlassesRecommendationOutput = {
  recommendation: string;
  recommendedProducts: Product[];
};

// ===== MAIN FUNCTION =====
export async function glassesRecommendation(
  input: GlassesRecommendationInput
): Promise<GlassesRecommendationOutput> {

  // 1. Fetch dữ liệu từ API/DB
  const response = await productApi.getAllProducts();
  const rawProducts = response.products.slice(0, 20);

  // Tối ưu danh sách sản phẩm gửi lên AI
  const optimizedCatalog = rawProducts.map(p => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price: Number(p.price),
    shape: p.shape,
    material: p.material,
    face_suitable: p.face_suitable,
  }));

try {
  // 2. Gọi AI thông qua Genkit instance
  const aiResponse = await ai.generate({
  model: 'groq/llama-3.1-8b-instant' as any, 
  system: `
    You are an expert eyeglasses stylist.
    Analyze the user's needs and select the 3 best matching products from the provided catalog.
    
    CRITICAL: You must respond ONLY with a raw, valid JSON object matching the requested schema. 
    Do not include markdown blocks like \`\`\`json, do not write preamble, and do not add conversational text.

    Rules:
    - Only choose product IDs that exist in the catalog.
    - Return EXACTLY 3 product IDs in the 'recommendedProductIds' array.
  `,
  prompt: `
    User needs: ${input.needsDescription}
    Catalog: ${JSON.stringify(optimizedCatalog)}
  `,
  // 👇 Add the explicit json configuration format here
  output: {
    format: 'json', 
    schema: GlassesRecommendationOutputSchema,
  },
});

  const aiResult = aiResponse.output;

    if (!aiResult) {
      throw new Error("AI returned empty output");
    }

    // 3. Map ngược lại sang interface Product
    const recommendedProducts: Product[] = aiResult.recommendedProductIds
      .map(id => {
        const original = rawProducts.find(p => p.id === id);
        if (!original) return null;
        return {
          ...original,
          price: Number(original.price),
          arTryOnCategory: "glasses" as const
        };
      })
      .filter((p): p is Product => p !== null);

    return {
      recommendation: aiResult.recommendation,
      recommendedProducts,
    };

  } catch (err) {
    console.error("Genkit execution failed → fallback", err);

    // Fallback khi lỗi
    const fallbackProducts: Product[] = rawProducts
      .slice(0, 3)
      .map(p => ({
        ...p,
        price: Number(p.price),
        arTryOnCategory: "glasses" as const
      }));

    return {
      recommendation: "Gợi ý tạm thời dựa trên sản phẩm nổi bật.",
      recommendedProducts: fallbackProducts,
    };
  }
}
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, ShelfScanResult, BeautyAnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function analyzeBeauty(shelfImageBase64: string, skinImageBase64: string): Promise<BeautyAnalysisResult> {
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `You are a Master Beauty Consultant VLM.
  
  Goal: Analyze a cosmetic shelf and perform 'Shade Matching' for every foundation, lipstick, nail polish, blush, concealer, and primer found.
  
  Logic for Shade Matching:
  Skin Tone: Reference the user's Monk Skin Tone (1-10).
  Undertone: Detect if the user is Warm (gold/yellow), Cool (pink/blue), or Neutral.
  
  Lipstick Match:
  - GREEN: Shades that complement the undertone (e.g., Warm Reds for Warm skin).
  - RED: Shades that clash (e.g., Cool Purples on Warm skin).
  
  Foundation Match:
  - GREEN: Exact tone match (±1 level) and matching undertone.
  - RED: Too light, too dark, or wrong undertone (e.g., 'Ashy' or 'Orange' look).

  Nail Polish:
  - Match based on skin undertone. (e.g., Cool-toned skin gets Green for Berries/Blues; Warm gets Green for Corals/Golds).

  Blush:
  - Fair Skin (Monk 1-3): Suggest Peach/Soft Pink.
  - Medium Skin (Monk 4-7): Suggest Mauve/Apricot.
  - Deep Skin (Monk 8-10): Suggest Berry/Brick Red.

  Concealer:
  - Must match the foundation shade exactly or be 1 shade lighter for brightening. Flag 'RED' if it’s more than 2 shades off.

  Primer:
  - Analyze based on skin concern (e.g., Mattifying primer for Oily skin = GREEN; Hydrating primer for Dry skin = GREEN).
  
  Logic for Color Indicators:
  - GREEN: Perfect shade match + skin-safe (non-toxic).
  - YELLOW: Good shade match but contains comedogenic (pore-clogging) ingredients.
  - RED: Wrong shade OR contains toxic ingredients (Phthalates/Parabens).

  Color Extraction:
  For every product (especially Lipstick, Foundation, Blush, Concealer, or Nail Polish), identify the exact shade and find the HEX Color Code that best represents that shade (e.g., #E9967A for a peach blush).
  
  Output: Return ONLY a JSON object containing detectedSkinTone (1-10), detectedUndertone (Warm/Cool/Neutral), and a shelf_analysis array with product_type (Lipstick/Foundation/Nail Polish/Blush/Concealer/Primer), indicator_color (GREEN/RED/YELLOW), shade_advice, and hex_code.`;

  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        parts: [
          { text: "Analyze the skin image to detect Monk Skin Tone and Undertone, then analyze the shelf image to identify beauty products and perform shade matching with safety analysis and color extraction." },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: skinImageBase64.split(",")[1] || skinImageBase64
            }
          },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: shelfImageBase64.split(",")[1] || shelfImageBase64
            }
          }
        ]
      }
    ],
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          detectedSkinTone: { type: Type.NUMBER, description: "Monk Skin Tone (1-10)" },
          detectedUndertone: { type: Type.STRING, enum: ["Warm", "Cool", "Neutral"] },
          shelf_analysis: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                brand: { type: Type.STRING },
                product_type: { type: Type.STRING, enum: ["Lipstick", "Foundation", "Nail Polish", "Blush", "Concealer", "Primer"] },
                indicator_color: { type: Type.STRING, enum: ["RED", "YELLOW", "GREEN"] },
                shade_advice: { type: Type.STRING },
                hex_code: { type: Type.STRING, description: "HEX color code representing the product shade" }
              },
              required: ["name", "brand", "product_type", "indicator_color", "shade_advice", "hex_code"]
            }
          }
        },
        required: ["detectedSkinTone", "detectedUndertone", "shelf_analysis"]
      }
    }
  });

  if (!response.text) {
    throw new Error("No response from AI");
  }

  return JSON.parse(response.text);
}

export async function scanShelf(shelfImageBase64: string, skinImageBase64: string): Promise<ShelfScanResult> {
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `You are a 'Skincare Analysis' Expert and Dermatological VLM.
  
  Goal: Perform a comprehensive analysis of a user's skincare collection and match it to their unique skin profile.
  
  1. Identify Skin Profile: Analyze the provided skin image to determine the user's skin type (e.g., 'Sensitive/Dry', 'Oily/Acne-Prone', 'Combination', 'Normal', 'Mature/Aging').
  2. Identify Products & Ingredients: Look at the entire shelf/collection and identify every skincare product. Extract key active ingredients for each.
  3. Match & Evaluate: Compare the detected skin type and profile with each product's ingredients and purpose.
  
  Assign Color Indicators:
  GREEN: Perfect match. Safe, effective, and highly recommended for the user's skin profile.
  YELLOW: Safe but neutral or contains minor irritants/fragrance that might not be ideal.
  RED: Avoid. Contains toxic ingredients, known allergens for the skin type, or is otherwise harmful/counterproductive.
  
  Output Format: Return ONLY a JSON object containing the detected skin type and an array called shelf_products matching the provided schema.`;

  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        parts: [
          { text: "Analyze the skin image to detect the skin profile, then perform a detailed skincare analysis of the shelf image, identifying products and ingredients to rate them against the user's needs." },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: skinImageBase64.split(",")[1] || skinImageBase64
            }
          },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: shelfImageBase64.split(",")[1] || shelfImageBase64
            }
          }
        ]
      }
    ],
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          detectedSkinType: { type: Type.STRING },
          shelf_products: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                brand: { type: Type.STRING },
                rating: { type: Type.STRING, enum: ["RED", "YELLOW", "GREEN"] },
                reasoning: { type: Type.STRING },
                keyIngredients: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["name", "brand", "rating", "reasoning", "keyIngredients"]
            }
          }
        },
        required: ["detectedSkinType", "shelf_products"]
      }
    }
  });

  if (!response.text) {
    throw new Error("No response from AI");
  }

  return JSON.parse(response.text);
}

export async function analyzeDermatology(skinImageBase64: string, productImageBase64: string): Promise<AnalysisResult> {
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `You are an expert Dermatological VLM. Your goal is to help women stay safe from toxic cosmetics.
  
  Identify Body Part: If an image of skin is uploaded, identify the body part and analyze for dryness, irritation, or type.
  Analyze Products: If a shelf/bottle is uploaded, identify the product. Use internal knowledge for ingredients if the back label isn't clear.
  Compare & Color Code: Compare the skin's needs with the product's chemicals.
  
  RED: Toxic (Parabens/Sulfates) or harmful for that specific body part.
  YELLOW: Safe but not effective.
  GREEN: Safe and perfect for the user's skin condition.
  
  Output: Always respond in JSON format only matching the provided schema.`;

  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        parts: [
          { text: "Analyze these two images: the first is a skin area, the second is a cosmetic product. Provide a detailed dermatological analysis and safety comparison." },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: skinImageBase64.split(",")[1] || skinImageBase64
            }
          },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: productImageBase64.split(",")[1] || productImageBase64
            }
          }
        ]
      }
    ],
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          skinAnalysis: {
            type: Type.OBJECT,
            properties: {
              bodyPart: { type: Type.STRING },
              condition: { type: Type.STRING },
              type: { type: Type.STRING },
              needs: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["bodyPart", "condition", "type", "needs"]
          },
          productAnalysis: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              brand: { type: Type.STRING },
              ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
              toxicIngredients: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["name", "brand", "ingredients", "toxicIngredients"]
          },
          comparison: {
            type: Type.OBJECT,
            properties: {
              rating: { type: Type.STRING, enum: ["RED", "YELLOW", "GREEN"] },
              reasoning: { type: Type.STRING },
              recommendation: { type: Type.STRING }
            },
            required: ["rating", "reasoning", "recommendation"]
          }
        },
        required: ["skinAnalysis", "productAnalysis", "comparison"]
      }
    }
  });

  if (!response.text) {
    throw new Error("No response from AI");
  }

  return JSON.parse(response.text);
}

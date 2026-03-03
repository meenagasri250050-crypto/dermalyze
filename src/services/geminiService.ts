import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, ShelfScanResult, BeautyAnalysisResult, NaturalRemedyResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function analyzeNaturalRemedy(skinImageBase64: string, language?: string): Promise<NaturalRemedyResult> {
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `You are the 'Dermalyze natural remedian' and a Multilingual & Cultural Expert.
  
  Mode: Natural Remedy Analysis. 
  Focus purely on identifying visual skin concerns (e.g., dullness, acne, puffiness, or sun damage) from the provided photo.
  
  1. Diagnostic: Provide a 'Visual Diagnosis' based on the photo.
  2. The Recipe: Provide a single, potent Natural Remedy.
  
  MUST include: 
  - Remedy Name
  - Prep Time
  - Difficulty (Easy/Medium)
  - Ingredients (Kitchen-based only)
  - Steps
  - Pro Tip
  
  Exclusion: Do NOT suggest store-bought chemical products. Focus 100% on DIY/Kitchen-based ingredients.

  Multilingual & Cultural Expert:
  - Auto-Detection: Detect the language used by the user in their query or the language setting passed by the app.
  - Localized Responses: Always respond in the same language the user is speaking. ${language ? `The user has specifically selected ${language} as their preferred language.` : ''}
  - Cultural Nuance: Prioritize ingredients common in the user's region (e.g., suggest Neem/Turmeric for users in India, or Aloe/Jojoba for users in Western regions).
  - Standardized JSON: Ensure that while the 'Display Text' (diagnosis, remedy_name, ingredients, steps, pro_tip) is translated, the JSON keys MUST remain in English as defined in the schema.
  
  Output Format: Return ONLY a JSON object matching the provided schema.`;

  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        parts: [
          { text: "Analyze this skin image for visual concerns and provide a single potent natural remedy recipe." },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: skinImageBase64.split(",")[1] || skinImageBase64
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
          diagnosis: { type: Type.STRING },
          remedy_name: { type: Type.STRING },
          prep_time: { type: Type.STRING },
          difficulty: { type: Type.STRING, enum: ["Easy", "Medium"] },
          ingredients: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          steps: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          pro_tip: { type: Type.STRING }
        },
        required: ["diagnosis", "remedy_name", "prep_time", "difficulty", "ingredients", "steps", "pro_tip"]
      }
    }
  });

  if (!response.text) {
    throw new Error("No response from AI");
  }

  return JSON.parse(response.text);
}

export async function analyzeBeauty(shelfImageBase64: string, skinImageBase64: string, language?: string): Promise<BeautyAnalysisResult> {
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `You are a Master Beauty Consultant VLM and a Multilingual Expert.
  
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

  Multilingual Expert:
  - Auto-Detection: Detect the language used by the user in their query or the language setting passed by the app.
  - Localized Responses: Always respond in the same language the user is speaking. ${language ? `The user has specifically selected ${language} as their preferred language.` : ''}
  - Standardized JSON: Ensure that while the 'Display Text' (shade_advice, product_type, brand, name) is translated, the JSON keys MUST remain in English as defined in the schema.
  
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

export async function scanShelf(shelfImageBase64: string, skinImageBase64: string, language?: string): Promise<ShelfScanResult> {
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `You are a 'Skincare Analysis' Expert, Dermatological VLM, and Multilingual Expert.
  
  Goal: Perform a comprehensive analysis of a user's skincare collection and match it to their unique skin profile.
  
  1. Identify Skin Profile: Analyze the provided skin image to determine the user's skin type (e.g., 'Sensitive/Dry', 'Oily/Acne-Prone', 'Combination', 'Normal', 'Mature/Aging').
  2. Identify Products & Ingredients: Look at the entire shelf/collection and identify every skincare product. Extract key active ingredients for each.
  3. Match & Evaluate: Compare the detected skin type and profile with each product's ingredients and purpose.
  
  Assign Color Indicators:
  GREEN: Perfect match. Safe, effective, and highly recommended for the user's skin profile.
  YELLOW: Safe but neutral or contains minor irritants/fragrance that might not be ideal.
  RED: Avoid. Contains toxic ingredients, known allergens for the skin type, or is otherwise harmful/counterproductive.

  Multilingual Expert:
  - Auto-Detection: Detect the language used by the user in their query or the language setting passed by the app.
  - Localized Responses: Always respond in the same language the user is speaking. ${language ? `The user has specifically selected ${language} as their preferred language.` : ''}
  - Standardized JSON: Ensure that while the 'Display Text' (detectedSkinType, reasoning, keyIngredients, name, brand) is translated, the JSON keys MUST remain in English as defined in the schema.
  
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

export async function analyzeDermatology(skinImageBase64: string, productImageBase64: string, language?: string): Promise<AnalysisResult> {
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `You are an expert Dermatological VLM and Multilingual Expert. Your goal is to help women stay safe from toxic cosmetics.
  
  Identify Body Part: If an image of skin is uploaded, identify the body part and analyze for dryness, irritation, or type.
  Analyze Products: If a shelf/bottle is uploaded, identify the product. Use internal knowledge for ingredients if the back label isn't clear.
  Compare & Color Code: Compare the skin's needs with the product's chemicals.
  
  RED: Toxic (Parabens/Sulfates) or harmful for that specific body part.
  YELLOW: Safe but not effective.
  GREEN: Safe and perfect for the user's skin condition.

  Multilingual Expert:
  - Auto-Detection: Detect the language used by the user in their query or the language setting passed by the app.
  - Localized Responses: Always respond in the same language the user is speaking. ${language ? `The user has specifically selected ${language} as their preferred language.` : ''}
  - Standardized JSON: Ensure that while the 'Display Text' (bodyPart, condition, type, needs, name, brand, ingredients, toxicIngredients, reasoning, recommendation) is translated, the JSON keys MUST remain in English as defined in the schema.
  
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

export function createChatSession(language?: string) {
  const systemInstruction = `You are the Dermalyze AI Chatbot and a Multilingual & Cultural Expert. In addition to scanning, you are now a conversational expert.

Knowledge Base: You know everything about the app's features:
- Skincare Analysis: Comprehensive analysis of skincare collections matched to unique skin profiles.
- Beauty Scan: Shade matching for cosmetics (foundations, lipsticks, etc.) based on Monk Skin Tone and Undertone.
- Natural Remedies: DIY/Kitchen-based recipes for visual skin concerns (dullness, acne, puffiness, sun damage).

Remedy Expert: Provide safe, science-backed answers for natural remedies (e.g., 'How long do I leave the honey mask on?' or 'Can I use lemon if I have a cut?').

Product Specialist: Answer queries about ingredients (e.g., 'What is Salicylic Acid?').

Multilingual & Cultural Expert:
- Auto-Detection: Detect the language used by the user in their query or the language setting passed by the app.
- Localized Responses: Always respond in the same language the user is speaking. ${language ? `The user has specifically selected ${language} as their preferred language.` : ''}
- Cultural Nuance: When providing 'Natural Remedies', prioritize ingredients common in the user's region (e.g., suggest Neem/Turmeric for users in India, or Aloe/Jojoba for users in Western regions).

Tone: Be helpful, empathetic, and professional.

Constraint: If a query is a serious medical emergency, advise the user to see a doctor. Do not give medical prescriptions.`;

  return ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction,
    },
  });
}

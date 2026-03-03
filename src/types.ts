export enum Rating {
  RED = "RED",
  YELLOW = "YELLOW",
  GREEN = "GREEN"
}

export interface SkinAnalysis {
  bodyPart: string;
  condition: string;
  type: string;
  needs: string[];
}

export interface ProductAnalysis {
  name: string;
  brand: string;
  ingredients: string[];
  toxicIngredients: string[];
}

export interface Comparison {
  rating: Rating;
  reasoning: string;
  recommendation: string;
}

export interface AnalysisResult {
  skinAnalysis: SkinAnalysis;
  productAnalysis: ProductAnalysis;
  comparison: Comparison;
}

export interface ShelfProduct {
  name: string;
  brand: string;
  rating: Rating;
  reasoning: string;
  keyIngredients: string[];
}

export interface ShelfScanResult {
  detectedSkinType: string;
  shelf_products: ShelfProduct[];
}

export interface BeautyProduct {
  name: string;
  brand: string;
  product_type: 'Lipstick' | 'Foundation' | 'Nail Polish' | 'Blush' | 'Concealer' | 'Primer';
  indicator_color: Rating;
  shade_advice: string;
  hex_code?: string;
}

export interface BeautyAnalysisResult {
  detectedSkinTone: number; // 1-10
  detectedUndertone: 'Warm' | 'Cool' | 'Neutral';
  shelf_analysis: BeautyProduct[];
}

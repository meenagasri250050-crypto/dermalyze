import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ShieldAlert, CheckCircle2, AlertTriangle, Loader2, RefreshCcw, Info, Droplets, FlaskConical, Beaker, LayoutGrid, Scan, ChevronRight, Palette, User, Leaf, Clock, Zap, MessageSquare, X } from 'lucide-react';
import { ImageUpload } from './components/ImageUpload';
import { ChatBot } from './components/ChatBot';
import { analyzeDermatology, scanShelf, analyzeBeauty, analyzeNaturalRemedy } from './services/geminiService';
import { AnalysisResult, Rating, ShelfScanResult, BeautyAnalysisResult, NaturalRemedyResult } from './types';

type Tab = 'single' | 'shelf' | 'beauty' | 'natural' | 'chat';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab | null>(null);
  
  // Single Analysis State
  const [skinImage, setSkinImage] = useState<string | null>(null);
  const [productImage, setProductImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  
  // Shelf Scan State
  const [shelfSkinImage, setShelfSkinImage] = useState<string | null>(null);
  const [shelfImage, setShelfImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [shelfResult, setShelfResult] = useState<ShelfScanResult | null>(null);
  
  // Beauty Scan State
  const [beautySkinImage, setBeautySkinImage] = useState<string | null>(null);
  const [beautyShelfImage, setBeautyShelfImage] = useState<string | null>(null);
  const [isBeautyScanning, setIsBeautyScanning] = useState(false);
  const [beautyResult, setBeautyResult] = useState<BeautyAnalysisResult | null>(null);
  
  // Natural Remedy State
  const [naturalImage, setNaturalImage] = useState<string | null>(null);
  const [isNaturalAnalyzing, setIsNaturalAnalyzing] = useState(false);
  const [naturalResult, setNaturalResult] = useState<NaturalRemedyResult | null>(null);
  
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [overlayTab, setOverlayTab] = useState<Tab | null>(null);
  
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOverlayOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOverlayOpen]);

  const handleTabClick = (tab: Tab) => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    if (isMobile) {
      setOverlayTab(tab);
      setIsOverlayOpen(true);
    } else {
      setActiveTab(tab);
      reset();
    }
  };

  const renderTabContent = (tab: Tab | null) => {
    if (!tab) {
      return (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-zinc-400 mb-6 shadow-sm border border-zinc-100">
            <Sparkles className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-serif italic mb-2">Welcome to Dermalyze</h2>
          <p className="text-zinc-500 max-w-md mx-auto leading-relaxed">
            Select one of the tools above to begin your skincare analysis and get expert advice.
          </p>
        </motion.div>
      );
    }
    if (tab === 'single') {
      return (
        <>
          {!result ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <ImageUpload
                  id="skin-upload"
                  label="Step 1: Your Skin"
                  description="Upload a clear photo of the skin area"
                  image={skinImage}
                  onImageSelect={(img) => {
                    setSkinImage(img);
                    if (img && productImage) handleAnalyze(img, productImage);
                  }}
                  facingMode="user"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <ImageUpload
                  id="product-upload"
                  label="Step 2: The Product"
                  description="Upload the product bottle or shelf"
                  image={productImage}
                  onImageSelect={(img) => {
                    setProductImage(img);
                    if (img && skinImage) handleAnalyze(skinImage, img);
                  }}
                  facingMode="environment"
                />
              </motion.div>

              <div className="md:col-span-2 flex flex-col items-center gap-4 mt-4 w-full">
                <button
                  onClick={() => handleAnalyze()}
                  disabled={!skinImage || !productImage || isAnalyzing}
                  className={`w-full md:w-auto px-12 py-4 rounded-full font-semibold transition-all duration-300 flex items-center justify-center gap-2
                    ${!skinImage || !productImage || isAnalyzing
                      ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                      : 'bg-zinc-900 text-white hover:bg-zinc-800 shadow-lg hover:shadow-xl active:scale-95'
                    }`}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      Analyze Safety
                    </>
                  )}
                </button>
                {error && (
                  <p className="text-rose-500 text-sm font-medium">{error}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Results Header */}
              <div className={`p-6 rounded-3xl border flex flex-col md:flex-row items-center gap-6 ${getRatingColor(result.comparison.rating)}`}>
                <div className="p-4 bg-white rounded-2xl shadow-sm">
                  {getRatingIcon(result.comparison.rating)}
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-2xl font-bold mb-1">
                    {result.comparison.rating === Rating.GREEN && "Highly Recommended"}
                    {result.comparison.rating === Rating.YELLOW && "Safe but Ineffective"}
                    {result.comparison.rating === Rating.RED && "Avoid this Product"}
                  </h2>
                  <p className="opacity-90 leading-relaxed">{result.comparison.reasoning}</p>
                </div>
                <button
                  onClick={reset}
                  className="p-4 bg-white/50 hover:bg-white/80 rounded-full transition-colors shadow-sm"
                >
                  <RefreshCcw className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Skin Analysis */}
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass p-8 rounded-3xl card-shadow"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-zinc-100 rounded-lg">
                      <Droplets className="w-5 h-5 text-zinc-600" />
                    </div>
                    <h3 className="font-bold text-lg">Skin Profile</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Body Part</label>
                      <p className="text-zinc-900 font-medium">{result.skinAnalysis.bodyPart}</p>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Condition</label>
                      <p className="text-zinc-900 font-medium">{result.skinAnalysis.condition}</p>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Skin Type</label>
                      <p className="text-zinc-900 font-medium">{result.skinAnalysis.type}</p>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Primary Needs</label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {result.skinAnalysis.needs.map((need, i) => (
                          <span key={i} className="px-3 py-1 bg-zinc-100 text-zinc-600 text-xs rounded-full">
                            {need}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.section>

                {/* Product Analysis */}
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="glass p-8 rounded-3xl card-shadow"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-zinc-100 rounded-lg">
                      <FlaskConical className="w-5 h-5 text-zinc-600" />
                    </div>
                    <h3 className="font-bold text-lg">Product Details</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Product Name</label>
                      <p className="text-zinc-900 font-medium">{result.productAnalysis.name}</p>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Brand</label>
                      <p className="text-zinc-900 font-medium">{result.productAnalysis.brand}</p>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Ingredients</label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {result.productAnalysis.ingredients.slice(0, 8).map((ing, i) => (
                          <span key={i} className="px-2 py-1 bg-zinc-50 border border-zinc-100 text-zinc-500 text-[10px] rounded-md">
                            {ing}
                          </span>
                        ))}
                        {result.productAnalysis.ingredients.length > 8 && (
                          <span className="text-[10px] text-zinc-400">+{result.productAnalysis.ingredients.length - 8} more</span>
                        )}
                      </div>
                    </div>
                    {result.productAnalysis.toxicIngredients.length > 0 && (
                      <div>
                        <label className="text-[10px] uppercase tracking-widest text-rose-400 font-bold">Toxic Flags</label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {result.productAnalysis.toxicIngredients.map((toxic, i) => (
                            <span key={i} className="px-3 py-1 bg-rose-50 text-rose-600 text-xs rounded-full font-medium">
                              {toxic}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.section>

                {/* Recommendation */}
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="glass p-8 rounded-3xl card-shadow lg:col-span-1"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-zinc-100 rounded-lg">
                      <Beaker className="w-5 h-5 text-zinc-600" />
                    </div>
                    <h3 className="font-bold text-lg">Expert Advice</h3>
                  </div>
                  <div className="prose prose-sm text-zinc-600">
                    <p className="leading-relaxed">{result.comparison.recommendation}</p>
                  </div>
                  <div className="mt-8 pt-6 border-t border-zinc-100">
                    <button
                      onClick={reset}
                      className="w-full py-4 bg-zinc-900 text-white rounded-2xl text-sm font-semibold hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 shadow-lg active:scale-95"
                    >
                      <RefreshCcw className="w-4 h-4" />
                      New Analysis
                    </button>
                  </div>
                </motion.section>
              </div>
            </div>
          )}
        </>
      );
    }
    if (tab === 'shelf') {
      return (
        <>
          {!shelfResult ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <ImageUpload
                  id="shelf-skin-upload"
                  label="Step 1: Your Skin"
                  description="Upload a photo for skin type detection"
                  image={shelfSkinImage}
                  onImageSelect={(img) => {
                    setShelfSkinImage(img);
                    if (img && shelfImage) handleShelfScan(shelfImage, img);
                  }}
                  facingMode="user"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <ImageUpload
                  id="shelf-upload"
                  label="Step 2: The Shelf"
                  description="Upload a photo of your skincare collection"
                  image={shelfImage}
                  onImageSelect={(img) => {
                    setShelfImage(img);
                    if (img && shelfSkinImage) handleShelfScan(img, shelfSkinImage);
                  }}
                  facingMode="environment"
                />
              </motion.div>

              <div className="md:col-span-2 flex flex-col items-center gap-4 mt-4 w-full">
                <button
                  onClick={() => handleShelfScan()}
                  disabled={!shelfImage || !shelfSkinImage || isScanning}
                  className={`w-full md:w-auto px-12 py-4 rounded-full font-semibold transition-all duration-300 flex items-center justify-center gap-2
                    ${!shelfImage || !shelfSkinImage || isScanning
                      ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                      : 'bg-zinc-900 text-white hover:bg-zinc-800 shadow-lg hover:shadow-xl active:scale-95'
                    }`}
                >
                  {isScanning ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analyzing Skincare...
                    </>
                  ) : (
                    <>
                      Skincare Analysis
                    </>
                  )}
                </button>
                {error && (
                  <p className="text-rose-500 text-sm font-medium">{error}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-serif italic">Skincare Analysis Results</h2>
                  <p className="text-zinc-500 text-sm">Detected Skin Type: <span className="text-zinc-900 font-semibold">{shelfResult.detectedSkinType}</span></p>
                </div>
                <button
                  onClick={reset}
                  className="p-4 bg-zinc-100 hover:bg-zinc-200 rounded-full transition-colors shadow-sm active:scale-90"
                >
                  <RefreshCcw className="w-5 h-5 text-zinc-600" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {shelfResult.shelf_products.map((product, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="glass p-6 rounded-3xl card-shadow flex flex-col"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-2 rounded-xl ${getRatingColor(product.rating)}`}>
                        {getRatingIcon(product.rating)}
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md ${getRatingColor(product.rating)}`}>
                        {product.rating}
                      </span>
                    </div>
                    <h3 className="font-bold text-zinc-900 mb-1">{product.name}</h3>
                    <p className="text-xs text-zinc-500 mb-4">{product.brand}</p>
                    
                    <p className="text-xs text-zinc-600 leading-relaxed mb-4 flex-1">
                      {product.reasoning}
                    </p>

                    <div className="pt-4 border-t border-zinc-100">
                      <div className="flex flex-wrap gap-1">
                        {product.keyIngredients.map((ing, j) => (
                          <span key={j} className="text-[9px] bg-zinc-50 text-zinc-400 px-2 py-0.5 rounded border border-zinc-100">
                            {ing}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </>
      );
    }
    if (tab === 'beauty') {
      return (
        <>
          {!beautyResult ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <ImageUpload
                  id="beauty-skin-upload"
                  label="Step 1: Your Face"
                  description="Upload a photo for tone & undertone detection"
                  image={beautySkinImage}
                  onImageSelect={(img) => {
                    setBeautySkinImage(img);
                    if (img && beautyShelfImage) handleBeautyScan(beautyShelfImage, img);
                  }}
                  facingMode="user"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <ImageUpload
                  id="beauty-shelf-upload"
                  label="Step 2: The Shelf"
                  description="Upload foundations, lipsticks, nail polish, etc."
                  image={beautyShelfImage}
                  onImageSelect={(img) => {
                    setBeautyShelfImage(img);
                    if (img && beautySkinImage) handleBeautyScan(img, beautySkinImage);
                  }}
                  facingMode="environment"
                />
              </motion.div>

              <div className="md:col-span-2 flex flex-col items-center gap-4 mt-4 w-full">
                <button
                  onClick={() => handleBeautyScan()}
                  disabled={!beautyShelfImage || !beautySkinImage || isBeautyScanning}
                  className={`w-full md:w-auto px-12 py-4 rounded-full font-semibold transition-all duration-300 flex items-center justify-center gap-2
                    ${!beautyShelfImage || !beautySkinImage || isBeautyScanning
                      ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                      : 'bg-zinc-900 text-white hover:bg-zinc-800 shadow-lg hover:shadow-xl active:scale-95'
                    }`}
                >
                  {isBeautyScanning ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Matching Shades...
                    </>
                  ) : (
                    <>
                      Match Shades
                    </>
                  )}
                </button>
                {error && (
                  <p className="text-rose-500 text-sm font-medium">{error}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div>
                    <h2 className="text-2xl font-serif italic">Beauty Scan Results</h2>
                    <div className="flex items-center gap-4 mt-1">
                      <div className="flex items-center gap-2 px-3 py-1 bg-zinc-100 rounded-full">
                        <User className="w-3 h-3 text-zinc-500" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-600">Tone: Monk {beautyResult.detectedSkinTone}</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1 bg-zinc-100 rounded-full">
                        <Palette className="w-3 h-3 text-zinc-500" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-600">Undertone: {beautyResult.detectedUndertone}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={reset}
                  className="p-4 bg-zinc-100 hover:bg-zinc-200 rounded-full transition-colors shadow-sm active:scale-90"
                >
                  <RefreshCcw className="w-5 h-5 text-zinc-600" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {beautyResult.shelf_analysis.map((product, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="glass p-6 rounded-3xl card-shadow flex flex-col"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-2 rounded-xl ${getRatingColor(product.indicator_color)}`}>
                        {getRatingIcon(product.indicator_color)}
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md ${getRatingColor(product.indicator_color)}`}>
                        {product.product_type}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold text-zinc-900">{product.name}</h3>
                      {product.hex_code && (
                        <div 
                          className="w-4 h-4 rounded-full border border-zinc-200 shadow-sm shrink-0" 
                          style={{ backgroundColor: product.hex_code }}
                          title={`Shade: ${product.hex_code}`}
                        />
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 mb-4">{product.brand}</p>
                    
                    <div className={`p-4 rounded-2xl text-xs leading-relaxed flex-1 ${getRatingColor(product.indicator_color)}`}>
                      <p className="font-semibold mb-1">Shade Advice:</p>
                      {product.shade_advice}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </>
      );
    }
    if (tab === 'natural') {
      return (
        <>
          {!naturalResult ? (
            <div className="flex flex-col gap-6 md:gap-8 max-w-2xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <ImageUpload
                  id="natural-upload"
                  label="Skin Concern Photo"
                  description="Upload a photo of your skin concern (acne, dullness, etc.)"
                  image={naturalImage}
                  onImageSelect={(img) => {
                    setNaturalImage(img);
                    if (img) handleNaturalAnalyze(img);
                  }}
                  facingMode="user"
                />
              </motion.div>

              <div className="flex flex-col items-center gap-4 mt-8 w-full">
                <button
                  onClick={() => handleNaturalAnalyze()}
                  disabled={!naturalImage || isNaturalAnalyzing}
                  className={`w-full md:w-auto px-12 py-4 rounded-full font-semibold transition-all duration-300 flex items-center justify-center gap-2
                    ${!naturalImage || isNaturalAnalyzing
                      ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg hover:shadow-xl active:scale-95'
                    }`}
                >
                  {isNaturalAnalyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analyzing Concerns...
                    </>
                  ) : (
                    <>
                      <Leaf className="w-5 h-5" />
                      Get Natural Remedy
                    </>
                  )}
                </button>
                {error && (
                  <p className="text-rose-500 text-sm font-medium">{error}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-serif italic">Natural Remedy Analysis</h2>
                <button
                  onClick={reset}
                  className="p-4 bg-zinc-100 hover:bg-zinc-200 rounded-full transition-colors shadow-sm active:scale-90"
                >
                  <RefreshCcw className="w-5 h-5 text-zinc-600" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="md:col-span-1 space-y-6"
                >
                  <div className="glass p-6 rounded-3xl card-shadow border-emerald-100 bg-emerald-50/30">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-4 flex items-center gap-2">
                      <Scan className="w-3 h-3" />
                      Visual Diagnosis
                    </h3>
                    <p className="text-sm text-zinc-700 leading-relaxed italic">
                      "{naturalResult.diagnosis}"
                    </p>
                  </div>

                  <div className="glass p-6 rounded-3xl card-shadow">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-zinc-500">Prep Time</span>
                        <span className="text-xs font-bold text-zinc-900">{naturalResult.prep_time}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-zinc-500">Difficulty</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${naturalResult.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {naturalResult.difficulty}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="md:col-span-2 glass p-8 rounded-3xl card-shadow relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                      <Leaf className="w-32 h-32 text-emerald-900" />
                  </div>
                  
                  <h3 className="text-2xl font-serif italic text-zinc-900 mb-6">{naturalResult.remedy_name}</h3>
                  
                  <div className="space-y-6 relative z-10">
                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-3">Ingredients</h4>
                      <div className="flex flex-wrap gap-2">
                        {naturalResult.ingredients.map((ing, i) => (
                          <span key={i} className="px-3 py-1 bg-zinc-100 text-zinc-600 text-xs rounded-full">
                            {ing}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-3">Preparation Steps</h4>
                      <ol className="space-y-3">
                        {naturalResult.steps.map((step, i) => (
                          <li key={i} className="flex gap-3 text-sm text-zinc-600">
                            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold">
                              {i + 1}
                            </span>
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>

                    <div className="pt-6 border-t border-zinc-100">
                      <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                        <Zap className="w-4 h-4 text-amber-500 mt-0.5" />
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-1">Pro Tip</p>
                          <p className="text-xs text-amber-800 leading-relaxed">{naturalResult.pro_tip}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          )}
        </>
      );
    }
    if (tab === 'chat') {
      return <ChatBot />;
    }
    return null;
  };

  const handleAnalyze = async (sImg?: string, pImg?: string) => {
    const skin = sImg || skinImage;
    const product = pImg || productImage;
    if (!skin || !product) return;

    setIsAnalyzing(true);
    setError(null);
    try {
      const data = await analyzeDermatology(skin, product);
      setResult(data);
    } catch (err) {
      console.error(err);
      setError('Analysis failed. Please try again with clearer images.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleShelfScan = async (shImg?: string, skImg?: string) => {
    const shelf = shImg || shelfImage;
    const skin = skImg || shelfSkinImage;
    if (!shelf || !skin) return;

    setIsScanning(true);
    setError(null);
    try {
      const data = await scanShelf(shelf, skin);
      setShelfResult(data);
    } catch (err) {
      console.error(err);
      setError('Shelf scan failed. Please try again with clearer images.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleBeautyScan = async (shImg?: string, skImg?: string) => {
    const shelf = shImg || beautyShelfImage;
    const skin = skImg || beautySkinImage;
    if (!shelf || !skin) return;

    setIsBeautyScanning(true);
    setError(null);
    try {
      const data = await analyzeBeauty(shelf, skin);
      setBeautyResult(data);
    } catch (err) {
      console.error(err);
      setError('Beauty scan failed. Please try again with clearer images.');
    } finally {
      setIsBeautyScanning(false);
    }
  };

  const handleNaturalAnalyze = async (img?: string) => {
    const skin = img || naturalImage;
    if (!skin) return;

    setIsNaturalAnalyzing(true);
    setError(null);
    try {
      const data = await analyzeNaturalRemedy(skin);
      setNaturalResult(data);
    } catch (err) {
      console.error(err);
      setError('Natural remedy analysis failed. Please try again with a clearer image.');
    } finally {
      setIsNaturalAnalyzing(false);
    }
  };

  const reset = () => {
    setSkinImage(null);
    setProductImage(null);
    setResult(null);
    setShelfSkinImage(null);
    setShelfImage(null);
    setShelfResult(null);
    setBeautySkinImage(null);
    setBeautyShelfImage(null);
    setBeautyResult(null);
    setNaturalImage(null);
    setNaturalResult(null);
    setError(null);
  };

  const getRatingColor = (rating: Rating) => {
    switch (rating) {
      case Rating.GREEN: return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case Rating.YELLOW: return 'text-amber-600 bg-amber-50 border-amber-100';
      case Rating.RED: return 'text-rose-600 bg-rose-50 border-rose-100';
      default: return 'text-zinc-600 bg-zinc-50 border-zinc-100';
    }
  };

  const getRatingIcon = (rating: Rating) => {
    switch (rating) {
      case Rating.GREEN: return <CheckCircle2 className="w-6 h-6" />;
      case Rating.YELLOW: return <AlertTriangle className="w-6 h-6" />;
      case Rating.RED: return <ShieldAlert className="w-6 h-6" />;
      default: return <Info className="w-6 h-6" />;
    }
  };

  return (
    <div className="min-h-screen pb-20 bg-[#F0F2F5] transition-colors duration-700 ease-in-out">
      {/* Header */}
      <header className="pt-12 pb-8 px-6 max-w-5xl mx-auto flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 mb-4"
        >
          <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center text-white">
            <Sparkles className="w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight font-sans">Dermalyze</span>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-5xl font-serif italic mb-4"
        >
          Safety for your skin.
        </motion.h1>
        
        {/* Tab Switcher */}
        <div className="flex flex-col md:flex-row bg-zinc-200/50 md:bg-white/50 md:backdrop-blur-sm p-2 rounded-3xl md:rounded-full mt-6 mb-2 gap-3 md:gap-1 md:border md:border-zinc-200/50 md:shadow-sm">
          <button
            onClick={() => handleTabClick('shelf')}
            className={`px-4 py-4 md:px-6 md:py-2.5 rounded-2xl md:rounded-full text-sm font-medium transition-all flex items-center justify-center md:justify-start gap-2 ${activeTab === 'shelf' ? 'bg-zinc-900 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-200/50'}`}
          >
            <LayoutGrid className="w-4 h-4" />
            Skincare Analysis
          </button>
          <button
            onClick={() => handleTabClick('beauty')}
            className={`px-4 py-4 md:px-6 md:py-2.5 rounded-2xl md:rounded-full text-sm font-medium transition-all flex items-center justify-center md:justify-start gap-2 ${activeTab === 'beauty' ? 'bg-zinc-900 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-200/50'}`}
          >
            <Palette className="w-4 h-4" />
            Beauty Scan
          </button>
          <button
            onClick={() => handleTabClick('single')}
            className={`px-4 py-4 md:px-6 md:py-2.5 rounded-2xl md:rounded-full text-sm font-medium transition-all flex items-center justify-center md:justify-start gap-2 ${activeTab === 'single' ? 'bg-zinc-900 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-200/50'}`}
          >
            <Scan className="w-4 h-4" />
            Single Analysis
          </button>
          <button
            onClick={() => handleTabClick('natural')}
            className={`px-4 py-4 md:px-6 md:py-2.5 rounded-2xl md:rounded-full text-sm font-medium transition-all flex items-center justify-center md:justify-start gap-2 ${activeTab === 'natural' ? 'bg-zinc-900 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-200/50'}`}
          >
            <Leaf className="w-4 h-4" />
            Natural Remedy
          </button>
          <button
            onClick={() => handleTabClick('chat')}
            className={`px-4 py-4 md:px-6 md:py-2.5 rounded-2xl md:rounded-full text-sm font-medium transition-all flex items-center justify-center md:justify-start gap-2 ${activeTab === 'chat' ? 'bg-zinc-900 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-200/50'}`}
          >
            <MessageSquare className="w-4 h-4" />
            Expert Chat
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 md:px-6">
        {renderTabContent(activeTab)}
      </main>

      <AnimatePresence>
        {isOverlayOpen && overlayTab && (
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed inset-0 z-50 flex flex-col ${
              overlayTab === 'beauty' ? 'bg-[#FCE4EC]' : 
              overlayTab === 'natural' ? 'bg-[#E8F5E9]' : 
              overlayTab === 'chat' ? 'bg-[#E3F2FD]' : 
              (overlayTab === 'single' || overlayTab === 'shelf') ? 'bg-[#F8F9FA]' : 'bg-white'
            }`}
          >
            <div className="flex items-center justify-between p-6">
              <h2 className="text-xl font-bold capitalize">
                {overlayTab === 'chat' ? 'Expert Chat' : 
                 overlayTab === 'beauty' ? 'Beauty Scan' : 
                 overlayTab === 'natural' ? 'Natural Remedy' : 
                 overlayTab === 'shelf' ? 'Skincare Analysis' :
                 overlayTab === 'single' ? 'Single Analysis' : overlayTab}
              </h2>
              <button 
                onClick={() => setIsOverlayOpen(false)}
                className="p-2 bg-white/50 rounded-full shadow-sm hover:bg-white/80 transition-colors"
              >
                <X className="w-6 h-6 text-zinc-900" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 pb-10">
              {renderTabContent(overlayTab)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Disclaimer */}
      <footer className="mt-20 px-6 text-center">
        <p className="text-[10px] text-zinc-400 uppercase tracking-[0.2em] max-w-2xl mx-auto">
          Disclaimer: This AI analysis is for informational purposes only and does not constitute medical advice. Always consult with a board-certified dermatologist for skin concerns.
        </p>
      </footer>
    </div>
  );
}

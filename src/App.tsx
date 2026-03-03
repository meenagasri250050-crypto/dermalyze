import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ShieldAlert, CheckCircle2, AlertTriangle, Loader2, RefreshCcw, Info, Droplets, FlaskConical, Beaker, LayoutGrid, Scan, ChevronRight, Palette, User } from 'lucide-react';
import { ImageUpload } from './components/ImageUpload';
import { analyzeDermatology, scanShelf, analyzeBeauty } from './services/geminiService';
import { AnalysisResult, Rating, ShelfScanResult, BeautyAnalysisResult } from './types';

type Tab = 'single' | 'shelf' | 'beauty';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('shelf');
  
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
  
  const [error, setError] = useState<string | null>(null);

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
    <div className="min-h-screen pb-20">
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
        <div className="flex bg-zinc-100 p-1 rounded-full mt-6 mb-2">
          <button
            onClick={() => { setActiveTab('shelf'); reset(); }}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'shelf' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'}`}
          >
            <LayoutGrid className="w-4 h-4" />
            Skincare Analysis
          </button>
          <button
            onClick={() => { setActiveTab('beauty'); reset(); }}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'beauty' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'}`}
          >
            <Palette className="w-4 h-4" />
            Beauty Scan
          </button>
          <button
            onClick={() => { setActiveTab('single'); reset(); }}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'single' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'}`}
          >
            <Scan className="w-4 h-4" />
            Single Analysis
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6">
        {activeTab === 'single' ? (
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

                <div className="md:col-span-2 flex flex-col items-center gap-4 mt-4">
                  <button
                    onClick={handleAnalyze}
                    disabled={!skinImage || !productImage || isAnalyzing}
                    className={`px-12 py-4 rounded-full font-semibold transition-all duration-300 flex items-center gap-2
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
                    className="p-3 bg-white/50 hover:bg-white/80 rounded-full transition-colors"
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
                        className="w-full py-3 bg-zinc-900 text-white rounded-xl text-sm font-semibold hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2"
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
        ) : activeTab === 'shelf' ? (
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

                <div className="md:col-span-2 flex flex-col items-center gap-4 mt-4">
                  <button
                    onClick={handleShelfScan}
                    disabled={!shelfImage || !shelfSkinImage || isScanning}
                    className={`px-12 py-4 rounded-full font-semibold transition-all duration-300 flex items-center gap-2
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
                    className="p-3 bg-zinc-100 hover:bg-zinc-200 rounded-full transition-colors"
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
        ) : (
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

                <div className="md:col-span-2 flex flex-col items-center gap-4 mt-4">
                  <button
                    onClick={handleBeautyScan}
                    disabled={!beautyShelfImage || !beautySkinImage || isBeautyScanning}
                    className={`px-12 py-4 rounded-full font-semibold transition-all duration-300 flex items-center gap-2
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
                    className="p-3 bg-zinc-100 hover:bg-zinc-200 rounded-full transition-colors"
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
        )}
      </main>

      {/* Footer Disclaimer */}
      <footer className="mt-20 px-6 text-center">
        <p className="text-[10px] text-zinc-400 uppercase tracking-[0.2em] max-w-2xl mx-auto">
          Disclaimer: This AI analysis is for informational purposes only and does not constitute medical advice. Always consult with a board-certified dermatologist for skin concerns.
        </p>
      </footer>
    </div>
  );
}

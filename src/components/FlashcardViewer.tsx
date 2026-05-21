"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Layers, 
  ChevronLeft, 
  ChevronRight, 
  Shuffle, 
  RotateCw, 
  Check, 
  Download, 
  Sparkles,
  AlertCircle,
  FileDown,
  RefreshCw
} from "lucide-react";
import { generateFlashcards, SUPPORTED_MODELS } from "@/lib/openrouter";

interface Flashcard {
  question: string;
  answer: string;
  mastered?: boolean;
}

interface FlashcardViewerProps {
  pdfChunks: string[];
  pdfName: string;
  openRouterKey: string;
  selectedModel: string;
  onActivityPerformed: () => void;
}

export default function FlashcardViewer({
  pdfChunks,
  pdfName,
  openRouterKey,
  selectedModel,
  onActivityPerformed
}: FlashcardViewerProps) {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Load from local storage if available for this specific PDF
  useEffect(() => {
    if (!pdfName) return;
    const cacheKey = `socrates_flashcards_${pdfName}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        setCards(JSON.parse(cached));
        setCurrentIndex(0);
        setIsFlipped(false);
      } catch (err) {
        // Clear corrupt cache
        localStorage.removeItem(cacheKey);
      }
    } else {
      setCards([]);
    }
  }, [pdfName]);

  const handleGenerateCards = async () => {
    if (!openRouterKey) {
      setErrorMsg("Please add your OpenRouter API Key in the Settings tab to generate flashcards.");
      return;
    }
    if (pdfChunks.length === 0) {
      setErrorMsg("Please upload a PDF document first to extract study flashcards.");
      return;
    }

    setIsGenerating(true);
    setErrorMsg("");
    setIsFlipped(false);

    try {
      // Gather a representative sample of text chunks to avoid sending too much text
      // Let's take up to 6 chunks evenly spaced throughout the document
      const sampleSize = Math.min(pdfChunks.length, 6);
      const selectedChunks: string[] = [];
      const step = Math.max(1, Math.floor(pdfChunks.length / sampleSize));
      
      for (let i = 0; i < pdfChunks.length && selectedChunks.length < sampleSize; i += step) {
        selectedChunks.push(pdfChunks[i]);
      }

      const contextText = selectedChunks.join("\n\n");
      const generated = await generateFlashcards(
        openRouterKey,
        selectedModel,
        contextText,
        8 // generate 8 cards
      );

      setCards(generated);
      setCurrentIndex(0);
      onActivityPerformed();

      // Save to local storage cache
      localStorage.setItem(`socrates_flashcards_${pdfName}`, JSON.stringify(generated));
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to generate flashcards. Try again or check your OpenRouter Key.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex(prev => (prev + 1) % cards.length);
    }, 150);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex(prev => (prev - 1 + cards.length) % cards.length);
    }, 150);
  };

  const handleShuffle = () => {
    if (cards.length <= 1) return;
    setIsFlipped(false);
    setTimeout(() => {
      const shuffled = [...cards].sort(() => Math.random() - 0.5);
      setCards(shuffled);
      setCurrentIndex(0);
    }, 150);
  };

  const toggleMastered = (index: number) => {
    const updated = [...cards];
    updated[index].mastered = !updated[index].mastered;
    setCards(updated);
    
    // Save state changes to localStorage cache
    localStorage.setItem(`socrates_flashcards_${pdfName}`, JSON.stringify(updated));
  };

  const handleExportJson = () => {
    if (cards.length === 0) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(cards, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `socrates_flashcards_${pdfName.replace(/\.[^/.]+$/, "")}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const masteredCount = cards.filter(c => c.mastered).length;
  const currentCard = cards[currentIndex];

  return (
    <div className="flex flex-col h-full bg-brand-card/20 border border-brand-border/30 rounded-2xl overflow-hidden glass-panel p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-brand-border/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-100 text-sm">Flashcard Generator</h3>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 border border-brand-border/20 text-[9px] text-slate-400 font-mono">
                <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                <span>
                  {SUPPORTED_MODELS.find(m => m.id === selectedModel)?.name || (selectedModel === "demo" ? "Offline Simulator" : selectedModel)}
                </span>
              </div>
            </div>
            <p className="text-slate-500 text-xs truncate max-w-[200px] sm:max-w-xs">{pdfName || "No document loaded"}</p>
          </div>
        </div>

        {cards.length > 0 && (
          <button
            onClick={handleExportJson}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand-border/40 text-xs font-semibold hover:bg-white/5 transition-all text-slate-400 cursor-pointer"
          >
            <FileDown className="w-3.5 h-3.5" />
            Export Deck
          </button>
        )}
      </div>

      {/* Main Body */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-[350px]">
        {isGenerating ? (
          // Skeleton/Loading Loader
          <div className="w-full max-w-lg space-y-6 text-center">
            <div className="relative w-full h-56 bg-brand-card border border-brand-border/40 rounded-2xl flex flex-col items-center justify-center overflow-hidden">
              <div className="absolute inset-0 shimmer-bg" />
              <div className="z-10 flex flex-col items-center gap-3">
                <div className="w-10 h-10 rounded-full border-2 border-t-violet-500 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                <span className="text-sm font-semibold text-slate-400">Analyzing key biological terms...</span>
              </div>
            </div>
            <div className="h-4 bg-slate-800 rounded-full w-2/3 mx-auto animate-pulse" />
          </div>
        ) : cards.length === 0 ? (
          // Empty State
          <div className="text-center max-w-sm flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-brand-border/20 flex items-center justify-center text-slate-400">
              <Layers className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-100">No Flashcards Created</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Unlock active recall study sessions. Let Socrates construct structured study decks directly from your pages.
              </p>
            </div>
            <button
              onClick={handleGenerateCards}
              disabled={pdfChunks.length === 0}
              className="mt-2 w-full px-5 py-3 rounded-xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/10 hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Sparkles className="w-4 h-4" />
              Generate Flashcards
            </button>
            {pdfChunks.length === 0 && (
              <span className="text-[10px] text-slate-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Upload a document to unlock flashcards
              </span>
            )}
          </div>
        ) : (
          // Flashcard interface
          <div className="w-full max-w-lg flex flex-col items-center">
            {/* Mastered Progress Bar */}
            <div className="w-full flex items-center justify-between text-xs text-slate-400 mb-2.5">
              <span>Card Mastery Progress</span>
              <span className="font-semibold text-cyan-400">{masteredCount} of {cards.length} mastered</span>
            </div>
            <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden mb-6">
              <div 
                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full transition-all duration-300"
                style={{ width: `${(masteredCount / cards.length) * 100}%` }}
              />
            </div>

            {/* 3D Flip Card Container */}
            <div 
              onClick={() => setIsFlipped(!isFlipped)}
              className="w-full h-60 cursor-pointer perspective-1000"
            >
              <div className={`relative w-full h-full duration-500 transform-style-3d ${isFlipped ? "rotate-y-180" : ""}`}>
                
                {/* Front Side */}
                <div className="absolute inset-0 bg-gradient-to-b from-brand-card to-black/60 border border-brand-border/60 rounded-2xl flex flex-col items-center justify-center p-8 backface-hidden shadow-2xl text-center">
                  <span className="text-cyan-400 text-[10px] font-bold uppercase tracking-wider mb-2">Question ({currentIndex + 1} of {cards.length})</span>
                  
                  {cards[currentIndex].mastered && (
                    <span className="absolute top-4 right-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Check className="w-2.5 h-2.5" /> Mastered
                    </span>
                  )}

                  <p className="text-slate-100 font-semibold text-lg md:text-xl leading-snug">
                    {currentCard.question}
                  </p>
                  
                  <span className="text-[10px] text-slate-500 mt-6 flex items-center gap-1">
                    <RotateCw className="w-3 h-3 text-slate-400" /> Tap to reveal answer
                  </span>
                </div>

                {/* Back Side */}
                <div className="absolute inset-0 bg-slate-950/90 border border-cyan-500/30 rounded-2xl flex flex-col items-center justify-center p-8 backface-hidden rotate-y-180 shadow-2xl text-center overflow-y-auto">
                  <span className="text-indigo-300 text-[10px] font-bold uppercase tracking-wider mb-2">Answer Breakdown</span>
                  <p className="text-slate-200 text-sm md:text-base leading-relaxed">
                    {currentCard.answer}
                  </p>
                  <span className="text-[10px] text-slate-500 mt-6">Tap to see question</span>
                </div>

              </div>
            </div>

            {/* Navigation and Actions */}
            <div className="w-full flex items-center justify-between mt-8">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMastered(currentIndex);
                }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  currentCard.mastered
                    ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                    : "border-brand-border/40 hover:border-emerald-500/30 hover:bg-emerald-500/5 text-slate-400 hover:text-slate-200"
                }`}
              >
                <Check className={`w-3.5 h-3.5 ${currentCard.mastered ? "stroke-[3px]" : ""}`} />
                {currentCard.mastered ? "Mastered!" : "Mark Mastered"}
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrev}
                  className="p-2.5 rounded-xl border border-brand-border/40 hover:bg-white/5 transition-all text-slate-300 cursor-pointer"
                  title="Previous Card"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleShuffle}
                  className="p-2.5 rounded-xl border border-brand-border/40 hover:bg-white/5 transition-all text-slate-400 hover:text-slate-200 cursor-pointer"
                  title="Shuffle Decks"
                >
                  <Shuffle className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNext}
                  className="p-2.5 bg-cyan-600 hover:bg-cyan-700 transition-all text-white rounded-xl cursor-pointer"
                  title="Next Card"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <button
              onClick={handleGenerateCards}
              className="mt-10 text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" /> Re-generate cards from PDF
            </button>
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="mt-4 flex gap-3 bg-rose-950/20 border border-rose-500/30 p-4 rounded-xl text-sm text-rose-300 animate-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}

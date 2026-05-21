"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  GraduationCap, 
  MessageSquare, 
  Layers, 
  HelpCircle, 
  Settings, 
  FileText, 
  UploadCloud, 
  Flame, 
  Key, 
  ChevronDown, 
  LogOut, 
  Check, 
  Sparkles, 
  AlertCircle,
  Moon,
  Sun,
  Eye,
  EyeOff,
  Briefcase
} from "lucide-react";
import { chunkText } from "@/lib/rag-helper";
import { SUPPORTED_MODELS } from "@/lib/openrouter";
import AiTutor from "./AiTutor";
import FlashcardViewer from "./FlashcardViewer";
import QuizBuilder from "./QuizBuilder";
import ResumeBuilder from "./ResumeBuilder";

interface DashboardProps {
  onBackToLanding: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  initialUploadTriggered?: boolean;
}

export default function Dashboard({ onBackToLanding, isDarkMode, toggleTheme, initialUploadTriggered = false }: DashboardProps) {
  // Navigation
  const [activeTab, setActiveTab] = useState<"tutor" | "flashcards" | "quiz" | "settings" | "resume">("tutor");
  
  // Document State
  const [pdfName, setPdfName] = useState("");
  const [pdfText, setPdfText] = useState("");
  const [pdfChunks, setPdfChunks] = useState<string[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState("");
  
  // Settings State
  const [openRouterKey, setOpenRouterKey] = useState("");
  const [selectedModel, setSelectedModel] = useState("meta-llama/llama-3.3-70b-instruct:free");
  const [showKey, setShowKey] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Study Tracker
  const [studyStreak, setStudyStreak] = useState(1);

  // File Upload Reference
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load configuration and cached documents on mount
  useEffect(() => {
    // Load API Key (defaults to 'demo' for immediate offline simulator access)
    const key = localStorage.getItem("socrates_openrouter_key") || "demo";
    setOpenRouterKey(key);
    
    // Load Model with auto-migration from rate-limited Qwen
    let model = localStorage.getItem("socrates_model");
    if (!model || model === "qwen/qwen3-next-80b-a3b-instruct:free") {
      model = "meta-llama/llama-3.3-70b-instruct:free";
      localStorage.setItem("socrates_model", model);
    }
    setSelectedModel(model);

    // Load Study Streak
    const streak = localStorage.getItem("socrates_study_streak");
    if (streak) {
      setStudyStreak(parseInt(streak, 10));
    } else {
      localStorage.setItem("socrates_study_streak", "1");
    }

    // Load Last parsed PDF if exists
    const cachedPdfName = localStorage.getItem("socrates_cached_pdf_name");
    const cachedPdfText = localStorage.getItem("socrates_cached_pdf_text");
    if (cachedPdfName && cachedPdfText) {
      setPdfName(cachedPdfName);
      setPdfText(cachedPdfText);
      setPdfChunks(chunkText(cachedPdfText));
    }

    // Automatically trigger file upload dialog if requested from hero
    if (initialUploadTriggered && !cachedPdfName) {
      setTimeout(() => {
        fileInputRef.current?.click();
      }, 500);
    }
  }, [initialUploadTriggered]);

  // Handle saving configurations
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("socrates_openrouter_key", openRouterKey);
    localStorage.setItem("socrates_model", selectedModel);
    
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // PDF Text Extraction Trigger
  const handleFileUpload = async (file: File) => {
    if (!file) return;
    if (file.type !== "application/pdf") {
      setParseError("Please select a valid PDF document (e.g. notes.pdf)");
      return;
    }

    setIsParsing(true);
    setParseError("");
    setPdfName(file.name);

    try {
      const { parsePdfOnClient } = await import("@/lib/client-pdf-parser");
      const extractedText = await parsePdfOnClient(file);
      
      if (!extractedText.trim()) {
        throw new Error("No readable text could be extracted from this PDF. Make sure it isn't fully image-scanned.");
      }

      setPdfText(extractedText);
      const chunks = chunkText(extractedText);
      setPdfChunks(chunks);

      // Cache document locally
      localStorage.setItem("socrates_cached_pdf_name", file.name);
      localStorage.setItem("socrates_cached_pdf_text", extractedText);
    } catch (err: any) {
      console.error(err);
      setParseError(err.message || "An error occurred during file parsing.");
      setPdfName("");
      setPdfText("");
      setPdfChunks([]);
    } finally {
      setIsParsing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleRemoveDoc = () => {
    setPdfName("");
    setPdfText("");
    setPdfChunks([]);
    localStorage.removeItem("socrates_cached_pdf_name");
    localStorage.removeItem("socrates_cached_pdf_text");
  };

  // Increments streak on study action (max once per session)
  const handleActivityStreak = () => {
    // Increment study streak
    const lastDate = localStorage.getItem("socrates_last_active_date");
    const today = new Date().toDateString();
    
    if (lastDate !== today) {
      const newStreak = studyStreak + 1;
      setStudyStreak(newStreak);
      localStorage.setItem("socrates_study_streak", newStreak.toString());
      localStorage.setItem("socrates_last_active_date", today);
    }
  };

  return (
    <div className="flex h-screen bg-brand-bg relative overflow-hidden">
      {/* Background radial overlays */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] glow-spot-primary opacity-30 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] glow-spot-secondary opacity-30 pointer-events-none" />

      {/* SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-black/40 border-r border-brand-border/30 backdrop-blur-md flex flex-col justify-between p-4 z-10">
        <div className="space-y-6">
          {/* Logo Brand */}
          <div 
            onClick={onBackToLanding}
            className="flex items-center gap-2 px-2 cursor-pointer hover:opacity-90"
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-white to-violet-200 bg-clip-text text-transparent">
              Socrates AI
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {[
              { id: "tutor", label: "AI Tutor Chat", icon: <MessageSquare className="w-4 h-4" /> },
              { id: "flashcards", label: "Flashcard Decks", icon: <Layers className="w-4 h-4" /> },
              { id: "quiz", label: "Practice Quizzes", icon: <HelpCircle className="w-4 h-4" /> },
              { id: "resume", label: "Interview Resume", icon: <Briefcase className="w-4 h-4" /> },
              { id: "settings", label: "Settings & API", icon: <Settings className="w-4 h-4" /> }
            ].map((link) => (
              <button
                key={link.id}
                onClick={() => setActiveTab(link.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left cursor-pointer ${
                  activeTab === link.id
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-600/15"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
              >
                {link.icon}
                {link.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer Details */}
        <div className="space-y-4 pt-4 border-t border-brand-border/20">
          {/* Study Streak Badge */}
          <div className="flex items-center justify-between bg-violet-600/10 border border-violet-500/20 rounded-xl p-3 text-xs">
            <span className="text-slate-400 font-semibold flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-orange-500 fill-orange-500" /> Study Streak
            </span>
            <strong className="text-slate-100">{studyStreak} Days</strong>
          </div>

          <button
            onClick={onBackToLanding}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors text-left cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Exit to Homepage
          </button>
        </div>
      </aside>

      {/* MAIN VIEWPORT */}
      <main className="flex-1 flex flex-col z-10">
        
        {/* HEADER PANEL */}
        <header className="h-16 px-6 border-b border-brand-border/20 flex items-center justify-between bg-black/10 backdrop-blur-md">
          {/* Active document notification */}
          <div className="flex items-center gap-3">
            {pdfName ? (
              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-xs text-emerald-400 max-w-[200px] sm:max-w-xs md:max-w-md truncate">
                <FileText className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{pdfName}</span>
                <button
                  onClick={handleRemoveDoc}
                  className="ml-1 text-emerald-600 hover:text-emerald-400 font-bold text-xs shrink-0 cursor-pointer"
                  title="Remove document"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-slate-900 border border-brand-border/30 px-3 py-1.5 rounded-xl text-xs text-slate-400">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                <span>No document uploaded</span>
              </div>
            )}
          </div>

          {/* Action configurations */}
          <div className="flex items-center gap-4">
            {/* OpenRouter Key status indicator */}
            <div 
              onClick={() => setActiveTab("settings")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                openRouterKey
                  ? "bg-indigo-600/10 border-indigo-500/40 text-indigo-400"
                  : "bg-amber-600/10 border-amber-500/40 text-amber-400"
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>{openRouterKey ? "API Key Loaded" : "Add API Key"}</span>
            </div>

            {/* Theme toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-brand-border/30 hover:bg-white/5 text-slate-400 hover:text-slate-200 cursor-pointer"
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* WORKSPACE AREA */}
        <div className="flex-1 p-6 overflow-y-auto">
          
          {/* UPLOAD SCREEN (Prompt if no document, except when in Settings tab) */}
          {!pdfName && activeTab !== "settings" && activeTab !== "resume" && !isParsing && (
            <div className="max-w-2xl mx-auto mt-12 text-center">
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2">
                Upload Your Study Materials
              </h2>
              <p className="text-slate-400 text-sm max-w-md mx-auto mb-8 leading-relaxed">
                Add lecture slides, textbook chapters, or assignments. Socrates reads the content and builds questions and chat responses.
              </p>

              {/* Drag Drop Area */}
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="glass-panel border-2 border-dashed border-brand-border/60 hover:border-violet-500/50 hover:bg-violet-500/5 duration-300 rounded-3xl p-12 flex flex-col items-center gap-4 cursor-pointer"
              >
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-brand-border/20 flex items-center justify-center text-violet-400">
                  <UploadCloud className="w-8 h-8 animate-bounce" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-200">Drag & drop your study PDF here</h4>
                  <p className="text-xs text-slate-500 mt-1">Accepts standard PDF documents up to 50MB</p>
                </div>
                <button
                  type="button"
                  className="mt-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 font-bold text-xs text-white rounded-xl shadow-lg shadow-violet-500/10 cursor-pointer"
                >
                  Choose Local File
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                  accept="application/pdf"
                  className="hidden"
                />
              </div>

              {parseError && (
                <div className="mt-6 flex gap-3 bg-rose-950/20 border border-rose-500/30 p-4 rounded-xl text-sm text-rose-300 text-left">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{parseError}</span>
                </div>
              )}
            </div>
          )}

          {/* SKELETON PARSER LOADER */}
          {isParsing && (
            <div className="max-w-md mx-auto mt-16 text-center space-y-6">
              <div className="relative w-full h-48 bg-brand-card border border-brand-border/40 rounded-2xl flex flex-col items-center justify-center overflow-hidden">
                <div className="absolute inset-0 shimmer-bg" />
                <div className="z-10 flex flex-col items-center gap-3">
                  <div className="w-10 h-10 rounded-full border-2 border-t-violet-500 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                  <span className="text-sm font-semibold text-slate-400">Extracting text layout...</span>
                </div>
              </div>
              <div className="h-4 bg-slate-800 rounded-full w-2/3 mx-auto animate-pulse" />
            </div>
          )}

          {/* WORKSPACE MODULES (Render only if PDF parsed OR settings/resume tabs active) */}
          {(!isParsing && (pdfName || activeTab === "settings" || activeTab === "resume")) && (
            <div className="h-full">
              {activeTab === "tutor" && (
                <AiTutor
                  pdfChunks={pdfChunks}
                  pdfName={pdfName}
                  openRouterKey={openRouterKey}
                  selectedModel={selectedModel}
                  onActivityPerformed={handleActivityStreak}
                />
              )}

              {activeTab === "flashcards" && (
                <FlashcardViewer
                  pdfChunks={pdfChunks}
                  pdfName={pdfName}
                  openRouterKey={openRouterKey}
                  selectedModel={selectedModel}
                  onActivityPerformed={handleActivityStreak}
                />
              )}

              {activeTab === "quiz" && (
                <QuizBuilder
                  pdfChunks={pdfChunks}
                  pdfName={pdfName}
                  openRouterKey={openRouterKey}
                  selectedModel={selectedModel}
                  onActivityPerformed={handleActivityStreak}
                />
              )}

              {activeTab === "resume" && (
                <ResumeBuilder
                  openRouterKey={openRouterKey}
                  selectedModel={selectedModel}
                  onActivityPerformed={handleActivityStreak}
                />
              )}

              {/* SETTINGS MODULE */}
              {activeTab === "settings" && (
                <div className="max-w-xl mx-auto bg-brand-card/20 border border-brand-border/30 rounded-2xl p-6 glass-panel">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-brand-border/10">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                      <Settings className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-100 text-sm">System Configuration</h3>
                      <p className="text-slate-500 text-xs">Setup your OpenRouter credentials</p>
                    </div>
                  </div>

                  <form onSubmit={handleSaveSettings} className="space-y-6 text-left">
                    {/* API Key */}
                    <div>
                      <label className="text-xs font-semibold text-slate-400 mb-2 block flex justify-between items-center">
                        <span>OpenRouter API Key</span>
                        <a 
                          href="https://openrouter.ai/keys" 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-[10px] text-violet-400 hover:underline"
                        >
                          Get Key →
                        </a>
                      </label>
                      <div className="relative flex items-center">
                        <input
                          type={showKey ? "text" : "password"}
                          value={openRouterKey}
                          onChange={(e) => setOpenRouterKey(e.target.value)}
                          placeholder="sk-or-v1-..."
                          className="w-full h-11 bg-white/5 border border-brand-border/40 rounded-xl pl-4 pr-12 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-violet-500/50"
                        />
                        <button
                          type="button"
                          onClick={() => setShowKey(!showKey)}
                          className="absolute right-3.5 text-slate-500 hover:text-slate-300 cursor-pointer"
                        >
                          {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <span className="text-[10px] text-slate-500 mt-1.5 block">
                        Saved in local browser memory only. Enter <strong>"demo"</strong> to run in offline simulator mode without API limits.
                      </span>
                    </div>

                    {/* Model Dropdown */}
                    <div>
                      <label className="text-xs font-semibold text-slate-400 mb-2 block">AI Inference Model</label>
                      <div className="relative">
                        <select
                          value={selectedModel}
                          onChange={(e) => setSelectedModel(e.target.value)}
                          className="w-full h-11 bg-slate-900 border border-brand-border/40 rounded-xl px-4 text-sm text-slate-200 outline-none appearance-none cursor-pointer focus:border-violet-500/50"
                        >
                          {SUPPORTED_MODELS.map((model) => (
                            <option key={model.id} value={model.id}>
                              {model.name} {model.isFree ? "(Free)" : ""}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-500 absolute right-4 top-3.5 pointer-events-none" />
                      </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex items-center gap-4 pt-2">
                      <button
                        type="submit"
                        className="px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 text-xs text-white shadow-lg shadow-violet-500/10 hover:opacity-95 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        {saveSuccess ? (
                          <>
                            Saved Successfully <Check className="w-3.5 h-3.5" />
                          </>
                        ) : (
                          <>
                            Save Configuration <Sparkles className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>

                  {/* Settings Warning Box */}
                  <div className="mt-8 bg-indigo-950/10 border border-indigo-500/20 p-4 rounded-xl text-xs text-slate-400 leading-relaxed text-left">
                    <strong>Model recommendation:</strong> The default model is <code>meta-llama/llama-3.3-70b-instruct:free</code>. It is highly accurate, free to query, and excels at instruction-following for quizzes and flashcards.
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

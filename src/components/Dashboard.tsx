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
  Briefcase,
  Cpu
} from "lucide-react";
import { chunkText } from "@/lib/rag-helper";
import { SUPPORTED_MODELS } from "@/lib/openrouter";
import AiTutor from "./AiTutor";
import FlashcardViewer from "./FlashcardViewer";
import QuizBuilder from "./QuizBuilder";
import ResumeBuilder from "./ResumeBuilder";
import AtsScanner from "./AtsScanner";
import { useUser, useAuth, UserButton, SignOutButton } from "@clerk/nextjs";
import { createClerkSupabaseClient } from "@/lib/supabaseClient";

interface DashboardProps {
  onBackToLanding: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  initialUploadTriggered?: boolean;
}

export default function Dashboard({ onBackToLanding, isDarkMode, toggleTheme, initialUploadTriggered = false }: DashboardProps) {
  // Navigation
  const [activeTab, setActiveTab] = useState<"tutor" | "flashcards" | "quiz" | "settings" | "resume" | "ats">("tutor");
  
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

  // Clerk Hook
  const { user } = useUser();
  const { getToken } = useAuth();

  // Usage Limit Tracker
  const [usageCount, setUsageCount] = useState(0);
  const [showPaywall, setShowPaywall] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Study Tracker
  const [studyStreak, setStudyStreak] = useState(1);

  // File Upload Reference
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load configuration and cached documents on mount
  useEffect(() => {
    // Load API Key per user (defaults to empty so each user must provide their own)
    if (user?.id) {
      const key = localStorage.getItem(`jake_openrouter_key_${user.id}`) || "";
      setOpenRouterKey(key);
    }

    // Load Model with auto-migration from rate-limited Qwen
    let model = localStorage.getItem("socrates_model");
    if (!model || model === "qwen/qwen3-next-80b-a3b-instruct:free") {
      model = "meta-llama/llama-3.3-70b-instruct:free";
      localStorage.setItem("socrates_model", model);
    }
    setSelectedModel(model);

    // Load Study Streak (Only if logged in)
    if (user?.id) {
      const streak = localStorage.getItem(`jake_study_streak_${user.id}`);
      if (streak) {
        setStudyStreak(parseInt(streak, 10));
      } else {
        localStorage.setItem(`jake_study_streak_${user.id}`, "1");
        setStudyStreak(1);
      }
    } else {
      setStudyStreak(1);
    }

    // Load Last parsed PDF if exists per user
    let currentPdfName = "";
    if (user?.id) {
      currentPdfName = localStorage.getItem(`jake_cached_pdf_name_${user.id}`) || "";
      const cachedPdfText = localStorage.getItem(`jake_cached_pdf_text_${user.id}`);
      if (currentPdfName && cachedPdfText) {
        setPdfName(currentPdfName);
        setPdfText(cachedPdfText);
        setPdfChunks(chunkText(cachedPdfText));
      } else {
        setPdfName("");
        setPdfText("");
        setPdfChunks([]);
      }
    } else {
      setPdfName("");
      setPdfText("");
      setPdfChunks([]);
    }

    // Load Usage Count based on User ID
    if (user?.id) {
      const usageKey = `jake_usage_count_${user.id}`;
      const count = parseInt(localStorage.getItem(usageKey) || "0", 10);
      setUsageCount(count);
      if (count >= 10) {
        setShowPaywall(true);
      }
    }

    // Attempt to sync with Supabase (if JWT template is configured)
    const syncSupabase = async () => {
      if (!user?.id) return;
      try {
        console.log("Fetching Clerk token for Supabase...");
        const token = await getToken({ template: 'supabase' });
        console.log("Token received:", token ? "YES (hidden)" : "NULL");
        
        if (!token) {
          console.error("TOKEN IS NULL! This means the JWT template named 'supabase' does not exist in the Clerk Dashboard, or the user is not signed in properly.");
          return;
        }
        
        const supabase = createClerkSupabaseClient(token);
        
        // Try to fetch user
        const { data: existingUser, error: fetchError } = await supabase
          .from('users')
          .select('usage_count, study_streak, tier')
          .eq('id', user.id)
          .single();
          
        if (existingUser) {
          setUsageCount(existingUser.usage_count);
          setStudyStreak(existingUser.study_streak);
          if (existingUser.usage_count >= 10 && existingUser.tier === 'free') {
            setShowPaywall(true);
          }
          // Update local storage to match database truth
          localStorage.setItem(`jake_usage_count_${user.id}`, existingUser.usage_count.toString());
          localStorage.setItem(`jake_study_streak_${user.id}`, existingUser.study_streak.toString());
        } else if (fetchError && fetchError.code === 'PGRST116') {
          // User doesn't exist yet, insert them
          const { error: insertError } = await supabase.from('users').insert({
            id: user.id,
            email: user.primaryEmailAddress?.emailAddress || '',
            first_name: user.firstName || '',
            last_name: user.lastName || '',
            usage_count: parseInt(localStorage.getItem(`jake_usage_count_${user.id}`) || "0", 10),
            study_streak: parseInt(localStorage.getItem(`jake_study_streak_${user.id}`) || "1", 10)
          });
          
          if (insertError) {
            console.error("Supabase insert error details:", insertError);
          } else {
            console.log("Successfully inserted user into Supabase");
          }
        }
      } catch (err) {
        console.warn("Supabase sync failed (likely JWT template not set up yet):", err);
      }
    };
    syncSupabase();

    // Automatically trigger file upload dialog if requested from hero
    if (initialUploadTriggered && !currentPdfName) {
      setTimeout(() => {
        fileInputRef.current?.click();
      }, 500);
    }
  }, [initialUploadTriggered, user?.id]);

  // Handle saving configurations
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (user?.id) {
      localStorage.setItem(`jake_openrouter_key_${user.id}`, openRouterKey);
    }
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

      // Cache document locally per user
      if (user?.id) {
        localStorage.setItem(`jake_cached_pdf_name_${user.id}`, file.name);
        localStorage.setItem(`jake_cached_pdf_text_${user.id}`, extractedText);
      }
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
    if (user?.id) {
      localStorage.removeItem(`jake_cached_pdf_name_${user.id}`);
      localStorage.removeItem(`jake_cached_pdf_text_${user.id}`);
    }
  };

  // Handle Stripe checkout
  const handleCheckout = async (tier: string) => {
    try {
      setIsCheckingOut(true);
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier })
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Checkout failed: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      console.error(err);
      alert('Something went wrong with checkout.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  // Increments streak on study action (max once per session) and Usage Count
  const handleActivityStreak = async () => {
    let newUsageCount = usageCount;
    let newStudyStreak = studyStreak;
    let lastDate = "";
    let today = new Date().toDateString();

    if (user?.id) {
      const usageKey = `jake_usage_count_${user.id}`;
      newUsageCount = usageCount + 1;
      setUsageCount(newUsageCount);
      localStorage.setItem(usageKey, newUsageCount.toString());
      
      if (newUsageCount >= 10) {
        setShowPaywall(true);
      }
    }

    // Increment study streak (Only if logged in)
    if (user?.id) {
      lastDate = localStorage.getItem(`jake_last_active_date_${user.id}`) || "";
      
      if (lastDate !== today) {
        newStudyStreak = studyStreak + 1;
        setStudyStreak(newStudyStreak);
        localStorage.setItem(`jake_study_streak_${user.id}`, newStudyStreak.toString());
        localStorage.setItem(`jake_last_active_date_${user.id}`, today);
      }
    }

    // Sync updates to Supabase
    if (user?.id) {
      try {
        const token = await getToken({ template: 'supabase' });
        if (token) {
          const supabase = createClerkSupabaseClient(token);
          await supabase.from('users').update({
            usage_count: newUsageCount,
            study_streak: newStudyStreak,
            last_active_date: new Date().toISOString()
          }).eq('id', user.id);
        }
      } catch (err) {
        console.warn("Supabase update failed:", err);
      }
    }
  };

  return (
    <>
      <div className="flex-1 w-full flex bg-zinc-950 text-zinc-100 overflow-hidden font-sans selection:bg-emerald-500/30">
      {/* Background radial overlays */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-900/10 rounded-full blur-[120px] pointer-events-none" />

      {/* SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-zinc-900/40 border-r border-white/5 backdrop-blur-md flex flex-col justify-between p-4 z-10">
        <div className="space-y-10">
          {/* Logo Brand */}
          <div 
            onClick={onBackToLanding}
            className="flex items-center gap-2 px-2 cursor-pointer hover:opacity-90 mt-2"
          >
            <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-sm">
              <Cpu className="w-5 h-5 text-zinc-100" />
            </div>
            <span className="text-xl font-bold tracking-tight text-zinc-100">
              HireForge AI
            </span>
          </div>

          {/* Navigation Links */}
          <div>
            <div className="px-3 mb-3 text-[10px] font-bold tracking-wider text-zinc-500 uppercase">
              Platform
            </div>
            <nav className="space-y-1.5">
              {[
                { id: "tutor", label: "PDF Intelligence", icon: <MessageSquare className="w-4 h-4" /> },
                { id: "flashcards", label: "Flashcard Decks", icon: <Layers className="w-4 h-4" /> },
                { id: "quiz", label: "Practice Quizzes", icon: <HelpCircle className="w-4 h-4" /> },
                { id: "resume", label: "ATS Resume Builder", icon: <Briefcase className="w-4 h-4" /> },
                { id: "ats", label: "ATS Scanner", icon: <FileText className="w-4 h-4" /> },
                { id: "settings", label: "Settings & API", icon: <Settings className="w-4 h-4" /> }
              ].map((link) => (
                <button
                  key={link.id}
                  onClick={() => setActiveTab(link.id as any)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left cursor-pointer ${
                    activeTab === link.id
                      ? "bg-zinc-800/80 text-zinc-100 shadow-sm border border-zinc-700/50"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 border border-transparent"
                  }`}
                >
                  {link.icon}
                  {link.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Sidebar Footer Details */}
        <div className="space-y-4 pt-4 border-t border-white/5">
          {/* Study Streak Badge */}
          <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-xs">
            <span className="text-zinc-400 font-medium flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-emerald-500 fill-emerald-500/20" /> Login Streak
            </span>
            <strong className="text-zinc-100">{studyStreak} Days</strong>
          </div>

          <SignOutButton signOutOptions={{ sessionId: undefined }}>
            <button
              onClick={onBackToLanding}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors text-left cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Exit & Sign Out
            </button>
          </SignOutButton>
        </div>
      </aside>

      {/* MAIN VIEWPORT */}
      <main className="flex-1 flex flex-col z-10">
        
        {/* HEADER PANEL */}
        <header className="h-16 px-6 border-b border-zinc-800/20 flex items-center justify-between bg-black/10 backdrop-blur-md">
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
              <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800/30 px-3 py-1.5 rounded-xl text-xs text-zinc-400">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 text-zinc-500" />
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
              className="p-2 rounded-xl border border-zinc-800/30 hover:bg-white/5 text-zinc-400 hover:text-zinc-200 cursor-pointer"
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Free Uses</div>
              <div className={`text-xs font-mono font-bold ${usageCount >= 10 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {usageCount} / 10
              </div>
            </div>
            
            {user && (
              <span className="text-sm font-semibold text-zinc-300">
                Hi, {user.firstName || user.username || "User"}
              </span>
            )}
            <UserButton appearance={{ elements: { userButtonAvatarBox: "w-8 h-8 rounded-lg" } }} />
          </div>
        </header>

        {/* WORKSPACE AREA */}
        <div className="flex-1 px-6 pt-8 pb-4 overflow-y-auto flex flex-col">
          
          {/* UPLOAD SCREEN (Prompt if no document, except when in Settings tab) */}
          {!pdfName && activeTab !== "settings" && activeTab !== "resume" && activeTab !== "ats" && !isParsing && (
            <div className="max-w-2xl mx-auto mt-12 text-center">
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2">
                Upload Your Study Materials
              </h2>
              <p className="text-zinc-400 text-sm max-w-md mx-auto mb-8 leading-relaxed">
                Add lecture slides, textbook chapters, or assignments. HireForge reads the content and builds questions and chat responses.
              </p>

              {/* Drag Drop Area */}
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="bg-zinc-900 border-2 border-dashed border-zinc-800 hover:border-emerald-500/50 hover:bg-zinc-800/50 duration-300 rounded-3xl p-12 flex flex-col items-center gap-4 cursor-pointer"
              >
                <div className="w-16 h-16 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-emerald-400 shadow-sm">
                  <UploadCloud className="w-8 h-8 animate-bounce" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-zinc-200">Drag & drop your study PDF here</h4>
                  <p className="text-xs text-zinc-500 mt-1">Accepts standard PDF documents up to 50MB</p>
                </div>
                <button
                  type="button"
                  className="mt-2 px-5 py-2.5 bg-zinc-100 hover:bg-white font-semibold text-sm text-zinc-900 rounded-lg shadow-sm transition-colors cursor-pointer"
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
              <div className="relative w-full h-48 bg-zinc-900 border border-zinc-800/40 rounded-2xl flex flex-col items-center justify-center overflow-hidden">
                <div className="absolute inset-0 shimmer-bg" />
                <div className="z-10 flex flex-col items-center gap-3">
                  <div className="w-10 h-10 rounded-full border-2 border-t-emerald-500 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                  <span className="text-sm font-semibold text-zinc-400">Extracting text layout...</span>
                </div>
              </div>
              <div className="h-4 bg-slate-800 rounded-full w-2/3 mx-auto animate-pulse" />
            </div>
          )}

          {/* WORKSPACE MODULES (Render only if PDF parsed OR settings/resume tabs active) */}
          {(!isParsing && (pdfName || activeTab === "settings" || activeTab === "resume" || activeTab === "ats")) && (
            <div className="flex-1 min-h-0">
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

              {activeTab === "ats" && (
                <AtsScanner
                  openRouterKey={openRouterKey}
                  selectedModel={selectedModel}
                  onActivityPerformed={handleActivityStreak}
                />
              )}

              {/* SETTINGS MODULE */}
              {activeTab === "settings" && (
                <div className="max-w-xl mx-auto bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-800">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                      <Settings className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-zinc-100 text-sm">System Configuration</h3>
                      <p className="text-zinc-500 text-xs">Setup your OpenRouter credentials</p>
                    </div>
                  </div>

                  <form onSubmit={handleSaveSettings} className="space-y-6 text-left">
                    {/* API Key */}
                    <div>
                      <label className="text-xs font-semibold text-zinc-400 mb-2 block flex justify-between items-center">
                        <span>OpenRouter API Key</span>
                        <a 
                          href="https://openrouter.ai/keys" 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-[10px] text-emerald-400 hover:underline"
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
                          className="w-full h-11 bg-zinc-800 border border-zinc-700 rounded-xl pl-4 pr-12 text-sm text-zinc-200 placeholder-zinc-500 outline-none focus:border-emerald-500/50"
                        />
                        <button
                          type="button"
                          onClick={() => setShowKey(!showKey)}
                          className="absolute right-3.5 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                        >
                          {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <span className="text-[10px] text-zinc-500 mt-1.5 block">
                        Saved in local browser memory only. Enter <strong>"demo"</strong> to run in offline simulator mode without API limits.
                      </span>
                    </div>

                    {/* Model Dropdown */}
                    <div>
                      <label className="text-xs font-semibold text-zinc-400 mb-2 block">AI Inference Model</label>
                      <div className="relative">
                        <select
                          value={selectedModel}
                          onChange={(e) => setSelectedModel(e.target.value)}
                          className="w-full h-11 bg-zinc-800 border border-zinc-700 rounded-xl px-4 text-sm text-zinc-200 outline-none appearance-none cursor-pointer focus:border-emerald-500/50"
                        >
                          {SUPPORTED_MODELS.map((model) => (
                            <option key={model.id} value={model.id}>
                              {model.name} {model.isFree ? "(Free)" : ""}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-zinc-500 absolute right-4 top-3.5 pointer-events-none" />
                      </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex items-center gap-4 pt-2">
                      <button
                        type="submit"
                        className="px-6 py-3 rounded-xl font-bold bg-zinc-100 text-zinc-900 shadow-sm hover:bg-white transition-all flex items-center gap-1.5 cursor-pointer"
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
                  <div className="mt-8 bg-zinc-950 border border-zinc-800 p-4 rounded-xl text-xs text-zinc-400 leading-relaxed text-left">
                    <strong>Model recommendation:</strong> The default model is <code className="bg-zinc-800 px-1 py-0.5 rounded">meta-llama/llama-3.3-70b-instruct:free</code>. It is highly accurate, free to query, and excels at instruction-following for quizzes and flashcards.
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      </div>

      {/* PAYWALL MODAL */}
      {showPaywall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-xl p-6">
          <div className="w-full max-w-5xl bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl p-8 relative overflow-hidden">
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-900/20 rounded-full blur-[100px] pointer-events-none" />
            
            <div className="text-center mb-10 relative z-10">
              <h2 className="text-3xl font-extrabold text-zinc-100 tracking-tight mb-3">
                You've reached your free limit
              </h2>
              <p className="text-zinc-400 max-w-xl mx-auto">
                You've used all 10 free AI actions. Upgrade your account to continue unlocking JAKE's premium career intelligence tools.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 relative z-10">
              {/* Starter */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 flex flex-col">
                <h3 className="text-lg font-bold text-zinc-100 mb-2">Starter</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-3xl font-extrabold text-zinc-100">₹799</span>
                  <span className="text-zinc-500 text-xs">/ 3 months</span>
                </div>
                <button 
                  onClick={() => handleCheckout('starter')}
                  disabled={isCheckingOut}
                  className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold transition-all text-sm mb-6 disabled:opacity-50"
                >
                  {isCheckingOut ? 'Loading...' : 'Upgrade Starter'}
                </button>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2 text-xs text-zinc-300"><Sparkles className="w-3.5 h-3.5 text-emerald-500" /> 3 Months Access</li>
                  <li className="flex items-center gap-2 text-xs text-zinc-300"><Sparkles className="w-3.5 h-3.5 text-emerald-500" /> Unlimited Resume Scans</li>
                </ul>
              </div>

              {/* Pro (Most Popular) */}
              <div className="bg-zinc-950 border-2 border-emerald-500/50 rounded-2xl p-6 flex flex-col relative transform md:-translate-y-4 shadow-xl shadow-emerald-900/20">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-emerald-950 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Most Popular
                </div>
                <h3 className="text-lg font-bold text-zinc-100 mb-2">Pro</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-3xl font-extrabold text-zinc-100">₹1599</span>
                  <span className="text-zinc-500 text-xs">/ 6 months</span>
                </div>
                <button 
                  onClick={() => handleCheckout('pro')}
                  disabled={isCheckingOut}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold transition-all text-sm mb-6 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                >
                  {isCheckingOut ? 'Loading...' : 'Upgrade Pro'}
                </button>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2 text-xs text-zinc-300"><Sparkles className="w-3.5 h-3.5 text-emerald-500" /> 6 Months Access</li>
                  <li className="flex items-center gap-2 text-xs text-zinc-300"><Sparkles className="w-3.5 h-3.5 text-emerald-500" /> All PDF Intelligence</li>
                  <li className="flex items-center gap-2 text-xs text-zinc-300"><Sparkles className="w-3.5 h-3.5 text-emerald-500" /> AI Flashcards & Quizzes</li>
                </ul>
              </div>

              {/* Elite */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 flex flex-col">
                <h3 className="text-lg font-bold text-zinc-100 mb-2">Elite</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-3xl font-extrabold text-zinc-100">₹2500</span>
                  <span className="text-zinc-500 text-xs">/ 1 year</span>
                </div>
                <button 
                  onClick={() => handleCheckout('elite')}
                  disabled={isCheckingOut}
                  className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold transition-all text-sm mb-6 disabled:opacity-50"
                >
                  {isCheckingOut ? 'Loading...' : 'Upgrade Elite'}
                </button>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2 text-xs text-zinc-300"><Sparkles className="w-3.5 h-3.5 text-emerald-500" /> 1 Full Year Access</li>
                  <li className="flex items-center gap-2 text-xs text-zinc-300"><Sparkles className="w-3.5 h-3.5 text-emerald-500" /> All Pro Features</li>
                </ul>
              </div>
            </div>
            
            <button 
              onClick={onBackToLanding}
              className="mt-8 text-center text-xs text-zinc-500 hover:text-zinc-300 underline block mx-auto relative z-10"
            >
              Sign out and return to Landing Page
            </button>
          </div>
        </div>
      )}
    </>
  );
}

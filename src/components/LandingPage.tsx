"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Briefcase,
  Sparkles, 
  Layers, 
  ArrowRight, 
  UploadCloud, 
  CheckCircle2, 
  MessageSquare,
  Zap, 
  Star,
  Cpu,
  FileText,
  BarChart,
  Target,
  FileSearch,
  Check,
  ChevronRight
} from "lucide-react";
import { SignInButton, SignUpButton, useUser } from "@clerk/nextjs";

interface LandingPageProps {
  onStartDemo: () => void;
  onUploadClick: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export default function LandingPage({ onStartDemo, onUploadClick, isDarkMode, toggleTheme }: LandingPageProps) {
  const [activePanel, setActivePanel] = useState<"resume" | "chat" | "quiz" | "flashcards">("resume");
  const [isCheckingOut, setIsCheckingOut] = useState(false);

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
        alert("Checkout failed: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong with checkout.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  // Animation constants for premium fade-up
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
    }
  };

  const { isSignedIn } = useUser();

  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-100 overflow-hidden font-sans selection:bg-emerald-500/30">
      {/* Refined subtle background glows instead of neon cyberpunk spots */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-900/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-emerald-900/10 rounded-full blur-[120px] -z-10 pointer-events-none" />

      {/* Navigation Header */}
      <nav className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between border-b border-white/5 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-sm">
            <Cpu className="w-5 h-5 text-zinc-100" />
          </div>
          <span className="text-lg md:text-xl font-bold tracking-tight text-zinc-100">
            HireForge AI
          </span>
        </div>

        <div className="flex items-center gap-4">
          {!isSignedIn ? (
            <>
              <SignInButton mode="modal" fallbackRedirectUrl="/">
                <button className="px-4 py-2 rounded-lg text-sm font-semibold text-zinc-300 hover:text-white hover:bg-white/5 transition-all cursor-pointer">
                  Log In
                </button>
              </SignInButton>
              <SignUpButton mode="modal" fallbackRedirectUrl="/">
                <button className="px-5 py-2 rounded-lg text-sm font-semibold bg-emerald-500 text-emerald-950 hover:bg-emerald-400 transition-all shadow-sm cursor-pointer shadow-emerald-500/20">
                  Sign Up
                </button>
              </SignUpButton>
            </>
          ) : (
            <button
              onClick={onStartDemo}
              className="px-5 py-2 rounded-lg text-sm font-semibold bg-zinc-100 text-zinc-900 hover:bg-white transition-all shadow-sm cursor-pointer"
            >
              Dashboard
            </button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 pt-12 md:pt-20 lg:pt-32 pb-16 text-center relative">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center"
        >
          {/* Subtle Badge */}
          <motion.div 
            variants={itemVariants}
            className="mb-8 px-4 py-1.5 rounded-full border border-zinc-800 bg-zinc-900/50 flex items-center gap-2 text-zinc-400 text-xs font-medium tracking-wide"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            Introducing the ultimate career intelligence platform
          </motion.div>

          {/* Heading */}
          <motion.h1 
            variants={itemVariants}
            className="text-3xl sm:text-5xl md:text-7xl font-bold tracking-tighter max-w-4xl leading-[1.05] mb-6 text-zinc-100"
          >
            Your AI-powered <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-indigo-400">
              career workspace
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p 
            variants={itemVariants}
            className="text-base md:text-lg lg:text-xl text-zinc-400 max-w-2xl mb-10 font-normal leading-relaxed"
          >
            Build ATS-winning resumes, chat with PDFs, generate interview questions, and prepare for your next role in one intelligent, unified platform.
          </motion.p>

          {/* CTAs */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center gap-4 mb-10 md:mb-20"
          >
            {!isSignedIn ? (
              <>
                <SignUpButton mode="modal" fallbackRedirectUrl="/">
                  <button
                    className="w-full sm:w-auto px-8 py-3.5 rounded-lg font-medium bg-emerald-500 text-emerald-950 hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
                  >
                    Create Account
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </SignUpButton>
                <SignUpButton mode="modal" fallbackRedirectUrl="/">
                  <button
                    className="w-full sm:w-auto px-8 py-3.5 rounded-lg font-medium bg-zinc-900 border border-zinc-800 text-zinc-100 hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                  >
                    <UploadCloud className="w-4 h-4 text-emerald-400" />
                    Try for Free
                  </button>
                </SignUpButton>
              </>
            ) : (
              <button
                onClick={onStartDemo}
                className="w-full sm:w-auto px-8 py-3.5 rounded-lg font-medium bg-zinc-100 text-zinc-900 hover:bg-white transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                Go to Workspace
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </motion.div>

          {/* 3-Panel Hero Mockup */}
          <motion.div 
            variants={itemVariants}
            className="w-full max-w-6xl mx-auto rounded-xl bg-zinc-900/50 p-2 border border-white/10 shadow-2xl backdrop-blur-xl"
          >
            {/* Top Bar Decoration */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-zinc-700" />
                <span className="w-3 h-3 rounded-full bg-zinc-700" />
                <span className="w-3 h-3 rounded-full bg-zinc-700" />
              </div>
              <div className="flex gap-2 text-xs font-medium text-zinc-400 overflow-x-auto">
                <button 
                  onClick={() => setActivePanel("resume")}
                  className={`px-3 py-1.5 rounded-md transition-all ${activePanel === "resume" ? "bg-zinc-800 text-zinc-100 shadow-sm" : "hover:text-zinc-200"}`}
                >
                  ATS Builder
                </button>
                <button 
                  onClick={() => setActivePanel("chat")}
                  className={`px-3 py-1.5 rounded-md transition-all ${activePanel === "chat" ? "bg-zinc-800 text-zinc-100 shadow-sm" : "hover:text-zinc-200"}`}
                >
                  PDF Chat
                </button>
                <button 
                  onClick={() => setActivePanel("quiz")}
                  className={`px-3 py-1.5 rounded-md transition-all ${activePanel === "quiz" ? "bg-zinc-800 text-zinc-100 shadow-sm" : "hover:text-zinc-200"}`}
                >
                  Quiz Generator
                </button>
                <button 
                  onClick={() => setActivePanel("flashcards")}
                  className={`px-3 py-1.5 rounded-md transition-all ${activePanel === "flashcards" ? "bg-zinc-800 text-zinc-100 shadow-sm" : "hover:text-zinc-200"}`}
                >
                  Flashcards
                </button>
              </div>
              <div className="w-12" /> {/* Spacer */}
            </div>

            {/* Mockup Body */}
            <div className="h-[300px] sm:h-[450px] bg-zinc-950/50 rounded-b-lg overflow-hidden flex relative">
              
              {/* Panel 1: ATS Resume Editor */}
              <div className={`absolute inset-0 flex transition-opacity duration-500 ${activePanel === "resume" ? "opacity-100 z-10" : "opacity-0 z-0"}`}>
                <div className="w-1/2 border-r border-white/5 p-6 flex flex-col gap-4">
                  <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
                    <span>resume.tex</span>
                    <span className="flex items-center gap-1 text-emerald-400"><Check className="w-3 h-3"/> Saved</span>
                  </div>
                  <div className="flex-1 bg-zinc-900 rounded-lg border border-zinc-800 p-4 font-mono text-xs text-zinc-300 overflow-hidden relative">
                    <div className="text-zinc-500 mb-2">% Experience Section</div>
                    <div className="text-indigo-400">\resumeSubheading</div>
                    <div className="pl-4">{`{Software Engineer Intern}{Google}`}</div>
                    <div className="pl-4">{`{May 2025 -- Aug 2025}{Mountain View, CA}`}</div>
                    <div className="mt-4 text-emerald-400/80 bg-emerald-900/20 px-2 py-1 rounded border border-emerald-500/20">
                      // AI Suggestion: Start with an action verb highlighting impact.
                      <br/>
                      // e.g. "Engineered scalable APIs..."
                    </div>
                  </div>
                </div>
                <div className="w-1/2 bg-white p-8 flex flex-col gap-4 text-zinc-900 overflow-hidden shadow-inner">
                  <div className="text-center border-b border-zinc-300 pb-2 mb-2">
                    <h1 className="text-2xl font-serif font-bold uppercase tracking-wide">JAKE D.</h1>
                    <div className="text-[10px] text-zinc-600 mt-1">jake.d@gmail.com | linkedin.com/in/jaked</div>
                  </div>
                  
                  <div>
                    <h2 className="text-xs font-bold uppercase border-b border-zinc-800 pb-0.5 mb-2">Experience</h2>
                    <div className="flex justify-between items-baseline text-xs font-bold">
                      <span>Software Engineer Intern</span>
                      <span className="font-normal text-[10px]">May 2025 -- Aug 2025</span>
                    </div>
                    <div className="flex justify-between items-baseline text-[10px] italic mb-1">
                      <span>Google</span>
                      <span>Mountain View, CA</span>
                    </div>
                    <ul className="list-disc pl-4 text-[10px] space-y-1">
                      <li>Engineered scalable APIs to process over 1M+ daily active requests, reducing latency by 30% through optimized caching.</li>
                      <li>Designed and integrated a microservices architecture using Go and gRPC, improving system reliability by 15%.</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Panel 2: PDF Chat */}
              <div className={`absolute inset-0 flex flex-col transition-opacity duration-500 ${activePanel === "chat" ? "opacity-100 z-10" : "opacity-0 z-0"} p-6`}>
                <div className="flex-1 flex flex-col gap-6 max-w-3xl mx-auto w-full">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 border border-indigo-500/30 text-indigo-400"><Cpu className="w-4 h-4"/></div>
                    <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl rounded-tl-none text-sm text-zinc-300">
                      I've analyzed your "System Design Prep.pdf". What specific concept would you like to review before your interview?
                    </div>
                  </div>
                  <div className="flex items-start gap-4 flex-row-reverse">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 border border-zinc-700 text-zinc-400">ME</div>
                    <div className="bg-zinc-800 p-4 rounded-xl rounded-tr-none text-sm text-zinc-200">
                      Explain how Consistent Hashing solves the scaling problem.
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 border border-indigo-500/30 text-indigo-400"><Cpu className="w-4 h-4"/></div>
                    <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl rounded-tl-none text-sm text-zinc-300">
                      <p className="mb-2">In traditional hashing, adding or removing a server requires rehashing almost all keys, causing massive cache misses.</p>
                      <p><strong>Consistent Hashing</strong> maps both data keys and servers to a logical ring. When a server is added or removed, only a small fraction of keys (k/n) need to be remapped to the next adjacent server on the ring.</p>
                      <div className="mt-3 flex gap-2">
                        <span className="px-2 py-1 bg-zinc-800 rounded text-xs text-zinc-400 cursor-pointer hover:bg-zinc-700">Generate Quiz</span>
                        <span className="px-2 py-1 bg-zinc-800 rounded text-xs text-zinc-400 cursor-pointer hover:bg-zinc-700">Make Flashcards</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="max-w-3xl mx-auto w-full mt-auto">
                  <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 flex items-center text-zinc-500 text-sm">
                    Ask a question based on your uploaded documents...
                  </div>
                </div>
              </div>

              {/* Panel 3: Quiz Generator */}
              <div className={`absolute inset-0 flex transition-opacity duration-500 ${activePanel === "quiz" ? "opacity-100 z-10" : "opacity-0 z-0"} p-6 bg-zinc-950/30`}>
                <div className="w-full max-w-4xl mx-auto flex flex-col h-full gap-4">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <h3 className="text-lg font-bold text-zinc-200">System Design Practice Quiz</h3>
                      <p className="text-xs text-zinc-500">Generated from "System Design Prep.pdf"</p>
                    </div>
                    <div className="text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
                      Question 1 / 10
                    </div>
                  </div>
                  
                  <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl p-8 flex flex-col">
                    <h4 className="text-xl font-medium text-zinc-100 mb-6">Which of the following best describes 'Eventual Consistency'?</h4>
                    <div className="space-y-3 flex-1">
                      <div className="p-4 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700/50 cursor-pointer transition-colors text-sm text-zinc-300">
                        A. All nodes will have the same data at exactly the same time.
                      </div>
                      <div className="p-4 rounded-lg border border-emerald-500/50 bg-emerald-500/10 cursor-pointer transition-colors text-sm text-emerald-300 flex justify-between items-center">
                        <span>B. Updates will propagate to all nodes, given enough time without new updates.</span>
                        <Check className="w-4 h-4" />
                      </div>
                      <div className="p-4 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700/50 cursor-pointer transition-colors text-sm text-zinc-300">
                        C. The system guarantees strong consistency for read operations only.
                      </div>
                    </div>
                    <div className="mt-6 pt-4 border-t border-zinc-800 flex justify-between">
                      <span className="text-emerald-400 text-xs font-bold flex items-center gap-1"><Sparkles className="w-3 h-3"/> AI Explanation: Correct! Eventual consistency is a theoretical guarantee that, provided no new updates are made, all reads will eventually return the last updated value.</span>
                      <button className="px-4 py-1.5 bg-zinc-100 text-zinc-900 text-xs font-bold rounded-lg shadow-sm">Next Question →</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Panel 4: Flashcards */}
              <div className={`absolute inset-0 flex transition-opacity duration-500 ${activePanel === "flashcards" ? "opacity-100 z-10" : "opacity-0 z-0"} p-6 bg-zinc-950/30`}>
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <div className="text-center mb-8">
                    <h3 className="text-lg font-bold text-zinc-200">Reviewing: Microservices Arch</h3>
                    <p className="text-xs text-zinc-500 mt-1">42 cards remaining in deck</p>
                  </div>
                  
                  <div className="relative w-full max-w-md aspect-[4/3] perspective-1000 group">
                    <div className="w-full h-full bg-zinc-900 border border-zinc-700 rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-2xl relative z-10 hover:border-zinc-500 transition-colors cursor-pointer transform hover:scale-[1.02] duration-300">
                      <span className="absolute top-4 left-4 text-xs font-bold text-zinc-600">FRONT</span>
                      <h2 className="text-2xl font-serif font-medium text-zinc-100">API Gateway Pattern</h2>
                      <p className="text-xs text-zinc-500 mt-4 italic">Click to flip card</p>
                    </div>
                    {/* Stack effect */}
                    <div className="absolute top-2 left-2 right-[-8px] bottom-[-8px] bg-zinc-900/50 border border-zinc-800 rounded-2xl -z-10" />
                    <div className="absolute top-4 left-4 right-[-16px] bottom-[-16px] bg-zinc-950/50 border border-zinc-800 rounded-2xl -z-20" />
                  </div>
                  
                  <div className="flex gap-4 mt-8">
                    <button className="w-12 h-12 rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-400 flex items-center justify-center hover:bg-rose-500/20 transition-colors">
                      <span className="sr-only">Hard</span>
                      ✕
                    </button>
                    <button className="w-12 h-12 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 flex items-center justify-center hover:bg-emerald-500/20 transition-colors">
                      <span className="sr-only">Easy</span>
                      <Check className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* PDF Intelligence Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-16 md:py-24 lg:py-32 border-t border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="order-2 md:order-1">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[80px] rounded-full pointer-events-none" />
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
                <FileText className="w-5 h-5 text-indigo-400" />
                <span className="text-sm font-medium text-zinc-300">System_Design_Interview_Notes.pdf</span>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-zinc-950 rounded-lg border border-zinc-800 text-sm text-zinc-400">
                  <span className="text-indigo-400 font-medium mb-1 block">Contextual Answer</span>
                  "Based on page 42 of your notes, database sharding splits a large database into smaller, faster, more easily managed parts called data shards. This improves read/write throughput by distributing the load across multiple servers."
                </div>
                <div className="flex gap-2">
                  <span className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 text-xs text-zinc-300 rounded-md">Summarize Doc</span>
                  <span className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 text-xs text-zinc-300 rounded-md">Extract Architecture Patterns</span>
                </div>
              </div>
            </div>
          </div>
          <div className="order-1 md:order-2 flex flex-col gap-6">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <FileSearch className="w-6 h-6 text-indigo-400" />
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">AI-Powered PDF Intelligence</h2>
            <p className="text-zinc-400 leading-relaxed text-lg">
              Upload resumes, job descriptions, study notes, or technical documents. Our RAG-based AI system reads your files, simplifies complex concepts, extracts key insights, and provides context-grounded answers.
            </p>
            <ul className="space-y-3 mt-2 text-zinc-300">
              <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-indigo-400" /> Analyze Job Descriptions for keyword gaps</li>
              <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-indigo-400" /> Simplify difficult technical concepts</li>
              <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-indigo-400" /> Chat directly with multiple PDFs at once</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ATS Builder Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-16 md:py-24 lg:py-32 border-t border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="flex flex-col gap-6">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <BarChart className="w-6 h-6 text-emerald-400" />
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">Premium ATS Resume Builder</h2>
            <p className="text-zinc-400 leading-relaxed text-lg">
              Stop guessing what recruiters want. HireForge AI provides real-time formatting validation, recruiter readability analysis, and intelligent phrasing suggestions to ensure your resume passes Applicant Tracking Systems (ATS).
            </p>
            <div className="mt-4 flex flex-col gap-4">
              <div className="p-4 border border-zinc-800 bg-zinc-900 rounded-xl relative">
                <div className="text-xs text-zinc-500 uppercase font-medium mb-1 tracking-wider">Before</div>
                <div className="text-sm text-zinc-400 line-through decoration-zinc-600">Worked on a machine learning project to predict failures.</div>
              </div>
              <div className="p-4 border border-emerald-500/30 bg-emerald-500/5 rounded-xl relative">
                <div className="text-xs text-emerald-400 uppercase font-medium mb-1 tracking-wider">After AI Optimization</div>
                <div className="text-sm text-zinc-200">Engineered a Deep Neural Network predictive maintenance system, achieving 94.9% accuracy and reducing equipment downtime by 15%.</div>
              </div>
            </div>
          </div>
          <div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 grid grid-cols-2 gap-4">
              <div className="col-span-2 text-sm font-medium text-zinc-300 mb-2">Modern Templates For:</div>
              {["Software Engineers", "Data Scientists", "Product Managers", "UX Designers", "Freshers", "Analysts"].map(role => (
                <div key={role} className="p-3 border border-zinc-800 bg-zinc-950 rounded-lg text-sm text-zinc-400 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                  {role}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* AI Interview Prep & Flashcards */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-16 md:py-24 lg:py-32 border-t border-white/5">
        <div className="text-center mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight mb-4">Master the Interview</h2>
          <p className="text-zinc-400 max-w-2xl mx-auto text-lg">
            HireForge AI generates dynamic technical, HR, and behavioral questions directly from your resume and study materials.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 flex flex-col gap-4">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-2">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold">Dynamic Questions</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Upload a job description and your resume. The AI will cross-reference the required skills and generate the exact technical questions you are most likely to be asked.
              </p>
           </div>
           
           <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 flex flex-col gap-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-2">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold">Flashcard Generator</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Instantly extract definitions, formulas, and core concepts from your PDFs into animated, swipe-style revision cards. Perfect for quick revision before technical rounds.
              </p>
           </div>

           <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 flex flex-col gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 mb-2">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold">Interactive Quizzes</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Test your knowledge with AI-generated MCQ cards based on your study notes. Get immediate feedback and contextual explanations for wrong answers.
              </p>
           </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section className="py-16 md:py-24 px-4 md:px-6 border-t border-zinc-900 bg-zinc-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-zinc-100 tracking-tight mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-zinc-400">Unlock full access to JAKE's AI intelligence.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Starter */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 flex flex-col">
              <h3 className="text-xl font-bold text-zinc-100 mb-2">Starter</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-zinc-100">₹799</span>
                <span className="text-zinc-500 text-sm">/ 3 months</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-sm text-zinc-300"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> 3 Months Access</li>
                <li className="flex items-center gap-3 text-sm text-zinc-300"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> 10 Free Scans & Prompts</li>
                <li className="flex items-center gap-3 text-sm text-zinc-300"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> PDF Intelligence Chat</li>
              </ul>
              {!isSignedIn ? (
                <SignUpButton mode="modal" fallbackRedirectUrl="/">
                  <button className="w-full py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold transition-all cursor-pointer">Get Started</button>
                </SignUpButton>
              ) : (
                <button 
                  onClick={() => handleCheckout('starter')} 
                  disabled={isCheckingOut}
                  className="w-full py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold transition-all cursor-pointer disabled:opacity-50"
                >
                  {isCheckingOut ? 'Loading...' : 'Upgrade to Starter'}
                </button>
              )}
            </div>

            {/* Pro (Most Popular) */}
            <div className="bg-zinc-900 border-2 border-emerald-500/50 rounded-2xl p-8 flex flex-col relative transform md:-translate-y-4 shadow-2xl shadow-emerald-900/20">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-emerald-950 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Most Popular
              </div>
              <h3 className="text-xl font-bold text-zinc-100 mb-2">Pro</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-zinc-100">₹1599</span>
                <span className="text-zinc-500 text-sm">/ 6 months</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-sm text-zinc-300"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> 6 Months Access</li>
                <li className="flex items-center gap-3 text-sm text-zinc-300"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Unlimited Resume Scans</li>
                <li className="flex items-center gap-3 text-sm text-zinc-300"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> PDF Intelligence Chat</li>
                <li className="flex items-center gap-3 text-sm text-zinc-300"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Quiz & Flashcard Generation</li>
              </ul>
              {!isSignedIn ? (
                <SignUpButton mode="modal" fallbackRedirectUrl="/">
                  <button className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold transition-all cursor-pointer shadow-lg shadow-emerald-500/20">Get Pro</button>
                </SignUpButton>
              ) : (
                <button 
                  onClick={() => handleCheckout('pro')} 
                  disabled={isCheckingOut}
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold transition-all cursor-pointer disabled:opacity-50"
                >
                  {isCheckingOut ? 'Loading...' : 'Upgrade to Pro'}
                </button>
              )}
            </div>

            {/* Elite */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 flex flex-col">
              <h3 className="text-xl font-bold text-zinc-100 mb-2">Elite</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-zinc-100">₹2500</span>
                <span className="text-zinc-500 text-sm">/ 1 year</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-sm text-zinc-300"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> 1 Full Year Access</li>
                <li className="flex items-center gap-3 text-sm text-zinc-300"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> All Pro Features</li>
                <li className="flex items-center gap-3 text-sm text-zinc-300"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Priority Support</li>
              </ul>
              {!isSignedIn ? (
                <SignUpButton mode="modal" fallbackRedirectUrl="/">
                  <button className="w-full py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold transition-all cursor-pointer">Get Elite</button>
                </SignUpButton>
              ) : (
                <button 
                  onClick={() => handleCheckout('elite')} 
                  disabled={isCheckingOut}
                  className="w-full py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold transition-all cursor-pointer disabled:opacity-50"
                >
                  {isCheckingOut ? 'Loading...' : 'Upgrade to Elite'}
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className="max-w-4xl mx-auto px-4 md:px-6 py-16 md:py-20 lg:py-28 text-center relative rounded-3xl border border-zinc-800 bg-zinc-900 overflow-hidden mb-10 md:mb-20 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-zinc-950/50 pointer-events-none" />
        <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight mb-4 text-zinc-100 relative z-10">
          Ready to land your dream role?
        </h2>
        <p className="text-zinc-400 max-w-lg mx-auto text-lg mb-8 relative z-10">
          Join thousands of graduates and professionals building ATS-winning resumes and preparing for interviews with HireForge AI.
        </p>
        <button
          onClick={onStartDemo}
          className="px-8 py-4 rounded-lg font-medium bg-zinc-100 text-zinc-900 hover:bg-white transition-all shadow-sm flex items-center justify-center gap-2 mx-auto relative z-10"
        >
          Start Your Free Workspace
          <ArrowRight className="w-4 h-4" />
        </button>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 md:px-6 py-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-zinc-500">
        <div>
          <p>© {new Date().getFullYear()} HireForge AI. The Career Intelligence Platform.</p>
        </div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-zinc-300 transition-colors">Privacy</a>
          <a href="#" className="hover:text-zinc-300 transition-colors">Terms</a>
          <a href="#" className="hover:text-zinc-300 transition-colors">Contact</a>
        </div>
      </footer>
    </div>
  );
}

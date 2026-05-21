"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  BookOpen, 
  Sparkles, 
  Layers, 
  HelpCircle, 
  ArrowRight, 
  UploadCloud, 
  CheckCircle2, 
  MessageSquare,
  Zap, 
  Clock, 
  ShieldCheck, 
  GraduationCap,
  Star,
  Cpu
} from "lucide-react";

interface LandingPageProps {
  onStartDemo: () => void;
  onUploadClick: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export default function LandingPage({ onStartDemo, onUploadClick, isDarkMode, toggleTheme }: LandingPageProps) {
  const [mockupTab, setMockupTab] = useState<"chat" | "flashcard" | "quiz">("chat");
  const [flashcardFlipped, setFlashcardFlipped] = useState(false);

  // Animation constants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
    }
  };

  return (
    <div className="relative min-h-screen bg-grid-pattern pb-20 overflow-hidden">
      {/* Background Lights */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] glow-spot-primary rounded-full glow-blur -z-10 animate-pulse-glow" />
      <div className="absolute top-[600px] right-1/4 w-[400px] h-[400px] glow-spot-secondary rounded-full glow-blur -z-10" />
      <div className="absolute bottom-20 left-1/3 w-[600px] h-[600px] glow-spot-primary rounded-full glow-blur -z-10 opacity-30" />

      {/* Navigation Header */}
      <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between border-b border-brand-border/30 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-white via-violet-200 to-indigo-300 bg-clip-text text-transparent dark:from-white dark:via-violet-200 dark:to-indigo-300 light-mode:from-slate-900 light-mode:to-slate-700">
            Socrates AI
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-brand-border/40 hover:bg-white/5 transition-colors text-slate-300 dark:text-slate-300 light-mode:text-slate-700 light-mode:border-slate-300/80 light-mode:hover:bg-slate-100"
            aria-label="Toggle theme"
          >
            {isDarkMode ? "☀️" : "🌙"}
          </button>
          <button
            onClick={onStartDemo}
            className="px-5 py-2 rounded-xl text-sm font-semibold glass-panel border border-brand-border/50 hover:border-violet-500/50 hover:bg-white/10 transition-all text-white light-mode:text-slate-800"
          >
            Launch Dashboard
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-16 md:pt-28 text-center relative">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center"
        >
          {/* Badge */}
          <motion.div 
            variants={itemVariants}
            className="mb-6 px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 flex items-center gap-2 text-violet-400 text-xs font-semibold uppercase tracking-wider"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Empowering students with Next-Gen RAG AI
          </motion.div>

          {/* Heading */}
          <motion.h1 
            variants={itemVariants}
            className="text-4xl md:text-7xl font-extrabold tracking-tight max-w-4xl leading-[1.1] mb-6"
          >
            Turn Any Study Material <br />
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent dark:from-violet-400 dark:via-fuchsia-400 dark:to-indigo-400 light-mode:from-violet-600 light-mode:to-indigo-600">
              Into Easy Learning
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p 
            variants={itemVariants}
            className="text-lg md:text-xl text-slate-400 dark:text-slate-400 light-mode:text-slate-600 max-w-2xl mb-10 font-medium"
          >
            Upload your PDFs and let AI explain concepts in simple words, generate flashcards, and create quizzes instantly.
          </motion.p>

          {/* CTAs */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center gap-4 mb-16"
          >
            <button
              onClick={onUploadClick}
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-xl shadow-violet-500/20 hover:shadow-violet-500/40 hover:opacity-95 transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              <UploadCloud className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Upload PDF File
            </button>
            <button
              onClick={onStartDemo}
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold glass-panel border border-brand-border hover:border-violet-500/50 hover:bg-white/10 transition-all flex items-center justify-center gap-2 text-white light-mode:text-slate-800 cursor-pointer"
            >
              Try Interactive Demo
              <ArrowRight className="w-4 h-4 text-violet-400" />
            </button>
          </motion.div>

          {/* Interactive Mockup Preview */}
          <motion.div 
            variants={itemVariants}
            className="w-full max-w-5xl rounded-2xl glass-panel p-2 border border-brand-border/40 shadow-2xl relative"
          >
            {/* Top Bar Decoration */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-brand-border/20">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500/70" />
                <span className="w-3 h-3 rounded-full bg-amber-500/70" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/70" />
              </div>
              
              {/* Tab selectors for mockup */}
              <div className="flex gap-1 bg-black/40 p-1 rounded-lg border border-brand-border/20 text-xs">
                <button 
                  onClick={() => setMockupTab("chat")}
                  className={`px-3 py-1 rounded-md transition-all font-semibold ${mockupTab === "chat" ? "bg-violet-600 text-white" : "text-slate-400 hover:text-slate-200"}`}
                >
                  AI Tutor Chat
                </button>
                <button 
                  onClick={() => setMockupTab("flashcard")}
                  className={`px-3 py-1 rounded-md transition-all font-semibold ${mockupTab === "flashcard" ? "bg-violet-600 text-white" : "text-slate-400 hover:text-slate-200"}`}
                >
                  Flashcards
                </button>
                <button 
                  onClick={() => setMockupTab("quiz")}
                  className={`px-3 py-1 rounded-md transition-all font-semibold ${mockupTab === "quiz" ? "bg-violet-600 text-white" : "text-slate-400 hover:text-slate-200"}`}
                >
                  Practice Quiz
                </button>
              </div>

              <div className="w-20" />
            </div>

            {/* Mockup Screens */}
            <div className="h-[360px] md:h-[450px] bg-black/30 rounded-b-xl relative overflow-hidden flex flex-col justify-between p-6">
              
              {/* Mockup Chat Screen */}
              {mockupTab === "chat" && (
                <div className="flex flex-col h-full justify-between">
                  <div className="flex flex-col gap-4 text-left overflow-y-auto max-h-[85%]">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-violet-600/30 flex items-center justify-center border border-violet-500/20 text-violet-400 font-bold text-xs shrink-0">
                        AI
                      </div>
                      <div className="bg-brand-card border border-brand-border p-3 rounded-2xl max-w-lg text-sm text-slate-200">
                        I've processed your "Intro to Cellular Biology.pdf"! What would you like me to simplify? I can explain respiration, photosynthesis, or generate flashcards on the vocabulary.
                      </div>
                    </div>

                    <div className="flex gap-3 justify-end">
                      <div className="bg-violet-600/20 border border-violet-500/30 p-3 rounded-2xl max-w-lg text-sm text-slate-100 text-left">
                        Explain ATP synthase like I am five years old, please.
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-indigo-600/30 flex items-center justify-center border border-indigo-500/20 text-indigo-400 font-bold text-xs shrink-0">
                        ME
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-violet-600/30 flex items-center justify-center border border-violet-500/20 text-violet-400 font-bold text-xs shrink-0 animate-pulse">
                        AI
                      </div>
                      <div className="bg-brand-card border border-brand-border p-3 rounded-2xl max-w-lg text-sm text-slate-200">
                        Think of ATP synthase as a tiny water wheel inside your cells:
                        <ul className="list-disc pl-4 mt-2 space-y-1 text-slate-300">
                          <li><strong>The Water:</strong> Tiny particles called protons act like rushing water.</li>
                          <li><strong>The Wheel:</strong> They push through ATP synthase, spinning it around.</li>
                          <li><strong>The Power:</strong> Every spin charges a tiny battery called ATP, which your body uses for energy to run and play!</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  {/* Chat input box */}
                  <div className="h-12 bg-white/5 border border-brand-border/40 rounded-xl px-4 flex items-center justify-between text-xs text-slate-500 mt-2">
                    <span>Ask AI anything about the PDF...</span>
                    <button className="px-3 py-1 bg-violet-600 hover:bg-violet-700 text-white rounded-md font-semibold">
                      Send
                    </button>
                  </div>
                </div>
              )}

              {/* Mockup Flashcard Screen */}
              {mockupTab === "flashcard" && (
                <div className="flex flex-col h-full items-center justify-center">
                  <span className="text-xs text-slate-500 mb-2">Click card to test flip animation</span>
                  
                  {/* 3D Flip Card */}
                  <div 
                    onClick={() => setFlashcardFlipped(!flashcardFlipped)}
                    className="w-72 md:w-96 h-48 cursor-pointer perspective-1000"
                  >
                    <div className={`relative w-full h-full duration-500 transform-style-3d ${flashcardFlipped ? "rotate-y-180" : ""}`}>
                      
                      {/* Front Side */}
                      <div className="absolute inset-0 bg-gradient-to-b from-brand-card to-brand-card/80 border border-brand-border/60 rounded-2xl flex flex-col items-center justify-center p-6 backface-hidden shadow-xl text-center">
                        <span className="text-violet-400 text-xs font-bold uppercase tracking-wider mb-2">Card 3 of 12 (Biology)</span>
                        <p className="text-slate-100 font-medium text-lg leading-snug">
                          What is the difference between active and passive transport?
                        </p>
                        <span className="text-xs text-slate-500 mt-4 flex items-center gap-1">
                          <Zap className="w-3 h-3 text-amber-400" /> Tap to reveal answer
                        </span>
                      </div>

                      {/* Back Side */}
                      <div className="absolute inset-0 bg-violet-950/40 border border-violet-500/40 rounded-2xl flex flex-col items-center justify-center p-6 backface-hidden rotate-y-180 shadow-xl text-center">
                        <span className="text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">Answer</span>
                        <p className="text-slate-200 text-sm leading-relaxed">
                          <strong>Active transport</strong> requires energy (ATP) to move molecules against their concentration gradient, while <strong>passive transport</strong> occurs naturally without energy.
                        </p>
                        <span className="text-xs text-slate-500 mt-4">Tap to view question</span>
                      </div>

                    </div>
                  </div>

                  <div className="flex gap-4 mt-6">
                    <button className="px-4 py-1.5 border border-brand-border/40 text-xs font-semibold rounded-lg text-slate-400">Prev</button>
                    <button className="px-4 py-1.5 border border-brand-border/40 text-xs font-semibold rounded-lg text-slate-400">Shuffle</button>
                    <button className="px-4 py-1.5 bg-violet-600 text-xs font-semibold rounded-lg text-white">Next</button>
                  </div>
                </div>
              )}

              {/* Mockup Quiz Screen */}
              {mockupTab === "quiz" && (
                <div className="flex flex-col h-full justify-between text-left">
                  <div>
                    <div className="flex justify-between items-center text-xs text-slate-400 mb-3">
                      <span>Quiz: Mitochondria Functions</span>
                      <span className="text-violet-400 font-semibold">Question 2/5</span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-5">
                      <div className="bg-gradient-to-r from-violet-500 to-indigo-500 w-2/5 h-full" />
                    </div>

                    <h3 className="text-slate-100 font-semibold text-base mb-4">
                      True or False: Anaerobic respiration takes place inside the mitochondria.
                    </h3>

                    <div className="grid grid-cols-2 gap-3">
                      <button className="p-3 bg-brand-card border border-brand-border hover:border-violet-500/40 rounded-xl text-slate-200 text-left text-sm transition-all font-medium">
                        A. True
                      </button>
                      <button className="p-3 bg-violet-600/20 border border-violet-500/60 rounded-xl text-violet-300 text-left text-sm font-medium">
                        B. False (Correct choice)
                      </button>
                    </div>
                  </div>

                  <div className="bg-emerald-950/20 border border-emerald-500/30 p-3 rounded-xl text-xs text-emerald-400">
                    <strong>Correct!</strong> Anaerobic respiration happens in the cytoplasm. Aerobic respiration requires oxygen and happens inside the mitochondria.
                  </div>
                </div>
              )}

              {/* Float overlays to simulate premium UI */}
              <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] text-slate-400 font-mono border border-brand-border/10">
                llama-3.3-70b
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* WHY STUDENTS LOVE THIS Section */}
      <section className="max-w-7xl mx-auto px-6 py-24 md:py-36">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
            Why Students Love Socrates
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-base">
            Engineered specifically to remove study stress, increase retention, and accelerate learning curves.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: <Sparkles className="w-6 h-6 text-violet-400" />,
              title: "Understand Instantly",
              desc: "Don't get stuck on dry, scientific paragraphs. Our AI breaks down complex terminology into simple, visual analogies."
            },
            {
              icon: <Layers className="w-6 h-6 text-cyan-400" />,
              title: "Learn Faster with Cards",
              desc: "Skip manual flashcard creation. Instantly extract definitions and core concepts into interactive, digital decks."
            },
            {
              icon: <HelpCircle className="w-6 h-6 text-fuchsia-400" />,
              title: "Practice with Quizzes",
              desc: "Self-test with custom difficulty levels. Our smart generator constructs MCQs, True/False, and short-answers from your content."
            },
            {
              icon: <Clock className="w-6 h-6 text-emerald-400" />,
              title: "Save Hours of Work",
              desc: "Upload a 50-page lecture note packet or research study and get structured, reviewable study material within seconds."
            },
            {
              icon: <Cpu className="w-6 h-6 text-blue-400" />,
              title: "Local RAG Architecture",
              desc: "Uses client-side indexing to cross-reference queries against text, ensuring exact accuracy and avoiding hallucinations."
            },
            {
              icon: <Star className="w-6 h-6 text-amber-400" />,
              title: "Zero Setup Cost",
              desc: "Provide your own OpenRouter key for direct, model-agnostic completions. No subscription fees, no locked walls."
            }
          ].map((card, idx) => (
            <div 
              key={idx}
              className="glass-panel glass-panel-interactive p-8 rounded-2xl border border-brand-border/40 text-left flex flex-col gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-brand-border/20">
                {card.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-100">{card.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS (Timeline design) */}
      <section className="max-w-6xl mx-auto px-6 py-12 md:py-24 border-y border-brand-border/20 relative">
        <div className="absolute inset-0 glow-spot-secondary opacity-30 pointer-events-none" />
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
            How It Works
          </h2>
          <p className="text-slate-400 max-w-lg mx-auto">
            From textbook upload to exam-ready understanding in three simple stages.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Connector Line */}
          <div className="hidden md:block absolute top-1/3 left-1/6 right-1/6 h-[2px] bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 -z-10 opacity-30" />

          {[
            {
              step: "Step 1",
              title: "Upload Study Files",
              desc: "Drag and drop any PDF, textbook, assignment, or research paper up to 100MB. Socrates securely parses text on the fly."
            },
            {
              step: "Step 2",
              title: "Activate AI Tutor",
              desc: "Prompt the model to simplify topics, or order a set of flashcards and quizzes built specifically from your text."
            },
            {
              step: "Step 3",
              title: "Ace the Material",
              desc: "Flip flashcards, review incorrect quiz responses with rich, constructive explanations, and master your finals."
            }
          ].map((item, idx) => (
            <div key={idx} className="flex flex-col items-center text-center px-4 relative">
              <div className="w-16 h-16 rounded-full bg-slate-900 border-2 border-violet-500 flex items-center justify-center mb-6 font-bold text-violet-400 text-lg shadow-lg shadow-violet-500/20">
                {idx + 1}
              </div>
              <span className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-1">{item.step}</span>
              <h3 className="text-xl font-bold text-slate-100 mb-3">{item.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed max-w-xs">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CORE FEATURES SECTION */}
      <section className="max-w-7xl mx-auto px-6 py-24 md:py-36 flex flex-col gap-32">
        <div className="text-center mb-4">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
            Powerful Learning Modules
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-base">
            No generic prompts. Socrates constructs modules tuned for student performance and active recall.
          </p>
        </div>

        {/* Feature 1: AI Tutor */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col gap-6 text-left">
            <div className="w-12 h-12 rounded-xl bg-violet-600/10 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-2xl md:text-4xl font-bold text-slate-100">The Context-Aware AI Tutor</h3>
            <p className="text-slate-400 text-base leading-relaxed">
              Ask Socrates to translate academic prose, write code examples, or build summaries. Because it uses client-side RAG indexing, the AI responds with pinpoint references to pages and paragraphs in your document, preventing hallucinations.
            </p>
            <ul className="space-y-3">
              {[
                "Simplifies difficult terminology using metaphors",
                "Keeps context of your exact PDF text",
                "Instant presets: 'Explain like I'm 5', 'Summarize'"
              ].map((bullet, index) => (
                <li key={index} className="flex items-center gap-3 text-sm text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-violet-400" />
                  {bullet}
                </li>
              ))}
            </ul>
          </div>
          
          {/* Visual Showcase */}
          <div className="glass-panel rounded-2xl p-6 border border-brand-border/40 bg-gradient-to-br from-brand-card to-black relative min-h-[300px] flex flex-col justify-center">
            <div className="absolute top-4 left-4 flex gap-2">
              <span className="px-3 py-1 bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold rounded-lg">AI Tutor Chat</span>
            </div>
            <div className="space-y-4 text-left mt-8">
              <div className="bg-slate-900/60 p-4 rounded-xl border border-brand-border/20 text-sm">
                <p className="text-xs text-violet-400 font-bold mb-1">PROMPT CHIP SELECTED: "Explain with a simple example"</p>
                <p className="text-slate-300">Could you explain the difference between a stack and a queue in data structures?</p>
              </div>
              <div className="bg-violet-950/10 p-4 rounded-xl border border-violet-500/20 text-sm">
                <p className="text-slate-200 leading-relaxed">
                  Think of a <strong>Stack</strong> like a stack of cafeteria trays: you add new trays to the top, and take trays from the top (Last In, First Out). <br /><br />
                  Think of a <strong>Queue</strong> like a line at Starbucks: the first person to stand in line is the first one served (First In, First Out).
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 2: Flashcard Generator */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Visual Showcase */}
          <div className="order-2 lg:order-1 glass-panel rounded-2xl p-8 border border-brand-border/40 bg-gradient-to-br from-black to-brand-card min-h-[300px] flex flex-col items-center justify-center">
            <div className="w-72 h-40 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex flex-col items-center justify-center p-6 text-white text-center shadow-lg relative">
              <span className="text-[10px] uppercase font-bold tracking-widest opacity-80 mb-2">Question (Flashcard #1)</span>
              <p className="font-semibold text-base leading-snug">What are the three main components of a nucleotide?</p>
              <div className="absolute bottom-3 text-[10px] bg-black/30 px-2 py-0.5 rounded-full">Tap to Flip</div>
            </div>
          </div>

          <div className="order-1 lg:order-2 flex flex-col gap-6 text-left">
            <div className="w-12 h-12 rounded-xl bg-cyan-600/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-2xl md:text-4xl font-bold text-slate-100">Smart Flashcard Deck Builder</h3>
            <p className="text-slate-400 text-base leading-relaxed">
              Auto-generate study decks directly from pages or sections of notes. Socrates reviews the context and builds card pairs to test your vocabulary, definitions, structures, and systems.
            </p>
            <ul className="space-y-3">
              {[
                "Beautiful 3D flip card visual effects",
                "Shuffle and review modules to track retention",
                "Export decks instantly to share with study groups"
              ].map((bullet, index) => (
                <li key={index} className="flex items-center gap-3 text-sm text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  {bullet}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Feature 3: Quiz Generator */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col gap-6 text-left">
            <div className="w-12 h-12 rounded-xl bg-fuchsia-600/10 border border-fuchsia-500/30 flex items-center justify-center text-fuchsia-400">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h3 className="text-2xl md:text-4xl font-bold text-slate-100">Adaptive Mock Quizzes</h3>
            <p className="text-slate-400 text-base leading-relaxed">
              Generate fully customized assessments to evaluate your exam readiness. Test your comprehension with Multiple Choice Questions, True/False, or Fill-in-the-blank structures. Receive detailed grading breakdowns and explanations instantly.
            </p>
            <ul className="space-y-3">
              {[
                "Supports MCQ, True/False, and short-answers",
                "Adjust difficulty levels (Easy, Medium, Hard)",
                "Built-in study timer and score reporting dashboards"
              ].map((bullet, index) => (
                <li key={index} className="flex items-center gap-3 text-sm text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-fuchsia-400" />
                  {bullet}
                </li>
              ))}
            </ul>
          </div>
          
          {/* Visual Showcase */}
          <div className="glass-panel rounded-2xl p-6 border border-brand-border/40 bg-gradient-to-tr from-brand-card to-black min-h-[300px] flex flex-col justify-center text-left">
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span>Quiz Assessment</span>
                <span className="text-emerald-400 font-bold">100% Score</span>
              </div>
              <div className="p-4 bg-slate-900/60 rounded-xl border border-brand-border/20">
                <p className="text-sm text-slate-200 font-semibold mb-2">Q: How does a catalyst affect activation energy?</p>
                <div className="text-xs text-emerald-400 font-bold bg-emerald-950/20 border border-emerald-500/30 p-2 rounded-lg">
                  ✔ Correct: A catalyst lowers the activation energy required, accelerating the reaction rate without being consumed.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STUDENT BENEFITS SECTION */}
      <section className="max-w-7xl mx-auto px-6 py-12 md:py-24 bg-gradient-to-b from-brand-card/30 to-transparent border border-brand-border/30 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] glow-spot-primary opacity-20" />
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
            Personalized Student Benefits
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Socrates is designed to fit your unique study habits, offering structured reinforcement for any academic subject.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
          {[
            {
              title: "Optimized Exam Prep",
              desc: "Don't just read. Active recall through flashcards and testing builds neural connections, letting you study 2x faster with higher grades."
            },
            {
              title: "Efficient Revision",
              desc: "Review key summaries and auto-generated bullet sheets right before walking into the lecture hall, cementing definitions in long-term memory."
            },
            {
              title: "Reduced Cognitive Load",
              desc: "Say goodbye to highlights that lead nowhere. Let AI sort and index your texts, delivering digestible takeaways instantly."
            }
          ].map((benefit, idx) => (
            <div key={idx} className="text-left flex flex-col gap-3">
              <div className="w-8 h-8 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 font-bold text-sm">
                0{idx + 1}
              </div>
              <h3 className="text-lg font-bold text-slate-100">{benefit.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{benefit.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIAL SECTION */}
      <section className="max-w-7xl mx-auto px-6 py-24 md:py-36">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
            Loved By Overachievers
          </h2>
          <p className="text-slate-400 max-w-lg mx-auto">
            See how students from leading academic institutions utilize Socrates AI to optimize their study processes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              quote: "Socrates changed how I read academic papers. Instead of spending two hours dissecting equations, the AI breaks it down into simple concepts. My prep time dropped in half.",
              name: "Elena Rostova",
              role: "Computer Science, Stanford",
              rating: 5
            },
            {
              quote: "The flashcard generator is pure magic. I drag my organic chemistry slides into Socrates, and within ten seconds I have a fully functioning review deck. It saves hours of manual writing.",
              name: "Liam O'Connor",
              role: "Pre-Med Student, Boston University",
              rating: 5
            },
            {
              quote: "Auto-generated quizzes are a lifesaver. I set the difficulty to Hard right before exams and test myself. The explanations for why I got answers wrong are better than my textbook.",
              name: "Sophia Martinez",
              role: "Finance & Accounting, UT Austin",
              rating: 5
            }
          ].map((t, idx) => (
            <div key={idx} className="glass-panel p-8 rounded-2xl border border-brand-border/40 text-left flex flex-col justify-between gap-6">
              <div className="flex gap-1">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-slate-300 text-sm italic leading-relaxed">"{t.quote}"</p>
              <div className="border-t border-brand-border/20 pt-4 mt-2">
                <h4 className="font-bold text-slate-100 text-sm">{t.name}</h4>
                <p className="text-slate-500 text-xs">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className="max-w-4xl mx-auto px-6 py-16 md:py-24 text-center relative rounded-3xl border border-violet-500/30 bg-gradient-to-b from-violet-950/20 to-black/80 overflow-hidden shadow-2xl">
        <div className="absolute inset-0 glow-spot-primary opacity-20 pointer-events-none" />
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
          Your Smart AI Study Partner
        </h2>
        <p className="text-slate-400 max-w-lg mx-auto text-base mb-8">
          Upload your notes, textbooks, or research articles today. Unlock simplified learning and study smarter.
        </p>
        <button
          onClick={onStartDemo}
          className="px-8 py-4 rounded-xl font-bold bg-white text-slate-950 hover:bg-slate-150 hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 mx-auto cursor-pointer"
        >
          Start Learning Free
          <ArrowRight className="w-4 h-4" />
        </button>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 pt-20 border-t border-brand-border/20 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 text-center md:text-left">
        <div>
          <p>© {new Date().getFullYear()} Socrates AI. Crafted for elite student learning.</p>
        </div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-slate-300">Privacy Policy</a>
          <a href="#" className="hover:text-slate-300">Terms of Service</a>
          <a href="#" className="hover:text-slate-300">Contact Support</a>
        </div>
      </footer>
    </div>
  );
}

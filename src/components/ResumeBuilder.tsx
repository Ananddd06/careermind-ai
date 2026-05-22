"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  FileText, Sparkles, FileDown, UploadCloud, RotateCcw, 
  Search, FileCode, Check, LayoutGrid, List, MessageSquare,
  History, Share2, Crown, Maximize2, ZoomIn, ZoomOut, Save, MoreHorizontal,
  ChevronRight, ChevronDown, Folder, File, Briefcase, RefreshCw, AlertTriangle
} from "lucide-react";
import { 
  DEFAULT_LATE_RESUME, 
  convertResumeToLatex, 
  generateResumeSuggestions,
  ResumeSuggestion,
  SUPPORTED_MODELS 
} from "@/lib/openrouter";
import { parsePdfOnClient } from "@/lib/client-pdf-parser";
import { parseLatex } from "@/lib/resume-parser";

interface ResumeBuilderProps {
  openRouterKey: string;
  selectedModel: string;
  onActivityPerformed: () => void;
}

export default function ResumeBuilder({
  openRouterKey,
  selectedModel,
  onActivityPerformed
}: ResumeBuilderProps) {
  const [latexCode, setLatexCode] = useState(DEFAULT_LATE_RESUME);
  const [isConverting, setIsConverting] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [zoomLevel, setZoomLevel] = useState(80);
  const [activeTab, setActiveTab] = useState<"code" | "visual">("code");
  const [sidebarTab, setSidebarTab] = useState<"files" | "ai">("files");
  const [jobDescription, setJobDescription] = useState("");
  const [suggestions, setSuggestions] = useState<ResumeSuggestion[]>([]);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatLatexText = (text: string) => {
    if (!text) return "";
    return text
      .replace(/\\textbf\{([^}]+)\}/g, '<b>$1</b>')
      .replace(/\\emph\{([^}]+)\}/g, '<i>$1</i>')
      .replace(/\\textit\{([^}]+)\}/g, '<i>$1</i>')
      .replace(/\\href\{([^}]+)\}\{([^}]+)\}/g, '<a href="$1" target="_blank" class="hover:underline text-blue-800">$2</a>')
      .replace(/\\&/g, '&')
      .replace(/\\%/g, '%')
      .replace(/\\(?![a-zA-Z])/g, '');
  };

  // Real-time parsed resume structure for the preview
  const [parsedResume, setParsedResume] = useState(parseLatex(DEFAULT_LATE_RESUME));
  
  // Extract sections for the File Outline
  const sections = latexCode.match(/\\\\section\\{([^}]+)\\}/g)?.map(s => s.replace(/\\\\section\\{|\\}/g, "")) || [];

  // Update parsed resume when LaTeX changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setParsedResume(parseLatex(latexCode));
    }, 300);
    return () => clearTimeout(timer);
  }, [latexCode]);

  // Load cached resume from local storage if exists
  useEffect(() => {
    const cached = localStorage.getItem("socrates_resume_latex");
    if (cached) {
      setLatexCode(cached);
    }
  }, []);

  const saveToCache = (code: string) => {
    setLatexCode(code);
    localStorage.setItem("socrates_resume_latex", code);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setUploadError("Please upload a valid PDF resume.");
      return;
    }

    setIsConverting(true);
    setUploadError("");
    setSuccessMessage("");

    try {
      const extractedText = await parsePdfOnClient(file);
      if (!extractedText.trim()) {
        throw new Error("Could not extract text from the PDF. The file may be image-scanned.");
      }

      const latex = await convertResumeToLatex(openRouterKey, selectedModel, extractedText);
      saveToCache(latex);
      
      onActivityPerformed();
      setSuccessMessage("Successfully parsed PDF and generated LaTeX resume!");
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err: any) {
      console.error(err);
      setUploadError(err.message || "Failed to process the PDF resume.");
    } finally {
      setIsConverting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleGenerateSuggestions = async () => {
    if (!jobDescription.trim()) {
      setUploadError("Please paste a Job Description first.");
      setTimeout(() => setUploadError(""), 3000);
      return;
    }
    
    setIsGeneratingSuggestions(true);
    setSuggestions([]);
    
    try {
      const result = await generateResumeSuggestions(openRouterKey, selectedModel, latexCode, jobDescription);
      setSuggestions(result);
      onActivityPerformed();
      setSidebarTab("ai");
    } catch (err: any) {
      console.error(err);
      setUploadError(err.message || "Failed to generate suggestions");
      setTimeout(() => setUploadError(""), 3000);
    } finally {
      setIsGeneratingSuggestions(false);
    }
  };

  const applySuggestion = (suggestion: ResumeSuggestion, index: number) => {
    if (!latexCode.includes(suggestion.originalText)) {
      setUploadError("Could not find the original text in the editor. It may have been modified.");
      setTimeout(() => setUploadError(""), 3000);
      return;
    }
    
    const newCode = latexCode.replace(suggestion.originalText, suggestion.suggestedText);
    saveToCache(newCode);
    
    // Remove the applied suggestion
    setSuggestions(prev => prev.filter((_, i) => i !== index));
    setSuccessMessage("Applied suggestion to resume!");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handleDownloadPdf = () => {
    const printContent = document.getElementById("printable-resume-container")?.innerHTML;
    if (!printContent) return;

    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (doc) {
      doc.write(`
        <html>
          <head>
            <title>\${parsedResume.name || "Resume"}</title>
            <style>
              @page { size: A4; margin: 0.5in; }
              body { font-family: 'Times New Roman', Times, serif; color: #000; background: #fff; line-height: 1.3; margin: 0; padding: 0; }
              a { color: #000; text-decoration: underline; }
              /* Tailwind utility mappings for PDF export */
              .flex { display: flex; }
              .justify-between { justify-content: space-between; }
              .justify-center { justify-content: center; }
              .items-baseline { align-items: baseline; }
              .items-center { align-items: center; }
              .flex-wrap { flex-wrap: wrap; }
              .gap-2 { gap: 8px; }
              .text-center { text-align: center; }
              .font-bold { font-weight: bold; }
              .font-normal { font-weight: normal; }
              .italic { font-style: italic; }
              .uppercase { text-transform: uppercase; }
              .tracking-wide { letter-spacing: 0.025em; }
              .underline { text-decoration: underline; }
              .border-b { border-bottom: 1px solid black; }
              .border-black { border-color: black; }
              .list-none { list-style-type: none; }
              .list-disc { list-style-type: disc; }
              .m-0 { margin: 0; }
              .p-0 { padding: 0; }
              .mb-1 { margin-bottom: 4px; }
              .mb-1\\.5 { margin-bottom: 6px; }
              .mb-2 { margin-bottom: 8px; }
              .mb-3 { margin-bottom: 12px; }
              .mb-4 { margin-bottom: 16px; }
              .pb-\\[2px\\] { padding-bottom: 2px; }
              .pl-\\[0\\.15in\\] { padding-left: 0.15in; }
              .pl-5 { padding-left: 20px; }
              .space-y-\\[2px\\] > * + * { margin-top: 2px; }
              .space-y-\\[6px\\] > * + * { margin-top: 6px; }
              .text-\\[32px\\] { font-size: 32px; }
              .text-\\[14\\.5px\\] { font-size: 14.5px; }
              .text-\\[17px\\] { font-size: 17px; }
              .text-\\[15px\\] { font-size: 15px; }
            </style>
          </head>
          <body>${printContent}</body>
        </html>
      `);
      doc.close();
      
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        document.body.removeChild(iframe);
      }, 500);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] border border-zinc-800/30 rounded-2xl overflow-hidden font-sans text-zinc-300 relative">
      
      {/* Overleaf-Style Global Header */}
      <div className="flex items-center justify-between px-2 md:px-4 py-1.5 md:py-2 bg-[#1e1e1e] border-b border-[#333] text-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-emerald-500 font-bold">
            <LayoutGrid className="w-4 h-4" />
          </div>
          <div className="hidden md:flex items-center text-xs text-zinc-300 space-x-4">
            <span className="hover:text-white cursor-pointer">File</span>
            <span className="hover:text-white cursor-pointer">Edit</span>
            <span className="hover:text-white cursor-pointer">Insert</span>
            <span className="hover:text-white cursor-pointer">View</span>
            <span className="hover:text-white cursor-pointer">Format</span>
            <span className="hover:text-white cursor-pointer">Help</span>
          </div>
        </div>
        <div className="flex items-center justify-center flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs md:text-sm font-semibold text-white">Jake's Resume Template</span>
            <span className="text-xs text-zinc-500">(Anonymous)</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <History className="w-4 h-4 text-zinc-400 hover:text-white cursor-pointer" />
          <MessageSquare className="w-4 h-4 text-zinc-400 hover:text-white cursor-pointer" />
          <button className="hidden md:flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded text-xs font-semibold">
            <Share2 className="w-3.5 h-3.5" /> Share
          </button>
          <button className="hidden md:flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded text-xs font-semibold">
            <Crown className="w-3.5 h-3.5" /> Upgrade
          </button>
        </div>
      </div>

      {/* Main split viewport layout */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* Left Sidebar (File tree & AI Assistant) */}
        <div className="hidden lg:flex lg:w-80 flex-col bg-[#1e1e1e] border-r border-[#333]">
          {/* Sidebar Tabs */}
          <div className="flex border-b border-[#333] text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
            <button 
              onClick={() => setSidebarTab("files")}
              className={`flex-1 py-2.5 text-center transition-colors ${sidebarTab === "files" ? "bg-white/10 text-white" : "hover:bg-white/5"}`}
            >
              File Explorer
            </button>
            <button 
              onClick={() => setSidebarTab("ai")}
              className={`flex-1 py-2.5 text-center flex items-center justify-center gap-1.5 transition-colors ${sidebarTab === "ai" ? "bg-emerald-500/20 text-emerald-400" : "hover:bg-white/5"}`}
            >
              <Sparkles className="w-3 h-3" /> AI Assistant
            </button>
          </div>

          {sidebarTab === "files" ? (
            <>
              {/* File Tree */}
              <div className="flex-1 flex flex-col min-h-0 border-b border-[#333]">
                <div className="px-3 py-2 text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><ChevronDown className="w-3 h-3" /> File tree</span>
                  <div className="flex gap-2">
                    <FileText className="w-3.5 h-3.5 hover:text-white cursor-pointer" />
                    <Folder className="w-3.5 h-3.5 hover:text-white cursor-pointer" />
                    <UploadCloud onClick={() => fileInputRef.current?.click()} className="w-3.5 h-3.5 hover:text-emerald-400 cursor-pointer" />
                  </div>
                </div>
                <div className="px-2 py-1 flex-1 overflow-y-auto">
                  <div className="flex items-center gap-2 px-2 py-1.5 rounded bg-emerald-500/10 text-emerald-400 text-sm cursor-pointer">
                    <File className="w-4 h-4" />
                    main.tex
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/5 text-zinc-400 text-sm cursor-pointer">
                    <File className="w-4 h-4" />
                    resume.cls
                  </div>
                </div>
              </div>
              
              {/* File Outline */}
              <div className="flex-1 flex flex-col min-h-0">
                <div className="px-3 py-2 text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ChevronDown className="w-3 h-3" /> File outline
                </div>
                <div className="px-2 py-1 flex-1 overflow-y-auto space-y-0.5">
                  {sections.length > 0 ? (
                    sections.map((sec, idx) => (
                      <div key={idx} className="flex items-center gap-2 px-4 py-1 text-xs text-zinc-400 hover:text-white hover:bg-white/5 rounded cursor-pointer truncate">
                        {sec}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-4 text-xs text-zinc-500 text-center">
                      We can't find any sections or subsections in this file.
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden bg-[#1e1e1e]">
              <div className="p-4 border-b border-[#333] flex flex-col gap-3 shrink-0">
                <div className="flex items-center gap-2 text-zinc-200 font-bold text-sm">
                  <Briefcase className="w-4 h-4 text-emerald-400" /> Target Job Description
                </div>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description here..."
                  className="w-full h-32 bg-[#252526] border border-[#3c3c3c] rounded p-2.5 text-xs text-zinc-300 placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/50 resize-none custom-scrollbar"
                />
                <button
                  onClick={handleGenerateSuggestions}
                  disabled={isGeneratingSuggestions || !jobDescription.trim()}
                  className="w-full flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded text-xs font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                  {isGeneratingSuggestions ? (
                    <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Analyzing match...</>
                  ) : (
                    <><Search className="w-3.5 h-3.5" /> Get ATS Suggestions</>
                  )}
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {suggestions.length === 0 && !isGeneratingSuggestions ? (
                  <div className="text-center text-zinc-500 text-xs py-8">
                    <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    <p>Paste a job description and click generate to get AI-powered bullet point improvements.</p>
                  </div>
                ) : (
                  suggestions.map((sug, idx) => (
                    <div key={idx} className="bg-[#252526] border border-emerald-500/30 rounded-lg p-3 shadow-lg">
                      <div className="text-[10px] uppercase font-bold text-emerald-400 mb-2 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> AI Suggestion
                      </div>
                      <div className="text-xs text-zinc-400 line-through mb-2 opacity-60">
                        {sug.originalText.replace(/\\resumeItem\{/, '').replace(/\}$/, '')}
                      </div>
                      <div className="text-xs text-zinc-200 mb-3 font-medium bg-emerald-500/10 p-2 rounded border border-emerald-500/20">
                        {sug.suggestedText.replace(/\\resumeItem\{/, '').replace(/\}$/, '')}
                      </div>
                      <div className="text-[10px] text-zinc-400 mb-3 italic border-l-2 border-[#333] pl-2">
                        {sug.reason}
                      </div>
                      <button 
                        onClick={() => applySuggestion(sug, idx)}
                        className="w-full py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-xs font-bold rounded flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Check className="w-3 h-3" /> Apply to Resume
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Middle Pane: Code Editor */}
        <div className="h-[50vh] md:h-auto md:flex-1 flex flex-col bg-[#252526] border-r border-[#333] min-w-0">
          {/* Editor Tabs & Toolbar */}
          <div className="flex flex-col border-b border-[#333]">
            <div className="flex items-center bg-[#1e1e1e]">
              <div className="px-4 py-2 bg-[#252526] border-t-2 border-emerald-500 text-zinc-200 text-sm flex items-center gap-2">
                <File className="w-3.5 h-3.5 text-emerald-500" />
                main.tex
              </div>
            </div>
            <div className="flex items-center justify-between px-3 py-1.5 bg-[#252526] text-zinc-400 text-sm">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setActiveTab("code")}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded ${activeTab === "code" ? "bg-emerald-500/20 text-emerald-400 font-semibold" : "hover:bg-white/5"}`}
                >
                  Code Editor
                </button>
                <button 
                  onClick={() => setActiveTab("visual")}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded ${activeTab === "visual" ? "bg-emerald-500/20 text-emerald-400 font-semibold" : "hover:bg-white/5"}`}
                >
                  Visual Editor
                </button>
              </div>
              <div className="flex items-center gap-3">
                <RotateCcw className="w-4 h-4 hover:text-white cursor-pointer" />
                <span className="text-xs">Normal text <ChevronDown className="w-3 h-3 inline" /></span>
                <span className="font-bold cursor-pointer hover:text-white">B</span>
                <span className="italic cursor-pointer hover:text-white">I</span>
                <span className="cursor-pointer hover:text-white">Ω</span>
                <List className="w-4 h-4 hover:text-white cursor-pointer" />
              </div>
            </div>
          </div>
          
          {/* Code Textarea */}
          <div className="flex-1 relative overflow-hidden bg-[#1e1e1e]">
            {/* Fake line numbers for aesthetics */}
            <div className="absolute left-0 top-0 bottom-0 w-10 bg-[#1e1e1e] border-r border-[#333] flex flex-col items-end py-4 pr-2 text-[#858585] text-xs font-mono select-none overflow-hidden">
              {Array.from({ length: 100 }).map((_, i) => (
                <div key={i} className="h-[21px]">{i + 1}</div>
              ))}
            </div>
            <textarea
              value={latexCode}
              onChange={(e) => saveToCache(e.target.value)}
              className="absolute inset-0 pl-12 pr-4 py-4 w-full h-full bg-transparent text-[#d4d4d4] font-mono text-sm leading-[21px] resize-none focus:outline-none"
              spellCheck="false"
            />
          </div>
        </div>

        {/* Right Pane: Live PDF Preview */}
        <div className="h-[50vh] md:h-auto md:flex-1 flex flex-col bg-[#323639] min-w-0">
          {/* Preview Toolbar */}
          <div className="px-4 py-2 border-b border-[#202124] flex items-center justify-between bg-[#323639] text-zinc-300">
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded text-sm font-bold shadow-md">
                Recompile <ChevronDown className="w-4 h-4" />
              </button>
              <FileDown onClick={handleDownloadPdf} className="w-4 h-4 hover:text-white cursor-pointer ml-2" />
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="w-4 h-4 rounded-full bg-black/40 flex items-center justify-center text-[10px]">🌓</span>
              <div className="flex items-center gap-2 bg-black/20 px-2 py-1 rounded">
                <span>1 / 1</span>
              </div>
              <ZoomOut onClick={() => setZoomLevel(Math.max(40, zoomLevel - 10))} className="w-4 h-4 hover:text-white cursor-pointer" />
              <ZoomIn onClick={() => setZoomLevel(Math.min(150, zoomLevel + 10))} className="w-4 h-4 hover:text-white cursor-pointer" />
              <span className="text-xs">{zoomLevel}%</span>
            </div>
          </div>
          
          {/* PDF Canvas Area */}
          <div className="flex-1 overflow-auto p-8 flex justify-center items-start">
            <div 
              id="printable-resume-container"
              className="shadow-2xl origin-top transition-transform"
              style={{
                width: "210mm",
                minHeight: "297mm",
                padding: "0.5in",
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: "top center",
                color: "#000",
                fontFamily: "'Times New Roman', Times, serif",
                backgroundColor: "white",
              }}
            >
              {/* Render parsed resume identically to the template */}
              <div className="text-center mb-4">
                <h1 className="text-[32px] font-bold uppercase tracking-wide mb-1" style={{ fontVariant: 'small-caps' }}>
                  {parsedResume.name || "Jake Ryan"}
                </h1>
                <div className="text-[14.5px] flex items-center justify-center gap-2 flex-wrap text-black">
                  {parsedResume.phone && <span>{parsedResume.phone}</span>}
                  {parsedResume.phone && <span>|</span>}
                  {parsedResume.email && <a href={`mailto:${parsedResume.email}`} className="underline">{parsedResume.email}</a>}
                  {(parsedResume.email && parsedResume.linkedin) && <span>|</span>}
                  {parsedResume.linkedin && <a href={`https://${parsedResume.linkedin}`} className="underline">{parsedResume.linkedin}</a>}
                  {(parsedResume.linkedin && parsedResume.github) && <span>|</span>}
                  {parsedResume.github && <a href={`https://${parsedResume.github}`} className="underline">{parsedResume.github}</a>}
                </div>
              </div>

              {parsedResume.sections.map((section, idx) => (
                <div key={idx} className="mb-3">
                  <h2 
                    className="text-[17px] font-bold uppercase border-b border-black pb-[2px] mb-2"
                    style={{ fontVariant: 'small-caps' }}
                  >
                    {section.title}
                  </h2>
                  
                  {section.title.toLowerCase().includes("skills") ? (
                    <ul className="list-none m-0 p-0 pl-[0.15in]">
                      {section.items.map((item, i) => (
                        <li key={i} className="text-[14.5px] mb-[2px]">
                          {item.bullets.map((bullet, j) => (
                            <span key={j} dangerouslySetInnerHTML={{ __html: formatLatexText(bullet) }} />
                          ))}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="space-y-[6px]">
                      {section.items.map((item, i) => (
                        <div key={i} className="pl-[0.15in]">
                          <div className="flex justify-between items-baseline text-[15px] font-bold">
                            <span dangerouslySetInnerHTML={{ __html: formatLatexText(item.title) }} />
                            <span className="font-normal" dangerouslySetInnerHTML={{ __html: formatLatexText(item.sub2 || item.date) }} />
                          </div>
                          {(item.sub1 || (item.date && item.sub2)) && (
                            <div className="flex justify-between items-baseline text-[14.5px] italic mb-1.5">
                              <span dangerouslySetInnerHTML={{ __html: formatLatexText(item.sub1) }} />
                              <span dangerouslySetInnerHTML={{ __html: formatLatexText(item.sub2 ? item.date : '') }} />
                            </div>
                          )}
                          {item.bullets.length > 0 && (
                            <ul className="list-disc pl-5 m-0 text-[14.5px] space-y-[2px]">
                              {item.bullets.map((bullet, j) => (
                                <li key={j} dangerouslySetInnerHTML={{ __html: formatLatexText(bullet) }} />
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Hidden file input for uploading */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="application/pdf"
        className="hidden"
      />
      
      {/* Absolute positioning for messages */}
      {(uploadError || successMessage || isConverting) && (
        <div className="absolute top-16 right-6 z-50 animate-fade-in flex flex-col gap-2">
          {isConverting && (
            <div className="flex gap-2 bg-indigo-900/90 border border-indigo-500 p-3 rounded-lg text-xs text-indigo-200 shadow-xl items-center">
              <RefreshCw className="w-4 h-4 animate-spin" /> Extracting & formatting PDF...
            </div>
          )}
          {uploadError && (
            <div className="flex gap-2 bg-rose-900/90 border border-rose-500 p-3 rounded-lg text-xs text-rose-200 shadow-xl items-center">
              <AlertTriangle className="w-4 h-4" /> {uploadError}
            </div>
          )}
          {successMessage && (
            <div className="flex gap-2 bg-emerald-900/90 border border-emerald-500 p-3 rounded-lg text-xs text-emerald-200 shadow-xl items-center">
              <Check className="w-4 h-4" /> {successMessage}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

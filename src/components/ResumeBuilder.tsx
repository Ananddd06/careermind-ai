"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  FileText, Sparkles, FileDown, UploadCloud, RotateCcw, 
  CheckCircle, AlertTriangle, ArrowRight, Play, Copy, RefreshCw, Key,
  Briefcase, Edit3, Award, Search, FileCode, Check
} from "lucide-react";
import { 
  DEFAULT_LATE_RESUME, 
  convertResumeToLatex, 
  analyzeResume, 
  AtsFeedback, 
  SUPPORTED_MODELS 
} from "@/lib/openrouter";
import { parsePdfOnClient } from "@/lib/client-pdf-parser";

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
  const [activeSubTab, setActiveSubTab] = useState<"preview" | "ats">("preview");
  const [jobDescription, setJobDescription] = useState("");
  const [atsFeedback, setAtsFeedback] = useState<AtsFeedback | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Real-time parsed resume structure
  const [parsedResume, setParsedResume] = useState(parseLatex(DEFAULT_LATE_RESUME));

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

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset your resume to the default template? This will discard your current edits.")) {
      saveToCache(DEFAULT_LATE_RESUME);
      setSuccessMessage("Resume reset to default template.");
      setTimeout(() => setSuccessMessage(""), 3000);
    }
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

      // Convert extracted text into LaTeX using OpenRouter
      const latex = await convertResumeToLatex(openRouterKey, selectedModel, extractedText);
      saveToCache(latex);
      
      onActivityPerformed();
      setSuccessMessage("Successfully parsed PDF and generated LaTeX resume!");
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err: any) {
      console.error(err);
      setUploadError(err.message || "Failed to process the PDF resume. Standard template retained.");
    } finally {
      setIsConverting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDownloadTex = () => {
    const blob = new Blob([latexCode], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${parsedResume.name.replace(/\s+/g, "_")}_Resume.tex`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPdf = () => {
    const printContent = document.getElementById("printable-resume-container")?.innerHTML;
    if (!printContent) return;

    // Create an iframe to print dynamically
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
            <title>${parsedResume.name || "Resume"}</title>
            <style>
              @page {
                size: letter;
                margin: 0.5in;
              }
              body {
                font-family: 'Times New Roman', Times, serif;
                color: #000;
                background: #fff;
                font-size: 10pt;
                line-height: 1.3;
                margin: 0;
                padding: 0;
              }
              a {
                color: #000;
                text-decoration: underline;
              }
              .text-center { text-align: center; }
              .name { font-size: 17pt; font-variant: small-caps; font-weight: bold; margin-bottom: 2px; }
              .contact { font-size: 8.5pt; margin-bottom: 8px; }
              .section-title {
                font-size: 10.5pt;
                font-variant: small-caps;
                font-weight: bold;
                border-bottom: 1px solid #000;
                margin-top: 10px;
                margin-bottom: 5px;
                padding-bottom: 1px;
              }
              .subheading-row {
                display: flex;
                justify-content: space-between;
                font-weight: bold;
                font-size: 9.5pt;
                margin-top: 3px;
              }
              .subheading-subrow {
                display: flex;
                justify-content: space-between;
                font-style: italic;
                font-size: 9pt;
                margin-bottom: 3px;
              }
              .project-row {
                display: flex;
                justify-content: space-between;
                font-size: 9.5pt;
                margin-top: 3px;
                margin-bottom: 1px;
              }
              ul {
                margin: 0 0 5px 0;
                padding-left: 18px;
              }
              li {
                margin-bottom: 1px;
                font-size: 9pt;
              }
              .skills-list {
                font-size: 9pt;
                margin-top: 3px;
                margin-bottom: 3px;
              }
            </style>
          </head>
          <body>
            ${printContent}
          </body>
        </html>
      `);
      doc.close();
      
      // Wait for iframe content to render before printing
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        document.body.removeChild(iframe);
      }, 500);
    }
  };

  const handleAnalyzeAts = async () => {
    if (!jobDescription.trim()) {
      alert("Please enter a job description to analyze your resume.");
      return;
    }

    setIsAnalyzing(true);
    setAtsFeedback(null);

    try {
      const feedback = await analyzeResume(openRouterKey, selectedModel, latexCode, jobDescription);
      setAtsFeedback(feedback);
      onActivityPerformed();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to analyze resume. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applySuggestion = (original: string, replacement: string) => {
    // Find the original phrase in the LaTeX code and replace it
    if (latexCode.includes(original)) {
      const updatedCode = latexCode.replace(original, replacement);
      saveToCache(updatedCode);
      setSuccessMessage("Wording suggestion applied directly to LaTeX editor!");
      setTimeout(() => setSuccessMessage(""), 3000);
      
      // Remove applied suggestion from local state list
      if (atsFeedback) {
        setAtsFeedback({
          ...atsFeedback,
          suggestions: atsFeedback.suggestions.filter(s => s.originalPhrase !== original)
        });
      }
    } else {
      alert("Unable to auto-apply because the phrase was modified in the LaTeX editor. You can copy the suggested phrase manually.");
    }
  };

  // Helper inserts for LaTeX code
  const insertSubheading = () => {
    const snippet = `\n    \\resumeSubheading
      {Company/Institution}{Start Date -- End Date}
      {Job Title / Degree Title}{City, State}
      \\resumeItemListStart
        \\resumeItem{Describe your key contribution or accomplishment leading with a strong action verb.}
        \\resumeItem{Quantify your results (e.g., optimized service processing speed by 18%).}
      \\resumeItemListEnd\n`;
    
    // Insert at current cursor or just append before end{document}
    const index = latexCode.lastIndexOf("\\end{document}");
    if (index !== -1) {
      const updated = latexCode.substring(0, index) + snippet + latexCode.substring(index);
      saveToCache(updated);
    }
  };

  const insertProject = () => {
    const snippet = `\n      \\resumeProjectHeading
          {\\textbf{Project Name} $|$ \\emph{Technologies Used}}{Date}
          \\resumeItemListStart
            \\resumeItem{Developed key systems and features using modern programming frameworks.}
            \\resumeItem{Managed production environments and deployed configurations.}
          \\resumeItemListEnd\n`;
    const index = latexCode.lastIndexOf("\\end{document}");
    if (index !== -1) {
      const updated = latexCode.substring(0, index) + snippet + latexCode.substring(index);
      saveToCache(updated);
    }
  };

  return (
    <div className="flex flex-col h-full bg-brand-card/20 border border-brand-border/30 rounded-2xl overflow-hidden glass-panel">
      
      {/* Top Banner Toolbar */}
      <div className="px-6 py-4 border-b border-brand-border/20 flex flex-wrap gap-4 justify-between items-center bg-black/20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Briefcase className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-100 text-sm">Resume Builder & ATS Optimizer</h3>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 border border-brand-border/20 text-[9px] text-slate-400 font-mono">
                <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                <span>{SUPPORTED_MODELS.find(m => m.id === selectedModel)?.name || "Offline Simulator"}</span>
              </div>
            </div>
            <p className="text-slate-500 text-xs">Edit Jake's LaTeX Resume & scan keywords with AI</p>
          </div>
        </div>

        {/* Toolbar Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Upload PDF resume */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isConverting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand-border/40 text-xs font-semibold hover:bg-white/5 transition-all text-slate-300 disabled:opacity-50 cursor-pointer"
            title="Upload existing resume to fill template"
          >
            {isConverting ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-violet-400" />
            ) : (
              <UploadCloud className="w-3.5 h-3.5" />
            )}
            {isConverting ? "Converting PDF..." : "Upload Resume PDF"}
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="application/pdf"
            className="hidden"
          />

          {/* Reset to template */}
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand-border/40 text-xs font-semibold hover:bg-white/5 transition-all text-slate-400 cursor-pointer"
            title="Reset template"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>

          {/* Download Tex */}
          <button
            onClick={handleDownloadTex}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand-border/40 text-xs font-semibold hover:bg-white/5 transition-all text-slate-400 cursor-pointer"
            title="Download LaTeX source file"
          >
            <FileCode className="w-3.5 h-3.5 text-blue-400" />
            .TEX
          </button>

          {/* Download PDF */}
          <button
            onClick={handleDownloadPdf}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white transition-all cursor-pointer shadow-md"
            title="Export as PDF file"
          >
            <FileDown className="w-3.5 h-3.5" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Upload Info banner / Error messaging */}
      {uploadError && (
        <div className="mx-6 mt-4 flex gap-3 bg-rose-950/20 border border-rose-500/30 p-3.5 rounded-xl text-xs text-rose-300 animate-fade-in">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{uploadError}</span>
        </div>
      )}
      {successMessage && (
        <div className="mx-6 mt-4 flex gap-3 bg-emerald-950/20 border border-emerald-500/30 p-3.5 rounded-xl text-xs text-emerald-300 animate-fade-in">
          <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Main split viewport layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden h-[calc(100vh-12rem)]">
        
        {/* Left Side: LaTeX Code Editor (5 cols) */}
        <div className="lg:col-span-5 flex flex-col border-r border-brand-border/20 h-full overflow-hidden bg-slate-950/40">
          <div className="px-4 py-2 border-b border-brand-border/10 flex justify-between items-center bg-black/10">
            <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase flex items-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5 text-violet-400" /> LaTeX Editor
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={insertSubheading}
                className="text-[10px] bg-white/5 border border-brand-border/30 hover:border-violet-500/40 px-2 py-1 rounded text-slate-300 cursor-pointer"
              >
                + Job
              </button>
              <button
                onClick={insertProject}
                className="text-[10px] bg-white/5 border border-brand-border/30 hover:border-violet-500/40 px-2 py-1 rounded text-slate-300 cursor-pointer"
              >
                + Project
              </button>
            </div>
          </div>

          {/* Large text editor input */}
          <div className="flex-1 relative flex">
            {/* Simple Line Numbers Mockup */}
            <div className="w-9 bg-black/30 border-r border-brand-border/10 select-none py-4 text-right pr-2 font-mono text-[10px] text-slate-600 leading-6 overflow-hidden">
              {Array.from({ length: Math.min(250, latexCode.split("\n").length) }).map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
            
            <textarea
              value={latexCode}
              onChange={(e) => saveToCache(e.target.value)}
              spellCheck={false}
              className="flex-1 bg-transparent p-4 outline-none resize-none font-mono text-[11px] text-slate-200 leading-6 overflow-y-auto"
              placeholder="Paste or write your LaTeX code here..."
            />
          </div>
        </div>

        {/* Right Side: Tabbed Visual Resume & ATS Analyzer (7 cols) */}
        <div className="lg:col-span-7 flex flex-col h-full overflow-hidden">
          
          {/* Navigation sub-tabs */}
          <div className="px-4 py-2 border-b border-brand-border/20 flex gap-2 bg-black/15">
            <button
              onClick={() => setActiveSubTab("preview")}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeSubTab === "preview"
                  ? "bg-violet-600/15 border border-violet-500/40 text-violet-300"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              📄 Live A4 PDF Preview
            </button>
            <button
              onClick={() => setActiveSubTab("ats")}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeSubTab === "ats"
                  ? "bg-violet-600/15 border border-violet-500/40 text-violet-300"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              ⚡ ATS Score & Suggestion Checker
            </button>
          </div>

          {/* Sub-Tab Content Viewport */}
          <div className="flex-1 overflow-y-auto p-6 bg-slate-900/10">
            
            {/* Sub-Tab 1: Visual Resume Preview */}
            {activeSubTab === "preview" && (
              <div className="flex flex-col items-center">
                <div className="w-full max-w-[21cm] bg-white text-slate-900 border border-slate-300 shadow-2xl p-[1.5cm] min-h-[29.7cm] flex flex-col text-left transition-all leading-normal select-text">
                  
                  {/* Container that maps to physical PDF download layout */}
                  <div id="printable-resume-container">
                    
                    {/* Centered Heading */}
                    <div className="text-center">
                      <div className="name font-bold tracking-tight text-slate-950 uppercase" style={{ fontFamily: "serif", fontSize: "20px" }}>
                        {parsedResume.name}
                      </div>
                      <div className="contact text-slate-700 text-[11px] mt-1 space-x-1.5">
                        {parsedResume.contact.map((info, idx) => (
                          <React.Fragment key={idx}>
                            <span>{info}</span>
                            {idx < parsedResume.contact.length - 1 && <span className="text-slate-400 select-none">|</span>}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>

                    {/* Resume Sections */}
                    {parsedResume.sections.map((sec, sidx) => (
                      <div key={sidx} className="mt-4">
                        <div className="section-title text-[12px] font-bold border-b border-slate-900 text-slate-950 uppercase pb-[1px]" style={{ fontFamily: "serif" }}>
                          {sec.title}
                        </div>
                        
                        <div className="mt-1 space-y-3">
                          {sec.items.map((item: any, iidx: number) => {
                            if (item.type === "subheading") {
                              return (
                                <div key={iidx} className="text-[11.5px]">
                                  <div className="subheading-row flex justify-between font-bold text-slate-900">
                                    <span>{item.title1}</span>
                                    <span>{item.title2}</span>
                                  </div>
                                  <div className="subheading-subrow flex justify-between italic text-slate-600 text-[11px]">
                                    <span>{item.title3}</span>
                                    <span>{item.title4}</span>
                                  </div>
                                  {item.bullets && item.bullets.length > 0 && (
                                    <ul className="list-disc pl-5 mt-1 space-y-1">
                                      {item.bullets.map((bullet: string, bidx: number) => (
                                        <li key={bidx} className="text-slate-800 text-[11.5px] leading-relaxed">{bullet}</li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              );
                            }

                            if (item.type === "project") {
                              return (
                                <div key={iidx} className="text-[11.5px]">
                                  <div className="project-row flex justify-between font-bold text-slate-900">
                                    <span>{item.title1}</span>
                                    <span>{item.title2}</span>
                                  </div>
                                  {item.bullets && item.bullets.length > 0 && (
                                    <ul className="list-disc pl-5 mt-1 space-y-1">
                                      {item.bullets.map((bullet: string, bidx: number) => (
                                        <li key={bidx} className="text-slate-800 text-[11.5px] leading-relaxed">{bullet}</li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              );
                            }

                            if (item.type === "skills") {
                              return (
                                <div key={iidx} className="text-[11.5px] text-slate-800">
                                  <span className="font-bold text-slate-900">{item.title1}</span>: {item.title2}
                                </div>
                              );
                            }

                            return (
                              <div key={iidx} className="text-[11.5px] text-slate-800 leading-relaxed">
                                {item.rawText}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}

                  </div>

                </div>
                <span className="text-[10px] text-slate-500 mt-3 text-center">
                  💡 High-fidelity vector preview dynamically rendered from LaTeX input. Click <strong>Export PDF</strong> to print/save.
                </span>
              </div>
            )}

            {/* Sub-Tab 2: ATS Scanner & Optimizer */}
            {activeSubTab === "ats" && (
              <div className="max-w-2xl mx-auto space-y-6 text-left">
                
                {/* Configuration Input */}
                <div className="bg-brand-card/30 border border-brand-border/40 rounded-2xl p-5 space-y-4">
                  <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                    <Search className="w-4 h-4 text-violet-400" /> Target Job Alignment
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Paste the target job description details below. The AI will scan your LaTeX qualifications, generate matching scoring metrics, list missing keywords, and suggest direct text corrections.
                  </p>
                  <div>
                    <textarea
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Paste the full job details / qualifications requirements here..."
                      className="w-full h-32 bg-white/5 border border-brand-border/40 rounded-xl p-4 text-xs text-slate-200 placeholder-slate-600 outline-none focus:border-violet-500/50 resize-none"
                    />
                  </div>
                  <button
                    onClick={handleAnalyzeAts}
                    disabled={isAnalyzing || !jobDescription.trim()}
                    className="w-full py-2.5 rounded-xl font-bold bg-violet-600 hover:bg-violet-700 disabled:opacity-30 disabled:cursor-not-allowed text-xs text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                  >
                    {isAnalyzing ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                    ) : (
                      <Play className="w-3.5 h-3.5" />
                    )}
                    {isAnalyzing ? "Scanning Resume..." : "Run ATS Scan"}
                  </button>
                </div>

                {/* Score and recommendations */}
                {atsFeedback && (
                  <div className="space-y-6 animate-fade-in">
                    
                    {/* Score Indicator */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      
                      {/* Score gauge card */}
                      <div className="bg-brand-card/30 border border-brand-border/40 rounded-2xl p-5 flex flex-col items-center justify-center">
                        <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase mb-2">ATS Score</span>
                        <div className="relative w-24 h-24 flex items-center justify-center">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle cx="48" cy="48" r="40" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="8" fill="transparent" />
                            <circle 
                              cx="48" 
                              cy="48" 
                              r="40" 
                              stroke={atsFeedback.score >= 80 ? "#10b981" : atsFeedback.score >= 60 ? "#f59e0b" : "#ef4444"} 
                              strokeWidth="8" 
                              fill="transparent" 
                              strokeDasharray="251.2"
                              strokeDashoffset={251.2 - (251.2 * atsFeedback.score) / 100}
                              className="transition-all duration-1000 ease-out"
                            />
                          </svg>
                          <span className="absolute text-xl font-black text-slate-100">{atsFeedback.score}%</span>
                        </div>
                      </div>

                      {/* Match summary stats */}
                      <div className="md:col-span-2 bg-brand-card/30 border border-brand-border/40 rounded-2xl p-5 flex flex-col justify-center">
                        <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">Key Strengths Matched</h5>
                        <ul className="space-y-1.5">
                          {atsFeedback.strengths.map((str, idx) => (
                            <li key={idx} className="text-xs text-slate-300 flex items-start gap-1.5">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                              <span>{str}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                    </div>

                    {/* Missing Keywords list */}
                    <div className="bg-brand-card/30 border border-brand-border/40 rounded-2xl p-5 space-y-3">
                      <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Missing / Weak Keywords
                      </h5>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Incorporate these terms into your resume's technical skills list or descriptions to match recruiter search filters.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {atsFeedback.missingKeywords.map((kw, idx) => (
                          <span 
                            key={idx} 
                            onClick={() => {
                              // Fast append keyword to Technical Skills section
                              const skillIndex = latexCode.indexOf("\\section{Technical Skills}");
                              if (skillIndex !== -1) {
                                // Add keyword to Languages or Technologies
                                const updated = latexCode.replace(
                                  "\\section{Technical Skills}",
                                  `\\section{Technical Skills}\n  % Added ATS recommendation: ${kw}`
                                );
                                saveToCache(updated);
                                setSuccessMessage(`Suggested keyword "${kw}" added as draft comment in Technical Skills!`);
                                setTimeout(() => setSuccessMessage(""), 3000);
                              } else {
                                alert(`Copy and insert this keyword manually: ${kw}`);
                              }
                            }}
                            className="px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-400 text-xs font-semibold cursor-pointer transition-colors"
                          >
                            + {kw}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Phrasing Suggestions */}
                    <div className="bg-brand-card/30 border border-brand-border/40 rounded-2xl p-5 space-y-4">
                      <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                        Specific Wording Enhancements
                      </h5>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Replace generic descriptions with result-driven phrases. You can click <strong>"Apply Suggestion"</strong> to automatically inject them directly into your LaTeX code editor!
                      </p>

                      <div className="space-y-4">
                        {atsFeedback.suggestions.map((sug, idx) => (
                          <div key={idx} className="p-4 bg-black/30 border border-brand-border/20 rounded-xl space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                              <div>
                                <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Current Phrase:</span>
                                <p className="text-slate-400 bg-white/5 p-2.5 rounded border border-brand-border/10 leading-relaxed">{sug.originalPhrase}</p>
                              </div>
                              <div>
                                <span className="text-[10px] text-indigo-400 font-bold uppercase block mb-1">Suggested Upgrade:</span>
                                <p className="text-slate-100 bg-indigo-950/20 p-2.5 rounded border border-indigo-500/30 leading-relaxed font-semibold">{sug.suggestedPhrase}</p>
                              </div>
                            </div>
                            
                            <div className="text-[11px] text-slate-400 leading-relaxed border-t border-brand-border/10 pt-2.5 flex justify-between items-center">
                              <span>{sug.explanation}</span>
                              <button
                                onClick={() => applySuggestion(sug.originalPhrase, sug.suggestedPhrase)}
                                className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1.5 rounded text-[10px] cursor-pointer transition-colors shrink-0"
                              >
                                Apply Suggestion
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                )}

              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}

// Custom parser to map LaTeX to HTML
function parseLatex(latex: string) {
  const cleanStr = (str: string) => {
    if (!str) return "";
    return str
      .replace(/\\href\{[^\}]*\}\{([^\}]*)\}/g, '$1')
      .replace(/\\url\{([^\}]*)\}/g, '$1')
      .replace(/\\underline\{([^\}]*)\}/g, '$1')
      .replace(/\\textbf\{([^\}]*)\}/g, '$1')
      .replace(/\\emph\{([^\}]*)\}/g, '$1')
      .replace(/\\textit\{([^\}]*)\}/g, '$1')
      .replace(/\\scshape/g, '')
      .replace(/\\Huge/g, '')
      .replace(/\\large/g, '')
      .replace(/\\small/g, '')
      .replace(/\\fa[A-Za-z0-9]+/g, '')
      .replace(/\\raisebox\{[^\}]*\}\{\s*\\?[A-Za-z0-9]+\s*\}?/g, '')
      .replace(/\\raisebox\{[^\}]*\}/g, '')
      .replace(/~/g, ' ')
      .replace(/--/g, '–')
      .replace(/\\&/g, '&')
      .replace(/\\_/g, '_')
      .replace(/\\\$/g, '$')
      .replace(/\\bar\b/g, '|')
      .replace(/\\/g, '')
      .replace(/\{|\}/g, '')
      .trim();
  };

  // Find Name
  let name = "First Last";
  const nameMatch = latex.match(/\\Huge\s+\\scshape\s+([^\\\}]+)/) || 
                    latex.match(/\\scshape\s+\\Huge\s+([^\\\}]+)/) ||
                    latex.match(/\{\\Huge\s+\\scshape\s+([^\}]+)\}/);
  if (nameMatch) {
    name = nameMatch[1].trim();
  }

  // Find Contacts
  const contact: string[] = [];
  const centerMatch = latex.match(/\\begin\{center\}([\s\S]*?)\\end\{center\}/);
  if (centerMatch) {
    const lines = centerMatch[1].split('\n');
    for (const line of lines) {
      const parts = line.split(/[~|\\\/]/);
      for (const p of parts) {
        const clean = cleanStr(p).trim();
        if (clean && clean.length > 3 && !clean.includes("begin{center}") && !clean.includes("end{center}")) {
          contact.push(clean);
        }
      }
    }
  }

  // Find Sections
  const sections: any[] = [];
  const sectionParts = latex.split('\\section{');
  
  for (let i = 1; i < sectionParts.length; i++) {
    const part = sectionParts[i];
    const braceIndex = part.indexOf('}');
    if (braceIndex === -1) continue;
    
    const sectionTitle = part.substring(0, braceIndex).trim();
    const sectionBody = part.substring(braceIndex + 1);
    
    const items: any[] = [];
    
    const collapsedBody = sectionBody.replace(/\s+/g, ' ');
    const subheadings = [...collapsedBody.matchAll(/\\resumeSubheading\s*\{([^\}]+)\}\s*\{([^\}]+)\}\s*\{([^\}]+)\}\s*\{([^\}]+)\}/g)];
    const projects = [...collapsedBody.matchAll(/\\resumeProjectHeading\s*\{([^\}]+)\}\s*\{([^\}]+)\}/g)];
    
    if (subheadings.length > 0) {
      const subheadingParts = sectionBody.split('\\resumeSubheading');
      for (let j = 1; j < subheadingParts.length; j++) {
        const subPart = subheadingParts[j];
        const collapsedSub = ('\\resumeSubheading' + subPart).replace(/\s+/g, ' ');
        const match = collapsedSub.match(/\\resumeSubheading\s*\{([^\}]+)\}\s*\{([^\}]+)\}\s*\{([^\}]+)\}\s*\{([^\}]+)\}/);
        
        if (match) {
          const bullets: string[] = [];
          const bulletMatches = [...subPart.matchAll(/\\resumeItem\s*\{([^\}]+)\}/g)];
          for (const bm of bulletMatches) {
            bullets.push(cleanStr(bm[1]));
          }
          
          items.push({
            type: 'subheading',
            title1: cleanStr(match[1]),
            title2: cleanStr(match[2]),
            title3: cleanStr(match[3]),
            title4: cleanStr(match[4]),
            bullets
          });
        }
      }
    } else if (projects.length > 0) {
      const projectParts = sectionBody.split('\\resumeProjectHeading');
      for (let j = 1; j < projectParts.length; j++) {
        const projPart = projectParts[j];
        const collapsedProj = ('\\resumeProjectHeading' + projPart).replace(/\s+/g, ' ');
        const match = collapsedProj.match(/\\resumeProjectHeading\s*\{([^\}]+)\}\s*\{([^\}]+)\}/);
        
        if (match) {
          const bullets: string[] = [];
          const bulletMatches = [...projPart.matchAll(/\\resumeItem\s*\{([^\}]+)\}/g)];
          for (const bm of bulletMatches) {
            bullets.push(cleanStr(bm[1]));
          }
          
          items.push({
            type: 'project',
            title1: cleanStr(match[1]),
            title2: cleanStr(match[2]),
            bullets
          });
        }
      }
    } else {
      const lines = sectionBody.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('%') || trimmed.startsWith('\\begin') || trimmed.startsWith('\\end') || trimmed.startsWith('}')) continue;
        
        if (trimmed.includes('\\textbf{') && trimmed.includes('}{')) {
          const matches = trimmed.match(/\\textbf\{([^\}]+)\}\s*\{:?\s*([^\}]+)\}/);
          if (matches) {
            items.push({
              type: 'skills',
              title1: cleanStr(matches[1]),
              title2: cleanStr(matches[2])
            });
          }
        } else if (trimmed.startsWith('\\item') || trimmed.startsWith('\\resumeItem')) {
          const content = trimmed.replace(/^\\item\s*/, '').replace(/^\\resumeItem\{([^\}]+)\}/, '$1');
          items.push({
            type: 'text',
            rawText: cleanStr(content)
          });
        } else if (trimmed.length > 5 && !trimmed.startsWith('\\')) {
          items.push({
            type: 'text',
            rawText: cleanStr(trimmed)
          });
        }
      }
    }
    
    sections.push({
      title: sectionTitle,
      items
    });
  }

  return { name, contact, sections };
}

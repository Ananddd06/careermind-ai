"use client";

import React, { useState, useRef } from "react";
import { 
  UploadCloud, 
  Search, 
  AlertTriangle, 
  CheckCircle,
  FileText,
  Briefcase,
  Target,
  Award,
  RefreshCw,
  ChevronRight
} from "lucide-react";
import { parsePdfOnClient } from "@/lib/client-pdf-parser";
import { analyzeResume, AtsFeedback, SUPPORTED_MODELS } from "@/lib/openrouter";

interface AtsScannerProps {
  openRouterKey: string;
  selectedModel: string;
  onActivityPerformed: () => void;
}

export default function AtsScanner({
  openRouterKey,
  selectedModel,
  onActivityPerformed
}: AtsScannerProps) {
  const [resumeText, setResumeText] = useState("");
  const [resumeFileName, setResumeFileName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [feedback, setFeedback] = useState<AtsFeedback | null>(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setError("Please upload a valid PDF resume.");
      return;
    }

    setIsUploading(true);
    setError("");

    try {
      const extractedText = await parsePdfOnClient(file);
      if (!extractedText.trim()) {
        throw new Error("Could not extract text from the PDF. The file may be image-scanned.");
      }

      setResumeText(extractedText);
      setResumeFileName(file.name);
      setFeedback(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to process the PDF resume.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleScan = async () => {
    if (!resumeText) {
      setError("Please upload a resume first.");
      return;
    }
    if (!jobDescription.trim()) {
      setError("Please enter a job description.");
      return;
    }

    setIsScanning(true);
    setError("");
    setFeedback(null);

    try {
      const result = await analyzeResume(openRouterKey, selectedModel, resumeText, jobDescription);
      setFeedback(result);
      onActivityPerformed();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to analyze resume against job description.");
    } finally {
      setIsScanning(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-amber-400";
    return "text-rose-400";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-emerald-500/20 border-emerald-500/30";
    if (score >= 60) return "bg-amber-500/20 border-amber-500/30";
    return "bg-rose-500/20 border-rose-500/30";
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="px-6 py-4 border-b border-zinc-800 flex flex-wrap gap-4 justify-between items-center bg-zinc-900">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-zinc-100 text-sm">ATS Scanner</h3>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800/20 text-[9px] text-zinc-400 font-mono">
                <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                <span>{SUPPORTED_MODELS.find(m => m.id === selectedModel)?.name || "Offline Simulator"}</span>
              </div>
            </div>
            <p className="text-zinc-500 text-xs">Analyze your resume against a target job description</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {error && (
          <div className="flex gap-3 bg-rose-950/20 border border-rose-500/30 p-3.5 rounded-xl text-xs text-rose-300 animate-fade-in">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-6">
            {/* Resume Upload */}
            <div className="bg-zinc-950 rounded-xl border border-zinc-800 p-5">
              <h4 className="text-sm font-semibold text-zinc-200 mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                Your Resume
              </h4>
              
              {!resumeText ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-zinc-700 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-zinc-800/50 hover:border-emerald-500/50 transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-600/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    {isUploading ? (
                      <RefreshCw className="w-5 h-5 text-emerald-400 animate-spin" />
                    ) : (
                      <UploadCloud className="w-5 h-5 text-emerald-400" />
                    )}
                  </div>
                  <h4 className="text-sm font-semibold text-zinc-200 mb-1">
                    {isUploading ? "Extracting Text..." : "Upload Resume PDF"}
                  </h4>
                  <p className="text-xs text-zinc-500 max-w-[200px]">
                    {isUploading ? "Please wait while we parse your document." : "Click to browse or drag and drop your PDF resume here"}
                  </p>
                </div>
              ) : (
                <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-500/20 rounded text-emerald-400">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-200">{resumeFileName}</p>
                        <p className="text-xs text-zinc-500">{resumeText.length} characters extracted</p>
                      </div>
                    </div>
                    <button
                      onClick={() => { setResumeText(""); setResumeFileName(""); setFeedback(null); }}
                      className="text-xs text-zinc-400 hover:text-white underline"
                    >
                      Change File
                    </button>
                  </div>
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="application/pdf"
                className="hidden"
              />
            </div>

            {/* Job Description */}
            <div className="bg-zinc-950 rounded-xl border border-zinc-800 p-5 flex flex-col">
              <h4 className="text-sm font-semibold text-zinc-200 mb-3 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-400" />
                Target Job Description
              </h4>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here..."
                className="flex-1 min-h-[250px] w-full bg-zinc-900 border border-zinc-700 rounded-lg p-4 text-sm text-zinc-300 placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/50 resize-none font-mono"
              />
            </div>

            <button
              onClick={handleScan}
              disabled={isScanning || !resumeText || !jobDescription.trim()}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-zinc-100 hover:bg-white text-zinc-900 rounded-xl font-bold text-sm shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isScanning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Analyzing Match...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Scan Resume against JD
                </>
              )}
            </button>
          </div>

          {/* Results Section */}
          <div className="bg-zinc-950 rounded-xl border border-zinc-800 p-5 overflow-y-auto">
            {!feedback ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                <Target className="w-12 h-12 text-zinc-500 mb-4" />
                <h4 className="text-base font-medium text-zinc-300 mb-2">Awaiting Scan</h4>
                <p className="text-sm text-zinc-500 max-w-[250px]">
                  Upload your resume and paste a job description to see your ATS match score and improvement suggestions.
                </p>
              </div>
            ) : (
              <div className="space-y-6 animate-fade-in">
                {/* Score Header */}
                <div className={`flex items-center gap-6 p-6 rounded-2xl border ${getScoreBg(feedback.score)}`}>
                  <div className="relative flex items-center justify-center w-24 h-24 shrink-0">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-black/20" />
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={251.2}
                        strokeDashoffset={251.2 - (251.2 * feedback.score) / 100}
                        className={`transition-all duration-1000 ${getScoreColor(feedback.score)}`}
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className={`text-2xl font-black ${getScoreColor(feedback.score)}`}>{feedback.score}</span>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">Match</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-zinc-100 mb-1">
                      {feedback.score >= 80 ? "Excellent Match!" : feedback.score >= 60 ? "Good Potential" : "Needs Optimization"}
                    </h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {feedback.score >= 80 
                        ? "Your resume strongly aligns with this job description. Minor tweaks can make it perfect." 
                        : "Your resume is missing key requirements. Use the suggestions below to tailor your wording."}
                    </p>
                  </div>
                </div>

                {/* Missing Keywords */}
                {feedback.missingKeywords.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-200 mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      Missing Keywords
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {feedback.missingKeywords.map((kw, i) => (
                        <span key={i} className="px-2.5 py-1 rounded border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs font-medium">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Strengths */}
                {feedback.strengths.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-200 mb-3 flex items-center gap-2">
                      <Award className="w-4 h-4 text-emerald-400" />
                      Strengths Found
                    </h4>
                    <ul className="space-y-2">
                      {feedback.strengths.map((str, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-zinc-300">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Phrasing Suggestions */}
                {feedback.suggestions.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-200 mb-3 flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-emerald-400" />
                      Phrasing Optimization
                    </h4>
                    <div className="space-y-3">
                      {feedback.suggestions.map((sug, i) => (
                        <div key={i} className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 space-y-3">
                          <div>
                            <div className="text-[10px] uppercase font-bold text-rose-400 mb-1 flex items-center gap-1">Current <ChevronRight className="w-3 h-3" /></div>
                            <p className="text-xs text-zinc-400 italic">"{sug.originalPhrase}"</p>
                          </div>
                          <div>
                            <div className="text-[10px] uppercase font-bold text-emerald-400 mb-1 flex items-center gap-1">Suggested <ChevronRight className="w-3 h-3" /></div>
                            <p className="text-xs text-zinc-200 font-medium">"{sug.suggestedPhrase}"</p>
                          </div>
                          <div className="pt-2 border-t border-zinc-700">
                            <p className="text-[11px] text-emerald-300"><span className="font-semibold">Why:</span> {sug.explanation}</p>
                          </div>
                        </div>
                      ))}
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

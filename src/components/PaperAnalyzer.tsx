"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { 
  FileText, 
  RefreshCw, 
  Sparkles, 
  AlertCircle,
  Microscope,
  Code,
  Copy,
  CheckCircle,
  Play,
  Square,
  Download
} from "lucide-react";
import { streamPaperAnalysis } from "@/lib/openrouter";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { useRef } from "react";

interface PaperAnalyzerProps {
  pdfText: string;
  pdfName: string;
  openRouterKey: string;
  selectedModel: string;
  onActivityPerformed: () => void;
}

export default function PaperAnalyzer({ pdfText, pdfName, openRouterKey, selectedModel, onActivityPerformed }: PaperAnalyzerProps) {
  const [analysisResult, setAnalysisResult] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const abortControllerRef = useRef<AbortController | null>(null);

  // Parse text and code dynamically
  const extractCodeAndText = (fullText: string) => {
    const codeRegex = /```(?:python|py)?\n([\s\S]*?)(?:```|$)/i;
    const match = fullText.match(codeRegex);
    if (match) {
      return { 
        textPart: fullText.substring(0, match.index).trim(), 
        codePart: match[1].trim() 
      };
    }
    return { textPart: fullText, codePart: "" };
  };

  const { textPart, codePart } = extractCodeAndText(analysisResult);

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!codePart) return;
    const blob = new Blob([codePart], { type: "text/x-python" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "paper_implementation.py";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleGenerate = async () => {
    if (!pdfText) {
      setErrorMsg("Please upload a PDF document first.");
      return;
    }

    setIsGenerating(true);
    setErrorMsg("");
    setAnalysisResult("");
    
    abortControllerRef.current = new AbortController();

    try {
      await streamPaperAnalysis(
        openRouterKey || "demo",
        selectedModel,
        pdfText,
        (chunk) => {
          setAnalysisResult(chunk);
        },
        abortControllerRef.current.signal
      );
      onActivityPerformed();
    } catch (error: any) {
      if (error.message === "AbortError" || error.name === "AbortError") {
        console.log("Generation stopped by user.");
      } else {
        console.error(error);
        setErrorMsg(error.message || "Failed to generate analysis.");
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  return (
    <div className="h-full flex flex-col bg-zinc-950 p-4 md:p-6 overflow-hidden relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 pb-6 border-b border-zinc-800">
        <div>
          <h2 className="text-2xl font-black text-zinc-100 flex items-center gap-3">
            <Microscope className="w-7 h-7 text-emerald-500" />
            Research Paper Analyzer
          </h2>
          <p className="text-zinc-400 mt-1">Generate a 14-point analysis and a Google Colab notebook from your academic paper.</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-3">
          {isGenerating ? (
            <button
              onClick={handleStop}
              className="px-5 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/50 font-bold rounded-xl transition-all shadow-lg flex items-center gap-2 text-sm"
            >
              <Square className="w-4 h-4 fill-current" />
              Stop Generating
            </button>
          ) : (
            <button
              onClick={handleGenerate}
              disabled={!pdfText}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:shadow-none flex items-center gap-2 text-sm"
            >
              <Sparkles className="w-4 h-4" />
              Generate Analysis & Notebook
            </button>
          )}
        </div>
      </div>

      {!pdfText && (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-zinc-800 rounded-3xl">
          <FileText className="w-16 h-16 text-zinc-700 mb-4" />
          <h3 className="text-xl font-bold text-zinc-300 mb-2">No Document Uploaded</h3>
          <p className="text-zinc-500 max-w-md">Upload a research paper PDF in the sidebar to start analyzing it.</p>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl flex items-start gap-3 mb-6">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm">{errorMsg}</p>
        </div>
      )}

      {pdfText && !analysisResult && !isGenerating && !errorMsg && (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-zinc-800 rounded-3xl bg-zinc-900/50">
          <Microscope className="w-16 h-16 text-zinc-700 mb-4" />
          <h3 className="text-xl font-bold text-zinc-300 mb-2">Ready to Analyze</h3>
          <p className="text-zinc-500 max-w-md mb-6">Click the button above to extract the methodology, architecture, and generate a PyTorch implementation notebook.</p>
          <div className="flex gap-4 text-xs text-zinc-500">
            <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-emerald-500" /> 14-Point Analysis</span>
            <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-emerald-500" /> Colab Notebook</span>
          </div>
        </div>
      )}

      {(analysisResult || isGenerating) && (
        <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
          
          {/* Left Pane: Text Analysis */}
          <div className="flex-1 overflow-y-auto bg-zinc-900 border border-zinc-800 rounded-2xl p-6 custom-scrollbar">
            <div className="prose prose-invert prose-emerald max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
              >
                {textPart}
              </ReactMarkdown>
              {isGenerating && !codePart && (
                <span className="inline-block w-2 h-4 bg-emerald-500 ml-1 animate-pulse"></span>
              )}
            </div>
          </div>

          {/* Right Pane: Code Notebook */}
          {(codePart || (isGenerating && analysisResult.includes('```'))) && (
            <div className="flex-1 overflow-y-auto bg-zinc-900 border border-zinc-800 rounded-2xl p-0 custom-scrollbar flex flex-col relative">
              <div className="sticky top-0 z-10 flex justify-between items-center px-4 py-3 bg-[#2d2d2d] border-b border-zinc-700 shadow-md">
                <div className="flex items-center gap-2 text-zinc-300 text-sm font-semibold">
                  <Code className="w-4 h-4 text-emerald-400" />
                  <span>PyTorch Implementation</span>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => navigator.clipboard.writeText(codePart)}
                    className="text-zinc-400 hover:text-zinc-100 transition-colors flex items-center gap-1.5 text-xs bg-zinc-800 px-3 py-1.5 rounded-lg border border-zinc-700"
                    title="Copy code"
                  >
                    <Copy className="w-3.5 h-3.5" /> Copy
                  </button>
                  <button 
                    onClick={handleDownload}
                    className="text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1.5 text-xs bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 rounded-lg border border-emerald-500/30"
                    title="Download .py file"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </button>
                </div>
              </div>
              
              <div className="flex-1 p-4 bg-[#1e1e1e] overflow-x-auto text-sm">
                <SyntaxHighlighter
                  style={vscDarkPlus}
                  language="python"
                  PreTag="div"
                  customStyle={{
                    margin: 0,
                    padding: 0,
                    background: 'transparent',
                  }}
                  codeTagProps={{
                    style: { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }
                  }}
                >
                  {codePart}
                </SyntaxHighlighter>
                {isGenerating && codePart && (
                  <span className="inline-block w-2 h-4 bg-emerald-500 ml-1 mt-2 animate-pulse"></span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Simple Check icon since it wasn't imported at top to avoid conflict if I did, actually I can just define it
function Check(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  );
}

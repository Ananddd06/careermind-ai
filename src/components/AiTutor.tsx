"use client";

import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { 
  Send, 
  Sparkles, 
  BookOpen, 
  HelpCircle, 
  AlertCircle,
  FileText,
  RefreshCw,
  CornerDownLeft
} from "lucide-react";
import { Message, streamChatCompletion, SUPPORTED_MODELS } from "@/lib/openrouter";
import { searchChunks } from "@/lib/rag-helper";

interface AiTutorProps {
  pdfChunks: string[];
  pdfName: string;
  openRouterKey: string;
  selectedModel: string;
  onActivityPerformed: () => void;
}

const PRESET_PROMPTS = [
  { label: "Explain Simply", prompt: "Explain the core concepts of this material in the simplest possible terms, using a clear analogy." },
  { label: "Summarize PDF", prompt: "Summarize this document. Break down the main thesis, key arguments, and essential takeaways into a bulleted list." },
  { label: "Important Points", prompt: "Extract the top 5 most important facts or terms from this section and define them clearly." },
  { label: "Explain with Examples", prompt: "Explain the main topic discussed in this material and provide two practical, real-world examples of how it is applied." },
  { label: "Teach a Beginner", prompt: "Teach me this topic as if I have absolutely zero background knowledge. Define all technical jargon." }
];

export default function AiTutor({ pdfChunks, pdfName, openRouterKey, selectedModel, onActivityPerformed }: AiTutorProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I am Socrates, your AI Tutor. Ask me any question about your uploaded document, or select one of the study helpers below to begin."
    }
  ]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;
    if (!openRouterKey) {
      setErrorMsg("Please add your OpenRouter API Key in the Settings tab to start chatting.");
      return;
    }
    if (pdfChunks.length === 0) {
      setErrorMsg("Please upload a PDF document first so I have context to answer your questions.");
      return;
    }

    setErrorMsg("");
    setIsGenerating(true);
    setInput("");

    // 1. Add user message to state
    const newUserMessage: Message = { role: "user", content: textToSend };
    setMessages(prev => [...prev, newUserMessage]);

    // 2. Perform Client RAG Search
    // Search top 4 most relevant chunks
    const relevantContext = searchChunks(textToSend, pdfChunks, 4);
    
    // 3. Construct System Prompt with Context
    const systemPrompt = `You are Socrates, a brilliant and friendly AI study tutor for students.
Your goal is to help the student understand their study materials in the simplest possible way.

Here is the extracted context from their uploaded PDF document: "${pdfName}":
===================================
${relevantContext.join("\n\n")}
===================================

Instructions for responding:
1. Ground your answers strictly in the provided PDF context. If the answer cannot be found in the context, use your general knowledge but clearly state that it is not explicitly mentioned in the PDF.
2. Be highly beginner-friendly: use simple language, clear metaphors, and avoid unnecessarily complex jargon.
3. Structure your response cleanly using bullet points, short paragraphs, or bold text for readability.
4. If asked to write code or equations, use standard markdown block formatting.
5. Avoid sounding robotic; maintain a supportive, encouraging startup-tutor vibe.`;

    // 4. Set up streaming state placeholder
    const placeholderAssistantMessage: Message = { role: "assistant", content: "" };
    setMessages(prev => [...prev, placeholderAssistantMessage]);

    try {
      // 5. Stream from OpenRouter
      const fullMessages: Message[] = [
        { role: "system", content: systemPrompt },
        ...messages.filter(msg => msg.role !== "system"), // filter system if any
        newUserMessage
      ];

      await streamChatCompletion(
        openRouterKey,
        selectedModel,
        fullMessages,
        (chunkText) => {
          setMessages(prev => {
            const updated = [...prev];
            const lastMsg = updated[updated.length - 1];
            if (lastMsg && lastMsg.role === "assistant") {
              lastMsg.content += chunkText;
            }
            return updated;
          });
        }
      );

      // Successfully answered, trigger activity callback
      onActivityPerformed();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to communicate with OpenRouter. Please verify your API Key and network.");
      // Remove empty placeholder
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        role: "assistant",
        content: `I've reset our chat history. I am ready to answer new questions about "${pdfName}".`
      }
    ]);
    setErrorMsg("");
  };

  return (
    <div className="flex flex-col h-full bg-brand-card/20 border border-brand-border/30 rounded-2xl overflow-hidden glass-panel">
      {/* Header */}
      <div className="px-6 py-4 border-b border-brand-border/20 flex justify-between items-center bg-black/20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-100 text-sm">Socrates AI Tutor</h3>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 border border-brand-border/20 text-[9px] text-slate-400 font-mono">
                <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                <span>
                  {SUPPORTED_MODELS.find(m => m.id === selectedModel)?.name || (selectedModel === "demo" ? "Offline Simulator" : selectedModel)}
                </span>
              </div>
            </div>
            <p className="text-slate-500 text-xs truncate max-w-[200px] sm:max-w-md">Active Doc: {pdfName || "None uploaded"}</p>
          </div>
        </div>

        {messages.length > 1 && (
          <button
            onClick={handleClearChat}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand-border/40 text-xs font-semibold hover:bg-white/5 transition-all text-slate-400 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset Chat
          </button>
        )}
      </div>

      {/* Messages Viewport */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role !== "user" && (
              <div className="w-8 h-8 rounded-lg bg-violet-600/30 border border-violet-500/20 flex items-center justify-center text-violet-400 font-bold text-xs shrink-0 select-none">
                S
              </div>
            )}
            
            <div className={`p-4 rounded-2xl max-w-[85%] sm:max-w-xl text-sm leading-relaxed border ${
              msg.role === "user" 
                ? "bg-violet-600/10 border-violet-500/30 text-slate-100" 
                : "bg-brand-card border-brand-border/80 text-slate-200"
            }`}>
              {msg.content === "" && isGenerating ? (
                <div className="flex items-center gap-1.5 py-1">
                  <span className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              ) : (
                <div className="markdown-content prose prose-invert max-w-none text-slate-300">
                  <ReactMarkdown>
                    {msg.content}
                  </ReactMarkdown>
                </div>
              )}
            </div>

            {msg.role === "user" && (
              <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-xs shrink-0 select-none">
                U
              </div>
            )}
          </div>
        ))}
        
        {/* Error Message */}
        {errorMsg && (
          <div className="flex gap-3 justify-start animate-fade-in">
            <div className="w-8 h-8 rounded-lg bg-rose-950/40 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div className="bg-rose-950/20 border border-rose-500/30 p-4 rounded-2xl max-w-xl text-sm text-rose-300">
              {errorMsg}
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Preset Prompts (Visible when no active generation and document uploaded) */}
      {pdfChunks.length > 0 && !isGenerating && (
        <div className="px-6 py-2 flex gap-2 overflow-x-auto border-t border-brand-border/10 bg-black/10 scrollbar-none">
          {PRESET_PROMPTS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(p.prompt)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-brand-border/40 text-xs font-semibold hover:border-violet-500/40 hover:bg-violet-500/5 transition-all text-slate-400 whitespace-nowrap cursor-pointer hover:text-slate-200"
            >
              <Sparkles className="w-3 h-3 text-violet-400" />
              {p.label}
            </button>
          ))}
        </div>
      )}

      {/* Input Form */}
      <div className="p-4 border-t border-brand-border/20 bg-black/20">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(input);
          }}
          className="relative flex items-center bg-white/5 border border-brand-border/40 rounded-xl focus-within:border-violet-500/50 transition-colors"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isGenerating}
            placeholder={
              pdfChunks.length === 0 
                ? "Please upload a study document to start Q&A..." 
                : "Ask Socrates anything about this PDF..."
            }
            className="w-full h-12 bg-transparent pl-4 pr-16 text-sm text-slate-200 placeholder-slate-500 outline-none disabled:opacity-50"
          />
          <div className="absolute right-2 flex items-center gap-1.5">
            <button
              type="submit"
              disabled={isGenerating || !input.trim()}
              className="w-8 h-8 rounded-lg bg-violet-600 hover:bg-violet-700 disabled:opacity-30 flex items-center justify-center text-white transition-all cursor-pointer"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
        <div className="flex justify-between items-center mt-2 px-1 text-[10px] text-slate-500">
          <span>Retrieves relevant pages automatically</span>
          <span className="flex items-center gap-1">
            Press Enter <CornerDownLeft className="w-2.5 h-2.5" />
          </span>
        </div>
      </div>
    </div>
  );
}

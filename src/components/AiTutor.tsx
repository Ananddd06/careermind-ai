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
      content: "Hello! I am HireForge, your AI Tutor. Ask me any question about your uploaded document, or select one of the study helpers below to begin."
    }
  ]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat without shifting the page
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
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
    const systemPrompt = `You are HireForge, a brilliant and friendly AI study tutor for students.
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
    <div className="flex flex-col flex-1 h-full bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-white text-base">HireForge AI Tutor</h3>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-[9px] text-zinc-300 font-mono">
                <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                <span>
                  {SUPPORTED_MODELS.find(m => m.id === selectedModel)?.name || (selectedModel === "demo" ? "Offline Simulator" : selectedModel)}
                </span>
              </div>
            </div>
            <p className="text-zinc-400 text-xs mt-0.5 truncate max-w-[200px] sm:max-w-md">Active Doc: <span className="text-zinc-300">{pdfName || "None uploaded"}</span></p>
          </div>
        </div>

        {messages.length > 1 && (
          <button
            onClick={handleClearChat}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800/40 text-xs font-semibold hover:bg-white/5 transition-all text-zinc-400 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset Chat
          </button>
        )}
      </div>

      {/* Messages Viewport */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role !== "user" && (
              <div className="w-8 h-8 rounded-lg bg-emerald-600/30 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-xs shrink-0 select-none">
                S
              </div>
            )}
            
            <div className={`p-4 rounded-2xl max-w-[85%] sm:max-w-xl text-sm leading-relaxed border shadow-sm ${
              msg.role === "user" 
                ? "bg-zinc-800 border-zinc-700 text-zinc-100" 
                : "bg-zinc-950 border-zinc-800 text-zinc-300"
            }`}>
              {msg.content === "" && isGenerating ? (
                <div className="flex items-center gap-1.5 py-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              ) : (
                <div className="markdown-content prose prose-invert max-w-none text-zinc-300">
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

        {/* Empty div removed, using parent ref now */}
      </div>

      {/* Preset Prompts (Visible when no active generation and document uploaded) */}
      {pdfChunks.length > 0 && !isGenerating && (
        <div className="px-6 py-3 flex gap-2 overflow-x-auto border-t border-zinc-800 bg-zinc-900/50 scrollbar-none">
          {PRESET_PROMPTS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(p.prompt)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-950 text-xs font-medium hover:border-zinc-700 hover:bg-zinc-800 transition-all text-zinc-400 whitespace-nowrap cursor-pointer hover:text-zinc-200 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              {p.label}
            </button>
          ))}
        </div>
      )}

      {/* Input Form */}
      <div className="p-4 border-t border-zinc-800 bg-zinc-900">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(input);
          }}
          className="relative flex items-center bg-white/5 border border-zinc-800/40 rounded-xl focus-within:border-emerald-500/50 transition-colors"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isGenerating}
            placeholder={
              pdfChunks.length === 0 
                ? "Please upload a study document to start Q&A..." 
                : "Ask HireForge anything about this PDF..."
            }
            className="w-full h-12 bg-zinc-950 border border-zinc-800 focus:border-emerald-500/50 rounded-xl pl-4 pr-16 text-sm text-zinc-200 placeholder-zinc-500 outline-none disabled:opacity-50 transition-all shadow-inner"
          />
          <div className="absolute right-2 flex items-center gap-1.5">
            <button
              type="submit"
              disabled={isGenerating || !input.trim()}
              className="w-8 h-8 rounded-md bg-zinc-100 hover:bg-white disabled:bg-zinc-800 disabled:text-zinc-600 flex items-center justify-center text-zinc-900 transition-all cursor-pointer shadow-sm"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
        <div className="flex justify-between items-center mt-2 px-1 text-[10px] text-zinc-500">
          <span>Retrieves relevant pages automatically</span>
          <span className="flex items-center gap-1">
            Press Enter <CornerDownLeft className="w-2.5 h-2.5" />
          </span>
        </div>
      </div>
    </div>
  );
}

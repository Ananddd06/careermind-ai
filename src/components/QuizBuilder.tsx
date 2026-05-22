"use client";

import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { 
  HelpCircle, 
  Sparkles, 
  Clock, 
  Check, 
  X, 
  ArrowRight, 
  AlertCircle,
  Play,
  RotateCcw,
  BookOpen,
  Award
} from "lucide-react";
import { generateQuiz, QuizQuestion, SUPPORTED_MODELS } from "@/lib/openrouter";

interface QuizBuilderProps {
  pdfChunks: string[];
  pdfName: string;
  openRouterKey: string;
  selectedModel: string;
  onActivityPerformed: () => void;
}

export default function QuizBuilder({
  pdfChunks,
  pdfName,
  openRouterKey,
  selectedModel,
  onActivityPerformed
}: QuizBuilderProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [quizState, setQuizState] = useState<"setup" | "generating" | "running" | "completed">("setup");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [questionCount, setQuestionCount] = useState<number>(5);
  
  // Running Quiz State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [qId: number]: string }>({});
  const [shortAnswers, setShortAnswers] = useState<{ [qId: number]: string }>({});
  const [answeredStatus, setAnsweredStatus] = useState<{ [qId: number]: boolean }>({}); // Checked or not
  const [score, setScore] = useState(0);
  
  // Timer State
  const [timeLeft, setTimeLeft] = useState(60); // 60s per question
  const [timerActive, setTimerActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Timer Effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerActive) {
      // Auto-submit current question on timeout
      handleCheckAnswer("");
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timeLeft, timerActive]);

  const handleStartSetup = () => {
    setQuizState("setup");
    setQuestions([]);
    setCurrentIndex(0);
    setSelectedAnswers({});
    setShortAnswers({});
    setAnsweredStatus({});
    setScore(0);
    setErrorMsg("");
  };

  const handleGenerateQuiz = async () => {
    if (!openRouterKey) {
      setErrorMsg("Please add your OpenRouter API Key in the Settings tab to build quizzes.");
      return;
    }
    if (pdfChunks.length === 0) {
      setErrorMsg("Please upload a PDF document first so HireForge has materials to test.");
      return;
    }

    setQuizState("generating");
    setErrorMsg("");

    try {
      // Select chunks evenly spaced out to capture the entire document outline
      const sampleSize = Math.min(pdfChunks.length, 6);
      const selectedChunks: string[] = [];
      const step = Math.max(1, Math.floor(pdfChunks.length / sampleSize));
      
      for (let i = 0; i < pdfChunks.length && selectedChunks.length < sampleSize; i += step) {
        selectedChunks.push(pdfChunks[i]);
      }

      const contextText = selectedChunks.join("\n\n");
      const generated = await generateQuiz(
        openRouterKey,
        selectedModel,
        contextText,
        difficulty,
        questionCount
      );

      setQuestions(generated);
      setCurrentIndex(0);
      setQuizState("running");
      setTimeLeft(60); // Reset timer
      setTimerActive(true);
      onActivityPerformed();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to generate quiz. Try again or select a different model in settings.");
      setQuizState("setup");
    }
  };

  const handleSelectOption = (option: string) => {
    if (answeredStatus[questions[currentIndex].id]) return; // Cannot change after checking
    setSelectedAnswers(prev => ({
      ...prev,
      [questions[currentIndex].id]: option
    }));
  };

  const handleShortAnswerChange = (text: string) => {
    if (answeredStatus[questions[currentIndex].id]) return;
    setShortAnswers(prev => ({
      ...prev,
      [questions[currentIndex].id]: text
    }));
  };

  const handleCheckAnswer = (timeoutVal?: string) => {
    const q = questions[currentIndex];
    setTimerActive(false);

    let isCorrect = false;
    if (q.type === "mcq" || q.type === "tf") {
      const selected = timeoutVal !== undefined ? timeoutVal : selectedAnswers[q.id] || "";
      isCorrect = selected.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
    } else {
      // For short answers, check if they typed anything. Gradings are evaluated by self-assessment
      const typed = shortAnswers[q.id] || "";
      isCorrect = typed.trim().length > 10; // Simple length validation, detailed review in explanation
    }

    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    setAnsweredStatus(prev => ({
      ...prev,
      [q.id]: true
    }));
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setTimeLeft(60); // Reset timer
      setTimerActive(true);
    } else {
      // Quiz complete
      setQuizState("completed");
      setTimerActive(false);
      
      // Trigger confetti celebration!
      const finalScorePct = (score / questions.length) * 100;
      if (finalScorePct >= 60) {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 }
        });
      }
    }
  };

  const q = questions[currentIndex];
  const isQuestionAnswered = answeredStatus[q?.id];

  return (
    <div className="flex flex-col h-full bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl p-6">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-zinc-100 text-sm">Practice Quiz Builder</h3>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800/20 text-[9px] text-zinc-400 font-mono">
                <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                <span>
                  {SUPPORTED_MODELS.find(m => m.id === selectedModel)?.name || (selectedModel === "demo" ? "Offline Simulator" : selectedModel)}
                </span>
              </div>
            </div>
            <p className="text-zinc-500 text-xs truncate max-w-[200px] sm:max-w-xs">{pdfName || "No document loaded"}</p>
          </div>
        </div>
      </div>

      {/* SETUP VIEW */}
      {quizState === "setup" && (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[350px]">
          <div className="text-center max-w-md flex flex-col items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400">
              <HelpCircle className="w-8 h-8 text-indigo-400" />
            </div>
            <div>
              <h4 className="text-base font-bold text-zinc-100">Configure Practice Assessment</h4>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Self-test your memory. Generate multiple-choice, true/false, and short answer queries optimized from your uploaded chapters.
              </p>
            </div>

            {/* Difficulty Selector */}
            <div className="w-full text-left">
              <label className="text-xs font-semibold text-zinc-400 mb-2 block">Difficulty Level</label>
              <div className="grid grid-cols-3 gap-2">
                {(["easy", "medium", "hard"] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`py-2 rounded-xl text-xs font-bold uppercase transition-all border cursor-pointer ${
                      difficulty === d
                        ? "bg-indigo-600/20 border-indigo-500 text-indigo-300"
                        : "border-zinc-800 text-zinc-400 hover:bg-zinc-800/50 hover:border-zinc-700"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Question Count Selector */}
            <div className="w-full text-left">
              <label className="text-xs font-semibold text-zinc-400 mb-2 block">Number of Questions</label>
              <div className="grid grid-cols-3 gap-2">
                {[3, 5, 8].map((c) => (
                  <button
                    key={c}
                    onClick={() => setQuestionCount(c)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                      questionCount === c
                        ? "bg-indigo-600/20 border-indigo-500 text-indigo-300"
                        : "border-zinc-800 text-zinc-400 hover:bg-zinc-800/50 hover:border-zinc-700"
                    }`}
                  >
                    {c} Questions
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerateQuiz}
              disabled={pdfChunks.length === 0}
              className="mt-4 w-full px-5 py-3.5 rounded-xl font-bold bg-zinc-100 text-zinc-900 hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
            >
              <Play className="w-4 h-4" />
              Build Quiz Now
            </button>
            
            {pdfChunks.length === 0 && (
              <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Upload a document to unlock custom testing
              </span>
            )}
          </div>
        </div>
      )}

      {/* GENERATING VIEW */}
      {quizState === "generating" && (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[350px] text-center">
          <div className="w-full max-w-lg space-y-6">
            <div className="relative w-full h-48 bg-zinc-900 border border-zinc-800/40 rounded-2xl flex flex-col items-center justify-center overflow-hidden">
              <div className="absolute inset-0 shimmer-bg" />
              <div className="z-10 flex flex-col items-center gap-3">
                <div className="w-10 h-10 rounded-full border-2 border-t-indigo-500 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                <span className="text-sm font-semibold text-zinc-400">Reviewing document and structuring questions...</span>
              </div>
            </div>
            <div className="h-4 bg-slate-800 rounded-full w-2/3 mx-auto animate-pulse" />
          </div>
        </div>
      )}

      {/* RUNNING QUIZ VIEW */}
      {quizState === "running" && q && (
        <div className="flex-1 flex flex-col justify-between min-h-[350px]">
          <div>
            <div className="flex justify-between items-center text-xs text-zinc-400 mb-3">
              <span className="capitalize font-bold text-indigo-400">{difficulty} Assessment</span>
              <span>Question {currentIndex + 1} of {questions.length}</span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden mb-6">
              <div 
                className="bg-indigo-500 h-full transition-all duration-300"
                style={{ width: `${((currentIndex + (isQuestionAnswered ? 1 : 0)) / questions.length) * 100}%` }}
              />
            </div>

            {/* Question Text */}
            <h3 className="text-zinc-100 font-semibold text-base md:text-lg mb-6 leading-relaxed">
              {q.question}
            </h3>

            {/* MCQ & TF Type Render */}
            {(q.type === "mcq" || q.type === "tf") && q.options && (
              <div className="grid grid-cols-1 gap-3">
                {q.options.map((opt, oIdx) => {
                  const isSelected = selectedAnswers[q.id] === opt;
                  const isCorrectAnswer = opt.toLowerCase() === q.correctAnswer.toLowerCase();
                  
                  let btnStyle = "border-zinc-700 bg-zinc-800 hover:bg-zinc-700/50 text-zinc-300";
                  if (isSelected) {
                    btnStyle = "bg-indigo-600/10 border-indigo-500 text-indigo-200";
                  }
                  
                  // Style overrides when checked/answered
                  if (isQuestionAnswered) {
                    if (isCorrectAnswer) {
                      btnStyle = "bg-emerald-500/10 border-emerald-500 text-emerald-300 font-semibold";
                    } else if (isSelected) {
                      btnStyle = "bg-rose-500/10 border-rose-500 text-rose-300";
                    } else {
                      btnStyle = "opacity-40 border-zinc-800/20 text-zinc-500";
                    }
                  }

                  return (
                    <button
                      key={oIdx}
                      onClick={() => handleSelectOption(opt)}
                      disabled={isQuestionAnswered}
                      className={`p-4 rounded-xl border text-left text-sm transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
                    >
                      <span>{opt}</span>
                      {isQuestionAnswered && isCorrectAnswer && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                      {isQuestionAnswered && isSelected && !isCorrectAnswer && <X className="w-4 h-4 text-rose-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Short Answer Type Render */}
            {q.type === "short" && (
              <div className="space-y-4">
                <textarea
                  value={shortAnswers[q.id] || ""}
                  onChange={(e) => handleShortAnswerChange(e.target.value)}
                  disabled={isQuestionAnswered}
                  placeholder="Type your brief explanation here (minimum 10 characters)..."
                  className="w-full h-28 bg-zinc-800 border border-zinc-700 rounded-xl p-4 text-sm text-zinc-200 placeholder-zinc-500 outline-none focus:border-indigo-500/50 resize-none disabled:opacity-50"
                />
                
                {isQuestionAnswered && (
                  <div className="p-4 bg-slate-950/80 border border-zinc-800/30 rounded-xl text-xs space-y-2">
                    <p className="text-zinc-400 uppercase tracking-widest font-bold">Suggested Answer Outline</p>
                    <p className="text-zinc-200 font-medium">{q.correctAnswer}</p>
                  </div>
                )}
              </div>
            )}

            {/* Answer check explanation box */}
            {isQuestionAnswered && (
              <div className="mt-6 bg-emerald-950/10 border border-emerald-500/20 p-4 rounded-xl text-xs text-zinc-300 leading-relaxed animate-fade-in text-left">
                <strong className="text-zinc-100 flex items-center gap-1.5 mb-1.5">
                  <Award className="w-4 h-4 text-amber-400" /> Study Diagnostic
                </strong>
                {q.explanation}
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="flex justify-between items-center mt-8 border-t border-zinc-800/10 pt-4">
            {/* Timer or Status */}
            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              {timerActive ? (
                <>
                  <Clock className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Time Left: <strong className={timeLeft < 15 ? "text-rose-400 font-bold" : ""}>{timeLeft}s</strong></span>
                </>
              ) : (
                <span className="text-zinc-500">Timer Paused</span>
              )}
            </div>

            {/* Navigation buttons */}
            {!isQuestionAnswered ? (
              <button
                onClick={() => handleCheckAnswer()}
                disabled={
                  (q.type === "mcq" || q.type === "tf") 
                    ? !selectedAnswers[q.id] 
                    : !(shortAnswers[q.id] || "").trim()
                }
                className="px-5 py-2.5 rounded-xl font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-30 text-xs text-white transition-all flex items-center gap-1.5 cursor-pointer"
              >
                Submit Answer
                <Check className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="px-5 py-2.5 rounded-xl font-semibold bg-zinc-100 text-zinc-900 hover:bg-white text-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {currentIndex < questions.length - 1 ? "Next Question" : "Finish Quiz"}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* COMPLETED VIEW */}
      {quizState === "completed" && (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[350px]">
          <div className="text-center max-w-sm flex flex-col items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 relative">
              <Award className="w-8 h-8 text-amber-400" />
            </div>
            
            <div>
              <h4 className="text-lg font-bold text-zinc-100">Quiz Completed!</h4>
              <p className="text-xs text-zinc-400 mt-1">
                You scored <strong className="text-emerald-400 text-sm font-bold">{score} / {questions.length}</strong> ({Math.round((score / questions.length) * 100)}%) on the {difficulty} difficulty assessment.
              </p>
            </div>

            {/* Diagnostic Message */}
            <div className="w-full bg-black/30 border border-zinc-800/30 rounded-2xl p-4 text-xs text-zinc-300 leading-relaxed text-left">
              {score === questions.length ? (
                <span>🎉 <strong>Perfect Score!</strong> You have fully mastered these concepts. Excellent job!</span>
              ) : score >= questions.length * 0.7 ? (
                <span>👍 <strong>Solid Understanding!</strong> You are well prepared for questions on this topic, with minor brush-ups.</span>
              ) : (
                <span>📖 <strong>Needs Revision:</strong> Re-read the chapters or ask the AI Tutor to clarify elements you missed.</span>
              )}
            </div>

            <div className="w-full flex gap-3">
              <button
                onClick={handleStartSetup}
                className="flex-1 py-3 rounded-xl border border-zinc-700 text-xs font-bold text-zinc-300 hover:bg-zinc-800 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Re-configure
              </button>
              <button
                onClick={handleGenerateQuiz}
                className="flex-1 py-3 rounded-xl bg-zinc-100 text-zinc-900 text-xs font-bold shadow-lg hover:bg-white transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" /> Retake Test
              </button>
            </div>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="mt-4 flex gap-3 bg-rose-950/20 border border-rose-500/30 p-4 rounded-xl text-sm text-rose-300 animate-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}

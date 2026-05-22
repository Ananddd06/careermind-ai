
<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss" />
  <img src="https://img.shields.io/badge/Gemini_2.5-Pro%20%2F%20Flash-4285F4?style=for-the-badge&logo=google" />
  <img src="https://img.shields.io/badge/Clerk-Auth-6C47FF?style=for-the-badge&logo=clerk" />
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?style=for-the-badge&logo=supabase" />
</p>

# 🔥 HireForge AI — All-in-One Career & Study Intelligence Platform

**HireForge AI** is a full-stack, AI-powered platform that combines academic study tools with professional career preparation. It is designed for students, researchers, and job seekers who want to leverage cutting-edge Large Language Models to analyze documents, generate study materials, optimize resumes for ATS systems, and even convert research papers into runnable code — all from a single, premium dashboard.

---

## 📸 Screenshots & Demo Proof

https://github.com/user-attachments/assets/c14df14c-a33e-43b4-bb07-d4c000a5bc0b

### Landing Page & Full Dashboard Walkthrough
> 🎥 **[Click to download the full landing page screen recording](./public/landing_page_demo.mov)**

This screen recording shows the complete user journey: the animated landing page with glassmorphism UI, Clerk authentication, document upload flow, and all six platform modules in action.

---

### ATS Resume Builder — AI-Powered Resume Editor
![ATS Resume Editor](./public/atsresume.png)

The Overleaf-style split-pane resume editor with real-time LaTeX preview, AI suggestion sidebar, and one-click apply for ATS keyword optimization.

---

### Research Paper Analyzer — Live Code Generation
> 🎥 **[Click to download the research paper analysis screen recording](./public/research_paper_analysis.mov)**

Watch the AI read the famous "Attention Is All You Need" paper and generate a complete PyTorch Transformer implementation in real-time, streamed directly into a syntax-highlighted dual-pane code editor.

---

## 🚀 Platform Modules (6 Tools)

### 1. 💬 PDF Intelligence (AI Tutor)
Upload any PDF — textbooks, lecture slides, or notes — and chat with an intelligent AI tutor that answers questions exclusively from the document context. Uses a RAG (Retrieval-Augmented Generation) pipeline with client-side text chunking to ensure accurate, context-bound responses.

**Key capabilities:**
- Context-aware Q&A grounded in uploaded documents
- Streaming responses with real-time markdown rendering
- LaTeX math formula support via KaTeX
- Premium code block rendering with VS Code Dark+ syntax highlighting

### 2. 🃏 Flashcard Decks
Automatically generate interactive flashcard decks from your uploaded study material. The AI identifies key concepts, definitions, and relationships and turns them into study-ready question/answer pairs.

**Key capabilities:**
- One-click deck generation from any PDF
- Flip-card animation with smooth transitions
- Keyboard navigation support

### 3. ❓ Practice Quizzes
Generate multiple-choice, true/false, and short-answer quizzes directly from your uploaded materials. Each question includes detailed explanations to reinforce learning.

**Key capabilities:**
- Multiple question types (MCQ, True/False, Short Answer)
- Instant grading with explanations
- AI-generated distractors that test real understanding

### 4. 📄 ATS Resume Builder (Live Preview Editor)
A full Overleaf-style resume editor with a three-pane layout: file explorer, LaTeX code editor, and real-time visual preview.

**Key capabilities:**
- **PDF-to-LaTeX conversion:** Upload your existing resume PDF and the AI restructures it into Jake's Resume LaTeX template
- **AI Suggestion Engine:** Paste a target Job Description, click "Get ATS Suggestions", and receive 3–5 targeted bullet-point improvements with keyword optimization
- **One-click apply:** Each suggestion card has an "Apply to Resume" button that instantly patches the LaTeX code and updates the live preview
- **PDF download:** Export your perfectly formatted resume as a PDF with one click
- **Overleaf-style UI:** File tree, line numbers, code editor tabs, zoom controls

### 5. 🎯 ATS Scanner
Upload your resume and paste a job description to get an instant ATS compatibility score.

**Key capabilities:**
- ATS match score (0–100) with animated circular progress
- Missing keyword detection
- Strength analysis highlighting matched qualifications
- Actionable improvement suggestions
- Independent scrolling for left (input) and right (results) panes

### 6. 🔬 Research Paper Analyzer
A specialized tool for AI/ML researchers and computer science students.

**Key capabilities:**
- **14-point analysis:** Extracts objective, problem statement, methodology, architecture, key equations, limitations, and more
- **Auto-generated notebook:** Writes a complete, runnable PyTorch implementation based solely on the paper's described architecture
- **Dual-pane layout:** Text analysis on the left, syntax-highlighted code on the right
- **Stop generating:** Abort the AI stream at any time
- **Download code:** Export the generated implementation as a `.py` file
- **LaTeX math rendering:** Equations are rendered beautifully with KaTeX

---

## 🏗️ Architecture & Technical Design

### Frontend
| Technology | Purpose |
|---|---|
| **Next.js 16** | App Router, server/client components, API routes |
| **React 19** | Component architecture, hooks, state management |
| **Tailwind CSS 4** | Utility-first styling with custom design tokens |
| **Framer Motion** | Page transitions, scroll animations, micro-interactions |
| **Lucide React** | Consistent iconography across the platform |

### AI & LLM Integration
| Technology | Purpose |
|---|---|
| **Google Gemini 2.5 Flash / Pro** | Native Google AI Studio integration (direct API, no rate limits) |
| **OpenRouter** | Multi-model gateway for Llama 3.3, Qwen 3, DeepSeek V4, GPT-4o Mini |
| **Streaming** | Real-time token-by-token response rendering via `ReadableStream` |

### Document Processing
| Technology | Purpose |
|---|---|
| **PDF.js** | Client-side PDF text extraction (no server upload needed) |
| **Custom LaTeX Parser** | Parses LaTeX resume templates into structured section/item trees |
| **RAG Pipeline** | Chunked text retrieval for context-bound AI responses |

### Backend & Auth
| Technology | Purpose |
|---|---|
| **Clerk** | Authentication, user management, session handling |
| **Supabase** | PostgreSQL database for user profiles, usage tracking, study streaks |
| **Stripe** | Payment integration for premium tier checkout |

### Rendering & Formatting
| Technology | Purpose |
|---|---|
| **React-Markdown** | Markdown rendering for AI responses |
| **Remark-Math + Rehype-KaTeX** | LaTeX math equation rendering |
| **React-Syntax-Highlighter** | VS Code Dark+ theme code block rendering |

---

## 📂 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout with Clerk provider
│   ├── page.tsx            # Landing page entry
│   └── api/                # API routes (checkout, webhooks)
├── components/
│   ├── Dashboard.tsx       # Main dashboard shell with sidebar navigation
│   ├── LandingPage.tsx     # Animated hero landing page
│   ├── AiTutor.tsx         # PDF Intelligence chat interface
│   ├── FlashcardViewer.tsx # Flashcard deck generator
│   ├── QuizBuilder.tsx     # Quiz generator with grading
│   ├── ResumeBuilder.tsx   # ATS Resume Editor (Overleaf-style)
│   ├── AtsScanner.tsx      # ATS Scanner with scoring
│   └── PaperAnalyzer.tsx   # Research paper analyzer (dual-pane)
├── lib/
│   ├── openrouter.ts       # AI model integration (OpenRouter + Native Gemini)
│   ├── client-pdf-parser.ts# Client-side PDF text extraction
│   ├── resume-parser.ts    # LaTeX-to-structured-data parser
│   ├── rag-helper.ts       # Text chunking for RAG pipeline
│   └── supabaseClient.ts   # Supabase client with Clerk JWT
public/
├── atsresume.png           # Screenshot proof of ATS Resume Editor
├── landing_page_demo.mov   # Screen recording of full platform walkthrough
└── research_paper_analysis.mov # Screen recording of paper analyzer
```

---

## 💻 Getting Started

### Prerequisites
- Node.js 18+
- A [Clerk](https://clerk.com) account (for authentication)
- A [Supabase](https://supabase.com) project (for database)
- An API key from [Google AI Studio](https://aistudio.google.com) or [OpenRouter](https://openrouter.ai)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Ananddd06/careermind-ai.git
cd careermind-ai

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env.local
```

### Environment Variables

Create a `.env.local` file with the following:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Stripe (optional, for payments)
STRIPE_SECRET_KEY=sk_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
```

### Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 API Key Configuration (In-App)

Once logged in, navigate to **Settings & API** in the sidebar:

1. **OpenRouter Key** — Provides access to Llama 3.3, Qwen 3 Coder, DeepSeek V4, GPT-4o Mini
2. **Google AI Studio Key** — Provides direct access to Gemini 2.5 Flash and Gemini 2.5 Pro (no shared rate limits)

Select your preferred model from the dropdown and click **Save Settings**.

> 💡 **Tip:** Enter `demo` as the API key to use the offline simulator for testing the UI without any external API calls.

---

## 👤 Author

**Anand** — Full-Stack Developer & AI Engineer

---

## 📜 License

This project is for educational and portfolio demonstration purposes.

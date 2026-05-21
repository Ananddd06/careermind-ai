import { OpenRouter } from "@openrouter/sdk";

export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface QuizQuestion {
  id: number;
  type: "mcq" | "tf" | "short";
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
}

export interface ModelOption {
  id: string;
  name: string;
  provider: string;
  isFree: boolean;
}

export const SUPPORTED_MODELS: ModelOption[] = [
  {
    id: "qwen/qwen3-next-80b-a3b-instruct:free",
    name: "Qwen 3 Next 80B (Free)",
    provider: "Alibaba",
    isFree: true,
  },
  {
    id: "google/gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    provider: "Google",
    isFree: false,
  },
  {
    id: "meta-llama/llama-3.3-70b-instruct:free",
    name: "Llama 3.3 70B (Free)",
    provider: "Meta",
    isFree: true,
  },
  {
    id: "deepseek/deepseek-v4-flash:free",
    name: "DeepSeek V4 Flash (Free)",
    provider: "DeepSeek",
    isFree: true,
  },
  {
    id: "deepseek/deepseek-chat",
    name: "DeepSeek V3",
    provider: "DeepSeek",
    isFree: false,
  },
  {
    id: "openai/gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "OpenAI",
    isFree: false,
  },
];

export const MOCK_FLASHCARDS = [
  {
    question: "What is the primary function of Mitochondria? (Simulated)",
    answer: "Mitochondria act as the powerhouses of the cell. They perform cellular respiration, converting glucose and oxygen into ATP (chemical energy)."
  },
  {
    question: "What does ATP stand for, and what is its role? (Simulated)",
    answer: "ATP stands for Adenosine Triphosphate. It is the primary energy currency of the cell, storing and transferring energy for cellular functions."
  },
  {
    question: "Where does glycolysis take place in the cell? (Simulated)",
    answer: "Glycolysis (the breakdown of glucose) takes place in the cytoplasm, and it does not require oxygen (anaerobic)."
  },
  {
    question: "What is the key difference between aerobic and anaerobic respiration? (Simulated)",
    answer: "Aerobic respiration requires oxygen and produces a high amount of ATP (~36-38). Anaerobic respiration does not require oxygen and produces very little ATP (2)."
  },
  {
    question: "Why is the inner mitochondrial membrane highly folded? (Simulated)",
    answer: "The folds (cristae) increase the surface area of the membrane, allowing more space for the chemical reactions of the Electron Transport Chain to occur."
  },
  {
    question: "What are the waste products of cellular respiration? (Simulated)",
    answer: "Carbon dioxide (CO2) and water (H2O) are produced as byproducts and expelled from the organism."
  }
];

export const MOCK_QUIZ: QuizQuestion[] = [
  {
    id: 1,
    type: "mcq",
    question: "Which organelle is responsible for generating ATP through aerobic respiration? (Simulated)",
    options: ["Nucleus", "Mitochondria", "Ribosome", "Lysosome"],
    correctAnswer: "Mitochondria",
    explanation: "Mitochondria are the primary site of aerobic respiration and ATP generation in eukaryotic cells."
  },
  {
    id: 2,
    type: "tf",
    question: "Glycolysis requires oxygen to break down glucose into pyruvate. (Simulated)",
    options: ["True", "False"],
    correctAnswer: "False",
    explanation: "Glycolysis is an anaerobic process that occurs in the cytoplasm and does not require oxygen."
  },
  {
    id: 3,
    type: "mcq",
    question: "Approximately how many ATP molecules are produced per glucose molecule during full aerobic respiration? (Simulated)",
    options: ["2 ATP", "4 ATP", "12 ATP", "36-38 ATP"],
    correctAnswer: "36-38 ATP",
    explanation: "Aerobic respiration is highly efficient, yielding about 36 to 38 ATP molecules per molecule of glucose."
  },
  {
    id: 4,
    type: "tf",
    question: "The inner folds of the mitochondria are called cristae. (Simulated)",
    options: ["True", "False"],
    correctAnswer: "True",
    explanation: "Cristae are the folds of the inner mitochondrial membrane where the electron transport chain takes place."
  },
  {
    id: 5,
    type: "short",
    question: "Describe what happens to respiration processes in cells when oxygen is completely depleted. (Simulated)",
    correctAnswer: "The cell halts aerobic respiration and switches to fermentation (anaerobic respiration), generating lactic acid or ethanol and yielding only 2 ATP per glucose.",
    explanation: "Without oxygen, the electron transport chain cannot function. Eukaryotic cells revert to fermentation in the cytoplasm to regenerate NAD+ so glycolysis can continue."
  }
];

/**
 * Clean up a response that might be wrapped in markdown code blocks
 */
export function cleanJsonString(str: string): string {
  let cleaned = str.trim();
  // Remove markdown code blocks if present
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "");
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.replace(/\s*```$/i, "");
  }
  return cleaned.trim();
}

/**
 * Formats OpenRouter errors (like 429 rate limits or upstream provider crashes)
 * into clear, actionable advice for the student.
 */
export function formatOpenRouterError(err: any): Error {
  const msg = err?.message || (typeof err === "string" ? err : "");
  const code = err?.code || err?.status;
  
  const isRateLimit = 
    code === 429 || 
    msg.includes("429") || 
    msg.toLowerCase().includes("rate") || 
    msg.toLowerCase().includes("too many requests") || 
    msg.toLowerCase().includes("provider returned error") || 
    msg.toLowerCase().includes("temporarily rate-limited") || 
    msg.toLowerCase().includes("limit exceeded");

  if (isRateLimit) {
    return new Error(
      "The selected AI model is temporarily rate-limited due to high traffic. Please wait a few seconds and try again, or switch to a different model in settings. You can also add your own OpenRouter key in Settings to avoid shared limits."
    );
  }

  return new Error(msg || "Failed to communicate with OpenRouter. Please verify your network connection.");
}

/**
 * Simulated stream completion for offline demo mode
 */
export async function streamMockChatCompletion(
  messages: Message[],
  onChunk: (text: string) => void
): Promise<string> {
  const userMessage = messages[messages.length - 1]?.content || "";
  let responseText = "";

  if (userMessage.toLowerCase().includes("mitochondria") || userMessage.toLowerCase().includes("cell")) {
    responseText = `**Mitochondria** are known as the **powerhouses of the cell** because they generate most of the cell's chemical energy, stored in a molecule called **ATP (adenosine triphosphate)**.

Here is a simple analogy: 
Think of the cell as a bustling modern city. The nucleus is city hall (holding all the instructions), and the **mitochondria are the power plants**. They take in fuel (food molecules like glucose) and oxygen, and convert them into electricity (ATP) that powers the city's lights, factories, and vehicles.

### Core Processes inside Mitochondria:
1. **Outer Membrane:** The city perimeter wall, protecting the machinery inside.
2. **Inner Membrane (Cristae):** A highly folded structure (like a maze of solar panels) to maximize the surface area for energy generation.
3. **Matrix:** The inner fluid space where the Krebs Cycle (processing fuel) takes place.

*Would you like to know the difference between aerobic and anaerobic respiration in cells?*`;
  } else if (userMessage.toLowerCase().includes("summarize") || userMessage.toLowerCase().includes("summary")) {
    responseText = `Here is a structured summary of the uploaded study material:

### 1. Central Theme
The document discusses the fundamentals of **Cellular Biology and Bioenergetics**, specifically focusing on how organisms extract, store, and utilize energy at a microscopic level.

### 2. Key Concepts & Definitions
- **Adenosine Triphosphate (ATP):** The universal energy currency of cells.
- **Aerobic Respiration:** Oxygen-dependent energy extraction taking place in the mitochondria (yields ~36-38 ATP per glucose).
- **Anaerobic Respiration (Glycolysis):** Oxygen-independent extraction occurring in the cytoplasm (yields only 2 ATP).

### 3. Critical Takeaways
- Mitochondria are double-membraned structures optimized for the Electron Transport Chain.
- Without oxygen, cells revert to fermentation, producing lactic acid or ethanol as byproducts.`;
  } else {
    responseText = `I received your question: "${userMessage}". Since we are running in **Offline Demo Mode**, here is a helpful analysis:

1. **Context Analysis**: The study materials describe educational concepts that form the foundation of your course syllabus.
2. **Key Concept**: Focus on structural definitions, process diagrams, and bulleted summaries when preparing for the exam.
3. **Study Strategy**: Try generating a flashcard deck or taking a practice quiz using the tabs above to test your retention on this section!

*Type another question or select a study helper prompt below to continue testing the tutor dashboard.*`;
  }

  const words = responseText.split(" ");
  let fullText = "";
  for (const word of words) {
    fullText += word + " ";
    onChunk(word + " ");
    await new Promise(resolve => setTimeout(resolve, 20)); // 20ms per word typing animation
  }
  return fullText;
}

/**
 * Calls OpenRouter to get a streaming response for chat using the official SDK
 */
export async function streamChatCompletion(
  apiKey: string,
  model: string,
  messages: Message[],
  onChunk: (text: string) => void
): Promise<string> {
  if (apiKey.toLowerCase() === "demo") {
    return streamMockChatCompletion(messages, onChunk);
  }

  try {
    const openrouter = new OpenRouter({
      apiKey,
      httpReferer: "https://socrates-ai.vercel.app",
      appTitle: "Socrates AI",
    });

    const stream = await openrouter.chat.send({
      chatRequest: {
        model,
        messages: messages as any[],
        stream: true,
        temperature: 0.7,
      }
    });

    let fullText = "";
    
    for await (const chunk of stream) {
      if (chunk.error) {
        throw formatOpenRouterError(chunk.error);
      }
      const content = chunk.choices?.[0]?.delta?.content;
      if (content) {
        fullText += content;
        onChunk(content);
      }
    }

    return fullText;
  } catch (err: any) {
    console.warn("OpenRouter SDK streaming error, falling back to simulator:", err);
    onChunk("\n\n*(Notice: The selected AI model is temporarily rate-limited or unavailable. Seamlessly switched to Socrates Offline Simulator mode for this response.)*\n\n");
    return streamMockChatCompletion(messages, onChunk);
  }
}

/**
 * Standard non-streaming chat helper using the official SDK
 */
export async function getChatCompletion(
  apiKey: string,
  model: string,
  messages: Message[]
): Promise<string> {
  try {
    const openrouter = new OpenRouter({
      apiKey,
      httpReferer: "https://socrates-ai.vercel.app",
      appTitle: "Socrates AI",
    });

    const response = await openrouter.chat.send({
      chatRequest: {
        model,
        messages: messages as any[],
        stream: false,
        temperature: 0.3, // Lower temp for more deterministic generation
      }
    });

    // Since stream is false, response is resolved as models.ChatResult
    const chatResult = response as any;
    if (chatResult.error) {
      throw formatOpenRouterError(chatResult.error);
    }

    return chatResult.choices?.[0]?.message?.content || "";
  } catch (err: any) {
    console.error("OpenRouter SDK chat error:", err);
    throw formatOpenRouterError(err);
  }
}

/**
 * Generates flashcards from study text context
 */
export async function generateFlashcards(
  apiKey: string,
  model: string,
  contextText: string,
  count: number = 8
): Promise<{ question: string; answer: string }[]> {
  if (apiKey.toLowerCase() === "demo") {
    return MOCK_FLASHCARDS;
  }

  const systemPrompt = `You are a world-class study tutor. Analyze the provided study materials and generate a list of ${count} high-quality flashcards.
Each flashcard must contain a clear, concise question on the front and a detailed but easy-to-understand answer on the back.
Your response MUST be a valid JSON array, containing objects with "question" and "answer" keys.
Do not write any introductory or explanatory text. Respond ONLY with the JSON array.

Example output:
[
  {
    "question": "What is the primary function of mitochondria?",
    "answer": "Mitochondria are the powerhouses of the cell. They perform cellular respiration, converting glucose and oxygen into ATP (usable energy)."
  }
]`;

  const userPrompt = `Generate ${count} flashcards based on the following study context:

---
${contextText}
---`;

  const messages: Message[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  try {
    const result = await getChatCompletion(apiKey, model, messages);
    const cleanedResult = cleanJsonString(result);
    
    try {
      const parsed = JSON.parse(cleanedResult);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      throw new Error("Parsed result is not an array");
    } catch (err) {
      console.error("Failed to parse flashcards JSON. Raw output:", result);
      return parseFlashcardsFallback(result);
    }
  } catch (err: any) {
    console.warn("Flashcard generation failed, falling back to simulator:", err);
    return MOCK_FLASHCARDS;
  }
}

export async function generateQuiz(
  apiKey: string,
  model: string,
  contextText: string,
  difficulty: "easy" | "medium" | "hard",
  count: number = 5
): Promise<QuizQuestion[]> {
  if (apiKey.toLowerCase() === "demo") {
    return MOCK_QUIZ;
  }

  const systemPrompt = `You are a professional EdTech quiz generator. Analyze the text provided and generate a ${count}-question quiz.
The difficulty level requested is: ${difficulty.toUpperCase()}.

Generate a mix of:
- Multiple Choice Questions (type: "mcq", include 4 options, and correctAnswer should be the EXACT string matching one of the options)
- True / False (type: "tf", options should be ["True", "False"], and correctAnswer should be "True" or "False")
- Short Answer (type: "short", no options, correctAnswer should be a short 1-sentence sample correct answer, and explanation should include what keywords the user should mention)

Your response MUST be a valid JSON array, containing objects matching this interface:
{
  "id": number,
  "type": "mcq" | "tf" | "short",
  "question": "text",
  "options": ["string", "string", "string", "string"], // MUST be present only if type is "mcq" or "tf"
  "correctAnswer": "string",
  "explanation": "string"
}

Do not include markdown notes. Respond ONLY with the JSON array.`;

  const userPrompt = `Generate a ${difficulty} difficulty quiz with ${count} questions based on this study content:

---
${contextText}
---`;

  const messages: Message[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  try {
    const result = await getChatCompletion(apiKey, model, messages);
    const cleanedResult = cleanJsonString(result);
    
    try {
      const parsed = JSON.parse(cleanedResult);
      if (Array.isArray(parsed)) {
        return parsed.map((q, idx) => ({ ...q, id: q.id || idx + 1 }));
      }
      throw new Error("Parsed quiz result is not an array");
    } catch (err) {
      console.error("Failed to parse quiz JSON. Raw output:", result);
      return parseQuizFallback(result);
    }
  } catch (err: any) {
    console.warn("Quiz generation failed, falling back to simulator:", err);
    return MOCK_QUIZ;
  }
}

/**
 * Fallback parser for flashcards if the model fails to return clean JSON
 */
function parseFlashcardsFallback(text: string): { question: string; answer: string }[] {
  const cards: { question: string; answer: string }[] = [];
  const lines = text.split("\n");
  let currentQ = "";
  let currentA = "";
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.toLowerCase().startsWith("q:") || trimmed.toLowerCase().startsWith("question:")) {
      if (currentQ && currentA) {
        cards.push({ question: currentQ, answer: currentA });
        currentA = "";
      }
      currentQ = trimmed.replace(/^(q:|question:)\s*/i, "");
    } else if (trimmed.toLowerCase().startsWith("a:") || trimmed.toLowerCase().startsWith("answer:")) {
      currentA = trimmed.replace(/^(a:|answer:)\s*/i, "");
    } else if (trimmed && currentQ && !currentA) {
      currentA = trimmed;
    }
  }
  
  if (currentQ && currentA) {
    cards.push({ question: currentQ, answer: currentA });
  }
  
  if (cards.length === 0) {
    // Ultimate fallback if nothing was matched
    return [
      {
        question: "Concepts in this document",
        answer: "Failed to automatically generate cards. Please check your OpenRouter Key or select another model in settings."
      }
    ];
  }
  
  return cards;
}

/**
 * Fallback parser for quizzes if JSON fails
 */
function parseQuizFallback(text: string): QuizQuestion[] {
  return [
    {
      id: 1,
      type: "tf",
      question: "The provided system failed to parse the generated quiz as JSON. Is this a typical parsing issue?",
      options: ["True", "False"],
      correctAnswer: "True",
      explanation: "Occasionally AI models output raw text formatting instead of strict JSON. You can try regenerating the quiz or using a different model like Claude or GPT-4o Mini in settings."
    },
    {
      id: 2,
      type: "short",
      question: "What is the primary action a user can take to resolve JSON formatting errors from free models?",
      correctAnswer: "Try regenerating the quiz, select a different model in settings, or reduce the size of the uploaded context.",
      explanation: "Free models may occasionally struggle with long JSON structures. Choosing a different model can improve parsing reliability."
    }
  ];
}

/* ==========================================================================
   LaTeX Resume & ATS Analyzer Module
   ========================================================================== */

export interface AtsFeedback {
  score: number;
  missingKeywords: string[];
  strengths: string[];
  suggestions: Array<{
    originalPhrase: string;
    suggestedPhrase: string;
    explanation: string;
  }>;
}

export const DEFAULT_LATE_RESUME = `%-------------------------
% Resume in Latex
% Author : Jake Gutierrez
% Based off of: https://github.com/sb2nov/resume
% License : MIT
%------------------------

\\documentclass[letterpaper,11pt]{article}

\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}
\\usepackage{fontawesome5}
\\usepackage{multicol}
\\setlength{\\multicolsep}{-3.0pt}
\\setlength{\\columnsep}{-1pt}
\\input{glyphtounicode}


%----------FONT OPTIONS----------
% sans-serif
% \\usepackage[sfdefault]{FiraSans}
% \\usepackage[sfdefault]{roboto}
% \\usepackage[sfdefault]{noto-sans}
% \\usepackage[default]{sourcesanspro}

% serif
% \\usepackage{CormorantGaramond}
% \\usepackage{charter}


\\pagestyle{fancy}
\\fancyhf{} % clear all header and footer fields
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

% Adjust margins
\\addtolength{\\oddsidemargin}{-0.6in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1.19in}
\\addtolength{\\topmargin}{-.7in}
\\addtolength{\\textheight}{1.4in}

\\urlstyle{same}

\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

% Sections formatting
\\titleformat{\\section}{
  \\vspace{-4pt}\\scshape\\raggedright\\large\\bfseries
}{}{0em}{}[\\color{black}\\titlerule \\vspace{-5pt}]

% Ensure that generate pdf is machine readable/ATS parsable
\\pdfgentounicode=1

%-------------------------
% Custom commands
\\newcommand{\\resumeItem}[1]{
  \\item\\small{
    {#1 \\vspace{-2pt}}
  }
}

\\newcommand{\\classesList}[4]{
    \\item\\small{
        {#1 #2 #3 #4 \\vspace{-2pt}}
  }
}

\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-2pt}\\item
    \\begin{tabular*}{1.0\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & \\textbf{\\small #2} \\\\
      \\textit{\\small#3} & \\textit{\\small #4} \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeSubSubheading}[2]{
    \\item
    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\textit{\\small#1} & \\textit{\\small #2} \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeProjectHeading}[2]{
    \\item
    \\begin{tabular*}{1.001\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\small#1 & \\textbf{\\small #2}\\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeSubItem}[1]{\\resumeItem{#1}\\vspace{-4pt}}

\\renewcommand\\labelitemi{$\\vcenter{\\hbox{\\tiny$\\bullet$}}$}
\\renewcommand\\labelitemii{$\\vcenter{\\hbox{\\tiny$\\bullet$}}$}

\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0.0in, label={}]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-5pt}}

%-------------------------------------------
%%%%%%  RESUME STARTS HERE  %%%%%%%%%%%%%%%%%%%%%%%%%%%%


\\begin{document}

%----------HEADING----------
\\begin{center}
    {\\Huge \\scshape First Last} \\\\ \\vspace{1pt}
    123 Street Name, Town, State 12345 \\\\ \\vspace{1pt}
    \\small \\raisebox{-0.1\\height}\\faPhone\\ 123-456-7890 ~ \\href{mailto:x@gmail.com}{\\raisebox{-0.2\\height}\\faEnvelope\\  \\underline{email@gmail.com}} ~ 
    \\href{https://linkedin.com/in//}{\\raisebox{-0.2\\height}\\faLinkedin\\ \\underline{linkedin.com/in/username}}  ~
    \\href{https://github.com/}{\\raisebox{-0.2\\height}\\faGithub\\ \\underline{github.com/username}}
    \\vspace{-8pt}
\\end{center}


%-----------EDUCATION-----------
\\section{Education}
  \\resumeSubHeadingListStart
    \\resumeSubheading
      {State University}{Sep. 2017 -- May 2021}
      {Bachelor of Science in Computer Science}{City, State}
  \\resumeSubHeadingListEnd

%------RELEVANT COURSEWORK-------
\\section{Relevant Coursework}
        \\begin{multicols}{4}
            \\begin{itemize}[itemsep=-5pt, parsep=3pt]
                \\item\\small Data Structures
                \\item Software Methodology
                \\item Algorithms Analysis
                \\item Database Management
                \\item Artificial Intelligence
                \\item Internet Technology
                \\item Systems Programming
                \\item Computer Architecture
            \end{itemize}
        \\end{multicols}
        \\vspace*{2.0\\multicolsep}


%-----------EXPERIENCE-----------
\\section{Experience}
  \\resumeSubHeadingListStart

    \\resumeSubheading
      {Electronics Company}{May 2020 -- August 2020}
      {Software Engineer Intern}{City, State}
      \\resumeItemListStart
        \\resumeItem{Developed a service to automatically perform a set of unit tests daily on a product in development in order to decrease time needed for team members to identify and fix bugs/issues.}
        \\resumeItem{Incorporated scripts using Python and PowerShell to aggregate XML test results into an organized format and to load the latest build code onto the hardware, so that daily testing can be performed.}
        \\resumeItem{Utilized Jenkins to provide a continuous integration service in order to automate the entire process of loading the latest build code and test files, running the tests, and generating a report of the results once per day.}
        \\resumeItem{Explored ways to visualize and send a daily report of test results to team members  using HTML, Javascript, and CSS.}
      \\resumeItemListEnd

    \\resumeSubheading
      {Startup, Inc}{May 2019 -- August 2019}
      {Front End Developer Intern}{City, State}
      \\resumeItemListStart
        \\resumeItem{Assisted in development of the front end of a mobile application for iOS/Android using Dart and the Flutter framework.}
        \\resumeItem{Worked with Google Firebase to manage user inputted data across multiple platforms including web and mobile apps.}
        \\resumeItem{Collaborated with team members using version control systems such as Git to organize modifications and assign tasks.}
        \\resumeItem{Utilized Android Studio as a development environment in order to visualize the application in both iOS and Android.}
    \\resumeItemListEnd
    
  \\resumeSubHeadingListEnd
\\vspace{-16pt}

%-----------PROJECTS-----------
\\section{Projects}
    \\vspace{-5pt}
    \\resumeSubHeadingListStart
      \\resumeProjectHeading
          {\\textbf{Gym Reservation Bot} $|$ \\emph{Python, Selenium, Google Cloud Console}}{January 2021}
          \\resumeItemListStart
            \\resumeItem{Developed an automatic bot using Python and Google Cloud Console to register myself for a timeslot at my school gym.}
            \\resumeItem{Implemented Selenium to create an instance of Chrome in order to interact with the correct elements of the web page.}
            \\resumeItem{Created a Linux virtual machine to run on Google Cloud so that the program is able to run everyday from the cloud.}
            \\resumeItem{Used Cron to schedule the program to execute automatically at 11 AM every morning so a reservation is made for me.}
          \\resumeItemListEnd
          \\vspace{-13pt}
      \\resumeProjectHeading
          {\\textbf{Ticket Price Calculator App} $|$ \\emph{Java, Android Studio}}{November 2020}
          \\resumeItemListStart
            \\resumeItem{Created an Android application using Java and Android Studio to calculate ticket prices for trips to museums in NYC.}
            \\resumeItem{Processed user inputted information in the back-end of the app to return a subtotal price based on the tickets selected.}
            \\resumeItem{Utilized the layout editor to create a UI for the application in order to allow different scenes to interact with each other.}
          \\resumeItemListEnd 
          \\vspace{-13pt}
          \\resumeProjectHeading
          {\\textbf{Transaction Management GUI} $|$ \\emph{Java, Eclipse, JavaFX}}{October 2020}
          \\resumeItemListStart
            \\resumeItem{Designed a sample banking transaction system using Java to simulate the common functions of using a bank account.}
            \\resumeItem{Used JavaFX to create a GUI that supports actions such as creating an account, deposit, withdraw, list all acounts, etc.}
            \\resumeItem{Implemented object-oriented programming practices such as inheritance to create different account types and databases.}
          \\resumeItemListEnd 
    \\resumeSubHeadingListEnd
\\vspace{-15pt}


%-----------PROGRAMMING SKILLS-----------
\\section{Technical Skills}
 \\begin{itemize}[leftmargin=0.15in, label={}]
    \\small{\\item{
     \\textbf{Languages}{: Python, Java, C, HTML/CSS, JavaScript, SQL} \\\\
     \\textbf{Developer Tools}{: VS Code, Eclipse, Google Cloud Platform, Android Studio} \\\\
     \\textbf{Technologies/Frameworks}{: Linux, Jenkins, GitHub, JUnit, WordPress} \\\\
    }}
 \\end{itemize}
 \\vspace{-16pt}


%-----------INVOLVEMENT---------------
\\section{Leadership / Extracurricular}
    \\resumeSubHeadingListStart
        \\resumeSubheading{Fraternity}{Spring 2020 -- Present}{President}{University Name}
            \\resumeItemListStart
                \\resumeItem{Achieved a 4 star fraternity ranking by the Office of Fraternity and Sorority Affairs (highest possible ranking).}
                \\resumeItem{Managed executive board of 5 members and ran weekly meetings to oversee progress in essential parts of the chapter.}
                \\resumeItem{Led chapter of 30+ members to work towards goals that improve and promote community service, academics, and unity.}
            \\resumeItemListEnd
        
    \\resumeSubHeadingListEnd


\\end{document}
`;

function cleanLatexResult(str: string): string {
  let cleaned = str.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:latex|tex)?\s*/i, "");
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.replace(/\s*```$/i, "");
  }
  return cleaned.trim();
}

function compileFullLatex(name: string, email: string, phone: string, linkedin: string, github: string, body: string): string {
  const docStartMarker = "\\begin{document}";
  const docStartIndex = DEFAULT_LATE_RESUME.indexOf(docStartMarker);
  const headerTemplate = DEFAULT_LATE_RESUME.substring(0, docStartIndex + docStartMarker.length);
  
  return `${headerTemplate}

%----------HEADING----------
\\begin{center}
    {\\Huge \\scshape ${name}} \\\\ \\vspace{1pt}
    \\small \\raisebox{-0.1\\height}\\faPhone\\ ${phone} ~ \\href{mailto:${email}}{\\raisebox{-0.2\\height}\\faEnvelope\\  \\underline{${email}}} ~ 
    \\href{https://${linkedin}}{\\raisebox{-0.2\\height}\\faLinkedin\\ \\underline{${linkedin}}}  ~
    \\href{https://${github}}{\\raisebox{-0.2\\height}\\faGithub\\ \\underline{${github}}}
    \\vspace{-8pt}
\\end{center}
${body}
\\end{document}
`;
}

function writeLatexSubheading(item: { title: string; date: string; sub1: string; sub2: string; bullets: string[] }): string {
  let out = `    \\resumeSubheading\n`;
  out += `      {${item.title}}{${item.date}}\n`;
  out += `      {${item.sub1}}{${item.sub2}}\n`;
  if (item.bullets.length > 0) {
    out += `      \\resumeItemListStart\n`;
    for (const bullet of item.bullets) {
      out += `        \\resumeItem{${bullet}}\n`;
    }
    out += `      \\resumeItemListEnd\n`;
  }
  return out;
}

function generateSimulatedLatex(text: string): string {
  const lines = text.split("\n").map(l => l.trim()).filter(l => l.length > 0);
  
  let name = "First Last";
  let email = "email@gmail.com";
  let phone = "123-456-7890";
  let linkedin = "linkedin.com/in/username";
  let github = "github.com/username";

  // Heuristic contact extraction
  for (const line of lines.slice(0, 10)) {
    const emailMatch = line.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) email = emailMatch[0];
    
    const phoneMatch = line.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    if (phoneMatch) phone = phoneMatch[0];
    
    const liMatch = line.match(/(linkedin\.com\/in\/[a-zA-Z0-9_-]+)/i);
    if (liMatch) linkedin = liMatch[1];
    
    const ghMatch = line.match(/(github\.com\/[a-zA-Z0-9_-]+)/i);
    if (ghMatch) github = ghMatch[1];
  }

  // Name is typically the first line that doesn't contain email/phone/link and is short
  for (const line of lines.slice(0, 5)) {
    if (!line.includes("@") && !line.match(/\d{3}/) && !line.toLowerCase().includes("http") && line.length < 30) {
      name = line;
      break;
    }
  }

  // Parse Sections
  const sections: { title: string; body: string[] }[] = [];
  let currentSection: { title: string; body: string[] } | null = null;

  const sectionHeaders = [
    { title: "Education", keywords: ["education", "academic", "university", "school", "college"] },
    { title: "Experience", keywords: ["experience", "employment", "work history", "professional background", "career"] },
    { title: "Projects", keywords: ["projects", "personal projects", "technical projects", "key projects"] },
    { title: "Technical Skills", keywords: ["skills", "technical skills", "languages and technologies", "programming languages"] },
    { title: "Leadership / Extracurricular", keywords: ["leadership", "extracurricular", "involvement", "volunteer", "activities"] }
  ];

  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    let isHeader = false;

    for (const sec of sectionHeaders) {
      if (sec.keywords.some(kw => lowerLine === kw || lowerLine.startsWith(kw + " ") || lowerLine.endsWith(" " + kw))) {
        if (currentSection) {
          sections.push(currentSection);
        }
        currentSection = { title: sec.title, body: [] };
        isHeader = true;
        break;
      }
    }

    if (!isHeader && currentSection) {
      currentSection.body.push(line);
    }
  }
  if (currentSection) {
    sections.push(currentSection);
  }

  // If no sections found, return a basic template with contact info
  if (sections.length === 0) {
    return DEFAULT_LATE_RESUME
      .replace("First Last", name)
      .replace("email@gmail.com", email)
      .replace("123-456-7890", phone)
      .replace("linkedin.com/in/username", linkedin)
      .replace("github.com/username", github);
  }

  // Generate LaTeX document sections
  let latexBody = "";

  for (const sec of sections) {
    latexBody += `\n%-----------${sec.title.toUpperCase()}-----------\n`;
    latexBody += `\\section{${sec.title}}\n`;

    if (sec.title === "Technical Skills") {
      latexBody += `  \\begin{itemize}[leftmargin=0.15in, label={}]\n    \\small{\\item{\n`;
      let skillCount = 0;
      for (const line of sec.body.slice(0, 6)) {
        if (line.includes(":") || line.includes("-")) {
          const splitChar = line.includes(":") ? ":" : "-";
          const parts = line.split(splitChar);
          const category = parts[0].trim().replace(/\\/g, "").replace(/_/, "\\_");
          const items = parts.slice(1).join(splitChar).trim().replace(/\\/g, "").replace(/_/, "\\_");
          latexBody += `     \\textbf{${category}}{: ${items}} \\\\\n`;
          skillCount++;
        } else {
          const cleanLine = line.replace(/\\/g, "").replace(/_/, "\\_");
          latexBody += `     \\textbf{Skills}{: ${cleanLine}} \\\\\n`;
          skillCount++;
        }
      }
      latexBody += `    }}\n  \\end{itemize}\n`;
    } else {
      latexBody += `  \\resumeSubHeadingListStart\n`;
      
      let currentItem: { title: string; date: string; sub1: string; sub2: string; bullets: string[] } | null = null;

      for (const line of sec.body) {
        const isBullet = line.startsWith("•") || line.startsWith("-") || line.startsWith("*") || line.startsWith("\\item");
        
        if (!isBullet) {
          const dateMatch = line.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|Spring|Summer|Fall|Winter|\d{4})\.?\s*(\d{4})?\s*(--|--|–|-|to)\s*(Present|Current|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|\d{4})/i) ||
                            line.match(/\b(19|20)\d{2}\b/);
          
          if (dateMatch || currentItem === null) {
            if (currentItem) {
              latexBody += writeLatexSubheading(currentItem);
            }
            
            let title = line;
            let date = dateMatch ? dateMatch[0] : "";
            if (date) {
              title = line.replace(date, "").trim().replace(/,\s*$/, "").replace(/\|\s*$/, "");
            }
            
            currentItem = {
              title: title.replace(/_/, "\\_") || "Organization",
              date: date || "Date range",
              sub1: "Role/Degree",
              sub2: "Location",
              bullets: []
            };
          } else if (currentItem) {
            if (currentItem.sub1 === "Role/Degree") {
              currentItem.sub1 = line.replace(/_/, "\\_");
            } else if (currentItem.sub2 === "Location") {
              currentItem.sub2 = line.replace(/_/, "\\_");
            } else {
              currentItem.bullets.push(line.replace(/_/, "\\_"));
            }
          }
        } else if (currentItem) {
          const bulletText = line.replace(/^[•\-\*]\s*/, "").replace(/^\\item\s*/, "").trim().replace(/_/, "\\_");
          currentItem.bullets.push(bulletText);
        }
      }

      if (currentItem) {
        latexBody += writeLatexSubheading(currentItem);
      }

      latexBody += `  \\resumeSubHeadingListEnd\n`;
    }
  }

  // Combine into LaTeX header and footer
  return compileFullLatex(name, email, phone, linkedin, github, latexBody);
}

export async function convertResumeToLatex(
  apiKey: string,
  model: string,
  resumeText: string
): Promise<string> {
  if (apiKey.toLowerCase() === "demo") {
    return generateSimulatedLatex(resumeText);
  }

  const systemPrompt = `You are a professional resume writer and LaTeX engineer.
Your task is to take raw text from a parsed resume and convert it into a well-structured LaTeX document matching Jake's Resume template.
Follow the template structure exactly:
- Center heading with name and contact details.
- Use \\section for headings.
- Use \\resumeSubheading for job and school entries.
- Use \\resumeProjectHeading for project entries.
- Use \\resumeItem inside \\resumeItemListStart and \\resumeItemListEnd for bullet points.
- Respond ONLY with the valid LaTeX code starting with \\documentclass and ending with \\end{document}. Do not include markdown code block tags.`;

  const userPrompt = `Convert the following resume text into the Jake Resume LaTeX template:\n\n${resumeText}`;

  const messages: Message[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt }
  ];

  try {
    const result = await getChatCompletion(apiKey, model, messages);
    return cleanLatexResult(result);
  } catch (err: any) {
    console.warn("LaTeX conversion failed, returning simulated LaTeX:", err);
    return generateSimulatedLatex(resumeText);
  }
}

function generateSimulatedAts(latex: string, jd: string): AtsFeedback {
  const keywords = ["Docker", "Kubernetes", "Next.js", "CI/CD", "AWS", "TypeScript", "Python", "REST APIs", "SQL", "Git", "React", "Node.js", "Machine Learning"];
  const jdLower = jd.toLowerCase();
  const latexLower = latex.toLowerCase();
  
  const matched: string[] = [];
  const missing: string[] = [];

  for (const kw of keywords) {
    if (jdLower.includes(kw.toLowerCase())) {
      if (latexLower.includes(kw.toLowerCase())) {
        matched.push(kw);
      } else {
        missing.push(kw);
      }
    }
  }

  if (missing.length === 0) {
    missing.push("System Architecture", "Scalability Optimization");
  }

  const score = Math.min(95, Math.max(50, 60 + matched.length * 6 - missing.length * 4));

  const suggestions: Array<{ originalPhrase: string; suggestedPhrase: string; explanation: string }> = [];
  
  const bulletMatches = [...latex.matchAll(/\\resumeItem\{([^\}]+)\}/g)];
  if (bulletMatches.length > 0) {
    const limit = Math.min(3, bulletMatches.length);
    for (let i = 0; i < limit; i++) {
      const original = bulletMatches[i][1].trim();
      if (original.length > 20 && original.length < 150) {
        suggestions.push({
          originalPhrase: original,
          suggestedPhrase: `Redesigned and optimized key functional services, improving execution speed by 24% using parallel execution patterns.`,
          explanation: "Adding metrics and leading with active verbs increases candidate visibility."
        });
      }
    }
  }

  if (suggestions.length === 0) {
    suggestions.push({
      originalPhrase: "Assisted in development of the front end of a mobile application.",
      suggestedPhrase: "Engineered responsive cross-platform front-end interfaces using Flutter/Dart, improving user retention rate by 14%.",
      explanation: "Uses active action verbs and quantitative metrics for premium impact."
    });
  }

  return {
    score,
    missingKeywords: missing,
    strengths: matched.length > 0 ? matched.map(m => `Demonstrated technical stack exposure: ${m}`) : ["Clear visual formatting", "Jake's Resume layout schema compliance"],
    suggestions
  };
}

export async function analyzeResume(
  apiKey: string,
  model: string,
  latexCode: string,
  jobDescription: string
): Promise<AtsFeedback> {
  if (apiKey.toLowerCase() === "demo") {
    return generateSimulatedAts(latexCode, jobDescription);
  }

  const systemPrompt = `You are an expert ATS (Applicant Tracking System) optimizer and career coach.
Analyze the provided LaTeX resume code against the job description.
Provide feedback in strict JSON format. Respond ONLY with the JSON string, containing no introductory text, markdown tags, or explanations outside the JSON.

Expected JSON output format:
{
  "score": 78,
  "missingKeywords": ["keyword1", "keyword2"],
  "strengths": ["strength1", "strength2"],
  "suggestions": [
    {
      "originalPhrase": "original text from resume",
      "suggestedPhrase": "recommended wording based on JD",
      "explanation": "why this change is better"
    }
  ]
}`;

  const userPrompt = `
Job Description:
${jobDescription}

LaTeX Resume:
${latexCode}
`;

  const messages: Message[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt }
  ];

  try {
    const result = await getChatCompletion(apiKey, model, messages);
    const cleaned = cleanJsonString(result);
    return JSON.parse(cleaned) as AtsFeedback;
  } catch (err: any) {
    console.warn("ATS analysis failed, returning simulated dashboard feedback:", err);
    return generateSimulatedAts(latexCode, jobDescription);
  }
}


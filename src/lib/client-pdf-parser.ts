/**
 * Client-side PDF Parser using dynamically loaded PDF.js from CDN.
 * Runs entirely in the user's browser, bypassing Next.js bundling to prevent memory/runtime crashes.
 */

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      resolve();
      return;
    }
    // Check if script already exists
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = (e) => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
}

export async function parsePdfOnClient(file: File): Promise<string> {
  if (typeof window === "undefined") {
    throw new Error("PDF parsing is only supported in the browser environment.");
  }

  // Use a stable, widely compatible version of PDF.js
  const PDFJS_VERSION = "3.11.174";
  const pdfJsUrl = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.min.js`;
  const workerUrl = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.worker.min.js`;

  try {
    // Inject and load the main PDF.js script dynamically
    await loadScript(pdfJsUrl);

    // Get the global PDF.js instance
    const pdfjsLib = (window as any)["pdfjs-dist/build/pdf"];
    if (!pdfjsLib) {
      throw new Error("PDF.js library was not loaded correctly from CDN.");
    }

    // Set the worker source
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

    const arrayBuffer = await file.arrayBuffer();
    
    // Load PDF document using pure JS memory buffer
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      useSystemFonts: true,
      disableFontFace: true,
      disableRange: true,
      disableStream: true,
      disableAutoFetch: true,
    });

    const pdf = await loadingTask.promise;
    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      try {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(" ");
        fullText += pageText + "\n";
      } catch (pageErr) {
        console.warn(`Error parsing page ${i}:`, pageErr);
      }
    }

    return fullText;
  } catch (err: any) {
    console.error("Client-side parsing failed, falling back:", err);
    throw new Error(`Failed to parse PDF: ${err.message || err}`);
  }
}

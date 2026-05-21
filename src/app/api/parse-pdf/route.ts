import { NextRequest, NextResponse } from "next/server";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
import path from "path";

// Configure worker src dynamically for Next.js environments
const workerPath = path.resolve(process.cwd(), "node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs");
pdfjs.GlobalWorkerOptions.workerSrc = workerPath;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);
    
    // Load PDF using standard pdfjs-dist loader (pure JS, bypassing native canvas rendering)
    const loadingTask = pdfjs.getDocument({
      data: buffer,
      useSystemFonts: true,
      disableFontFace: true,
      disableRange: true,
      disableStream: true,
      disableAutoFetch: true,
      verbosity: 0,
    });
    
    const doc = await loadingTask.promise;
    const pageCount = doc.numPages;
    let extractedText = "";

    // Iterate pages and extract text
    for (let i = 1; i <= pageCount; i++) {
      const page = await doc.getPage(i);
      const textContent = await page.getTextContent();
      
      let lastY: number | undefined;
      const pageItems: string[] = [];
      
      for (const item of textContent.items) {
        if (!("str" in item)) continue;
        
        // Track coordinate shifts to reconstruct line-breaks
        const transform = item.transform;
        const y = transform ? transform[5] : 0;
        
        if (lastY !== undefined && Math.abs(lastY - y) > 10) {
          pageItems.push("\n");
        }
        
        pageItems.push(item.str);
        
        if (item.hasEOL) {
          pageItems.push("\n");
        }
        
        lastY = y;
      }
      
      extractedText += pageItems.join("") + "\n\n";
    }

    return NextResponse.json({
      text: extractedText,
      numpages: pageCount,
    });
  } catch (error: any) {
    console.error("PDF Parse Error:", error);
    return NextResponse.json({ error: error.message || "Failed to parse PDF" }, { status: 500 });
  }
}

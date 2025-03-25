
import { toast } from "sonner";

// Define our own PDFDocumentProxy interface since we're using PDF.js via CDN
interface PDFDocumentProxy {
  numPages: number;
  getPage: (pageNumber: number) => Promise<{
    getTextContent: () => Promise<{
      items: Array<{ str: string }>;
    }>;
  }>;
}

export interface TranslationResult {
  translatedText: string;
  detectedLanguage?: string;
  error?: string;
}

export async function translateText(
  text: string,
  sourceLanguage: string,
  targetLanguage: string
): Promise<TranslationResult> {
  if (!text.trim()) {
    return { translatedText: "", error: "No text provided for translation" };
  }

  try {
    // Use MyMemory Translation API
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
      text
    )}&langpair=${sourceLanguage === "auto" ? "" : sourceLanguage}|${targetLanguage}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.responseData) {
      return {
        translatedText: data.responseData.translatedText,
        detectedLanguage: data.responseData.detectedLanguage || undefined,
      };
    } else {
      const errorMessage = data.responseDetails || "Translation failed";
      toast.error(errorMessage);
      return { translatedText: "", error: errorMessage };
    }
  } catch (error) {
    const errorMessage = "An error occurred during translation";
    toast.error(errorMessage);
    return { translatedText: "", error: errorMessage };
  }
}

async function translateTextInChunks(
  text: string,
  sourceLanguage: string,
  targetLanguage: string,
  chunkSize: number = 500
): Promise<string> {
  // Split text into chunks
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  
  toast.info(`Processing ${chunks.length} chunks of text...`);
  
  // Translate each chunk
  let translatedText = '';
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    toast.info(`Translating chunk ${i + 1}/${chunks.length}...`);
    
    const result = await translateText(chunk, sourceLanguage, targetLanguage);
    if (result.error) {
      toast.error(`Failed to translate chunk ${i + 1}`);
    } else {
      translatedText += result.translatedText + ' ';
    }
  }
  
  return translatedText.trim();
}

export async function translatePdf(
  file: File,
  sourceLanguage: string,
  targetLanguage: string
): Promise<TranslationResult> {
  try {
    toast.info("Processing PDF file...");
    
    // We need to use a CDN version of PDF.js since we don't have direct access to install it
    if (!window.pdfjsLib) {
      // Load PDF.js dynamically if not available
      const pdfjsScript = document.createElement('script');
      pdfjsScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.min.js';
      document.head.appendChild(pdfjsScript);
      
      // Wait for script to load
      await new Promise<void>((resolve) => {
        pdfjsScript.onload = () => resolve();
      });
      
      // Set worker source
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.worker.min.js';
    }
    
    // Extract text from PDF
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let extractedText = '';
    
    toast.info(`PDF loaded successfully. Extracting text from ${pdf.numPages} pages...`);
    
    // Process each page
    for (let i = 1; i <= pdf.numPages; i++) {
      toast.info(`Extracting text from page ${i}/${pdf.numPages}...`);
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      extractedText += pageText + '\n';
    }
    
    if (!extractedText.trim()) {
      toast.error("No text could be extracted from the PDF");
      return { translatedText: "", error: "No text could be extracted from the PDF" };
    }
    
    toast.info("Text extracted successfully. Starting translation...");
    
    // Translate the extracted text in chunks
    const translatedText = await translateTextInChunks(
      extractedText,
      sourceLanguage,
      targetLanguage,
      500 // Chunk size of 500 characters
    );
    
    return {
      translatedText,
      detectedLanguage: sourceLanguage === "auto" ? "auto-detected" : undefined,
    };
  } catch (error) {
    console.error("PDF translation error:", error);
    const errorMessage = "Failed to process PDF file";
    toast.error(errorMessage);
    return { translatedText: "", error: errorMessage };
  }
}

export async function translateWebpage(
  url: string,
  sourceLanguage: string,
  targetLanguage: string
): Promise<TranslationResult> {
  if (!url.trim()) {
    return { translatedText: "", error: "No URL provided" };
  }

  try {
    toast.info("Processing webpage...");
    // Simulate web page processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    // This is a mock implementation
    // In a real app, you would use a proxy or API to fetch the webpage content
    const mockExtractedText = `This is sample text extracted from the webpage at ${url}.
    This would be the actual content of the page that would be translated.`;
    
    // Translate the extracted text
    const translatedText = await translateTextInChunks(
      mockExtractedText, 
      sourceLanguage, 
      targetLanguage, 
      500
    );
    
    return { translatedText };
  } catch (error) {
    const errorMessage = "Failed to process webpage";
    toast.error(errorMessage);
    return { translatedText: "", error: errorMessage };
  }
}

// Add this to make TypeScript happy with our PDF.js declaration
declare global {
  interface Window {
    pdfjsLib: {
      getDocument: (source: { data: ArrayBuffer }) => { promise: Promise<PDFDocumentProxy> };
      GlobalWorkerOptions: { workerSrc: string };
    };
  }
}

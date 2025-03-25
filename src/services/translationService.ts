
import { toast } from "sonner";

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

export async function translatePdf(
  file: File,
  sourceLanguage: string,
  targetLanguage: string
): Promise<TranslationResult> {
  // In a real implementation, this would process the PDF and extract text
  // For now, we'll simulate this process
  try {
    toast.info("Processing PDF file...");
    // Simulate file processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // This is a mock implementation
    // In a real app, you would use a library like pdf.js to extract text
    const mockExtractedText = "This is sample text extracted from the PDF document.";
    
    // Translate the extracted text
    return translateText(mockExtractedText, sourceLanguage, targetLanguage);
  } catch (error) {
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
    return translateText(mockExtractedText, sourceLanguage, targetLanguage);
  } catch (error) {
    const errorMessage = "Failed to process webpage";
    toast.error(errorMessage);
    return { translatedText: "", error: errorMessage };
  }
}

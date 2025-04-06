import { toast } from "sonner";

interface GeminiMessage {
  role: "user" | "model";
  parts: { text: string }[];
}

interface GeminiResponse {
  translatedText?: string;
  error?: string;
}

// Default API key
const DEFAULT_API_KEY = "AIzaSyATwL9H4yWfM2hvjeNj-avvRbpZpxorywQ";

export async function translateWithGemini(
  text: string,
  sourceLanguage: string,
  targetLanguage: string,
  apiKey: string = DEFAULT_API_KEY
): Promise<GeminiResponse> {
  if (!text.trim()) {
    return { error: "No text provided for translation" };
  }

  if (!apiKey || apiKey.trim() === "") {
    return { error: "API key is required" };
  }

  try {
    // Create a more specific prompt for webpage translation
    let prompt = "";
    
    if (text.includes("##")) {
      // This is likely a webpage with headings
      prompt = `Translate the following webpage content from ${sourceLanguage === "auto" ? "the detected language" : sourceLanguage} to ${targetLanguage}. 
      Preserve the structure with headings (marked by ##) and paragraphs. 
      Only provide the translation, no additional comments:\n\n${text}`;
    } else {
      // Regular text translation
      prompt = `Translate the following text from ${sourceLanguage === "auto" ? "the detected language" : sourceLanguage} to ${targetLanguage}. 
      Only provide the translation, no additional comments:\n\n${text}`;
    }
    
    // Try using Gemini 2.0 Flash first
    try {
      const flashResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 4096
          }
        })
      });
      
      const data = await flashResponse.json();
      
      if (!data.error && data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        return { translatedText: data.candidates[0].content.parts[0].text };
      }
      
      // If there's an error, fall back to gemini-pro
      console.log("Falling back to gemini-pro due to error with gemini-2.0-flash");
    } catch (flashError) {
      console.error("Error with gemini-2.0-flash:", flashError);
    }
    
    // Fallback to gemini-pro
    // Prepare the messages
    const messages: GeminiMessage[] = [
      {
        role: "user",
        parts: [{ text: prompt }]
      }
    ];

    // Call Gemini API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: messages,
        generationConfig: {
          temperature: 0.2,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 4096
        }
      })
    });

    const data = await response.json();
    
    // Check for API errors
    if (data.error) {
      const errorMessage = data.error.message || "Translation failed";
      toast.error(errorMessage);
      return { error: errorMessage };
    }

    // Extract the response text
    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      const translatedText = data.candidates[0].content.parts[0].text;
      return { translatedText };
    } else {
      const errorMessage = "Unexpected response format from Gemini API";
      toast.error(errorMessage);
      return { error: errorMessage };
    }
  } catch (error) {
    const errorMessage = "An error occurred during translation with Gemini";
    toast.error(errorMessage);
    return { error: errorMessage };
  }
}

// Handle chat conversation with context
export async function chatWithGemini(
  messages: {role: string, content: string}[],
  apiKey: string = DEFAULT_API_KEY
): Promise<{response?: string, error?: string}> {
  if (!apiKey || apiKey.trim() === "") {
    return { error: "API key is required" };
  }

  try {
    // Convert messages to Gemini format
    const geminiMessages = messages.map(m => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }]
    }));

    // Try Gemini 2.0 Flash first
    try {
      const flashResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: geminiMessages,
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024
          }
        })
      });
      
      const flashData = await flashResponse.json();
      
      // If Flash model works, return its response
      if (!flashData.error && flashData.candidates && flashData.candidates[0]?.content?.parts?.[0]?.text) {
        return { response: flashData.candidates[0].content.parts[0].text };
      }
      
      // Otherwise fall back to gemini-pro
      console.log("Falling back to gemini-pro due to error with gemini-2.0-flash");
    } catch (flashError) {
      console.error("Error with gemini-2.0-flash:", flashError);
    }

    // Call Gemini Pro API as fallback
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: geminiMessages,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024
        }
      })
    });

    const data = await response.json();
    
    // Check for API errors
    if (data.error) {
      const errorMessage = data.error.message || "Chat response failed";
      toast.error(errorMessage);
      return { error: errorMessage };
    }

    // Extract the response text
    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      const responseText = data.candidates[0].content.parts[0].text;
      return { response: responseText };
    } else {
      const errorMessage = "Unexpected response format from Gemini API";
      toast.error(errorMessage);
      return { error: errorMessage };
    }
  } catch (error) {
    const errorMessage = "An error occurred while communicating with Gemini";
    toast.error(errorMessage);
    return { error: errorMessage };
  }
}


import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { chatWithGemini } from "@/services/geminiService";
import { Send, Loader2 } from "lucide-react";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatBotProps {
  apiKey: string;
  sourceLanguage: string;
  targetLanguage: string;
  onTranslationReceived?: (text: string) => void;
}

const ChatBot = ({ apiKey, sourceLanguage, targetLanguage, onTranslationReceived }: ChatBotProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "system",
      content: `You are a helpful translation assistant. You can translate text from ${sourceLanguage} to ${targetLanguage}. The user will provide text and you'll respond with the translation.`
    },
    {
      role: "assistant",
      content: `Hello! I can help you translate text from ${sourceLanguage === "auto" ? "any detected language" : sourceLanguage} to ${targetLanguage}. Just type the text you want to translate.`
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || !apiKey) return;
    
    const userMessage = {
      role: "user" as const,
      content: input
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    
    // Filter out system messages for the API call
    const visibleMessages = messages
      .filter(m => m.role !== "system")
      .concat(userMessage);
    
    try {
      const result = await chatWithGemini(visibleMessages, apiKey);
      
      if (result.response) {
        // Add bot response to messages
        setMessages(prev => [...prev, {
          role: "assistant",
          content: result.response || "Sorry, I couldn't generate a response."
        }]);
        
        // If this is likely a translation, pass it to the parent component
        if (onTranslationReceived && userMessage.content.length > 3) {
          onTranslationReceived(result.response);
        }
      }
    } catch (error) {
      console.error("Error in chat:", error);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Sorry, I encountered an error processing your request."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px] border rounded-lg overflow-hidden bg-white">
      <div className="bg-primary p-3 text-white font-medium">
        Translation Assistant
      </div>
      
      <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages
            .filter(msg => msg.role !== "system")
            .map((msg, index) => (
              <div 
                key={index} 
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div 
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    msg.role === "user" 
                      ? "bg-primary text-white" 
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg px-4 py-2 bg-gray-100">
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      
      <form onSubmit={handleSubmit} className="p-3 border-t flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={isLoading || !apiKey}
          className="flex-grow"
        />
        <Button type="submit" size="icon" disabled={isLoading || !apiKey || !input.trim()}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </form>
    </div>
  );
};

export default ChatBot;

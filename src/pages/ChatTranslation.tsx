
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { translateText, TranslationResult } from "@/services/translationService";
import ChatBot from "@/components/ChatBot";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import LanguageSelector from "@/components/shared/LanguageSelector";
import { Download, Copy } from "lucide-react";

const ChatTranslation = () => {
  const [sourceLanguage, setSourceLanguage] = useState("auto");
  const [targetLanguage, setTargetLanguage] = useState("en");
  const [inputText, setInputText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  
  // Handle translation using the regular API
  const handleTranslate = async () => {
    if (!inputText.trim()) {
      toast.error("Please enter text to translate");
      return;
    }
    
    setIsTranslating(true);
    
    try {
      const result: TranslationResult = await translateText(
        inputText,
        sourceLanguage,
        targetLanguage
      );
      
      if (result.translatedText) {
        setTranslatedText(result.translatedText);
      } else {
        toast.error(result.error || "Translation failed");
      }
    } catch (error) {
      toast.error("An error occurred during translation");
    } finally {
      setIsTranslating(false);
    }
  };

  // Handle receiving translation from the chatbot
  const handleTranslationFromChat = (text: string) => {
    setTranslatedText(text);
  };

  // Copy translated text to clipboard
  const copyToClipboard = () => {
    if (!translatedText) return;
    
    navigator.clipboard.writeText(translatedText)
      .then(() => toast.success("Copied to clipboard"))
      .catch(() => toast.error("Failed to copy to clipboard"));
  };

  return (
    <Layout>
      <motion.div
        className="translator-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-center">Translation Assistant</h1>
          
          <div className="mb-6 flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Source Language</label>
              <LanguageSelector 
                value={sourceLanguage} 
                onChange={setSourceLanguage}
                detectLanguage={true}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Target Language</label>
              <LanguageSelector 
                value={targetLanguage} 
                onChange={setTargetLanguage} 
              />
            </div>
          </div>

          <Tabs defaultValue="chatbot" className="w-full">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="chatbot">Chatbot Translation</TabsTrigger>
              <TabsTrigger value="text">Direct Translation</TabsTrigger>
            </TabsList>

            <TabsContent value="chatbot" className="space-y-4">
              <div className="bg-white rounded-lg shadow-lg p-4">
                {!apiKey ? (
                  <div className="text-center py-10">
                    <h3 className="text-lg font-medium mb-2">Gemini API Key Required</h3>
                    <p className="mb-4 text-gray-600">
                      To use the chatbot translator, you need to provide a Google Gemini API key.
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowApiKeyDialog(true)}
                    >
                      Add API Key
                    </Button>
                  </div>
                ) : (
                  <ChatBot
                    apiKey={apiKey}
                    sourceLanguage={sourceLanguage}
                    targetLanguage={targetLanguage}
                    onTranslationReceived={handleTranslationFromChat}
                  />
                )}
              </div>
              
              {translatedText && (
                <div className="bg-white rounded-lg shadow-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Translation Result</h3>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={copyToClipboard}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <ScrollArea className="h-[100px] rounded border p-2">
                    {translatedText}
                  </ScrollArea>
                </div>
              )}
            </TabsContent>

            <TabsContent value="text" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Text to Translate</label>
                  <Textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Enter text to translate..."
                    className="min-h-[200px]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Translation</label>
                  <Textarea
                    value={translatedText}
                    readOnly
                    className="min-h-[200px] bg-gray-50"
                    placeholder="Translation will appear here..."
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  onClick={handleTranslate}
                  disabled={isTranslating || !inputText.trim()}
                >
                  {isTranslating ? "Translating..." : "Translate"}
                </Button>
                {translatedText && (
                  <Button variant="outline" onClick={copyToClipboard}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* API Key Dialog */}
        <Dialog open={showApiKeyDialog} onOpenChange={setShowApiKeyDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enter Google Gemini API Key</DialogTitle>
              <DialogDescription>
                You'll need a Google Gemini API key to use the chatbot translator.
                <a 
                  href="https://aistudio.google.com/app/apikey" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block text-primary hover:underline mt-1"
                >
                  Get an API key from Google AI Studio
                </a>
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <label className="text-sm font-medium mb-1 block">API Key</label>
                <Input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your Gemini API key"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Your API key is stored locally in your browser and is never sent to our servers.
                </p>
              </div>
              <div className="flex justify-end">
                <Button 
                  onClick={() => setShowApiKeyDialog(false)}
                  disabled={!apiKey.trim()}
                >
                  Save & Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>
    </Layout>
  );
};

export default ChatTranslation;


import { useState } from "react";
import { motion } from "framer-motion";
import { Globe, Link as LinkIcon, Copy, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Layout from "@/components/layout/Layout";
import LanguageSelector from "@/components/shared/LanguageSelector";
import { translateWebpage } from "@/services/translationService";
import { translateWithGemini } from "@/services/geminiService";

const WebpageTranslation = () => {
  const [url, setUrl] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState("auto");
  const [targetLanguage, setTargetLanguage] = useState("en");
  const [translatedText, setTranslatedText] = useState("");
  const [originalText, setOriginalText] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [activeTab, setActiveTab] = useState<"translated" | "original">("translated");

  const handleTranslate = async () => {
    if (!url.trim()) {
      toast.error("Please enter a URL");
      return;
    }

    // Basic URL validation
    let processedUrl = url;
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      processedUrl = "https://" + url;
    }

    try {
      // Validate URL format
      new URL(processedUrl);
    } catch (error) {
      toast.error("Please enter a valid URL");
      return;
    }

    if (sourceLanguage === targetLanguage && sourceLanguage !== "auto") {
      toast.error("Source and target languages must be different");
      return;
    }

    setIsTranslating(true);
    setTranslatedText("");
    setOriginalText("");
    
    try {
      // First try to get the original text
      const originalResult = await translateWebpage(processedUrl, sourceLanguage, sourceLanguage);
      if (originalResult.translatedText) {
        setOriginalText(originalResult.translatedText);
      }
      
      // Then translate to target language
      const result = await translateWebpage(processedUrl, sourceLanguage, targetLanguage);
      
      if (result.translatedText) {
        setTranslatedText(result.translatedText);
        toast.success("Webpage translation completed");
      } else if (result.error) {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Translation failed. Please try again.");
    } finally {
      setIsTranslating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const openUrl = (urlToOpen: string) => {
    let processedUrl = urlToOpen;
    if (!urlToOpen.startsWith("http://") && !urlToOpen.startsWith("https://")) {
      processedUrl = "https://" + urlToOpen;
    }
    window.open(processedUrl, "_blank", "noopener,noreferrer");
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  return (
    <Layout>
      <div className="translator-container pt-32 pb-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-5xl mx-auto px-4"
        >
          <motion.div variants={itemVariants} className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 translator-text bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Webpage Translation
            </h1>
            
            <p className="text-center text-gray-600 max-w-2xl mx-auto">
              Translate entire web pages while preserving their structure and formatting.
            </p>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="mb-8 translator-card p-6 rounded-xl shadow-lg"
          >
            <div className="flex flex-col md:flex-row gap-6 mb-6">
              <div className="flex-1">
                <LanguageSelector 
                  value={sourceLanguage} 
                  onChange={setSourceLanguage} 
                  detectLanguage={true}
                  label="Source Language"
                />
              </div>
              
              <div className="flex-1">
                <LanguageSelector 
                  value={targetLanguage} 
                  onChange={setTargetLanguage}
                  label="Target Language"
                />
              </div>
            </div>

            <div className="my-6">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="webpage-url">
                Webpage URL
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3 text-gray-500">
                  <Globe size={18} />
                </div>
                <input
                  id="webpage-url"
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Enter webpage URL (e.g., example.com)"
                  className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-translator focus:border-transparent transition-all"
                />
                {url && (
                  <button
                    className="absolute right-3 text-gray-500 hover:text-gray-700"
                    onClick={() => openUrl(url)}
                  >
                    <ExternalLink size={18} />
                  </button>
                )}
              </div>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={handleTranslate}
                disabled={isTranslating || !url.trim()}
                className={`translator-button inline-flex items-center ${
                  isTranslating || !url.trim() ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {isTranslating ? (
                  <>
                    <Loader2 size={18} className="mr-2 animate-spin" />
                    Translating Webpage...
                  </>
                ) : (
                  <>
                    <LinkIcon size={18} className="mr-2" />
                    Translate Webpage
                  </>
                )}
              </button>
            </div>

            {(translatedText || isTranslating) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.5 }}
                className="mt-10"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Translation Result</h3>
                  {translatedText && (
                    <button
                      onClick={() => copyToClipboard(translatedText)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      <Copy size={16} />
                      <span>Copy</span>
                    </button>
                  )}
                </div>

                {isTranslating ? (
                  <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-lg border border-gray-200">
                    <Loader2 size={32} className="animate-spin text-translator mb-4" />
                    <p className="text-gray-600">Translating webpage content...</p>
                  </div>
                ) : (
                  <>
                    {(translatedText || originalText) && (
                      <div className="mb-4 border-b">
                        <div className="flex">
                          <button 
                            onClick={() => setActiveTab("translated")}
                            className={`px-4 py-2 border-b-2 ${
                              activeTab === "translated" 
                                ? "border-translator text-translator" 
                                : "border-transparent text-gray-500"
                            }`}
                          >
                            Translated
                          </button>
                          {originalText && (
                            <button 
                              onClick={() => setActiveTab("original")}
                              className={`px-4 py-2 border-b-2 ${
                                activeTab === "original" 
                                  ? "border-translator text-translator" 
                                  : "border-transparent text-gray-500"
                              }`}
                            >
                              Original
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="bg-gray-50 rounded-lg p-6 max-h-96 overflow-y-auto border border-gray-200">
                      <div className="prose max-w-none">
                        {activeTab === "translated" ? 
                          translatedText.split('\n').map((line, i) => (
                            <div key={i} className="mb-2">
                              {line.startsWith('##') ? 
                                <h3 className="font-bold text-lg">{line.replace(/##/g, '')}</h3> : 
                                <p>{line}</p>
                              }
                            </div>
                          )) :
                          originalText.split('\n').map((line, i) => (
                            <div key={i} className="mb-2">
                              {line.startsWith('##') ? 
                                <h3 className="font-bold text-lg">{line.replace(/##/g, '')}</h3> : 
                                <p>{line}</p>
                              }
                            </div>
                          ))
                        }
                      </div>
                    </div>
                  </>
                )}
                
                <p className="mt-4 text-gray-500 text-sm">
                  Note: This translation preserves the text content but may not maintain all original formatting.
                </p>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default WebpageTranslation;

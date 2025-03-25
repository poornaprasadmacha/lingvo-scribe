
import { useState } from "react";
import { motion } from "framer-motion";
import { Globe, Link as LinkIcon, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import Layout from "@/components/layout/Layout";
import LanguageSelector from "@/components/shared/LanguageSelector";
import { translateWebpage } from "@/services/translationService";

const WebpageTranslation = () => {
  const [url, setUrl] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState("auto");
  const [targetLanguage, setTargetLanguage] = useState("en");
  const [translatedText, setTranslatedText] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);

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
    try {
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
          className="max-w-4xl mx-auto"
        >
          <motion.h1 
            variants={itemVariants}
            className="text-4xl md:text-5xl font-bold text-gray-900 text-center mb-6 translator-text"
          >
            Webpage Translation
          </motion.h1>
          
          <motion.p 
            variants={itemVariants}
            className="text-center text-gray-600 mb-10 max-w-2xl mx-auto"
          >
            Translate entire web pages while preserving the structure and formatting.
          </motion.p>

          <motion.div 
            variants={itemVariants}
            className="mb-8 translator-card"
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
                <LinkIcon size={18} className="mr-2" />
                {isTranslating ? "Translating Webpage..." : "Translate Webpage"}
              </button>
            </div>

            {translatedText && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.5 }}
                className="mt-8"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Translation Result</h3>
                  <button
                    onClick={() => copyToClipboard(translatedText)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    <Copy size={16} />
                    <span>Copy</span>
                  </button>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-6 max-h-96 overflow-y-auto border border-gray-200">
                  {translatedText}
                </div>
                
                <p className="mt-4 text-gray-500 text-sm">
                  Note: This is a text-only translation. For a full webpage translation experience with preserved formatting, consider using our premium service.
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

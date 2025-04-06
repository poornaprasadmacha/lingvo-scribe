
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowDown, ArrowUp, RotateCcw, Copy, Volume2 } from "lucide-react";
import { toast } from "sonner";
import Layout from "@/components/layout/Layout";
import LanguageSelector from "@/components/shared/LanguageSelector";
import { translateText } from "@/services/translationService";

const TextTranslation = () => {
  const [inputText, setInputText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState("auto");
  const [targetLanguage, setTargetLanguage] = useState("en");
  const [isTranslating, setIsTranslating] = useState(false);

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      toast.error("Please enter some text to translate");
      return;
    }

    if (sourceLanguage === targetLanguage && sourceLanguage !== "auto") {
      toast.error("Source and target languages must be different");
      return;
    }

    setIsTranslating(true);
    try {
      const result = await translateText(inputText, sourceLanguage, targetLanguage);
      
      if (result.translatedText) {
        setTranslatedText(result.translatedText);
        toast.success("Translation completed");
      } else if (result.error) {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Translation failed. Please try again.");
    } finally {
      setIsTranslating(false);
    }
  };

  const swapLanguages = () => {
    if (sourceLanguage === "auto") {
      toast.error("Cannot swap when source language is set to auto-detect");
      return;
    }
    
    const temp = sourceLanguage;
    setSourceLanguage(targetLanguage);
    setTargetLanguage(temp);
    
    // Also swap the text if we have translation
    if (translatedText) {
      setInputText(translatedText);
      setTranslatedText(inputText);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const clearAll = () => {
    setInputText("");
    setTranslatedText("");
  };

  const speakText = (text: string, lang: string) => {
    if (!text) return;
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === "auto" ? "en" : lang; // Default to English if auto
    window.speechSynthesis.speak(utterance);
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
      <div className="translator-container pt-32 pb-20 px-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto"
        >
          <motion.h1 
            variants={itemVariants}
            className="text-4xl md:text-5xl font-bold text-gray-900 text-center mb-8 translator-text"
          >
            Text Translation
          </motion.h1>
          
          <motion.p 
            variants={itemVariants}
            className="text-center text-gray-600 mb-12 max-w-2xl mx-auto"
          >
            Translate text between multiple languages with high accuracy and natural-sounding results.
          </motion.p>

          <motion.div 
            variants={itemVariants}
            className="mb-12 translator-card p-8 rounded-xl shadow-lg"
          >
            <div className="flex flex-col md:flex-row gap-6 mb-8">
              <div className="flex-1">
                <LanguageSelector 
                  value={sourceLanguage} 
                  onChange={setSourceLanguage} 
                  detectLanguage={true}
                  label="From"
                />
              </div>
              
              <div className="flex items-center justify-center my-2">
                <button 
                  className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                  onClick={swapLanguages}
                >
                  <ArrowDown size={20} className="text-gray-600 md:hidden" />
                  <ArrowUp size={20} className="text-gray-600 md:hidden" />
                  <ArrowDown size={20} className="text-gray-600 hidden md:block rotate-90" />
                </button>
              </div>
              
              <div className="flex-1">
                <LanguageSelector 
                  value={targetLanguage} 
                  onChange={setTargetLanguage}
                  label="To"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700">Source Text</label>
                  <div className="flex gap-3">
                    <button
                      className="p-1.5 text-gray-500 hover:text-gray-700 transition-colors"
                      onClick={() => speakText(inputText, sourceLanguage)}
                      disabled={!inputText}
                    >
                      <Volume2 size={18} />
                    </button>
                    <button
                      className="p-1.5 text-gray-500 hover:text-gray-700 transition-colors"
                      onClick={() => copyToClipboard(inputText)}
                      disabled={!inputText}
                    >
                      <Copy size={18} />
                    </button>
                    <button
                      className="p-1.5 text-gray-500 hover:text-gray-700 transition-colors"
                      onClick={clearAll}
                      disabled={!inputText}
                    >
                      <RotateCcw size={18} />
                    </button>
                  </div>
                </div>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type or paste text to translate..."
                  className="w-full h-48 p-5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-translator focus:border-transparent transition-all resize-none"
                />
                <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                  {inputText.length} characters
                </div>
              </div>
              
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700">Translation</label>
                  <div className="flex gap-3">
                    <button
                      className="p-1.5 text-gray-500 hover:text-gray-700 transition-colors"
                      onClick={() => speakText(translatedText, targetLanguage)}
                      disabled={!translatedText}
                    >
                      <Volume2 size={18} />
                    </button>
                    <button
                      className="p-1.5 text-gray-500 hover:text-gray-700 transition-colors"
                      onClick={() => copyToClipboard(translatedText)}
                      disabled={!translatedText}
                    >
                      <Copy size={18} />
                    </button>
                  </div>
                </div>
                <div 
                  className={`w-full h-48 p-5 bg-gray-50 border border-gray-200 rounded-lg overflow-auto ${
                    isTranslating ? "animate-pulse" : ""
                  }`}
                >
                  {translatedText || (
                    <span className="text-gray-400">
                      Translation will appear here...
                    </span>
                  )}
                </div>
                <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                  {translatedText.length} characters
                </div>
              </div>
            </div>
            
            <div className="mt-10 flex justify-center">
              <button
                onClick={handleTranslate}
                disabled={isTranslating || !inputText.trim()}
                className={`translator-button px-8 py-3 text-lg ${
                  isTranslating ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {isTranslating ? "Translating..." : "Translate"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default TextTranslation;

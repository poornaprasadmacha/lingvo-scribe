import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowDown, ArrowUp, RotateCcw, Copy, Volume2, Mic, MicOff } from "lucide-react";
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
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Speech recognition
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const isSpeechRecognitionSupported =
    typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window);

  useEffect(() => {
    if (!isSpeechRecognitionSupported) return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = sourceLanguage === "auto" ? "en-US" : sourceLanguage;

    recognitionRef.current.onresult = (event: any) => {
      if (event.results?.[0]?.[0]?.transcript) {
        setInputText(prev => prev ? prev + " " + event.results[0][0].transcript : event.results[0][0].transcript);
      }
    };

    recognitionRef.current.onend = () => setIsListening(false);
    recognitionRef.current.onerror = (event: any) => {
      setIsListening(false);
      if (event.error !== "no-speech") {
        toast.error("Microphone error: " + event.error);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceLanguage, isSpeechRecognitionSupported]);

  const handleMicClick = () => {
    if (!isSpeechRecognitionSupported) return;
    if (!isListening) {
      try {
        // Set language again in case sourceLanguage changed after first mount
        if (recognitionRef.current) {
          recognitionRef.current.lang = sourceLanguage === "auto" ? "en-US" : sourceLanguage;
          recognitionRef.current.start();
          setIsListening(true);
          toast.info("Listening... Say something!");
        }
      } catch (err) {
        toast.error("Failed to start microphone");
      }
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        setIsListening(false);
      }
    }
  };

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
    if (!text || isSpeaking) return;

    try {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Convert language code to BCP 47 language tag format if needed
      // This improves compatibility with speech synthesis
      let speechLang = lang;
      
      // Handle 'auto' and convert 2-letter codes to language tags when needed
      if (lang === "auto") {
        speechLang = "en-US";
      } else if (lang.length === 2) {
        // Map common 2-letter codes to full language tags
        const langMap: {[key: string]: string} = {
          'en': 'en-US',
          'es': 'es-ES',
          'fr': 'fr-FR',
          'de': 'de-DE',
          'it': 'it-IT',
          'pt': 'pt-PT',
          'ru': 'ru-RU',
          'zh': 'zh-CN',
          'ja': 'ja-JP',
          'ko': 'ko-KR',
          'ar': 'ar-SA',
          'hi': 'hi-IN',
          // Add more mappings as needed
        };
        speechLang = langMap[lang] || lang;
      }
      
      utterance.lang = speechLang;
      
      // Set up event handlers to track speaking state
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = (event) => {
        console.error("Speech synthesis error:", event);
        toast.error("Failed to speak text. Try a different language.");
        setIsSpeaking(false);
      };
      
      // Find an appropriate voice for the selected language if available
      const voices = speechSynthesis.getVoices();
      const matchingVoice = voices.find(voice => voice.lang.startsWith(speechLang.split('-')[0]));
      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }
      
      window.speechSynthesis.speak(utterance);
      toast.success(`Speaking in ${speechLang}`);
    } catch (error) {
      console.error("Speech synthesis error:", error);
      toast.error("Speech synthesis failed.");
      setIsSpeaking(false);
    }
  };

  useEffect(() => {
    // Some browsers need a slight delay before getting voices
    const loadVoices = () => {
      speechSynthesis.getVoices();
    };
    
    speechSynthesis.onvoiceschanged = loadVoices;
    
    // Initial load attempt
    loadVoices();
    
    return () => {
      // Cancel any ongoing speech when component unmounts
      speechSynthesis.cancel();
    };
  }, []);

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
      <div className="translator-container pt-36 pb-24 px-8 md:px-16">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto"
        >
          <motion.h1 
            variants={itemVariants}
            className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white text-center mb-8 translator-text"
          >
            Text Translation
          </motion.h1>
          
          <motion.p 
            variants={itemVariants}
            className="text-center text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto"
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
                  className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  onClick={swapLanguages}
                >
                  <ArrowDown size={20} className="text-gray-600 dark:text-gray-300 md:hidden" />
                  <ArrowUp size={20} className="text-gray-600 dark:text-gray-300 md:hidden" />
                  <ArrowDown size={20} className="text-gray-600 dark:text-gray-300 hidden md:block rotate-90" />
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
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Source Text</label>
                  <div className="flex gap-2 md:gap-3">
                    <button
                      className={`p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white transition-colors ${isSpeaking ? 'text-blue-600 dark:text-blue-400' : ''}`}
                      onClick={() => speakText(inputText, sourceLanguage)}
                      disabled={!inputText || isSpeaking}
                      type="button"
                      aria-label="Speak source text"
                    >
                      <Volume2 size={18} />
                    </button>
                    <button
                      className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white transition-colors"
                      onClick={() => copyToClipboard(inputText)}
                      disabled={!inputText}
                      type="button"
                      aria-label="Copy text"
                    >
                      <Copy size={18} />
                    </button>
                    <button
                      className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white transition-colors"
                      onClick={clearAll}
                      disabled={!inputText}
                      type="button"
                      aria-label="Clear"
                    >
                      <RotateCcw size={18} />
                    </button>
                    <button
                      className={`p-1.5 rounded-full transition-colors ${
                        isListening 
                          ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 animate-pulse" 
                          : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-300"
                      } hover:bg-blue-50 dark:hover:bg-blue-700`}
                      onClick={handleMicClick}
                      type="button"
                      aria-label={isListening ? "Stop Listening" : "Start voice input"}
                      disabled={!isSpeechRecognitionSupported}
                      title={!isSpeechRecognitionSupported ? "Speech Recognition not supported in this browser" : (isListening ? "Click to stop listening" : "Click to start voice input")}
                    >
                      {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                    </button>
                  </div>
                </div>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type or paste text to translate..."
                  className="w-full h-48 p-5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-translator focus:border-transparent transition-all resize-none text-gray-900 dark:text-white"
                />
                <div className="absolute bottom-3 right-3 text-xs text-gray-400 dark:text-gray-500">
                  {inputText.length} characters
                </div>
              </div>
              
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Translation</label>
                  <div className="flex gap-3">
                    <button
                      className={`p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white transition-colors ${isSpeaking ? 'text-blue-600 dark:text-blue-400' : ''}`}
                      onClick={() => speakText(translatedText, targetLanguage)}
                      disabled={!translatedText || isSpeaking}
                      type="button"
                      aria-label="Speak translation"
                    >
                      <Volume2 size={18} />
                    </button>
                    <button
                      className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white transition-colors"
                      onClick={() => copyToClipboard(translatedText)}
                      disabled={!translatedText}
                      type="button"
                      aria-label="Copy translation"
                    >
                      <Copy size={18} />
                    </button>
                  </div>
                </div>
                <div 
                  className={`w-full h-48 p-5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-auto ${
                    isTranslating ? "animate-pulse" : ""
                  } text-gray-900 dark:text-white`}
                >
                  {translatedText || (
                    <span className="text-gray-400 dark:text-gray-500">
                      Translation will appear here...
                    </span>
                  )}
                </div>
                <div className="absolute bottom-3 right-3 text-xs text-gray-400 dark:text-gray-500">
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

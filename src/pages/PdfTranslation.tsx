
import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Upload, Download, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Layout from "@/components/layout/Layout";
import LanguageSelector from "@/components/shared/LanguageSelector";
import { translatePdf } from "@/services/translationService";
import { Card, CardContent } from "@/components/ui/card";

const PdfTranslation = () => {
  const [file, setFile] = useState<File | null>(null);
  const [sourceLanguage, setSourceLanguage] = useState("en");
  const [targetLanguage, setTargetLanguage] = useState("ta");
  const [translatedText, setTranslatedText] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    
    if (!selectedFile) return;
    
    // Check file type
    const fileType = selectedFile.type;
    if (fileType !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }
    
    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (selectedFile.size > maxSize) {
      toast.error("File size exceeds 10MB limit");
      return;
    }
    
    setFile(selectedFile);
    setTranslatedText("");
  };

  const handleTranslate = async () => {
    if (!file) {
      toast.error("Please upload a PDF file");
      return;
    }

    if (sourceLanguage === targetLanguage) {
      toast.error("Source and target languages must be different");
      return;
    }

    setIsTranslating(true);
    try {
      const result = await translatePdf(file, sourceLanguage, targetLanguage);
      
      if (result.translatedText) {
        setTranslatedText(result.translatedText);
        toast.success("PDF translation completed");
      } else if (result.error) {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Translation failed. Please try again.");
    } finally {
      setIsTranslating(false);
    }
  };

  const downloadPdf = () => {
    if (!translatedText) {
      toast.error("No translated content to download");
      return;
    }
    
    // In a real app, you would generate a proper PDF file
    // This is a simplified example using text file
    const blob = new Blob([translatedText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `translated_${file?.name.replace(".pdf", "")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Downloaded translation");
  };

  const clearFile = () => {
    setFile(null);
    setTranslatedText("");
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
          className="max-w-4xl mx-auto px-4"
        >
          <motion.h1 
            variants={itemVariants}
            className="text-4xl md:text-5xl font-bold text-gray-800 text-center mb-6 translator-text"
          >
            PDF Translation
          </motion.h1>
          
          <motion.p 
            variants={itemVariants}
            className="text-center text-gray-600 mb-10 max-w-2xl mx-auto"
          >
            Upload and translate PDF documents while preserving the original formatting.
          </motion.p>

          <motion.div 
            variants={itemVariants}
            className="mb-8"
          >
            <Card className="translator-card p-6 md:p-8">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row gap-6 mb-6">
                  <div className="flex-1">
                    <LanguageSelector 
                      value={sourceLanguage} 
                      onChange={setSourceLanguage} 
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

                <div className="my-8">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50/50">
                    {!file ? (
                      <div className="flex flex-col items-center">
                        <FileText size={48} className="text-blue-500 mb-4" />
                        <p className="text-gray-600 mb-4">Drag and drop your PDF file here, or click to browse</p>
                        <label className="translator-button flex items-center gap-2 cursor-pointer">
                          <Upload size={18} />
                          <span>Select PDF File</span>
                          <input
                            type="file"
                            accept=".pdf"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <FileText size={36} className="text-blue-500 mb-3" />
                        <p className="text-gray-800 font-medium mb-1">{file.name}</p>
                        <p className="text-gray-500 text-sm mb-4">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <div className="flex gap-3">
                          <button
                            onClick={clearFile}
                            className="flex items-center gap-1 px-3 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
                          >
                            <Trash2 size={16} />
                            <span>Remove</span>
                          </button>
                          <button
                            onClick={handleTranslate}
                            disabled={isTranslating}
                            className={`translator-button flex items-center gap-1 ${
                              isTranslating ? "opacity-70 cursor-not-allowed" : ""
                            }`}
                          >
                            {isTranslating ? "Translating..." : "Translate PDF"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {translatedText && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.5 }}
                    className="mt-8"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-800">Translation Result</h3>
                      <button
                        onClick={downloadPdf}
                        className="flex items-center gap-2 px-4 py-2 bg-translator text-white rounded-md hover:bg-translator-dark transition-colors"
                      >
                        <Download size={16} />
                        <span>Download Translation</span>
                      </button>
                    </div>
                    
                    <div className="bg-gray-50/80 rounded-lg p-6 max-h-96 overflow-y-auto border border-gray-200">
                      {translatedText}
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default PdfTranslation;

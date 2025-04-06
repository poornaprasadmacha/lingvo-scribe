
import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Upload, Download, Trash2, FileUp, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useDropzone } from "react-dropzone";
import Layout from "@/components/layout/Layout";
import LanguageSelector from "@/components/shared/LanguageSelector";
import { translatePdf } from "@/services/translationService";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const PdfTranslation = () => {
  const [file, setFile] = useState<File | null>(null);
  const [sourceLanguage, setSourceLanguage] = useState("en");
  const [targetLanguage, setTargetLanguage] = useState("ta");
  const [translatedText, setTranslatedText] = useState("");
  const [translatedPdfUrl, setTranslatedPdfUrl] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB limit
    onDropAccepted: (acceptedFiles) => {
      setFile(acceptedFiles[0]);
      setTranslatedText("");
      setTranslatedPdfUrl("");
      toast.success(`File added: ${acceptedFiles[0].name}`);
    },
    onDropRejected: (fileRejections) => {
      const error = fileRejections[0]?.errors[0];
      if (error?.code === 'file-too-large') {
        toast.error("File size exceeds 10MB limit");
      } else if (error?.code === 'file-invalid-type') {
        toast.error("Please upload a PDF file");
      } else {
        toast.error("Error uploading file");
      }
    }
  });

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
        if (result.pdfUrl) {
          setTranslatedPdfUrl(result.pdfUrl);
        }
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

  const clearFile = () => {
    setFile(null);
    setTranslatedText("");
    setTranslatedPdfUrl("");
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
                  <div 
                    {...getRootProps()} 
                    className={`border-2 border-dashed ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-gray-50/50'} rounded-lg p-8 text-center transition-colors duration-200 cursor-pointer`}
                  >
                    <input {...getInputProps()} />
                    {!file ? (
                      <div className="flex flex-col items-center">
                        <FileUp size={48} className="text-blue-500 mb-4" />
                        <p className="text-gray-600 mb-4">
                          {isDragActive
                            ? "Drop the PDF file here"
                            : "Drag and drop your PDF file here, or click to browse"
                          }
                        </p>
                        <Button className="translator-button flex items-center gap-2">
                          <Upload size={18} />
                          <span>Select PDF File</span>
                        </Button>
                        <p className="mt-3 text-xs text-gray-500">Maximum file size: 10MB</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <FileText size={36} className="text-blue-500 mb-3" />
                        <p className="text-gray-800 font-medium mb-1">{file.name}</p>
                        <p className="text-gray-500 text-sm mb-4">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <div className="flex gap-3">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              clearFile();
                            }}
                            variant="destructive"
                            className="flex items-center gap-1"
                          >
                            <Trash2 size={16} />
                            <span>Remove</span>
                          </Button>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTranslate();
                            }}
                            disabled={isTranslating}
                            className="translator-button flex items-center gap-2"
                          >
                            {isTranslating ? (
                              <>
                                <Loader2 size={18} className="animate-spin" />
                                <span>Translating...</span>
                              </>
                            ) : (
                              <>
                                <span>Translate PDF</span>
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {(translatedText || translatedPdfUrl) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.5 }}
                    className="mt-8"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-800">Translation Result</h3>
                      {translatedPdfUrl && (
                        <a
                          href={translatedPdfUrl}
                          download={`translated_${file?.name || 'document.pdf'}`}
                          className="flex items-center gap-2 px-4 py-2 bg-translator text-white rounded-md hover:bg-translator-dark transition-colors"
                        >
                          <Download size={16} />
                          <span>Download Translated PDF</span>
                        </a>
                      )}
                    </div>
                    
                    <div className="bg-gray-50/80 rounded-lg p-6 max-h-96 overflow-y-auto border border-gray-200">
                      {translatedText ? (
                        translatedText.split('\n').map((line, i) => (
                          <p key={i} className={i > 0 ? 'mt-2' : ''}>{line || ' '}</p>
                        ))
                      ) : (
                        <p className="text-gray-500 italic">Translation text preview not available</p>
                      )}
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

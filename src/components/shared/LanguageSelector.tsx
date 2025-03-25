
import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface LanguageSelectorProps {
  value: string;
  onChange: (value: string) => void;
  detectLanguage?: boolean;
  label?: string;
}

interface Language {
  code: string;
  name: string;
  flag?: string;
}

const LanguageSelector = ({ value, onChange, detectLanguage = false, label }: LanguageSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const languages: Language[] = [
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "ta", name: "Tamil", flag: "🇮🇳" },
    { code: "te", name: "Telugu", flag: "🇮🇳" },
    { code: "kn", name: "Kannada", flag: "🇮🇳" },
    { code: "ml", name: "Malayalam", flag: "🇮🇳" },
    { code: "hi", name: "Hindi", flag: "🇮🇳" },
    { code: "mr", name: "Marathi", flag: "🇮🇳" },
    { code: "gu", name: "Gujarati", flag: "🇮🇳" },
    { code: "bn", name: "Bengali", flag: "🇮🇳" },
    { code: "pa", name: "Punjabi", flag: "🇮🇳" },
    { code: "ur", name: "Urdu", flag: "🇵🇰" },
    { code: "or", name: "Odia", flag: "🇮🇳" },
    { code: "as", name: "Assamese", flag: "🇮🇳" },
    { code: "sa", name: "Sanskrit", flag: "🇮🇳" },
    { code: "fr", name: "French", flag: "🇫🇷" },
    { code: "es", name: "Spanish", flag: "🇪🇸" },
    { code: "de", name: "German", flag: "🇩🇪" },
    { code: "zh-CN", name: "Chinese (Simplified)", flag: "🇨🇳" },
    { code: "ja", name: "Japanese", flag: "🇯🇵" },
    { code: "ar", name: "Arabic", flag: "🇸🇦" },
  ];

  if (detectLanguage) {
    languages.unshift({ code: "auto", name: "Detect Language", flag: "🔍" });
  }

  const selectedLanguage = languages.find((lang) => lang.code === value) || languages[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".language-selector")) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative language-selector">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <button
        type="button"
        className="flex items-center justify-between w-full px-4 py-3 text-left bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-translator focus:border-transparent transition-all duration-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="flex items-center gap-2">
          <span className="text-lg">{selectedLanguage.flag}</span>
          <span className="font-medium">{selectedLanguage.name}</span>
        </span>
        <ChevronDown
          size={18}
          className={`text-gray-500 transition-transform duration-200 ${
            isOpen ? "transform rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          <div className="py-1">
            {languages.map((language) => (
              <button
                key={language.code}
                type="button"
                className={`flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors ${
                  language.code === value ? "bg-blue-50 text-translator" : ""
                }`}
                onClick={() => {
                  onChange(language.code);
                  setIsOpen(false);
                }}
              >
                <span className="text-lg">{language.flag}</span>
                <span className="font-medium">{language.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;

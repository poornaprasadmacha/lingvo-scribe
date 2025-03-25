
import { jsPDF } from "jspdf";

export const downloadTranslatedPdf = (translatedText: string, filename = "translated_document.pdf") => {
  try {
    // Create new PDF document
    const doc = new jsPDF();
    
    // Split text into manageable chunks due to PDF line length limitations
    const textLines = doc.splitTextToSize(translatedText, 180);
    
    // Add text to PDF
    doc.setFontSize(11);
    
    let y = 20; // Starting y position
    const pageHeight = doc.internal.pageSize.height - 20; // Bottom margin
    
    // Add lines to PDF with pagination
    for (let i = 0; i < textLines.length; i++) {
      if (y > pageHeight) {
        doc.addPage();
        y = 20; // Reset y position for new page
      }
      
      doc.text(textLines[i], 15, y);
      y += 7; // Line spacing
    }
    
    // Save the PDF
    doc.save(filename);
    
    return true;
  } catch (error) {
    console.error("Error creating PDF:", error);
    return false;
  }
};

import jsPDF from "jspdf";

interface SearchResult {
  result_type: string;
  platform: string;
  profile_url: string;
  username: string;
  display_name: string;
  bio: string;
  location: string;
  followers_count: number;
  posts_count: number;
  confidence_score: number;
  metadata: Record<string, any>;
}

interface SearchSummary {
  total_found: number;
  exposure_level: "low" | "medium" | "high";
  platforms_found: string[];
  key_insights: string[];
}

interface SearchData {
  results: SearchResult[];
  summary: SearchSummary;
}

export async function generatePDFReport(query: string, data: SearchData): Promise<void> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPosition = 20;

  // Helper function to add text and manage page breaks
  const addText = (text: string, fontSize: number, isBold: boolean = false, color: [number, number, number] = [255, 255, 255]) => {
    if (yPosition > 270) {
      doc.addPage();
      yPosition = 20;
    }
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", isBold ? "bold" : "normal");
    doc.setTextColor(color[0], color[1], color[2]);
    doc.text(text, margin, yPosition);
    yPosition += fontSize * 0.5;
  };

  const addLine = () => {
    doc.setDrawColor(50, 150, 150);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 5;
  };

  // Set dark background for entire page
  const addBackground = () => {
    doc.setFillColor(15, 23, 42); // Dark slate background
    doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), "F");
  };

  addBackground();

  // Title
  doc.setFillColor(20, 184, 166); // Teal accent
  doc.rect(0, 0, pageWidth, 40, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("HEADHUNTER TRACE", margin, 25);
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Digital Footprint Investigation Report", margin, 33);

  yPosition = 55;

  // Report Metadata
  addText(`Subject: ${query}`, 14, true);
  yPosition += 5;
  addText(`Generated: ${new Date().toLocaleString()}`, 10, false, [150, 150, 150]);
  addText(`Report ID: HT-${Date.now().toString(36).toUpperCase()}`, 10, false, [150, 150, 150]);
  yPosition += 10;

  addLine();
  yPosition += 5;

  // Executive Summary Section
  addText("EXECUTIVE SUMMARY", 16, true, [20, 184, 166]);
  yPosition += 5;

  const exposureColors: Record<string, [number, number, number]> = {
    low: [34, 197, 94],
    medium: [234, 179, 8],
    high: [239, 68, 68],
  };

  addText(`Digital Exposure Level: ${data.summary.exposure_level.toUpperCase()}`, 12, true, exposureColors[data.summary.exposure_level]);
  yPosition += 3;
  addText(`Total Profiles Identified: ${data.summary.total_found}`, 11, false);
  addText(`Platforms Detected: ${data.summary.platforms_found.length}`, 11, false);
  yPosition += 5;

  // Platforms found
  addText("Platforms Found:", 11, true);
  yPosition += 2;
  const platformsText = data.summary.platforms_found.join(", ");
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(200, 200, 200);
  const splitPlatforms = doc.splitTextToSize(platformsText, pageWidth - 2 * margin);
  doc.text(splitPlatforms, margin, yPosition);
  yPosition += splitPlatforms.length * 5 + 5;

  // Key Insights
  addText("Key Insights:", 11, true);
  yPosition += 2;
  data.summary.key_insights.forEach((insight, index) => {
    if (yPosition > 270) {
      doc.addPage();
      addBackground();
      yPosition = 20;
    }
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(200, 200, 200);
    const bulletPoint = `${index + 1}. ${insight}`;
    const splitInsight = doc.splitTextToSize(bulletPoint, pageWidth - 2 * margin);
    doc.text(splitInsight, margin, yPosition);
    yPosition += splitInsight.length * 5 + 2;
  });

  yPosition += 10;
  addLine();
  yPosition += 10;

  // Detailed Results Section
  addText("DETAILED FINDINGS", 16, true, [20, 184, 166]);
  yPosition += 10;

  data.results.forEach((result, index) => {
    if (yPosition > 230) {
      doc.addPage();
      addBackground();
      yPosition = 20;
    }

    // Result card background
    doc.setFillColor(30, 41, 59);
    doc.roundedRect(margin - 5, yPosition - 5, pageWidth - 2 * margin + 10, 60, 3, 3, "F");

    // Platform header
    doc.setFillColor(51, 65, 85);
    doc.roundedRect(margin - 5, yPosition - 5, pageWidth - 2 * margin + 10, 12, 3, 3, "F");
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(20, 184, 166);
    doc.text(`${index + 1}. ${result.platform.toUpperCase()}`, margin, yPosition + 3);
    
    // Confidence score
    doc.setFontSize(9);
    doc.setTextColor(200, 200, 200);
    doc.text(`Confidence: ${Math.round(result.confidence_score * 100)}%`, pageWidth - margin - 30, yPosition + 3);
    
    yPosition += 15;

    // Profile details
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text(`${result.display_name} (@${result.username})`, margin, yPosition);
    yPosition += 6;

    if (result.bio) {
      doc.setFont("helvetica", "normal");
      doc.setTextColor(180, 180, 180);
      const bioText = doc.splitTextToSize(`Bio: ${result.bio}`, pageWidth - 2 * margin);
      doc.text(bioText.slice(0, 2), margin, yPosition);
      yPosition += Math.min(bioText.length, 2) * 5;
    }

    if (result.location) {
      doc.setTextColor(150, 150, 150);
      doc.text(`Location: ${result.location}`, margin, yPosition);
      yPosition += 5;
    }

    const stats = [];
    if (result.followers_count > 0) stats.push(`Followers: ${result.followers_count.toLocaleString()}`);
    if (result.posts_count > 0) stats.push(`Posts: ${result.posts_count.toLocaleString()}`);
    if (stats.length > 0) {
      doc.text(stats.join(" | "), margin, yPosition);
      yPosition += 5;
    }

    doc.setTextColor(100, 150, 200);
    doc.textWithLink(`URL: ${result.profile_url}`, margin, yPosition, { url: result.profile_url });
    
    yPosition += 20;
  });

  // Footer on last page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Headhunter Trace - Confidential Report | Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );
  }

  // Legal disclaimer on last page
  doc.setPage(pageCount);
  const disclaimerY = doc.internal.pageSize.getHeight() - 30;
  doc.setFillColor(30, 41, 59);
  doc.rect(0, disclaimerY - 5, pageWidth, 25, "F");
  doc.setFontSize(7);
  doc.setTextColor(120, 120, 120);
  doc.text(
    "DISCLAIMER: This report contains information gathered from publicly available sources only. All data is fictional",
    pageWidth / 2,
    disclaimerY,
    { align: "center" }
  );
  doc.text(
    "and for demonstration purposes. Headhunter Trace does not access private or legally restricted information.",
    pageWidth / 2,
    disclaimerY + 4,
    { align: "center" }
  );

  // Save the PDF
  const filename = `HeadhunterTrace_Report_${query.replace(/\s+/g, "_")}_${Date.now()}.pdf`;
  doc.save(filename);
}

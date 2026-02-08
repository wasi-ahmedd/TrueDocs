
import { jsPDF } from "jspdf";

export const generateEmergencyKit = (username: string, salt: string) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header / Branding
    doc.setFillColor(16, 185, 129); // Emerald Green
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("GovtVault", 20, 20);
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text("Emergency Recovery Kit", 20, 30);

    // Critical Warning
    doc.setTextColor(220, 38, 38); // Red
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("DO NOT LOSE THIS DOCUMENT.", 20, 60);
    doc.setTextColor(0, 0, 0); // Black
    doc.setFont("helvetica", "normal");
    doc.text("We do not know your password. If you lose it, this document is the only way", 20, 70);
    doc.text("to recover your account information.", 20, 77);

    // User Details Box
    doc.setDrawColor(200, 200, 200);
    doc.rect(20, 90, pageWidth - 40, 50);

    doc.setFont("courier", "normal");
    doc.setFontSize(10);
    doc.text("USERNAME", 30, 105);
    doc.setFontSize(14);
    doc.setFont("courier", "bold");
    doc.text(username, 30, 115);

    doc.setFont("courier", "normal");
    doc.setFontSize(10);
    doc.text("ENCRYPTION SALT (PUBLIC)", 110, 105);
    doc.setFontSize(10);
    doc.setFont("courier", "bold");
    doc.text(salt, 110, 115);

    // Password Write-in Area
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.rect(20, 160, pageWidth - 40, 60);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("YOUR MASTER PASSWORD", 30, 175);

    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("Write your password here explicitly. Store this paper in a safe place.", 30, 185);

    // Line for writing
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.2);
    doc.line(30, 210, pageWidth - 30, 210);

    // Tech Specs Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("Technical Specifications:", 20, 270);
    doc.text("- Encryption: AES-256-GCM (Client-Side Derived)", 20, 275);
    doc.text("- Key Derivation: Scrypt (N=16384, r=8, p=1)", 20, 280);
    doc.text(`- Generated on: ${new Date().toLocaleString()}`, 20, 285);

    doc.save(`${username}_recovery_kit.pdf`);
};

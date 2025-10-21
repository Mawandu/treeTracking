import React from 'react';
import jsPDF from 'jspdf';
import './PDFExport.css';

function PDFExport({ logData }) {
    const generatePDF = async () => {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.getWidth();
        
        pdf.setFillColor(102, 126, 234);
        pdf.rect(0, 0, pageWidth, 40, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(24);
        pdf.text('TreeTracking', 20, 25);
        pdf.setFontSize(12);
        pdf.text('Certificat de Traçabilité', 20, 33);
        
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(16);
        pdf.text(`Log ID: ${logData.logID}`, 20, 55);
        
        pdf.setFontSize(12);
        let y = 70;
        
        pdf.text(`Espèce: ${logData.species}`, 20, y);
        y += 10;
        pdf.text(`Origine: ${logData.origin}`, 20, y);
        y += 10;
        pdf.text(`Statut: ${logData.status}`, 20, y);
        y += 10;
        pdf.text(`Origine validée: ${logData.originValidated ? 'Oui' : 'Non'}`, 20, y);
        y += 15;
        
        if (logData.permit) {
            pdf.setFontSize(14);
            pdf.setTextColor(102, 126, 234);
            pdf.text('Permis de coupe', 20, y);
            y += 8;
            pdf.setFontSize(11);
            pdf.setTextColor(0, 0, 0);
            pdf.text(`ID: ${logData.permit.permitID}`, 25, y);
            y += 7;
            pdf.text(`Expiration: ${new Date(logData.permit.expiryDate).toLocaleDateString()}`, 25, y);
            y += 12;
        }
        
        if (logData.physicalData) {
            pdf.setFontSize(14);
            pdf.setTextColor(102, 126, 234);
            pdf.text('Données physiques', 20, y);
            y += 8;
            pdf.setFontSize(11);
            pdf.setTextColor(0, 0, 0);
            pdf.text(`Dimensions: ${logData.physicalData.dimensions}`, 25, y);
            y += 7;
            pdf.text(`Poids: ${logData.physicalData.weight} kg`, 25, y);
            y += 7;
            pdf.text(`Qualité: ${logData.physicalData.quality}`, 25, y);
            y += 7;
            pdf.text(`Marquage: ${logData.physicalData.marking}`, 25, y);
            y += 12;
        }
        
        if (logData.purchase) {
            pdf.setFontSize(14);
            pdf.setTextColor(102, 126, 234);
            pdf.text('Informations d\'achat', 20, y);
            y += 8;
            pdf.setFontSize(11);
            pdf.setTextColor(0, 0, 0);
            pdf.text(`Acheteur: ${logData.purchase.buyerID}`, 25, y);
            y += 7;
            pdf.text(`Prix: ${logData.purchase.price} ${logData.purchase.currency}`, 25, y);
            y += 7;
            pdf.text(`Conforme: ${logData.purchase.isCompliant ? 'Oui' : 'Non'}`, 25, y);
            y += 12;
        }
        
        if (logData.history && logData.history.length > 0) {
            if (y > 220) {
                pdf.addPage();
                y = 20;
            }
            
            pdf.setFontSize(14);
            pdf.setTextColor(102, 126, 234);
            pdf.text('Historique des événements', 20, y);
            y += 10;
            
            pdf.setFontSize(9);
            pdf.setTextColor(0, 0, 0);
            
            logData.history.forEach((entry, idx) => {
                if (y > 270) {
                    pdf.addPage();
                    y = 20;
                }
                
                const date = new Date(entry.timestamp).toLocaleString();
                pdf.text(`${idx + 1}. ${entry.action}`, 25, y);
                y += 5;
                pdf.text(`   ${date}`, 25, y);
                y += 5;
                pdf.text(`   ${entry.description}`, 25, y);
                y += 8;
            });
        }
        
        const pageCount = pdf.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            pdf.setPage(i);
            pdf.setFontSize(8);
            pdf.setTextColor(128);
            pdf.text(
                `TreeTracking v2.0 - Page ${i}/${pageCount} - Généré le ${new Date().toLocaleDateString()}`,
                pageWidth / 2,
                pdf.internal.pageSize.getHeight() - 10,
                { align: 'center' }
            );
        }
        
        pdf.save(`TreeTracking-${logData.logID}.pdf`);
    };

    return (
        <button onClick={generatePDF} className="btn-export-pdf">
            Exporter en PDF
        </button>
    );
}

export default PDFExport;

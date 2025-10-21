import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import './QRCodeGenerator.css';

function QRCodeGenerator({ logID, data }) {
    const qrData = JSON.stringify({
        logID,
        species: data?.species,
        origin: data?.origin,
        status: data?.status,
        url: `http://localhost:3001/verify/${logID}`
    });

    const downloadQR = () => {
        const svg = document.getElementById(`qr-${logID}`);
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            const pngFile = canvas.toDataURL('image/png');
            
            const downloadLink = document.createElement('a');
            downloadLink.download = `QR-${logID}.png`;
            downloadLink.href = pngFile;
            downloadLink.click();
        };
        
        img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    };

    return (
        <div className="qr-container">
            <h4>QR Code de traçabilité</h4>
            <div className="qr-code">
                <QRCodeSVG
                    id={`qr-${logID}`}
                    value={qrData}
                    size={200}
                    level="H"
                    includeMargin={true}
                />
            </div>
            <button onClick={downloadQR} className="btn-download-qr">
                Télécharger QR Code
            </button>
            <p className="qr-info">Scannez pour vérifier l'authenticité</p>
        </div>
    );
}

export default QRCodeGenerator;

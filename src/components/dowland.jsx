import React, { useState } from "react";
import pdfIcon from "../assets/icons/pdf.png";
import downland from "../assets/icons/dowland.png";
import shareIcon from "../assets/icons/share.png"; // Cambia el nombre si tu icono es diferente
import Copy from "./Copy";

export default function Dowland({ calendarRef }) {
  const [showPreview, setShowPreview] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Simula la URL de la página
  const pageUrl = window.location.href;

  // Simula la vista previa del PDF (puedes mejorar esto con una plantilla real)
  const handleDownload = () => {
    setShowPreview(true);
    // Aquí puedes agregar lógica para generar el PDF real con jsPDF o similar
  };

  const handleShare = () => {
    navigator.clipboard.writeText(pageUrl).then(() => {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    });
  };

  return (
    <div className="download-share-buttons">
      <button className="pdf-download-btn" onClick={handleDownload}>
        <img src={pdfIcon} alt="PDF" />
        Descargar en PDF
      </button>
      <button className="share-btn" onClick={handleShare}>
        <img src={shareIcon} alt="Compartir" />
        Compartir
      </button>
      <Copy show={showToast} message="¡Enlace copiado correctamente!" />
      {showPreview && (
        <div className="pdf-preview-modal">
          <div className="pdf-preview-content">
            <h2>Vista previa del PDF</h2>
            <img
              src={require("../assets/plantilla/plantilla.png")}
              alt="Plantilla PDF"
              style={{ width: "100%", maxWidth: 500 }}
            />
            <div className="button-container-download flex-column">
              

                <button className="download-button-full" onClick={handleDownload}>
                  <img src={downland} alt="PDF" />
                  Descargar PDF
                </button>
              
            <button
              className="close-preview-btn"
              onClick={() => setShowPreview(false)}
            >
              Cerrar vista previa
            </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState } from "react";
import pdfIcon from "../assets/icons/pdf.png";
import downland from "../assets/icons/download.png";
import shareIcon from "../assets/icons/share.png";
import add from "../assets/icons/add.png";
import deleteIcon from "../assets/icons/delete.png";
import festive from "../assets/icons/festive.png";
import Copy from "./Copy";
import AddJuzgadoDialog from "../alertsDialogs/juzgados/add_juzgado";

export default function Buttons({ calendarRef, onAddJuzgado }) {
  const [showPreview, setShowPreview] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showAddJuzgadoDialog, setShowAddJuzgadoDialog] = useState(false);

  // Coloca el URL de la página actual
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

  const handleSaveNuevoJuzgado = (nuevoJuzgado) => {
    // Aquí puedes agregar el nuevo juzgado a tu lista o hacer lo que necesites
    // Por ejemplo: setJuzgados([...juzgados, nuevoJuzgado]);
    // O mostrar un toast de éxito
  };

  return (
    <div className="download-share-buttons">
      <button className="pdf-download-btn" onClick={handleDownload}>
        <img src={pdfIcon} alt="PDF" />
        Descargar en PDF
      </button>

      <button
        className="add-btn"
        onClick={() => setShowAddJuzgadoDialog(true)}
        style={{ marginBottom: "16px" }}
      >
        <img src={add} alt="Añadir" />
        Agregar Nuevo Juzgado
      </button>
      <button className="delete-btn" onClick={handleShare}>
        <img src={deleteIcon} alt="Eliminar" />
        Eliminar Juzgado
      </button>
      <button className="add-festive-btn" onClick={handleShare}>
        <img src={festive} alt="Añadir festivo" />
        Agregar Festivo
      </button>
      <button className="delete-festive-btn" onClick={handleShare}>
        <img src={festive} alt="Eliminar festivo" />
        Eliminar Festivo
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
      <AddJuzgadoDialog
        open={showAddJuzgadoDialog}
        onClose={() => setShowAddJuzgadoDialog(false)}
        onSave={handleSaveNuevoJuzgado}
      />
    </div>
  );
}

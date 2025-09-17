import React, { useState } from "react";
import Copy from "../../components/Copy";
import deleteIcon from "../../assets/icons/delete.png"; // Asegúrate de tener este import

export default function ViewJuzgadoDialog({ open, onClose, juzgado }) {
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const handleCopy = () => {
    if (juzgado?.email) {
      navigator.clipboard.writeText(juzgado.email).then(() => {
        setToastMsg("¡Se copió con éxito!");
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
      });
    }
  };

  if (!open) return null;

  return (
    <div className="alert-dialog-backdrop">
      <div className="alert-dialog">
        <h1>{juzgado?.nombre || "Nombre del Juzgado"}</h1>
        <div className="juzgado-email-row">
          <span>{juzgado?.email || "juzgadoejemplo@correo.com"}</span>
          <button className="copy-button" onClick={handleCopy}>
            Copiar
          </button>
        </div>
        <div className="dialog-actions-vertical">
          <button
            className="edit-button-full"
            onClick={() => alert("Función de cambiar aún no implementada")}
          >
            Cambiar Turno del Juzgado
          </button>
          <button
            className="delete-btn"
            style={{
              justifyContent: "center",
              display: "flex",
              alignItems: "center",
            }}
            onClick={() => alert("Función de eliminar aún no implementada")}
          >
            <img
              src={deleteIcon}
              alt="Eliminar"
              style={{ marginRight: "8px" }}
            />
            Eliminar Turno del Juzgado
          </button>
          <button className="close-button-full" onClick={onClose}>
            Cerrar
          </button>
        </div>
        <Copy show={showToast} message={toastMsg} />
      </div>
    </div>
  );
}

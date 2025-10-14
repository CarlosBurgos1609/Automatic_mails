import React, { useState } from "react";
import Copy from "../../components/Copy";

export default function JuzgadoDialog({ open, onClose, juzgadoHoy }) {
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [editMode, setEditMode] = useState(false);
  const nombre = juzgadoHoy?.name || "No hay juzgado de turno hoy";
  const correo = juzgadoHoy?.email || "";

  const handleCopy = () => {
    navigator.clipboard.writeText(correo).then(() => {
      setToastMsg("¡Se copió con éxito!");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    });
  };

  const handleSave = () => {
    setEditMode(false);
  };

  if (!open) return null;

  return (
    <div className="alert-dialog-backdrop">
      <div className="alert-dialog">
        <h1>Juzgado de Turno</h1>
        <p>{nombre}</p>
        <div className="juzgado-email-row">
          <span>{correo}</span>
          {correo && (
            <button
              className="copy-button"
              onClick={() => {
                navigator.clipboard.writeText(correo).then(() => {
                  setToastMsg("¡Se copió con éxito!");
                  setShowToast(true);
                  setTimeout(() => setShowToast(false), 2000);
                });
              }}
            >
              Copiar
            </button>
          )}
        </div>
        <div className="dialog-actions-vertical">
          <button className="close-button-full" onClick={onClose}>
            Cerrar
          </button>
        </div>
        <Copy show={showToast} message={toastMsg} />
      </div>
    </div>
  );
}

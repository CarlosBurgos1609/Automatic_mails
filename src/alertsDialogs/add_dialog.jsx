import React, { useState } from "react";
import Copy from "../components/Copy";

export default function JuzgadoDialog({ open, onClose }) {
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [nombre, setNombre] = useState("Juzgado 004 de la judicatura de manizales");
  const [correo, setCorreo] = useState("juzgado002depasto@ejemplo.com");

  const handleCopy = () => {
    navigator.clipboard.writeText(correo).then(() => {
      setToastMsg("¡Se copió con éxito!");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    });
  };

  const handleSave = () => {
    setEditMode(false);
    // Aquí podrías guardar los cambios en un backend si lo necesitas
  };

  if (!open) return null;

  return (
    <div className="alert-dialog-backdrop">
      <div className="alert-dialog">
        <h1>Nombre del Juzgado</h1>
        {editMode ? (
          <input
            type="text"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            style={{ fontSize: 18, marginBottom: 12, width: "100%", padding: 6, borderRadius: 8, border: "1px solid #ccc" }}
          />
        ) : (
          <p>{nombre}</p>
        )}
        <div className="juzgado-email-row">
          {editMode ? (
            <input
              type="email"
              value={correo}
              onChange={e => setCorreo(e.target.value)}
              style={{ fontSize: 16, width: "70%", padding: 6, borderRadius: 8, border: "1px solid #ccc" }}
            />
          ) : (
            <span>{correo}</span>
          )}
          <button className="copy-button" onClick={handleCopy}>
            Copiar
          </button>
        </div>
        <div className="dialog-actions">
          {editMode ? (
            <button className="edit-button" onClick={handleSave}>Guardar</button>
          ) : (
            <button className="edit-button" onClick={() => setEditMode(true)}>Editar</button>
          )}
          <button className="close-button" onClick={onClose}>
            Cerrar
          </button>
        </div>
        <Copy show={showToast} message={toastMsg} />
      </div>
    </div>
  );
}

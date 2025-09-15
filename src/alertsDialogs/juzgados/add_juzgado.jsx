import React, { useState } from "react";

export default function AddJuzgadoDialog({ open, onClose, onSave }) {
  const [codigo, setCodigo] = useState("");
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [departamento, setDepartamento] = useState("");
  const [error, setError] = useState(false);
  const [correoError, setCorreoError] = useState("");

  const handleGuardar = () => {
    let hasError = false;
    setCorreoError("");

    if (!codigo || !nombre || !correo || !departamento) {
      hasError = true;
    }
    if (!correo.includes("@")) {
      setCorreoError("El correo electrónico debe contener un '@'.");
      hasError = true;
    }

    setError(hasError);

    if (!hasError) {
      onSave({ codigo, nombre, correo, departamento });
      onClose();
      setCodigo("");
      setNombre("");
      setCorreo("");
      setDepartamento("");
      setError(false);
      setCorreoError("");
    }
  };

  if (!open) return null;

  return (
    <div className="alert-dialog-backdrop">
      <div className="alert-dialog add-juzgado-dialog">
        <h1>Agregar Nuevo Juzgado</h1>
        <div className="input-busqueda">
          <input
            type="text"
            placeholder=" # Código del juzgado"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            className={error && !codigo ? "input-error" : ""}
          />
        </div>
        <div className="input-busqueda">
          <input
            type="text"
            placeholder="Nombre del juzgado"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className={error && !nombre ? "input-error" : ""}
          />
        </div>
        <div className="input-busqueda">
          <input
            type="email"
            placeholder="Correo electrónico"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            className={
              (error && !correo) || correoError ? "input-error" : ""
            }
          />
          {correoError && (
            <div className="error-message">{correoError}</div>
          )}
        </div>
        <div className="input-busqueda">
          <input
            type="text"
            placeholder="Departamento"
            value={departamento}
            onChange={(e) => setDepartamento(e.target.value)}
            className={error && !departamento ? "input-error" : ""}
          />
        </div>
        {error && (!codigo || !nombre || !correo || !departamento) && (
          <div className="error-message">
            Por favor, complete todos los campos obligatorios.
          </div>
        )}
        <div className="dialog-actions flex-column">
          <button className="edit-button-full" onClick={handleGuardar}>
            Guardar
          </button>
          <button className="close-button-full" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

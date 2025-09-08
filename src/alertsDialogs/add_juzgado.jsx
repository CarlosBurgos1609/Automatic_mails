import React, { useState } from "react";

export default function AddJuzgadoDialog({ open, onClose, onSave }) {
  const [codigo, setCodigo] = useState("");
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [departamento, setDepartamento] = useState("");

  const handleGuardar = () => {
    if (codigo && nombre && correo && departamento) {
      onSave({ codigo, nombre, correo, departamento });
      onClose();
      setCodigo("");
      setNombre("");
      setCorreo("");
      setDepartamento("");
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
          />
        </div>
        <div className="input-busqueda">
          <input
            type="text"
            placeholder="Nombre del juzgado"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </div>
        <div className="input-busqueda">
          <input
            type="email"
            placeholder="Correo electrónico"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
          />
        </div>
        <div className="input-busqueda">
          <input
            type="text"
            placeholder="Departamento"
            value={departamento}
            onChange={(e) => setDepartamento(e.target.value)}
          />
        </div>
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

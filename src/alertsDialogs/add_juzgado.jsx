import React, { useState } from "react";

const juzgadosData = [
  {
    nombre: "JUZGADO 007 CIVIL MUNICIPAL DE PASTO",
    email: "juzgado007pasto@ejemplo.com",
    estado: "disponible",
  },
  {
    nombre: "JUZGADO 020 CIVIL MUNICIPAL DE PASTO",
    email: "juzgado020pasto@ejemplo.com",
    estado: "pasado",
  },
  {
    nombre: "JUZGADO 004 DE PEQUEÑAS CAUSAS Y COMPETENCIA MÚLTIPLE DE PASTO",
    email: "juzgado004pasto@ejemplo.com",
    estado: "disponible",
  },
  // ...agrega más juzgados aquí...
];

const estados = [
  { key: "disponible", label: "Disponibles", color: "#4caf50" },
  { key: "pasado", label: "Ya pasaron", color: "#e53935" },
  { key: "todos", label: "Todos", color: "#888" },
];

export default function AddJuzgadoDialog({ open, onClose, onSave, slotDate }) {
  const [filtro, setFiltro] = useState("todos");
  const [busqueda, setBusqueda] = useState("");
  const [juzgadoSeleccionado, setJuzgadoSeleccionado] = useState(null);

  // Filtrado de juzgados
  const juzgadosFiltrados = juzgadosData.filter(
    (j) =>
      (filtro === "todos" || j.estado === filtro) &&
      j.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleGuardar = () => {
    if (juzgadoSeleccionado) {
      onSave(juzgadoSeleccionado, slotDate);
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className="alert-dialog-backdrop">
      <div className="alert-dialog add-juzgado-dialog">
        <h1>Agregar Juzgado</h1>
        <div className="input-busqueda">
          <input
            type="text"
            placeholder="Buscar juzgado..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <div className="filtros-juzgado">
          {estados.map((est) => (
            <button
              key={est.key}
              className={`filtro-btn${filtro === est.key ? " selected" : ""} ${
                est.key
              }`}
              onClick={() => setFiltro(est.key)}
              type="button"
            >
              <span
                className="filtro-punto"
                style={{ background: est.color }}
              ></span>
              {est.label}
            </button>
          ))}
        </div>
        <div className="select-juzgado">
          <select
            value={juzgadoSeleccionado?.nombre || ""}
            onChange={(e) => {
              const juz = juzgadosData.find((j) => j.nombre === e.target.value);
              setJuzgadoSeleccionado(juz);
            }}
          >
            <option value="">Seleccione un juzgado...</option>
            {juzgadosFiltrados.map((j) => (
              <option key={j.nombre} value={j.nombre}>
                {j.nombre}
              </option>
            ))}
          </select>
        </div>
        {juzgadoSeleccionado && (
          <div className="juzgado-email-row">
            <span>{juzgadoSeleccionado.email}</span>
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

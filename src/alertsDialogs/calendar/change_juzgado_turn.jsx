import React, { useState, useEffect } from "react";
import dayjs from "dayjs"; // <--- Agrega esto

export default function ChangeJuzgadoTurnDialog({
  open,
  onClose,
  onChange,
  slotDate,
  currentJuzgado,
  showToastMsg,
}) {
  const [busqueda, setBusqueda] = useState("");
  const [juzgadosData, setJuzgadosData] = useState([]);
  const [nuevoJuzgado, setNuevoJuzgado] = useState(null);
  const [error, setError] = useState("");

  // Cargar juzgados desde el backend
  useEffect(() => {
    if (open) {
      fetch("http://localhost:5000/api/juzgados")
        .then((res) => res.json())
        .then((data) => {
          setJuzgadosData(data);
          setError("");
        })
        .catch(() => {
          setJuzgadosData([]);
          setError("No se pudieron cargar los juzgados.");
        });
    }
  }, [open]);

  // Filtrado de juzgados por nombre o email
  const juzgadosFiltrados = juzgadosData.filter(
    (j) =>
      j.name.toLowerCase().includes(busqueda.toLowerCase()) ||
      (j.email && j.email.toLowerCase().includes(busqueda.toLowerCase()))
  );

  // Formatea la fecha seleccionada
  const fechaSeleccionada = slotDate
    ? dayjs(slotDate).format("dddd, DD [de] MMMM [de] YYYY")
    : "";

  const handleGuardar = () => {
    if (!nuevoJuzgado) {
      setError("Debe seleccionar un juzgado para el cambio.");
      return;
    }
    setError("");
    onChange(nuevoJuzgado, slotDate);
    showToastMsg("Turno cambiado correctamente");
    setBusqueda("");
    setNuevoJuzgado(null);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  if (!open) return null;

  return (
    <div className="alert-dialog-backdrop">
      <div className="alert-dialog add-juzgado-dialog">
        <h1>Cambiar el turno de juzgado</h1>
        {fechaSeleccionada && (
          <div
            style={{
              marginBottom: "1rem",
              fontWeight: "bold",
              color: "#003f75",
            }}
          >
            Fecha seleccionada: {fechaSeleccionada}
          </div>
        )}
        <div className="input-busqueda">
          <input
            type="text"
            placeholder="Buscar juzgado por nombre o email..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className={error && !busqueda ? "input-error" : ""}
          />
        </div>
        <div className="current-juzgado">
          <b>Juzgado actual:</b>{" "}
          {currentJuzgado
            ? `${currentJuzgado.name} (${currentJuzgado.email})`
            : "No hay juzgado asignado"}
        </div>
        <div className="select-juzgado">
          <select
            value={nuevoJuzgado?.id || ""}
            onChange={(e) => {
              const juz = juzgadosData.find(
                (j) => String(j.id) === e.target.value
              );
              setNuevoJuzgado(juz);
              setError("");
            }}
            className={error && !nuevoJuzgado ? "input-error" : ""}
          >
            <option value="">Seleccione un nuevo juzgado...</option>
            {juzgadosFiltrados.map((j) => (
              <option key={j.id} value={j.id}>
                {j.name}
              </option>
            ))}
          </select>
        </div>
        {error && <div className="error-message">{error}</div>}
        {nuevoJuzgado && (
          <div className="juzgado-email-row">
            <span>
              <b>Email:</b> {nuevoJuzgado.email}
            </span>
          </div>
        )}
        <div className="dialog-actions flex-column">
          <button
            className="edit-button-full"
            onClick={handleGuardar}
            disabled={!nuevoJuzgado}
          >
            Guardar
          </button>
          <button className="close-button-full" onClick={onClose}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
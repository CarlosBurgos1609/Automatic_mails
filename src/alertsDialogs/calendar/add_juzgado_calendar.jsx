import React, { useState, useEffect } from "react";
import Copy from "../../components/Copy"; // Ajusta la ruta si es necesario

export default function AddJuzgadoCalendarDialog({ open, onClose, onSave, slotDate, showToastMsg }) {
  const [busqueda, setBusqueda] = useState("");
  const [juzgadosData, setJuzgadosData] = useState([]);
  const [juzgadoSeleccionado, setJuzgadoSeleccionado] = useState(null);
  const [error, setError] = useState("");
  const [showCopy, setShowCopy] = useState(false);

  // Cargar juzgados desde el backend (como en calendario.jsx)
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

  const handleGuardar = () => {
    if (!juzgadoSeleccionado) {
      setError("Debe seleccionar un juzgado antes de guardar.");
      return;
    }
    setError("");
    onSave(juzgadoSeleccionado, slotDate);
    showToastMsg("Se guardó correctamente");
    setBusqueda("");
    setJuzgadoSeleccionado(null);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  const handleCopyEmail = () => {
    if (juzgadoSeleccionado?.email) {
      navigator.clipboard.writeText(juzgadoSeleccionado.email).then(() => {
        showToastMsg("¡Se copió con éxito!");
      });
    }
  };

  if (!open && !showCopy) return null;

  return (
    <>
      <Copy show={showCopy} message="Se guardó correctamente" />
      {open && !showCopy && (
        <div className="alert-dialog-backdrop">
          <div className="alert-dialog add-juzgado-dialog">
            <h1>Agregar Juzgado</h1>
            <div className="input-busqueda">
              <input
                type="text"
                placeholder="Buscar juzgado por nombre o email..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className={error && !busqueda ? "input-error" : ""}
              />
            </div>
            <div className="select-juzgado">
              <select
                value={juzgadoSeleccionado?.id || ""}
                onChange={(e) => {
                  const juz = juzgadosData.find((j) => String(j.id) === e.target.value);
                  setJuzgadoSeleccionado(juz);
                  setError("");
                }}
                className={error && !juzgadoSeleccionado ? "input-error" : ""}
              >
                <option value="">Seleccione un juzgado...</option>
                {juzgadosFiltrados.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.name}
                  </option>
                ))}
              </select>
            </div>
            {error && (
              <div className="error-message">{error}</div>
            )}
            {juzgadoSeleccionado && (
              <div className="juzgado-email-row">
                <span>
                  <b>Email:</b> {juzgadoSeleccionado.email}
                </span>
                <button onClick={handleCopyEmail} className="copy-email-button">
                  Copiar Email
                </button>
              </div>
            )}
            <div className="dialog-actions flex-column">
              <button
                className="edit-button-full"
                onClick={handleGuardar}
                disabled={!juzgadoSeleccionado}
              >
                Guardar
              </button>
              <button className="close-button-full" onClick={onClose}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
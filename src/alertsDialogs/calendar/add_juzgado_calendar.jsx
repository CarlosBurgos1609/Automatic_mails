import React, { useState, useEffect } from "react";
import Copy from "../../components/Copy";
import dayjs from "dayjs";

export default function AddJuzgadoCalendarDialog({ open, onClose, onSave, slotDate, showToastMsg }) {
  const [busqueda, setBusqueda] = useState("");
  const [juzgadosData, setJuzgadosData] = useState([]);
  const [juzgadoSeleccionado, setJuzgadoSeleccionado] = useState(null);
  const [error, setError] = useState("");
  const [showCopy, setShowCopy] = useState(false);
  const [loadingJuzgados, setLoadingJuzgados] = useState(false);

  // Cargar juzgados desde el backend
  useEffect(() => {
    if (open) {
      cargarJuzgados();
    }
  }, [open]);

  const cargarJuzgados = async () => {
    setLoadingJuzgados(true);
    try {
      const response = await fetch("http://localhost:5000/api/juzgados");
      const data = await response.json();
      setJuzgadosData(data);
      setError("");
    } catch (error) {
      console.error("Error al cargar juzgados:", error);
      setJuzgadosData([]);
      setError("No se pudieron cargar los juzgados.");
    } finally {
      setLoadingJuzgados(false);
    }
  };

  // Filtrado de juzgados por nombre, código o email
  const juzgadosFiltrados = juzgadosData.filter(
    (j) =>
      j.name.toLowerCase().includes(busqueda.toLowerCase()) ||
      j.code.toLowerCase().includes(busqueda.toLowerCase()) ||
      (j.email && j.email.toLowerCase().includes(busqueda.toLowerCase()))
  );

  const handleSeleccionarJuzgado = (juzgado) => {
    setJuzgadoSeleccionado(juzgado);
    setError("");
  };

  const handleGuardar = () => {
    if (!juzgadoSeleccionado) {
      setError("Debe seleccionar un juzgado antes de guardar.");
      return;
    }
    setError("");
    onSave(juzgadoSeleccionado, slotDate);
    showToastMsg("Se guardó correctamente");
    
    // Limpiar estado y cerrar inmediatamente
    handleDialogClose();
  };

  const handleCopyEmail = () => {
    if (juzgadoSeleccionado?.email) {
      navigator.clipboard.writeText(juzgadoSeleccionado.email).then(() => {
        showToastMsg("¡Se copió con éxito!");
      });
    }
  };

  const handleDialogClose = () => {
    // Limpieza inmediata para cierre rápido
    setBusqueda("");
    setJuzgadoSeleccionado(null);
    setError("");
    setLoadingJuzgados(false);
    onClose();
  };

  // Formatea la fecha seleccionada
  const fechaSeleccionada = slotDate
    ? dayjs(slotDate).format("dddd, DD [de] MMMM [de] YYYY")
    : "";

  if (!open && !showCopy) return null;

  return (
    <>
      <Copy show={showCopy} message="Se guardó correctamente" />
      {open && !showCopy && (
        <div className="alert-dialog-backdrop">
          <div className="alert-dialog add-juzgado-dialog add-juzgado-calendar-dialog">
            <h1>Agregar Turno del Juzgado</h1>
            
            {fechaSeleccionada && (
              <div className="fecha-seleccionada">
                📅 Fecha seleccionada: {fechaSeleccionada}
              </div>
            )}

            <div className="input-busqueda">
              <input
                type="text"
                placeholder="Buscar juzgado por nombre, código o email..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            {/* Lista de juzgados */}
            <div className="juzgados-list">
              {loadingJuzgados ? (
                <div className="loading-state">
                  Cargando juzgados...
                </div>
              ) : juzgadosFiltrados.length === 0 ? (
                <div className="empty-state">
                  {busqueda ? "No se encontraron juzgados" : "No hay juzgados disponibles"}
                </div>
              ) : (
                juzgadosFiltrados.map((juzgado) => (
                  <div
                    key={juzgado.id}
                    onClick={() => handleSeleccionarJuzgado(juzgado)}
                    className={`juzgado-item ${juzgadoSeleccionado?.id === juzgado.id ? 'selected' : ''}`}
                  >
                    <div className={`juzgado-header ${juzgadoSeleccionado?.id === juzgado.id ? 'selected' : ''}`}>
                      {juzgado.code} - {juzgado.name}
                      {juzgadoSeleccionado?.id === juzgado.id && (
                        <span className="selected-indicator">
                          ✓
                        </span>
                      )}
                    </div>
                    <div className="juzgado-email-row">
                      <span>{juzgado.email}</span>
                      {juzgadoSeleccionado?.id === juzgado.id && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyEmail();
                          }}
                          className="quick-copy-btn"
                        >
                          📋 Copiar
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Mensaje de error */}
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            {/* Botones de acción */}
            <div className="dialog-actions flex-column">
              <button
                className={`edit-button-full save-button ${!juzgadoSeleccionado ? 'disabled' : ''}`}
                onClick={handleGuardar}
                disabled={!juzgadoSeleccionado}
              >
                {juzgadoSeleccionado 
                  ? `Guardar Turno` 
                  : "Seleccione un Juzgado"}
              </button>
              <button className="close-button-full" onClick={handleDialogClose}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
import React, { useState, useEffect } from "react";
import dayjs from "dayjs"; 

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
  const [loading, setLoading] = useState(false);
  const [isChanging, setIsChanging] = useState(false);

  // Cargar juzgados desde el backend
  useEffect(() => {
    if (open) {
      setLoading(true);
      fetch("http://localhost:5000/api/juzgados")
        .then((res) => res.json())
        .then((data) => {
          setJuzgadosData(data);
          setError("");
        })
        .catch(() => {
          setJuzgadosData([]);
          setError("No se pudieron cargar los juzgados.");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [open]);

  // Filtrado de juzgados por nombre o email
  const juzgadosFiltrados = juzgadosData.filter(
    (j) =>
      j.name.toLowerCase().includes(busqueda.toLowerCase()) ||
      (j.email && j.email.toLowerCase().includes(busqueda.toLowerCase())) ||
      j.code.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Formatea la fecha seleccionada
  const fechaSeleccionada = slotDate
    ? dayjs(slotDate).add(1, 'day').format("dddd, DD [de] MMMM [de] YYYY")
    : "";

  const handleSeleccionarJuzgado = (juzgado) => {
    setNuevoJuzgado(juzgado);
    setError("");
  };

  const handleGuardar = async () => {
    if (!nuevoJuzgado) {
      setError("Debe seleccionar un juzgado para el cambio.");
      return;
    }
    
    setIsChanging(true);
    setError("");
    
    try {
      await onChange(nuevoJuzgado, slotDate);
      showToastMsg("Turno cambiado correctamente");
      handleClose();
    } catch (error) {
      setError("Error al cambiar el turno. Intente nuevamente.");
    } finally {
      setIsChanging(false);
    }
  };

  const handleClose = () => {
    // Limpieza inmediata para cierre rápido
    setBusqueda("");
    setNuevoJuzgado(null);
    setError("");
    setIsChanging(false);
    setLoading(false);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="alert-dialog-backdrop">
      <div className="alert-dialog add-juzgado-dialog change-juzgado-dialog">
        <h1>Cambiar Turno de Juzgado</h1>
        
        {/* Información del turno actual */}
        <div className="turno-info">
          <div className="fecha-info">
            📅 Fecha: {fechaSeleccionada}
          </div>
          <div className="juzgado-actual">
            <strong>Juzgado actual:</strong>{" "}
            {currentJuzgado
              ? `${currentJuzgado.name} (${currentJuzgado.email})`
              : "No hay juzgado asignado"}
          </div>
        </div>

        {/* Campo de búsqueda */}
        <div className="input-busqueda">
          <input
            type="text"
            placeholder="Buscar juzgado por nombre, código o email..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            disabled={loading || isChanging}
          />
        </div>

        {/* Lista de juzgados */}
        <div className="juzgados-list">
          {loading ? (
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
                className={`juzgado-item ${nuevoJuzgado?.id === juzgado.id ? 'selected' : ''}`}
              >
                <div className="juzgado-name">
                  {juzgado.code} - {juzgado.name}
                  {nuevoJuzgado?.id === juzgado.id && (
                    <span className="selected-indicator">
                      ✓ Seleccionado
                    </span>
                  )}
                </div>
                <div className="juzgado-email">
                  📧 {juzgado.email}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Juzgado seleccionado */}
        {nuevoJuzgado && (
          <div className="juzgado-seleccionado">
            <div className="selection-title">
              ✅ Nuevo juzgado seleccionado:
            </div>
            <div className="selection-details">
              {nuevoJuzgado.code} - {nuevoJuzgado.name}
            </div>
            <div className="selection-details">
              📧 {nuevoJuzgado.email}
            </div>
          </div>
        )}

        {/* Mensaje de error */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Botones de acción */}
        <div className="dialog-actions flex-column">
          <button
            className={`edit-button-full confirm-button ${!nuevoJuzgado ? 'disabled' : ''}`}
            onClick={handleGuardar}
            disabled={!nuevoJuzgado || isChanging || loading}
          >
            {isChanging ? "Cambiando turno..." : "Confirmar Cambio"}
          </button>
          <button 
            className="close-button-full" 
            onClick={handleClose}
            disabled={isChanging}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
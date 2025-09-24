import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

// ✅ Configurar dayjs
dayjs.extend(utc);
dayjs.extend(timezone);

export default function DeleteFestiveDialog({ open, onClose, onDelete }) {
  const [step, setStep] = useState(1);
  const [festivs, setFestivs] = useState([]);
  const [festivoSeleccionado, setFestivoSeleccionado] = useState(null);
  
  const [loadingFestivs, setLoadingFestivs] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");

  // ✅ Función para normalizar fechas
  const normalizeFecha = (fechaString) => {
    if (typeof fechaString === 'string' && fechaString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dayjs(fechaString, 'YYYY-MM-DD');
    }
    return dayjs.utc(fechaString).local();
  };

  // ✅ Función para mostrar fechas
  const formatearFecha = (fechaString) => {
    return normalizeFecha(fechaString).format("DD/MM/YYYY");
  };

  // Cargar festivos cuando se abre el diálogo
  useEffect(() => {
    if (open) {
      cargarFestivs();
    }
  }, [open]);

  const cargarFestivs = async () => {
    setLoadingFestivs(true);
    setError(""); // ✅ Limpiar errores previos
    try {
      const response = await fetch("http://localhost:5000/api/festivs");
      
      // ✅ Verificar que la respuesta sea exitosa
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // ✅ Verificar que data sea un array
      if (Array.isArray(data)) {
        setFestivs(data);
      } else {
        console.error("La respuesta no es un array:", data);
        setFestivs([]);
        setError("Error: La respuesta del servidor no es válida");
      }
    } catch (error) {
      console.error("Error al cargar festivos:", error);
      setFestivs([]); // ✅ Asegurar que siempre sea un array
      setError(`Error al cargar festivos: ${error.message}`);
    } finally {
      setLoadingFestivs(false);
    }
  };

  const handleSeleccionarFestivo = (festivo) => {
    setFestivoSeleccionado(festivo);
    setError(""); // ✅ Limpiar errores al seleccionar
    setStep(2);
  };

  const handleEliminar = async () => {
    setIsDeleting(true);
    setError("");
    
    try {
      const response = await fetch(
        `http://localhost:5000/api/festivs/${festivoSeleccionado.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (response.ok) {
        const deletedData = {
          nombre: festivoSeleccionado.name,
          fecha: formatearFecha(festivoSeleccionado.date), // ✅ Usar fecha normalizada
        };

        // Limpiar y cerrar inmediatamente
        handleVolver();

        if (onDelete) {
          onDelete(deletedData);
        }
      } else {
        setError(result.error || "Error al eliminar el festivo");
      }
    } catch (error) {
      console.error("❌ Error al eliminar festivo:", error);
      setError(`Error de conexión: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleVolver = () => {
    setStep(1);
    setFestivoSeleccionado(null);
    setError("");
    setBusqueda("");
  };

  const handleDialogClose = () => {
    handleVolver();
    setLoadingFestivs(false);
    setIsDeleting(false);
    onClose();
  };

  // ✅ Filtrar con fechas normalizadas
  const festivsFiltrados = Array.isArray(festivs) ? festivs.filter(
    (f) =>
      f && f.name && 
      (f.name.toLowerCase().includes(busqueda.toLowerCase()) ||
      formatearFecha(f.date).includes(busqueda))
  ) : [];

  if (!open) return null;

  return (
    <div className="alert-dialog-backdrop">
      <div className="alert-dialog add-juzgado-dialog juzgado-management-dialog delete-juzgado-dialog">
        {step === 1 ? (
          // PASO 1: Lista de festivos
          <>
            <h1>Seleccionar Festivo para Eliminar</h1>
            
            <div className="step-indicator list-step">
              Paso 1: Seleccione el festivo que desea eliminar
            </div>
            
            <div className="search-input">
              <input
                type="text"
                placeholder="Buscar festivo por nombre o fecha..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            {/* ✅ Mostrar errores de carga */}
            {error && !loadingFestivs && (
              <div className="error-message">
                {error}
              </div>
            )}

            <div className="juzgados-list">
              {loadingFestivs ? (
                <div className="loading-state">
                  Cargando festivos...
                </div>
              ) : festivsFiltrados.length === 0 ? (
                <div className="empty-state">
                  {busqueda ? "No se encontraron festivos" : "No hay festivos disponibles"}
                </div>
              ) : (
                festivsFiltrados.map((festivo) => (
                  <div
                    key={festivo.id}
                    onClick={() => handleSeleccionarFestivo(festivo)}
                    className="juzgado-item delete-hover"
                  >
                    <div className="juzgado-name delete-mode">
                      {festivo.name}
                    </div>
                    <div className="juzgado-email">
                      📅 {formatearFecha(festivo.date)}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="action-buttons">
              <button className="cancel-button" onClick={handleDialogClose}>
                Cerrar
              </button>
            </div>
          </>
        ) : (
          // PASO 2: Confirmación de eliminación
          <>
            <h1>⚠️ Confirmar Eliminación</h1>
            
            <div className="confirm-delete-section">
              <div className="delete-warning">
                <div className="warning-title">
                  ¿Está seguro que desea eliminar este día festivo?
                </div>
                <div className="warning-subtitle">
                  Esta acción no se puede deshacer.
                </div>
                
                <div className="juzgado-details">
                  <div><strong>Nombre:</strong> {festivoSeleccionado?.name}</div>
                  <div><strong>Fecha:</strong> {formatearFecha(festivoSeleccionado?.date)}</div>
                </div>
              </div>
            </div>

            {error && (
              <div className="error-message center">
                {error}
              </div>
            )}

            <div className="action-buttons">
              <button
                className="primary-button delete-button"
                onClick={handleEliminar}
                disabled={isDeleting}
              >
                {isDeleting ? "Eliminando..." : "SÍ, ELIMINAR FESTIVO"}
              </button>
              <button
                className="secondary-button"
                onClick={handleVolver}
                disabled={isDeleting}
              >
                Volver a la Lista
              </button>
              <button
                className="cancel-button"
                onClick={handleDialogClose}
                disabled={isDeleting}
              >
                Cancelar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
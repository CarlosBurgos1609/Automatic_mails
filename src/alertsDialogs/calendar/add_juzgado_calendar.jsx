import React, { useState, useEffect } from "react";
import Copy from "../../components/Copy";
import TimeRangeFilter from "../../components/TimeRangeFilter";
import { 
  getJuzgadoStatsInTimeRange, 
  calculateTemporalStats,
  getDefaultPeriod
} from "../../utils/timeRangeUtils";
import dayjs from "dayjs";

export default function AddJuzgadoCalendarDialog({ open, onClose, onSave, slotDate, showToastMsg, isLoggedIn = false }) {
  const [busqueda, setBusqueda] = useState("");
  const [juzgadosData, setJuzgadosData] = useState([]);
  const [turnosData, setTurnosData] = useState([]);
  const [juzgadoSeleccionado, setJuzgadoSeleccionado] = useState(null);
  const [error, setError] = useState("");
  const [showCopy, setShowCopy] = useState(false);
  const [loadingJuzgados, setLoadingJuzgados] = useState(false);
  const [filtroActivo, setFiltroActivo] = useState("todos"); // "todos", "disponibles", "ocupados"
  const [timeRange, setTimeRange] = useState(null); // Nuevo estado para filtro temporal

  // Cargar juzgados desde el backend
  useEffect(() => {
    if (open) {
      cargarJuzgados();
      cargarTurnos();
      // Establecer período por defecto si no hay uno seleccionado
      if (!timeRange) {
        setTimeRange(getDefaultPeriod());
      }
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

  const cargarTurnos = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/turnos");
      const data = await response.json();
      setTurnosData(data);
    } catch (error) {
      console.error("Error al cargar turnos:", error);
      setTurnosData([]);
    }
  };

  // Función para obtener estadísticas de turnos por juzgado en el rango temporal
  const getJuzgadoStats = (juzgadoId) => {
    return getJuzgadoStatsInTimeRange(juzgadoId, turnosData, timeRange);
  };

  // Función para determinar el estado de un juzgado basado en el rango temporal
  const getJuzgadoStatus = (juzgado) => {
    const stats = getJuzgadoStats(juzgado.id);
    return {
      ...juzgado,
      ...stats,
      status: stats.tieneActivo ? "ocupado" : "disponible"
    };
  };

  // Aplicar estadísticas a todos los juzgados
  const juzgadosConEstado = juzgadosData.map(juzgado => getJuzgadoStatus(juzgado));

  // Filtrado de juzgados por nombre, código o email y por estado
  const juzgadosFiltrados = juzgadosConEstado.filter(
    (j) => {
      const coincideBusqueda = 
        j.name.toLowerCase().includes(busqueda.toLowerCase()) ||
        j.code.toLowerCase().includes(busqueda.toLowerCase()) ||
        (j.email && j.email.toLowerCase().includes(busqueda.toLowerCase()));
      
      const coincideFiltro = 
        filtroActivo === "todos" || 
        (filtroActivo === "disponibles" && j.status === "disponible") ||
        (filtroActivo === "ocupados" && j.status === "ocupado");
      
      return coincideBusqueda && coincideFiltro;
    }
  );

  // Estadísticas generales basadas en el rango temporal
  const estadisticas = timeRange ? 
    calculateTemporalStats(juzgadosData, turnosData, timeRange) :
    {
      total: juzgadosConEstado.length,
      disponibles: juzgadosConEstado.filter(j => j.status === "disponible").length,
      ocupados: juzgadosConEstado.filter(j => j.status === "ocupado").length
    };

  const handleSeleccionarJuzgado = (juzgado) => {
    setJuzgadoSeleccionado(juzgado);
    setError("");
  };

  const handleGuardar = () => {
    if (!isLoggedIn) {
      showToastMsg("Operación no disponible en este momento");
      return;
    }
    
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
    setFiltroActivo("todos");
    setTimeRange(null);
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

            {/* Filtro temporal */}
            <TimeRangeFilter
              selectedRange={timeRange}
              onRangeChange={setTimeRange}
              showInDialog={true}
              disabled={loadingJuzgados}
            />

            {/* Filtros de estado */}
            <div className="filtros-estado">
              <div className="filtros-botones">
                <button
                  className={`filtro-btn ${filtroActivo === "todos" ? "active" : ""}`}
                  onClick={() => setFiltroActivo("todos")}
                >
                  <span className="filtro-icon">📋</span>
                  Todos ({estadisticas.total})
                </button>
                <button
                  className={`filtro-btn disponible ${filtroActivo === "disponibles" ? "active" : ""}`}
                  onClick={() => setFiltroActivo("disponibles")}
                >
                  <span className="filtro-icon">✅</span>
                  Disponibles ({estadisticas.disponibles})
                </button>
                <button
                  className={`filtro-btn ocupado ${filtroActivo === "ocupados" ? "active" : ""}`}
                  onClick={() => setFiltroActivo("ocupados")}
                >
                  <span className="filtro-icon">🔴</span>
                  Con Turnos ({estadisticas.ocupados})
                </button>
              </div>
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
                    className={`juzgado-item ${juzgadoSeleccionado?.id === juzgado.id ? 'selected' : ''} ${juzgado.status}`}
                  >
                    <div className={`juzgado-header ${juzgadoSeleccionado?.id === juzgado.id ? 'selected' : ''}`}>
                      <div className="juzgado-info">
                        <span className={`status-indicator ${juzgado.status}`}>
                          {juzgado.status === "disponible" ? "🟢" : "🔴"}
                        </span>
                        {juzgado.code} - {juzgado.name}
                        {juzgado.status === "ocupado" && (
                          <span className="turnos-count">
                            ({juzgado.totalTurnos} turno{juzgado.totalTurnos !== 1 ? 's' : ''})
                          </span>
                        )}
                      </div>
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
              {/* ✅ NO MOSTRAR NINGÚN MENSAJE - RESTRICCIONES COMPLETAMENTE INVISIBLES */}
              
              <button
                className={`edit-button-full save-button ${!juzgadoSeleccionado || !isLoggedIn ? 'disabled' : ''}`}
                onClick={handleGuardar}
                disabled={!juzgadoSeleccionado || !isLoggedIn}
              >
                {!isLoggedIn 
                  ? "Seleccione un Juzgado" // ✅ SIN MENCIONAR AUTENTICACIÓN
                  : juzgadoSeleccionado 
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
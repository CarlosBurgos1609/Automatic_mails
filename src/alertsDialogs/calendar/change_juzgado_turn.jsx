import React, { useState, useEffect } from "react";
import TimeRangeFilter from "../../components/TimeRangeFilter";
import { 
  getJuzgadoTemporalStatusInRange,
  calculateTemporalStats,
  getDefaultPeriod
} from "../../utils/timeRangeUtils";
import dayjs from "dayjs";
import { 
  FaExchangeAlt, 
  FaClipboardList, 
  FaCheckCircle, 
  FaBackward, 
  FaForward, 
  FaCalendarAlt, 
  FaChartBar, 
  FaEnvelope,
  FaNewspaper
} from "react-icons/fa"; 

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
  const [turnosData, setTurnosData] = useState([]);
  const [nuevoJuzgado, setNuevoJuzgado] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isChanging, setIsChanging] = useState(false);
  const [filtroTemporal, setFiltroTemporal] = useState("todos"); // "todos", "ya-paso", "por-venir", "disponibles"
  const [timeRange, setTimeRange] = useState(null); // Nuevo estado para filtro temporal

  // Cargar juzgados desde el backend
  useEffect(() => {
    if (open) {
      setLoading(true);
      Promise.all([
        fetch("http://localhost:5000/api/juzgados").then(res => res.json()),
        fetch("http://localhost:5000/api/turnos").then(res => res.json())
      ])
        .then(([juzgadosResponse, turnosResponse]) => {
          setJuzgadosData(juzgadosResponse);
          setTurnosData(turnosResponse);
          setError("");
          // Establecer período por defecto si no hay uno seleccionado
          if (!timeRange) {
            setTimeRange(getDefaultPeriod());
          }
        })
        .catch(() => {
          setJuzgadosData([]);
          setTurnosData([]);
          setError("No se pudieron cargar los datos.");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [open]);

  // Función para obtener el estado temporal de un juzgado en el rango seleccionado
  const getJuzgadoTemporalStatus = (juzgado) => {
    return getJuzgadoTemporalStatusInRange(juzgado, turnosData, timeRange);
  };

  // Aplicar estado temporal a todos los juzgados
  const juzgadosConEstado = juzgadosData.map(juzgado => getJuzgadoTemporalStatus(juzgado));

  // Filtrado de juzgados por nombre/email y por estado temporal
  const juzgadosFiltrados = juzgadosConEstado.filter(
    (j) => {
      const coincideBusqueda = 
        j.name.toLowerCase().includes(busqueda.toLowerCase()) ||
        (j.email && j.email.toLowerCase().includes(busqueda.toLowerCase())) ||
        j.code.toLowerCase().includes(busqueda.toLowerCase());
      
      const coincideFiltro = 
        filtroTemporal === "todos" || 
        (filtroTemporal === "ya-paso" && j.status === "ya-paso") ||
        (filtroTemporal === "por-venir" && (j.status === "por-venir" || j.status === "sin-turnos")) ||
        (filtroTemporal === "disponibles" && j.status === "sin-turnos");
      
      return coincideBusqueda && coincideFiltro;
    }
  );

  // Estadísticas temporales basadas en el rango seleccionado
  const estadisticasTemporales = timeRange ? 
    calculateTemporalStats(juzgadosData, turnosData, timeRange) :
    {
      total: juzgadosConEstado.length,
      yaPasaron: juzgadosConEstado.filter(j => j.status === "ya-paso").length,
      porVenir: juzgadosConEstado.filter(j => j.status === "por-venir" || j.status === "sin-turnos").length,
      disponibles: juzgadosConEstado.filter(j => j.status === "sin-turnos").length
    };

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
    setFiltroTemporal("todos");
    setTimeRange(null);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="alert-dialog-backdrop">
      <div className="alert-dialog add-juzgado-dialog change-juzgado-dialog">
        <h1><FaExchangeAlt /> Cambiar Turno de Juzgado</h1>
        
        {/* Información del turno actual */}
        <div className="turno-info">
          <div className="fecha-info">
            <FaCalendarAlt /> Fecha: {fechaSeleccionada}
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

        {/* Filtro temporal */}
        <TimeRangeFilter
          selectedRange={timeRange}
          onRangeChange={setTimeRange}
          showInDialog={true}
          disabled={loading || isChanging}
        />

        {/* Filtros temporales */}
        <div className="filtros-temporales">
          <div className="filtros-botones">
            <button
              className={`filtro-btn ${filtroTemporal === "todos" ? "active" : ""}`}
              onClick={() => setFiltroTemporal("todos")}
              disabled={loading || isChanging}
            >
              <span className="filtro-icon"><FaClipboardList /></span>
              Todos ({estadisticasTemporales.total})
            </button>
            <button
              className={`filtro-btn disponibles ${filtroTemporal === "disponibles" ? "active" : ""}`}
              onClick={() => setFiltroTemporal("disponibles")}
              disabled={loading || isChanging}
            >
              <span className="filtro-icon">✅</span>
              Disponibles ({estadisticasTemporales.disponibles})
            </button>
            <button
              className={`filtro-btn ya-paso ${filtroTemporal === "ya-paso" ? "active" : ""}`}
              onClick={() => setFiltroTemporal("ya-paso")}
              disabled={loading || isChanging}
            >
              <span className="filtro-icon">⏮️</span>
              Ya Pasaron ({estadisticasTemporales.yaPasaron})
            </button>
            <button
              className={`filtro-btn por-venir ${filtroTemporal === "por-venir" ? "active" : ""}`}
              onClick={() => setFiltroTemporal("por-venir")}
              disabled={loading || isChanging}
            >
              <span className="filtro-icon">⏭️</span>
              Por Venir ({estadisticasTemporales.porVenir})
            </button>
          </div>
        </div>

        {/* Contenido con scroll */}
        <div className="dialog-scroll-content">
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
                className={`juzgado-item ${nuevoJuzgado?.id === juzgado.id ? 'selected' : ''} ${juzgado.status}`}
              >
                <div className={`juzgado-header ${nuevoJuzgado?.id === juzgado.id ? 'selected' : ''}`}>
                  <div className="juzgado-info">
                    <span className={`status-temporal-indicator ${juzgado.status}`}>
                      {juzgado.status === "ya-paso" ? <FaBackward /> : 
                       juzgado.status === "por-venir" ? <FaForward /> : 
                       juzgado.status === "sin-turnos" ? <FaNewspaper /> : <FaCalendarAlt />}
                    </span>
                    <div className="juzgado-details">
                      <div className="juzgado-name">
                        {juzgado.code} - {juzgado.name}
                      </div>
                      {juzgado.status !== "sin-turnos" && (
                        <div className="juzgado-temporal-info">
                          <div className="temporal-header">
                            {juzgado.status === "ya-paso" && (
                              <span className="temporal-title"><FaBackward /> Turnos pasados:</span>
                            )}
                            {juzgado.status === "por-venir" && (
                              <span className="temporal-title"><FaForward /> Próximos turnos:</span>
                            )}
                            
                            {/* Fechas individuales y contador en la misma línea */}
                            <div className="fechas-container">
                              {juzgado.fechasArray && juzgado.fechasArray.length > 0 ? (
                                juzgado.fechasArray.map((fecha, index) => (
                                  <span key={index} className={`fecha-individual ${juzgado.status}`}>
                                    <FaCalendarAlt /> {fecha}
                                  </span>
                                ))
                              ) : (
                                <span className={`fecha-individual ${juzgado.status}`}>
                                  <FaCalendarAlt /> {juzgado.ultimaFecha}
                                </span>
                              )}
                            </div>
                            
                            {/* Contador de turnos en la misma línea */}
                            <div className="turnos-counter">
                              <span className="turnos-count">
                                <FaChartBar /> {juzgado.totalTurnos} turno{juzgado.totalTurnos !== 1 ? 's' : ''}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                      {juzgado.status === "sin-turnos" && (
                        <div className="juzgado-temporal-info">
                          <span className="temporal-tag sin-turnos">
                            Sin turnos asignados
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  {nuevoJuzgado?.id === juzgado.id && (
                    <span className="selected-indicator">
                      ✓
                    </span>
                  )}
                </div>
                <div className="juzgado-email">
                  <FaEnvelope /> {juzgado.email}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Juzgado seleccionado */}
        {nuevoJuzgado && (
          <div className="juzgado-seleccionado">
            <div className="selection-title">
              <FaCheckCircle /> Nuevo juzgado seleccionado:
            </div>
            <div className="selection-details">
              {nuevoJuzgado.code} - {nuevoJuzgado.name}
            </div>
            <div className="selection-details">
              <FaEnvelope /> {nuevoJuzgado.email}
            </div>
          </div>
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
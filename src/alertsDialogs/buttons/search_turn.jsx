import React, { useState, useEffect } from "react";
import TimeRangeFilter from "../../components/TimeRangeFilter";
import { 
  getJuzgadoTemporalStatusInRange,
  calculateTemporalStats,
  getDefaultPeriod
} from "../../utils/timeRangeUtils";
import dayjs from "dayjs";
import { 
  FaSearch, 
  FaClipboardList, 
  FaCheckCircle, 
  FaBackward, 
  FaForward, 
  FaCalendarAlt, 
  FaChartBar, 
  FaEnvelope,
  FaEye,
  FaNewspaper
} from "react-icons/fa"; 

export default function SearchTurnDialog({
  open,
  onClose,
}) {
  const [busqueda, setBusqueda] = useState("");
  const [juzgadosData, setJuzgadosData] = useState([]);
  const [turnosData, setTurnosData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtroTemporal, setFiltroTemporal] = useState("todos"); // "todos", "ya-paso", "por-venir", "disponibles"
  const [timeRange, setTimeRange] = useState(null); // Estado para filtro temporal

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
          // Establecer período por defecto si no hay uno seleccionado
          if (!timeRange) {
            setTimeRange(getDefaultPeriod());
          }
        })
        .catch(() => {
          setJuzgadosData([]);
          setTurnosData([]);
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

  const handleClose = () => {
    // Limpieza inmediata para cierre rápido
    setBusqueda("");
    setLoading(false);
    setFiltroTemporal("todos");
    setTimeRange(null);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="alert-dialog-backdrop">
      <div className="alert-dialog search-turn-dialog">
        <h1><FaSearch /> Buscar Juzgado de Turno</h1>
        
        {/* Información del filtro actual */}
        <div className="search-info">
          <div className="info-text">
            <FaChartBar /> Consulta los juzgados de turno según el período seleccionado
          </div>
        </div>

        {/* Campo de búsqueda */}
        <div className="input-busqueda">
          <input
            type="text"
            placeholder="Buscar juzgado por nombre, código o email..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            disabled={loading}
          />
        </div>

        {/* Filtro temporal */}
        <TimeRangeFilter
          selectedRange={timeRange}
          onRangeChange={setTimeRange}
          showInDialog={true}
          disabled={loading}
        />

        {/* Filtros temporales */}
        <div className="filtros-temporales">
          <div className="filtros-botones">
            <button
              className={`filtro-btn ${filtroTemporal === "todos" ? "active" : ""}`}
              onClick={() => setFiltroTemporal("todos")}
              disabled={loading}
            >
              <span className="filtro-icon"><FaClipboardList /></span>
              Todos ({estadisticasTemporales.total})
            </button>
            <button
              className={`filtro-btn disponibles ${filtroTemporal === "disponibles" ? "active" : ""}`}
              onClick={() => setFiltroTemporal("disponibles")}
              disabled={loading}
            >
              <span className="filtro-icon"><FaCheckCircle /></span>
              Disponibles ({estadisticasTemporales.disponibles})
            </button>
            <button
              className={`filtro-btn ya-paso ${filtroTemporal === "ya-paso" ? "active" : ""}`}
              onClick={() => setFiltroTemporal("ya-paso")}
              disabled={loading}
            >
              <span className="filtro-icon"><FaBackward /></span>
              Ya Pasaron ({estadisticasTemporales.yaPasaron})
            </button>
            <button
              className={`filtro-btn por-venir ${filtroTemporal === "por-venir" ? "active" : ""}`}
              onClick={() => setFiltroTemporal("por-venir")}
              disabled={loading}
            >
              <span className="filtro-icon"><FaForward /></span>
              Por Venir ({estadisticasTemporales.porVenir})
            </button>
          </div>
        </div>

        {/* Contenido con scroll - SOLO LECTURA */}
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
                  className={`juzgado-item readonly ${juzgado.status}`}
                >
                  <div className="juzgado-header readonly">
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
                  </div>
                  <div className="juzgado-email">
                    <FaEnvelope /> {juzgado.email}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Botón de cerrar - solo uno */}
        <div className="dialog-actions flex-column">
          <button 
            className="close-button-full" 
            onClick={handleClose}
            disabled={loading}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import Copy from "../../components/Copy";
import TimeRangeFilter from "../../components/TimeRangeFilter";
import { 
  getJuzgadoTemporalStatusInRange, 
  calculateTemporalStats,
  getDefaultPeriod
} from "../../utils/timeRangeUtils";
import dayjs from "dayjs";
import { 
  FaPlus, 
  FaCalendarAlt, 
  FaClipboardList, 
  FaCheckCircle, 
  FaBackward, 
  FaForward,
  FaChartBar,
  FaEnvelope,
  FaNewspaper
} from "react-icons/fa";

export default function AddJuzgadoCalendarDialog({ open, onClose, onSave, slotDate, showToastMsg, isLoggedIn = false }) {
  const [busqueda, setBusqueda] = useState("");
  const [juzgadosData, setJuzgadosData] = useState([]);
  const [turnosData, setTurnosData] = useState([]);
  const [juzgadoSeleccionado, setJuzgadoSeleccionado] = useState(null);
  const [error, setError] = useState("");
  const [showCopy, setShowCopy] = useState(false);
  const [loadingJuzgados, setLoadingJuzgados] = useState(false);
  const [filtroTemporal, setFiltroTemporal] = useState("todos"); // "todos", "ya-paso", "por-venir", "disponibles"
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

  // Función para obtener el estado temporal de un juzgado en el rango seleccionado
  const getJuzgadoTemporalStatus = (juzgado) => {
    return getJuzgadoTemporalStatusInRange(juzgado, turnosData, timeRange);
  };

  // Aplicar estado temporal a todos los juzgados
  const juzgadosConEstado = juzgadosData.map(juzgado => getJuzgadoTemporalStatus(juzgado));

  // Filtrado de juzgados por nombre, código o email y por estado temporal
  const juzgadosFiltrados = juzgadosConEstado.filter(
    (j) => {
      const coincideBusqueda = 
        j.name.toLowerCase().includes(busqueda.toLowerCase()) ||
        j.code.toLowerCase().includes(busqueda.toLowerCase()) ||
        (j.email && j.email.toLowerCase().includes(busqueda.toLowerCase()));
      
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
    setFiltroTemporal("todos");
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
                <FaCalendarAlt /> Fecha seleccionada: {fechaSeleccionada}
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

            {/* Filtros temporales */}
            <div className="filtros-temporales">
              <div className="filtros-botones">
                <button
                  className={`filtro-btn ${filtroTemporal === "todos" ? "active" : ""}`}
                  onClick={() => setFiltroTemporal("todos")}
                  disabled={loadingJuzgados}
                >
                  <span className="filtro-icon"><FaClipboardList /></span>
                  Todos ({estadisticasTemporales.total})
                </button>
                <button
                  className={`filtro-btn disponibles ${filtroTemporal === "disponibles" ? "active" : ""}`}
                  onClick={() => setFiltroTemporal("disponibles")}
                  disabled={loadingJuzgados}
                >
                  <span className="filtro-icon"><FaCheckCircle /></span>
                  Disponibles ({estadisticasTemporales.disponibles})
                </button>
                <button
                  className={`filtro-btn ya-paso ${filtroTemporal === "ya-paso" ? "active" : ""}`}
                  onClick={() => setFiltroTemporal("ya-paso")}
                  disabled={loadingJuzgados}
                >
                  <span className="filtro-icon"><FaBackward /></span>
                  Ya Pasaron ({estadisticasTemporales.yaPasaron})
                </button>
                <button
                  className={`filtro-btn por-venir ${filtroTemporal === "por-venir" ? "active" : ""}`}
                  onClick={() => setFiltroTemporal("por-venir")}
                  disabled={loadingJuzgados}
                >
                  <span className="filtro-icon"><FaForward /></span>
                  Por Venir ({estadisticasTemporales.porVenir})
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
                      {juzgadoSeleccionado?.id === juzgado.id && (
                        <span className="selected-indicator">
                          ✓
                        </span>
                      )}
                    </div>
                    <div className="juzgado-email">
                      <FaEnvelope /> {juzgado.email}
                      {juzgadoSeleccionado?.id === juzgado.id && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyEmail();
                          }}
                          className="quick-copy-btn"
                        >
                          <FaClipboardList /> Copiar
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
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import dayjs from "dayjs";
import "dayjs/locale/es";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { Calendar, dayjsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";

// Components
import Header from "./header";
import Buttons from "../components/buttons";
import Toast from "../components/Copy";
import LoadingDialog from "../components/calendar/LoadingDialog";
import SaveJuzgadoDialog from "../components/juzgados_dialogs/save_juzgado_dialog";
import SaveFestivDialog from "../components/festiv/save_festiv_dialog";

// Error Dialogs
import ErrorJuzgadoDialog from "../components/juzgados_dialogs/error_juzgado_dialog";
import ErrorFestivDialog from "../components/festiv/error_festiv_dialog";

// Graphics
import AreaChartInteractive from "../grafics/area";
import PieChartSimple from "../grafics/pie";
import RadialChartSimple from "../grafics/radial";
import RadarChartComponent from "../grafics/radar1";

// ✅ AGREGAR IMPORT DE ESTADÍSTICAS
import StatsCards from "../components/StatsCards";
import { ChartsProvider } from "../contexts/ChartsContext"; 
import GlobalChartFilters from "../components/grafics/GlobalChartFilters";

// Dialogs
import JuzgadoDialog from "../alertsDialogs/date_section/open_juzgado_dialog";
import ViewJuzgadoDialog from "../alertsDialogs/calendar/view_juzgado";
import AddJuzgadoCalendarDialog from "../alertsDialogs/calendar/add_juzgado_calendar";
import ChangeJuzgadoTurnDialog from "../alertsDialogs/calendar/change_juzgado_turn";
import AddJuzgadoDialog from "../alertsDialogs/juzgados/add_juzgado";
import EditJuzgadoDialog from "../alertsDialogs/juzgados/edit_juzgado";
import DeleteJuzgadoDialog from "../alertsDialogs/juzgados/delete_juzgado";
import GeneralJuzgadosDialog from "../alertsDialogs/juzgados/general_juzgados";
// ✅ QUITAR IMPORT DE FestivDialog
import GeneralFestivsDialog from "../alertsDialogs/festivs/general_festivs";

// Styles
import "../styles/styles.scss";

// ===== DAYJS CONFIGURATION =====
dayjs.locale("es");
dayjs.extend(utc);
dayjs.extend(timezone);

dayjs.locale("es", {
  ...dayjs.Ls.es,
  weekStart: 0,
});

// ===== CALENDAR CONFIGURATION =====
const localizer = dayjsLocalizer(dayjs);

const Home = () => {
  // ===== STATE MANAGEMENT =====
  
  // General states
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [juzgados, setJuzgados] = useState([]);
  const [turnos, setTurnos] = useState([]);
  const [todayTurnos, setTodayTurnos] = useState([]);
  // AGREGAR ESTADO PARA FESTIVOS
  const [festivs, setFestivs] = useState([]);
  const [loadingTurnos, setLoadingTurnos] = useState(false);
  
  // Calendar states
  const [view, setView] = useState("month");
  const [date, setDate] = useState(new Date());
  const [range, setRange] = useState({ start: null, end: null });
  
  // Dialog states
  const [showDialog, setShowDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showChangeDialog, setShowChangeDialog] = useState(false);
  const [showAddJuzgadoDialog, setShowAddJuzgadoDialog] = useState(false);
  
  // ✅ QUITAR ESTADOS DEL DIÁLOGO DE FESTIVOS HOVER
  // const [showFestivDialog, setShowFestivDialog] = useState(false);
  // const [selectedFestivo, setSelectedFestivo] = useState(null);
  // const [festivDialogPosition, setFestivDialogPosition] = useState({ x: 0, y: 0 });
  
  // Juzgado management states
  const [showGeneralJuzgadosDialog, setShowGeneralJuzgadosDialog] = useState(false);
  const [showAddNewJuzgadoDialog, setShowAddNewJuzgadoDialog] = useState(false);
  const [showEditJuzgadoDialog, setShowEditJuzgadoDialog] = useState(false);
  const [showDeleteJuzgadoDialog, setShowDeleteJuzgadoDialog] = useState(false);
  
  // Juzgado success/error states
  const [showJuzgadoSuccessDialog, setShowJuzgadoSuccessDialog] = useState(false);
  const [showJuzgadoErrorDialog, setShowJuzgadoErrorDialog] = useState(false);
  const [juzgadoErrorMessage, setJuzgadoErrorMessage] = useState("");
  const [juzgadoOperationType, setJuzgadoOperationType] = useState("guardar");
  
  // Festivos states
  const [showGeneralFestivsDialog, setShowGeneralFestivsDialog] = useState(false);
  
  // Festivos success/error states
  const [showFestivSuccessDialog, setShowFestivSuccessDialog] = useState(false);
  const [showFestivErrorDialog, setShowFestivErrorDialog] = useState(false);
  const [festivErrorMessage, setFestivErrorMessage] = useState("");
  const [festivOperationType, setFestivOperationType] = useState("guardar");

  // Data states
  const [selectedJuzgado, setSelectedJuzgado] = useState(null);
  const [selectedSlotDate, setSelectedSlotDate] = useState(null);
  const [changeTurnData, setChangeTurnData] = useState(null);
  const [savedJuzgadoData, setSavedJuzgadoData] = useState(null);
  const [savedFestivData, setSavedFestivData] = useState(null);
  
  // Mode states
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  
  // Toast states
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastMsgs, setToastMsgs] = useState([]);

  // ===== COMPUTED VALUES =====
  
  const events = useMemo(() => {
    if (juzgados.length === 0 || turnos.length === 0) return [];
    return turnos.map((turno) => {
      const juzgado = juzgados.find((j) => j.id === turno.juzgado_id) || {};
      const start = dayjs
        .tz(turno.turn_date, "America/Bogota")
        .hour(0)
        .minute(0)
        .second(0)
        .millisecond(0)
        .toDate();
      const end = dayjs
        .tz(turno.turn_date, "America/Bogota")
        .hour(23)
        .minute(59)
        .second(59)
        .millisecond(999)
        .toDate();
      return {
        title: juzgado.name || "Juzgado",
        email: juzgado.email || "",
        start,
        end,
        turno_id: turno.id,
        turn_date: turno.turn_date,
        juzgado_id: juzgado.id,
      };
    });
  }, [juzgados, turnos]);

  // ✅ COMPUTED VALUE PARA FECHAS FESTIVAS
  const festiveDates = useMemo(() => {
    if (!Array.isArray(festivs)) return new Set();
    
    const dates = new Set();
    festivs.forEach(festiv => {
      if (festiv.date) {
        const dateStr = dayjs(festiv.date).format('YYYY-MM-DD');
        dates.add(dateStr);
      }
    });
    
    return dates;
  }, [festivs]);

  const turnoHoy = useMemo(() => {
    const hoy = dayjs().tz("America/Bogota").format("YYYY-MM-DD");
    return todayTurnos.find(
      (t) =>
        dayjs.tz(t.turn_date, "America/Bogota").format("YYYY-MM-DD") === hoy
    );
  }, [todayTurnos]);

  const juzgadoHoy = useMemo(() => {
    if (!turnoHoy) return null;
    return juzgados.find((j) => j.id === turnoHoy.juzgado_id);
  }, [juzgados, turnoHoy]);

  // ===== DATA LOADING FUNCTIONS =====
  
  const cargarJuzgados = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/juzgados");
      setJuzgados(res.data);
    } catch (error) {
      console.error("Error al cargar juzgados:", error);
      setJuzgados([]);
    }
  };

  // ✅ FUNCIÓN PARA CARGAR FESTIVOS
  const cargarFestivs = async () => {
    try {
      console.log('🔍 Cargando festivos...');
      const res = await axios.get("http://localhost:5000/api/festivs");
      console.log('✅ Festivos cargados:', res.data);
      setFestivs(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("❌ Error al cargar festivos:", error);
      setFestivs([]);
    }
  };

  const cargarTurnos = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/turnos");
      setTurnos(res.data);

      const hoy = dayjs().tz("America/Bogota").format("YYYY-MM-DD");
      const resHoy = await axios.get("http://localhost:5000/api/turnos", {
        params: { start: hoy, end: hoy },
      });
      setTodayTurnos(resHoy.data);
    } catch {
      setTurnos([]);
      setTodayTurnos([]);
    }
  };

  const recargarDatos = async () => {
    await Promise.all([cargarJuzgados(), cargarTurnos(), cargarFestivs()]);
  };

  // ===== EFFECTS =====
  
  useEffect(() => {
    // ✅ CARGAR JUZGADOS Y FESTIVOS AL INICIO
    cargarJuzgados();
    cargarFestivs();
  }, []);

  useEffect(() => {
    const cargarTurnosHoy = async () => {
      try {
        const hoy = dayjs().tz("America/Bogota").format("YYYY-MM-DD");
        const res = await axios.get("http://localhost:5000/api/turnos", {
          params: { start: hoy, end: hoy },
        });
        setTodayTurnos(res.data);
      } catch {
        setTodayTurnos([]);
      }
    };

    cargarTurnosHoy();
  }, []);

  useEffect(() => {
    setLoadingTurnos(true);
    axios
      .get("http://localhost:5000/api/turnos")
      .then((res) => {
        setTurnos(res.data);
        setLoadingTurnos(false);
      })
      .catch(() => {
        setTurnos([]);
        setLoadingTurnos(false);
      });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (range.start && range.end) {
      setLoadingTurnos(true);
      axios
        .get("http://localhost:5000/api/turnos", {
          params: { start: range.start, end: range.end },
        })
        .then((res) => setTurnos(res.data))
        .catch(() => setTurnos([]))
        .finally(() => setLoadingTurnos(false));
    }
  }, [range.start, range.end]);

  useEffect(() => {
    const startOfMonth = dayjs().startOf("month").format("YYYY-MM-DD");
    const endOfMonth = dayjs().endOf("month").format("YYYY-MM-DD");
    setRange({ start: startOfMonth, end: endOfMonth });
  }, []);

  // ===== UTILITY FUNCTIONS =====
  
  const formatDateTime = (date) => {
    const options = {
      timeZone: "America/Bogota",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    };
    return date.toLocaleString("es-CO", options);
  };

  const showToastMsg = (msg) => {
    setToastMsgs((prev) => [...prev, msg]);
    setTimeout(() => {
      setToastMsgs((prev) => prev.slice(1));
    }, 2000);
  };

  // ✅ FUNCIÓN ACTUALIZADA PARA INCLUIR DÍAS FESTIVOS (MANTENER SOLO LOS ESTILOS)
  const dayPropGetter = (date) => {
    const isToday = dayjs(date).isSame(dayjs(), "day");
    const dateStr = dayjs(date).format('YYYY-MM-DD');
    const isFestive = festiveDates.has(dateStr);
    
    let className = "";
    let style = {};
    let dataProps = {};
    
    if (isToday) {
      className = "rbc-today";
      style = { 
        backgroundColor: "#bafaba", 
        border: "2px solid #003f75" 
      };
    }
    
    if (isFestive) {
      className += " rbc-festive-day";
      
      const festivoInfo = festivs.find(f => dayjs(f.date).format('YYYY-MM-DD') === dateStr);
      if (festivoInfo) {
        style = {
          ...style,
          position: 'relative'
        };
        
        dataProps['data-festivo-name'] = `🎉 ${festivoInfo.name}`;
        dataProps['data-festivo-date'] = dayjs(festivoInfo.date).format('DD/MM/YYYY');
      }
    }
    
    return { 
      className, 
      style,
      ...dataProps
    };
  };

  // ✅ FUNCIÓN PARA OBTENER FESTIVO DE UNA FECHA
  const getFestivoByDate = (date) => {
    if (!date || !Array.isArray(festivs)) return null;
    
    const dateStr = dayjs(date).format('YYYY-MM-DD');
    return festivs.find(f => dayjs(f.date).format('YYYY-MM-DD') === dateStr);
  };

  const eventPropGetter = (event) => {
    return {
      style: {
        backgroundColor: "#bdf3bd",
        color: "#003f75",
        borderRadius: "4px",
        border: "1px solid #003f75",
      },
    };
  };

  // ===== EVENT HANDLERS =====
  
  // ✅ FUNCIÓN SIMPLIFICADA - QUITAR LÓGICA DE FESTIVOS HOVER
  const handleSelectSlot = ({ start }) => {
    const hasEvent = events.some((ev) =>
      dayjs(ev.start).isSame(dayjs(start), "day")
    );
    
    // ✅ SOLO ABRIR DIÁLOGO PARA AGREGAR TURNO SI NO HAY EVENTO
    if (!hasEvent) {
      setSelectedSlotDate(start);
      setShowAddDialog(true);
    }
  };

  const handleSelectEvent = (event) => {
    setSelectedJuzgado({
      nombre: event.title,
      email: event.email,
      turno_id: event.turno_id,
      turn_date: event.turn_date,
      juzgado_id: event.juzgado_id,
    });
    setShowViewDialog(true);
  };

  const handleCopyEmail = () => {
    if (juzgadoHoy && juzgadoHoy.email) {
      navigator.clipboard.writeText(juzgadoHoy.email).then(() => {
        showToastMsg("¡Se copió con éxito!");
      });
    }
  };

  const handleSaveJuzgado = async (juzgado, date) => {
    try {
      if (!juzgado?.id || !date) {
        console.error("Datos incompletos:", { juzgado, date });
        showToastMsg("Error: Faltan datos del juzgado o fecha");
        return;
      }

      const turn_date = dayjs(date).format("YYYY-MM-DD");
      const response = await axios.post("http://localhost:5000/api/turnos", {
        juzgado_id: juzgado.id,
        turn_date,
        estado_id: 1,
      });

      await recargarDatos();
      showToastMsg("Turno guardado correctamente");
    } catch (err) {
      console.error("Error al guardar el turno:", err);
      showToastMsg(`Error al guardar el turno: ${err.response?.data?.error || err.message}`);
    }
  };

  const handleRangeChange = (range) => {
    let start, end;
    if (Array.isArray(range)) {
      start = dayjs(range[0]).format("YYYY-MM-DD");
      end = dayjs(range[range.length - 1]).format("YYYY-MM-DD");
    } else if (range.start && range.end) {
      start = dayjs(range.start).format("YYYY-MM-DD");
      end = dayjs(range.end).format("YYYY-MM-DD");
    } else {
      start = dayjs().startOf("day").format("YYYY-MM-DD");
      end = dayjs().endOf("day").format("YYYY-MM-DD");
    }
    setRange({ start, end });
  };

  // ===== JUZGADO MANAGEMENT HANDLERS =====
  
  const handleSaveNuevoJuzgado = async (juzgadoData) => {
    try {
      setShowAddNewJuzgadoDialog(false);
      setShowGeneralJuzgadosDialog(false);
      setSavedJuzgadoData(juzgadoData);
      setIsEditMode(false);
      setIsDeleteMode(false);
      setShowJuzgadoSuccessDialog(true);
      await recargarDatos();
    } catch (error) {
      setJuzgadoErrorMessage(error.message || "Error desconocido al guardar el juzgado");
      setJuzgadoOperationType("guardar");
      setShowJuzgadoErrorDialog(true);
    }
  };

  const handleSaveEditJuzgado = async (juzgadoData) => {
    try {
      setShowEditJuzgadoDialog(false);
      setShowGeneralJuzgadosDialog(false);
      setSavedJuzgadoData(juzgadoData);
      setIsEditMode(true);
      setIsDeleteMode(false);
      setShowJuzgadoSuccessDialog(true);
      await recargarDatos();
    } catch (error) {
      setJuzgadoErrorMessage(error.message || "Error desconocido al actualizar el juzgado");
      setJuzgadoOperationType("editar");
      setShowJuzgadoErrorDialog(true);
    }
  };

  const handleDeleteJuzgado = async (juzgadoData) => {
    try {
      setShowDeleteJuzgadoDialog(false);
      setShowGeneralJuzgadosDialog(false);
      setSavedJuzgadoData(juzgadoData);
      setIsEditMode(false);
      setIsDeleteMode(true);
      setShowJuzgadoSuccessDialog(true);
      await recargarDatos();
    } catch (error) {
      setJuzgadoErrorMessage(error.message || "Error desconocido al eliminar el juzgado");
      setJuzgadoOperationType("eliminar");
      setShowJuzgadoErrorDialog(true);
    }
  };

  const handleJuzgadoSuccessDialogClose = () => {
    setShowJuzgadoSuccessDialog(false);
    setSavedJuzgadoData(null);
    setIsEditMode(false);
    setIsDeleteMode(false);
  };

  const handleJuzgadoErrorDialogClose = () => {
    setShowJuzgadoErrorDialog(false);
    setJuzgadoErrorMessage("");
    setJuzgadoOperationType("guardar");
  };

  // ===== FESTIVOS HANDLERS - CORREGIDOS =====
  
  const handleSaveNuevoFestivo = async (festivoData) => {
    try {
      console.log('✅ Home - Recibido nuevo festivo:', festivoData);
      
      // ✅ CERRAR EL DIÁLOGO GENERAL
      setShowGeneralFestivsDialog(false);
      
      // ✅ ESTABLECER DATOS DEL FESTIVO GUARDADO
      setSavedFestivData(festivoData);
      setIsEditMode(false);
      setIsDeleteMode(false);
      
      // ✅ MOSTRAR DIÁLOGO DE ÉXITO
      setShowFestivSuccessDialog(true);
      
      // ✅ RECARGAR FESTIVOS PARA ACTUALIZAR EL CALENDARIO
      await cargarFestivs();
      
      console.log('✅ Home - Mostrando diálogo de éxito para nuevo festivo');
    } catch (error) {
      console.error('❌ Home - Error al manejar nuevo festivo:', error);
      setFestivErrorMessage(error.message || "Error desconocido al guardar el día festivo");
      setFestivOperationType("guardar");
      setShowFestivErrorDialog(true);
    }
  };

  const handleSaveEditFestivo = async (festivoData) => {
    try {
      console.log('✅ Home - Recibido festivo editado:', festivoData);
      
      // ✅ CERRAR EL DIÁLOGO GENERAL
      setShowGeneralFestivsDialog(false);
      
      // ✅ ESTABLECER DATOS DEL FESTIVO EDITADO
      setSavedFestivData(festivoData);
      setIsEditMode(true);
      setIsDeleteMode(false);
      
      // ✅ MOSTRAR DIÁLOGO DE ÉXITO
      setShowFestivSuccessDialog(true);
      
      // ✅ RECARGAR FESTIVOS PARA ACTUALIZAR EL CALENDARIO
      await cargarFestivs();
      
      console.log('✅ Home - Mostrando diálogo de éxito para festivo editado');
    } catch (error) {
      console.error('❌ Home - Error al manejar festivo editado:', error);
      setFestivErrorMessage(error.message || "Error desconocido al actualizar el día festivo");
      setFestivOperationType("editar");
      setShowFestivErrorDialog(true);
    }  
  };

  const handleDeleteFestivo = async (festivoData) => {
    try {
      console.log('✅ Home - Recibido festivo eliminado:', festivoData);
      
      // ✅ CERRAR EL DIÁLOGO GENERAL
      setShowGeneralFestivsDialog(false);
      
      // ✅ ESTABLECER DATOS DEL FESTIVO ELIMINADO
      setSavedFestivData(festivoData);
      setIsEditMode(false);
      setIsDeleteMode(true);
      
      // ✅ MOSTRAR DIÁLOGO DE ÉXITO
      setShowFestivSuccessDialog(true);
      
      // ✅ RECARGAR FESTIVOS PARA ACTUALIZAR EL CALENDARIO
      await cargarFestivs();
      
      console.log('✅ Home - Mostrando diálogo de éxito para festivo eliminado');
    } catch (error) {
      console.error('❌ Home - Error al manejar festivo eliminado:', error);
      setFestivErrorMessage(error.message || "Error desconocido al eliminar el día festivo");
      setFestivOperationType("eliminar");
      setShowFestivErrorDialog(true);
    }
  };

  // ✅ HANDLERS DE ERROR PARA FESTIVOS
  const handleFestivError = (errorMessage, operationType) => {
    console.error('❌ Home - Error en festivo:', { errorMessage, operationType });
    
    // ✅ CERRAR DIÁLOGO GENERAL SI ESTÁ ABIERTO
    setShowGeneralFestivsDialog(false);
    
    // ✅ MOSTRAR ERROR
    setFestivErrorMessage(errorMessage);
    setFestivOperationType(operationType);
    setShowFestivErrorDialog(true);
  };

  const handleFestivSuccessDialogClose = () => {
    setShowFestivSuccessDialog(false);
    setSavedFestivData(null);
    setIsEditMode(false);
    setIsDeleteMode(false);
  };

  const handleFestivErrorDialogClose = () => {
    setShowFestivErrorDialog(false);
    setFestivErrorMessage("");
    setFestivOperationType("guardar");
  };

  // ===== RENDER =====
  
  return (
    // {/* ✅ ENVOLVER TODO EN EL PROVIDER */}
    <ChartsProvider>
      <div className="home-container">
        <Header />
        
        <div className="title">
          <h1>Automatización de Correos Electrónicos</h1>
        </div>
        
        <div className="flex-row content-wrapper">
          <div className="flex-row content-003">
            <div className="flex-column date-section">
              <div className="date-time">
                <h1>Fecha y Hora Actual</h1>
              </div>
              <div className="date-time">
                <p>{formatDateTime(currentDateTime)}</p>
              </div>
            </div>
            
            <div className="flex-column juzgado-section">
              <div className="juzgado ">
                <h1>Juzgado Abierto</h1>
              </div>
              <div className="name-juzgado flex-column">
                <h1
                  style={{ cursor: "pointer" }}
                  onClick={() => setShowDialog(true)}
                >
                  {juzgadoHoy ? juzgadoHoy.name : "No hay juzgado de turno hoy"}
                </h1>
                <div className="juzgado-email flex-row">
                  <h2
                    style={{ cursor: "pointer" }}
                    onClick={() => setShowDialog(true)}
                  >
                    {juzgadoHoy ? juzgadoHoy.email : ""}
                  </h2>
                  {juzgadoHoy && (
                    <button className="copy-button" onClick={handleCopyEmail}>
                      Copiar
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="linear-divide flex-column">
          <hr />
        </div>
        
        <div className="calendar-container">
          <LoadingDialog
            open={loadingTurnos}
            message="Cargando turnos del mes..."
          />
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: "600px" }}
            views={["month", "week", "day"]}
            view={view}
            date={date}
            onView={setView}
            onNavigate={setDate}
            selectable={true}
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            onRangeChange={handleRangeChange}
            dayPropGetter={dayPropGetter}
            eventPropGetter={eventPropGetter}
            culture="es"
            messages={{
              month: "Mes",
              week: "Semana",
              day: "Día",
              today: "Hoy",
              previous: "Anterior",
              next: "Siguiente",
              agenda: "Agenda",
            }}
          />
        </div>
        
        <div className="download-container">
          <Buttons 
            onJuzgadosClick={() => setShowGeneralJuzgadosDialog(true)}
            onFestivsClick={() => setShowGeneralFestivsDialog(true)}
          />
        </div>
        
        <div className="linear-divide flex-column">
          <hr />
        </div>
        
        <div className="grafic-content flex-column">
          <div className="title">
            <h1>Gráficas</h1>
          </div>
          
          {/* ✅ AGREGAR FILTROS GLOBALES */}
          <GlobalChartFilters />
          
          {/* ✅ AGREGAR ESTADÍSTICAS ANTES DE LAS GRÁFICAS */}
          <StatsCards />
          
          <div className="area-chart-full">
            <AreaChartInteractive />
          </div>
          <div className="other-charts-row flex-row">
            <PieChartSimple />
            <RadialChartSimple />
            <RadarChartComponent />
          </div>
        </div>
        
        <div className="linear-divide flex-column">
          <hr />
        </div>
        

        {/* Toast notifications */}
        <div className="toast-container">
          {toastMsgs.map((msg, idx) => (
            <Toast key={idx} show={true} message={msg} />
          ))}
        </div>

        {/* Main dialogs */}
        <JuzgadoDialog
          open={showDialog}
          onClose={() => setShowDialog(false)}
          juzgadoHoy={juzgadoHoy}
          showToastMsg={showToastMsg}
        />
        
        <ViewJuzgadoDialog
          open={showViewDialog}
          onClose={() => {
            setShowViewDialog(false);
            setSelectedJuzgado(null);
          }}
          juzgado={selectedJuzgado}
          showToastMsg={showToastMsg}
          onTurnoEliminado={cargarTurnos}
          onChangeTurn={(juzgado) => {
            setChangeTurnData(juzgado);
            setShowViewDialog(false);
            setShowChangeDialog(true);
          }}
          // ✅ PASAR FESTIVO SI EXISTE
          festivo={selectedJuzgado ? getFestivoByDate(selectedJuzgado.turn_date) : null}
        />
        
        <AddJuzgadoCalendarDialog
          open={showAddDialog}
          onClose={() => setShowAddDialog(false)}
          onSave={handleSaveJuzgado}
          slotDate={selectedSlotDate}
          showToastMsg={showToastMsg}
        />
        
        <ChangeJuzgadoTurnDialog
          open={showChangeDialog}
          onClose={() => setShowChangeDialog(false)}
          onChange={async (nuevoJuzgado, slotDate) => {
            try {
              await axios.put(
                `http://localhost:5000/api/turnos/${changeTurnData.turno_id}`,
                {
                  nuevo_juzgado_id: nuevoJuzgado.id,
                  turn_date: changeTurnData.turn_date,
                }
              );
              showToastMsg("Turno cambiado correctamente");
              setShowChangeDialog(false);
              await recargarDatos();
            } catch (err) {
              showToastMsg("Error al cambiar el turno");
            }
          }}
          slotDate={changeTurnData?.turn_date}
          currentJuzgado={
            changeTurnData && {
              name: changeTurnData.nombre,
              email: changeTurnData.email,
              id: changeTurnData.juzgado_id,
            }
          }
          showToastMsg={showToastMsg}
        />

        {/* Juzgado management dialogs */}
        <GeneralJuzgadosDialog
          open={showGeneralJuzgadosDialog}
          onClose={() => setShowGeneralJuzgadosDialog(false)}
          onAddJuzgado={() => {
            setShowGeneralJuzgadosDialog(false);
            setShowAddNewJuzgadoDialog(true);
          }}
          onEditJuzgado={() => {
            setShowGeneralJuzgadosDialog(false);
            setShowEditJuzgadoDialog(true);
          }}
          onDeleteJuzgado={() => {
            setShowGeneralJuzgadosDialog(false);
            setShowDeleteJuzgadoDialog(true);
          }}
        />

        <AddJuzgadoDialog
          open={showAddNewJuzgadoDialog}
          onClose={() => setShowAddNewJuzgadoDialog(false)}
          onSave={handleSaveNuevoJuzgado}
        />

        <EditJuzgadoDialog
          open={showEditJuzgadoDialog}
          onClose={() => setShowEditJuzgadoDialog(false)}
          onSave={handleSaveEditJuzgado}
        />

        <DeleteJuzgadoDialog
          open={showDeleteJuzgadoDialog}
          onClose={() => setShowDeleteJuzgadoDialog(false)}
          onDelete={handleDeleteJuzgado}
        />

        {/* Festivos management dialogs - CORREGIDO */}
        <GeneralFestivsDialog
          open={showGeneralFestivsDialog}
          onClose={() => setShowGeneralFestivsDialog(false)}
          onAddFestiv={handleSaveNuevoFestivo}
          onEditFestiv={handleSaveEditFestivo}
          onDeleteFestivo={handleDeleteFestivo}
          onError={handleFestivError}
        />

        {/* ===== SUCCESS DIALOGS ===== */}
        
        {/* Juzgado success dialog */}
        <SaveJuzgadoDialog
          show={showJuzgadoSuccessDialog}
          onClose={handleJuzgadoSuccessDialogClose}
          juzgadoData={savedJuzgadoData}
          municipioName={savedJuzgadoData?.municipio_name || ""}
          isEdit={isEditMode}
          isDelete={isDeleteMode}
        />

        {/* ✅ Festiv success dialog */}
        <SaveFestivDialog
          show={showFestivSuccessDialog}
          onClose={handleFestivSuccessDialogClose}
          festivData={savedFestivData}
          isEdit={isEditMode}
          isDelete={isDeleteMode}
        />

        {/* ===== ERROR DIALOGS ===== */}
        
        {/* Juzgado error dialog */}
        <ErrorJuzgadoDialog
          show={showJuzgadoErrorDialog}
          onClose={handleJuzgadoErrorDialogClose}
          errorMessage={juzgadoErrorMessage}
          operationType={juzgadoOperationType}
        />

        {/* ✅ Festiv error dialog */}
        <ErrorFestivDialog
          show={showFestivErrorDialog}
          onClose={handleFestivErrorDialogClose}
          errorMessage={festivErrorMessage}
          operationType={festivOperationType}
        />

        {/* ✅ QUITAR COMPLETAMENTE EL DIÁLOGO DE FESTIVO HOVER */}

      </div>
    </ChartsProvider>
  );
};

export default Home;

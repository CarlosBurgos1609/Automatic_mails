import React, { useState, useEffect, useMemo, useCallback } from "react";
import Header from "./header";
import "../styles/styles.scss";
import { Calendar, dayjsLocalizer } from "react-big-calendar";
import dayjs from "dayjs";
import "dayjs/locale/es";
import "react-big-calendar/lib/css/react-big-calendar.css";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import AreaChartInteractive from "../grafics/area";
import PieChartSimple from "../grafics/pie";
import RadialChartSimple from "../grafics/radial";
import RadarChartComponent from "../grafics/radar1";
import Toast from "../components/Copy";
import JuzgadoDialog from "../alertsDialogs/date_section/open_juzgado_dialog";
import ViewJuzgadoDialog from "../alertsDialogs/calendar/view_juzgado";
import Buttons from "../components/buttons";
import AddJuzgadoCalendarDialog from "../alertsDialogs/calendar/add_juzgado_calendar";
import axios from "axios";
import ChangeJuzgadoTurnDialog from "../alertsDialogs/calendar/change_juzgado_turn";
import LoadingDialog from "../components/LoadingDialog";
import AddJuzgadoDialog from "../alertsDialogs/juzgados/add_juzgado";
import EditJuzgadoDialog from "../alertsDialogs/juzgados/edit_juzgado";
import DeleteJuzgadoDialog from "../alertsDialogs/juzgados/delete_juzgado";
import SaveJuzgadoDialog from "../components/save_juzgado_dialog";
import GeneralJuzgadosDialog from "../alertsDialogs/juzgados/general_juzgados";

// Configuración inicial de dayjs (solo una vez)
dayjs.locale("es");
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale("es", { ...dayjs.Ls.es, weekStart: 0 });

const localizer = dayjsLocalizer(dayjs);

// Configuraciones constantes
const TIMEZONE = "America/Bogota";
const API_BASE = "http://localhost:5000/api";

const Home = () => {
  // Estados principales
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [view, setView] = useState("month");
  const [date, setDate] = useState(new Date());
  
  // Estados de datos
  const [juzgados, setJuzgados] = useState([]);
  const [turnos, setTurnos] = useState([]);
  const [todayTurnos, setTodayTurnos] = useState([]);
  
  // Estados de diálogos - agrupados para mejor performance
  const [dialogs, setDialogs] = useState({
    showDialog: false,
    showViewDialog: false,
    showAddDialog: false,
    showChangeDialog: false,
    showAddJuzgadoDialog: false,
    showGeneralJuzgadosDialog: false,
    showAddNewJuzgadoDialog: false,
    showEditJuzgadoDialog: false,
    showDeleteJuzgadoDialog: false,
    showJuzgadoSuccessDialog: false,
  });
  
  // Estados auxiliares
  const [selectedJuzgado, setSelectedJuzgado] = useState(null);
  const [selectedSlotDate, setSelectedSlotDate] = useState(null);
  const [changeTurnData, setChangeTurnData] = useState(null);
  const [toastMsgs, setToastMsgs] = useState([]);
  const [loadingTurnos, setLoadingTurnos] = useState(false);
  const [range, setRange] = useState({ start: null, end: null });
  
  // Estados para juzgados
  const [savedJuzgadoData, setSavedJuzgadoData] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleteMode, setIsDeleteMode] = useState(false);

  // Función helper para actualizar diálogos
  const updateDialog = useCallback((dialogName, value) => {
    setDialogs(prev => ({ ...prev, [dialogName]: value }));
  }, []);

  // API calls optimizadas
  const apiCalls = useMemo(() => ({
    fetchJuzgados: async () => {
      try {
        const res = await axios.get(`${API_BASE}/juzgados`);
        return res.data;
      } catch (error) {
        console.error("Error al cargar juzgados:", error);
        return [];
      }
    },
    
    fetchTurnos: async (params = {}) => {
      try {
        const res = await axios.get(`${API_BASE}/turnos`, { params });
        return res.data;
      } catch (error) {
        console.error("Error al cargar turnos:", error);
        return [];
      }
    },
    
    fetchTodayTurnos: async () => {
      const hoy = dayjs().tz(TIMEZONE).format("YYYY-MM-DD");
      return apiCalls.fetchTurnos({ start: hoy, end: hoy });
    }
  }), []);

  // Cargar datos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      setLoadingTurnos(true);
      
      try {
        const [juzgadosData, turnosData, todayData] = await Promise.all([
          apiCalls.fetchJuzgados(),
          apiCalls.fetchTurnos(),
          apiCalls.fetchTodayTurnos()
        ]);
        
        setJuzgados(juzgadosData);
        setTurnos(turnosData);
        setTodayTurnos(todayData);
      } catch (error) {
        console.error("Error cargando datos iniciales:", error);
      } finally {
        setLoadingTurnos(false);
      }
    };

    loadInitialData();
  }, [apiCalls]);

  // Optimizar actualización de fecha/hora (cada 30 segundos en lugar de 10)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Memoizar eventos del calendario
  const events = useMemo(() => {
    if (!juzgados.length || !turnos.length) return [];
    
    return turnos.map((turno) => {
      const juzgado = juzgados.find((j) => j.id === turno.juzgado_id) || {};
      const start = dayjs.tz(turno.turn_date, TIMEZONE).startOf('day').toDate();
      const end = dayjs.tz(turno.turn_date, TIMEZONE).endOf('day').toDate();
      
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

  // Memoizar juzgado de hoy
  const juzgadoHoy = useMemo(() => {
    const hoy = dayjs().tz(TIMEZONE).format("YYYY-MM-DD");
    const turnoHoy = todayTurnos.find(t => 
      dayjs.tz(t.turn_date, TIMEZONE).format("YYYY-MM-DD") === hoy
    );
    
    if (!turnoHoy) return null;
    return juzgados.find(j => j.id === turnoHoy.juzgado_id);
  }, [todayTurnos, juzgados]);

  // Funciones optimizadas
  const showToastMsg = useCallback((msg) => {
    setToastMsgs(prev => [...prev, msg]);
    setTimeout(() => {
      setToastMsgs(prev => prev.slice(1));
    }, 2000);
  }, []);

  const formatDateTime = useCallback((date) => {
    return date.toLocaleString("es-CO", {
      timeZone: TIMEZONE,
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }, []);

  const recargarDatos = useCallback(async () => {
    try {
      const [juzgadosData, turnosData, todayData] = await Promise.all([
        apiCalls.fetchJuzgados(),
        apiCalls.fetchTurnos(),
        apiCalls.fetchTodayTurnos()
      ]);
      
      setJuzgados(juzgadosData);
      setTurnos(turnosData);
      setTodayTurnos(todayData);
    } catch (error) {
      console.error("Error recargando datos:", error);
    }
  }, [apiCalls]);

  // Handlers para eventos del calendario
  const handleSelectSlot = useCallback(({ start }) => {
    const hasEvent = events.some(ev => dayjs(ev.start).isSame(dayjs(start), "day"));
    if (!hasEvent) {
      setSelectedSlotDate(start);
      updateDialog('showAddDialog', true);
    }
  }, [events, updateDialog]);

  const handleSelectEvent = useCallback((event) => {
    setSelectedJuzgado({
      nombre: event.title,
      email: event.email,
      turno_id: event.turno_id,
      turn_date: event.turn_date,
      juzgado_id: event.juzgado_id,
    });
    updateDialog('showViewDialog', true);
  }, [updateDialog]);

  const handleCopyEmail = useCallback(() => {
    if (juzgadoHoy?.email) {
      navigator.clipboard.writeText(juzgadoHoy.email).then(() => {
        showToastMsg("¡Se copió con éxito!");
      });
    }
  }, [juzgadoHoy?.email, showToastMsg]);

  // Handlers para gestión de juzgados
  const handleSaveNuevoJuzgado = useCallback(async (juzgadoData) => {
    updateDialog('showAddNewJuzgadoDialog', false);
    updateDialog('showGeneralJuzgadosDialog', false);
    
    setSavedJuzgadoData(juzgadoData);
    setIsEditMode(false);
    setIsDeleteMode(false);
    updateDialog('showJuzgadoSuccessDialog', true);
    
    await recargarDatos();
  }, [updateDialog, recargarDatos]);

  const handleSaveEditJuzgado = useCallback(async (juzgadoData) => {
    updateDialog('showEditJuzgadoDialog', false);
    updateDialog('showGeneralJuzgadosDialog', false);
    
    setSavedJuzgadoData(juzgadoData);
    setIsEditMode(true);
    setIsDeleteMode(false);
    updateDialog('showJuzgadoSuccessDialog', true);
    
    await recargarDatos();
  }, [updateDialog, recargarDatos]);

  const handleDeleteJuzgado = useCallback(async (juzgadoData) => {
    updateDialog('showDeleteJuzgadoDialog', false);
    updateDialog('showGeneralJuzgadosDialog', false);
    
    setSavedJuzgadoData(juzgadoData);
    setIsEditMode(false);
    setIsDeleteMode(true);
    updateDialog('showJuzgadoSuccessDialog', true);
    
    await recargarDatos();
  }, [updateDialog, recargarDatos]);

  // Props para el calendario (memoizadas)
  const calendarProps = useMemo(() => ({
    dayPropGetter: (date) => {
      const isToday = dayjs(date).isSame(dayjs(), "day");
      return {
        className: isToday ? "rbc-today" : "",
        style: isToday
          ? { backgroundColor: "#bafaba", border: "2px solid #003f75" }
          : {},
      };
    },
    
    eventPropGetter: () => ({
      style: {
        backgroundColor: "#bdf3bd",
        color: "#003f75",
        borderRadius: "4px",
        border: "1px solid #003f75",
      },
    }),
    
    messages: {
      month: "Mes",
      week: "Semana",
      day: "Día",
      today: "Hoy",
      previous: "Anterior",
      next: "Siguiente",
      agenda: "Agenda",
    }
  }), []);

  return (
    <div className="home-container">
      <Header />
      <div className="title">
        <h1>Automatización de Correos Electrónicos</h1>
      </div>
      
      {/* Sección principal */}
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
            <div className="juzgado">
              <h1>Juzgado Abierto</h1>
            </div>
            <div className="name-juzgado flex-column">
              <h1
                style={{ cursor: "pointer" }}
                onClick={() => updateDialog('showDialog', true)}
              >
                {juzgadoHoy ? juzgadoHoy.name : "No hay juzgado de turno hoy"}
              </h1>
              <div className="juzgado-email flex-row">
                <h2
                  style={{ cursor: "pointer" }}
                  onClick={() => updateDialog('showDialog', true)}
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

      {/* Calendario */}
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
          dayPropGetter={calendarProps.dayPropGetter}
          eventPropGetter={calendarProps.eventPropGetter}
          culture="es"
          messages={calendarProps.messages}
        />
      </div>

      <div className="download-container">
        <Buttons onJuzgadosClick={() => updateDialog('showGeneralJuzgadosDialog', true)} />
      </div>

      {/* Gráficas - Lazy loading opcional */}
      <div className="linear-divide flex-column">
        <hr />
      </div>
      <div className="grafic-content flex-column">
        <div className="title">
          <h1>Gráficas</h1>
        </div>
        <div className="area-chart-full">
          <AreaChartInteractive />
        </div>
        <div className="other-charts-row flex-row">
          <PieChartSimple />
          <RadialChartSimple />
          <RadarChartComponent />
        </div>
      </div>

      {/* Lista de juzgados */}
      <div className="linear-divide flex-column">
        <hr />
      </div>
      <div className="table-container flex-column">
        <div className="title">
          <h1>Lista de Juzgados</h1>
        </div>
        <div className="table-content"></div>
      </div>

      {/* Toasts */}
      <div className="toast-container">
        {toastMsgs.map((msg, idx) => (
          <Toast key={idx} show={true} message={msg} />
        ))}
      </div>

      {/* Todos los diálogos */}
      <JuzgadoDialog
        open={dialogs.showDialog}
        onClose={() => updateDialog('showDialog', false)}
        juzgadoHoy={juzgadoHoy}
        showToastMsg={showToastMsg}
      />

      <ViewJuzgadoDialog
        open={dialogs.showViewDialog}
        onClose={() => {
          updateDialog('showViewDialog', false);
          setSelectedJuzgado(null);
        }}
        juzgado={selectedJuzgado}
        showToastMsg={showToastMsg}
        onTurnoEliminado={recargarDatos}
        onChangeTurn={(juzgado) => {
          setChangeTurnData(juzgado);
          updateDialog('showViewDialog', false);
          updateDialog('showChangeDialog', true);
        }}
      />

      <AddJuzgadoCalendarDialog
        open={dialogs.showAddDialog}
        onClose={() => updateDialog('showAddDialog', false)}
        onSave={async (juzgado, date) => {
          try {
            const turn_date = dayjs(date).format("YYYY-MM-DD");
            await axios.post(`${API_BASE}/turnos`, {
              juzgado_id: juzgado.id,
              turn_date,
              estado_id: 1,
            });
            await recargarDatos();
            showToastMsg("Turno guardado correctamente");
          } catch (err) {
            showToastMsg("Error al guardar el turno");
          }
        }}
        slotDate={selectedSlotDate}
        showToastMsg={showToastMsg}
      />

      {/* Diálogos de gestión de juzgados */}
      <GeneralJuzgadosDialog
        open={dialogs.showGeneralJuzgadosDialog}
        onClose={() => updateDialog('showGeneralJuzgadosDialog', false)}
        onAddJuzgado={() => {
          updateDialog('showGeneralJuzgadosDialog', false);
          updateDialog('showAddNewJuzgadoDialog', true);
        }}
        onEditJuzgado={() => {
          updateDialog('showGeneralJuzgadosDialog', false);
          updateDialog('showEditJuzgadoDialog', true);
        }}
        onDeleteJuzgado={() => {
          updateDialog('showGeneralJuzgadosDialog', false);
          updateDialog('showDeleteJuzgadoDialog', true);
        }}
      />

      <AddJuzgadoDialog
        open={dialogs.showAddNewJuzgadoDialog}
        onClose={() => updateDialog('showAddNewJuzgadoDialog', false)}
        onSave={handleSaveNuevoJuzgado}
      />

      <EditJuzgadoDialog
        open={dialogs.showEditJuzgadoDialog}
        onClose={() => updateDialog('showEditJuzgadoDialog', false)}
        onSave={handleSaveEditJuzgado}
      />

      <DeleteJuzgadoDialog
        open={dialogs.showDeleteJuzgadoDialog}
        onClose={() => updateDialog('showDeleteJuzgadoDialog', false)}
        onDelete={handleDeleteJuzgado}
      />

      <SaveJuzgadoDialog
        show={dialogs.showJuzgadoSuccessDialog}
        onClose={() => {
          updateDialog('showJuzgadoSuccessDialog', false);
          setSavedJuzgadoData(null);
          setIsEditMode(false);
          setIsDeleteMode(false);
        }}
        juzgadoData={savedJuzgadoData}
        municipioName={savedJuzgadoData?.municipio_name}
        isEdit={isEditMode}
        isDelete={isDeleteMode}
      />
    </div>
  );
};

export default Home;

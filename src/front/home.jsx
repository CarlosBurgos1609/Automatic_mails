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

// Graphics
import AreaChartInteractive from "../grafics/area";
import PieChartSimple from "../grafics/pie";
import RadialChartSimple from "../grafics/radial";
import RadarChartComponent from "../grafics/radar1";

// Dialogs
import JuzgadoDialog from "../alertsDialogs/date_section/open_juzgado_dialog";
import ViewJuzgadoDialog from "../alertsDialogs/calendar/view_juzgado";
import AddJuzgadoCalendarDialog from "../alertsDialogs/calendar/add_juzgado_calendar";
import ChangeJuzgadoTurnDialog from "../alertsDialogs/calendar/change_juzgado_turn";
import AddJuzgadoDialog from "../alertsDialogs/juzgados/add_juzgado";
import EditJuzgadoDialog from "../alertsDialogs/juzgados/edit_juzgado";
import DeleteJuzgadoDialog from "../alertsDialogs/juzgados/delete_juzgado";
import GeneralJuzgadosDialog from "../alertsDialogs/juzgados/general_juzgados";
import FestivDialog from "../alertsDialogs/festivs/general_festivs";
// import SaveJuzgadoDialog from "../components/save_juzgado_dialog";

// Styles
import "../styles/styles.scss";

// ===== DAYJS CONFIGURATION =====
dayjs.locale("es");
dayjs.extend(utc);
dayjs.extend(timezone);

dayjs.locale("es", {
  ...dayjs.Ls.es,
  weekStart: 0, // 0 = domingo, 1 = lunes
});

// ===== CALENDAR CONFIGURATION =====
const localizer = dayjsLocalizer(dayjs);

const formats = {
  ...localizer.formats,
  firstDayOfWeek: 0, // 0 representa el domingo
};

const Home = () => {
  // ===== STATE MANAGEMENT =====
  
  // General states
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [juzgados, setJuzgados] = useState([]);
  const [turnos, setTurnos] = useState([]);
  const [todayTurnos, setTodayTurnos] = useState([]);
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
  
  // Juzgado management states
  const [showGeneralJuzgadosDialog, setShowGeneralJuzgadosDialog] = useState(false);
  const [showAddNewJuzgadoDialog, setShowAddNewJuzgadoDialog] = useState(false);
  const [showEditJuzgadoDialog, setShowEditJuzgadoDialog] = useState(false);
  const [showDeleteJuzgadoDialog, setShowDeleteJuzgadoDialog] = useState(false);
  const [showJuzgadoSuccessDialog, setShowJuzgadoSuccessDialog] = useState(false);
  
  // Festivos states
  const [showGeneralFestivsDialog, setShowGeneralFestivsDialog] = useState(false);
  const [showFestivSuccessDialog, setShowFestivSuccessDialog] = useState(false);
  const [savedFestivData, setSavedFestivData] = useState(null);
  const [isFestivEditMode, setIsFestivEditMode] = useState(false);
  const [isFestivDeleteMode, setIsFestivDeleteMode] = useState(false);

  // Selection and data states
  const [selectedJuzgado, setSelectedJuzgado] = useState(null);
  const [selectedSlotDate, setSelectedSlotDate] = useState(null);
  const [changeTurnData, setChangeTurnData] = useState(null);
  const [savedJuzgadoData, setSavedJuzgadoData] = useState(null);
  
  // Mode states
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  
  // Toast states
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastMsgs, setToastMsgs] = useState([]);

  // ===== COMPUTED VALUES =====
  
  // Events for calendar
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

  // Today's shift
  const turnoHoy = useMemo(() => {
    const hoy = dayjs().tz("America/Bogota").format("YYYY-MM-DD");
    return todayTurnos.find(
      (t) =>
        dayjs.tz(t.turn_date, "America/Bogota").format("YYYY-MM-DD") === hoy
    );
  }, [todayTurnos]);

  // Today's juzgado
  const juzgadoHoy = useMemo(() => {
    if (!turnoHoy) return null;
    return juzgados.find((j) => j.id === turnoHoy.juzgado_id);
  }, [juzgados, turnoHoy]);

  // Selected day shift
  const turnoDiaSeleccionado = useMemo(() => {
    if (view === "week" || view === "day") {
      const diaSeleccionado = dayjs(date)
        .tz("America/Bogota")
        .format("YYYY-MM-DD");
      return turnos.find(
        (t) =>
          dayjs.tz(t.turn_date, "America/Bogota").format("YYYY-MM-DD") ===
          diaSeleccionado
      );
    }
    return null;
  }, [view, date, turnos]);

  // Selected day juzgado
  const juzgadoDiaSeleccionado = useMemo(() => {
    if (!turnoDiaSeleccionado) return null;
    return juzgados.find((j) => j.id === turnoDiaSeleccionado.juzgado_id);
  }, [juzgados, turnoDiaSeleccionado]);

  // Juzgado to display
  const juzgadoParaMostrar = useMemo(() => {
    if (view === "week" || view === "day") {
      return juzgadoDiaSeleccionado;
    }
    return juzgadoHoy;
  }, [view, juzgadoHoy, juzgadoDiaSeleccionado]);

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
    await Promise.all([cargarJuzgados(), cargarTurnos()]);
  };

  // ===== EFFECTS =====
  
  // Load initial data
  useEffect(() => {
    cargarJuzgados();
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

  // Update current time
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Handle range changes
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

  // Set initial month range
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

  const dayPropGetter = (date) => {
    const isToday = dayjs(date).isSame(dayjs(), "day");
    return {
      className: isToday ? "rbc-today" : "",
      style: isToday
        ? { backgroundColor: "#bafaba", border: "2px solid #003f75" }
        : {},
    };
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
  
  const handleSelectSlot = ({ start }) => {
    const hasEvent = events.some((ev) =>
      dayjs(ev.start).isSame(dayjs(start), "day")
    );
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
      console.log("Enviando datos al backend:", {
        juzgado_id: juzgado.id,
        turn_date,
        estado_id: 1,
      });

      const response = await axios.post("http://localhost:5000/api/turnos", {
        juzgado_id: juzgado.id,
        turn_date,
        estado_id: 1,
      });

      console.log("Respuesta del backend:", response.data);
      await recargarDatos();
      showToastMsg("Turno guardado correctamente");
    } catch (err) {
      console.error(
        "Error al guardar el turno:",
        err.response?.data || err.message
      );
      showToastMsg(
        `Error al guardar el turno: ${err.response?.data?.error || err.message}`
      );
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
    setShowAddNewJuzgadoDialog(false);
    setShowGeneralJuzgadosDialog(false);
    setSavedJuzgadoData(juzgadoData);
    setIsEditMode(false);
    setIsDeleteMode(false);
    setShowJuzgadoSuccessDialog(true);
    await recargarDatos();
  };

  const handleSaveEditJuzgado = async (juzgadoData) => {
    setShowEditJuzgadoDialog(false);
    setShowGeneralJuzgadosDialog(false);
    setSavedJuzgadoData(juzgadoData);
    setIsEditMode(true);
    setIsDeleteMode(false);
    setShowJuzgadoSuccessDialog(true);
    await recargarDatos();
  };

  const handleDeleteJuzgado = async (juzgadoData) => {
    setShowDeleteJuzgadoDialog(false);
    setShowGeneralJuzgadosDialog(false);
    setSavedJuzgadoData(juzgadoData);
    setIsEditMode(false);
    setIsDeleteMode(true);
    setShowJuzgadoSuccessDialog(true);
    await recargarDatos();
  };

  const handleJuzgadoSuccessDialogClose = () => {
    setShowJuzgadoSuccessDialog(false);
    setSavedJuzgadoData(null);
    setIsEditMode(false);
    setIsDeleteMode(false);
  };

  // ===== FESTIVOS HANDLERS =====
  
  const handleSaveNuevoFestivo = async (festivoData) => {
    try {
      const response = await fetch("http://localhost:5000/api/festivs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: festivoData.nombre,
          date: festivoData.fecha,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setSavedFestivData(festivoData);
        setIsFestivEditMode(false);
        setIsFestivDeleteMode(false);
        setShowFestivSuccessDialog(true);
        showToastMsg("Día festivo agregado correctamente");
      } else {
        showToastMsg(`Error: ${result.error}`);
      }
    } catch (error) {
      showToastMsg("Error al agregar el día festivo");
    }
  };

  const handleSaveEditFestivo = async (festivoData) => {
    setSavedFestivData(festivoData);
    setIsFestivEditMode(true);
    setIsFestivDeleteMode(false);
    setShowFestivSuccessDialog(true);
    showToastMsg("Día festivo actualizado correctamente");
  };

  const handleDeleteFestivo = async (festivoData) => {
    setSavedFestivData(festivoData);
    setIsFestivEditMode(false);
    setIsFestivDeleteMode(true);
    setShowFestivSuccessDialog(true);
    showToastMsg("Día festivo eliminado correctamente");
  };

  const handleFestivSuccessDialogClose = () => {
    setShowFestivSuccessDialog(false);
    setSavedFestivData(null);
    setIsFestivEditMode(false);
    setIsFestivDeleteMode(false);
  };

  // ===== RENDER =====
  
  return (
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
      
      <div className="table-container flex-column">
        <div className="title">
          <h1>Lista de Juzgados</h1>
        </div>
        <div className="table-content"></div>
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
      
      <AddJuzgadoDialog
        open={showAddJuzgadoDialog}
        onClose={() => setShowAddJuzgadoDialog(false)}
        onSave={recargarDatos}
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

      {/* Festivos management dialogs */}
      <FestivDialog
        open={showGeneralFestivsDialog}
        onClose={() => setShowGeneralFestivsDialog(false)}
        onAddFestiv={handleSaveNuevoFestivo}
        onEditFestiv={handleSaveEditFestivo}
        onDeleteFestiv={handleDeleteFestivo}
      />

      {/* Success dialog for festivs */}
      <SaveJuzgadoDialog
        show={showFestivSuccessDialog}
        onClose={handleFestivSuccessDialogClose}
        juzgadoData={savedFestivData && {
          codigo: "FESTIVO",
          nombre: savedFestivData.nombre,
          correo: savedFestivData.fecha,
        }}
        municipioName={isFestivDeleteMode ? "ELIMINADO" : isFestivEditMode ? "ACTUALIZADO" : "AGREGADO"}
        isEdit={isFestivEditMode}
        isDelete={isFestivDeleteMode}
      />
    </div>
  );
};

export default Home;

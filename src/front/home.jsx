import React, { useState, useEffect, useMemo } from "react";
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
// ...resto del código...
// Extiende plugins solo una vez
dayjs.locale("es");
dayjs.extend(utc);
dayjs.extend(timezone);

// Usa el localizer solo una vez
const localizer = dayjsLocalizer(dayjs);

const Home = () => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [view, setView] = useState("month");
  const [date, setDate] = useState(new Date());
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedJuzgado, setSelectedJuzgado] = useState(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedSlotDate, setSelectedSlotDate] = useState(null);
  const [showChangeDialog, setShowChangeDialog] = useState(false);
  const [changeTurnData, setChangeTurnData] = useState(null);
  const email = "juzgado007pasto@ejemplo.com";

  const [juzgados, setJuzgados] = useState([]);
  const [turnos, setTurnos] = useState([]);
  const [toastMsgs, setToastMsgs] = useState([]);

  // Cargar juzgados
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/juzgados")
      .then((res) => setJuzgados(res.data))
      .catch(() => setJuzgados([]));
  }, []);

  // Cargar turnos
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/turnos")
      .then((res) => setTurnos(res.data))
      .catch(() => setTurnos([]));
  }, []);

  // Memoiza eventos para evitar renders innecesarios
  const events = useMemo(() => {
    if (juzgados.length === 0 || turnos.length === 0) return [];
    return turnos.map((turno) => {
      const juzgado = juzgados.find((j) => j.id === turno.juzgado_id) || {};
      const start = dayjs.tz(turno.turn_date, "America/Bogota")
        .hour(0)
        .minute(0)
        .second(0)
        .millisecond(0)
        .toDate();
      const end = dayjs.tz(turno.turn_date, "America/Bogota")
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
        turno_id: turno.id,           // <--- Agrega el id del turno
        turn_date: turno.turn_date,   // <--- Agrega la fecha del turno
        juzgado_id: juzgado.id,       // <--- (opcional) id del juzgado
      };
    });
  }, [juzgados, turnos]);

  // Actualiza la hora actual cada 10 segundos (menos renders)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 10000);
    return () => clearInterval(interval);
  }, []);

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

  const handleSelectSlot = ({ start }) => {
    const hasEvent = events.some((ev) =>
      dayjs(ev.start).isSame(dayjs(start), "day")
    );
    if (!hasEvent) {
      setSelectedSlotDate(start);
      setShowAddDialog(true);
    }
  };

  // Nueva función para mostrar mensajes
  const showToastMsg = (msg) => {
    setToastMsgs((prev) => [...prev, msg]);
    setTimeout(() => {
      setToastMsgs((prev) => prev.slice(1));
    }, 2000);
  };

  const handleSelectEvent = (event) => {
    setSelectedJuzgado({
      nombre: event.title,
      email: event.email,
      turno_id: event.turno_id,      // <--- id del turno
      turn_date: event.turn_date,    // <--- fecha del turno
      juzgado_id: event.juzgado_id,  // <--- (opcional) id del juzgado
    });
    setShowViewDialog(true);
  };

  // Cambia handleCopyEmail para usar showToastMsg
  const handleCopyEmail = () => {
    if (juzgadoHoy && juzgadoHoy.email) {
      navigator.clipboard.writeText(juzgadoHoy.email).then(() => {
        showToastMsg("¡Se copió con éxito!");
      });
    }
  };

  // Cambia handleSaveJuzgado para usar showToastMsg
  const handleSaveJuzgado = async (juzgado, date) => {
    try {
      if (!juzgado?.id || !date) {
        console.error('Datos incompletos:', { juzgado, date });
        showToastMsg('Error: Faltan datos del juzgado o fecha');
        return;
      }

      const turn_date = dayjs(date).format('YYYY-MM-DD');
      console.log('Enviando datos al backend:', { juzgado_id: juzgado.id, turn_date, estado_id: 1 });

      const response = await axios.post('http://localhost:5000/api/turnos', {
        juzgado_id: juzgado.id,
        turn_date,
        estado_id: 1,
      });

      console.log('Respuesta del backend:', response.data);

      const res = await axios.get('http://localhost:5000/api/turnos');
      setTurnos(res.data);
      showToastMsg('Turno guardado correctamente');
    } catch (err) {
      console.error('Error al guardar el turno:', err.response?.data || err.message);
      showToastMsg(`Error al guardar el turno: ${err.response?.data?.error || err.message}`);
    }
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

  const formats = {
    dayFormat: (date, culture, localizer) =>
      localizer.format(date, "dddd DD MMMM", culture),
    dayHeaderFormat: (date, culture, localizer) =>
      localizer.format(date, "dddd, DD MMMM YYYY", culture),
    timeGutterFormat: (date, culture, localizer) =>
      localizer.format(date, "h A", culture),
    dayRangeHeaderFormat: ({ start, end }, culture, localizer) =>
      localizer.format(start, "DD MMMM", culture) +
      " - " +
      localizer.format(end, "DD MMMM YYYY", culture),
  };

  // Encuentra el turno de hoy
  const turnoHoy = useMemo(() => {
    const hoy = dayjs().tz("America/Bogota").format('YYYY-MM-DD');
    return turnos.find(t =>
      dayjs.tz(t.turn_date, "America/Bogota").format('YYYY-MM-DD') === hoy
    );
  }, [turnos]);

  // Encuentra el juzgado de turno hoy
  const juzgadoHoy = useMemo(() => {
    if (!turnoHoy) return null;
    return juzgados.find(j => j.id === turnoHoy.juzgado_id);
  }, [juzgados, turnoHoy]);

  const cargarTurnos = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/turnos");
      setTurnos(res.data);
    } catch {
      setTurnos([]);
    }
  };

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
                {juzgadoHoy
                  ? juzgadoHoy.name
                  : "No hay juzgado de turno hoy"}
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
          dayPropGetter={dayPropGetter}
          eventPropGetter={eventPropGetter}
          formats={formats}
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
        <Buttons />
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

      {/* Toasts en columna */}
      <div className="toast-container">
        {toastMsgs.map((msg, idx) => (
          <Toast key={idx} show={true} message={msg} />
        ))}
      </div>

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
          // Aquí va la lógica para cambiar el turno en el backend
          try {
            await axios.put(`http://localhost:5000/api/turnos/${changeTurnData.turno_id}`, {
              nuevo_juzgado_id: nuevoJuzgado.id,
              turn_date: changeTurnData.turn_date,
            });
            showToastMsg("Turno cambiado correctamente");
            setShowChangeDialog(false);
            cargarTurnos();
          } catch (err) {
            showToastMsg("Error al cambiar el turno");
          }
        }}
        slotDate={changeTurnData?.turn_date}
        currentJuzgado={changeTurnData && {
          name: changeTurnData.nombre,
          email: changeTurnData.email,
          id: changeTurnData.juzgado_id,
        }}
        showToastMsg={showToastMsg}
      />
    </div>
  );
};

export default Home;

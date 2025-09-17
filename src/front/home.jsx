import React, { useState, useEffect } from "react";
import Header from "./header";
import "../styles/styles.scss";
// import SheetsApi from "../components/sheetsApi";
import { Calendar, dayjsLocalizer } from "react-big-calendar";
import dayjs from "dayjs";
import "dayjs/locale/es";
import "react-big-calendar/lib/css/react-big-calendar.css";
import AreaChartInteractive from "../grafics/area";
// import RadarChartSimple from "../grafics/radar";
import PieChartSimple from "../grafics/pie";
import RadialChartSimple from "../grafics/radial";
import RadarChartComponent from "../grafics/radar1";
import Toast from "../components/Copy";
import JuzgadoDialog from "../alertsDialogs/date_section/open_juzgado_dialog";
import ViewJuzgadoDialog from "../alertsDialogs/calendar/view_juzgado";
import ViewExcel from "../excel/ViewExcel";
import Buttons from "../components/buttons";
import AddJuzgadoCalendarDialog from "../alertsDialogs/calendar/add_juzgado_calendar";
import axios from "axios";

dayjs.locale("es");

const Home = () => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [view, setView] = useState("month");
  const [date, setDate] = useState(new Date());
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedJuzgado, setSelectedJuzgado] = useState(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedSlotDate, setSelectedSlotDate] = useState(null);
  const localizer = dayjsLocalizer(dayjs);
  const email = "juzgado007pasto@ejemplo.com";

  const [events, setEvents] = useState([]);
  const [juzgados, setJuzgados] = useState([]);
  const [turnos, setTurnos] = useState([]); // <--- Nuevo estado para turnos

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

  // Mapear eventos solo cuando ambos estén listos
  useEffect(() => {
    if (juzgados.length === 0 || turnos.length === 0) {
      setEvents([]);
      return;
    }
    const eventos = turnos.map((turno) => {
      const juzgado = juzgados.find((j) => j.id === turno.juzgado_id) || {};
      const start = new Date(turno.turn_date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(turno.turn_date);
      end.setHours(23, 59, 59, 999);
      return {
        title: juzgado.name || "Juzgado",
        email: juzgado.email || "",
        start,
        end,
      };
    });
    setEvents(eventos);
  }, [juzgados, turnos]);

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
    // Verifica si hay evento ese día
    const hasEvent = events.some((ev) =>
      dayjs(ev.start).isSame(dayjs(start), "day")
    );
    if (!hasEvent) {
      setSelectedSlotDate(start);
      setShowAddDialog(true);
    }
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(email).then(() => {
      setToastMsg("¡Se copió con éxito!");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    });
  };

  const handleSelectEvent = (event) => {
    setSelectedJuzgado({
      nombre: event.title,
      email: event.email,
    });
    setShowViewDialog(true);
  };

  const handleSaveJuzgado = (juzgado, date) => {
    // Crear evento para el calendario
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    setEvents((prevEvents) => [
      ...prevEvents,
      {
        title: juzgado.name,      // Nombre del juzgado
        email: juzgado.email,     // Email del juzgado
        start: startOfDay,        // Día completo
        end: endOfDay,            // Día completo
      },
    ]);

    // Si quieres guardar en la base de datos, puedes hacer algo como:
    /*
    fetch("http://localhost:5000/api/turnos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        juzgado_id: juzgado.id,
        turn_date: startOfDay.toISOString().slice(0, 10), // YYYY-MM-DD
        estado_id: 1, // Por ahora 1
      }),
    });
    */
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
                JUZGADO 007 CIVIL MUNICIPAL DE PASTO, ACTUALMENTE TRANSFORMADO
                TRANSITORIAMENTE EN JUZGADO 007 DE PEQUEÑAS CAUSAS Y COMPETENCIA
                MÚLTIPLE DE PASTO
              </h1>
              <div className="juzgado-email flex-row">
                <h2
                  style={{ cursor: "pointer" }}
                  onClick={() => setShowDialog(true)}
                >
                  {email}
                </h2>
                <button className="copy-button" onClick={handleCopyEmail}>
                  Copiar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <div className="sheets-api-container">
        <SheetsApi />
      </div> */}
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
          {/* <RadarChartSimple /> */}
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
        <div className="table-content"> 
          
        </div>
      </div>

      <Toast show={showToast} message={toastMsg} />
      <JuzgadoDialog open={showDialog} onClose={() => setShowDialog(false)} />
      <ViewJuzgadoDialog
        open={showViewDialog}
        onClose={() => setShowViewDialog(false)}
        juzgado={selectedJuzgado}
      />
      <AddJuzgadoCalendarDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onSave={handleSaveJuzgado}
        slotDate={selectedSlotDate}
      />
    </div>
  );
};

export default Home;

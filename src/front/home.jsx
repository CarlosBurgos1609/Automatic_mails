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
import RadarChartComponent from "../components/RadarChartComponent";
import Toast from "../components/Copy";
import JuzgadoDialog from "../alertsDialogs/add_dialog";
import ViewJuzgadoDialog from "../alertsDialogs/view_juzgado";

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
  const localizer = dayjsLocalizer(dayjs);
  const email = "juzgado002depasto@ejemplo.com";

  const events = [
    {
      title: "JUZGADO 007 CIVIL MUNICIPAL DE PASTO",
      email: "juzgado007pasto@ejemplo.com",
      start: new Date(2025, 7, 29, 0, 0),
      end: new Date(2025, 7, 29, 23, 59),
    },
    {
      title: "JUZGADO 007 CIVIL MUNICIPAL DE PASTO, ACTUALMENTE TRANSFORMADO TRANSITORIAMENTE EN JUZGADO 007 DE PEQUEÑAS CAUSAS Y COMPETENCIA MÚLTIPLE DE PASTO",
      email: "juzgado008pasto@ejemplo.com",
      start: new Date(2025, 8, 1, 0, 0),
      end: new Date(2025, 8, 1, 23, 59),
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
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
    setSelectedDate(start);
    console.log("Selected date:", start);
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
            <div className="juzgado">
              <h1>Juzgado Abierto</h1>
            </div>

            <div className="name-juzgado flex-column">
              <h1>Nombre del juzgado que está abierto</h1>
              <div className="juzgado-email flex-row">
                <h2 style={{cursor:"pointer"}} onClick={() => setShowDialog(true)}>{email}</h2>
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
      <div className="documents-container">
        <div className="positioning flex-column">
          <div className="title-document flex-column">
            <h1>Documentos</h1>
          </div>
        </div>

        <div className="document flex-column">
          <div className="flex-row">
            <div className="add flex-column">
              <h1>+</h1>

              <h2>Añadir documento</h2>
            </div>
            <div className="archive-sheets flex-column">
              <div className="archive flex-column iframe-border">
                <iframe
                  width="560"
                  height="315"
                  src="https://www.youtube.com/embed/Z2VMC7p5J2Q?si=afulIDI7JZnb6VIE"
                  title="YouTube video player"
                  frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerpolicy="strict-origin-when-cross-origin"
                  allowfullscreen
                ></iframe>
              </div>
              <h2>Nombre del documento</h2>
            </div>
          </div>
        </div>
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
          <RadarChartComponent/>
        </div>
      </div>
      <div className="excel-document-view">
        <iframe
          src="https://docs.google.com/spreadsheets/d/1JGjg2NjMu-BkTWbIJIs1ZjiNmu_V-EDvEKVwauiDjyc/edit?gid=572366768#gid=572366768"
          frameborder="0"
        ></iframe>
      </div>
      <Toast show={showToast} message={toastMsg} />
      <JuzgadoDialog open={showDialog} onClose={() => setShowDialog(false)} />
      <ViewJuzgadoDialog
        open={showViewDialog}
        onClose={() => setShowViewDialog(false)}
        juzgado={selectedJuzgado}
      />
    </div>
  );
};

export default Home;

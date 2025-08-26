import React, { useState, useEffect } from "react";
import Header from "./header";
import "../styles/styles.scss";
import SheetsApi from "../components/sheetsApi";
import { Calendar, dayjsLocalizer } from "react-big-calendar";
import dayjs from "dayjs";
import "dayjs/locale/es";
import "react-big-calendar/lib/css/react-big-calendar.css";
dayjs.locale("es");

const Home = () => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null); // State for selected day
  const localizer = dayjsLocalizer(dayjs);

  // Sample events for testing
  const events = [
    {
      title: "Reunión Juzgado",
      start: new Date(2025, 7, 29, 10, 0),
      end: new Date(2025, 7, 29, 11, 0),
    },
    {
      title: "Audiencia",
      start: new Date(2025, 7, 27, 14, 0),
      end: new Date(2025, 7, 27, 15, 0),
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

  // Handle day selection
  const handleSelectSlot = ({ start }) => {
    setSelectedDate(start);
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
            <div className="name-juzgado">
              <h1>Nombre del juzgado que está abierto</h1>
            </div>
          </div>
        </div>
      </div>
      <div className="sheets-api-container">
        <SheetsApi />
      </div>
      <div className="calendar-container">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "600px" }}
          views={["month", "week", "day"]}
          defaultView="month"
          selectable={true} // Enable day selection
          onSelectSlot={handleSelectSlot} // Handle day clicks
          selected={selectedDate} // Highlight selected day
        />
      </div>
      <div className="documents-container">
        <h1>hola</h1>
      </div>
    </div>
  );
};

export default Home;
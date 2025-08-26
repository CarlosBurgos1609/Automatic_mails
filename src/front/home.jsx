// src/components/Home.jsx
import React, { useState, useEffect } from "react";
import Header from "./header";
import "../styles/styles.scss";
import SheetsApi from "../components/sheetsApi";
import { Calendar, dayjsLocalizer } from 'react-big-calendar';
import dayjs from 'dayjs';
import "dayjs/locale/es";
dayjs.locale("es");

const Home = () => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const localizer = dayjsLocalizer(dayjs);

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
    };
    return date.toLocaleString("es-CO", options);
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
              <h1>nombre del juzgado que esta abierto</h1>
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
          // style={{ height: 600 }}
        />
      </div>
    </div>
  );
};

export default Home;
// src/components/Home.jsx
import React, { useState, useEffect } from "react";
import Header from "./header";
import "../styles/styles.scss";

const Home = () => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000); // Actualiza cada segundo
    return () => clearInterval(timer); // Limpia el intervalo al desmontar
  }, []);

  const formatDateTime = (date) => {
    const options = {
      timeZone: "America/Bogota",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
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
        <div className="flex-column date-section">
          <div className="date-time">
            <h1>Fecha y Hora Actual</h1>
            <p>{formatDateTime(currentDateTime)}</p>
          </div>
        </div>
        <div className="flex-column juzgado-section">
          <div className="juzgado">
            <p>Juzgado</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

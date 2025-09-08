// src/components/Calendary.jsx o Home.jsx
import React, { useState, useEffect } from "react";
import { Calendar, dayjsLocalizer } from "react-big-calendar";
import dayjs from "dayjs";
import "dayjs/locale/es";
import "react-big-calendar/lib/css/react-big-calendar.css";

dayjs.locale("es");

const Calendary = () => {
  const localizer = dayjsLocalizer(dayjs);
  const [municipios, setMunicipios] = useState([]);

  // 👇 Aquí va el useEffect
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/data");
        const data = await response.json();
        console.log("Datos recibidos del backend:", data); // 👈 Log para verificar
        setMunicipios(data);
      } catch (error) {
        console.error("Error al obtener municipios:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="calendar-container" style={{ padding: "20px" }}>
      <h2>Lista de Municipios</h2>
      <table border="1" cellPadding="10" style={{ marginBottom: "30px", width: "100%" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Fecha de creación</th>
          </tr>
        </thead>
        <tbody>
          {municipios.length === 0 ? (
            <tr>
              <td colSpan="3">No hay municipios para mostrar</td>
            </tr>
          ) : (
            municipios.map((mun) => (
              <tr key={mun.id}>
                <td>{mun.id}</td>
                <td>{mun.name}</td>
                <td>{new Date(mun.created_at).toLocaleDateString()}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <h2>Calendario</h2>
      <Calendar
        localizer={localizer}
        view="week"
        style={{ height: "500px", width: "100%" }}
      />
    </div>
  );
};

export default Calendary;

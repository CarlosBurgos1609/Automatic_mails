// src/components/Calendary.jsx
import React, { useState, useEffect } from "react";
import { Calendar, dayjsLocalizer } from "react-big-calendar";
import dayjs from "dayjs";
import "dayjs/locale/es";
import "react-big-calendar/lib/css/react-big-calendar.css";

dayjs.locale("es");

const Calendary = () => {
  const localizer = dayjsLocalizer(dayjs);
  const [municipios, setMunicipios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/data");
        if (!response.ok) throw new Error("Error en la API");
        const data = await response.json();
        console.log("✅ Datos recibidos:", data);
        setMunicipios(data);
      } catch (err) {
        console.error("❌ Error al obtener municipios:", err);
        setError("No se pudieron cargar los municipios");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="calendar-container" style={{ padding: "20px" }}>
      <h2>Lista de Municipios</h2>

      {loading ? (
        <p>Cargando municipios...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : (
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
                  <td>{new Date(mun.created_at).toLocaleDateString("es-ES")}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

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

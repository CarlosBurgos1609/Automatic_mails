// src/components/Calendary.jsx
import React, { useState, useEffect } from "react";
import { Calendar, dayjsLocalizer } from "react-big-calendar";
import dayjs from "dayjs";
import "dayjs/locale/es";
import "react-big-calendar/lib/css/react-big-calendar.css";

dayjs.locale("es");

const Calendary = () => {
  const localizer = dayjsLocalizer(dayjs);
  const [juzgados, setJuzgados] = useState([]);
  const [loadingJuzgados, setLoadingJuzgados] = useState(true);
  const [errorJuzgados, setErrorJuzgados] = useState(null);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    const fetchJuzgados = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/juzgados");
        if (!response.ok) throw new Error("Error en la API de juzgados");
        const data = await response.json();
        setJuzgados(data);
      } catch (err) {
        setErrorJuzgados("No se pudieron cargar los juzgados");
      } finally {
        setLoadingJuzgados(false);
      }
    };
    fetchJuzgados();
  }, []);

  return (
    <div className="calendar-container" style={{ padding: "20px" }}>
      <button
        onClick={() => setShowDialog(true)}
        style={{ marginBottom: "20px", padding: "10px 20px", fontSize: "16px" }}
      >
        Ver Juzgados
      </button>

      {showDialog && (
        <div
          style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 1000
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "30px",
              borderRadius: "8px",
              maxWidth: "90vw",
              maxHeight: "80vh",
              overflowY: "auto",
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
            }}
          >
            <h2>Lista de Juzgados</h2>
            <button
              onClick={() => setShowDialog(false)}
              style={{
                position: "absolute",
                top: 20,
                right: 30,
                fontSize: "18px",
                background: "transparent",
                border: "none",
                cursor: "pointer"
              }}
              aria-label="Cerrar"
            >
              ✖
            </button>
            {loadingJuzgados ? (
              <p>Cargando juzgados...</p>
            ) : errorJuzgados ? (
              <p style={{ color: "red" }}>{errorJuzgados}</p>
            ) : (
              <table border="1" cellPadding="10" style={{ marginBottom: "30px", width: "100%" }}>
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Email</th>
                  </tr>
                </thead>
                <tbody>
                  {juzgados.length === 0 ? (
                    <tr>
                      <td colSpan="2">No hay juzgados para mostrar</td>
                    </tr>
                  ) : (
                    juzgados.map((juz) => (
                      <tr key={juz.id}>
                        <td>{juz.name}</td>
                        <td>{juz.email}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
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

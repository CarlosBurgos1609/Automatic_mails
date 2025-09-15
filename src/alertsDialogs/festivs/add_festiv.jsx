import React, { useState } from "react";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { StaticDatePicker } from "@mui/x-date-pickers/StaticDatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { FaGlassCheers } from "react-icons/fa";

export default function AddFestiveDialog({ open, onClose, onSave }) {
  const [nombre, setNombre] = useState("");
  const [fecha, setFecha] = useState(dayjs());
  const [error, setError] = useState("");
  const [errorFecha, setErrorFecha] = useState("");

  // Manejar cambio en el input de fecha
  const handleFechaInputChange = (e) => {
    const inputValue = e.target.value;
    if (dayjs(inputValue, "YYYY-MM-DD", true).isValid()) {
      setFecha(dayjs(inputValue));
      setErrorFecha("");
    } else {
      setErrorFecha("Por favor, ingrese una fecha válida");
    }
  };

  // Manejar selección de fecha en el calendario
  const handleFechaChange = (newValue) => {
    if (newValue && dayjs(newValue).isValid()) {
      setFecha(newValue);
      setErrorFecha("");
    } else {
      setErrorFecha("Fecha seleccionada no válida");
    }
  };

  const handleGuardar = () => {
    if (!nombre || !fecha || errorFecha) {
      setError("Por favor, complete todos los campos obligatorios.");
      if (!fecha || errorFecha) setErrorFecha("Por favor, seleccione una fecha válida");
      return;
    }
    setError(""); // Limpiar error si todo está bien
    onSave({
      nombre,
      fecha: fecha.format("YYYY-MM-DD"),
    });
    onClose();
    setNombre("");
    setFecha(dayjs());
    setErrorFecha("");
  };

  if (!open) return null;

  return (
    <div className="alert-dialog-backdrop">
      <div className="alert-dialog add-juzgado-dialog">
        <h1>
          <FaGlassCheers size={24} /> Agregar Nuevo Día Festivo
        </h1>
        <div className="input-busqueda">
          <input
            type="text"
            placeholder="Nombre del día festivo"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className={error && !nombre ? "input-error" : ""}
          />
        </div>
        <div className="input-busqueda">
          <input
            type="date"
            value={fecha.format("YYYY-MM-DD")}
            onChange={handleFechaInputChange}
            placeholder="Fecha (YYYY-MM-DD)"
            className={errorFecha ? "input-error" : ""}
          />
          {errorFecha && <span className="error-message">{errorFecha}</span>}
        </div>
        {error && <div className="error-message">{error}</div>}
        <div className="calendar-election">
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <StaticDatePicker
              displayStaticWrapperAs="desktop"
              value={fecha}
              onChange={handleFechaChange}
              showToolbar={false}
              slotProps={{
                actionBar: { actions: [] },
                toolbar: { hidden: true },
              }}
            />
          </LocalizationProvider>
        </div>
        <div className="dialog-actions flex-column">
          <button className="edit-button-full" onClick={handleGuardar}>
            Guardar
          </button>
          <button className="close-button-full" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
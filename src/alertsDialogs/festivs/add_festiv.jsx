import React, { useState } from "react";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { StaticDatePicker } from "@mui/x-date-pickers/StaticDatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { FaGlassCheers } from "react-icons/fa";

export default function AddFestiveDialog({ open, onClose, onSave }) {
  const [nombre, setNombre] = useState("");
  const [fecha, setFecha] = useState(dayjs());
  const [isLoading, setIsLoading] = useState(false);
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

  const handleGuardar = async () => {
    // ✅ Validaciones mejoradas
    if (!nombre.trim() || !fecha || errorFecha) {
      setError("Por favor, complete todos los campos obligatorios.");
      if (!fecha || errorFecha) {
        setErrorFecha("Por favor, seleccione una fecha válida");
      }
      return;
    }

    setIsLoading(true);
    setError(""); // Limpiar errores previos

    try {
      // ✅ Preparar datos para enviar
      const festivoData = {
        name: nombre.trim().toUpperCase(), // Consistente con el backend
        date: fecha.format("YYYY-MM-DD"),
      };

      console.log("🔍 Enviando datos al backend:", festivoData);

      // ✅ Llamada al backend
      const response = await fetch("http://localhost:5000/api/festivs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(festivoData),
      });

      const result = await response.json();
      console.log("🔍 Respuesta del backend:", result);

      if (response.ok) {
        // ✅ Éxito - preparar datos para el componente padre
        const savedData = {
          nombre: festivoData.name,
          fecha: festivoData.date,
        };

        console.log("✅ Festivo guardado exitosamente:", savedData);

        // ✅ Limpiar formulario ANTES de cerrar
        handleClose();

        // ✅ Notificar al componente padre
        if (onSave) {
          onSave(savedData);
        }
      } else {
        // ✅ Error del servidor
        console.error("❌ Error del servidor:", result.error);
        setError(result.error || "Error al guardar el festivo");
      }
    } catch (error) {
      // ✅ Error de conexión
      console.error("❌ Error al guardar festivo:", error);
      setError(`Error de conexión: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Función para limpiar y cerrar
  const handleClose = () => {
    setNombre("");
    setFecha(dayjs());
    setError("");
    setErrorFecha("");
    setIsLoading(false);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="alert-dialog-backdrop">
      <div className="alert-dialog add-juzgado-dialog juzgado-management-dialog">
        <h1>
          <FaGlassCheers size={24} style={{ color: "#e53935" }} /> Agregar Nuevo
          Día Festivo
        </h1>

        {/* ✅ Sección del formulario con estilos consistentes */}
        <div className="form-section">
          <div className="form-group">
            <input
              type="text"
              placeholder="Nombre del día festivo (ej: AÑO NUEVO)"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className={error && !nombre.trim() ? "input-error" : ""}
              disabled={isLoading}
              maxLength={255}
            />
          </div>

          <div className="form-group">
            <input
              type="date"
              value={fecha.format("YYYY-MM-DD")}
              onChange={handleFechaInputChange}
              className={errorFecha ? "input-error" : ""}
              disabled={isLoading}
            />
            {errorFecha && <div className="error-message">{errorFecha}</div>}
          </div>

          <div className="calendar-election">
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <StaticDatePicker
                displayStaticWrapperAs="desktop"
                value={fecha}
                onChange={handleFechaChange}
                disabled={isLoading}
                showToolbar={false}
                slotProps={{
                  actionBar: { actions: [] },
                  toolbar: { hidden: true },
                }}
              />
            </LocalizationProvider>
          </div>

          {/* ✅ Mostrar errores de manera consistente */}
          {error && <div className="error-message">{error}</div>}
        </div>

        {/* ✅ Botones con estilos consistentes */}
        <div className="action-buttons">
          <button
            className="primary-button"
            onClick={handleGuardar}
            disabled={isLoading || !nombre.trim() || errorFecha}
          >
            {isLoading ? "Guardando..." : "Guardar Día Festivo"}
          </button>
          <button
            className="cancel-button"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
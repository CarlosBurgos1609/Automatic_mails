import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { StaticDatePicker } from "@mui/x-date-pickers/StaticDatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

// ✅ Configurar dayjs para manejar zonas horarias
dayjs.extend(utc);
dayjs.extend(timezone);

export default function EditFestiveDialog({ open, onClose, onSave }) {
  const [step, setStep] = useState(1);
  const [festivs, setFestivs] = useState([]);
  const [festivoSeleccionado, setFestivoSeleccionado] = useState(null);

  // Estados del formulario
  const [nombre, setNombre] = useState("");
  const [fecha, setFecha] = useState(dayjs());

  const [loadingFestivs, setLoadingFestivs] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [errorFecha, setErrorFecha] = useState("");
  const [busqueda, setBusqueda] = useState("");

  // ✅ Función para normalizar fechas desde el backend
  const normalizeFecha = (fechaString) => {
    // Si viene en formato YYYY-MM-DD, crearlo como fecha local
    if (
      typeof fechaString === "string" &&
      fechaString.match(/^\d{4}-\d{2}-\d{2}$/)
    ) {
      return dayjs(fechaString, "YYYY-MM-DD");
    }
    // Si viene como objeto Date o ISO string, usar UTC y convertir a local
    return dayjs.utc(fechaString).local();
  };

  // ✅ Función para mostrar fechas de manera consistente
  const formatearFecha = (fechaString) => {
    return normalizeFecha(fechaString).format("DD/MM/YYYY");
  };

  useEffect(() => {
    if (open) {
      cargarFestivs();
    }
  }, [open]);

  const cargarFestivs = async () => {
    setLoadingFestivs(true);
    setError("");
    try {
      const response = await fetch("http://localhost:5000/api/festivs");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        // ✅ Procesar fechas al recibir datos
        const festivsNormalizados = data.map((festivo) => ({
          ...festivo,
          date: festivo.date, // Mantener el formato original del backend
        }));
        setFestivs(festivsNormalizados);
      } else {
        console.error("La respuesta no es un array:", data);
        setFestivs([]);
        setError("Error: La respuesta del servidor no es válida");
      }
    } catch (error) {
      console.error("Error al cargar festivos:", error);
      setFestivs([]);
      setError(`Error al cargar festivos: ${error.message}`);
    } finally {
      setLoadingFestivs(false);
    }
  };

  const handleSeleccionarFestivo = (festivo) => {
    setFestivoSeleccionado(festivo);
    setNombre(festivo.name);
    // ✅ Normalizar la fecha al seleccionar
    setFecha(normalizeFecha(festivo.date));
    setError("");
    setStep(2);
  };

  const handleGuardar = async () => {
    if (!nombre.trim() || !fecha || errorFecha) {
      setError("Por favor, complete todos los campos obligatorios.");
      if (!fecha || errorFecha)
        setErrorFecha("Por favor, seleccione una fecha válida");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const festivoData = {
        name: nombre.trim().toUpperCase(),
        // ✅ Enviar fecha en formato YYYY-MM-DD sin zona horaria
        date: fecha.format("YYYY-MM-DD"),
      };

      console.log("🔍 Enviando datos al backend:", festivoData);

      const response = await fetch(
        `http://localhost:5000/api/festivs/${festivoSeleccionado.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(festivoData),
        }
      );

      const result = await response.json();

      if (response.ok) {
        const savedData = {
          nombre: festivoData.name,
          fecha: festivoData.date,
        };

        handleVolver();

        if (onSave) {
          onSave(savedData);
        }
      } else {
        setError(result.error || "Error al actualizar el festivo");
      }
    } catch (error) {
      console.error("❌ Error al actualizar festivo:", error);
      setError(`Error de conexión: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFechaChange = (newValue) => {
    if (newValue && dayjs(newValue).isValid()) {
      setFecha(newValue);
      setErrorFecha("");
    } else {
      setErrorFecha("Fecha seleccionada no válida");
    }
  };

  const handleVolver = () => {
    setStep(1);
    setFestivoSeleccionado(null);
    setNombre("");
    setFecha(dayjs());
    setError("");
    setErrorFecha("");
    setBusqueda("");
  };

  const handleDialogClose = () => {
    handleVolver();
    setLoadingFestivs(false);
    setIsLoading(false);
    onClose();
  };

  // ✅ Filtrar festivos con fechas normalizadas
  const festivsFiltrados = Array.isArray(festivs)
    ? festivs.filter(
        (f) =>
          f &&
          f.name &&
          (f.name.toLowerCase().includes(busqueda.toLowerCase()) ||
            formatearFecha(f.date).includes(busqueda))
      )
    : [];

  if (!open) return null;

  return (
    <div className="alert-dialog-backdrop">
      <div className="alert-dialog add-juzgado-dialog juzgado-management-dialog">
        {step === 1 ? (
          <>
            <h1>Seleccionar Festivo para Editar</h1>

            <div className="step-indicator list-step">
              Paso 1: Seleccione el festivo que desea editar
            </div>

            <div className="search-input">
              <input
                type="text"
                placeholder="Buscar festivo por nombre o fecha..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            {error && !loadingFestivs && (
              <div className="error-message">{error}</div>
            )}

            <div className="juzgados-list">
              {loadingFestivs ? (
                <div className="loading-state">Cargando festivos...</div>
              ) : festivsFiltrados.length === 0 ? (
                <div className="empty-state">
                  {busqueda
                    ? "No se encontraron festivos"
                    : "No hay festivos disponibles"}
                </div>
              ) : (
                festivsFiltrados.map((festivo) => (
                  <div
                    key={festivo.id}
                    onClick={() => handleSeleccionarFestivo(festivo)}
                    className="juzgado-item"
                  >
                    <div className="juzgado-name">{festivo.name}</div>
                    <div className="juzgado-email">
                      📅 {formatearFecha(festivo.date)}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="action-buttons">
              <button className="cancel-button" onClick={handleDialogClose}>
                Cerrar
              </button>
            </div>
          </>
        ) : (
          <>
            <h1>Editar Día Festivo</h1>

            <div className="step-indicator edit-step">
              Editando: {festivoSeleccionado?.name}
              <div className="current-info">
                Fecha actual: {formatearFecha(festivoSeleccionado?.date)}
              </div>
            </div>

            <div className="form-section">
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Nombre del día festivo"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className={error && !nombre.trim() ? "input-error" : ""}
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <input
                  type="date"
                  value={fecha.format("YYYY-MM-DD")}
                  onChange={(e) => {
                    if (dayjs(e.target.value).isValid()) {
                      setFecha(dayjs(e.target.value));
                      setErrorFecha("");
                    } else {
                      setErrorFecha("Fecha no válida");
                    }
                  }}
                  className={errorFecha ? "input-error" : ""}
                  disabled={isLoading}
                />
                {errorFecha && (
                  <div className="error-message">{errorFecha}</div>
                )}
              </div>

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

              {error && <div className="error-message">{error}</div>}
            </div>

            <div className="action-buttons">
              <button
                className="primary-button update-button"
                onClick={handleGuardar}
                disabled={isLoading || !nombre.trim()}
              >
                {isLoading ? "Actualizando..." : "Actualizar Festivo"}
              </button>
              <button
                className="secondary-button"
                onClick={handleVolver}
                disabled={isLoading}
              >
                Volver a la Lista
              </button>
              <button
                className="cancel-button"
                onClick={handleDialogClose}
                disabled={isLoading}
              >
                Cerrar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

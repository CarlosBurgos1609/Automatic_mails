import React, { useState } from "react";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { StaticDatePicker } from "@mui/x-date-pickers/StaticDatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { FaGlassCheers   } from 'react-icons/fa';

export default function AddFestiveDialog({ open, onClose, onSave }) {
  const [codigo, setCodigo] = useState("");
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [departamento, setDepartamento] = useState("");
  const [fecha, setFecha] = useState(dayjs()); // Fecha seleccionada

  const handleGuardar = () => {
    if (codigo && nombre && correo && departamento) {
      onSave({ codigo, nombre, correo, departamento, fecha: fecha.format("YYYY-MM-DD") });
      onClose();
      setCodigo("");
      setNombre("");
      setCorreo("");
      setDepartamento("");
      setFecha(dayjs());
    }
  };

  if (!open) return null;

  return (
    <div className="alert-dialog-backdrop">
      <div className="alert-dialog add-juzgado-dialog">
        <h1><FaGlassCheers   size={24}  />  Agregar Nuevo Día Festivo</h1>
        <div className="calendar-election">
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <StaticDatePicker
              displayStaticWrapperAs="desktop"
              value={fecha}
              onChange={(newValue) => setFecha(newValue)}
              // No se muestra input, solo el calendario
              renderInput={() => null} 
            />
          </LocalizationProvider>
        </div>
        <div className="input-busqueda">
          <input
            type="text"
            placeholder="Nombre del día festivo"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
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

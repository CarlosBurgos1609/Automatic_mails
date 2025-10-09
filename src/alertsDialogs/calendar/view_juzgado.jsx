import React, { useState, useEffect } from "react";
import axios from "axios";
import Copy from "../../components/Copy";
import deleteIcon from "../../assets/icons/delete.png";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import "dayjs/locale/es"; // ✅ AGREGAR LOCALE ESPAÑOL

// ✅ CONFIGURAR DAYJS PARA COLOMBIA
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale("es"); // ✅ CONFIGURAR LOCALE

export default function ViewJuzgadoDialog({ 
  open, 
  onClose, 
  juzgado, 
  onTurnoEliminado, 
  showToastMsg, 
  onChangeTurn,
  festivo, // ✅ NUEVO PROP PARA FESTIVO
  isLoggedIn = false // ✅ NUEVO PROP PARA ESTADO DE LOGIN
}) {
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) setLoading(false);
  }, [open, juzgado]);

  const handleCopy = () => {
    if (juzgado?.email) {
      navigator.clipboard.writeText(juzgado.email).then(() => {
        setToastMsg("¡Se copió con éxito!");
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
      });
    }
  };

  const handleEliminarTurno = async () => {
    if (!juzgado?.turno_id || !juzgado?.turn_date) {
      showToastMsg("No se encontró el turno para eliminar.");
      return;
    }
    setLoading(true);
    try {
      await axios.delete(`http://localhost:5000/api/turnos/${juzgado.turno_id}/${juzgado.turn_date}`);
      showToastMsg("Turno eliminado correctamente");
      if (onTurnoEliminado) await onTurnoEliminado();
      onClose();
    } catch (err) {
      showToastMsg("Error al eliminar el turno");
      setLoading(false);
    }
  };

  // ✅ PARA MOSTRAR: Agregar un día para compensar el desfase de zona horaria
  const fechaSeleccionada = juzgado?.turn_date
    ? dayjs.utc(juzgado.turn_date).add(1, 'day').tz("America/Bogota").format("dddd, DD [de] MMMM [de] YYYY")
    : "";

  // ✅ CORREGIR: Usar la fecha original del juzgado para generar la fecha del festivo
  const fechaFestivoMostrar = juzgado?.turn_date
    ? dayjs.utc(juzgado.turn_date).add(1, 'day').tz("America/Bogota").format('DD [de] MMMM [de] YYYY')
    : "";

  // ✅ OBTENER EL NOMBRE CORRECTO DEL JUZGADO
  const nombreJuzgado = juzgado?.nombre || juzgado?.name || "Nombre del Juzgado";

  console.log('🔍 Debug ViewJuzgado:', {
    turn_date: juzgado?.turn_date,
    fechaSeleccionada,
    festivo: festivo?.date,
    fechaFestivoMostrar,
    nombreJuzgado
  });

  if (!open) return null;

  return (
    <div className="alert-dialog-backdrop">
      <div className="alert-dialog">
        {/* ✅ USAR LA VARIABLE CON EL NOMBRE CORRECTO */}
        <h1>{nombreJuzgado}</h1>
        
        {fechaSeleccionada && (
          <div style={{ marginBottom: "1rem", fontWeight: "bold", color: "#003f75" }}>
            Fecha seleccionada: {fechaSeleccionada}
          </div>
        )}

        {/* ✅ MOSTRAR INFORMACIÓN DEL FESTIVO SI EXISTE */}
        {festivo && (
          <div style={{ 
            marginBottom: "1rem", 
            padding: "12px", 
            backgroundColor: "#fff0f0", 
            border: "2px solid #e53935", 
            borderRadius: "8px",
            textAlign: "center"
          }}>
            <div style={{ 
              fontSize: "16px", 
              fontWeight: "bold", 
              color: "#e53935",
              marginBottom: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px"
            }}>
              <span>🎉</span>
              <span>DÍA FESTIVO</span>
              <span>🎉</span>
            </div>
            <div style={{ 
              fontSize: "14px", 
              color: "#d32f2f",
              fontWeight: "600"
            }}>
              {festivo.name}
            </div>
            <div style={{ 
              fontSize: "12px", 
              color: "#666",
              marginTop: "4px",
              fontStyle: "italic"
            }}>
              {/* ✅ USAR LA FECHA CORREGIDA DESDE EL JUZGADO */}
              {fechaFestivoMostrar}
            </div>
          </div>
        )}
        
        <div className="juzgado-email-row">
          <span>{juzgado?.email || "juzgadoejemplo@correo.com"}</span>
          <button className="copy-button" onClick={handleCopy}>
            Copiar
          </button>
        </div>
        
        <div className="dialog-actions-vertical">
          {/* ✅ MOSTRAR BOTONES SOLO SI EL USUARIO ESTÁ LOGUEADO - SIN MENSAJES */}
          {isLoggedIn && (
            <>
              <button
                className="edit-button-full"
                onClick={() => onChangeTurn(juzgado)}
              >
                Cambiar Juzgado de Turno
              </button>
              <button
                className="delete-btn"
                style={{ justifyContent: "center", display: "flex", alignItems: "center" }}
                onClick={handleEliminarTurno}
                disabled={loading}
              >
                <img src={deleteIcon} alt="Eliminar" style={{ marginRight: "8px" }} />
                Eliminar Turno del Juzgado
              </button>
            </>
          )}
          
          {/* ✅ NO MOSTRAR NINGÚN MENSAJE - RESTRICCIONES COMPLETAMENTE INVISIBLES */}
          
          <button className="close-button-full" onClick={onClose}>
            Cerrar
          </button>
        </div>
        <Copy show={showToast} message={toastMsg} />
      </div>
    </div>
  );
}
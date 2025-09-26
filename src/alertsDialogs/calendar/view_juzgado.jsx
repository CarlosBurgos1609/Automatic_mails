import React, { useState, useEffect } from "react";
import axios from "axios";
import Copy from "../../components/Copy";
import deleteIcon from "../../assets/icons/delete.png";
import dayjs from "dayjs";

export default function ViewJuzgadoDialog({ 
  open, 
  onClose, 
  juzgado, 
  onTurnoEliminado, 
  showToastMsg, 
  onChangeTurn,
  festivo // ✅ NUEVO PROP PARA FESTIVO
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

  // Formatea la fecha seleccionada (corrige desfase de zona horaria)
  const fechaSeleccionada = juzgado?.turn_date
    ? dayjs(juzgado.turn_date).add(1, 'day').format("dddd, DD [de] MMMM [de] YYYY")
    : "";

  if (!open) return null;

  return (
    <div className="alert-dialog-backdrop">
      <div className="alert-dialog">
        <h1>{juzgado?.nombre || "Nombre del Juzgado"}</h1>
        
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
              {dayjs(festivo.date).format('DD [de] MMMM [de] YYYY')}
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
          <button className="close-button-full" onClick={onClose}>
            Cerrar
          </button>
        </div>
        <Copy show={showToast} message={toastMsg} />
      </div>
    </div>
  );
}

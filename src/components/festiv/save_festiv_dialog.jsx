import React, { useEffect } from "react";
import checkIcon from "../../assets/icons/check.png";

export default function SaveFestivDialog({ 
  show, 
  onClose, 
  festivData,
  isEdit = false,
  isDelete = false
}) {
  // Auto-cerrar después de 3 segundos
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  let mensaje = "¡Día festivo guardado correctamente!";
  if (isDelete) {
    mensaje = "¡Día festivo eliminado correctamente!";
  } else if (isEdit) {
    mensaje = "¡Día festivo actualizado correctamente!";
  }

  return (
    <div className={`custom-copy custom-copy-festiv${show ? " show" : ""}`}>
      <img src={checkIcon} alt="check" />
      <div className="copy-content">
        <span className="main-message">{mensaje}</span>
        <div className="festiv-details">
          <div><strong>Nombre:</strong> {festivData?.nombre}</div>
          <div><strong>Fecha:</strong> {festivData?.fecha}</div>
        </div>
      </div>
    </div>
  );
}
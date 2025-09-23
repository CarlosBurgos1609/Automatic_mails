import React, { useEffect } from "react";
import checkIcon from "../assets/icons/check.png";

export default function SaveJuzgadoDialog({ 
  show, 
  onClose, 
  juzgadoData, 
  municipioName,
  isEdit = false,
  isDelete = false // Nueva prop para distinguir eliminación
}) {
  // Auto-cerrar después de 4 segundos
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  let mensaje = "¡Juzgado guardado correctamente!";
  if (isDelete) {
    mensaje = "¡Juzgado eliminado correctamente!";
  } else if (isEdit) {
    mensaje = "¡Juzgado actualizado correctamente!";
  }

  return (
    <div className={`custom-copy custom-copy-juzgado${show ? " show" : ""}`}>
      <img src={checkIcon} alt="check" />
      <div className="copy-content">
        <span className="main-message">{mensaje}</span>
        <div className="juzgado-details">
          <div><strong>Código:</strong> {juzgadoData?.codigo}</div>
          <div><strong>Nombre:</strong> {juzgadoData?.nombre}</div>
          <div><strong>Email:</strong> {juzgadoData?.correo}</div>
          <div><strong>Municipio:</strong> {municipioName}</div>
        </div>
      </div>
    </div>
  );
}
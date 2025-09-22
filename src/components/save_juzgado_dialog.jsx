import React, { useEffect } from "react";
import checkIcon from "../assets/icons/check.png";

export default function SaveJuzgadoDialog({ 
  show, 
  onClose, 
  juzgadoData, 
  municipioName,
  isEdit = false // Nueva prop para distinguir entre crear y editar
}) {
  // Auto-cerrar después de 4 segundos (1 segundo más)
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  const mensaje = isEdit ? "¡Juzgado actualizado correctamente!" : "¡Juzgado guardado correctamente!";

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
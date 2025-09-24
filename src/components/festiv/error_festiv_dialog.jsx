import React, { useEffect } from "react";
import errorIcon from "../../assets/icons/error.png";

export default function ErrorFestivDialog({ 
  show, 
  onClose, 
  errorMessage,
  operationType = "guardar" // "guardar", "editar", "eliminar"
}) {
  // Auto-cerrar después de 5 segundos para errores
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  const getOperationText = () => {
    switch (operationType) {
      case "editar":
        return "actualizar";
      case "eliminar":
        return "eliminar";
      default:
        return "guardar";
    }
  };

  return (
    <div className={`custom-copy custom-copy-error${show ? " show" : ""}`}>
      <img src={errorIcon} alt="error" />
      <div className="copy-content">
        <span className="main-message">
          ¡Error al {getOperationText()} el día festivo!
        </span>
        <div className="error-details">
          {errorMessage}
        </div>
      </div>
    </div>
  );
}
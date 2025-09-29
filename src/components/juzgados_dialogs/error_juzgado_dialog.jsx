import React, { useEffect, useRef } from "react";
import errorIcon from "../../assets/icons/error.png";

export default function ErrorJuzgadoDialog({ 
  show, 
  onClose, 
  errorMessage,
  operationType = "guardar" // "guardar", "editar", "eliminar"
}) {
  const notificationRef = useRef(null);

  // ✅ MANEJAR CLICK FUERA DE LA NOTIFICACIÓN
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (show && notificationRef.current && !notificationRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (show) {
      // Agregar listener después de un pequeño delay
      const timer = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 100);

      return () => {
        clearTimeout(timer);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [show, onClose]);

  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      
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
    <div 
      ref={notificationRef}
      className={`custom-copy custom-copy-error${show ? " show" : ""}`}
      onClick={(e) => e.stopPropagation()}
    >
      <img src={errorIcon} alt="error" />
      <div className="copy-content">
        <span className="main-message">
          ¡Error al {getOperationText()} el juzgado!
        </span>
        <div className="error-details">
          {errorMessage}
        </div>
      </div>
      {/* ✅ BOTÓN DE CERRAR */}
      <button 
        className="notification-close-btn"
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          background: 'none',
          border: 'none',
          color: '#666',
          cursor: 'pointer',
          fontSize: '16px',
          width: '20px',
          height: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          opacity: 0.7,
          transition: 'opacity 0.2s'
        }}
        onMouseEnter={(e) => e.target.style.opacity = '1'}
        onMouseLeave={(e) => e.target.style.opacity = '0.7'}
      >
        ×
      </button>
    </div>
  );
}
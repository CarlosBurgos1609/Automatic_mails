import React, { useEffect, useRef } from "react";
import checkIcon from "../../assets/icons/check.png";

export default function SaveFestivDialog({ 
  show, 
  onClose, 
  festivData, 
  isEdit = false,
  isDelete = false
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
      const timer = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 100);

      return () => {
        clearTimeout(timer);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [show, onClose]);

  // ✅ AUTO-CERRAR DESPUÉS DE 4 SEGUNDOS
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 2000);
      
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
    <div 
      ref={notificationRef}
      className={`custom-copy custom-copy-festiv${show ? " show" : ""}`}
      onClick={(e) => e.stopPropagation()}
    >
      <img src={checkIcon} alt="check" />
      <div className="copy-content">
        <span className="main-message">{mensaje}</span>
        <div className="festiv-details">
          <div><strong>🎉 Nombre:</strong> {festivData?.nombre}</div>
          <div><strong>📅 Fecha:</strong> {festivData?.fecha}</div>
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
import React, { useEffect, useRef } from "react";
import checkIcon from "../../assets/icons/check.png";

export default function SaveJuzgadoDialog({ 
  show, 
  onClose, 
  juzgadoData, 
  municipioName,
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
      // Agregar listener después de un pequeño delay para evitar el click inmediato
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

  let mensaje = "¡Juzgado guardado correctamente!";
  if (isDelete) {
    mensaje = "¡Juzgado eliminado correctamente!";
  } else if (isEdit) {
    mensaje = "¡Juzgado actualizado correctamente!";
  }

  return (
    <div 
      ref={notificationRef}
      className={`custom-copy custom-copy-juzgado${show ? " show" : ""}`}
      onClick={(e) => e.stopPropagation()} // ✅ EVITAR QUE EL CLICK INTERNO CIERRE LA NOTIFICACIÓN
    >
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
      {/* ✅ BOTÓN DE CERRAR OPCIONAL */}
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
import React, { useEffect, useRef } from "react";
import checkIcon from "../assets/icons/check.png";

export default function Copy({ show, message }) {
  const notificationRef = useRef(null);

  // ✅ MANEJAR CLICK FUERA DE LA NOTIFICACIÓN
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (show && notificationRef.current && !notificationRef.current.contains(event.target)) {
        // Para este componente, no tenemos onClose, así que usamos un evento personalizado
        const closeEvent = new CustomEvent('closeToast');
        document.dispatchEvent(closeEvent);
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
  }, [show]);

  // ✅ ESCUCHAR EVENTO DE CIERRE
  useEffect(() => {
    const handleCloseToast = () => {
      if (notificationRef.current) {
        notificationRef.current.classList.remove('show');
      }
    };

    document.addEventListener('closeToast', handleCloseToast);
    return () => document.removeEventListener('closeToast', handleCloseToast);
  }, []);

  if (!show) return null;

  return (
    <div 
      ref={notificationRef}
      className={`custom-copy custom-copy-basic${show ? " show" : ""}`}
      onClick={(e) => e.stopPropagation()}
    >
      <img src={checkIcon} alt="check" />
      <div className="copy-content">
        <span className="main-message">{message}</span>
      </div>
      {/* ✅ BOTÓN DE CERRAR */}
      <button 
        className="notification-close-btn"
        onClick={() => {
          const closeEvent = new CustomEvent('closeToast');
          document.dispatchEvent(closeEvent);
        }}
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

import React, { useEffect, useRef } from "react";
import dayjs from "dayjs";
import "dayjs/locale/es";

dayjs.locale("es");

export default function FestivDialog({ 
  open, 
  onClose, 
  festivo,
  position = { x: 0, y: 0 } // Posición donde aparecerá el diálogo
}) {
  const dialogRef = useRef(null);

  // ✅ CERRAR AL HACER CLICK FUERA
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (open && dialogRef.current && !dialogRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (open) {
      const timer = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 100);

      return () => {
        clearTimeout(timer);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [open, onClose]);

  // ✅ CERRAR CON ESC
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && open) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [open, onClose]);

  if (!open || !festivo) return null;

  // ✅ CALCULAR POSICIÓN MEJORADA
  const dialogStyle = {
    position: 'fixed',
    top: position.y + 10,
    left: position.x - 150,
    zIndex: 10000,
    maxWidth: '320px',
    minWidth: '280px',
    transform: 'translateX(-50%)',
  };

  // Ajustar si se sale de la pantalla
  if (position.y > window.innerHeight - 200) {
    dialogStyle.top = position.y - 180;
  }
  if (position.x < 160) {
    dialogStyle.left = 10;
    dialogStyle.transform = 'translateX(0)';
  }
  if (position.x > window.innerWidth - 160) {
    dialogStyle.right = 10;
    dialogStyle.left = 'auto';
    dialogStyle.transform = 'translateX(0)';
  }

  return (
    <>
      {/* Backdrop transparente */}
      <div 
        className="festiv-dialog-backdrop"
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'transparent',
          zIndex: 9999,
        }}
      />
      
      {/* ✅ DIÁLOGO MEJORADO */}
      <div 
        ref={dialogRef}
        className="festiv-dialog"
        style={dialogStyle}
      >
        <div className="festiv-dialog-content">
          {/* Header */}
          <div className="festiv-dialog-header">
            <div className="festiv-icon">🎉</div>
            <h3 className="festiv-title">Día Festivo</h3>
            <button 
              className="festiv-close-btn"
              onClick={onClose}
              aria-label="Cerrar"
            >
              ×
            </button>
          </div>
          
          {/* Contenido */}
          <div className="festiv-dialog-body">
            <div className="festiv-name">
              {festivo.name}
            </div>
            <div className="festiv-date">
              {/* ✅ NO agregar día extra, mostrar fecha exacta */}
              {dayjs(festivo.date).format('dddd, DD [de] MMMM [de] YYYY')}
            </div>
          </div>
          
          {/* Footer */}
          <div className="festiv-dialog-footer">
            <div className="festiv-info">
              <span className="festiv-info-icon">ℹ️</span>
              <span className="festiv-info-text">Día no laborable</span>
            </div>
          </div>
        </div>
        
        {/* ✅ FLECHA INDICADORA MEJORADA */}
        <div className="festiv-dialog-arrow" />
      </div>
    </>
  );
}
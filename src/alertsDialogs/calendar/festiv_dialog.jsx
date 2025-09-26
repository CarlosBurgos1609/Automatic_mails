import React from "react";
import dayjs from "dayjs";
import "dayjs/locale/es";

dayjs.locale("es");

export default function FestivDialog({ 
  open, 
  onClose, 
  festivo,
  position = { x: 0, y: 0 } // Posición donde aparecerá el diálogo
}) {
  if (!open || !festivo) return null;

  // Calcular la posición del diálogo (hacia abajo)
  const dialogStyle = {
    position: 'fixed',
    top: position.y + 10, // 10px debajo del cursor
    left: position.x - 150, // Centrado horizontalmente
    zIndex: 10000,
    maxWidth: '300px',
    minWidth: '250px',
    transform: position.x < 150 ? 'translateX(0)' : 'translateX(-50%)', // Ajustar si está muy a la izquierda
  };

  // Si el diálogo se saldría de la pantalla por abajo, mostrarlo hacia arriba
  if (position.y > window.innerHeight - 200) {
    dialogStyle.top = position.y - 150; // Mostrar hacia arriba
  }

  // Si se sale por la derecha, ajustar hacia la izquierda
  if (position.x > window.innerWidth - 150) {
    dialogStyle.left = position.x - 300;
    dialogStyle.transform = 'translateX(0)';
  }

  return (
    <>
      {/* Backdrop para cerrar al hacer clic fuera */}
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
      
      {/* Diálogo de festivo */}
      <div 
        className="festiv-dialog"
        style={dialogStyle}
      >
        <div className="festiv-dialog-content">
          {/* Header del diálogo */}
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
          
          {/* Contenido del festivo */}
          <div className="festiv-dialog-body">
            <div className="festiv-name">
              {festivo.name}
            </div>
            <div className="festiv-date">
              {dayjs(festivo.date).format('dddd, DD [de] MMMM [de] YYYY')}
            </div>
          </div>
          
          {/* Footer opcional */}
          <div className="festiv-dialog-footer">
            <div className="festiv-info">
              <span className="festiv-info-icon">ℹ️</span>
              <span className="festiv-info-text">Día no laborable</span>
            </div>
          </div>
        </div>
        
        {/* Flecha indicadora */}
        <div className="festiv-dialog-arrow" />
      </div>
    </>
  );
}
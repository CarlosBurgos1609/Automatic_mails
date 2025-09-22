import React from "react";

export default function SaveJuzgadoDialog({ 
  show, 
  onClose, 
  juzgadoData, 
  municipioName 
}) {
  if (!show) return null;

  return (
    <div className="alert-dialog-backdrop">
      <div className="alert-dialog add-juzgado-dialog">
        <div className="success-icon" style={{ textAlign: "center", marginBottom: "1rem" }}>
          <div style={{ 
            fontSize: "3rem", 
            color: "#28a745", 
            marginBottom: "0.5rem" 
          }}>
            ✅
          </div>
          <h2 style={{ color: "#28a745", margin: "0" }}>
            ¡Juzgado guardado correctamente!
          </h2>
        </div>
        
        <div className="juzgado-details" style={{ 
          backgroundColor: "#f8f9fa", 
          padding: "1rem", 
          borderRadius: "8px",
          marginBottom: "1rem"
        }}>
          <h3 style={{ marginTop: "0", color: "#003f75" }}>
            Detalles del juzgado creado:
          </h3>
          
          <div style={{ marginBottom: "0.5rem" }}>
            <strong>Código:</strong> {juzgadoData?.codigo}
          </div>
          
          <div style={{ marginBottom: "0.5rem" }}>
            <strong>Nombre:</strong> {juzgadoData?.nombre}
          </div>
          
          <div style={{ marginBottom: "0.5rem" }}>
            <strong>Email:</strong> {juzgadoData?.correo}
          </div>
          
          <div style={{ marginBottom: "0.5rem" }}>
            <strong>Municipio:</strong> {municipioName}
          </div>
        </div>

        <div className="dialog-actions flex-column">
          <button 
            className="edit-button-full" 
            onClick={onClose}
            style={{ backgroundColor: "#28a745" }}
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
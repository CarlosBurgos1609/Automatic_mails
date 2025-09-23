import React, { useState, useEffect } from "react";
import Copy from "../../components/Copy";
import dayjs from "dayjs";

export default function AddJuzgadoCalendarDialog({ open, onClose, onSave, slotDate, showToastMsg }) {
  const [busqueda, setBusqueda] = useState("");
  const [juzgadosData, setJuzgadosData] = useState([]);
  const [juzgadoSeleccionado, setJuzgadoSeleccionado] = useState(null);
  const [error, setError] = useState("");
  const [showCopy, setShowCopy] = useState(false);
  const [loadingJuzgados, setLoadingJuzgados] = useState(false);

  // Cargar juzgados desde el backend
  useEffect(() => {
    if (open) {
      cargarJuzgados();
    }
  }, [open]);

  const cargarJuzgados = async () => {
    setLoadingJuzgados(true);
    try {
      const response = await fetch("http://localhost:5000/api/juzgados");
      const data = await response.json();
      setJuzgadosData(data);
      setError("");
    } catch (error) {
      console.error("Error al cargar juzgados:", error);
      setJuzgadosData([]);
      setError("No se pudieron cargar los juzgados.");
    } finally {
      setLoadingJuzgados(false);
    }
  };

  // Filtrado de juzgados por nombre, código o email
  const juzgadosFiltrados = juzgadosData.filter(
    (j) =>
      j.name.toLowerCase().includes(busqueda.toLowerCase()) ||
      j.code.toLowerCase().includes(busqueda.toLowerCase()) ||
      (j.email && j.email.toLowerCase().includes(busqueda.toLowerCase()))
  );

  const handleSeleccionarJuzgado = (juzgado) => {
    setJuzgadoSeleccionado(juzgado);
    setError("");
  };

  const handleGuardar = () => {
    if (!juzgadoSeleccionado) {
      setError("Debe seleccionar un juzgado antes de guardar.");
      return;
    }
    setError("");
    onSave(juzgadoSeleccionado, slotDate);
    showToastMsg("Se guardó correctamente");
    
    // Limpiar estado
    setBusqueda("");
    setJuzgadoSeleccionado(null);
    onClose();
  };

  const handleCopyEmail = () => {
    if (juzgadoSeleccionado?.email) {
      navigator.clipboard.writeText(juzgadoSeleccionado.email).then(() => {
        showToastMsg("¡Se copió con éxito!");
      });
    }
  };

  const handleDialogClose = () => {
    setBusqueda("");
    setJuzgadoSeleccionado(null);
    setError("");
    onClose();
  };

  // Formatea la fecha seleccionada
  const fechaSeleccionada = slotDate
    ? dayjs(slotDate).format("dddd, DD [de] MMMM [de] YYYY")
    : "";

  if (!open && !showCopy) return null;

  return (
    <>
      <Copy show={showCopy} message="Se guardó correctamente" />
      {open && !showCopy && (
        <div className="alert-dialog-backdrop">
          <div className="alert-dialog add-juzgado-dialog">
            <h1>Agregar Turno del Juzgado</h1>
            
            {fechaSeleccionada && (
              <div style={{ 
                marginBottom: "16px", 
                padding: "12px", 
                backgroundColor: "#e6f0fa", 
                borderRadius: "8px",
                color: "#003f75",
                fontWeight: "bold",
                textAlign: "center"
              }}>
                📅 Fecha seleccionada: {fechaSeleccionada}
              </div>
            )}

            <div className="input-busqueda">
              <input
                type="text"
                placeholder="Buscar juzgado por nombre, código o email..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                style={{ textTransform: 'none' }}
              />
            </div>

            {/* Lista de juzgados con diseño similar al de editar */}
            <div style={{ 
              maxHeight: "350px", 
              overflowY: "auto", 
              width: "100%",
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "8px",
              marginBottom: "16px"
            }}>
              {loadingJuzgados ? (
                <div style={{ textAlign: "center", padding: "20px" }}>
                  Cargando juzgados...
                </div>
              ) : juzgadosFiltrados.length === 0 ? (
                <div style={{ textAlign: "center", padding: "20px", color: "#666" }}>
                  {busqueda ? "No se encontraron juzgados" : "No hay juzgados disponibles"}
                </div>
              ) : (
                juzgadosFiltrados.map((juzgado) => (
                  <div
                    key={juzgado.id}
                    onClick={() => handleSeleccionarJuzgado(juzgado)}
                    style={{
                      padding: "12px",
                      border: juzgadoSeleccionado?.id === juzgado.id 
                        ? "2px solid #003f75" 
                        : "1px solid #ddd",
                      borderRadius: "6px",
                      margin: "8px 0",
                      cursor: "pointer",
                      backgroundColor: juzgadoSeleccionado?.id === juzgado.id 
                        ? "#e6f0fa" 
                        : "#f9f9f9",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      if (juzgadoSeleccionado?.id !== juzgado.id) {
                        e.target.style.backgroundColor = "#f0f7ff";
                        e.target.style.borderColor = "#003f75";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (juzgadoSeleccionado?.id !== juzgado.id) {
                        e.target.style.backgroundColor = "#f9f9f9";
                        e.target.style.borderColor = "#ddd";
                      }
                    }}
                  >
                    <div style={{ 
                      fontWeight: "bold", 
                      color: juzgadoSeleccionado?.id === juzgado.id ? "#003f75" : "#333",
                      marginBottom: "4px"
                    }}>
                      {juzgado.code} - {juzgado.name}
                    </div>
                    <div style={{ 
                      fontSize: "14px", 
                      color: "#666",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}>
                      <span>{juzgado.email}</span>
                      {juzgadoSeleccionado?.id === juzgado.id && (
                        <span style={{ 
                          color: "#003f75", 
                          fontWeight: "bold",
                          fontSize: "12px"
                        }}>
                          ✓ SELECCIONADO
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {error && (
              <div className="error-message" style={{ marginBottom: "16px" }}>
                {error}
              </div>
            )}

            {/* Información del juzgado seleccionado */}
            {juzgadoSeleccionado && (
              <div style={{
                marginBottom: "16px",
                padding: "12px",
                backgroundColor: "#f0f7ff",
                borderRadius: "8px",
                border: "1px solid #003f75"
              }}>
                <div style={{ fontWeight: "bold", color: "#003f75", marginBottom: "8px" }}>
                  Juzgado Seleccionado:
                </div>
                <div style={{ fontSize: "14px", color: "#333", marginBottom: "8px" }}>
                  <strong>Código:</strong> {juzgadoSeleccionado.code}<br />
                  <strong>Nombre:</strong> {juzgadoSeleccionado.name}<br />
                  <strong>Email:</strong> {juzgadoSeleccionado.email}
                </div>
                <button 
                  onClick={handleCopyEmail} 
                  style={{
                    padding: "6px 12px",
                    backgroundColor: "#003f75",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "12px"
                  }}
                >
                  📋 Copiar Email
                </button>
              </div>
            )}

            <div className="dialog-actions flex-column">
              <button
                className="edit-button-full"
                onClick={handleGuardar}
                disabled={!juzgadoSeleccionado}
                style={{
                  backgroundColor: juzgadoSeleccionado ? "#003f75" : "#ccc",
                  cursor: juzgadoSeleccionado ? "pointer" : "not-allowed"
                }}
              >
                {juzgadoSeleccionado ? "Guardar Turno" : "Seleccione un Juzgado"}
              </button>
              <button className="close-button-full" onClick={handleDialogClose}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
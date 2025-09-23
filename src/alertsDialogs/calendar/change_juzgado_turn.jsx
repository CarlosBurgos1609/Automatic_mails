import React, { useState, useEffect } from "react";
import dayjs from "dayjs"; 

export default function ChangeJuzgadoTurnDialog({
  open,
  onClose,
  onChange,
  slotDate,
  currentJuzgado,
  showToastMsg,
}) {
  const [busqueda, setBusqueda] = useState("");
  const [juzgadosData, setJuzgadosData] = useState([]);
  const [nuevoJuzgado, setNuevoJuzgado] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isChanging, setIsChanging] = useState(false);

  // Cargar juzgados desde el backend
  useEffect(() => {
    if (open) {
      setLoading(true);
      fetch("http://localhost:5000/api/juzgados")
        .then((res) => res.json())
        .then((data) => {
          setJuzgadosData(data);
          setError("");
        })
        .catch(() => {
          setJuzgadosData([]);
          setError("No se pudieron cargar los juzgados.");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [open]);

  // Filtrado de juzgados por nombre o email
  const juzgadosFiltrados = juzgadosData.filter(
    (j) =>
      j.name.toLowerCase().includes(busqueda.toLowerCase()) ||
      (j.email && j.email.toLowerCase().includes(busqueda.toLowerCase())) ||
      j.code.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Formatea la fecha seleccionada
  const fechaSeleccionada = slotDate
    ? dayjs(slotDate).add(1, 'day').format("dddd, DD [de] MMMM [de] YYYY")
    : "";

  const handleSeleccionarJuzgado = (juzgado) => {
    setNuevoJuzgado(juzgado);
    setError("");
  };

  const handleGuardar = async () => {
    if (!nuevoJuzgado) {
      setError("Debe seleccionar un juzgado para el cambio.");
      return;
    }
    
    setIsChanging(true);
    setError("");
    
    try {
      await onChange(nuevoJuzgado, slotDate);
      showToastMsg("Turno cambiado correctamente");
      handleClose();
    } catch (error) {
      setError("Error al cambiar el turno. Intente nuevamente.");
    } finally {
      setIsChanging(false);
    }
  };

  const handleClose = () => {
    setBusqueda("");
    setNuevoJuzgado(null);
    setError("");
    onClose();
  };

  if (!open) return null;

  return (
    <div className="alert-dialog-backdrop">
      <div className="alert-dialog add-juzgado-dialog">
        <h1>Cambiar Turno de Juzgado</h1>
        
        {/* Información del turno actual */}
        <div style={{ 
          marginBottom: "20px", 
          padding: "16px", 
          backgroundColor: "#e6f0fa", 
          borderRadius: "8px",
          border: "1px solid #003f75"
        }}>
          <div style={{ 
            fontWeight: "bold", 
            color: "#003f75", 
            marginBottom: "8px",
            fontSize: "16px"
          }}>
            📅 Fecha: {fechaSeleccionada}
          </div>
          <div style={{ color: "#003f75", fontSize: "14px" }}>
            <strong>Juzgado actual:</strong>{" "}
            {currentJuzgado
              ? `${currentJuzgado.name} (${currentJuzgado.email})`
              : "No hay juzgado asignado"}
          </div>
        </div>

        {/* Campo de búsqueda */}
        <div className="input-busqueda">
          <input
            type="text"
            placeholder="Buscar juzgado por nombre, código o email..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            disabled={loading || isChanging}
            style={{ textTransform: 'none' }}
          />
        </div>

        {/* Lista de juzgados */}
        <div style={{ 
          maxHeight: "300px", 
          overflowY: "auto", 
          width: "100%",
          border: "1px solid #ccc",
          borderRadius: "8px",
          padding: "8px",
          marginBottom: "16px"
        }}>
          {loading ? (
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
                  border: nuevoJuzgado?.id === juzgado.id ? "2px solid #003f75" : "1px solid #ddd",
                  borderRadius: "6px",
                  margin: "8px 0",
                  cursor: "pointer",
                  backgroundColor: nuevoJuzgado?.id === juzgado.id ? "#e6f0fa" : "#f9f9f9",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (nuevoJuzgado?.id !== juzgado.id) {
                    e.target.style.backgroundColor = "#f0f8ff";
                  }
                }}
                onMouseLeave={(e) => {
                  if (nuevoJuzgado?.id !== juzgado.id) {
                    e.target.style.backgroundColor = "#f9f9f9";
                  }
                }}
              >
                <div style={{ 
                  fontWeight: "bold", 
                  color: "#003f75",
                  marginBottom: "4px"
                }}>
                  {juzgado.code} - {juzgado.name}
                  {nuevoJuzgado?.id === juzgado.id && (
                    <span style={{ 
                      marginLeft: "8px", 
                      fontSize: "12px", 
                      color: "#28a745",
                      fontWeight: "normal"
                    }}>
                      ✓ Seleccionado
                    </span>
                  )}
                </div>
                <div style={{ fontSize: "14px", color: "#666" }}>
                  📧 {juzgado.email}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Juzgado seleccionado */}
        {nuevoJuzgado && (
          <div style={{ 
            marginBottom: "16px", 
            padding: "12px", 
            backgroundColor: "#d4edda", 
            borderRadius: "8px",
            border: "1px solid #28a745"
          }}>
            <div style={{ 
              fontWeight: "bold", 
              color: "#155724",
              marginBottom: "4px"
            }}>
              ✅ Nuevo juzgado seleccionado:
            </div>
            <div style={{ color: "#155724", fontSize: "14px" }}>
              {nuevoJuzgado.code} - {nuevoJuzgado.name}
            </div>
            <div style={{ color: "#155724", fontSize: "14px" }}>
              📧 {nuevoJuzgado.email}
            </div>
          </div>
        )}

        {/* Mensaje de error */}
        {error && (
          <div className="error-message" style={{ marginBottom: "16px" }}>
            {error}
          </div>
        )}

        {/* Botones de acción */}
        <div className="dialog-actions flex-column">
          <button
            className="edit-button-full"
            onClick={handleGuardar}
            disabled={!nuevoJuzgado || isChanging || loading}
            style={{
              backgroundColor: nuevoJuzgado ? "#28a745" : "#ccc",
              cursor: nuevoJuzgado && !isChanging && !loading ? "pointer" : "not-allowed"
            }}
          >
            {isChanging ? "Cambiando turno..." : "Confirmar Cambio"}
          </button>
          <button 
            className="close-button-full" 
            onClick={handleClose}
            disabled={isChanging}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
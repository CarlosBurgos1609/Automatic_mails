import React, { useState, useEffect } from "react";

export default function DeleteJuzgadoDialog({ open, onClose, onDelete }) {
  const [step, setStep] = useState(1); // 1: Lista, 2: Confirmar eliminación
  const [juzgados, setJuzgados] = useState([]);
  const [juzgadoSeleccionado, setJuzgadoSeleccionado] = useState(null);
  const [municipios, setMunicipios] = useState([]);
  
  const [loadingJuzgados, setLoadingJuzgados] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");

  // Cargar juzgados cuando se abre el diálogo
  useEffect(() => {
    if (open) {
      cargarJuzgados();
      cargarMunicipios();
    }
  }, [open]);

  const cargarJuzgados = async () => {
    setLoadingJuzgados(true);
    try {
      const response = await fetch("http://localhost:5000/api/juzgados");
      const data = await response.json();
      setJuzgados(data);
    } catch (error) {
      console.error("Error al cargar juzgados:", error);
      setJuzgados([]);
    } finally {
      setLoadingJuzgados(false);
    }
  };

  const cargarMunicipios = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/municipios");
      const data = await response.json();
      setMunicipios(data);
    } catch (error) {
      console.error("Error al cargar municipios:", error);
      setMunicipios([]);
    }
  };

  const handleSeleccionarJuzgado = (juzgado) => {
    setJuzgadoSeleccionado(juzgado);
    setError("");
    setStep(2);
  };

  const handleEliminar = async () => {
    setIsDeleting(true);
    setError("");
    
    try {
      console.log('🗑️ Eliminando juzgado:', juzgadoSeleccionado);

      const response = await fetch(
        `http://localhost:5000/api/juzgados/${juzgadoSeleccionado.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log('📥 Response status:', response.status);

      // Verificar si la respuesta es JSON antes de parsearlo
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error('❌ Respuesta no es JSON:', textResponse);
        throw new Error('El servidor devolvió una respuesta no válida');
      }

      const result = await response.json();
      console.log('📥 Response data:', result);

      if (response.ok) {
        // Obtener nombre del municipio para mostrar en el mensaje
        const municipio = municipios.find(m => m.id === juzgadoSeleccionado.municipio_id);
        
        // Preparar los datos para el diálogo de éxito
        const deletedData = {
          codigo: juzgadoSeleccionado.code,
          nombre: juzgadoSeleccionado.name,
          correo: juzgadoSeleccionado.email,
          municipio_name: municipio?.name || "",
        };

        // Limpiar y volver al paso 1
        handleVolver();

        // Llamar a onDelete con los datos
        if (onDelete) {
          onDelete(deletedData);
        }
      } else {
        // Manejar errores específicos
        if (response.status === 409) {
          setError(result.error || "El juzgado tiene turnos asociados y no puede ser eliminado");
        } else if (response.status === 404) {
          setError("El juzgado no fue encontrado");
        } else {
          setError(result.error || "Error al eliminar el juzgado");
        }
      }
    } catch (error) {
      console.error("❌ Error al eliminar juzgado:", error);
      setError(`Error de conexión: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleVolver = () => {
    setStep(1);
    setJuzgadoSeleccionado(null);
    setError("");
    setBusqueda("");
  };

  const handleDialogClose = () => {
    handleVolver();
    onClose();
  };

  // Filtrar juzgados por búsqueda
  const juzgadosFiltrados = juzgados.filter(
    (j) =>
      j.name.toLowerCase().includes(busqueda.toLowerCase()) ||
      j.code.toLowerCase().includes(busqueda.toLowerCase()) ||
      (j.email && j.email.toLowerCase().includes(busqueda.toLowerCase()))
  );

  // Obtener nombre del municipio del juzgado seleccionado
  const municipioSeleccionado = municipios.find(m => m.id === juzgadoSeleccionado?.municipio_id);

  if (!open) return null;

  return (
    <div className="alert-dialog-backdrop">
      <div className="alert-dialog add-juzgado-dialog">
        {step === 1 ? (
          // PASO 1: Lista de juzgados
          <>
            <h1 style={{ color: "#e53935" }}>Seleccionar Juzgado para Eliminar</h1>
            
            <div className="input-busqueda">
              <input
                type="text"
                placeholder="Buscar juzgado por nombre, código o email..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                style={{ textTransform: 'none' }}
              />
            </div>

            <div style={{ 
              maxHeight: "400px", 
              overflowY: "auto", 
              width: "100%",
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "8px"
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
                      border: "1px solid #ddd",
                      borderRadius: "6px",
                      margin: "8px 0",
                      cursor: "pointer",
                      backgroundColor: "#f9f9f9",
                      transition: "background-color 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = "#ffe6e6";
                      e.target.style.borderColor = "#e53935";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = "#f9f9f9";
                      e.target.style.borderColor = "#ddd";
                    }}
                  >
                    <div style={{ fontWeight: "bold", color: "#e53935" }}>
                      {juzgado.code} - {juzgado.name}
                    </div>
                    <div style={{ fontSize: "14px", color: "#666" }}>
                      {juzgado.email}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="dialog-actions flex-column">
              <button className="close-button-full" onClick={handleDialogClose}>
                Cerrar
              </button>
            </div>
          </>
        ) : (
          // PASO 2: Confirmación de eliminación
          <>
            <h1 style={{ color: "#e53935" }}>⚠️ Confirmar Eliminación</h1>
            
            <div style={{ 
              marginBottom: "16px", 
              padding: "16px", 
              backgroundColor: "#fff0f0", 
              borderRadius: "8px",
              border: "2px solid #e53935",
              color: "#e53935",
              textAlign: "center"
            }}>
              <div style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "8px" }}>
                ¿Está seguro que desea eliminar este juzgado?
              </div>
              <div style={{ fontSize: "14px", marginBottom: "12px" }}>
                Esta acción no se puede deshacer.
              </div>
              
              <div style={{ 
                backgroundColor: "#fff", 
                padding: "12px", 
                borderRadius: "6px",
                color: "#003f75",
                fontWeight: "bold"
              }}>
                <div><strong>Código:</strong> {juzgadoSeleccionado?.code}</div>
                <div><strong>Nombre:</strong> {juzgadoSeleccionado?.name}</div>
                <div><strong>Email:</strong> {juzgadoSeleccionado?.email}</div>
                {municipioSeleccionado && (
                  <div><strong>Municipio:</strong> {municipioSeleccionado.name}</div>
                )}
              </div>
            </div>

            {error && (
              <div style={{ 
                padding: "12px", 
                backgroundColor: "#fff0f0", 
                color: "#e53935", 
                borderRadius: "6px",
                marginBottom: "16px",
                textAlign: "center",
                fontSize: "14px",
                border: "1px solid #e53935"
              }}>
                {error}
              </div>
            )}

            <div className="dialog-actions flex-column">
              <button
                className="close-button-full"
                onClick={handleEliminar}
                disabled={isDeleting}
                style={{ 
                  backgroundColor: "#e53935", 
                  color: "#fff",
                  border: "2px solid #e53935"
                }}
              >
                {isDeleting ? "Eliminando..." : "SÍ, ELIMINAR JUZGADO"}
              </button>
              <button
                className="edit-button-full"
                onClick={handleVolver}
                disabled={isDeleting}
                style={{ backgroundColor: "#666", marginTop: "8px" }}
              >
                Volver a la Lista
              </button>
              <button
                className="edit-button-full"
                onClick={handleDialogClose}
                disabled={isDeleting}
                style={{ backgroundColor: "#003f75", marginTop: "8px" }}
              >
                Cancelar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
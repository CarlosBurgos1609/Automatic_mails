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
      const response = await fetch(
        `http://localhost:5000/api/juzgados/${juzgadoSeleccionado.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error('❌ Respuesta no es JSON:', textResponse);
        throw new Error('El servidor devolvió una respuesta no válida');
      }

      const result = await response.json();

      if (response.ok) {
        const municipio = municipios.find(m => m.id === juzgadoSeleccionado.municipio_id);
        
        const deletedData = {
          codigo: juzgadoSeleccionado.code,
          nombre: juzgadoSeleccionado.name,
          correo: juzgadoSeleccionado.email,
          municipio_name: municipio?.name || "",
        };

        // Limpiar y cerrar inmediatamente
        handleVolver();

        if (onDelete) {
          onDelete(deletedData);
        }
      } else {
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
    // Limpieza inmediata para navegación rápida
    setStep(1);
    setJuzgadoSeleccionado(null);
    setError("");
    setBusqueda("");
  };

  const handleDialogClose = () => {
    // Limpieza completa e inmediata
    handleVolver();
    setLoadingJuzgados(false);
    setIsDeleting(false);
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
      <div className="alert-dialog add-juzgado-dialog juzgado-management-dialog delete-juzgado-dialog">
        {step === 1 ? (
          // PASO 1: Lista de juzgados
          <>
            <h1>Seleccionar Juzgado para Eliminar</h1>
            
            <div className="step-indicator list-step">
              Paso 1: Seleccione el juzgado que desea eliminar
            </div>
            
            <div className="search-input">
              <input
                type="text"
                placeholder="Buscar juzgado por nombre, código o email..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            <div className="juzgados-list">
              {loadingJuzgados ? (
                <div className="loading-state">
                  Cargando juzgados...
                </div>
              ) : juzgadosFiltrados.length === 0 ? (
                <div className="empty-state">
                  {busqueda ? "No se encontraron juzgados" : "No hay juzgados disponibles"}
                </div>
              ) : (
                juzgadosFiltrados.map((juzgado) => (
                  <div
                    key={juzgado.id}
                    onClick={() => handleSeleccionarJuzgado(juzgado)}
                    className="juzgado-item delete-hover"
                  >
                    <div className="juzgado-name delete-mode">
                      {juzgado.code} - {juzgado.name}
                    </div>
                    <div className="juzgado-email">
                      {juzgado.email}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="action-buttons">
              <button className="close-button-full" onClick={handleDialogClose}>
                Cerrar
              </button>
            </div>
          </>
        ) : (
          // PASO 2: Confirmación de eliminación
          <>
            <h1>⚠️ Confirmar Eliminación</h1>
            
            <div className="confirm-delete-section">
              <div className="delete-warning">
                <div className="warning-title">
                  ¿Está seguro que desea eliminar este juzgado?
                </div>
                <div className="warning-subtitle">
                  Esta acción no se puede deshacer.
                </div>
                
                <div className="juzgado-details">
                  <div><strong>Código:</strong> {juzgadoSeleccionado?.code}</div>
                  <div><strong>Nombre:</strong> {juzgadoSeleccionado?.name}</div>
                  <div><strong>Email:</strong> {juzgadoSeleccionado?.email}</div>
                  {municipioSeleccionado && (
                    <div><strong>Municipio:</strong> {municipioSeleccionado.name}</div>
                  )}
                </div>
              </div>
            </div>

            {error && (
              <div className="error-message center">
                {error}
              </div>
            )}

            <div className="action-buttons">
              <button
                className="primary-button delete-button"
                onClick={handleEliminar}
                disabled={isDeleting}
              >
                {isDeleting ? "Eliminando..." : "SÍ, ELIMINAR JUZGADO"}
              </button>
              <button
                className="secondary-button"
                onClick={handleVolver}
                disabled={isDeleting}
              >
                Volver a la Lista
              </button>
              <button
                className="cancel-button"
                onClick={handleDialogClose}
                disabled={isDeleting}
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
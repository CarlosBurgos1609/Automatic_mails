import React, { useState, useEffect } from "react";

export default function EditJuzgadoDialog({ open, onClose, onSave }) {
  const [step, setStep] = useState(1); // 1: Lista, 2: Editar
  const [juzgados, setJuzgados] = useState([]);
  const [juzgadoSeleccionado, setJuzgadoSeleccionado] = useState(null);
  const [municipios, setMunicipios] = useState([]);
  
  // Estados del formulario
  const [codigo, setCodigo] = useState("");
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [municipioId, setMunicipioId] = useState("");
  
  const [loadingJuzgados, setLoadingJuzgados] = useState(false);
  const [loadingMunicipios, setLoadingMunicipios] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [correoError, setCorreoError] = useState("");
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
    setLoadingMunicipios(true);
    try {
      const response = await fetch("http://localhost:5000/api/municipios");
      const data = await response.json();
      setMunicipios(data);
    } catch (error) {
      console.error("Error al cargar municipios:", error);
      setMunicipios([]);
    } finally {
      setLoadingMunicipios(false);
    }
  };

  const handleSeleccionarJuzgado = (juzgado) => {
    setJuzgadoSeleccionado(juzgado);
    setCodigo(juzgado.code);
    setNombre(juzgado.name);
    setCorreo(juzgado.email);
    setMunicipioId(juzgado.municipio_id.toString());
    setStep(2);
  };

  const handleGuardar = async () => {
    let hasError = false;
    setCorreoError("");

    if (!codigo || !nombre || !correo || !municipioId) {
      hasError = true;
    }
    if (!correo.includes("@")) {
      setCorreoError("El correo electrónico debe contener un '@'.");
      hasError = true;
    }

    setError(hasError);

    if (!hasError) {
      setIsLoading(true);
      try {
        const municipioSeleccionado = municipios.find(
          (m) => m.id === parseInt(municipioId)
        );

        const juzgadoData = {
          code: codigo.toUpperCase().trim(),
          name: nombre.toUpperCase().trim(),
          email: correo.toLowerCase().trim(),
          municipio_id: municipioId,
        };

        const response = await fetch(
          `http://localhost:5000/api/juzgados/${juzgadoSeleccionado.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(juzgadoData),
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
          const savedData = {
            codigo: juzgadoData.code,
            nombre: juzgadoData.name,
            correo: juzgadoData.email,
            municipio_name: municipioSeleccionado?.name || "",
          };

          // Limpiar y cerrar inmediatamente
          handleVolver();

          if (onSave) {
            onSave(savedData);
          }
        } else {
          setCorreoError(result.error || "Error al actualizar el juzgado");
        }
      } catch (error) {
        console.error("❌ Error al actualizar juzgado:", error);
        setCorreoError(`Error de conexión: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleVolver = () => {
    // Limpieza inmediata para navegación rápida
    setStep(1);
    setJuzgadoSeleccionado(null);
    setCodigo("");
    setNombre("");
    setCorreo("");
    setMunicipioId("");
    setError(false);
    setCorreoError("");
    setBusqueda("");
  };

  const handleDialogClose = () => {
    // Limpieza completa e inmediata
    handleVolver();
    setLoadingJuzgados(false);
    setLoadingMunicipios(false);
    setIsLoading(false);
    onClose();
  };

  // Filtrar juzgados por búsqueda
  const juzgadosFiltrados = juzgados.filter(
    (j) =>
      j.name.toLowerCase().includes(busqueda.toLowerCase()) ||
      j.code.toLowerCase().includes(busqueda.toLowerCase()) ||
      (j.email && j.email.toLowerCase().includes(busqueda.toLowerCase()))
  );

  // Obtener nombre del municipio actual
  const municipioActual = municipios.find(m => m.id === juzgadoSeleccionado?.municipio_id);

  if (!open) return null;

  return (
    <div className="alert-dialog-backdrop">
      <div className="alert-dialog add-juzgado-dialog juzgado-management-dialog">
        {step === 1 ? (
          // PASO 1: Lista de juzgados
          <>
            <h1>Seleccionar Juzgado para Editar</h1>
            
            <div className="step-indicator list-step">
              Paso 1: Seleccione el juzgado que desea editar
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
                    className="juzgado-item"
                  >
                    <div className="juzgado-name">
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
              <button className="cancel-button" onClick={handleDialogClose}>
                Cerrar
              </button>
            </div>
          </>
        ) : (
          // PASO 2: Formulario de edición
          <>
            <h1>Editar Juzgado</h1>
            
            <div className="step-indicator edit-step">
              Editando: {juzgadoSeleccionado?.code} - {juzgadoSeleccionado?.name}
              {municipioActual && (
                <div className="current-info">
                  Municipio actual: {municipioActual.name}
                </div>
              )}
            </div>

            <div className="form-section">
              <div className="form-group">
                <input
                  type="text"
                  placeholder="# Código del juzgado"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  className={error && !codigo ? "input-error" : ""}
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <input
                  type="text"
                  placeholder="Nombre del juzgado"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className={error && !nombre ? "input-error" : ""}
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <input
                  type="email"
                  placeholder="Correo electrónico"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  className={(error && !correo) || correoError ? "input-error" : ""}
                  disabled={isLoading}
                />
                {correoError && <div className="error-message">{correoError}</div>}
              </div>

              <div className="form-group">
                <select
                  value={municipioId}
                  onChange={(e) => setMunicipioId(e.target.value)}
                  className={error && !municipioId ? "input-error" : ""}
                  disabled={loadingMunicipios || isLoading}
                >
                  <option value="">
                    {loadingMunicipios
                      ? "Cargando municipios..."
                      : "Seleccionar municipio"}
                  </option>
                  {municipios.map((municipio) => (
                    <option key={municipio.id} value={municipio.id}>
                      {municipio.name}
                    </option>
                  ))}
                </select>
              </div>

              {error && (!codigo || !nombre || !correo || !municipioId) && (
                <div className="error-message">
                  Por favor, complete todos los campos obligatorios.
                </div>
              )}
            </div>

            <div className="action-buttons">
              <button
                className="primary-button update-button"
                onClick={handleGuardar}
                disabled={isLoading}
              >
                {isLoading ? "Actualizando..." : "Actualizar Juzgado"}
              </button>
              <button
                className="secondary-button"
                onClick={handleVolver}
                disabled={isLoading}
              >
                Volver a la Lista
              </button>
              <button
                className="cancel-button"
                onClick={handleDialogClose}
                disabled={isLoading}
              >
                Cerrar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
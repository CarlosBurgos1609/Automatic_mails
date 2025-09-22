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

        console.log('📤 Enviando datos:', juzgadoData);
        console.log('🎯 URL:', `http://localhost:5000/api/juzgados/${juzgadoSeleccionado.id}`);

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

        console.log('📥 Response status:', response.status);
        console.log('📥 Response headers:', response.headers);

        // Verificar si la respuesta es JSON antes de parsearlo
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const textResponse = await response.text();
          console.error('❌ Respuesta no es JSON:', textResponse);
          throw new Error('El servidor devolvió una respuesta no válida (HTML en lugar de JSON)');
        }

        const result = await response.json();
        console.log('📥 Response data:', result);

        if (response.ok) {
          // Preparar los datos para el diálogo de éxito
          const savedData = {
            codigo: juzgadoData.code,
            nombre: juzgadoData.name,
            correo: juzgadoData.email,
            municipio_name: municipioSeleccionado?.name || "",
          };

          // Limpiar formulario y volver al paso 1
          handleVolver();

          // Llamar a onSave con los datos
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

  // Obtener nombre del municipio actual
  const municipioActual = municipios.find(m => m.id === juzgadoSeleccionado?.municipio_id);

  if (!open) return null;

  return (
    <div className="alert-dialog-backdrop">
      <div className="alert-dialog add-juzgado-dialog">
        {step === 1 ? (
          // PASO 1: Lista de juzgados
          <>
            <h1>Seleccionar Juzgado para Editar</h1>
            
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
                      e.target.style.backgroundColor = "#e6f0fa";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = "#f9f9f9";
                    }}
                  >
                    <div style={{ fontWeight: "bold", color: "#003f75" }}>
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
          // PASO 2: Formulario de edición
          <>
            <h1>Editar Juzgado</h1>
            
            <div style={{ 
              marginBottom: "16px", 
              padding: "12px", 
              backgroundColor: "#e6f0fa", 
              borderRadius: "8px",
              color: "#003f75",
              fontWeight: "bold"
            }}>
              Editando: {juzgadoSeleccionado?.code} - {juzgadoSeleccionado?.name}
              {municipioActual && (
                <div style={{ fontSize: "14px", fontWeight: "normal", marginTop: "4px" }}>
                  Municipio actual: {municipioActual.name}
                </div>
              )}
            </div>

            <div className="input-busqueda">
              <input
                type="text"
                placeholder="# Código del juzgado"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                className={error && !codigo ? "input-error" : ""}
                disabled={isLoading}
                style={{ textTransform: 'uppercase' }}
              />
            </div>

            <div className="input-busqueda">
              <input
                type="text"
                placeholder="Nombre del juzgado"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className={error && !nombre ? "input-error" : ""}
                disabled={isLoading}
                style={{ textTransform: 'uppercase' }}
              />
            </div>

            <div className="input-busqueda">
              <input
                type="email"
                placeholder="Correo electrónico"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                className={
                  (error && !correo) || correoError ? "input-error" : ""
                }
                disabled={isLoading}
                style={{ textTransform: 'lowercase' }}
              />
              {correoError && <div className="error-message">{correoError}</div>}
            </div>

            <div className="input-busqueda">
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

            <div className="dialog-actions flex-column">
              <button
                className="edit-button-full"
                onClick={handleGuardar}
                disabled={isLoading}
              >
                {isLoading ? "Actualizando..." : "Actualizar Juzgado"}
              </button>
              <button
                className="edit-button-full"
                onClick={handleVolver}
                disabled={isLoading}
                style={{ backgroundColor: "#666", marginTop: "8px" }}
              >
                Volver a la Lista
              </button>
              <button
                className="close-button-full"
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
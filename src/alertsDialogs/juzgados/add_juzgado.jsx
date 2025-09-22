import React, { useState, useEffect } from "react";

export default function AddJuzgadoDialog({ open, onClose, onSave }) {
  const [codigo, setCodigo] = useState("");
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [municipioId, setMunicipioId] = useState("");
  const [municipios, setMunicipios] = useState([]);
  const [error, setError] = useState(false);
  const [correoError, setCorreoError] = useState("");
  const [loadingMunicipios, setLoadingMunicipios] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Cargar municipios cuando se abre el diálogo
  useEffect(() => {
    if (open) {
      setLoadingMunicipios(true);
      fetch("http://localhost:5000/api/municipios")
        .then((res) => res.json())
        .then((data) => {
          setMunicipios(data);
        })
        .catch((error) => {
          console.error("Error al cargar municipios:", error);
          setMunicipios([]);
        })
        .finally(() => {
          setLoadingMunicipios(false);
        });
    }
  }, [open]);

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

        console.log("Datos a enviar:", juzgadoData);

        const response = await fetch("http://localhost:5000/api/juzgados", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(juzgadoData),
        });

        const result = await response.json();

        if (response.ok) {
          // Preparar los datos para el diálogo de éxito
          const savedData = {
            codigo: juzgadoData.code,
            nombre: juzgadoData.name,
            correo: juzgadoData.email,
            municipio_name: municipioSeleccionado?.name || "",
          };

          // Limpiar el formulario
          setCodigo("");
          setNombre("");
          setCorreo("");
          setMunicipioId("");
          setError(false);
          setCorreoError("");

          // Llamar a onSave con los datos (esto cerrará este diálogo y mostrará el de éxito)
          if (onSave) {
            onSave(savedData);
          }
        } else {
          setCorreoError(result.error || "Error al guardar el juzgado");
        }
      } catch (error) {
        console.error("Error al guardar juzgado:", error);
        setCorreoError("Error de conexión al guardar el juzgado");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDialogClose = () => {
    // Limpiar formulario al cerrar
    setCodigo("");
    setNombre("");
    setCorreo("");
    setMunicipioId("");
    setError(false);
    setCorreoError("");
    onClose();
  };

  if (!open) return null;

  return (
    <div className="alert-dialog-backdrop">
      <div className="alert-dialog add-juzgado-dialog">
        <h1>Agregar Nuevo Juzgado</h1>
        <div className="input-busqueda">
          <input
            type="text"
            placeholder=" # Código del juzgado"
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
            {isLoading ? "Guardando..." : "Guardar"}
          </button>
          <button
            className="close-button-full"
            onClick={handleDialogClose}
            disabled={isLoading}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

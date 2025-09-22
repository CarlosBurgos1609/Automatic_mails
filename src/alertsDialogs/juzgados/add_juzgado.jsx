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

  const handleGuardar = () => {
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
      // Encontrar el nombre del municipio seleccionado
      const municipioSeleccionado = municipios.find(
        (m) => m.id === parseInt(municipioId)
      );

      onSave({
        codigo,
        nombre,
        correo,
        municipio_id: municipioId,
        municipio_name: municipioSeleccionado?.name || "",
      });
      onClose();
      // Limpiar formulario
      setCodigo("");
      setNombre("");
      setCorreo("");
      setMunicipioId("");
      setError(false);
      setCorreoError("");
    }
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
          />
        </div>
        <div className="input-busqueda">
          <input
            type="text"
            placeholder="Nombre del juzgado"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className={error && !nombre ? "input-error" : ""}
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
          />
          {correoError && <div className="error-message">{correoError}</div>}
        </div>
        <div className="input-busqueda">
          <select
            value={municipioId}
            onChange={(e) => setMunicipioId(e.target.value)}
            className={error && !municipioId ? "input-error" : ""}
            disabled={loadingMunicipios}
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
          <button className="edit-button-full" onClick={handleGuardar}>
            Guardar
          </button>
          <button className="close-button-full" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

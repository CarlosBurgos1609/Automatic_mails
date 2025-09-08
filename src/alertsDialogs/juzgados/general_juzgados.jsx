import React, { useState } from "react";
import Copy from "../../components/Copy";
import AddJuzgadoDialog from "../juzgados/add_juzgado";
import add from "../../assets/icons/add.png";
import deleteIcon from "../../assets/icons/delete.png";
import edit from "../../assets/icons/edit.png";

export default function JuzgadoDialog({ open, onClose }) {
  const [showAddJuzgadoDialog, setShowAddJuzgadoDialog] = useState(false);

  const handleSaveNuevoJuzgado = (nuevoJuzgado) => {
    // Aquí puedes agregar el nuevo juzgado a tu lista o hacer lo que necesites
    // Por ejemplo: setJuzgados([...juzgados, nuevoJuzgado]);
    // O mostrar un toast de éxito
  };

  if (!open) return null;

  return (
    <div className="alert-dialog-backdrop">
      <div className="alert_dialog_juzgados">
        <h1> <img src={edit} alt="" /> JUZGADOS</h1>
        
          <button
            className="add-btn"
            onClick={() => setShowAddJuzgadoDialog(true)}
            style={{ marginBottom: "16px" }}
          >
            <img src={add} alt="Añadir" />
            Agregar Nuevo Juzgado
          </button>
          <button className="add-btn">
            <img src={edit} alt="Editar" />
            Editar Juzgado
          </button>
          <button className="delete-btn">
            <img src={deleteIcon} alt="Eliminar" />
            Eliminar Juzgado
          </button>
          <button className="close-preview-btn " onClick={onClose}>
            Cerrar 
          </button>
        
      </div>
      <AddJuzgadoDialog
        open={showAddJuzgadoDialog}
        onClose={() => setShowAddJuzgadoDialog(false)}
        onSave={handleSaveNuevoJuzgado}
      />
    </div>
  );
}

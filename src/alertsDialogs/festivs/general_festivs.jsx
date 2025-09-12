import React, { useState } from "react";
import Copy from "../../components/Copy";
import AddJuzgadoDialog from "../juzgados/add_juzgado";
import add from "../../assets/icons/add.png";
import deleteIcon from "../../assets/icons/delete.png";
import edit from "../../assets/icons/edit.png";
import festiv from "../../assets/icons/festive.png";
import AddFestiveDialog from "../../alertsDialogs/festivs/add_festiv"

export default function FestivDialog({ open, onClose }) {
//   const [showAddJuzgadoDialog, setShowAddJuzgadoDialog] = useState(false);
  const [showAddFestiveDialog, setShowAddFestiveDialog] = useState(false);

  const handleSaveNuevoJuzgado = (nuevoJuzgado) => {
    // Aquí puedes agregar el nuevo juzgado a tu lista o hacer lo que necesites
    // Por ejemplo: setJuzgados([...juzgados, nuevoJuzgado]);
    // O mostrar un toast de éxito
  };

  if (!open) return null;

  return (
    <div className="alert-dialog-backdrop">
      <div className="alert_dialog_juzgados">
        <h1> <img src={festiv} alt="" /> Festivos</h1>
        
          <button
            className="add-btn"
            onClick={() => setShowAddFestiveDialog(true)}
          
          >
            <img src={add} alt="Añadir" />
            Agregar Nuevo Día Festivo
          </button>
          <button className="add-btn">
            <img src={edit} alt="Editar" />
            Editar Día Festivo
          </button>
          <button className="delete-btn">
            <img src={deleteIcon} alt="Eliminar" />
            Eliminar Día Festivo
          </button>
          <button className="close-preview-btn " onClick={onClose}>
            Cerrar 
          </button>
        
      </div>
      <AddFestiveDialog
        open={showAddFestiveDialog}
        onClose={() => setShowAddFestiveDialog(false)}
        onSave={handleSaveNuevoJuzgado}
      />
    </div>
  );
}

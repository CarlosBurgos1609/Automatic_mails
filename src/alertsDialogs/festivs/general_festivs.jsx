import React, { useState } from "react";
import add from "../../assets/icons/add.png";
import deleteIcon from "../../assets/icons/delete.png";
import edit from "../../assets/icons/edit.png";
import festiv from "../../assets/icons/festive.png";
import AddFestiveDialog from "./add_festiv";
import EditFestiveDialog from "./edit_festiv";
import DeleteFestiveDialog from "./delete_festiv";

export default function FestivDialog({ 
  open, 
  onClose,
  onAddFestiv,
  onEditFestiv,
  onDeleteFestiv 
}) {
  const [showAddFestiveDialog, setShowAddFestiveDialog] = useState(false);
  const [showEditFestiveDialog, setShowEditFestiveDialog] = useState(false);
  const [showDeleteFestiveDialog, setShowDeleteFestiveDialog] = useState(false);

  const handleSaveNuevoFestivo = (nuevoFestivo) => {
    setShowAddFestiveDialog(false);
    if (onAddFestiv) {
      onAddFestiv(nuevoFestivo);
    }
  };

  const handleSaveEditFestivo = (festivoEditado) => {
    setShowEditFestiveDialog(false);
    if (onEditFestiv) {
      onEditFestiv(festivoEditado);
    }
  };

  const handleDeleteFestivo = (festivoEliminado) => {
    setShowDeleteFestiveDialog(false);
    if (onDeleteFestiv) {
      onDeleteFestiv(festivoEliminado);
    }
  };

  if (!open) return null;

  return (
    <>
      <div className="alert-dialog-backdrop">
        <div className="alert_dialog_juzgados">
          <h1> 
            <img src={festiv} alt="Festivos" /> 
            Gestión de Días Festivos
          </h1>
          
          <button
            className="add-btn"
            onClick={() => setShowAddFestiveDialog(true)}
          >
            <img src={add} alt="Añadir" />
            Agregar Nuevo Día Festivo
          </button>
          
          <button 
            className="add-btn"
            onClick={() => setShowEditFestiveDialog(true)}
          >
            <img src={edit} alt="Editar" />
            Editar Día Festivo
          </button>
          
          <button 
            className="delete-btn"
            onClick={() => setShowDeleteFestiveDialog(true)}
          >
            <img src={deleteIcon} alt="Eliminar" />
            Eliminar Día Festivo
          </button>
          
          <button className="close-preview-btn" onClick={onClose}>
            Cerrar 
          </button>
        </div>
      </div>

      {/* Diálogos de gestión */}
      <AddFestiveDialog
        open={showAddFestiveDialog}
        onClose={() => setShowAddFestiveDialog(false)}
        onSave={handleSaveNuevoFestivo}
      />

      <EditFestiveDialog
        open={showEditFestiveDialog}
        onClose={() => setShowEditFestiveDialog(false)}
        onSave={handleSaveEditFestivo}
      />

      <DeleteFestiveDialog
        open={showDeleteFestiveDialog}
        onClose={() => setShowDeleteFestiveDialog(false)}
        onDelete={handleDeleteFestivo}
      />
    </>
  );
}

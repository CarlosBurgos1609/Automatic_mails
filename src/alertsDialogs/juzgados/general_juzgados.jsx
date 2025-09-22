import React, { useState } from "react";
import Copy from "../../components/Copy";
import AddJuzgadoDialog from "../juzgados/add_juzgado";
import EditJuzgadoDialog from "../juzgados/edit_juzgado";
import SaveJuzgadoDialog from "../../components/save_juzgado_dialog";
import add from "../../assets/icons/add.png";
import deleteIcon from "../../assets/icons/delete.png";
import edit from "../../assets/icons/edit.png";
import juzgado from "../../assets/icons/juzgado.png";

export default function JuzgadoDialog({ open, onClose }) {
  const [showAddJuzgadoDialog, setShowAddJuzgadoDialog] = useState(false);
  const [showEditJuzgadoDialog, setShowEditJuzgadoDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [savedJuzgadoData, setSavedJuzgadoData] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const handleSaveNuevoJuzgado = (juzgadoData) => {
    // Cerrar el diálogo de agregar
    setShowAddJuzgadoDialog(false);
    
    // Guardar los datos para mostrar en el diálogo de éxito
    setSavedJuzgadoData(juzgadoData);
    setIsEditMode(false);
    
    // Mostrar diálogo de éxito
    setShowSuccessDialog(true);
  };

  const handleSaveEditJuzgado = (juzgadoData) => {
    // Cerrar el diálogo de editar
    setShowEditJuzgadoDialog(false);
    
    // Guardar los datos para mostrar en el diálogo de éxito
    setSavedJuzgadoData(juzgadoData);
    setIsEditMode(true);
    
    // Mostrar diálogo de éxito
    setShowSuccessDialog(true);
  };

  const handleSuccessDialogClose = () => {
    setShowSuccessDialog(false);
    setSavedJuzgadoData(null);
    setIsEditMode(false);
    
    // Cerrar el diálogo general
    onClose();
  };

  if (!open) return null;

  return (
    <>
      <div className="alert-dialog-backdrop">
        <div className="alert_dialog_juzgados">
          <h1> <img src={juzgado} alt="" /> JUZGADOS</h1>
          
          <button
            className="add-btn"
            onClick={() => setShowAddJuzgadoDialog(true)}
          >
            <img src={add} alt="Añadir" />
            Agregar Nuevo Juzgado
          </button>
          
          <button 
            className="add-btn"
            onClick={() => setShowEditJuzgadoDialog(true)}
          >
            <img src={edit} alt="Editar" />
            Editar Juzgado
          </button>
          
          <button className="delete-btn">
            <img src={deleteIcon} alt="Eliminar" />
            Eliminar Juzgado
          </button>
          
          <button className="close-preview-btn" onClick={onClose}>
            Cerrar 
          </button>
        </div>
      </div>

      <AddJuzgadoDialog
        open={showAddJuzgadoDialog}
        onClose={() => setShowAddJuzgadoDialog(false)}
        onSave={handleSaveNuevoJuzgado}
      />

      <EditJuzgadoDialog
        open={showEditJuzgadoDialog}
        onClose={() => setShowEditJuzgadoDialog(false)}
        onSave={handleSaveEditJuzgado}
      />

      {/* El diálogo de éxito ahora está en el nivel superior */}
      <SaveJuzgadoDialog
        show={showSuccessDialog}
        onClose={handleSuccessDialogClose}
        juzgadoData={savedJuzgadoData}
        municipioName={savedJuzgadoData?.municipio_name}
        isEdit={isEditMode}
      />
    </>
  );
}

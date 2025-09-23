import React from "react";
import add from "../../assets/icons/add.png";
import deleteIcon from "../../assets/icons/delete.png";
import edit from "../../assets/icons/edit.png";
import juzgado from "../../assets/icons/juzgado.png";

export default function GeneralJuzgadosDialog({ 
  open, 
  onClose, 
  onAddJuzgado, 
  onEditJuzgado, 
  onDeleteJuzgado 
}) {
  if (!open) return null;

  return (
    <div className="alert-dialog-backdrop">
      <div className="alert_dialog_juzgados">
        <h1> <img src={juzgado} alt="" /> JUZGADOS</h1>
        
        <button
          className="add-btn"
          onClick={onAddJuzgado}
        >
          <img src={add} alt="Añadir" />
          Agregar Nuevo Juzgado
        </button>
        
        <button 
          className="add-btn"
          onClick={onEditJuzgado}
        >
          <img src={edit} alt="Editar" />
          Editar Juzgado
        </button>
        
        <button 
          className="delete-btn"
          onClick={onDeleteJuzgado}
        >
          <img src={deleteIcon} alt="Eliminar" />
          Eliminar Juzgado
        </button>
        
        <button className="close-preview-btn" onClick={onClose}>
          Cerrar 
        </button>
      </div>
    </div>
  );
}

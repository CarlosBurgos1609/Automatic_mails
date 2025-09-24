import React from "react";
import loadingImg from "../../assets/animation/loading.webp";

export default function LoadingDialog({ open, message = "Cargando..." }) {
  if (!open) return null;
  return (
    <div className="alert-dialog-backdrop">
      <div className="alert-dialog" style={{ alignItems: "center", justifyContent: "center" }}>
        <img
          src={loadingImg}
          alt="Cargando"
          style={{ width: 120, height: 120, marginBottom: 24 }}
        />
        <h2 style={{ color: "#003f75", textAlign: "center" }}>{message}</h2>
      </div>
    </div>
  );
}
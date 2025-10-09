import React, { useState } from "react";

export default function LoginDialog({ open, onClose, onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Credenciales estáticas
  const STATIC_CREDENTIALS = {
    username: "admin",
    password: "admin123"
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Simular delay de autenticación
    setTimeout(() => {
      if (username === STATIC_CREDENTIALS.username && password === STATIC_CREDENTIALS.password) {
        onLogin();
        handleClose();
      } else {
        setError("Usuario o contraseña incorrectos");
      }
      setIsLoading(false);
    }, 500);
  };

  const handleClose = () => {
    setUsername("");
    setPassword("");
    setError("");
    setIsLoading(false);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="alert-dialog-backdrop">
      <div className="alert-dialog login-dialog">
        <h1>🔐 Iniciar Sesión</h1>
        <p>Ingrese sus credenciales para acceder al sistema</p>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label htmlFor="username">Usuario:</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ingrese su usuario"
              required
              disabled={isLoading}
              autoComplete="username"
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="password">Contraseña:</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingrese su contraseña"
              required
              disabled={isLoading}
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="error-message">
              ❌ {error}
            </div>
          )}

          <div className="dialog-actions flex-column">
            <button
              type="submit"
              className="edit-button-full"
              disabled={isLoading || !username || !password}
            >
              {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </button>
            <button
              type="button"
              className="close-button-full"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancelar
            </button>
          </div>
        </form>

        <div className="login-info">
          <small>
            💡 <strong>Credenciales de demostración:</strong><br />
            Usuario: admin | Contraseña: admin123
          </small>
        </div>
      </div>
    </div>
  );
}

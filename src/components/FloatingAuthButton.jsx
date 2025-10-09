import React, { useState } from "react";

export default function FloatingAuthButton({ isLoggedIn, currentUser, onLogin, onLogout }) {
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);

  const handleButtonClick = () => {
    if (isLoggedIn) {
      setShowLogoutPopup(!showLogoutPopup);
    } else {
      onLogin();
    }
  };

  const handleLogout = () => {
    setShowLogoutPopup(false);
    onLogout();
  };

  // Cerrar popup al hacer click fuera
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setShowLogoutPopup(false);
    }
  };

  return (
    <>
      {/* Backdrop invisible para cerrar popup */}
      {showLogoutPopup && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999
          }}
          onClick={handleBackdropClick}
        />
      )}
      
      <div className="floating-auth-container">
        {/* Popup de logout */}
        {showLogoutPopup && (
          <div className="logout-popup">
            <button className="logout-btn" onClick={handleLogout}>
              <span className="logout-icon">🚪</span>
              Cerrar Sesión
            </button>
          </div>
        )}
        
        {/* Botón principal */}
        <button 
          className={`floating-auth-btn ${isLoggedIn ? 'logged-in' : ''}`}
          onClick={handleButtonClick}
        >
          {isLoggedIn ? (
            <>
              <span>👤</span>
              <span style={{ color: '#4caf50', fontWeight: 'bold' }}>Admin</span>
            </>
          ) : (
            <>
              <span>🔐</span>
              <span>Iniciar Sesión</span>
            </>
          )}
        </button>
      </div>
    </>
  );
}
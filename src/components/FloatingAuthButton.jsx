import React, { useState } from "react";
import { FiUser, FiLock, FiLogOut } from "react-icons/fi"; // Feather Icons
import { HiUser } from "react-icons/hi"; // Heroicons para un user más prominente

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
              <FiLogOut className="logout-icon" />
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
            <div className="auth-content logged-in-content">
              <HiUser className="user-icon" />
              <span className="admin-text">Admin</span>
            </div>
          ) : (
            <div className="auth-content login-content">
              <div className="login-icons">
                <FiUser className="user-icon" />
                <FiLock className="lock-icon" />
              </div>
              <span>Iniciar Sesión</span>
            </div>
          )}
        </button>
      </div>
    </>
  );
}
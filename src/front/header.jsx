// src/components/Header.jsx
import React from 'react';
import logoJudicatura from '../assets/images/ConsejoSuperiorDeLaJudicatura.png';
import '../styles/styles.scss';

const Header = () => {
  return (
    <header className="header">
      <div className="header-top flex-row">
        <div className="logo">
          <img src={logoJudicatura} alt="Rama Judicial de Colombia" />
        </div>
        <div className="search-bar">
          <input type="text" placeholder="Buscar" />
        </div>
        <div className="login-btn">
          <a href="/login">Acceder</a>
        </div>
      </div>
      <nav className="nav-menu">
        <ul className="flex-row">
          <li><a href="/">Inicio</a></li>
          <li><a href="#">Corporación</a></li>
          <li><a href="#">Servicios al ciudadano</a></li>
          <li><a href="#">Participa</a></li>
          <li><a href="#">Transparencia y acceso a la información pública</a></li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
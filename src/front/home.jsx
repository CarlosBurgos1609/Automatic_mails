// src/components/Home.jsx
// src/components/Home.jsx
import React from 'react';
import Header from './header';
import '../styles/styles.scss';

const Home = () => {
  return (
    <div className="home-container">
      <Header />
      <div className="title">
        <h1>Automatización de Correos</h1>
      </div>
    </div>
  );
};

export default Home;
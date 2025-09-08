import React, { useState } from 'react';
import ConsejoSuperiorLogo from './assets/images/ConsejoSuperiorDeLaJudicatura.png';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './front/home';
import Calendary from './front/calendario';
// import Calendary from './front/calendario'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Calendary />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
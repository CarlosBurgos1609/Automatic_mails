import React, { useState } from 'react';
import ConsejoSuperiorLogo from './assets/images/ConsejoSuperiorDeLaJudicatura.png';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './front/home';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
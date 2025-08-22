import React, { useState } from 'react';
import ConsejoSuperiorLogo from './assets/images/ConsejoSuperiorDeLaJudicatura.png';

const Header = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  return (
    <header className="fixed top-0 w-full bg-white shadow-md z-50">
      {/* BARRA TOP GOVCO */}
      <div className="bg-gray-100 py-2">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center">
            {/* Logo */}
            <div className="w-full sm:w-1/3 flex items-center">
              <a href="https://www.ramajudicial.gov.co" title="Rama Judicial">
                <img
                  className="h-12"
                  src={ConsejoSuperiorLogo}
                  alt="Rama Judicial"
                />
              </a>
            </div>
            {/* Toolbar */}
            <div className="w-full sm:w-2/3 flex justify-end">
              <div className="flex items-center space-x-4">
                <ul className="flex space-x-2">
                  <li>
                    <a
                      href="#"
                      onClick={() => doGTranslate('es|en')}
                      className="hidden text-blue-600 hover:underline"
                      title="Sitio en Inglés"
                    >
                      EN
                      <span className="sr-only">English</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      onClick={() => doGTranslate('en|es')}
                      className="text-blue-600 hover:underline"
                      title="Sitio en Español"
                    >
                      ES
                      <span className="sr-only">Spanish</span>
                    </a>
                  </li>
                </ul>
                <div id="google_translate_element2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* HEADER ENTIDAD */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-wrap items-center">
          <div className="sr-only">
            <h1>Rama Judicial</h1>
          </div>
          <div className="w-full lg:w-9/12 flex flex-wrap space-x-4">
            <a
              href="https://www.ramajudicial.gov.co/web/consejo-superior-de-la-judicatura"
              title="Ver Consejo Superior de la Judicatura"
              className="px-2"
            >
              <img
                className="h-10"
                src={ConsejoSuperiorLogo}
                alt="Logo Consejo Superior de la Judicatura"
              />
            </a>
            <a
              href="https://cortesuprema.gov.co/"
              title="Ver Corte Suprema de Justicia"
            >
              <img
                className="h-10"
                src="/documents/10240/151063535/Logo_Logo+Corte+Suprema.png/80172e40-dfb7-81a0-65fb-db8a30b8c680?t=1712608842887"
                alt="Logo Corte Suprema de Justicia"
              />
            </a>
            <a
              href="https://www.corteconstitucional.gov.co/"
              title="Ver Corte Constitucional"
              className="pr-2"
            >
              <img
                className="h-10"
                src="/documents/10240/151063535/Logo_Logo+Cor.+Constitucional.png/21f38567-9fe2-a8d4-3a4d-381b84cb4a69?t=1712608842482"
                alt="Logo Corte Constitucional"
              />
            </a>
            <a
              href="https://www.consejodeestado.gov.co/"
              title="Ver Consejo de Estado"
            >
              <img
                className="h-10"
                src="/documents/10240/10735/Cosejo-Estao11.png/3f557709-27fd-b8a0-f771-4d77010a2495?t=1672159543873"
                alt="Logo Consejo de Estado"
              />
            </a>
            <a
              href="https://cndj.gov.co/"
              title="Ver Comisión Nacional de Disciplina Judicial"
            >
              <img
                className="h-10"
                src="/documents/10240/97184101/LogoComisionNacionaldeDisciplinaJudicial.png/c3f81cf7-c885-2828-e79f-91a946a8e9e6?t=1670863142047"
                alt="Logo Comisión Nacional de Disciplina Judicial"
              />
            </a>
          </div>
          <div className="w-full lg:w-3/12">
            <div className="flex justify-end space-x-4">
              <a
                href="https://www.ramajudicial.gov.co/c/portal/login?p_l_id=151999611"
                className="text-blue-600 hover:underline"
                rel="nofollow"
              >
                Acceder
              </a>
            </div>
            <div className="mt-2">
              <div className="flex items-center">
                <button className="mr-2">
                  <i className="fa fa-search" aria-label="Search"></i>
                </button>
                <input
                  type="text"
                  placeholder="Buscar"
                  className="border rounded px-2 py-1 w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MENU */}
      <div className="bg-gray-800 text-white">
        <div className="container mx-auto px-4">
          <nav className="flex items-center justify-between py-2">
            <button
              className="lg:hidden text-white"
              onClick={toggleNav}
              aria-label="Toggle navigation"
            >
              Menú <i className="fa fa-bars"></i>
            </button>
            <div
              className={`${
                isNavOpen ? 'block' : 'hidden'
              } lg:flex lg:items-center w-full lg:w-auto`}
            >
              <ul className="flex flex-col lg:flex-row lg:space-x-4">
                <li>
                  <a
                    href="https://www.ramajudicial.gov.co/web/guest/portal/inicio"
                    target="_blank"
                    className="block py-2 hover:bg-gray-700"
                  >
                    Inicio
                  </a>
                </li>
                <li className="relative group">
                  <a
                    href="#"
                    className="block py-2 hover:bg-gray-700"
                  >
                    Sobre la Rama <i className="fa fa-chevron-down"></i>
                  </a>
                  <div className="absolute hidden group-hover:block bg-gray-700 text-white rounded shadow-lg">
                    <a
                      href="https://www.ramajudicial.gov.co/web/comision-interinstitucional"
                      target="_blank"
                      className="block px-4 py-2 hover:bg-gray-600"
                    >
                      Comisión Interinstitucional de la Rama Judicial
                    </a>
                    <a
                      href="https://www.ramajudicial.gov.co/web/comision-nacional-de-genero"
                      target="_blank"
                      className="block px-4 py-2 hover:bg-gray-600"
                    >
                      Comisión Nacional de Género
                    </a>
                    <a
                      href="https://www.ramajudicial.gov.co/web/guest/despachos-judiciales"
                      target="_blank"
                      className="block px-4 py-2 hover:bg-gray-600"
                    >
                      Despachos Judiciales
                    </a>
                    <a
                      href="https://www.ramajudicial.gov.co/web/unidad-de-desarrollo-y-analisis-estadistico1/cuantificacion-de-despachos-judiciales"
                      target="_blank"
                      className="block px-4 py-2 hover:bg-gray-600"
                    >
                      Cuantificación de Despachos Judiciales
                    </a>
                    <a
                      href="https://www.ramajudicial.gov.co/web/estadisticas-judiciales"
                      target="_blank"
                      className="block px-4 py-2 hover:bg-gray-600"
                    >
                      Estadísticas Judiciales
                    </a>
                    <a
                      href="https://www.ramajudicial.gov.co/web/estadisticas-judiciales/sinej1"
                      target="_blank"
                      className="block px-4 py-2 hover:bg-gray-600"
                    >
                      Indicadores
                    </a>
                    <a
                      href="https://www.ramajudicial.gov.co/web/guest/portal/sobre-la-rama/informacion-general/directorio-consejo-superior-y-otros"
                      target="_blank"
                      className="block px-4 py-2 hover:bg-gray-600"
                    >
                      Directorio Consejo Superior y Otros
                    </a>
                    <a
                      href="https://www.ramajudicial.gov.co/web/publicaciones/2024-2025"
                      target="_blank"
                      className="block px-4 py-2 hover:bg-gray-600"
                    >
                      Informes al congreso de la República
                    </a>
                    <a
                      href="https://www.ramajudicial.gov.co/portal/sobre-la-rama/informacion-general/organigrama"
                      target="_blank"
                      className="block px-4 py-2 hover:bg-gray-600"
                    >
                      Organigrama
                    </a>
                  </div>
                </li>
                <li className="relative group">
                  <a
                    href="#"
                    className="block py-2 hover:bg-gray-700"
                  >
                    Carrera judicial <i className="fa fa-chevron-down"></i>
                  </a>
                  <div className="absolute hidden group-hover:block bg-gray-700 text-white rounded shadow-lg">
                    <a
                      href="https://publicacionesprocesales.ramajudicial.gov.co/web/publicaciones-procesales/avisos-vacantes-temporales"
                      target="_blank"
                      className="block px-4 py-2 hover:bg-gray-600"
                    >
                      Avisos vacantes temporales
                    </a>
                    <a
                      href="https://www.ramajudicial.gov.co/web/unidad-de-administracion-de-carrera-judicial"
                      target="_blank"
                      className="block px-4 py-2 hover:bg-gray-600"
                    >
                      Concursos a nivel central
                    </a>
                    <a
                      href="https://www.ramajudicial.gov.co/consejos-seccionales"
                      target="_blank"
                      className="block px-4 py-2 hover:bg-gray-600"
                    >
                      Concursos seccionales
                    </a>
                  </div>
                </li>
                <li className="relative group">
                  <a
                    href="#"
                    className="block py-2 hover:bg-gray-700"
                  >
                    Contratación <i className="fa fa-chevron-down"></i>
                  </a>
                  <div className="absolute hidden group-hover:block bg-gray-700 text-white rounded shadow-lg">
                    <a
                      href="https://www.ramajudicial.gov.co/web/unidad-administrativa/contratacion-2024"
                      target="_blank"
                      className="block px-4 py-2 hover:bg-gray-600"
                    >
                      Contratación Central
                    </a>
                    <a
                      href="https://www.ramajudicial.gov.co/web/guest/contratación-seccionales"
                      target="_blank"
                      className="block px-4 py-2 hover:bg-gray-600"
                    >
                      Contratación Seccionales
                    </a>
                    <a
                      href="https://www.ramajudicial.gov.co/web/unidad-ejecutora-del-programa-bid"
                      target="_blank"
                      className="block px-4 py-2 hover:bg-gray-600"
                    >
                      Unidad Ejecutora del Programa BID
                    </a>
                    <a
                      href="https://www.ramajudicial.gov.co/web/unidad-coordinadora-proyecto-banco-mundial/inicio"
                      target="_blank"
                      className="block px-4 py-2 hover:bg-gray-600"
                    >
                      Unidad Coordinadora Proyecto Banco Mundial
                    </a>
                    <a
                      href="https://www.ramajudicial.gov.co/web/unidad-administrativa/portal/inicio/instructivos"
                      target="_blank"
                      className="block px-4 py-2 hover:bg-gray-600"
                    >
                      Instructivos en Materia de Contratación
                    </a>
                  </div>
                </li>
                <li>
                  <a
                    href="https://www.ramajudicial.gov.co/web/guest/portal/atencion-al-usuario"
                    target="_blank"
                    className="block py-2 hover:bg-gray-700"
                  >
                    Atención al usuario
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.ramajudicial.gov.co/web/guest/transparencia-y-acceso-a-la-informacion-publica"
                    target="_blank"
                    className="block py-2 hover:bg-gray-700"
                  >
                    Transparencia y acceso a la información pública
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.ramajudicial.gov.co/web/medidas-covid19/medidas-covid19"
                    target="_blank"
                    className="block py-2 hover:bg-gray-700"
                  >
                    Medidas covid 19
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.ramajudicial.gov.co/web/guest/participa"
                    target="_blank"
                    className="block py-2 hover:bg-gray-700"
                  >
                    Participa
                  </a>
                </li>
                <li>
                  <a
                    href="https://portalhistorico.ramajudicial.gov.co/portal/inicio"
                    target="_blank"
                    className="block py-2 hover:bg-gray-700"
                  >
                    PORTAL HISTÓRICO
                  </a>
                </li>
              </ul>
            </div>
          </nav>
        </div>
      </div>

      {/* BARRA ACCESIBILIDAD */}
      <div className="bg-gray-100 py-2">
        <div className="container mx-auto px-4 flex justify-end space-x-4">
          <a href="#" className="flex flex-col items-center">
            <div className="govco-icon govco-icon-contrast-n w-6 h-6"></div>
            <p>Contraste</p>
          </a>
          <a href="#" className="flex flex-col items-center">
            <div className="govco-icon govco-icon-less-size-n w-6 h-6"></div>
            <p>Reducir letra</p>
          </a>
          <a href="#" className="flex flex-col items-center">
            <div className="govco-icon govco-icon-more-size-n w-6 h-6"></div>
            <p>Aumentar letra</p>
          </a>
          <a
            href="https://centroderelevo.gov.co/632/w3-channel.html"
            className="flex flex-col items-center"
          >
            <div className="govco-icon govco-icon-relief-n w-6 h-6"></div>
            <p>Centro de Relevo</p>
          </a>
        </div>
      </div>
    </header>
  );
};

// Placeholder for Google Translate function
const doGTranslate = (lang_pair) => {
  console.log(`Translating to ${lang_pair}`);
  // Implement Google Translate logic here if needed
};

export default Header;
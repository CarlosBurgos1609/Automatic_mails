import React, { useState } from "react";
import pdfIcon from "../assets/icons/pdf.png";
import downland from "../assets/icons/download.png";
import shareIcon from "../assets/icons/share.png";
import add from "../assets/icons/add.png";
import deleteIcon from "../assets/icons/delete.png";
import festive from "../assets/icons/festive.png";
import juzgado from "../assets/icons/juzgado.png";
import Copy from "./Copy";
import JuzgadosDialog from "../alertsDialogs/juzgados/general_juzgados"
import FestivDialog from "../alertsDialogs/festivs/general_festivs"
import { generateCalendarPDF } from "../utils/pdfGenerator";
import dayjs from "dayjs";
import "dayjs/locale/es";

dayjs.locale("es");

// ✅ AGREGAR onFestivsClick a las props
export default function Buttons({ onJuzgadosClick, onFestivsClick }) {
  const [showPreview, setShowPreview] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showJuzgadosDialog, setShowJuzgadosDialog] = useState(false);
  const [showFestivDialog, setShowFestivDialog] = useState(false);
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  
  // Estados para el diálogo de filtros PDF
  const [showPDFDialog, setShowPDFDialog] = useState(false);
  const [selectedYear, setSelectedYear] = useState(dayjs().year());
  const [selectedType, setSelectedType] = useState("semestre");
  const [selectedPeriod, setSelectedPeriod] = useState(null);

  // Inicializar período por defecto
  React.useEffect(() => {
    const currentMonth = dayjs().month() + 1;
    const currentSemester = currentMonth <= 6 ? 1 : 2;
    setSelectedPeriod(currentSemester);
  }, []);

  // Coloca el URL de la página actual
  const pageUrl = window.location.href;

  // Función para mostrar el diálogo de filtros PDF
  const handleDownload = () => {
    setShowPDFDialog(true);
  };

  // Función para generar y descargar PDF con filtros
  const handleGeneratePDF = async () => {
    if (downloadingPDF) return;
    
    setDownloadingPDF(true);
    
    try {
      const result = await generateCalendarPDF({
        elementId: 'calendar-container',
        tipoFiltro: selectedType,
        año: selectedYear,
        periodo: selectedType === 'año' ? null : selectedPeriod
      });
      
      if (result.success) {
        console.log(result.message);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
        setShowPDFDialog(false);
      } else {
        console.error('Error al generar PDF:', result.error);
        alert('Error al generar el PDF. Por favor, inténtelo de nuevo.');
      }
    } catch (error) {
      console.error('Error inesperado:', error);
      alert('Error inesperado al generar el PDF.');
    } finally {
      setDownloadingPDF(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(pageUrl).then(() => {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    });
  };

  // Generar años disponibles (actual y 2 años hacia adelante)
  const generateYearOptions = () => {
    const currentYear = dayjs().year();
    const years = [];
    for (let year = currentYear; year <= currentYear + 2; year++) {
      years.push(year);
    }
    return years;
  };

  // Generar opciones de período según el tipo seleccionado
  const generatePeriodOptions = () => {
    switch (selectedType) {
      case "año":
        return [{ value: 1, label: `Todo el año ${selectedYear}` }];
      
      case "semestre":
        return [
          { value: 1, label: `Primer Semestre ${selectedYear}` },
          { value: 2, label: `Segundo Semestre ${selectedYear}` }
        ];
      
      case "trimestre":
        return [
          { value: 1, label: `1° Trimestre ${selectedYear} (Ene-Mar)` },
          { value: 2, label: `2° Trimestre ${selectedYear} (Abr-Jun)` },
          { value: 3, label: `3° Trimestre ${selectedYear} (Jul-Sep)` },
          { value: 4, label: `4° Trimestre ${selectedYear} (Oct-Dic)` }
        ];
      
      case "mes":
        const months = [];
        for (let month = 1; month <= 12; month++) {
          const monthDate = dayjs(`${selectedYear}-${month.toString().padStart(2, '0')}-01`);
          months.push({
            value: month,
            label: monthDate.format('MMMM YYYY')
          });
        }
        return months;
      
      default:
        return [];
    }
  };

  const handleTypeChange = (newType) => {
    setSelectedType(newType);
    // Resetear período al cambiar tipo
    if (newType === "año") {
      setSelectedPeriod(1);
    } else if (newType === "semestre") {
      const currentMonth = dayjs().month() + 1;
      setSelectedPeriod(currentMonth <= 6 ? 1 : 2);
    } else if (newType === "trimestre") {
      const currentMonth = dayjs().month() + 1;
      let currentQuarter = 1;
      if (currentMonth <= 3) currentQuarter = 1;
      else if (currentMonth <= 6) currentQuarter = 2;
      else if (currentMonth <= 9) currentQuarter = 3;
      else currentQuarter = 4;
      setSelectedPeriod(currentQuarter);
    } else if (newType === "mes") {
      setSelectedPeriod(dayjs().month() + 1);
    }
  };

  const yearOptions = generateYearOptions();
  const periodOptions = generatePeriodOptions();

  const handleSaveNuevoJuzgado = (nuevoJuzgado) => {
    // Aquí puedes agregar el nuevo juzgado a tu lista o hacer lo que necesites
    // Por ejemplo: setJuzgados([...juzgados, nuevoJuzgado]);
    // O mostrar un toast de éxito
  };
  
  const handleSaveNuevoFestivo = (nuevoJuzgado) => {
    // Aquí puedes agregar el nuevo juzgado a tu lista o hacer lo que necesites
    // Por ejemplo: setJuzgados([...juzgados, nuevoJuzgado]);
    // O mostrar un toast de éxito
  };

  return (
    <div className="download-share-buttons">
      <button 
        className="pdf-download-btn" 
        onClick={handleDownload}
        disabled={downloadingPDF}
      >
        <img src={pdfIcon} alt="PDF" />
        {downloadingPDF ? 'Generando...' : 'Descargar en PDF'}
      </button>

      <button
        className="add-btn"
        onClick={onJuzgadosClick}
        style={{ marginBottom: "16px" }}
      >
        <img src={juzgado} alt="Juzgados" />
        Juzgados
      </button>
      
      {/* ✅ USAR onFestivsClick del componente padre */}
      <button
        className="add-festive-btn"
        onClick={onFestivsClick}
        style={{ marginBottom: "16px" }}
      >
        <img src={festive} alt="Añadir festivo" />
        Festivos
      </button>

      <button className="share-btn" onClick={handleShare}>
        <img src={shareIcon} alt="Compartir" />
        Compartir
      </button>
      
      <Copy show={showToast} message="¡Enlace copiado correctamente!" />
      
      {/* Diálogo de filtros para PDF */}
      {showPDFDialog && (
        <div className="pdf-preview-modal">
          <div className="pdf-preview-content">
            <h2>📄 Descargar Calendario PDF</h2>
            <p>Selecciona el período que deseas descargar:</p>
            
            <div className="pdf-filters">
              {/* Filtro de Año */}
              <div className="filter-group">
                <label className="filter-label">Año:</label>
                <select 
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="filter-select"
                >
                  {yearOptions.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              {/* Filtro de Tipo */}
              <div className="filter-group">
                <label className="filter-label">Tipo de período:</label>
                <select 
                  value={selectedType}
                  onChange={(e) => handleTypeChange(e.target.value)}
                  className="filter-select"
                >
                  <option value="año">🗓️ Año completo</option>
                  <option value="semestre">📊 Por Semestre</option>
                  <option value="trimestre">📈 Por Trimestre</option>
                  <option value="mes">📅 Por Mes</option>
                </select>
              </div>

              {/* Filtro de Período específico */}
              {selectedType !== "año" && (
                <div className="filter-group">
                  <label className="filter-label">Período específico:</label>
                  <select 
                    value={selectedPeriod || ""}
                    onChange={(e) => setSelectedPeriod(parseInt(e.target.value))}
                    className="filter-select"
                  >
                    {periodOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="button-container-download flex-column">
              <button 
                className="download-button-full" 
                onClick={handleGeneratePDF}
                disabled={downloadingPDF}
              >
                <img src={pdfIcon} alt="PDF" />
                {downloadingPDF ? 'Generando PDF...' : 'Generar y Descargar PDF'}
              </button>

              <button
                className="close-preview-btn"
                onClick={() => setShowPDFDialog(false)}
                disabled={downloadingPDF}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
      
      {showPreview && (
        <div className="pdf-preview-modal">
          <div className="pdf-preview-content">
            <h2>Vista previa del PDF</h2>
            <img
              src={require("../assets/plantilla/plantilla.png")}
              alt="Plantilla PDF"
              style={{ width: "100%", maxWidth: 500 }}
            />
            <div className="button-container-download flex-column">
              <button className="download-button-full" onClick={handleDownload}>
                <img src={downland} alt="PDF" />
                Descargar PDF
              </button>

              <button
                className="close-preview-btn"
                onClick={() => setShowPreview(false)}
              >
                Cerrar vista previa
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* ✅ ELIMINAR este diálogo local ya que se maneja en Home */}
      {/* <FestivDialog
        open={showFestivDialog}
        onClose={() => setShowFestivDialog(false)}
        onSave={handleSaveNuevoFestivo}
      /> */}
    </div>
  );
}

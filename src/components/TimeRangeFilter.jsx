import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import { generateCalendarPDF } from "../utils/pdfGenerator";
import pdfIcon from "../assets/icons/pdf.png";

export default function TimeRangeFilter({ 
  selectedRange, 
  onRangeChange, 
  showInDialog = false,
  disabled = false 
}) {
  const [selectedYear, setSelectedYear] = useState(dayjs().year());
  const [selectedType, setSelectedType] = useState("semestre");
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [downloadingPDF, setDownloadingPDF] = useState(false);

  // Calcular período actual al cargar
  useEffect(() => {
    const now = dayjs();
    const currentYear = now.year();
    const currentMonth = now.month() + 1;
    
    // Determinar semestre actual por defecto
    const currentSemester = currentMonth <= 6 ? 1 : 2;
    
    setSelectedYear(currentYear);
    setSelectedType("semestre");
    setSelectedPeriod(currentSemester);
    
    // Si no hay rango seleccionado, usar semestre actual por defecto
    if (!selectedRange) {
      const semestreStart = currentSemester === 1 
        ? dayjs(`${currentYear}-01-01`).startOf('day')
        : dayjs(`${currentYear}-07-01`).startOf('day');
      const semestreEnd = currentSemester === 1 
        ? dayjs(`${currentYear}-06-30`).endOf('day')
        : dayjs(`${currentYear}-12-31`).endOf('day');
      
      onRangeChange({
        type: "semestre",
        label: `${currentSemester === 1 ? 'Primer' : 'Segundo'} Semestre ${currentYear}`,
        startDate: semestreStart,
        endDate: semestreEnd,
        year: currentYear,
        semester: currentSemester
      });
    }
  }, []);

  // Actualizar el rango cuando cambian las selecciones
  useEffect(() => {
    if (selectedYear && selectedType && selectedPeriod !== null) {
      updateTimeRange();
    }
  }, [selectedYear, selectedType, selectedPeriod]);

  // Función para descargar PDF del calendario con nombre específico
  const handleDownloadPDF = async () => {
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
        // Mostrar mensaje de éxito si hay una función para ello
        console.log(result.message);
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

  const updateTimeRange = () => {
    let range = null;

    switch (selectedType) {
      case "año":
        range = {
          type: "año",
          label: `Año ${selectedYear}`,
          startDate: dayjs(`${selectedYear}-01-01`).startOf('day'),
          endDate: dayjs(`${selectedYear}-12-31`).endOf('day'),
          year: selectedYear
        };
        break;

      case "semestre":
        const semestreStart = selectedPeriod === 1 
          ? dayjs(`${selectedYear}-01-01`).startOf('day')
          : dayjs(`${selectedYear}-07-01`).startOf('day');
        const semestreEnd = selectedPeriod === 1 
          ? dayjs(`${selectedYear}-06-30`).endOf('day')
          : dayjs(`${selectedYear}-12-31`).endOf('day');
        range = {
          type: "semestre",
          label: `${selectedPeriod === 1 ? 'Primer' : 'Segundo'} Semestre ${selectedYear}`,
          startDate: semestreStart,
          endDate: semestreEnd,
          year: selectedYear,
          semester: selectedPeriod
        };
        break;

      case "trimestre":
        let trimestreStart, trimestreEnd;
        const trimestreMonths = ["Ene-Mar", "Abr-Jun", "Jul-Sep", "Oct-Dic"];
        
        switch (selectedPeriod) {
          case 1:
            trimestreStart = dayjs(`${selectedYear}-01-01`).startOf('day');
            trimestreEnd = dayjs(`${selectedYear}-03-31`).endOf('day');
            break;
          case 2:
            trimestreStart = dayjs(`${selectedYear}-04-01`).startOf('day');
            trimestreEnd = dayjs(`${selectedYear}-06-30`).endOf('day');
            break;
          case 3:
            trimestreStart = dayjs(`${selectedYear}-07-01`).startOf('day');
            trimestreEnd = dayjs(`${selectedYear}-09-30`).endOf('day');
            break;
          case 4:
            trimestreStart = dayjs(`${selectedYear}-10-01`).startOf('day');
            trimestreEnd = dayjs(`${selectedYear}-12-31`).endOf('day');
            break;
        }
        
        range = {
          type: "trimestre",
          label: `${selectedPeriod}° Trimestre ${selectedYear} (${trimestreMonths[selectedPeriod - 1]})`,
          startDate: trimestreStart,
          endDate: trimestreEnd,
          year: selectedYear,
          quarter: selectedPeriod
        };
        break;

      case "mes":
        const monthDate = dayjs(`${selectedYear}-${selectedPeriod.toString().padStart(2, '0')}-01`);
        range = {
          type: "mes",
          label: monthDate.format('MMMM YYYY'),
          startDate: monthDate.startOf('month'),
          endDate: monthDate.endOf('month'),
          year: selectedYear,
          month: selectedPeriod
        };
        break;
    }

    if (range) {
      onRangeChange(range);
    }
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
      // Por defecto al semestre actual
      const currentMonth = dayjs().month() + 1;
      setSelectedPeriod(currentMonth <= 6 ? 1 : 2);
    } else if (newType === "trimestre") {
      // Por defecto al trimestre actual
      const currentMonth = dayjs().month() + 1;
      let currentQuarter = 1;
      if (currentMonth <= 3) currentQuarter = 1;
      else if (currentMonth <= 6) currentQuarter = 2;
      else if (currentMonth <= 9) currentQuarter = 3;
      else currentQuarter = 4;
      setSelectedPeriod(currentQuarter);
    } else if (newType === "mes") {
      // Por defecto al mes actual
      setSelectedPeriod(dayjs().month() + 1);
    }
  };

  const yearOptions = generateYearOptions();
  const periodOptions = generatePeriodOptions();

  if (showInDialog) {
    return (
      <div className="time-range-filter-dialog">
        <div className="filter-label">📅 Filtrar por período:</div>
        
        <div className="filter-row">
          {/* Filtro de Año */}
          <div className="filter-group">
            <label className="filter-sublabel">Año:</label>
            <select 
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              disabled={disabled}
              className="filter-select"
            >
              {yearOptions.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {/* Filtro de Tipo */}
          <div className="filter-group">
            <label className="filter-sublabel">Tipo:</label>
            <select 
              value={selectedType}
              onChange={(e) => handleTypeChange(e.target.value)}
              disabled={disabled}
              className="filter-select"
            >
              <option value="año">🗓️ Año</option>
              <option value="semestre">📊 Semestre</option>
              <option value="trimestre">📈 Trimestre</option>
              <option value="mes">📅 Mes</option>
            </select>
          </div>

          {/* Filtro de Período específico - Solo se muestra si no es "año" */}
          {selectedType !== "año" && (
            <div className="filter-group full-width">
              <label className="filter-sublabel">Período:</label>
              <select 
                value={selectedPeriod || ""}
                onChange={(e) => setSelectedPeriod(parseInt(e.target.value))}
                disabled={disabled}
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

          {/* Botón de descarga PDF */}
          <div className="filter-group">
            <label className="filter-sublabel">&nbsp;</label>
            <button 
              onClick={handleDownloadPDF}
              disabled={disabled || downloadingPDF}
              className="pdf-download-filter-btn"
              title="Descargar calendario en PDF"
            >
              <img src={pdfIcon} alt="PDF" />
              {downloadingPDF ? 'Generando...' : 'PDF'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="time-range-filter">
      <div className="filter-row">
        <select 
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          disabled={disabled}
        >
          {yearOptions.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
        
        <select 
          value={selectedType}
          onChange={(e) => handleTypeChange(e.target.value)}
          disabled={disabled}
        >
          <option value="año">Año completo</option>
          <option value="semestre">Por Semestre</option>
          <option value="trimestre">Por Trimestre</option>
          <option value="mes">Por Mes</option>
        </select>
        
        {selectedType !== "año" && (
          <select 
            value={selectedPeriod || ""}
            onChange={(e) => setSelectedPeriod(parseInt(e.target.value))}
            disabled={disabled}
          >
            {periodOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}
import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import dayjs from "dayjs";
import "dayjs/locale/es";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { Calendar, dayjsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";

// Components
import Header from "./header";
import Buttons from "../components/buttons";
import Toast from "../components/Copy";
import LoadingDialog from "../components/calendar/LoadingDialog";
import SaveJuzgadoDialog from "../components/juzgados_dialogs/save_juzgado_dialog";
import SaveFestivDialog from "../components/festiv/save_festiv_dialog";

// Error Dialogs
import ErrorJuzgadoDialog from "../components/juzgados_dialogs/error_juzgado_dialog";
import ErrorFestivDialog from "../components/festiv/error_festiv_dialog";

// Graphics
import AreaChartInteractive from "../grafics/area";
import PieChartSimple from "../grafics/pie";
import RadialChartSimple from "../grafics/radial";
import RadarChartComponent from "../grafics/radar1";

// ✅ AGREGAR IMPORT DE ESTADÍSTICAS
import StatsCards from "../components/StatsCards";
import { ChartsProvider } from "../contexts/ChartsContext"; 
import GlobalChartFilters from "../components/grafics/GlobalChartFilters";

// Dialogs
import JuzgadoDialog from "../alertsDialogs/date_section/open_juzgado_dialog";
import ViewJuzgadoDialog from "../alertsDialogs/calendar/view_juzgado";
import AddJuzgadoCalendarDialog from "../alertsDialogs/calendar/add_juzgado_calendar";
import ChangeJuzgadoTurnDialog from "../alertsDialogs/calendar/change_juzgado_turn";
import AddJuzgadoDialog from "../alertsDialogs/juzgados/add_juzgado";
import EditJuzgadoDialog from "../alertsDialogs/juzgados/edit_juzgado";
import DeleteJuzgadoDialog from "../alertsDialogs/juzgados/delete_juzgado";
import GeneralJuzgadosDialog from "../alertsDialogs/juzgados/general_juzgados";
import GeneralFestivsDialog from "../alertsDialogs/festivs/general_festivs";
import LoginDialog from "../alertsDialogs/login/login";
// ❌ REMOVIDO: import FestivDialog from "../alertsDialogs/calendar/festiv_dialog";

// Styles
import "../styles/styles.scss";

// ===== DAYJS CONFIGURATION =====
dayjs.locale("es");
dayjs.extend(utc);
dayjs.extend(timezone);

dayjs.locale("es", {
  ...dayjs.Ls.es,
  weekStart: 0,
});

// ===== CALENDAR CONFIGURATION =====
const localizer = dayjsLocalizer(dayjs);

const Home = () => {
  // ===== TODOS LOS ESTADOS EXISTENTES =====
  
  // General states
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [juzgados, setJuzgados] = useState([]);
  const [turnos, setTurnos] = useState([]);
  const [todayTurnos, setTodayTurnos] = useState([]);
  const [festivs, setFestivs] = useState([]);
  const [loadingTurnos, setLoadingTurnos] = useState(false);
  
  // ✅ ESTADOS DE AUTENTICACIÓN
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Calendar states
  const [view, setView] = useState("month");
  const [date, setDate] = useState(new Date());
  const [range, setRange] = useState({ start: null, end: null });
  
  // Desktop detection state
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  
  // Dialog states
  const [showDialog, setShowDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showChangeDialog, setShowChangeDialog] = useState(false);
  const [showAddJuzgadoDialog, setShowAddJuzgadoDialog] = useState(false);
  
  // ❌ REMOVIDO: Estados del diálogo de festivos
  // const [showFestivDialog, setShowFestivDialog] = useState(false);
  // const [selectedFestivo, setSelectedFestivo] = useState(null);
  // const [festivDialogPosition, setFestivDialogPosition] = useState({ x: 0, y: 0 });
  
  // Juzgado management states
  const [showGeneralJuzgadosDialog, setShowGeneralJuzgadosDialog] = useState(false);
  const [showAddNewJuzgadoDialog, setShowAddNewJuzgadoDialog] = useState(false);
  const [showEditJuzgadoDialog, setShowEditJuzgadoDialog] = useState(false);
  const [showDeleteJuzgadoDialog, setShowDeleteJuzgadoDialog] = useState(false);
  
  // Juzgado success/error states
  const [showJuzgadoSuccessDialog, setShowJuzgadoSuccessDialog] = useState(false);
  const [showJuzgadoErrorDialog, setShowJuzgadoErrorDialog] = useState(false);
  const [juzgadoErrorMessage, setJuzgadoErrorMessage] = useState("");
  const [juzgadoOperationType, setJuzgadoOperationType] = useState("guardar");
  
  // Festivos states
  const [showGeneralFestivsDialog, setShowGeneralFestivsDialog] = useState(false);
  
  // Festivos success/error states
  const [showFestivSuccessDialog, setShowFestivSuccessDialog] = useState(false);
  const [showFestivErrorDialog, setShowFestivErrorDialog] = useState(false);
  const [festivErrorMessage, setFestivErrorMessage] = useState("");
  const [festivOperationType, setFestivOperationType] = useState("guardar");

  // Data states
  const [selectedJuzgado, setSelectedJuzgado] = useState(null);
  const [selectedSlotDate, setSelectedSlotDate] = useState(null);
  const [changeTurnData, setChangeTurnData] = useState(null);
  const [savedJuzgadoData, setSavedJuzgadoData] = useState(null);
  const [savedFestivData, setSavedFestivData] = useState(null);
  
  // Mode states
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  
  // Toast states
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastMsgs, setToastMsgs] = useState([]);

  // ===== COMPUTED VALUES =====
  
  const events = useMemo(() => {
    if (juzgados.length === 0 || turnos.length === 0) return [];
    return turnos.map((turno) => {
      const juzgado = juzgados.find((j) => j.id === turno.juzgado_id) || {};
      const start = dayjs
        .tz(turno.turn_date, "America/Bogota")
        .hour(0)
        .minute(0)
        .second(0)
        .millisecond(0)
        .toDate();
      const end = dayjs
        .tz(turno.turn_date, "America/Bogota")
        .hour(23)
        .minute(59)
        .second(59)
        .millisecond(999)
        .toDate();
      return {
        title: juzgado.name || "Juzgado",
        email: juzgado.email || "",
        start,
        end,
        turno_id: turno.id,
        turn_date: turno.turn_date,
        juzgado_id: juzgado.id,
      };
    });
  }, [juzgados, turnos]);

  // ✅ COMPUTED VALUE PARA FECHAS FESTIVAS
  const festiveDates = useMemo(() => {
    if (!Array.isArray(festivs)) return new Set();
    
    const dates = new Set();
    festivs.forEach(festiv => {
      if (festiv.date) {
        // ✅ No agregar días adicionales, usar fecha exacta
        const dateStr = dayjs(festiv.date).format('YYYY-MM-DD');
        dates.add(dateStr);
      }
    });
    
    return dates;
  }, [festivs]);

  const turnoHoy = useMemo(() => {
    const hoy = dayjs().tz("America/Bogota").format("YYYY-MM-DD");
    return todayTurnos.find(
      (t) =>
        dayjs.tz(t.turn_date, "America/Bogota").format("YYYY-MM-DD") === hoy
    );
  }, [todayTurnos]);

  const juzgadoHoy = useMemo(() => {
    if (!turnoHoy) return null;
    return juzgados.find((j) => j.id === turnoHoy.juzgado_id);
  }, [juzgados, turnoHoy]);

  // ===== DATA LOADING FUNCTIONS =====
  
  const cargarJuzgados = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/juzgados");
      setJuzgados(res.data);
    } catch (error) {
      console.error("Error al cargar juzgados:", error);
      setJuzgados([]);
    }
  };

  const cargarFestivs = async () => {
    try {
      console.log('🔍 Cargando festivos...');
      const res = await axios.get("http://localhost:5000/api/festivs");
      console.log('✅ Festivos cargados:', res.data);
      setFestivs(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("❌ Error al cargar festivos:", error);
      setFestivs([]);
    }
  };

  const cargarTurnos = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/turnos");
      setTurnos(res.data);

      const hoy = dayjs().tz("America/Bogota").format("YYYY-MM-DD");
      const resHoy = await axios.get("http://localhost:5000/api/turnos", {
        params: { start: hoy, end: hoy },
      });
      setTodayTurnos(resHoy.data);
    } catch {
      setTurnos([]);
      setTodayTurnos([]);
    }
  };

  const recargarDatos = async () => {
    await Promise.all([cargarJuzgados(), cargarTurnos(), cargarFestivs()]);
  };

  // ===== UTILITY FUNCTIONS =====
  
  const formatDateTime = (date) => {
    const options = {
      timeZone: "America/Bogota",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    };
    return date.toLocaleString("es-CO", options);
  };

  const showToastMsg = (msg) => {
    setToastMsgs((prev) => [...prev, msg]);
    setTimeout(() => {
      setToastMsgs((prev) => prev.slice(1));
    }, 2000);
  };

  // ✅ FUNCIONES DE AUTENTICACIÓN
  const handleLogin = () => {
    setIsLoggedIn(true);
    setCurrentUser("admin");
    setShowLoginDialog(false);
    showToastMsg("Sesión iniciada correctamente");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    showToastMsg("Sesión cerrada");
  };

  const handleShowLogin = () => {
    setShowLoginDialog(true);
  };

  const requireAuth = (callback) => {
    if (!isLoggedIn) {
      showToastMsg("Debe iniciar sesión para realizar esta acción");
      setShowLoginDialog(true);
      return;
    }
    callback();
  };

  // ✅ FUNCIÓN PARA MANEJAR SELECCIÓN DE EVENTOS (REQUERIDA)
  const handleSelectEvent = (event) => {
    console.log('📅 Evento seleccionado:', event);
    const juzgado = juzgados.find((j) => j.id === event.juzgado_id);
    if (juzgado) {
      setSelectedJuzgado({
        ...juzgado,
        turno_id: event.turno_id,
        turn_date: event.turn_date,
      });
      setShowViewDialog(true);
    }
  };

  // ✅ FUNCIÓN PARA MANEJAR CAMBIO DE RANGO DE FECHAS (REQUERIDA)
  const handleRangeChange = (range) => {
    console.log('📅 Rango de fechas cambiado:', range);
    if (Array.isArray(range)) {
      const start = dayjs(range[0]).format("YYYY-MM-DD");
      const end = dayjs(range[range.length - 1]).format("YYYY-MM-DD");
      setRange({ start, end });
    } else if (range.start && range.end) {
      const start = dayjs(range.start).format("YYYY-MM-DD");
      const end = dayjs(range.end).format("YYYY-MM-DD");
      setRange({ start, end });
    }
  };

  // ✅ FUNCIÓN PARA PROPIEDADES DE EVENTOS (REQUERIDA)
  const eventPropGetter = (event) => {
    return {
      style: {
        backgroundColor: "#bafaba",
        color: "#003f75",
        border: "1px solid #003f75",
        borderRadius: "4px",
        fontSize: "12px",
        fontWeight: "bold",
      },
    };
  };

  // ✅ FUNCIÓN PARA COPIAR EMAIL (REQUERIDA)
  const handleCopyEmail = () => {
    if (juzgadoHoy && juzgadoHoy.email) {
      navigator.clipboard.writeText(juzgadoHoy.email)
        .then(() => showToastMsg("Email copiado al portapapeles"))
        .catch(() => showToastMsg("Error al copiar el email"));
    }
  };

  // ✅ FUNCIÓN PARA AJUSTAR ALTURA AUTOMÁTICA DEL CALENDARIO
  const adjustCalendarRowHeights = useCallback(() => {
    try {
      const calendarContainer = document.querySelector('.calendar-container');
      if (!calendarContainer) return;

      const monthView = calendarContainer.querySelector('.rbc-month-view');
      if (!monthView) return;

      const rows = monthView.querySelectorAll('.rbc-month-row');
      
      rows.forEach((row, rowIndex) => {
        const cells = row.querySelectorAll('.rbc-day-bg');
        let maxContentHeight = 100; // Altura mínima base
        
        // Calcular el contenido más alto en esta fila
        cells.forEach(cell => {
          const events = cell.querySelectorAll('.rbc-event, .rbc-event-content');
          const dateCell = cell.querySelector('.rbc-date-cell');
          
          let cellContentHeight = 30; // Espacio base para el número del día
          
          events.forEach(event => {
            const eventText = event.textContent || '';
            // Calcular altura aproximada basada en la longitud del texto
            const words = eventText.split(' ').length;
            const lines = Math.ceil(words / 4); // Aproximadamente 4 palabras por línea
            cellContentHeight += (lines * 16) + 4; // 16px por línea + 4px de spacing
          });
          
          maxContentHeight = Math.max(maxContentHeight, cellContentHeight);
        });
        
        // Aplicar clase CSS según la altura necesaria
        row.classList.remove('row-height-small', 'row-height-medium', 'row-height-large', 'row-height-xlarge');
        row.classList.add('calendar-dynamic-row');
        
        if (maxContentHeight <= 120) {
          row.classList.add('row-height-small');
        } else if (maxContentHeight <= 160) {
          row.classList.add('row-height-medium');
        } else if (maxContentHeight <= 200) {
          row.classList.add('row-height-large');
        } else {
          row.classList.add('row-height-xlarge');
        }
        
        console.log(`📏 Fila ${rowIndex + 1}: altura ajustada a ${maxContentHeight}px`);
      });
      
    } catch (error) {
      console.error('Error ajustando alturas del calendario:', error);
    }
  }, []);

  // ✅ EFECTO PARA AJUSTAR ALTURAS CUANDO CAMBIAN LOS EVENTOS
  useEffect(() => {
    if (events.length > 0) {
      // Retrasar el ajuste para permitir que el DOM se actualice
      const timeoutId = setTimeout(() => {
        adjustCalendarRowHeights();
      }, 200); // Reducir tiempo de espera
      
      return () => clearTimeout(timeoutId);
    }
  }, [events, adjustCalendarRowHeights]);

  // ✅ EFECTO PARA AJUSTAR ALTURAS CUANDO CAMBIA LA VISTA O FECHA
  useEffect(() => {
    if (view === 'month') {
      const timeoutId = setTimeout(() => {
        adjustCalendarRowHeights();
      }, 100); // Reducir tiempo de espera
      
      return () => clearTimeout(timeoutId);
    }
  }, [view, date, adjustCalendarRowHeights]);

  // ✅ EFECTO PARA REAJUSTAR AL REDIMENSIONAR VENTANA Y DETECTAR DESKTOP
  useEffect(() => {
    const handleResize = () => {
      // Actualizar detección de desktop
      setIsDesktop(window.innerWidth >= 768);
      
      // Solo aplicar ajuste de calendario en desktop (pantallas >= 768px)
      if (window.innerWidth >= 768 && view === 'month') {
        setTimeout(() => {
          adjustCalendarRowHeights();
        }, 50); // Tiempo más rápido
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [adjustCalendarRowHeights, view]);

  // ✅ OBSERVER PARA DETECTAR CAMBIOS EN EL DOM DEL CALENDARIO
  useEffect(() => {
    const calendarContainer = document.querySelector('.calendar-container');
    if (!calendarContainer) return;

    const observer = new MutationObserver((mutations) => {
      let shouldAdjust = false;
      
      mutations.forEach((mutation) => {
        // Si se agregan o quitan nodos de eventos
        if (mutation.type === 'childList' && 
            (mutation.target.classList.contains('rbc-day-bg') ||
             mutation.target.classList.contains('rbc-month-row'))) {
          shouldAdjust = true;
        }
      });
      
      if (shouldAdjust && window.innerWidth >= 768 && view === 'month') {
        setTimeout(() => {
          adjustCalendarRowHeights();
        }, 50); // Tiempo más rápido para mejor UX
      }
    });

    observer.observe(calendarContainer, {
      childList: true,
      subtree: true,
      attributes: false
    });

    return () => observer.disconnect();
  }, [adjustCalendarRowHeights, view]);

  // ✅ FUNCIÓN PARA GUARDAR JUZGADO EN CALENDARIO (REQUERIDA)
  const handleSaveJuzgado = async (juzgadoData) => {
    try {
      await axios.post("http://localhost:5000/api/turnos", {
        juzgado_id: juzgadoData.id,
        turn_date: dayjs(selectedSlotDate).format("YYYY-MM-DD"),
      });
      showToastMsg("Turno agregado correctamente");
      setShowAddDialog(false);
      await recargarDatos();
    } catch (error) {
      showToastMsg("Error al agregar el turno");
      console.error("Error al guardar turno:", error);
    }
  };

  // ✅ FUNCIÓN HELPER PARA OBTENER FESTIVO POR FECHA (SIN MODIFICAR LA FECHA)
  const getFestivoByDate = (dateString) => {
    if (!dateString) return null;
    
    // Usar la fecha original SIN agregar día para buscar el festivo
    const fechaBusqueda = dayjs.utc(dateString).format('YYYY-MM-DD');
    
    return festivs.find(festivo => {
      const fechaFestivo = dayjs.utc(festivo.date).format('YYYY-MM-DD');
      return fechaFestivo === fechaBusqueda;
    });
  };

  // ✅ FUNCIÓN PARA PROPIEDADES DE DÍAS (SIMPLIFICADA - SIN INTERACCIÓN DE FESTIVOS)
  const dayPropGetter = (date) => {
    const isToday = dayjs(date).isSame(dayjs(), "day");
    const dateStr = dayjs(date).format('YYYY-MM-DD');
    
    // ✅ Verificar festivos para mostrar visualmente
    const isFestive = festivs.some(f => {
      const festivoDateStr = dayjs(f.date).format('YYYY-MM-DD');
      return festivoDateStr === dateStr;
    });
    
    let className = "";
    let style = {};
    
    if (isToday) {
      className = "rbc-today";
      style = { 
        backgroundColor: "#bafaba", 
        border: "2px solid #003f75" 
      };
    }
    
    if (isFestive) {
      className += " rbc-festive-day";
      // ✅ Mantener solo el estilo visual, sin datos para interacción
    }
    
    return { 
      className, 
      style
    };
  };

  // ✅ FUNCIÓN PARA MANEJAR CLICKS EN SLOTS (CON AUTENTICACIÓN)
  const handleSelectSlot = ({ start }) => {
    console.log('📅 Slot seleccionado:', start);
    
    const hasEvent = events.some((ev) =>
      dayjs(ev.start).isSame(dayjs(start), "day")
    );
    
    // ✅ REQUERIR AUTENTICACIÓN PARA AGREGAR TURNOS
    if (!hasEvent) {
      requireAuth(() => {
        setSelectedSlotDate(start);
        setShowAddDialog(true);
      });
    }
  };

  // ===== EFFECTS =====
  
  useEffect(() => {
    cargarJuzgados();
    cargarFestivs();
  }, []);

  useEffect(() => {
    const cargarTurnosHoy = async () => {
      try {
        const hoy = dayjs().tz("America/Bogota").format("YYYY-MM-DD");
        const res = await axios.get("http://localhost:5000/api/turnos", {
          params: { start: hoy, end: hoy },
        });
        setTodayTurnos(res.data);
      } catch {
        setTodayTurnos([]);
      }
    };

    cargarTurnosHoy();
  }, []);

  useEffect(() => {
    setLoadingTurnos(true);
    axios
      .get("http://localhost:5000/api/turnos")
      .then((res) => {
        setTurnos(res.data);
        setLoadingTurnos(false);
      })
      .catch(() => {
        setTurnos([]);
        setLoadingTurnos(false);
      });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (range.start && range.end) {
      setLoadingTurnos(true);
      axios
        .get("http://localhost:5000/api/turnos", {
          params: { start: range.start, end: range.end },
        })
        .then((res) => setTurnos(res.data))
        .catch(() => setTurnos([]))
        .finally(() => setLoadingTurnos(false));
    }
  }, [range.start, range.end]);

  useEffect(() => {
    const startOfMonth = dayjs().startOf("month").format("YYYY-MM-DD");
    const endOfMonth = dayjs().endOf("month").format("YYYY-MM-DD");
    setRange({ start: startOfMonth, end: endOfMonth });
  }, []);

  // ❌ REMOVIDO: useEffect para manejar clicks en días festivos

  // ===== JUZGADO MANAGEMENT HANDLERS =====
  
  const handleSaveNuevoJuzgado = async (juzgadoData) => {
    try {
      setShowAddNewJuzgadoDialog(false);
      setShowGeneralJuzgadosDialog(false);
      setSavedJuzgadoData(juzgadoData);
      setIsEditMode(false);
      setIsDeleteMode(false);
      setShowJuzgadoSuccessDialog(true);
      await recargarDatos();
    } catch (error) {
      setJuzgadoErrorMessage(error.message || "Error desconocido al guardar el juzgado");
      setJuzgadoOperationType("guardar");
      setShowJuzgadoErrorDialog(true);
    }
  };

  const handleSaveEditJuzgado = async (juzgadoData) => {
    try {
      setShowEditJuzgadoDialog(false);
      setShowGeneralJuzgadosDialog(false);
      setSavedJuzgadoData(juzgadoData);
      setIsEditMode(true);
      setIsDeleteMode(false);
      setShowJuzgadoSuccessDialog(true);
      await recargarDatos();
    } catch (error) {
      setJuzgadoErrorMessage(error.message || "Error desconocido al actualizar el juzgado");
      setJuzgadoOperationType("editar");
      setShowJuzgadoErrorDialog(true);
    }
  };

  const handleDeleteJuzgado = async (juzgadoData) => {
    try {
      setShowDeleteJuzgadoDialog(false);
      setShowGeneralJuzgadosDialog(false);
      setSavedJuzgadoData(juzgadoData);
      setIsEditMode(false);
      setIsDeleteMode(true);
      setShowJuzgadoSuccessDialog(true);
      await recargarDatos();
    } catch (error) {
      setJuzgadoErrorMessage(error.message || "Error desconocido al eliminar el juzgado");
      setJuzgadoOperationType("eliminar");
      setShowJuzgadoErrorDialog(true);
    }
  };

  const handleJuzgadoSuccessDialogClose = () => {
    setShowJuzgadoSuccessDialog(false);
    setSavedJuzgadoData(null);
    setIsEditMode(false);
    setIsDeleteMode(false);
  };

  const handleJuzgadoErrorDialogClose = () => {
    setShowJuzgadoErrorDialog(false);
    setJuzgadoErrorMessage("");
    setJuzgadoOperationType("guardar");
  };

  // ===== FESTIVOS HANDLERS =====
  
  const handleSaveNuevoFestivo = async (festivoData) => {
    try {
      console.log('✅ Home - Recibido nuevo festivo:', festivoData);
      
      setShowGeneralFestivsDialog(false);
      setSavedFestivData(festivoData);
      setIsEditMode(false);
      setIsDeleteMode(false);
      setShowFestivSuccessDialog(true);
      await cargarFestivs();
      
      console.log('✅ Home - Mostrando diálogo de éxito para nuevo festivo');
    } catch (error) {
      console.error('❌ Home - Error al manejar nuevo festivo:', error);
      setFestivErrorMessage(error.message || "Error desconocido al guardar el día festivo");
      setFestivOperationType("guardar");
      setShowFestivErrorDialog(true);
    }
  };

  const handleSaveEditFestivo = async (festivoData) => {
    try {
      console.log('✅ Home - Recibido festivo editado:', festivoData);
      
      setShowGeneralFestivsDialog(false);
      setSavedFestivData(festivoData);
      setIsEditMode(true);
      setIsDeleteMode(false);
      setShowFestivSuccessDialog(true);
      await cargarFestivs();
      
      console.log('✅ Home - Mostrando diálogo de éxito para festivo editado');
    } catch (error) {
      console.error('❌ Home - Error al manejar festivo editado:', error);
      setFestivErrorMessage(error.message || "Error desconocido al actualizar el día festivo");
      setFestivOperationType("editar");
      setShowFestivErrorDialog(true);
    }  
  };

  const handleDeleteFestivo = async (festivoData) => {
    try {
      console.log('✅ Home - Recibido festivo eliminado:', festivoData);
      
      setShowGeneralFestivsDialog(false);
      setSavedFestivData(festivoData);
      setIsEditMode(false);
      setIsDeleteMode(true);
      setShowFestivSuccessDialog(true);
      await cargarFestivs();
      
      console.log('✅ Home - Mostrando diálogo de éxito para festivo eliminado');
    } catch (error) {
      console.error('❌ Home - Error al manejar festivo eliminado:', error);
      setFestivErrorMessage(error.message || "Error desconocido al eliminar el día festivo");
      setFestivOperationType("eliminar");
      setShowFestivErrorDialog(true);
    }
  };

  const handleFestivError = (errorMessage, operationType) => {
    console.error('❌ Home - Error en festivo:', { errorMessage, operationType });
    
    setShowGeneralFestivsDialog(false);
    setFestivErrorMessage(errorMessage);
    setFestivOperationType(operationType);
    setShowFestivErrorDialog(true);
  };

  const handleFestivSuccessDialogClose = () => {
    setShowFestivSuccessDialog(false);
    setSavedFestivData(null);
    setIsEditMode(false);
    setIsDeleteMode(false);
  };

  const handleFestivErrorDialogClose = () => {
    setShowFestivErrorDialog(false);
    setFestivErrorMessage("");
    setFestivOperationType("guardar");
  };

  // ===== RENDER =====
  
  return (
    <ChartsProvider>
      <div className="home-container">
        <Header 
          isLoggedIn={isLoggedIn}
          currentUser={currentUser}
          onLogin={handleShowLogin}
          onLogout={handleLogout}
        />
        
        <div className="title">
          <h1>Correos Electrónicos Habeas Corpus</h1>
        </div>
        
        <div className="flex-row content-wrapper">
          <div className="flex-row content-003">
            <div className="flex-column date-section">
              <div className="date-time">
                <h1>Fecha y Hora Actual</h1>
              </div>
              <div className="date-time">
                <p>{formatDateTime(currentDateTime)}</p>
              </div>
            </div>
            
            <div className="flex-column juzgado-section">
              <div className="juzgado ">
                <h1>Juzgado Abierto</h1>
              </div>
              <div className="name-juzgado flex-column">
                <h1
                  style={{ cursor: "pointer" }}
                  onClick={() => setShowDialog(true)}
                >
                  {juzgadoHoy ? juzgadoHoy.name : "No hay juzgado de turno hoy"}
                </h1>
                <div className="juzgado-email flex-row">
                  <h2
                    style={{ cursor: "pointer" }}
                    onClick={() => setShowDialog(true)}
                  >
                    {juzgadoHoy ? juzgadoHoy.email : ""}
                  </h2>
                  {juzgadoHoy && (
                    <button className="copy-button" onClick={handleCopyEmail}>
                      Copiar
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="linear-divide flex-column">
          <hr />
        </div>
        
        <div className="calendar-container" id="calendar-container">
          <LoadingDialog
            open={loadingTurnos}
            message="Cargando turnos del mes..."
          />
          
          {/* ✅ CALENDARIO CON TODAS LAS FUNCIONES DEFINIDAS */}
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ 
              height: "auto",
              minHeight: "700px",
              maxHeight: "none"
            }}
            views={["month", "week", "day"]}
            view={view}
            date={date}
            onView={setView}
            onNavigate={setDate}
            selectable={true}
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            onRangeChange={handleRangeChange}
            dayPropGetter={dayPropGetter}
            eventPropGetter={eventPropGetter}
            culture="es"
            messages={{
              month: "Mes",
              week: "Semana",
              day: "Día",
              today: "Hoy",
              previous: "Anterior",
              next: "Siguiente",
              agenda: "Agenda",
            }}
          />
        </div>
        
        <div className="download-container">
          <Buttons 
            onJuzgadosClick={() => requireAuth(() => setShowGeneralJuzgadosDialog(true))}
            onFestivsClick={() => requireAuth(() => setShowGeneralFestivsDialog(true))}
            view={view} // Pasar la vista actual
            isDesktop={isDesktop} // Pasar si es desktop (reactivo)
            isLoggedIn={isLoggedIn} // ✅ PASAR ESTADO DE LOGIN
          />
        </div>
        
        <div className="linear-divide flex-column">
          <hr />
        </div>
        
        <div className="grafic-content flex-column">
          <div className="title">
            <h1>Gráficas</h1>
          </div>
          
          <GlobalChartFilters />
          <StatsCards />
          
          <div className="area-chart-full">
            <AreaChartInteractive />
          </div>
          <div className="other-charts-row flex-row">
            <PieChartSimple />
            <RadialChartSimple />
            <RadarChartComponent />
          </div>
        </div>
        
        <div className="linear-divide flex-column">
          <hr />
        </div>

        {/* Toast notifications */}
        <div className="toast-container">
          {toastMsgs.map((msg, idx) => (
            <Toast key={idx} show={true} message={msg} />
          ))}
        </div>

        {/* Main dialogs */}
        <JuzgadoDialog
          open={showDialog}
          onClose={() => setShowDialog(false)}
          juzgadoHoy={juzgadoHoy}
          showToastMsg={showToastMsg}
        />
        
        <ViewJuzgadoDialog
          open={showViewDialog}
          onClose={() => {
            setShowViewDialog(false);
            setSelectedJuzgado(null);
          }}
          juzgado={selectedJuzgado}
          showToastMsg={showToastMsg}
          onTurnoEliminado={cargarTurnos}
          onChangeTurn={(juzgado) => {
            setChangeTurnData(juzgado);
            setShowViewDialog(false);
            setShowChangeDialog(true);
          }}
          festivo={selectedJuzgado ? getFestivoByDate(selectedJuzgado.turn_date) : null}
          isLoggedIn={isLoggedIn} // ✅ PASAR ESTADO DE LOGIN
        />
        
        <AddJuzgadoCalendarDialog
          open={showAddDialog}
          onClose={() => setShowAddDialog(false)}
          onSave={handleSaveJuzgado}
          slotDate={selectedSlotDate}
          showToastMsg={showToastMsg}
          isLoggedIn={isLoggedIn} // ✅ PASAR ESTADO DE LOGIN
        />
        
        <ChangeJuzgadoTurnDialog
          open={showChangeDialog}
          onClose={() => setShowChangeDialog(false)}
          onChange={async (nuevoJuzgado, slotDate) => {
            try {
              await axios.put(
                `http://localhost:5000/api/turnos/${changeTurnData.turno_id}`,
                {
                  nuevo_juzgado_id: nuevoJuzgado.id,
                  turn_date: changeTurnData.turn_date,
                }
              );
              showToastMsg("Turno cambiado correctamente");
              setShowChangeDialog(false);
              await recargarDatos();
            } catch (err) {
              showToastMsg("Error al cambiar el turno");
            }
          }}
          slotDate={changeTurnData?.turn_date}
          currentJuzgado={
            changeTurnData && {
              name: changeTurnData.nombre,
              email: changeTurnData.email,
              id: changeTurnData.juzgado_id,
            }
          }
          showToastMsg={showToastMsg}
        />

        {/* Juzgado management dialogs */}
        <GeneralJuzgadosDialog
          open={showGeneralJuzgadosDialog}
          onClose={() => setShowGeneralJuzgadosDialog(false)}
          onAddJuzgado={() => {
            setShowGeneralJuzgadosDialog(false);
            setShowAddNewJuzgadoDialog(true);
          }}
          onEditJuzgado={() => {
            setShowGeneralJuzgadosDialog(false);
            setShowEditJuzgadoDialog(true);
          }}
          onDeleteJuzgado={() => {
            setShowGeneralJuzgadosDialog(false);
            setShowDeleteJuzgadoDialog(true);
          }}
        />

        <AddJuzgadoDialog
          open={showAddNewJuzgadoDialog}
          onClose={() => setShowAddNewJuzgadoDialog(false)}
          onSave={handleSaveNuevoJuzgado}
        />

        <EditJuzgadoDialog
          open={showEditJuzgadoDialog}
          onClose={() => setShowEditJuzgadoDialog(false)}
          onSave={handleSaveEditJuzgado}
        />

        <DeleteJuzgadoDialog
          open={showDeleteJuzgadoDialog}
          onClose={() => setShowDeleteJuzgadoDialog(false)}
          onDelete={handleDeleteJuzgado}
        />

        {/* Festivos management dialogs */}
        <GeneralFestivsDialog
          open={showGeneralFestivsDialog}
          onClose={() => setShowGeneralFestivsDialog(false)}
          onAddFestiv={handleSaveNuevoFestivo}
          onEditFestiv={handleSaveEditFestivo}
          onDeleteFestivo={handleDeleteFestivo}
          onError={handleFestivError}
        />

        {/* Success dialogs */}
        <SaveJuzgadoDialog
          show={showJuzgadoSuccessDialog}
          onClose={handleJuzgadoSuccessDialogClose}
          juzgadoData={savedJuzgadoData}
          municipioName={savedJuzgadoData?.municipio_name || ""}
          isEdit={isEditMode}
          isDelete={isDeleteMode}
        />

        <SaveFestivDialog
          show={showFestivSuccessDialog}
          onClose={handleFestivSuccessDialogClose}
          festivData={savedFestivData}
          isEdit={isEditMode}
          isDelete={isDeleteMode}
        />

        {/* Error dialogs */}
        <ErrorJuzgadoDialog
          show={showJuzgadoErrorDialog}
          onClose={handleJuzgadoErrorDialogClose}
          errorMessage={juzgadoErrorMessage}
          operationType={juzgadoOperationType}
        />

        <ErrorFestivDialog
          show={showFestivErrorDialog}
          onClose={handleFestivErrorDialogClose}
          errorMessage={festivErrorMessage}
          operationType={festivOperationType}
        />

        {/* ❌ REMOVIDO: Diálogo de festivo */}

        {/* ✅ DIÁLOGO DE LOGIN */}
        <LoginDialog
          open={showLoginDialog}
          onClose={() => setShowLoginDialog(false)}
          onLogin={handleLogin}
        />

      </div>
    </ChartsProvider>
  );
};

export default Home;
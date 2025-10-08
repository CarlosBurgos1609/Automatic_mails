import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import dayjs from "dayjs";
import "dayjs/locale/es";
import logoConsejo from "../assets/images/ConsejoSuperiorDeLaJudicatura.png";

dayjs.locale("es");

/**
 * Genera y descarga un PDF del calendario con formato oficial del Consejo Superior de la Judicatura
 * @param {Object} options - Opciones para generar el PDF
 * @param {string} options.elementId - ID del elemento HTML a capturar
 * @param {string} options.tipoFiltro - Tipo de filtro: 'año', 'semestre', 'trimestre', 'mes'
 * @param {number} options.año - Año seleccionado
 * @param {number} options.periodo - Período específico (semestre, trimestre, mes)
 */
export const generateCalendarPDF = async (options) => {
  const {
    elementId = "calendar-container",
    tipoFiltro = "año",
    año = new Date().getFullYear(),
    periodo = null,
  } = options;

  try {
    // ✅ VERIFICAR QUE ESTEMOS EN VISTA DE MES ANTES DE GENERAR PDF
    const calendarElement = document.querySelector('.rbc-calendar');
    const isMonthView = calendarElement && calendarElement.querySelector('.rbc-month-view');
    
    if (!isMonthView) {
      console.warn('⚠️ PDF solo puede generarse en vista de mes');
      return {
        success: false,
        error: 'PDF solo disponible en vista de mes',
        message: 'Por favor, cambie a vista de mes para generar el PDF'
      };
    }

    // Logging detallado
    console.log("=== GENERACIÓN DE PDF ===");
    console.log(`Año: ${año}`);
    console.log(`Tipo: ${tipoFiltro}`);
    console.log(`Período: ${periodo}`);
    console.log("========================");

    // Generar nombre del archivo según el período
    const fileName = generateFileName(tipoFiltro, año, periodo);

    // Crear el PDF con formato oficial
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Crear páginas según el período seleccionado
    await generateOfficialPages(
      pdf,
      tipoFiltro,
      año,
      periodo,
      pdfWidth,
      pdfHeight
    );

    // Descargar el PDF
    pdf.save(fileName);

    return {
      success: true,
      fileName: fileName,
      message: `PDF "${fileName}" descargado exitosamente`,
    };
  } catch (error) {
    console.error("Error al generar PDF:", error);
    return {
      success: false,
      error: error.message,
      message: "Error al generar el PDF del calendario",
    };
  }
};

/**
 * Genera las páginas oficiales del PDF según el período
 */
const generateOfficialPages = async (
  pdf,
  tipoFiltro,
  año,
  periodo,
  pdfWidth,
  pdfHeight
) => {
  let mesesAGenerar = [];

  // Determinar qué meses generar según el tipo de filtro
  switch (tipoFiltro) {
    case "año":
      mesesAGenerar = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
      break;
    case "semestre":
      if (periodo === 1) {
        mesesAGenerar = [1, 2, 3, 4, 5, 6]; // Primer semestre
      } else {
        mesesAGenerar = [7, 8, 9, 10, 11, 12]; // Segundo semestre
      }
      break;
    case "trimestre":
      const trimestreMap = {
        1: [1, 2, 3],
        2: [4, 5, 6],
        3: [7, 8, 9],
        4: [10, 11, 12],
      };
      mesesAGenerar = trimestreMap[periodo] || [1, 2, 3];
      break;
    case "mes":
      mesesAGenerar = [periodo];
      break;
    default:
      mesesAGenerar = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  }

  // Logging detallado de los meses
  console.log(
    `Meses a generar:`,
    mesesAGenerar.map((m) =>
      dayjs()
        .year(año)
        .month(m - 1)
        .format("MMMM")
    )
  );
  console.log(`Total de páginas: ${mesesAGenerar.length}`);

  // Generar una página por cada mes
  for (let i = 0; i < mesesAGenerar.length; i++) {
    const mes = mesesAGenerar[i];

    console.log(
      `🔄 Generando página ${i + 1}/${mesesAGenerar.length} - ${dayjs()
        .year(año)
        .month(mes - 1)
        .format("MMMM YYYY")}`
    );

    if (i > 0) {
      pdf.addPage();
      // Pausa adicional entre páginas para asegurar que la navegación se complete
      console.log(`⏳ Pausa entre páginas...`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    await generateOfficialPage(
      pdf,
      año,
      mes,
      tipoFiltro,
      periodo,
      pdfWidth,
      pdfHeight
    );

    console.log(
      `✅ Página completada: ${dayjs()
        .year(año)
        .month(mes - 1)
        .format("MMMM YYYY")}`
    );

    // Pausa breve para permitir que el DOM se estabilice antes del siguiente mes
    if (i < mesesAGenerar.length - 1) {
      console.log(`⏳ Preparando siguiente mes...`);
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }

  console.log(`🎉 PDF completo con ${mesesAGenerar.length} páginas`);
};

/**
 * Genera una página oficial individual del calendario
 */
const generateOfficialPage = async (
  pdf,
  año,
  mes,
  tipoFiltro,
  periodo,
  pdfWidth,
  pdfHeight
) => {
  // Colores oficiales
  const azulOficial = "#003f75";
  const azulClaro = "#4a90e2";
  const blanco = "#ffffff";

  // Encabezado oficial
  drawOfficialHeader(
    pdf,
    año,
    mes,
    tipoFiltro,
    periodo,
    pdfWidth,
    blanco,
    azulOficial
  );

  // Capturar y agregar el calendario del mes específico
  await drawCalendarContent(pdf, año, mes, pdfWidth, pdfHeight);

  // Pie de página oficial
  drawOfficialFooter(pdf, pdfWidth, pdfHeight, azulOficial);
};

/**
 * Dibuja el encabezado oficial del documento
 */
const drawOfficialHeader = (
  pdf,
  año,
  mes,
  tipoFiltro,
  periodo,
  pdfWidth,
  blanco,
  azulOficial
) => {
  // Fondo azul para el encabezado
  pdf.setFillColor(blanco);
  pdf.rect(0, 0, pdfWidth, 35, "F");

  // Agregar logo oficial en el lado izquierdo
  try {
    pdf.addImage(logoConsejo, "PNG", 10, 5, 65, 20);
  } catch (error) {
    console.log("Error cargando logo:", error);
  }

  // Títulos institucionales (lado izquierdo, junto al logo)
  pdf.setTextColor(0, 63, 117);
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "bold");

  // Título principal centrado a la derecha
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "bold");
  const rightSideX = pdfWidth - 140;
  pdf.text("Consejo Superior de la Judicatura", rightSideX, 12, {
    align: "center",
  });
  pdf.text("Consejo Seccional de la Judicatura de Nariño", rightSideX, 20, {
    align: "center",
  });

  // Sección de información del período
  pdf.setFillColor(azulOficial);
  pdf.rect(0, 35, pdfWidth, 20, "F");

  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(18);
  pdf.setFont("helvetica", "bold");
  pdf.text("HABEAS CORPUS", pdfWidth / 2, 47, { align: "center" });

  // Información del período
  const periodoTexto = getPeriodoText(tipoFiltro, periodo);
  const mesNombre = dayjs()
    .year(año)
    .month(mes - 1)
    .format("MMMM YYYY")
    .toUpperCase();

  pdf.setFontSize(11);
  pdf.setTextColor(0, 63, 117);
  pdf.setFillColor(240, 240, 240);
  pdf.rect(0, 55, pdfWidth, 15, "F");

  // Layout de la información del período - centrado
  pdf.text(`Período: ${periodoTexto}`, 20, 62);
  pdf.text(`Circuito: PASTO`, 20, 67);
  pdf.text(`Mes: ${mesNombre}`, pdfWidth - 20, 65, { align: "right" });
};

/**
 * Función de debugging para inspeccionar elementos del calendario
 */
const debugCalendarioElementos = () => {
  console.log("🔧 === DEBUGGING CALENDARIO ===");

  // Buscar TODOS los botones
  const todosLosBotones = document.querySelectorAll("button");
  console.log(`📱 Total de botones encontrados: ${todosLosBotones.length}`);

  todosLosBotones.forEach((btn, index) => {
    const texto = btn.textContent.trim();
    const title = btn.title || btn.getAttribute("aria-label") || "";
    const clases = btn.className;

    console.log(
      `Botón ${index}: "${texto}" | Title: "${title}" | Clases: "${clases}"`
    );

    // Identificar los botones de navegación específicos
    if (texto.toLowerCase().includes("anterior")) {
      console.log(`  ⬅️ *** ESTE ES EL BOTÓN ANTERIOR ***`);
    }
    if (texto.toLowerCase().includes("siguiente")) {
      console.log(`  ➡️ *** ESTE ES EL BOTÓN SIGUIENTE ***`);
    }
    if (texto.toLowerCase().includes("hoy")) {
      console.log(`  📅 *** ESTE ES EL BOTÓN HOY ***`);
    }
  });

  // Probar diferentes selectores para el botón anterior
  console.log("\n🧪 === PROBANDO SELECTORES ANTERIOR ===");

  const selectoresAnterior = [
    'button:contains("Anterior")',
    'button[title*="Anterior"]',
    ".rbc-btn-group button:first-child",
    '[aria-label="previous"]',
  ];

  selectoresAnterior.forEach((selector, index) => {
    try {
      let elemento;
      if (selector.includes("contains")) {
        elemento = Array.from(document.querySelectorAll("button")).find(
          (btn) => btn.textContent.trim().toLowerCase() === "anterior"
        );
      } else {
        elemento = document.querySelector(selector);
      }

      console.log(
        `Selector ${index + 1} "${selector}": ${
          elemento ? "✅ ENCONTRADO" : "❌ NO ENCONTRADO"
        }`
      );
      if (elemento) {
        console.log(
          `  Texto: "${elemento.textContent.trim()}" | Clases: "${
            elemento.className
          }"`
        );
      }
    } catch (error) {
      console.log(
        `Selector ${index + 1} "${selector}": ❌ ERROR - ${error.message}`
      );
    }
  });

  console.log("🔧 === FIN DEBUGGING ===\n");
};

/**
 * Captura y dibuja el contenido del calendario
 */
const drawCalendarContent = async (pdf, año, mes, pdfWidth, pdfHeight) => {
  try {
    console.log(
      `📸 Iniciando captura para ${dayjs()
        .year(año)
        .month(mes - 1)
        .format("MMMM YYYY")}`
    );

    // Ejecutar debugging si es el primer mes
    if (mes === 7) {
      // Solo para julio (primer mes del segundo semestre)
      debugCalendarioElementos();
    }

    // CRÍTICO: Forzar navegación al mes específico
    await navegarAMesEspecifico(año, mes);

    // Esperar extra para asegurar que el calendario se ha actualizado
    console.log(`⏳ Esperando actualización del DOM...`);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Buscar el elemento del calendario con múltiples selectores
    const calendarElement =
      document.querySelector(".rbc-calendar") ||
      document.querySelector(".calendar-container") ||
      document.querySelector("#calendar-container") ||
      document.querySelector('[class*="calendar"]') ||
      document.querySelector(".rbc-month-view");

    if (!calendarElement) {
      console.log(`❌ No se encontró elemento del calendario`);
      drawCalendarPlaceholder(pdf, año, mes, pdfWidth, pdfHeight);
      return;
    }

    console.log(
      `✅ Elemento calendario encontrado: ${calendarElement.className}`
    );

    // Verificar que el calendario muestra el mes correcto
    const mesTexto = dayjs()
      .year(año)
      .month(mes - 1)
      .format("MMMM")
      .toLowerCase();
    const contenidoCalendario = calendarElement.textContent.toLowerCase();

    if (
      contenidoCalendario.includes(mesTexto) ||
      contenidoCalendario.includes(mes.toString())
    ) {
      console.log(`✅ Calendario muestra el mes correcto: ${mesTexto}`);
    } else {
      console.log(
        `⚠️ Posible problema: calendario podría no mostrar ${mesTexto}`
      );
      console.log(
        `Contenido encontrado: ${contenidoCalendario.substring(0, 200)}...`
      );
    }

    // Configurar opciones para captura de alta calidad
    const canvasOptions = {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      width: calendarElement.scrollWidth,
      height: calendarElement.scrollHeight,
      scrollX: 0,
      scrollY: 0,
      logging: false,
    };

    console.log(`📸 Capturando imagen del calendario...`);

    // Capturar la imagen del calendario
    const canvas = await html2canvas(calendarElement, canvasOptions);
    const imgData = canvas.toDataURL("image/png");

    // Calcular dimensiones para el calendario en el PDF
    const calendarY = 70; // Después del encabezado
    const calendarHeight = pdfHeight - 90; // Dejar espacio para pie de página
    const calendarWidth = pdfWidth - 20; // Márgenes laterales

    // Agregar la imagen del calendario
    pdf.addImage(imgData, "PNG", 10, calendarY, calendarWidth, calendarHeight);

    console.log(`✅ Calendario capturado y agregado al PDF`);
  } catch (error) {
    console.error("❌ Error al capturar calendario:", error);
    drawCalendarPlaceholder(pdf, año, mes, pdfWidth, pdfHeight);
  }
};

/**
 * Detecta el mes actual mostrado en el calendario
 */
const detectarMesActualCalendario = () => {
  try {
    console.log(`🔍 Detectando mes actual del calendario...`);

    // Buscar indicadores del mes actual en el DOM con selectores más amplios
    const mesIndicadores = [
      document.querySelector(".rbc-toolbar-label"),
      document.querySelector('[class*="month-label"]'),
      document.querySelector('[class*="current-month"]'),
      document.querySelector(".rbc-header"),
      document.querySelector('[class*="calendar-header"]'),
      document.querySelector(".calendar-title"),
      document.querySelector('[class*="month-title"]'),
      document.querySelector(".rbc-month-header"),
      document.querySelector(".rbc-toolbar .rbc-toolbar-label"),
    ].filter(Boolean);

    console.log(`📋 Encontrados ${mesIndicadores.length} indicadores de mes`);

    for (let i = 0; i < mesIndicadores.length; i++) {
      const indicador = mesIndicadores[i];
      const texto = indicador.textContent.toLowerCase().trim();
      console.log(
        `🔎 Analizando indicador ${i + 1}: "${texto.substring(0, 50)}..."`
      );

      // Buscar nombres de meses en español
      const meses = [
        "enero",
        "febrero",
        "marzo",
        "abril",
        "mayo",
        "junio",
        "julio",
        "agosto",
        "septiembre",
        "octubre",
        "noviembre",
        "diciembre",
      ];

      for (let j = 0; j < meses.length; j++) {
        if (texto.includes(meses[j])) {
          console.log(
            `✅ Mes detectado: ${meses[j]} (${j + 1}) en indicador "${texto}"`
          );
          return j + 1; // Retornar número del mes (1-12)
        }
      }

      // También buscar números de mes (por si aparece como "10/2025" o similar)
      const patronMes = /\b(0?[1-9]|1[0-2])\b/g;
      const coincidenciasMes = texto.match(patronMes);
      if (coincidenciasMes) {
        for (const coincidencia of coincidenciasMes) {
          const numeroMes = parseInt(coincidencia);
          if (numeroMes >= 1 && numeroMes <= 12) {
            console.log(
              `✅ Mes detectado por número: ${numeroMes} en "${texto}"`
            );
            return numeroMes;
          }
        }
      }
    }

    // Si no encuentra nada, buscar en todo el contenido del calendario
    const calendarioElement =
      document.querySelector(".rbc-calendar") ||
      document.querySelector(".calendar-container") ||
      document.querySelector('[class*="calendar"]');

    if (calendarioElement) {
      const contenidoCompleto = calendarioElement.textContent.toLowerCase();
      console.log(`🔎 Buscando en contenido completo del calendario...`);

      const meses = [
        "enero",
        "febrero",
        "marzo",
        "abril",
        "mayo",
        "junio",
        "julio",
        "agosto",
        "septiembre",
        "octubre",
        "noviembre",
        "diciembre",
      ];

      for (let j = 0; j < meses.length; j++) {
        if (contenidoCompleto.includes(meses[j])) {
          console.log(`✅ Mes detectado en contenido: ${meses[j]} (${j + 1})`);
          return j + 1;
        }
      }
    }

    console.log(`❓ No se pudo detectar el mes actual, asumiendo octubre (10)`);
    return 10; // Default a octubre si no se detecta nada
  } catch (error) {
    console.error("❌ Error detectando mes actual:", error);
    return 10; // Default a octubre en caso de error
  }
};

/**
 * Función auxiliar para encontrar botones de navegación por texto exacto
 */
const encontrarBotonPorTexto = (textoBoton) => {
  // Buscar por texto exacto (más confiable)
  const botones = Array.from(document.querySelectorAll("button"));

  // Buscar coincidencia exacta
  let botonEncontrado = botones.find(
    (btn) => btn.textContent.trim().toLowerCase() === textoBoton.toLowerCase()
  );

  if (botonEncontrado) {
    console.log(`✅ Botón "${textoBoton}" encontrado por texto exacto`);
    return botonEncontrado;
  }

  // Buscar coincidencia parcial
  botonEncontrado = botones.find((btn) =>
    btn.textContent.trim().toLowerCase().includes(textoBoton.toLowerCase())
  );

  if (botonEncontrado) {
    console.log(
      `✅ Botón "${textoBoton}" encontrado por texto parcial: "${botonEncontrado.textContent.trim()}"`
    );
    return botonEncontrado;
  }

  console.log(`❌ No se encontró botón con texto "${textoBoton}"`);
  return null;
};

/**
 * Función para navegar el calendario al mes específico
 */
const navegarAMesEspecifico = async (año, mes) => {
  try {
    console.log(
      `🔄 Navegando calendario a: ${dayjs()
        .year(año)
        .month(mes - 1)
        .format("MMMM YYYY")}`
    );

    // Verificar si ya estamos en el mes correcto
    const mesActual = detectarMesActualCalendario();
    if (mesActual === mes) {
      console.log(
        `✅ Ya estamos en ${dayjs()
          .year(año)
          .month(mes - 1)
          .format("MMMM")}, no es necesario navegar`
      );
      return;
    }

    // Método 1: Intentar establecer la fecha directamente si hay un input de fecha
    const dateInput =
      document.querySelector('input[type="date"]') ||
      document.querySelector('input[type="month"]');
    if (dateInput) {
      const fechaTarget = `${año}-${mes.toString().padStart(2, "0")}-01`;
      dateInput.value = fechaTarget;
      dateInput.dispatchEvent(new Event("change", { bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 800));
      console.log(`✅ Fecha establecida via input: ${fechaTarget}`);
      return;
    }

    // Método 2: Navegación manual RELATIVA desde el mes actual detectado
    const mesBaseActual = mesActual || 10; // Octubre como fallback si no se detecta
    let diferenciaMeses = mes - mesBaseActual;

    // Ajustar para años diferentes
    if (año !== 2025) {
      diferenciaMeses += (año - 2025) * 12;
    }

    console.log(
      `📍 Mes actual detectado: ${dayjs()
        .month(mesBaseActual - 1)
        .format("MMMM")} (${mesBaseActual})`
    );
    console.log(
      `🎯 Mes objetivo: ${dayjs()
        .year(año)
        .month(mes - 1)
        .format("MMMM YYYY")} (${mes})`
    );
    console.log(`📊 Diferencia calculada: ${diferenciaMeses} meses`);

    // Buscar botones usando la función auxiliar (más confiable)
    const nextButton =
      encontrarBotonPorTexto("Siguiente") ||
      document.querySelector(".rbc-btn-group button:last-child") ||
      document.querySelector('[aria-label="next"]');

    const prevButton =
      encontrarBotonPorTexto("Anterior") ||
      document.querySelector(".rbc-btn-group button:first-child") ||
      document.querySelector('[aria-label="previous"]');

    console.log(`🔍 Botones encontrados:`);
    console.log(
      `  - Siguiente: ${!!nextButton} ${
        nextButton ? `"${nextButton.textContent.trim()}"` : ""
      }`
    );
    console.log(
      `  - Anterior: ${!!prevButton} ${
        prevButton ? `"${prevButton.textContent.trim()}"` : ""
      }`
    );

    if (diferenciaMeses === 0) {
      console.log(`✅ Ya estamos en el mes correcto según cálculos`);
      return;
    }

    if (diferenciaMeses > 0 && nextButton) {
      // Navegar hacia adelante (meses futuros)
      console.log(`➡️ Navegando ${diferenciaMeses} meses hacia ADELANTE`);
      for (let i = 0; i < diferenciaMeses; i++) {
        console.log(
          `📱 Clic ${
            i + 1
          }/${diferenciaMeses} en botón SIGUIENTE: "${nextButton.textContent.trim()}"`
        );
        nextButton.click();
        await new Promise((resolve) => setTimeout(resolve, 700));

        // Verificar progreso cada 2 navegaciones
        if ((i + 1) % 2 === 0) {
          const mesIntermedio = detectarMesActualCalendario();
          console.log(
            `📈 Progreso: ahora en ${dayjs()
              .month((mesIntermedio || 1) - 1)
              .format("MMMM")} (${mesIntermedio})`
          );
        }
      }
    } else if (diferenciaMeses < 0 && prevButton) {
      // Navegar hacia atrás (meses pasados)
      const clicsNecesarios = Math.abs(diferenciaMeses);
      console.log(`⬅️ Navegando ${clicsNecesarios} meses hacia ATRÁS`);
      console.log(
        `🎯 Vamos a hacer ${clicsNecesarios} clics en el botón: "${prevButton.textContent.trim()}"`
      );

      for (let i = 0; i < clicsNecesarios; i++) {
        console.log(
          `📱 Clic ${
            i + 1
          }/${clicsNecesarios} en botón ANTERIOR: "${prevButton.textContent.trim()}"`
        );

        // Verificar que el botón está visible y habilitado
        if (prevButton.offsetParent === null) {
          console.log(`⚠️ Botón anterior no está visible`);
          break;
        }

        if (prevButton.disabled) {
          console.log(`⚠️ Botón anterior está deshabilitado`);
          break;
        }

        // Hacer scroll al botón si es necesario
        prevButton.scrollIntoView({ behavior: "smooth", block: "center" });
        await new Promise((resolve) => setTimeout(resolve, 200));

        // Múltiples métodos de clic para asegurar que funcione
        prevButton.focus();
        prevButton.click();

        // También intentar con evento de mouse
        const clickEvent = new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          view: window,
        });
        prevButton.dispatchEvent(clickEvent);

        console.log(
          `⏳ Esperando ${700}ms para que el calendario se actualice...`
        );
        await new Promise((resolve) => setTimeout(resolve, 700));

        // Verificar progreso después de cada navegación
        const mesIntermedio = detectarMesActualCalendario();
        const nombreMesIntermedio = dayjs()
          .month((mesIntermedio || 1) - 1)
          .format("MMMM");
        console.log(
          `📉 Progreso clic ${
            i + 1
          }: ahora en ${nombreMesIntermedio} (${mesIntermedio})`
        );

        // Si el mes no cambió, intentar nuevamente
        if (i > 0 && mesIntermedio === mesBaseActual) {
          console.log(
            `⚠️ El mes no cambió desde el inicio, intentando clic adicional...`
          );
          await new Promise((resolve) => setTimeout(resolve, 300));
          prevButton.click();
          await new Promise((resolve) => setTimeout(resolve, 400));
        }
      }
    } else {
      console.log(`❌ No se encontraron botones de navegación adecuados`);
      console.log(`Botón siguiente disponible: ${!!nextButton}`);
      console.log(`Botón anterior disponible: ${!!prevButton}`);

      if (!prevButton && diferenciaMeses < 0) {
        console.log(`🔧 Intentando encontrar botón anterior con debugging...`);
        debugCalendarioElementos();
      }
      return;
    }

    // Esperar a que el calendario se actualice completamente
    console.log(`⏳ Esperando actualización final del calendario...`);
    await new Promise((resolve) => setTimeout(resolve, 1200));

    // Verificar que llegamos al mes correcto
    const mesFinal = detectarMesActualCalendario();
    if (mesFinal === mes) {
      console.log(
        `✅ 🎉 NAVEGACIÓN EXITOSA a ${dayjs()
          .year(año)
          .month(mes - 1)
          .format("MMMM YYYY")}`
      );
    } else {
      console.log(
        `⚠️ POSIBLE PROBLEMA: esperaba mes ${mes} (${dayjs()
          .month(mes - 1)
          .format("MMMM")}), pero detecté mes ${mesFinal} (${dayjs()
          .month((mesFinal || 1) - 1)
          .format("MMMM")})`
      );
    }
  } catch (error) {
    console.error("❌ Error navegando calendario:", error);
  }
};

/**
 * Dibuja un placeholder del calendario si no se puede capturar
 */
const drawCalendarPlaceholder = (pdf, año, mes, pdfWidth, pdfHeight) => {
  const calendarY = 70; // Ajustado para nuevo encabezado
  const calendarHeight = pdfHeight - 90;

  // Fondo del calendario
  pdf.setFillColor(250, 250, 250);
  pdf.rect(10, calendarY, pdfWidth - 20, calendarHeight, "F");

  // Título del mes
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(18);
  pdf.setFont("helvetica", "bold");
  const mesNombre = dayjs()
    .year(año)
    .month(mes - 1)
    .format("MMMM YYYY");
  pdf.text(mesNombre, pdfWidth / 2, calendarY + 30, { align: "center" });

  // Mensaje
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "normal");
  pdf.text(
    "Calendario generado automáticamente",
    pdfWidth / 2,
    calendarY + 50,
    { align: "center" }
  );
  pdf.text(
    "Ver aplicación web para contenido detallado",
    pdfWidth / 2,
    calendarY + 65,
    { align: "center" }
  );
};

/**
 * Dibuja el pie de página oficial
 */
const drawOfficialFooter = (pdf, pdfWidth, pdfHeight, azulOficial) => {
  const footerY = pdfHeight - 15;

  pdf.setFillColor(azulOficial);
  pdf.rect(0, footerY, pdfWidth, 15, "F");

  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");

  const fechaGeneracion = dayjs().format("DD/MM/YYYY [a las] HH:mm");
  pdf.text(
    `Generado el ${fechaGeneracion} - Habeas Corpus`,
    pdfWidth / 2,
    footerY + 8,
    { align: "center" }
  );
};

/**
 * Obtiene el texto del período según el tipo de filtro
 */
const getPeriodoText = (tipoFiltro, periodo) => {
  switch (tipoFiltro) {
    case "año":
      return "AÑO COMPLETO";
    case "semestre":
      return periodo === 1 ? "PRIMER SEMESTRE" : "SEGUNDO SEMESTRE";
    case "trimestre":
      const trimestres = [
        "PRIMER TRIMESTRE",
        "SEGUNDO TRIMESTRE",
        "TERCER TRIMESTRE",
        "CUARTO TRIMESTRE",
      ];
      return trimestres[periodo - 1] || "PRIMER TRIMESTRE";
    case "mes":
      return "MES ESPECÍFICO";
    default:
      return "PERÍODO COMPLETO";
  }
};

/**
 * Genera el nombre del archivo según el tipo de filtro y período
 */
const generateFileName = (tipoFiltro, año, periodo) => {
  const baseFileName = "HabeasCorpus";

  switch (tipoFiltro) {
    case "año":
      return `${baseFileName}_${año}.pdf`;

    case "semestre":
      const semestreTexto =
        periodo === 1 ? "PrimerSemestre" : "SegundoSemestre";
      return `${baseFileName}_${semestreTexto}${año}.pdf`;

    case "trimestre":
      const trimestreTexto = [
        "PrimerTrimestre",
        "SegundoTrimestre",
        "TercerTrimestre",
        "CuartoTrimestre",
      ][periodo - 1];
      return `${baseFileName}_${trimestreTexto}${año}.pdf`;

    case "mes":
      const meses = [
        "Enero",
        "Febrero",
        "Marzo",
        "Abril",
        "Mayo",
        "Junio",
        "Julio",
        "Agosto",
        "Septiembre",
        "Octubre",
        "Noviembre",
        "Diciembre",
      ];
      const mesTexto = meses[periodo - 1];
      return `${baseFileName}_${mesTexto}${año}.pdf`;

    default:
      return `${baseFileName}_${año}.pdf`;
  }
};

/**
 * Genera el título para el PDF
 */
const generateTitle = (tipoFiltro, año, periodo) => {
  const baseTitle = "Calendario Habeas Corpus";

  switch (tipoFiltro) {
    case "año":
      return `${baseTitle} - ${año}`;

    case "semestre":
      const semestreTexto =
        periodo === 1 ? "Primer Semestre" : "Segundo Semestre";
      return `${baseTitle} - ${semestreTexto} ${año}`;

    case "trimestre":
      const trimestreTexto = [
        "Primer Trimestre",
        "Segundo Trimestre",
        "Tercer Trimestre",
        "Cuarto Trimestre",
      ][periodo - 1];
      return `${baseTitle} - ${trimestreTexto} ${año}`;

    case "mes":
      const meses = [
        "Enero",
        "Febrero",
        "Marzo",
        "Abril",
        "Mayo",
        "Junio",
        "Julio",
        "Agosto",
        "Septiembre",
        "Octubre",
        "Noviembre",
        "Diciembre",
      ];
      const mesTexto = meses[periodo - 1];
      return `${baseTitle} - ${mesTexto} ${año}`;

    default:
      return `${baseTitle} - ${año}`;
  }
};

/**
 * Función simplificada para descargar PDF del calendario completo del año
 */
export const downloadCalendarPDF = async (elementId = "calendar-container") => {
  const currentYear = new Date().getFullYear();

  return await generateCalendarPDF({
    elementId,
    tipoFiltro: "año",
    año: currentYear,
    periodo: null,
  });
};

export default {
  generateCalendarPDF,
  downloadCalendarPDF,
};

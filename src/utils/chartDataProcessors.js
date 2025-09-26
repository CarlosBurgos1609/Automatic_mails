// Procesar datos para gráfica de área (correos generales vs habeas corpus por fecha)
export const processAreaChartData = (correos = [], habeasCorpus = []) => {
  const dataMap = new Map();

  // ✅ VERIFICAR QUE SEAN ARRAYS
  const safeCorreos = Array.isArray(correos) ? correos : [];
  const safeHabeasCorpus = Array.isArray(habeasCorpus) ? habeasCorpus : [];

  // Procesar correos generales
  safeCorreos.forEach(correo => {
    if (correo.received_date) {
      const fecha = new Date(correo.received_date).toISOString().split('T')[0];
      if (!dataMap.has(fecha)) {
        dataMap.set(fecha, { date: fecha, correosgenerales: 0, habeasCorpus: 0 });
      }
      dataMap.get(fecha).correosgenerales += 1;
    }
  });

  // Procesar habeas corpus
  safeHabeasCorpus.forEach(hc => {
    if (hc.created_at) {
      const fecha = new Date(hc.created_at).toISOString().split('T')[0];
      if (!dataMap.has(fecha)) {
        dataMap.set(fecha, { date: fecha, correosgenerales: 0, habeasCorpus: 0 });
      }
      dataMap.get(fecha).habeasCorpus += 1;
    }
  });

  // Si no hay datos, crear datos de ejemplo para los últimos 7 días
  if (dataMap.size === 0) {
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dataMap.set(dateStr, { date: dateStr, correosgenerales: 0, habeasCorpus: 0 });
    }
  }

  // Convertir Map a array y ordenar por fecha
  return Array.from(dataMap.values())
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(-90); // Últimos 90 días
};

// ✅ VERSIÓN MEJORADA PARA PROCESAR DATOS RADAR
export const processRadarChartData = (habeasCorpus = [], juzgados = []) => {
  const safeHabeasCorpus = Array.isArray(habeasCorpus) ? habeasCorpus : [];
  const juzgadoMap = new Map();
  
  // Contar habeas corpus por juzgado
  safeHabeasCorpus.forEach(hc => {
    const juzgadoId = hc.juzgado_id;
    let juzgadoName = hc.juzgado_name;
    
    // Si no tiene nombre, usar el código o crear uno genérico
    if (!juzgadoName) {
      juzgadoName = hc.juzgado_code 
        ? `Juzgado ${hc.juzgado_code}` 
        : `Juzgado ${juzgadoId}`;
    }
    
    // Acortar nombres muy largos para mejor visualización
    if (juzgadoName.length > 25) {
      juzgadoName = juzgadoName.substring(0, 22) + '...';
    }
    
    if (!juzgadoMap.has(juzgadoId)) {
      juzgadoMap.set(juzgadoId, {
        subject: juzgadoName,
        A: 0,
        fullMark: 0
      });
    }
    juzgadoMap.get(juzgadoId).A += 1;
  });

  const data = Array.from(juzgadoMap.values());
  
  // Si no hay datos, crear datos de ejemplo
  if (data.length === 0) {
    return [
      { subject: "Sin datos", A: 0, fullMark: 10 }
    ];
  }
  
  // Calcular fullMark como el máximo valor + 20%
  const maxValue = Math.max(...data.map(d => d.A), 0);
  const fullMark = Math.ceil(maxValue * 1.2) || 10;
  
  // Ordenar por cantidad de casos (descendente) y tomar top 6
  return data
    .map(item => ({ ...item, fullMark }))
    .sort((a, b) => b.A - a.A)
    .slice(0, 6);
};

// Procesar datos para gráfica radial (correos procesados vs no procesados)
export const processRadialChartData = (correos = []) => {
  const safeCorreos = Array.isArray(correos) ? correos : [];
  const procesados = safeCorreos.filter(c => c.processed).length;
  const noProcesados = safeCorreos.filter(c => !c.processed).length;
  const total = safeCorreos.length;

  return [
    { 
      name: "Procesados", 
      value: procesados, 
      percentage: total > 0 ? Math.round((procesados / total) * 100) : 0,
      fill: "#28a745" 
    },
    { 
      name: "Pendientes", 
      value: noProcesados, 
      percentage: total > 0 ? Math.round((noProcesados / total) * 100) : 0,
      fill: "#ffc107" 
    }
  ];
};

// Procesar datos para gráfica de pie (distribución de correos, reenvíos y habeas corpus)
export const processPieChartData = (correos = [], reenvios = [], habeasCorpus = []) => {
  const safeCorreos = Array.isArray(correos) ? correos : [];
  const safeReenvios = Array.isArray(reenvios) ? reenvios : [];
  const safeHabeasCorpus = Array.isArray(habeasCorpus) ? habeasCorpus : [];

  const totalCorreos = safeCorreos.length;
  const totalReenvios = safeReenvios.length;
  const totalHabeasCorpus = safeHabeasCorpus.length;

  return [
    { name: "Correos Totales", value: totalCorreos, fill: "#8884d8" },
    { name: "Reenvíos", value: totalReenvios, fill: "#82ca9d" },
    { name: "Habeas Corpus", value: totalHabeasCorpus, fill: "#ffc658" }
  ];
};

// Obtener estadísticas de resumen
export const getStatsData = (correos = [], reenvios = [], habeasCorpus = []) => {
  const safeCorreos = Array.isArray(correos) ? correos : [];
  const safeReenvios = Array.isArray(reenvios) ? reenvios : [];
  const safeHabeasCorpus = Array.isArray(habeasCorpus) ? habeasCorpus : [];

  const today = new Date();
  const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  
  // Correos de este mes
  const correosThisMonth = safeCorreos.filter(c => 
    c.received_date && new Date(c.received_date) >= thisMonth
  ).length;
  
  // Habeas corpus activos
  const habeasCorpusActivos = safeHabeasCorpus.filter(hc => 
    hc.status === 'activo' || hc.status === 'pendiente'
  ).length;
  
  // Reenvíos de este mes
  const reenviosThisMonth = safeReenvios.filter(r => 
    r.forward_date && new Date(r.forward_date) >= thisMonth
  ).length;

  return {
    totalCorreos: safeCorreos.length,
    correosThisMonth,
    totalReenvios: safeReenvios.length,
    reenviosThisMonth,
    totalHabeasCorpus: safeHabeasCorpus.length,
    habeasCorpusActivos,
    correosProcessed: safeCorreos.filter(c => c.processed).length,
    correosPending: safeCorreos.filter(c => !c.processed).length
  };
};
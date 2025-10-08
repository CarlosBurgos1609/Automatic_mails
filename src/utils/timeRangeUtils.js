import dayjs from "dayjs";

// Función para verificar si un turno está dentro del rango temporal
export const isTurnoInTimeRange = (turnoDate, timeRange) => {
  if (!timeRange || !turnoDate) return true;

  // Agregar un día para compensar el desfase de zona horaria de la base de datos
  const turno = dayjs(turnoDate).add(1, "day").startOf("day");
  const start = dayjs(timeRange.startDate).startOf("day");
  const end = dayjs(timeRange.endDate).endOf("day");

  return turno.isSameOrAfter(start) && turno.isSameOrBefore(end);
};

// Función para filtrar turnos por rango temporal
export const filterTurnosByTimeRange = (turnos, timeRange) => {
  if (!timeRange) return turnos;

  return turnos.filter((turno) =>
    isTurnoInTimeRange(turno.turn_date, timeRange)
  );
};

// Función para obtener estadísticas de juzgado en un rango temporal específico
export const getJuzgadoStatsInTimeRange = (juzgadoId, turnos, timeRange) => {
  const turnosJuzgado = turnos.filter(
    (turno) => turno.juzgado_id === juzgadoId
  );
  const turnosEnRango = filterTurnosByTimeRange(turnosJuzgado, timeRange);

  return {
    totalTurnos: turnosEnRango.length,
    tieneActivo: turnosEnRango.length > 0,
    turnos: turnosEnRango,
  };
};

// Función para determinar el estado temporal de un juzgado en un rango específico
export const getJuzgadoTemporalStatusInRange = (
  juzgado,
  turnos,
  timeRange,
  referenceDate = null
) => {
  const hoy = referenceDate ? dayjs(referenceDate) : dayjs();
  const turnosJuzgado = turnos.filter(
    (turno) => turno.juzgado_id === juzgado.id
  );
  let turnosEnRango = filterTurnosByTimeRange(turnosJuzgado, timeRange);

  if (turnosEnRango.length === 0) {
    return {
      ...juzgado,
      status: "sin-turnos",
      ultimoTurno: null,
      proximoTurno: null,
      totalTurnos: 0,
      turnosEnRango: [],
    };
  }

  // Ordenar turnos por fecha (agregar un día para compensar desfase)
  const turnosOrdenados = turnosEnRango
    .map((turno) => ({
      ...turno,
      fecha: dayjs(turno.turn_date).add(1, "day").startOf("day"),
    }))
    .sort((a, b) => b.fecha.valueOf() - a.fecha.valueOf());

  const ultimoTurno = turnosOrdenados[0];
  const proximoTurno = turnosOrdenados.find(
    (turno) => turno.fecha.isAfter(hoy) || turno.fecha.isSame(hoy, "day")
  );

  // Determinar estado temporal basado en el rango
  let status = "sin-turnos";
  const turnosFuturos = turnosOrdenados.filter(
    (turno) => turno.fecha.isAfter(hoy) || turno.fecha.isSame(hoy, "day")
  );
  const turnosPasados = turnosOrdenados.filter((turno) =>
    turno.fecha.isBefore(hoy)
  );

  if (turnosFuturos.length > 0) {
    status = "por-venir";
  } else if (turnosPasados.length > 0) {
    status = "ya-paso";
  }

  return {
    ...juzgado,
    status,
    ultimoTurno,
    proximoTurno,
    totalTurnos: turnosEnRango.length,
    turnosEnRango: turnosOrdenados,
    ultimaFecha: ultimoTurno ? ultimoTurno.fecha.format("DD/MM/YYYY") : null,
  };
};

// Función para calcular estadísticas temporales generales
export const calculateTemporalStats = (
  juzgados,
  turnos,
  timeRange,
  referenceDate = null
) => {
  const hoy = referenceDate ? dayjs(referenceDate) : dayjs();

  const juzgadosConEstado = juzgados.map((juzgado) =>
    getJuzgadoTemporalStatusInRange(juzgado, turnos, timeRange, referenceDate)
  );

  return {
    total: juzgadosConEstado.length,
    disponibles: juzgadosConEstado.filter((j) => j.status === "sin-turnos")
      .length,
    ocupados: juzgadosConEstado.filter((j) => j.status !== "sin-turnos").length,
    yaPasaron: juzgadosConEstado.filter((j) => j.status === "ya-paso").length,
    porVenir: juzgadosConEstado.filter(
      (j) => j.status === "por-venir" || j.status === "sin-turnos"
    ).length,
    juzgadosConEstado,
  };
};

// Función para verificar si una fecha está en el futuro dentro del rango
export const isFutureInRange = (date, timeRange, referenceDate = null) => {
  const reference = referenceDate ? dayjs(referenceDate) : dayjs();
  // Agregar un día para compensar el desfase de zona horaria de la base de datos
  const checkDate = dayjs(date).add(1, "day");

  if (!timeRange) return checkDate.isAfter(reference);

  const start = dayjs(timeRange.startDate);
  const end = dayjs(timeRange.endDate);

  return (
    checkDate.isAfter(reference) &&
    checkDate.isAfter(start.subtract(1, "day")) &&
    checkDate.isBefore(end.add(1, "day"))
  );
};

// Función para obtener el período actual por defecto
export const getDefaultPeriod = () => {
  const now = dayjs();
  const month = now.month() + 1; // dayjs months are 0-indexed
  const year = now.year();

  // Determinar semestre actual
  const semestre = month <= 6 ? 1 : 2;
  const semestreStart =
    semestre === 1 ? dayjs(`${year}-01-01`) : dayjs(`${year}-07-01`);
  const semestreEnd =
    semestre === 1 ? dayjs(`${year}-06-30`) : dayjs(`${year}-12-31`);

  return {
    type: "semestre",
    label: `${semestre === 1 ? "Primer" : "Segundo"} Semestre ${year}`,
    startDate: semestreStart,
    endDate: semestreEnd,
    year: year,
    semester: semestre,
  };
};

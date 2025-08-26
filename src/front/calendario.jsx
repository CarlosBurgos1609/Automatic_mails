// src/components/Home.jsx
import React, { useState, useEffect } from "react";
import { Calendar, dayjsLocalizer } from 'react-big-calendar';
import dayjs from 'dayjs';
import "dayjs/locale/es";
dayjs.locale("es");

const Calendary = () => {
  const localizer = dayjsLocalizer(dayjs);

  return (
    <div className="calendar-container">
  <Calendar
    localizer={localizer}
    view="week"
    style={{ height: "100%", width: "100%" }}
  />
</div>
  );
};

export default Calendary;

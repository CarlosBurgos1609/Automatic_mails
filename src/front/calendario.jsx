// src/components/Home.jsx
import React, { useState, useEffect } from "react";

// import "../styles/styles.scss";

import { Calendar, dayjsLocalizer } from 'react-big-calendar';
import dayjs from 'dayjs';
import "dayjs/locale/es";
dayjs.locale("es");

const Calendary = () => {
  const localizer = dayjsLocalizer(dayjs);

  return (
    
      <div style={
        {height: "95vh",
            width: "95vh",
        }
      }>
        <Calendar
          localizer={localizer}
          style={{ height: 500,
            width: 500,
           }}
        />
      </div>
  );
};

export default Calendary;
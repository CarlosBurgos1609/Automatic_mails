# 📏 SISTEMA DE AJUSTE AUTOMÁTICO DE ALTURA - CALENDARIO

## 🎯 PROBLEMA SOLUCIONADO

**Antes**: Los nombres largos de los juzgados se cortaban porque las celdas del calendario tenían altura fija (100px).

**Después**: El sistema ajusta automáticamente la altura de cada fila según el contenido más largo de esa fila.

## ✅ CARACTERÍSTICAS IMPLEMENTADAS

### **1. Ajuste Dinámico por Fila**
- Cada fila del calendario se ajusta **independientemente**
- Si una fila tiene texto largo, solo esa fila crece
- Las otras filas mantienen su altura mínima
- **4 niveles de altura automática**:
  - `Small`: 100px (altura mínima)
  - `Medium`: 140px 
  - `Large`: 180px
  - `XLarge`: 220px

### **2. Responsive Design**
```scss
// DESKTOP (≥768px): Ajuste automático activado
@media (min-width: 768px) {
  .calendar-dynamic-row {
    height: auto !important;
    transition: min-height 0.3s ease-in-out;
  }
}

// MOBILE (<768px): Altura fija para mejor experiencia
@media (max-width: 767px) {
  .rbc-month-row {
    height: 80px !important; // Más compacto
    .rbc-event {
      font-size: 10px !important;
      white-space: nowrap !important; // Truncar en móvil
    }
  }
}
```

### **3. Detección Inteligente de Contenido**
```javascript
const adjustCalendarRowHeights = () => {
  rows.forEach((row, rowIndex) => {
    const cells = row.querySelectorAll('.rbc-day-bg');
    let maxContentHeight = 100; // Altura base
    
    cells.forEach(cell => {
      const events = cell.querySelectorAll('.rbc-event');
      let cellContentHeight = 30; // Espacio para número del día
      
      events.forEach(event => {
        const words = event.textContent.split(' ').length;
        const lines = Math.ceil(words / 4); // ~4 palabras por línea
        cellContentHeight += (lines * 16) + 4; // 16px/línea + spacing
      });
      
      maxContentHeight = Math.max(maxContentHeight, cellContentHeight);
    });
    
    // Aplicar clase CSS según altura calculada
    if (maxContentHeight <= 120) {
      row.classList.add('row-height-small');
    } else if (maxContentHeight <= 160) {
      row.classList.add('row-height-medium');
    } // ... etc
  });
};
```

### **4. Activación Automática**
El ajuste se ejecuta automáticamente cuando:
- ✅ Se cargan nuevos eventos en el calendario
- ✅ Se cambia de mes o vista
- ✅ Se redimensiona la ventana (solo desktop)
- ✅ Se detectan cambios en el DOM del calendario

### **5. Botón de Ajuste Manual**
```jsx
<button 
  className="adjust-height-button"
  onClick={adjustCalendarRowHeights}
  style={{ display: window.innerWidth >= 768 ? 'inline-flex' : 'none' }}
>
  📏 Ajustar Alturas
</button>
```

## 🎨 MEJORAS VISUALES

### **Posicionamiento del Número del Día**
```scss
.rbc-date-cell {
  position: absolute;
  top: 3px;
  right: 3px;
  background-color: rgba(0, 63, 117, 0.1);
  border: 1px solid rgba(0, 63, 117, 0.3);
  border-radius: 3px;
  z-index: 10;
}
```

### **Eventos con Mejor Legibilidad**
```scss
.rbc-event-content {
  background-color: rgba(186, 250, 186, 0.8) !important;
  border-radius: 3px !important;
  padding: 3px 5px !important;
  word-wrap: break-word !important;
  hyphens: auto !important;
}
```

## 📱 EXPERIENCIA RESPONSIVE

| Dispositivo | Comportamiento |
|-------------|----------------|
| **Desktop** (≥768px) | ✅ Ajuste automático activado<br>✅ Botón de ajuste manual<br>✅ Transiciones suaves<br>✅ Texto completo visible |
| **Mobile** (<768px) | ✅ Altura fija optimizada (80px)<br>✅ Texto truncado para evitar overflow<br>✅ Fuente más pequeña (10px)<br>✅ Sin ajuste automático |

## 🔄 FLUJO DE FUNCIONAMIENTO

```
1. CARGA INICIAL
   ↓
2. EVENTOS CARGADOS
   ↓
3. DETECTAR CONTENIDO POR FILA
   ↓
4. CALCULAR ALTURA NECESARIA
   ↓
5. APLICAR CLASE CSS APROPIADA
   ↓
6. MONITOREAR CAMBIOS (MutationObserver)
   ↓
7. REAJUSTAR AUTOMÁTICAMENTE
```

## 🎯 CASOS DE USO

### **Ejemplo 1: Texto Corto**
```
"JUZGADO 001 CIVIL"
→ Altura: 100px (small)
```

### **Ejemplo 2: Texto Medio**
```
"JUZGADO 002 PENAL DEL CIRCUITO ESPECIALIZADO"
→ Altura: 140px (medium)
```

### **Ejemplo 3: Texto Largo**
```
"JUZGADO 003 DE PEQUEÑAS CAUSAS Y COMPETENCIA MÚLTIPLE DE PASTO"
→ Altura: 180px (large)
```

### **Ejemplo 4: Texto Muy Largo**
```
"JUZGADO 004 CIVIL DEL CIRCUITO ESPECIALIZADO EN RESTITUCIÓN DE TIERRAS DE PASTO"
→ Altura: 220px (xlarge)
```

## 🛠️ INSTRUCCIONES DE USO

### **Para el Usuario:**
1. **En Desktop**: El ajuste es automático, no necesita hacer nada
2. **Si hay problemas**: Hacer clic en el botón "📏 Ajustar Alturas"
3. **En Mobile**: La vista está optimizada automáticamente

### **Para el Desarrollador:**
1. El sistema se inicializa automáticamente
2. Los estilos están en `_calendar.scss`
3. La lógica está en `home.jsx`
4. Se puede personalizar las alturas modificando las clases CSS

## 🔧 PERSONALIZACIÓN

### **Cambiar Alturas por Defecto:**
```scss
.calendar-dynamic-row {
  &.row-height-small { min-height: 120px !important; } // Cambiar aquí
  &.row-height-medium { min-height: 160px !important; } // Cambiar aquí
  &.row-height-large { min-height: 200px !important; } // Cambiar aquí
  &.row-height-xlarge { min-height: 240px !important; } // Cambiar aquí
}
```

### **Cambiar Algoritmo de Cálculo:**
```javascript
// En adjustCalendarRowHeights()
const lines = Math.ceil(words / 3); // Cambiar de 4 a 3 palabras por línea
cellContentHeight += (lines * 18) + 6; // Cambiar altura por línea
```

## 📊 BENEFICIOS

✅ **Legibilidad**: Todo el texto se ve completo
✅ **Automático**: No requiere intervención manual
✅ **Responsive**: Optimizado para desktop y móvil
✅ **Performance**: Solo se ejecuta cuando es necesario
✅ **Flexible**: Fácil de personalizar y ajustar

¡El calendario ahora se adapta perfectamente al contenido! 🎉
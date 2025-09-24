const express = require('express');
const sql = require('mssql');

module.exports = (poolPromise) => {
  const router = express.Router();

  // POST /api/festivs - Crear un nuevo festivo
  router.post('/festivs', async (req, res) => {
    try {
      const { name, date } = req.body;

      // Validaciones
      if (!name || !date) {
        return res.status(400).json({ 
          error: 'Los campos name y date son obligatorios' 
        });
      }

      // Validar formato de fecha
      const fechaValida = new Date(date);
      if (isNaN(fechaValida.getTime())) {
        return res.status(400).json({ 
          error: 'El formato de fecha no es válido' 
        });
      }

      const pool = await poolPromise;
      
      if (!pool) {
        throw new Error('No hay conexión a la base de datos');
      }

      // Verificar si ya existe un festivo en esa fecha
      const checkExisting = await pool.request()
        .input('date', sql.Date, date)
        .query('SELECT id FROM festivs WHERE date = @date');

      if (checkExisting.recordset.length > 0) {
        return res.status(409).json({ 
          error: 'Ya existe un festivo registrado para esta fecha' 
        });
      }

      // Insertar nuevo festivo
      const result = await pool.request()
        .input('name', sql.NVarChar(255), name.trim().toUpperCase())
        .input('date', sql.Date, date)
        .query(`
          INSERT INTO festivs (name, date, create_at)
          OUTPUT INSERTED.id, INSERTED.name, INSERTED.date, INSERTED.create_at as created_at
          VALUES (@name, @date, GETDATE())
        `);

      const nuevoFestivo = result.recordset[0];
      
      console.log('✅ Festivo creado correctamente:', nuevoFestivo);
      res.status(201).json({
        message: 'Festivo creado correctamente',
        festivo: nuevoFestivo
      });
      
    } catch (err) {
      console.error('❌ Error al crear festivo:', err);
      res.status(500).json({ 
        error: 'Error interno del servidor',
        details: err.message 
      });
    }
  });

  return router;
};
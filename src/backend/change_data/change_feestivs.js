const express = require('express');
const sql = require('mssql');

module.exports = (poolPromise) => {
  const router = express.Router();

  // PUT /api/festivs/:id - Actualizar un festivo
  router.put('/festivs/:id', async (req, res) => {
    try {
      const { id } = req.params;
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

      // Verificar si el festivo existe
      const checkExists = await pool.request()
        .input('id', sql.Int, id)
        .query('SELECT id FROM festivs WHERE id = @id');

      if (checkExists.recordset.length === 0) {
        return res.status(404).json({ 
          error: 'Festivo no encontrado' 
        });
      }

      // Verificar si ya existe otro festivo en esa fecha (excluyendo el actual)
      const checkExisting = await pool.request()
        .input('id', sql.Int, id)
        .input('date', sql.Date, date)
        .query('SELECT id FROM festivs WHERE date = @date AND id != @id');

      if (checkExisting.recordset.length > 0) {
        return res.status(409).json({ 
          error: 'Ya existe otro festivo registrado para esta fecha' 
        });
      }

      // Actualizar festivo
      const result = await pool.request()
        .input('id', sql.Int, id)
        .input('name', sql.NVarChar(255), name.trim().toUpperCase())
        .input('date', sql.Date, date)
        .query(`
          UPDATE festivs 
          SET name = @name, date = @date
          OUTPUT INSERTED.id, INSERTED.name, INSERTED.date, INSERTED.created_at
          WHERE id = @id
        `);

      const festivoActualizado = result.recordset[0];
      
      console.log('✅ Festivo actualizado correctamente:', festivoActualizado);
      res.json({
        message: 'Festivo actualizado correctamente',
        festivo: festivoActualizado
      });
      
    } catch (err) {
      console.error('❌ Error al actualizar festivo:', err);
      res.status(500).json({ 
        error: 'Error interno del servidor',
        details: err.message 
      });
    }
  });

  return router;
};
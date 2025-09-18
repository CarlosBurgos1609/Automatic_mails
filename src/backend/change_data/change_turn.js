const express = require('express');
const sql = require('mssql');
const router = express.Router();

module.exports = (poolPromise) => {
  // Cambiar el juzgado de un turno
  router.put('/turnos/:id', async (req, res) => {
    const { id } = req.params;
    const { nuevo_juzgado_id, turn_date } = req.body;
    if (!id || !nuevo_juzgado_id || !turn_date) {
      return res.status(400).json({ error: 'Faltan parámetros: id, nuevo_juzgado_id o turn_date' });
    }
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('id', sql.Int, id)
        .input('nuevo_juzgado_id', sql.Int, nuevo_juzgado_id)
        .input('turn_date', sql.Date, turn_date)
        .query(`
          UPDATE [automatic_emails].[dbo].[turnos]
          SET juzgado_id = @nuevo_juzgado_id
          WHERE id = @id AND CAST(turn_date AS DATE) = @turn_date
        `);
      if (result.rowsAffected[0] === 0) {
        return res.status(404).json({ error: 'No se encontró el turno para actualizar' });
      }
      res.json({ success: true, message: 'Turno actualizado correctamente' });
    } catch (err) {
      console.error('Error al actualizar turno:', err);
      res.status(500).json({ error: 'Error al actualizar el turno', details: err.message });
    }
  });

  return router;
};
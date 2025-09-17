const express = require('express');
const sql = require('mssql');
const router = express.Router();
const axios = require('axios');

module.exports = (poolPromise) => {
  // Elimina un turno por su id y fecha
  router.delete('/turnos/:id/:turn_date', async (req, res) => {
    const { id, turn_date } = req.params;
    if (!id || !turn_date) {
      return res.status(400).json({ error: 'Faltan parámetros: id y turn_date' });
    }
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('id', sql.Int, id)
        .input('turn_date', sql.Date, turn_date)
        .query('DELETE FROM [automatic_emails].[dbo].[turnos] WHERE id = @id AND turn_date = @turn_date');
      if (result.rowsAffected[0] === 0) {
        return res.status(404).json({ error: 'No se encontró el turno con esos datos' });
      }
      res.json({ success: true, message: 'Turno eliminado correctamente' });
    } catch (err) {
      console.error('Error al eliminar turno:', err);
      res.status(500).json({ error: 'Error al eliminar el turno', details: err.message });
    }
  });

  // Llama a la API externa para eliminar el turno
  router.delete('/externo/:turno_id/:turn_date', async (req, res) => {
    const { turno_id, turn_date } = req.params;
    if (!turno_id || !turn_date) {
      return res.status(400).json({ error: 'Faltan parámetros: turno_id y turn_date' });
    }
    try {
      await axios.delete(`http://localhost:5000/api/turnos/${turno_id}/${turn_date}`);
      res.json({ success: true, message: 'Turno eliminado correctamente en el sistema externo' });
    } catch (err) {
      console.error('Error al eliminar turno en el sistema externo:', err);
      res.status(500).json({ error: 'Error al eliminar el turno en el sistema externo', details: err.message });
    }
  });

  return router;
};
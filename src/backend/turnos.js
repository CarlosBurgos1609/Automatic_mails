const express = require('express');
const router = express.Router();

module.exports = (poolPromise) => {
  router.get('/turnos', async (req, res) => {
    try {
      const pool = await poolPromise;
      if (!pool) throw new Error('No hay conexión a la base de datos');
      const result = await pool.request().query(`
        SELECT id, juzgado_id, turn_date, estado_id
        FROM [automatic_emails].[dbo].[turnos]
      `);
      res.json(result.recordset);
    } catch (err) {
      console.error('Error al consultar turnos:', err);
      res.status(500).json({ error: 'Error al consultar la tabla turnos', details: err.message });
    }
  });

  return router;
};
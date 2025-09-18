const express = require('express');
const router = express.Router();

module.exports = (poolPromise) => {
  router.get('/turnos', async (req, res) => {
    try {
      const pool = await poolPromise;
      const { start, end } = req.query;
      let query = `
        SELECT id, juzgado_id, turn_date, estado_id
        FROM [automatic_emails].[dbo].[turnos]
      `;
      if (start && end) {
        query += ` WHERE turn_date BETWEEN @start AND @end`;
      }
      const request = pool.request();
      if (start && end) {
        request.input('start', start).input('end', end);
      }
      const result = await request.query(query);
      res.json(result.recordset);
    } catch (err) {
      console.error('Error al consultar turnos:', err);
      res.status(500).json({ error: 'Error al consultar la tabla turnos', details: err.message });
    }
  });

  return router;
};
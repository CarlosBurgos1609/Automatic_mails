// juzgados.js
const express = require('express');
const router = express.Router();

module.exports = (poolPromise) => {
  router.get('/juzgados', async (req, res) => {
    try {
      const pool = await poolPromise;
      if (!pool) {
        throw new Error('No hay conexión a la base de datos');
      }
      const result = await pool.request().query(`
        SELECT id, code, name, email, municipio_id, created_at
        FROM [automatic_emails].[dbo].[juzgados]
      `);
      // console.log('Juzgados obtenidos:', result.recordset); // Para depuración
      res.json(result.recordset);
    } catch (err) {
      console.error('Error al consultar juzgados:', err);
      res.status(500).json({ error: 'Error al consultar la tabla juzgados', details: err.message });
    }
  });

  return router;
};
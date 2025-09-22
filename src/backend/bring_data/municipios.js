const express = require('express');

module.exports = (poolPromise) => {
  const router = express.Router();

  // Obtener todos los municipios
  router.get('/municipios', async (req, res) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query(`
        SELECT id, name 
        FROM municipios 
        ORDER BY name ASC
      `);
      res.json(result.recordset);
    } catch (error) {
      console.error('Error al obtener municipios:', error);
      res.status(500).json({ error: 'Error al obtener municipios' });
    }
  });

  return router;
};
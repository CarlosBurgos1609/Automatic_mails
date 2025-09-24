const express = require('express');
const sql = require('mssql');

module.exports = (poolPromise) => {
  const router = express.Router();

  // GET /api/festivs - Obtener todos los festivos
  router.get('/festivs', async (req, res) => {
    try {
      const pool = await poolPromise;
      
      if (!pool) {
        throw new Error('No hay conexión a la base de datos');
      }

      const result = await pool.request().query(`
        SELECT 
          id,
          name,
          CONVERT(VARCHAR, date, 23) as date,  -- ✅ Formato YYYY-MM-DD sin zona horaria
          create_at as created_at
        FROM festivs
        ORDER BY date ASC
      `);

      console.log('✅ Festivos obtenidos correctamente:', result.recordset.length);
      res.json(result.recordset);
    } catch (err) {
      console.error('❌ Error al obtener festivos:', err);
      res.status(500).json({ 
        error: 'Error al obtener los festivos',
        details: err.message 
      });
    }
  });

  // GET /api/festivs/:id - Obtener un festivo por ID
  router.get('/festivs/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const pool = await poolPromise;
      
      if (!pool) {
        throw new Error('No hay conexión a la base de datos');
      }

      const result = await pool.request()
        .input('id', sql.Int, id)
        .query(`
          SELECT 
            id,
            name,
            CONVERT(VARCHAR, date, 23) as date,  -- ✅ Formato YYYY-MM-DD sin zona horaria
            create_at as created_at
          FROM festivs
          WHERE id = @id
        `);

      if (result.recordset.length === 0) {
        return res.status(404).json({ error: 'Festivo no encontrado' });
      }

      res.json(result.recordset[0]);
    } catch (err) {
      console.error('❌ Error al obtener festivo:', err);
      res.status(500).json({ 
        error: 'Error al obtener el festivo',
        details: err.message 
      });
    }
  });

  return router;
};
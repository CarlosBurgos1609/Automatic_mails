const express = require('express');
const sql = require('mssql');

module.exports = (poolPromise) => {
  const router = express.Router();

  // GET /api/correos - Obtener todos los correos
  router.get('/correos', async (req, res) => {
    try {
      const pool = await poolPromise;
      
      if (!pool) {
        throw new Error('No hay conexión a la base de datos');
      }

      const { start, end, juzgado_id, processed } = req.query;
      
      let query = `
        SELECT 
          id,
          from_email,
          to_email,
          subject,
          body,
          received_date,
          processed,
          juzgado_id,
          created_at
        FROM [automatic_emails].[dbo].[correos]
      `;
      
      const conditions = [];
      const request = pool.request();

      // Filtros opcionales
      if (start && end) {
        conditions.push('received_date BETWEEN @start AND @end');
        request.input('start', sql.DateTime, start);
        request.input('end', sql.DateTime, end);
      }

      if (juzgado_id) {
        conditions.push('juzgado_id = @juzgado_id');
        request.input('juzgado_id', sql.Int, juzgado_id);
      }

      if (processed !== undefined) {
        conditions.push('processed = @processed');
        request.input('processed', sql.Bit, processed === 'true');
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      query += ' ORDER BY received_date DESC';

      const result = await request.query(query);

      console.log('✅ Correos obtenidos correctamente:', result.recordset.length);
      res.json(result.recordset);
    } catch (err) {
      console.error('❌ Error al obtener correos:', err);
      res.status(500).json({ 
        error: 'Error al obtener los correos',
        details: err.message 
      });
    }
  });

  return router;
};
const express = require('express');
const sql = require('mssql');

module.exports = (poolPromise) => {
  const router = express.Router();

  // GET /api/reenvios - Obtener todos los reenvíos
  router.get('/reenvios', async (req, res) => {
    try {
      const pool = await poolPromise;
      
      if (!pool) {
        throw new Error('No hay conexión a la base de datos');
      }

      const { correo_id, start, end } = req.query;
      
      let query = `
        SELECT 
          r.id,
          r.correo_id,
          r.forwarded_to,
          r.forward_date,
          r.notes,
          r.created_at,
          c.subject as correo_subject,
          c.from_email as correo_from
        FROM [automatic_emails].[dbo].[reenvios] r
        LEFT JOIN [automatic_emails].[dbo].[correos] c ON r.correo_id = c.id
      `;
      
      const conditions = [];
      const request = pool.request();

      // Filtros opcionales
      if (correo_id) {
        conditions.push('r.correo_id = @correo_id');
        request.input('correo_id', sql.Int, correo_id);
      }

      if (start && end) {
        conditions.push('r.forward_date BETWEEN @start AND @end');
        request.input('start', sql.DateTime, start);
        request.input('end', sql.DateTime, end);
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      query += ' ORDER BY r.forward_date DESC';

      const result = await request.query(query);

      console.log('✅ Reenvíos obtenidos correctamente:', result.recordset.length);
      res.json(result.recordset);
    } catch (err) {
      console.error('❌ Error al obtener reenvíos:', err);
      res.status(500).json({ 
        error: 'Error al obtener los reenvíos',
        details: err.message 
      });
    }
  });

  // GET /api/reenvios/:id - Obtener un reenvío por ID
  router.get('/reenvios/:id', async (req, res) => {
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
            r.id,
            r.correo_id,
            r.forwarded_to,
            r.forward_date,
            r.notes,
            r.created_at,
            c.subject as correo_subject,
            c.from_email as correo_from,
            c.to_email as correo_to
          FROM [automatic_emails].[dbo].[reenvios] r
          LEFT JOIN [automatic_emails].[dbo].[correos] c ON r.correo_id = c.id
          WHERE r.id = @id
        `);

      if (result.recordset.length === 0) {
        return res.status(404).json({ error: 'Reenvío no encontrado' });
      }

      console.log('✅ Reenvío obtenido correctamente');
      res.json(result.recordset[0]);
    } catch (err) {
      console.error('❌ Error al obtener reenvío:', err);
      res.status(500).json({ 
        error: 'Error al obtener el reenvío',
        details: err.message 
      });
    }
  });

  return router;
};
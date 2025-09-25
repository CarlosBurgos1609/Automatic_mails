const express = require('express');
const sql = require('mssql');

module.exports = (poolPromise) => {
  const router = express.Router();

  // GET /api/habeas-corpus - Obtener todos los casos de habeas corpus
  router.get('/habeas-corpus', async (req, res) => {
    try {
      const pool = await poolPromise;
      
      if (!pool) {
        throw new Error('No hay conexión a la base de datos');
      }

      const { juzgado_id, status, correo_id } = req.query;
      
      let query = `
        SELECT 
          hc.id,
          hc.case_number,
          hc.details,
          hc.status,
          hc.correo_id,
          hc.juzgado_id,
          hc.created_at,
          c.subject as correo_subject,
          c.from_email as correo_from,
          j.name as juzgado_name,
          j.code as juzgado_code
        FROM [automatic_emails].[dbo].[habeas_corpus] hc
        LEFT JOIN [automatic_emails].[dbo].[correos] c ON hc.correo_id = c.id
        LEFT JOIN [automatic_emails].[dbo].[juzgados] j ON hc.juzgado_id = j.id
      `;
      
      const conditions = [];
      const request = pool.request();

      // Filtros opcionales
      if (juzgado_id) {
        conditions.push('hc.juzgado_id = @juzgado_id');
        request.input('juzgado_id', sql.Int, juzgado_id);
      }

      if (status) {
        conditions.push('hc.status = @status');
        request.input('status', sql.VarChar, status);
      }

      if (correo_id) {
        conditions.push('hc.correo_id = @correo_id');
        request.input('correo_id', sql.Int, correo_id);
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      query += ' ORDER BY hc.created_at DESC';

      const result = await request.query(query);

      console.log('✅ Casos de habeas corpus obtenidos correctamente:', result.recordset.length);
      res.json(result.recordset);
    } catch (err) {
      console.error('❌ Error al obtener casos de habeas corpus:', err);
      res.status(500).json({ 
        error: 'Error al obtener los casos de habeas corpus',
        details: err.message 
      });
    }
  });

  // GET /api/habeas-corpus/:id - Obtener un caso de habeas corpus por ID
  router.get('/habeas-corpus/:id', async (req, res) => {
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
            hc.id,
            hc.case_number,
            hc.details,
            hc.status,
            hc.correo_id,
            hc.juzgado_id,
            hc.created_at,
            c.subject as correo_subject,
            c.from_email as correo_from,
            c.to_email as correo_to,
            c.body as correo_body,
            j.name as juzgado_name,
            j.code as juzgado_code,
            j.email as juzgado_email
          FROM [automatic_emails].[dbo].[habeas_corpus] hc
          LEFT JOIN [automatic_emails].[dbo].[correos] c ON hc.correo_id = c.id
          LEFT JOIN [automatic_emails].[dbo].[juzgados] j ON hc.juzgado_id = j.id
          WHERE hc.id = @id
        `);

      if (result.recordset.length === 0) {
        return res.status(404).json({ error: 'Caso de habeas corpus no encontrado' });
      }

      console.log('✅ Caso de habeas corpus obtenido correctamente');
      res.json(result.recordset[0]);
    } catch (err) {
      console.error('❌ Error al obtener caso de habeas corpus:', err);
      res.status(500).json({ 
        error: 'Error al obtener el caso de habeas corpus',
        details: err.message 
      });
    }
  });

  return router;
};
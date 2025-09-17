const express = require('express');
const sql = require('mssql');
const router = express.Router();

module.exports = (poolPromise) => {
  router.post('/turnos', async (req, res) => {
    console.log('POST /api/turnos/turnos - Cuerpo recibido:', req.body);
    const { juzgado_id, turn_date, estado_id } = req.body;

    if (!juzgado_id || !turn_date) {
      console.log('Faltan datos obligatorios:', { juzgado_id, turn_date });
      return res.status(400).json({ error: 'Faltan datos obligatorios: juzgado_id y turn_date son requeridos' });
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(turn_date)) {
      console.log('Formato de fecha inválido:', turn_date);
      return res.status(400).json({ error: 'Formato de fecha inválido. Use YYYY-MM-DD' });
    }

    try {
      const pool = await poolPromise;
      console.log('Conexión a la base de datos establecida');

      const request = pool.request()
        .input('juzgado_id', sql.Int, juzgado_id)
        .input('turn_date', sql.Date, turn_date)
        .input('estado_id', sql.Int, estado_id || 1);

      console.log('Ejecutando consulta SQL con parámetros:', {
        juzgado_id,
        turn_date,
        estado_id: estado_id || 1
      });

      const result = await request.query(`
        INSERT INTO [automatic_emails].[dbo].[turnos] (juzgado_id, turn_date, created_at, estado_id)
        VALUES (@juzgado_id, @turn_date, GETDATE(), @estado_id)
      `);

      console.log('Resultado de la inserción:', result);
      res.json({ success: true, message: 'Turno agregado correctamente' });
    } catch (err) {
      console.error('Error al insertar turno:', err);
      res.status(500).json({ error: 'Error al insertar el turno', details: err.message });
    }
  });

  return router;
};
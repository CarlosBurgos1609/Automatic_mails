const express = require('express');
const sql = require('mssql');
const router = express.Router();

module.exports = (poolPromise) => {
  // Insertar un nuevo juzgado
  router.post('/juzgados', async (req, res) => {
    let { code, name, email, municipio_id } = req.body;
    
    if (!code || !name || !email || !municipio_id) {
      return res.status(400).json({ 
        error: 'Faltan campos obligatorios: code, name, email, municipio_id' 
      });
    }

    // Asegurar el formato correcto en el backend también
    code = code.toString().toUpperCase().trim();
    name = name.toString().toUpperCase().trim();
    email = email.toString().toLowerCase().trim();

    // Validar formato de email
    if (!email.includes('@')) {
      return res.status(400).json({ 
        error: 'El email debe tener un formato válido' 
      });
    }

    try {
      const pool = await poolPromise;
      
      // Verificar si ya existe un juzgado con el mismo código o email
      const existingCheck = await pool.request()
        .input('code', sql.VarChar, code)
        .input('email', sql.VarChar, email)
        .query(`
          SELECT COUNT(*) as count 
          FROM [automatic_emails].[dbo].[juzgados] 
          WHERE code = @code OR email = @email
        `);

      if (existingCheck.recordset[0].count > 0) {
        return res.status(409).json({ 
          error: 'Ya existe un juzgado con ese código o email' 
        });
      }

      // Insertar el nuevo juzgado
      const result = await pool.request()
        .input('code', sql.VarChar, code)
        .input('name', sql.VarChar, name)
        .input('email', sql.VarChar, email)
        .input('municipio_id', sql.Int, municipio_id)
        .query(`
          INSERT INTO [automatic_emails].[dbo].[juzgados] 
          (code, name, email, municipio_id, created_at)
          VALUES (@code, @name, @email, @municipio_id, GETDATE())
        `);

      res.status(201).json({ 
        success: true, 
        message: 'Juzgado creado correctamente',
        data: { code, name, email, municipio_id }
      });
    } catch (err) {
      console.error('Error al insertar juzgado:', err);
      res.status(500).json({ 
        error: 'Error al crear el juzgado', 
        details: err.message 
      });
    }
  });

  return router;
};
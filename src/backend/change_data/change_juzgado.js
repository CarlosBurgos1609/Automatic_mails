const express = require('express');
const sql = require('mssql');
const router = express.Router();

module.exports = (poolPromise) => {
  // Actualizar un juzgado existente
  router.put('/juzgados/:id', async (req, res) => {
    const { id } = req.params;
    let { code, name, email, municipio_id } = req.body;
    
    console.log(`📝 PUT /api/juzgados/${id} - Datos recibidos:`, req.body);
    
    if (!id || !code || !name || !email || !municipio_id) {
      console.log('❌ Faltan campos obligatorios');
      return res.status(400).json({ 
        error: 'Faltan campos obligatorios: code, name, email, municipio_id' 
      });
    }

    // Asegurar el formato correcto
    code = code.toString().toUpperCase().trim();
    name = name.toString().toUpperCase().trim();
    email = email.toString().toLowerCase().trim();

    // Validar formato de email
    if (!email.includes('@')) {
      console.log('❌ Email inválido');
      return res.status(400).json({ 
        error: 'El email debe tener un formato válido' 
      });
    }

    try {
      const pool = await poolPromise;
      console.log('✅ Conexión a BD establecida');
      
      // Verificar si ya existe otro juzgado con el mismo código o email
      const existingCheck = await pool.request()
        .input('code', sql.VarChar, code)
        .input('email', sql.VarChar, email)
        .input('id', sql.Int, id)
        .query(`
          SELECT COUNT(*) as count 
          FROM [automatic_emails].[dbo].[juzgados] 
          WHERE (code = @code OR email = @email) AND id != @id
        `);

      if (existingCheck.recordset[0].count > 0) {
        console.log('❌ Código o email ya existe');
        return res.status(409).json({ 
          error: 'Ya existe otro juzgado con ese código o email' 
        });
      }

      // Actualizar el juzgado
      const result = await pool.request()
        .input('id', sql.Int, id)
        .input('code', sql.VarChar, code)
        .input('name', sql.VarChar, name)
        .input('email', sql.VarChar, email)
        .input('municipio_id', sql.Int, municipio_id)
        .query(`
          UPDATE [automatic_emails].[dbo].[juzgados] 
          SET code = @code, 
              name = @name, 
              email = @email, 
              municipio_id = @municipio_id
          WHERE id = @id
        `);

      console.log('📊 Filas afectadas:', result.rowsAffected[0]);

      if (result.rowsAffected[0] === 0) {
        console.log('❌ Juzgado no encontrado');
        return res.status(404).json({ 
          error: 'Juzgado no encontrado' 
        });
      }

      console.log('✅ Juzgado actualizado correctamente');
      res.status(200).json({ 
        success: true, 
        message: 'Juzgado actualizado correctamente',
        data: { id, code, name, email, municipio_id }
      });
    } catch (err) {
      console.error('❌ Error al actualizar juzgado:', err);
      res.status(500).json({ 
        error: 'Error al actualizar el juzgado', 
        details: err.message 
      });
    }
  });

  return router;
};
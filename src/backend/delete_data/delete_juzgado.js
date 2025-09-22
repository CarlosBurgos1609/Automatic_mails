const express = require('express');
const sql = require('mssql');
const router = express.Router();

module.exports = (poolPromise) => {
  // Eliminar un juzgado existente
  router.delete('/juzgados/:id', async (req, res) => {
    const { id } = req.params;
    
    console.log(`🗑️ DELETE /api/juzgados/${id} - Eliminando juzgado`);
    
    if (!id) {
      console.log('❌ ID de juzgado no proporcionado');
      return res.status(400).json({ 
        error: 'ID de juzgado es requerido' 
      });
    }

    try {
      const pool = await poolPromise;
      console.log('✅ Conexión a BD establecida');
      
      // Verificar si el juzgado existe antes de eliminar
      const existsCheck = await pool.request()
        .input('id', sql.Int, id)
        .query(`
          SELECT id, code, name, email 
          FROM [automatic_emails].[dbo].[juzgados] 
          WHERE id = @id
        `);

      if (existsCheck.recordset.length === 0) {
        console.log('❌ Juzgado no encontrado');
        return res.status(404).json({ 
          error: 'Juzgado no encontrado' 
        });
      }

      const juzgadoData = existsCheck.recordset[0];
      console.log('📋 Juzgado encontrado:', juzgadoData);

      // Verificar si el juzgado tiene turnos asociados
      const turnosCheck = await pool.request()
        .input('juzgado_id', sql.Int, id)
        .query(`
          SELECT COUNT(*) as count 
          FROM [automatic_emails].[dbo].[turnos] 
          WHERE juzgado_id = @juzgado_id
        `);

      const turnosCount = turnosCheck.recordset[0].count;
      console.log(`📊 Turnos asociados: ${turnosCount}`);

      if (turnosCount > 0) {
        console.log('⚠️ No se puede eliminar: juzgado tiene turnos asociados');
        return res.status(409).json({ 
          error: `No se puede eliminar el juzgado porque tiene ${turnosCount} turno(s) asociado(s). Elimine primero los turnos.`,
          turnosCount: turnosCount
        });
      }

      // Eliminar el juzgado
      const result = await pool.request()
        .input('id', sql.Int, id)
        .query(`
          DELETE FROM [automatic_emails].[dbo].[juzgados] 
          WHERE id = @id
        `);

      console.log('📊 Filas afectadas:', result.rowsAffected[0]);

      if (result.rowsAffected[0] === 0) {
        console.log('❌ No se pudo eliminar el juzgado');
        return res.status(500).json({ 
          error: 'No se pudo eliminar el juzgado' 
        });
      }

      console.log('✅ Juzgado eliminado correctamente');
      res.status(200).json({ 
        success: true, 
        message: 'Juzgado eliminado correctamente',
        data: juzgadoData
      });
    } catch (err) {
      console.error('❌ Error al eliminar juzgado:', err);
      res.status(500).json({ 
        error: 'Error al eliminar el juzgado', 
        details: err.message 
      });
    }
  });

  return router;
};
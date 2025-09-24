const express = require('express');
const sql = require('mssql');

module.exports = (poolPromise) => {
  const router = express.Router();

  // DELETE /api/festivs/:id - Eliminar un festivo
  router.delete('/festivs/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const pool = await poolPromise;
      
      if (!pool) {
        throw new Error('No hay conexión a la base de datos');
      }

      // Verificar si el festivo existe y obtener sus datos antes de eliminar
      const checkExists = await pool.request()
        .input('id', sql.Int, id)
        .query('SELECT id, name, date FROM festivs WHERE id = @id');

      if (checkExists.recordset.length === 0) {
        return res.status(404).json({ 
          error: 'Festivo no encontrado' 
        });
      }

      const festivoAEliminar = checkExists.recordset[0];

      // Eliminar festivo
      await pool.request()
        .input('id', sql.Int, id)
        .query('DELETE FROM festivs WHERE id = @id');

      console.log('✅ Festivo eliminado correctamente:', festivoAEliminar);
      res.json({
        message: 'Festivo eliminado correctamente',
        festivo: festivoAEliminar
      });
      
    } catch (err) {
      console.error('❌ Error al eliminar festivo:', err);
      res.status(500).json({ 
        error: 'Error interno del servidor',
        details: err.message 
      });
    }
  });

  return router;
};
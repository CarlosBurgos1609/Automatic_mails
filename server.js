// server.js
const express = require('express');
const sql = require('mssql');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Configuración SQL Server
const dbConfig = {
  user: 'Practicante',
  password: 'Sistemas1',
  server: '192.168.68.21',
  port: 1433,
  database: 'automatic_emails',
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

// Conexión global
const poolPromise = new sql.ConnectionPool(dbConfig)
  .connect()
  .then(pool => {
    console.log("✅ Conectado a SQL Server");
    return pool;
  })
  .catch(err => {
    console.error("❌ Error en la conexión a SQL Server:", err);
  });

// Endpoint API
app.get('/api/data', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT id, name, created_at FROM municipios');
    res.json(result.recordset);
  } catch (err) {
    console.error('❌ Error al consultar municipios:', err);
    res.status(500).json({ error: 'Error al conectar o consultar la tabla municipios' });
  }
});

// Puerto
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));

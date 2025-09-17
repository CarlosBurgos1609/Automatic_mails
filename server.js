// server.js
const express = require('express');
const sql = require('mssql');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(express.json());
app.use(cors());

// Configuración SQL Server
const dbConfig = {
  user: 'Practicante2',
  password: 'Sistemas1',
  server: '192.168.68.21',
  port: 1433,
  database: 'automatic_emails',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true, // Añadido para consistencia con juzgados.js
  },
};

// Conexión global
let poolPromise;

async function connectToDatabase() {
  try {
    poolPromise = new sql.ConnectionPool(dbConfig)
      .connect()
      .then(pool => {
        console.log("✅ Conectado a SQL Server");
        return pool;
      })
      .catch(err => {
        console.error("❌ Error en la conexión a SQL Server:", err);
        throw err;
      });
    return poolPromise;
  } catch (err) {
    console.error("❌ No se pudo inicializar la conexión:", err);
    throw err;
  }
}

// Inicializa la conexión al iniciar el servidor
connectToDatabase();

// Endpoint API
app.get('/api/data', async (req, res) => {
  try {
    const pool = await poolPromise;
    if (!pool) {
      throw new Error('No hay conexión a la base de datos');
    }
    const result = await pool.request().query('SELECT id, name, created_at FROM municipios');
    res.json(result.recordset);
  } catch (err) {
    console.error('❌ Error al consultar municipios:', err);
    res.status(500).json({ error: 'Error al conectar o consultar la tabla municipios' });
  }
});

// Visualizar los datos de la base de datos
const juzgadosRouter = require('./src/backend/bring_data/juzgados')(poolPromise);
app.use('/api', juzgadosRouter);
const turnosRouter = require('./src/backend/bring_data/turnos')(poolPromise);
app.use('/api', turnosRouter);

// Insertar datos en la base de datos
const changeTurnsRouter = require('./src/backend/insert_data/insert_turns')(poolPromise);
app.use('/api', changeTurnsRouter);

// Eliminar datos en la base de datos
const deleteJuzgadoTurnRouter = require('./src/backend/delete_data/delete_juzgado_turn')(poolPromise);
app.use('/api', deleteJuzgadoTurnRouter);

// Puerto
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
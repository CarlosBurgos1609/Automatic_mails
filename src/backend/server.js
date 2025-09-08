const express = require('express');
const sql = require('mssql');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

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

app.get('/api/data', async (req, res) => {
  try {
    let pool = await sql.connect(dbConfig);
    let result = await pool.request().query('SELECT id, name, created_at FROM municipios');
    res.json(result.recordset);
  } catch (err) {
    console.error('Error en la conexión:', err);
    res.status(500).json({ error: 'Error al conectar o consultar la tabla municipios' });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
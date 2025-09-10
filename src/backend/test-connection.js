const sql = require('mssql');

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

async function testConnection() {
  try {
    console.log('🔄 Intentando conectar...');
    let pool = await sql.connect(dbConfig);
    console.log('✅ Conexión exitosa');
    let result = await pool.request().query('SELECT id, name, created_at FROM municipios');
    console.log('✅ Datos:', result.recordset);
    await pool.close();
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

testConnection();
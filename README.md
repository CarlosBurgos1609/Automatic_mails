# Proyecto de Automatización Correos

## Comandos para colocar en terminal

```bash
npm start
npm run build
npm run
npm install 
npm i '...'
```
---

## Comando para instalar Todas las dependencias

>[!IMPORTANT]
> PARA DESCARGAR TODAS LAS DEPENENDCIAS SIN EXCPCIÓN

 ```bash
npm install .
```

## Conexión base de datos SQL Server

```sql
const dbConfig = {
  user: 'USUARIOLOGUEADOBASEDEDATOS',
  password: 'CONTRASEÑA',
  server: 'PUERTO(127.484.91)',
  port: 1433,
  database: 'NOMBRE DE LA BASE DE DATOS',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
  },
};
```



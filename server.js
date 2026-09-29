const express = require('express');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('./src/routes');
const { notFoundApi, errorHandler } = require('./src/middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// O front-end é servido pelo próprio Express (mesma origem), então o CORS
// fica desligado por padrão. Para liberar uma origem: CORS_ORIGIN=https://meusite.com
app.use(cors({ origin: process.env.CORS_ORIGIN || false }));
app.use(express.json({ limit: '100kb' }));

// API REST
app.use('/api', apiRoutes);
app.use('/api', notFoundApi); // rota /api/... inexistente -> 404 em JSON

// Front-end estático (Interface Web)
app.use(express.static(path.join(__dirname, 'public')));

// Fallback para servir a SPA em qualquer rota não-API
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Deve ser o último middleware
app.use(errorHandler);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
  });
}

module.exports = app;

const express = require('express');
const router = express.Router();

const campanhaController = require('./controllers/campanhaController');
const personagemController = require('./controllers/personagemController');
const sessaoController = require('./controllers/sessaoController');

// Campanhas
router.post('/campanhas', (req, res) => campanhaController.criarCampanha(req, res));
router.get('/campanhas', (req, res) => campanhaController.listarCampanhas(req, res));
router.get('/campanhas/:id', (req, res) => campanhaController.buscarPorId(req, res));

// Personagens (fichas) de uma campanha
router.post('/campanhas/:campanhaId/personagens', (req, res) => personagemController.criarFicha(req, res));
router.get('/campanhas/:campanhaId/personagens', (req, res) => personagemController.listarPorCampanha(req, res));
router.post('/personagens/:id/itens', (req, res) => personagemController.adicionarItem(req, res));

// Sessões de uma campanha
router.post('/campanhas/:campanhaId/sessoes', (req, res) => sessaoController.registrarSessao(req, res));
router.get('/campanhas/:campanhaId/sessoes', (req, res) => sessaoController.listarPorCampanha(req, res));

module.exports = router;

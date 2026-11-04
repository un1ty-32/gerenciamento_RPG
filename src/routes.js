const express = require('express');
const router = express.Router();

const campanhaController = require('./controllers/campanhaController');
const personagemController = require('./controllers/personagemController');
const sessaoController = require('./controllers/sessaoController');

// Campanhas
router.post('/campanhas', (req, res) => campanhaController.criarCampanha(req, res));
router.get('/campanhas', (req, res) => campanhaController.listarCampanhas(req, res));
router.get('/campanhas/:id', (req, res) => campanhaController.buscarPorId(req, res));

// Personagens (fichas)
router.post('/campanhas/:campanhaId/personagens', (req, res) => personagemController.criarFicha(req, res));
router.get('/campanhas/:campanhaId/personagens', (req, res) => personagemController.listarPorCampanha(req, res));
router.put('/personagens/:id', (req, res) => personagemController.atualizarFicha(req, res));
router.delete('/personagens/:id', (req, res) => personagemController.excluirFicha(req, res));

// Itens de um personagem
router.get('/personagens/:id/itens', (req, res) => personagemController.listarItens(req, res));
router.post('/personagens/:id/itens', (req, res) => personagemController.adicionarItem(req, res));
router.put('/itens/:id', (req, res) => personagemController.atualizarItem(req, res));
router.delete('/itens/:id', (req, res) => personagemController.excluirItem(req, res));

// Sessões
router.post('/campanhas/:campanhaId/sessoes', (req, res) => sessaoController.registrarSessao(req, res));
router.get('/campanhas/:campanhaId/sessoes', (req, res) => sessaoController.listarPorCampanha(req, res));
router.put('/sessoes/:id', (req, res) => sessaoController.atualizarSessao(req, res));
router.delete('/sessoes/:id', (req, res) => sessaoController.excluirSessao(req, res));

module.exports = router;

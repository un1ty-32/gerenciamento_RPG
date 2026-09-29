const campanhaService = require('../services/campanhaService');

// Erros lançados pelos services são tratados pelo middleware central (errorHandler)
class CampanhaController {
  criarCampanha(req, res) {
    res.status(201).json(campanhaService.criar(req.body || {}));
  }

  listarCampanhas(req, res) {
    res.json(campanhaService.listarTodas());
  }

  buscarPorId(req, res) {
    res.json(campanhaService.buscarPorId(req.params.id));
  }
}

module.exports = new CampanhaController();

const sessaoService = require('../services/sessaoService');

class SessaoController {
  registrarSessao(req, res) {
    // O id da URL vem por último para que o corpo da requisição não possa sobrescrevê-lo
    const sessao = sessaoService.registrar({
      ...(req.body || {}),
      campanhaId: req.params.campanhaId,
    });
    res.status(201).json(sessao);
  }

  listarPorCampanha(req, res) {
    res.json(sessaoService.listarPorCampanha(req.params.campanhaId));
  }

  atualizarSessao(req, res) {
    res.json(sessaoService.atualizar(req.params.id, req.body || {}));
  }

  excluirSessao(req, res) {
    sessaoService.excluir(req.params.id);
    res.status(204).end();
  }
}

module.exports = new SessaoController();

const personagemService = require('../services/personagemService');

class PersonagemController {
  criarFicha(req, res) {
    // O id da URL vem por último para que o corpo da requisição não possa sobrescrevê-lo
    const personagem = personagemService.criarFicha({
      ...(req.body || {}),
      campanhaId: req.params.campanhaId,
    });
    res.status(201).json(personagem);
  }

  listarPorCampanha(req, res) {
    res.json(personagemService.listarPorCampanha(req.params.campanhaId));
  }

  atualizarFicha(req, res) {
    res.json(personagemService.atualizarFicha(req.params.id, req.body || {}));
  }

  excluirFicha(req, res) {
    personagemService.excluirFicha(req.params.id);
    res.status(204).end();
  }

  // ---------- Itens ----------
  listarItens(req, res) {
    res.json(personagemService.listarItens(req.params.id));
  }

  adicionarItem(req, res) {
    const itens = personagemService.adicionarItem(req.params.id, req.body || {});
    res.status(201).json(itens);
  }

  atualizarItem(req, res) {
    res.json(personagemService.atualizarItem(req.params.id, req.body || {}));
  }

  excluirItem(req, res) {
    personagemService.excluirItem(req.params.id);
    res.status(204).end();
  }
}

module.exports = new PersonagemController();

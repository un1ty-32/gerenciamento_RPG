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

  adicionarItem(req, res) {
    const itens = personagemService.adicionarItem(req.params.id, req.body || {});
    res.status(201).json(itens);
  }
}

module.exports = new PersonagemController();

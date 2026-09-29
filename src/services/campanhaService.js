const campanhaRepository = require('../repositories/campanhaRepository');
const { NotFoundError } = require('../errors');
const { parseId, textoObrigatorio, textoOpcional } = require('../utils/validators');

class CampanhaService {
  criar({ nome, descricao, sistemaDeJogo, mestreNome } = {}) {
    return campanhaRepository.salvar({
      nome: textoObrigatorio(nome, 'O nome da campanha', 100),
      descricao: textoOpcional(descricao, 'A descrição', 2000),
      sistemaDeJogo: textoOpcional(sistemaDeJogo, 'O sistema de jogo', 50),
      mestreNome: textoObrigatorio(mestreNome, 'O nome do mestre', 100),
    });
  }

  buscarPorId(id) {
    const campanha = campanhaRepository.buscarPorId(parseId(id, 'id da campanha'));
    if (!campanha) {
      throw new NotFoundError('Campanha não encontrada.');
    }
    return campanha;
  }

  listarTodas() {
    return campanhaRepository.listarTodas();
  }
}

module.exports = new CampanhaService();

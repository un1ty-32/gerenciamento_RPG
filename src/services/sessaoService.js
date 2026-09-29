const sessaoRepository = require('../repositories/sessaoRepository');
const campanhaService = require('./campanhaService');
const { dataISO, textoOpcional } = require('../utils/validators');

class SessaoService {
  registrar({ campanhaId, data, participantes, resumo } = {}) {
    const dataValida = dataISO(data, 'A data da sessão');
    const campanha = campanhaService.buscarPorId(campanhaId); // valida existência da campanha

    return sessaoRepository.salvar({
      campanhaId: campanha.id,
      data: dataValida,
      participantes: textoOpcional(participantes, 'Os participantes', 300),
      resumo: textoOpcional(resumo, 'O resumo', 4000),
    });
  }

  listarPorCampanha(campanhaId) {
    const campanha = campanhaService.buscarPorId(campanhaId);
    return sessaoRepository.listarPorCampanha(campanha.id);
  }
}

module.exports = new SessaoService();

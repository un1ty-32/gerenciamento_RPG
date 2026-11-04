const sessaoRepository = require('../repositories/sessaoRepository');
const campanhaService = require('./campanhaService');
const { NotFoundError } = require('../errors');
const { parseId, dataISO, textoOpcional } = require('../utils/validators');

// Valida os dados da sessão (usado no registro e na edição)
function validarDadosSessao({ data, participantes, resumo } = {}) {
  return {
    data: dataISO(data, 'A data da sessão'),
    participantes: textoOpcional(participantes, 'Os participantes', 300),
    resumo: textoOpcional(resumo, 'O resumo', 4000),
  };
}

class SessaoService {
  registrar({ campanhaId, ...dadosSessao } = {}) {
    const dados = validarDadosSessao(dadosSessao);
    const campanha = campanhaService.buscarPorId(campanhaId); // valida existência da campanha

    return sessaoRepository.salvar({ campanhaId: campanha.id, ...dados });
  }

  listarPorCampanha(campanhaId) {
    const campanha = campanhaService.buscarPorId(campanhaId);
    return sessaoRepository.listarPorCampanha(campanha.id);
  }

  buscarPorId(id) {
    const sessao = sessaoRepository.buscarPorId(parseId(id, 'id da sessão'));
    if (!sessao) throw new NotFoundError('Sessão não encontrada.');
    return sessao;
  }

  atualizar(id, dadosSessao = {}) {
    const dados = validarDadosSessao(dadosSessao);
    const atual = this.buscarPorId(id); // valida existência
    return sessaoRepository.atualizar(atual.id, dados);
  }

  excluir(id) {
    const sessao = this.buscarPorId(id); // valida existência
    sessaoRepository.excluir(sessao.id);
  }
}

module.exports = new SessaoService();

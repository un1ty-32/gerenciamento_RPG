const personagemRepository = require('../repositories/personagemRepository');
const campanhaService = require('./campanhaService');
const { NotFoundError, ValidationError } = require('../errors');
const {
  parseId,
  textoObrigatorio,
  textoOpcional,
  inteiroPositivo,
} = require('../utils/validators');

const TIPOS_VALIDOS = ['PC', 'NPC'];

// Converte o JSON salvo em texto; nunca derruba a listagem por causa de um registro corrompido
function converterAtributos(p) {
  if (!p) return p;
  let atributos = {};
  if (p.atributos) {
    try {
      atributos = JSON.parse(p.atributos);
    } catch {
      atributos = {};
    }
  }
  return { ...p, atributos };
}

// Valida os dados da ficha (usado na criação e na edição).
// Retorna `atributosJson` como undefined quando os atributos não foram enviados.
function validarDadosFicha({ nome, tipo, jogadorNome, atributos } = {}) {
  const nomeValido = textoObrigatorio(nome, 'O nome do personagem', 100);
  const jogador = textoOpcional(jogadorNome, 'O nome do jogador', 100);

  const tipoValido = (tipo === undefined || tipo === null || tipo === '')
    ? 'PC'
    : String(tipo).trim().toUpperCase();
  if (!TIPOS_VALIDOS.includes(tipoValido)) {
    throw new ValidationError(`O tipo deve ser um destes: ${TIPOS_VALIDOS.join(', ')}.`);
  }

  let atributosJson;
  if (atributos !== undefined && atributos !== null) {
    if (typeof atributos !== 'object' || Array.isArray(atributos)) {
      throw new ValidationError('Os atributos devem ser um objeto JSON.');
    }
    atributosJson = JSON.stringify(atributos);
    if (atributosJson.length > 10000) {
      throw new ValidationError('Os atributos são grandes demais.');
    }
  }

  return { nome: nomeValido, tipo: tipoValido, jogadorNome: jogador, atributosJson };
}

// Valida os dados de um item (usado na criação e na edição)
function validarDadosItem(item = {}) {
  return {
    nome: textoObrigatorio(item.nome, 'O nome do item', 100),
    quantidade: inteiroPositivo(item.quantidade, 'A quantidade', 1),
  };
}

class PersonagemService {
  criarFicha({ campanhaId, ...dadosFicha } = {}) {
    const dados = validarDadosFicha(dadosFicha);

    // Garante que a campanha existe (regra de negócio)
    const campanha = campanhaService.buscarPorId(campanhaId);

    return converterAtributos(
      personagemRepository.salvar({
        campanhaId: campanha.id,
        nome: dados.nome,
        tipo: dados.tipo,
        jogadorNome: dados.jogadorNome,
        atributos: dados.atributosJson ?? null,
      })
    );
  }

  listarPorCampanha(campanhaId) {
    const campanha = campanhaService.buscarPorId(campanhaId);
    return personagemRepository.listarPorCampanha(campanha.id).map(converterAtributos);
  }

  buscarPorId(id) {
    const p = personagemRepository.buscarPorId(parseId(id, 'id do personagem'));
    if (!p) throw new NotFoundError('Personagem não encontrado.');
    return converterAtributos(p);
  }

  // Edita a ficha. Se os atributos não forem enviados, os atuais são mantidos.
  atualizarFicha(id, dadosFicha = {}) {
    const dados = validarDadosFicha(dadosFicha);
    const atual = personagemRepository.buscarPorId(parseId(id, 'id do personagem'));
    if (!atual) throw new NotFoundError('Personagem não encontrado.');

    return converterAtributos(
      personagemRepository.atualizar(atual.id, {
        nome: dados.nome,
        tipo: dados.tipo,
        jogadorNome: dados.jogadorNome,
        atributos: dados.atributosJson === undefined ? atual.atributos : dados.atributosJson,
      })
    );
  }

  excluirFicha(id) {
    const personagem = this.buscarPorId(id); // valida existência
    personagemRepository.excluir(personagem.id);
  }

  // ---------- Itens ----------
  listarItens(personagemId) {
    const personagem = this.buscarPorId(personagemId); // valida existência
    return personagemRepository.listarItens(personagem.id);
  }

  adicionarItem(personagemId, item = {}) {
    const personagem = this.buscarPorId(personagemId); // valida existência
    return personagemRepository.adicionarItem(personagem.id, validarDadosItem(item));
  }

  buscarItem(id) {
    const item = personagemRepository.buscarItem(parseId(id, 'id do item'));
    if (!item) throw new NotFoundError('Item não encontrado.');
    return item;
  }

  atualizarItem(id, item = {}) {
    const dados = validarDadosItem(item);
    const atual = this.buscarItem(id); // valida existência
    return personagemRepository.atualizarItem(atual.id, dados);
  }

  excluirItem(id) {
    const item = this.buscarItem(id); // valida existência
    personagemRepository.excluirItem(item.id);
  }
}

module.exports = new PersonagemService();

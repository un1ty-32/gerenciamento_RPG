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

class PersonagemService {
  criarFicha({ campanhaId, nome, tipo, jogadorNome, atributos } = {}) {
    const nomeValido = textoObrigatorio(nome, 'O nome do personagem', 100);
    const jogador = textoOpcional(jogadorNome, 'O nome do jogador', 100);

    const tipoValido = (tipo === undefined || tipo === null || tipo === '')
      ? 'PC'
      : String(tipo).trim().toUpperCase();
    if (!TIPOS_VALIDOS.includes(tipoValido)) {
      throw new ValidationError(`O tipo deve ser um destes: ${TIPOS_VALIDOS.join(', ')}.`);
    }

    let atributosJson = null;
    if (atributos !== undefined && atributos !== null) {
      if (typeof atributos !== 'object' || Array.isArray(atributos)) {
        throw new ValidationError('Os atributos devem ser um objeto JSON.');
      }
      atributosJson = JSON.stringify(atributos);
      if (atributosJson.length > 10000) {
        throw new ValidationError('Os atributos são grandes demais.');
      }
    }

    // Garante que a campanha existe (regra de negócio)
    const campanha = campanhaService.buscarPorId(campanhaId);

    return converterAtributos(
      personagemRepository.salvar({
        campanhaId: campanha.id,
        nome: nomeValido,
        tipo: tipoValido,
        jogadorNome: jogador,
        atributos: atributosJson,
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

  adicionarItem(personagemId, item = {}) {
    const personagem = this.buscarPorId(personagemId); // valida existência
    const dados = {
      nome: textoObrigatorio(item.nome, 'O nome do item', 100),
      quantidade: inteiroPositivo(item.quantidade, 'A quantidade', 1),
    };
    return personagemRepository.adicionarItem(personagem.id, dados);
  }
}

module.exports = new PersonagemService();

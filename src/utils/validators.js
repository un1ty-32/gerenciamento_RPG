const { ValidationError } = require('../errors');

function parseId(valor, rotulo = 'id') {
  const n = Number(valor);
  if (!Number.isInteger(n) || n <= 0) {
    throw new ValidationError(`O ${rotulo} informado é inválido.`);
  }
  return n;
}

function textoObrigatorio(valor, rotulo, max) {
  if (typeof valor !== 'string' || !valor.trim()) {
    throw new ValidationError(`${rotulo} é obrigatório.`);
  }
  const texto = valor.trim();
  if (texto.length > max) {
    throw new ValidationError(`${rotulo} deve ter no máximo ${max} caracteres.`);
  }
  return texto;
}

function textoOpcional(valor, rotulo, max) {
  if (valor === undefined || valor === null || valor === '') return '';
  if (typeof valor !== 'string') {
    throw new ValidationError(`${rotulo} deve ser um texto.`);
  }
  const texto = valor.trim();
  if (texto.length > max) {
    throw new ValidationError(`${rotulo} deve ter no máximo ${max} caracteres.`);
  }
  return texto;
}

// Aceita somente datas reais no formato YYYY-MM-DD
function dataISO(valor, rotulo) {
  if (typeof valor !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    throw new ValidationError(`${rotulo} deve estar no formato AAAA-MM-DD.`);
  }
  const d = new Date(`${valor}T00:00:00Z`);
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== valor) {
    throw new ValidationError(`${rotulo} não é uma data válida.`);
  }
  return valor;
}

function inteiroPositivo(valor, rotulo, padrao) {
  if (valor === undefined || valor === null || valor === '') return padrao;
  const n = Number(valor);
  if (!Number.isInteger(n) || n < 1 || n > 1000000) {
    throw new ValidationError(`${rotulo} deve ser um número inteiro maior que zero.`);
  }
  return n;
}

module.exports = { parseId, textoObrigatorio, textoOpcional, dataISO, inteiroPositivo };

const db = require('../db');

class PersonagemRepository {
  constructor() {
    this.stmtInserir = db.prepare(`
      INSERT INTO personagem (campanha_id, nome, tipo, jogador_nome, atributos)
      VALUES (@campanhaId, @nome, @tipo, @jogadorNome, @atributos)
    `);
    this.stmtBuscar = db.prepare('SELECT * FROM personagem WHERE id = ?');
    this.stmtListarPorCampanha = db.prepare(
      'SELECT * FROM personagem WHERE campanha_id = ? ORDER BY data_criacao DESC, id DESC'
    );
    this.stmtInserirItem = db.prepare(
      'INSERT INTO item (personagem_id, nome, quantidade) VALUES (?, ?, ?)'
    );
    this.stmtListarItens = db.prepare('SELECT * FROM item WHERE personagem_id = ? ORDER BY id');
  }

  salvar(personagem) {
    const info = this.stmtInserir.run(personagem);
    return this.buscarPorId(info.lastInsertRowid);
  }

  buscarPorId(id) {
    return this.stmtBuscar.get(id);
  }

  listarPorCampanha(campanhaId) {
    return this.stmtListarPorCampanha.all(campanhaId);
  }

  adicionarItem(personagemId, item) {
    this.stmtInserirItem.run(personagemId, item.nome, item.quantidade);
    return this.listarItens(personagemId);
  }

  listarItens(personagemId) {
    return this.stmtListarItens.all(personagemId);
  }
}

module.exports = new PersonagemRepository();

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
    this.stmtAtualizar = db.prepare(`
      UPDATE personagem
         SET nome = @nome, tipo = @tipo, jogador_nome = @jogadorNome, atributos = @atributos
       WHERE id = @id
    `);
    // Os itens da ficha são removidos junto (ON DELETE CASCADE no schema)
    this.stmtExcluir = db.prepare('DELETE FROM personagem WHERE id = ?');

    this.stmtInserirItem = db.prepare(
      'INSERT INTO item (personagem_id, nome, quantidade) VALUES (?, ?, ?)'
    );
    this.stmtListarItens = db.prepare('SELECT * FROM item WHERE personagem_id = ? ORDER BY id');
    this.stmtBuscarItem = db.prepare('SELECT * FROM item WHERE id = ?');
    this.stmtAtualizarItem = db.prepare(
      'UPDATE item SET nome = @nome, quantidade = @quantidade WHERE id = @id'
    );
    this.stmtExcluirItem = db.prepare('DELETE FROM item WHERE id = ?');
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

  atualizar(id, dados) {
    this.stmtAtualizar.run({ ...dados, id });
    return this.buscarPorId(id);
  }

  excluir(id) {
    return this.stmtExcluir.run(id).changes > 0;
  }

  adicionarItem(personagemId, item) {
    this.stmtInserirItem.run(personagemId, item.nome, item.quantidade);
    return this.listarItens(personagemId);
  }

  listarItens(personagemId) {
    return this.stmtListarItens.all(personagemId);
  }

  buscarItem(id) {
    return this.stmtBuscarItem.get(id);
  }

  atualizarItem(id, dados) {
    this.stmtAtualizarItem.run({ ...dados, id });
    return this.buscarItem(id);
  }

  excluirItem(id) {
    return this.stmtExcluirItem.run(id).changes > 0;
  }
}

module.exports = new PersonagemRepository();

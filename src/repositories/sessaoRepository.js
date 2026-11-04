const db = require('../db');

class SessaoRepository {
  constructor() {
    this.stmtInserir = db.prepare(`
      INSERT INTO sessao (campanha_id, data, participantes, resumo)
      VALUES (@campanhaId, @data, @participantes, @resumo)
    `);
    this.stmtBuscar = db.prepare('SELECT * FROM sessao WHERE id = ?');
    this.stmtListarPorCampanha = db.prepare(
      'SELECT * FROM sessao WHERE campanha_id = ? ORDER BY data DESC, id DESC'
    );
    this.stmtAtualizar = db.prepare(`
      UPDATE sessao
         SET data = @data, participantes = @participantes, resumo = @resumo
       WHERE id = @id
    `);
    this.stmtExcluir = db.prepare('DELETE FROM sessao WHERE id = ?');
  }

  salvar(sessao) {
    const info = this.stmtInserir.run(sessao);
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
}

module.exports = new SessaoRepository();

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
}

module.exports = new SessaoRepository();

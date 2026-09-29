const db = require('../db');

class CampanhaRepository {
  constructor() {
    // Statements preparados uma única vez e reaproveitados
    this.stmtInserir = db.prepare(`
      INSERT INTO campanha (nome, descricao, sistema_de_jogo, mestre_nome)
      VALUES (@nome, @descricao, @sistemaDeJogo, @mestreNome)
    `);
    this.stmtBuscar = db.prepare('SELECT * FROM campanha WHERE id = ?');
    this.stmtListar = db.prepare('SELECT * FROM campanha ORDER BY data_criacao DESC, id DESC');
  }

  salvar(campanha) {
    const info = this.stmtInserir.run(campanha);
    return this.buscarPorId(info.lastInsertRowid);
  }

  buscarPorId(id) {
    return this.stmtBuscar.get(id);
  }

  listarTodas() {
    return this.stmtListar.all();
  }
}

module.exports = new CampanhaRepository();

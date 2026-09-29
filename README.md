# Gerenciador de Campanhas RPG

Aplicação web para mestres de RPG organizarem campanhas, fichas de personagens
(PC/NPC), itens e sessões. Back-end em Node.js + Express, banco SQLite
(`better-sqlite3`) e front-end em HTML/CSS/JS puro.

## Requisitos
- Node.js 20 ou superior

## Como rodar
```bash
npm install
npm start
```
Abra http://localhost:3000. O banco é criado automaticamente em `data/rpg.db`.

Para desenvolvimento com reinício automático: `npm run dev`.

Variáveis opcionais: `PORT` (padrão 3000), `DATA_DIR` (pasta do banco),
`CORS_ORIGIN` (libera uma origem externa).

## Estrutura
```
server.js                 # ponto de entrada
src/
  db.js                   # conexão e schema SQLite
  errors.js               # ValidationError (400) / NotFoundError (404)
  routes.js
  controllers/            # camada HTTP
  services/               # regras de negócio e validações
  repositories/           # acesso ao banco
  middlewares/            # tratamento central de erros
  utils/validators.js
public/                   # front-end (index.html, style.css, app.js)
```

## API
| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/campanhas` | Cria campanha |
| GET | `/api/campanhas` | Lista campanhas |
| GET | `/api/campanhas/:id` | Busca campanha |
| POST | `/api/campanhas/:campanhaId/personagens` | Cria ficha |
| GET | `/api/campanhas/:campanhaId/personagens` | Lista fichas |
| POST | `/api/personagens/:id/itens` | Adiciona item |
| POST | `/api/campanhas/:campanhaId/sessoes` | Registra sessão |
| GET | `/api/campanhas/:campanhaId/sessoes` | Lista sessões |

Erros retornam JSON `{ "erro": "mensagem" }` com 400 (validação),
404 (não encontrado) ou 500 (erro interno).

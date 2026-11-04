# Gerenciador de Campanhas RPG

Aplicacao web para mestres de RPG organizarem campanhas, fichas de personagens
(PC/NPC), itens e sessÃµes. Back-end em Node.js + Express, banco SQLite
(`better-sqlite3`) e front-end em HTML/CSS/JS puro.

## Requisitos
- Node.js 20 ou superior

## Como rodar
```bash
npm install
npm start
```
Abra http://localhost:3000. O banco e criado automaticamente em `data/rpg.db`.

Para desenvolvimento com reini­cio automatico: `npm run dev`.

Variaveis opcionais: `PORT` (padrao 3000), `DATA_DIR` (pasta do banco),
`CORS_ORIGIN` (libera uma origem externa).

## Estrutura
```
server.js                 # ponto de entrada
src/
  db.js                   # conexao e schema SQLite
  errors.js               # ValidationError (400) / NotFoundError (404)
  routes.js
  controllers/            # camada HTTP
  services/               # regras de negÃ³cio e validaçoes
  repositories/           # acesso ao banco
  middlewares/            # tratamento central de erros
  utils/validators.js
public/                   # front-end (index.html, style.css, app.js)
```

## API
| MÃ©todo | Rota | DescriÃ§Ã£o |
|---|---|---|
| POST | `/api/campanhas` | Cria campanha |
| GET | `/api/campanhas` | Lista campanhas |
| GET | `/api/campanhas/:id` | Busca campanha |
| POST | `/api/campanhas/:campanhaId/personagens` | Cria ficha |
| GET | `/api/campanhas/:campanhaId/personagens` | Lista fichas |
| POST | `/api/personagens/:id/itens` | Adiciona item |
| POST | `/api/campanhas/:campanhaId/sessoes` | Registra sessao |
| GET | `/api/campanhas/:campanhaId/sessoes` | Lista sessoes |

Erros retornam JSON `{ "erro": "mensagem" }` com 400 (validacao),
404 (nao encontrado) ou 500 (erro interno).

Iteração 2 em desenvolvimento.

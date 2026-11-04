# Gerenciador de Campanhas RPG

Aplicação web para mestres de RPG organizarem campanhas, fichas de personagens
(PC/NPC), itens e sessões. Back-end em Node.js + Express, banco SQLite
(`better-sqlite3`) e front-end em HTML/CSS/JS puro.

## Funcionalidades (Iteração 2)
- Campanhas: criar, listar e abrir.
- Fichas de personagem (PC/NPC): criar, **editar** e **excluir**.
- Itens de cada ficha: adicionar, listar, **editar** e **excluir**.
- Sessões: registrar, **editar** e **excluir**.
- Toda exclusão pede confirmação. Excluir uma ficha exclui também os itens dela.

## Requisitos
- [Node.js](https://nodejs.org) 20 ou superior (inclui o `npm`)
- [Git](https://git-scm.com)

Confira as versões instaladas:
```bash
node --version   # deve ser v20.x ou maior
git --version
```

## Como executar no seu computador

1. Clone o repositório e entre na pasta do projeto:
   ```bash
   git clone https://github.com/un1ty-32/gerenciamento_RPG.git
   cd gerenciamento_RPG
   ```
2. (Opcional) Use exatamente o código entregue na Iteração 2:
   ```bash
   git checkout v2
   ```
3. Instale as dependências:
   ```bash
   npm install
   ```
4. Inicie o servidor:
   ```bash
   npm start
   ```
5. Abra no navegador: http://localhost:3000

O banco SQLite é criado automaticamente em `data/rpg.db` na primeira execução
(a pasta `data/` não é versionada). Para começar do zero, pare o servidor e
apague a pasta `data/`.

Para desenvolvimento com reinício automático: `npm run dev`.

Variáveis de ambiente opcionais: `PORT` (padrão 3000), `DATA_DIR` (pasta do
banco), `CORS_ORIGIN` (libera uma origem externa).

### Problemas comuns
- **Porta em uso:** inicie em outra porta. No Linux/macOS: `PORT=3001 npm start`.
  No PowerShell (Windows): `$env:PORT=3001; npm start`.
- **Erro ao instalar `better-sqlite3`:** confirme que o Node é a versão 20 ou
  superior. Se o `npm install` precisar compilar o módulo, instale as
  ferramentas de build do seu sistema (no Windows, as "Build Tools" do Visual
  Studio; no macOS, `xcode-select --install`).

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
| PUT | `/api/personagens/:id` | Edita ficha |
| DELETE | `/api/personagens/:id` | Exclui ficha (e seus itens) |
| POST | `/api/personagens/:id/itens` | Adiciona item |
| GET | `/api/personagens/:id/itens` | Lista itens da ficha |
| PUT | `/api/itens/:id` | Edita item |
| DELETE | `/api/itens/:id` | Exclui item |
| POST | `/api/campanhas/:campanhaId/sessoes` | Registra sessão |
| GET | `/api/campanhas/:campanhaId/sessoes` | Lista sessões |
| PUT | `/api/sessoes/:id` | Edita sessão |
| DELETE | `/api/sessoes/:id` | Exclui sessão |

Corpos esperados:
- Ficha (`POST`/`PUT`): `{ "nome": "...", "tipo": "PC" | "NPC", "jogadorNome": "..." }`.
  Se `atributos` não for enviado no `PUT`, os atributos atuais são mantidos.
- Item (`POST`/`PUT`): `{ "nome": "...", "quantidade": 1 }`
- Sessão (`POST`/`PUT`): `{ "data": "AAAA-MM-DD", "participantes": "...", "resumo": "..." }`

Os `DELETE` respondem `204` sem corpo. Erros retornam JSON
`{ "erro": "mensagem" }` com 400 (validação), 404 (não encontrado) ou 500
(erro interno).

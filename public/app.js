const API = '/api';
let campanhaAtualId = null;
let toastTimer = null;

// Registros carregados na tela (para preencher os formulários de edição)
let personagensPorId = new Map();
let itensPorId = new Map();
let sessoesPorId = new Map();

// Qual registro está sendo editado nos modais (null = criando um novo)
const edicao = { personagemId: null, itemId: null, itemPersonagemId: null, sessaoId: null };

// ---------- Helpers ----------
async function requisitar(url, opcoes) {
  let res;
  try {
    res = await fetch(API + url, opcoes);
  } catch {
    throw new Error('Não foi possível conectar ao servidor.');
  }
  // Nem toda resposta vem em JSON (ex.: 204 do DELETE ou falha de proxy), então não assumimos
  const corpo = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error((corpo && corpo.erro) || `Erro na requisição (${res.status}).`);
  }
  return corpo;
}

const comCorpo = (metodo) => (url, body) =>
  requisitar(url, {
    method: metodo,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

const apiGet = (url) => requisitar(url);
const apiPost = comCorpo('POST');
const apiPut = comCorpo('PUT');
const apiDelete = (url) => requisitar(url, { method: 'DELETE' });

function toast(msg, erro = false) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.toggle('erro', erro);
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.hidden = true; }, 4000);
}

// Executa uma ação assíncrona e mostra o erro ao usuário em vez de falhar em silêncio
async function executar(acao) {
  try {
    await acao();
  } catch (err) {
    toast(err.message, true);
  }
}

function mostrarTela(id) {
  document.querySelectorAll('.tela').forEach(t => { t.hidden = true; });
  document.getElementById(id).hidden = false;
}

// Também escapa aspas, pois o resultado é usado em atributos (aria-label)
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function formatarData(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
  return m ? `${m[3]}/${m[2]}/${m[1]}` : String(iso ?? '');
}

// Pergunta ao usuário antes de excluir. Resolve true só se ele clicar em "Excluir".
function confirmar(mensagem) {
  return new Promise((resolve) => {
    const modal = document.getElementById('modal-confirmar');
    const ok = document.getElementById('confirmar-ok');
    const cancelar = document.getElementById('confirmar-cancelar');
    let resultado = false;

    document.getElementById('confirmar-mensagem').textContent = mensagem;

    const aoFechar = () => {
      modal.removeEventListener('close', aoFechar);
      resolve(resultado); // também cobre o fechamento com a tecla Esc
    };
    modal.addEventListener('close', aoFechar);
    ok.onclick = () => { resultado = true; modal.close(); };
    cancelar.onclick = () => modal.close();
    modal.showModal();
  });
}

// Abre um modal de formulário limpo (criar) ou preenchido (editar)
function abrirModalForm(modalId, { titulo, botao, valores = {} }) {
  const modal = document.getElementById(modalId);
  const form = modal.querySelector('form');
  form.reset();
  Object.entries(valores).forEach(([campo, valor]) => {
    if (form.elements[campo]) form.elements[campo].value = valor ?? '';
  });
  modal.querySelector('[data-titulo]').textContent = titulo;
  modal.querySelector('[data-botao]').textContent = botao;
  modal.showModal();
}

// ---------- Lista de campanhas ----------
async function carregarCampanhas() {
  const campanhas = await apiGet('/campanhas');
  const container = document.getElementById('lista-campanhas');
  container.innerHTML = '';
  if (campanhas.length === 0) {
    container.innerHTML = '<p class="vazio">Nenhuma campanha ainda. Crie a primeira!</p>';
    return;
  }
  campanhas.forEach(c => {
    const card = document.createElement('div');
    card.className = 'card-campanha';
    card.setAttribute('role', 'button');
    card.tabIndex = 0; // acessível por teclado
    card.innerHTML = `
      <h3>${escapeHtml(c.nome)}</h3>
      ${c.sistema_de_jogo ? `<span class="chip">${escapeHtml(c.sistema_de_jogo)}</span>` : ''}
      <p class="muted">Mestre: ${escapeHtml(c.mestre_nome)}</p>
    `;
    const abrir = () => executar(() => abrirCampanha(c.id));
    card.addEventListener('click', abrir);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        abrir();
      }
    });
    container.appendChild(card);
  });
}

async function abrirCampanha(id) {
  // Só troca de tela depois que a campanha carregou com sucesso
  const c = await apiGet(`/campanhas/${id}`);
  campanhaAtualId = id;
  document.getElementById('detalhe-nome').textContent = c.nome;
  document.getElementById('detalhe-info').textContent =
    `Mestre: ${c.mestre_nome}${c.sistema_de_jogo ? ' · Sistema: ' + c.sistema_de_jogo : ''}`;
  document.getElementById('detalhe-descricao').textContent = c.descricao || '';
  mostrarTela('tela-detalhe');
  await Promise.all([carregarPersonagens(), carregarSessoes()]);
}

// ---------- Personagens (fichas) e itens ----------
function htmlItem(item, personagemId) {
  const nome = escapeHtml(item.nome);
  return `
    <li class="linha-item">
      <span>${nome} <span class="muted">×${item.quantidade}</span></span>
      <span class="acoes">
        <button type="button" class="btn-sec btn-sm" data-acao="editar-item"
          data-id="${item.id}" data-personagem="${personagemId}"
          aria-label="Editar item ${nome}">Editar</button>
        <button type="button" class="btn-sec btn-sm btn-perigo-sec" data-acao="excluir-item"
          data-id="${item.id}" aria-label="Excluir item ${nome}">Excluir</button>
      </span>
    </li>`;
}

async function carregarPersonagens() {
  const personagens = await apiGet(`/campanhas/${campanhaAtualId}/personagens`);
  const listasDeItens = await Promise.all(
    personagens.map(p => apiGet(`/personagens/${p.id}/itens`))
  );

  personagensPorId = new Map(personagens.map(p => [p.id, p]));
  itensPorId = new Map(listasDeItens.flat().map(i => [i.id, i]));

  const container = document.getElementById('lista-personagens');
  container.innerHTML = '';
  if (personagens.length === 0) {
    container.innerHTML = '<p class="vazio">Nenhuma ficha criada ainda.</p>';
    return;
  }
  personagens.forEach((p, indice) => {
    const itens = listasDeItens[indice];
    const nome = escapeHtml(p.nome);
    const div = document.createElement('div');
    div.className = 'item-card';
    div.innerHTML = `
      <div class="card-topo">
        <div>
          <b>${nome} <span class="muted">(${escapeHtml(p.tipo)})</span></b>
          ${p.jogador_nome ? `Jogador: ${escapeHtml(p.jogador_nome)}` : ''}
        </div>
        <div class="acoes">
          <button type="button" class="btn-sec btn-sm" data-acao="editar-ficha"
            data-id="${p.id}" aria-label="Editar ficha ${nome}">Editar</button>
          <button type="button" class="btn-sec btn-sm btn-perigo-sec" data-acao="excluir-ficha"
            data-id="${p.id}" aria-label="Excluir ficha ${nome}">Excluir</button>
        </div>
      </div>
      <div class="itens">
        <div class="itens-header">
          <span class="muted">Itens</span>
          <button type="button" class="btn btn-sm" data-acao="novo-item"
            data-id="${p.id}" aria-label="Adicionar item a ${nome}">+ Item</button>
        </div>
        ${itens.length === 0
          ? '<p class="vazio vazio-item">Nenhum item.</p>'
          : `<ul class="lista-itens">${itens.map(i => htmlItem(i, p.id)).join('')}</ul>`}
      </div>`;
    container.appendChild(div);
  });
}

function abrirFormFicha(personagem) {
  edicao.personagemId = personagem ? personagem.id : null;
  abrirModalForm('modal-personagem', personagem
    ? {
      titulo: 'Editar Ficha',
      botao: 'Salvar alterações',
      valores: { nome: personagem.nome, tipo: personagem.tipo, jogadorNome: personagem.jogador_nome },
    }
    : { titulo: 'Nova Ficha de Personagem', botao: 'Salvar ficha' });
}

function abrirFormItem(personagemId, item) {
  edicao.itemPersonagemId = personagemId;
  edicao.itemId = item ? item.id : null;
  abrirModalForm('modal-item', item
    ? {
      titulo: 'Editar Item',
      botao: 'Salvar alterações',
      valores: { nome: item.nome, quantidade: item.quantidade },
    }
    : { titulo: 'Novo Item', botao: 'Adicionar item' });
}

document.getElementById('lista-personagens').addEventListener('click', (e) => {
  const botao = e.target.closest('[data-acao]');
  if (!botao) return;
  const id = Number(botao.dataset.id);

  executar(async () => {
    switch (botao.dataset.acao) {
      case 'editar-ficha':
        abrirFormFicha(personagensPorId.get(id));
        break;
      case 'excluir-ficha': {
        const p = personagensPorId.get(id);
        if (await confirmar(`Excluir a ficha "${p.nome}"? Os itens dela também serão excluídos.`)) {
          await apiDelete(`/personagens/${id}`);
          await carregarPersonagens();
          toast('Ficha excluída.');
        }
        break;
      }
      case 'novo-item':
        abrirFormItem(id, null);
        break;
      case 'editar-item':
        abrirFormItem(Number(botao.dataset.personagem), itensPorId.get(id));
        break;
      case 'excluir-item': {
        const item = itensPorId.get(id);
        if (await confirmar(`Excluir o item "${item.nome}"?`)) {
          await apiDelete(`/itens/${id}`);
          await carregarPersonagens();
          toast('Item excluído.');
        }
        break;
      }
      default:
    }
  });
});

// ---------- Sessões ----------
async function carregarSessoes() {
  const sessoes = await apiGet(`/campanhas/${campanhaAtualId}/sessoes`);
  sessoesPorId = new Map(sessoes.map(s => [s.id, s]));

  const container = document.getElementById('lista-sessoes');
  container.innerHTML = '';
  if (sessoes.length === 0) {
    container.innerHTML = '<p class="vazio">Nenhuma sessão registrada ainda.</p>';
    return;
  }
  sessoes.forEach(s => {
    const data = escapeHtml(formatarData(s.data));
    const div = document.createElement('div');
    div.className = 'item-card';
    div.innerHTML = `
      <div class="card-topo">
        <div>
          <b>${data}</b>
          ${s.participantes ? `Participantes: ${escapeHtml(s.participantes)}<br>` : ''}
          ${escapeHtml(s.resumo || '')}
        </div>
        <div class="acoes">
          <button type="button" class="btn-sec btn-sm" data-acao="editar-sessao"
            data-id="${s.id}" aria-label="Editar sessão de ${data}">Editar</button>
          <button type="button" class="btn-sec btn-sm btn-perigo-sec" data-acao="excluir-sessao"
            data-id="${s.id}" aria-label="Excluir sessão de ${data}">Excluir</button>
        </div>
      </div>`;
    container.appendChild(div);
  });
}

function abrirFormSessao(sessao) {
  edicao.sessaoId = sessao ? sessao.id : null;
  abrirModalForm('modal-sessao', sessao
    ? {
      titulo: 'Editar Sessão',
      botao: 'Salvar alterações',
      valores: { data: sessao.data, participantes: sessao.participantes, resumo: sessao.resumo },
    }
    : { titulo: 'Registrar Sessão', botao: 'Registrar sessão' });
}

document.getElementById('lista-sessoes').addEventListener('click', (e) => {
  const botao = e.target.closest('[data-acao]');
  if (!botao) return;
  const id = Number(botao.dataset.id);

  executar(async () => {
    if (botao.dataset.acao === 'editar-sessao') {
      abrirFormSessao(sessoesPorId.get(id));
    } else if (botao.dataset.acao === 'excluir-sessao') {
      const s = sessoesPorId.get(id);
      if (await confirmar(`Excluir a sessão de ${formatarData(s.data)}?`)) {
        await apiDelete(`/sessoes/${id}`);
        await carregarSessoes();
        toast('Sessão excluída.');
      }
    }
  });
});

// ---------- Formulários / modais ----------
// Mantém o modal aberto quando a API retorna erro e mostra a mensagem dentro dele.
// `mensagemSucesso` pode ser um texto ou uma função (para variar entre criar e editar).
function ligarFormulario(formId, modalId, enviar, mensagemSucesso) {
  const form = document.getElementById(formId);
  const modal = document.getElementById(modalId);
  const erroEl = form.querySelector('.erro-form');

  modal.addEventListener('close', () => { erroEl.hidden = true; });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const dados = Object.fromEntries(new FormData(form).entries());
    const botao = form.querySelector('[type="submit"]');
    botao.disabled = true;
    erroEl.hidden = true;
    try {
      await enviar(dados);
      form.reset();
      modal.close();
      toast(typeof mensagemSucesso === 'function' ? mensagemSucesso() : mensagemSucesso);
    } catch (err) {
      erroEl.textContent = err.message;
      erroEl.hidden = false;
    } finally {
      botao.disabled = false;
    }
  });
}

document.getElementById('btn-nova-campanha').addEventListener('click', () => {
  document.getElementById('modal-campanha').showModal();
});
document.getElementById('btn-voltar').addEventListener('click', () => {
  mostrarTela('tela-lista');
  executar(carregarCampanhas);
});
document.getElementById('btn-novo-personagem').addEventListener('click', () => abrirFormFicha(null));
document.getElementById('btn-nova-sessao').addEventListener('click', () => abrirFormSessao(null));

document.querySelectorAll('[data-close]').forEach(btn => {
  btn.addEventListener('click', (e) => e.target.closest('dialog').close());
});

ligarFormulario('form-campanha', 'modal-campanha', async (dados) => {
  await apiPost('/campanhas', dados);
  await carregarCampanhas();
}, 'Campanha criada com sucesso!');

ligarFormulario('form-personagem', 'modal-personagem', async (dados) => {
  if (edicao.personagemId) {
    await apiPut(`/personagens/${edicao.personagemId}`, dados);
  } else {
    await apiPost(`/campanhas/${campanhaAtualId}/personagens`, dados);
  }
  await carregarPersonagens();
}, () => (edicao.personagemId ? 'Ficha atualizada com sucesso!' : 'Ficha criada com sucesso!'));

ligarFormulario('form-item', 'modal-item', async (dados) => {
  if (edicao.itemId) {
    await apiPut(`/itens/${edicao.itemId}`, dados);
  } else {
    await apiPost(`/personagens/${edicao.itemPersonagemId}/itens`, dados);
  }
  await carregarPersonagens();
}, () => (edicao.itemId ? 'Item atualizado com sucesso!' : 'Item adicionado com sucesso!'));

ligarFormulario('form-sessao', 'modal-sessao', async (dados) => {
  if (edicao.sessaoId) {
    await apiPut(`/sessoes/${edicao.sessaoId}`, dados);
  } else {
    await apiPost(`/campanhas/${campanhaAtualId}/sessoes`, dados);
  }
  await carregarSessoes();
}, () => (edicao.sessaoId ? 'Sessão atualizada com sucesso!' : 'Sessão registrada com sucesso!'));

// ---------- Início ----------
executar(carregarCampanhas);

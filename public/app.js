const API = '/api';
let campanhaAtualId = null;
let toastTimer = null;

// ---------- Helpers ----------
async function requisitar(url, opcoes) {
  let res;
  try {
    res = await fetch(API + url, opcoes);
  } catch {
    throw new Error('Não foi possível conectar ao servidor.');
  }
  // Nem toda resposta de erro vem em JSON (ex.: falha de proxy), então não assumimos
  const corpo = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error((corpo && corpo.erro) || `Erro na requisição (${res.status}).`);
  }
  return corpo;
}

const apiGet = (url) => requisitar(url);
const apiPost = (url, body) =>
  requisitar(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

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

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

function formatarData(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
  return m ? `${m[3]}/${m[2]}/${m[1]}` : String(iso ?? '');
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

// ---------- Personagens ----------
async function carregarPersonagens() {
  const personagens = await apiGet(`/campanhas/${campanhaAtualId}/personagens`);
  const container = document.getElementById('lista-personagens');
  container.innerHTML = '';
  if (personagens.length === 0) {
    container.innerHTML = '<p class="vazio">Nenhuma ficha criada ainda.</p>';
    return;
  }
  personagens.forEach(p => {
    const div = document.createElement('div');
    div.className = 'item-card';
    div.innerHTML = `<b>${escapeHtml(p.nome)} <span class="muted">(${escapeHtml(p.tipo)})</span></b>
      ${p.jogador_nome ? `Jogador: ${escapeHtml(p.jogador_nome)}` : ''}`;
    container.appendChild(div);
  });
}

// ---------- Sessões ----------
async function carregarSessoes() {
  const sessoes = await apiGet(`/campanhas/${campanhaAtualId}/sessoes`);
  const container = document.getElementById('lista-sessoes');
  container.innerHTML = '';
  if (sessoes.length === 0) {
    container.innerHTML = '<p class="vazio">Nenhuma sessão registrada ainda.</p>';
    return;
  }
  sessoes.forEach(s => {
    const div = document.createElement('div');
    div.className = 'item-card';
    div.innerHTML = `<b>${escapeHtml(formatarData(s.data))}</b>
      ${s.participantes ? `Participantes: ${escapeHtml(s.participantes)}<br>` : ''}
      ${escapeHtml(s.resumo || '')}`;
    container.appendChild(div);
  });
}

// ---------- Formulários / modais ----------
// Mantém o modal aberto quando a API retorna erro e mostra a mensagem dentro dele
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
      toast(mensagemSucesso);
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
document.getElementById('btn-novo-personagem').addEventListener('click', () => {
  document.getElementById('modal-personagem').showModal();
});
document.getElementById('btn-nova-sessao').addEventListener('click', () => {
  document.getElementById('modal-sessao').showModal();
});

document.querySelectorAll('[data-close]').forEach(btn => {
  btn.addEventListener('click', (e) => e.target.closest('dialog').close());
});

ligarFormulario('form-campanha', 'modal-campanha', async (dados) => {
  await apiPost('/campanhas', dados);
  await carregarCampanhas();
}, 'Campanha criada com sucesso!');

ligarFormulario('form-personagem', 'modal-personagem', async (dados) => {
  await apiPost(`/campanhas/${campanhaAtualId}/personagens`, dados);
  await carregarPersonagens();
}, 'Ficha criada com sucesso!');

ligarFormulario('form-sessao', 'modal-sessao', async (dados) => {
  await apiPost(`/campanhas/${campanhaAtualId}/sessoes`, dados);
  await carregarSessoes();
}, 'Sessão registrada com sucesso!');

// ---------- Início ----------
executar(carregarCampanhas);

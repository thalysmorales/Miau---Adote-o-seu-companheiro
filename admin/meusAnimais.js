const API_URL = "https://miau-adote-o-seu-companheiro.onrender.com";

// se as cores ficarem invertidas, troque os valores destas duas linhas
const CLASSE_DISPONIVEL = "botaoMA3";
const CLASSE_ADOTADO = "botaoMA4";

const lista = document.getElementById("listaMeusAnimais");
const mensagemLista = document.getElementById("mensagemLista");

function mostrarMensagem(texto) {
  mensagemLista.textContent = texto;
  mensagemLista.hidden = false;
}

// evita que texto vindo do banco quebre o HTML
function escapar(texto) {
  return String(texto ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function tempoDesde(dataTexto) {
  const data = new Date(dataTexto);
  if (isNaN(data)) return "";

  const minutos = Math.floor((Date.now() - data.getTime()) / 60000);
  if (minutos < 1) return "Cadastrado agora";
  if (minutos < 60) return `Cadastrado há ${minutos} min`;

  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `Cadastrado há ${horas} ${horas === 1 ? "hora" : "horas"}`;

  const dias = Math.floor(horas / 24);
  return `Cadastrado há ${dias} ${dias === 1 ? "dia" : "dias"}`;
}

function textoDoBotao(adotado) {
  return adotado ? "Clique para marcar como disponível" : "Clique para marcar como adotado";
}

function criarCard(a) {
  const adotado = Boolean(a.adotado);
  return `
    <div class="card cardMA" style="width: 16rem;" data-id="${escapar(a.id)}">
      <img src="${escapar(a.foto_url)}" class="card-img-top" alt="Foto de ${escapar(a.nome)}">
      <div class="card-body card-bodyMA">
        <h5 class="card-title">${escapar(a.nome)}</h5>
        <p class="card-text">${escapar(tempoDesde(a.criado_em))}</p>
        <div class="botaoMA">
          <a href="novoCadastro.html?editar=${encodeURIComponent(a.id)}"><button type="button">Editar</button></a>
          <button type="button"
                  class="botao-adotado ${adotado ? CLASSE_ADOTADO : CLASSE_DISPONIVEL}"
                  data-adotado="${adotado ? 1 : 0}"
                  title="${textoDoBotao(adotado)}">Adotado</button>
        </div>
      </div>
    </div>
  `;
}

async function carregarAnimais() {
  try {
    const resposta = await fetch(`${API_URL}/animais?todos=1`);
    if (!resposta.ok) {
      throw new Error("A API respondeu com erro " + resposta.status);
    }
    const animais = await resposta.json();

    if (animais.length === 0) {
      lista.innerHTML = "";
      mostrarMensagem("Nenhum animal cadastrado ainda.");
      return;
    }

    mensagemLista.hidden = true;
    lista.innerHTML = animais.map(criarCard).join("");
  } catch (erro) {
    console.error("Erro ao carregar animais:", erro);
    mostrarMensagem("Não foi possível carregar os animais. Tente novamente mais tarde.");
  }
}

// clique no botão "Adotado" de qualquer card
lista.addEventListener("click", async (evento) => {
  const botao = evento.target.closest(".botao-adotado");
  if (!botao) return;

  const id = botao.closest(".card").dataset.id;
  const novoValor = botao.dataset.adotado !== "1";

  botao.disabled = true;
  try {
    const resposta = await fetch(`${API_URL}/animais/${encodeURIComponent(id)}/adotado`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adotado: novoValor }),
    });
    if (!resposta.ok) {
      throw new Error("A API respondeu com erro " + resposta.status);
    }

    botao.dataset.adotado = novoValor ? "1" : "0";
    botao.classList.toggle(CLASSE_ADOTADO, novoValor);
    botao.classList.toggle(CLASSE_DISPONIVEL, !novoValor);
    botao.title = textoDoBotao(novoValor);
    mensagemLista.hidden = true;
  } catch (erro) {
    console.error("Erro ao atualizar o animal:", erro);
    mostrarMensagem("Não foi possível atualizar o animal. Tente novamente.");
  } finally {
    botao.disabled = false;
  }
});

carregarAnimais();
const API_URL = "http://localhost:3000"

const botaoMenu = document.querySelector(".botaoFiltro")
const caixa = document.querySelector(".filtro-fechada")
const limparFiltros = document.querySelector("#limparFiltros")
const semResultado = document.querySelector("#semResultado")
const listaAnimais = document.querySelector("#listaAnimais")

const filtro = {}
const botaoFiltro = document.querySelectorAll("button[data-valor]")
const botaoTodos = document.querySelector('button[data-tipo="todos"]')

// os cards agora são criados a partir do banco, então a lista começa vazia
let cards = []

// ---------- utilidades ----------

// "Médio" -> "medio", "Fêmea" -> "femea" (mesmo formato dos botões de filtro)
function normalizar(texto) {
  return String(texto ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
}

// evita que texto vindo do banco quebre o HTML
function escapar(texto) {
  return String(texto ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

// ---------- cards vindos da API ----------

function criarCard(a) {
  return `
    <div class="card" style="width: 16rem;"
         data-especie="${escapar(normalizar(a.especie))}"
         data-idade="${escapar(normalizar(a.idade))}"
         data-porte="${escapar(normalizar(a.porte))}"
         data-genero="${escapar(normalizar(a.genero))}">
      <img src="${escapar(a.foto_url)}" class="card-img-top" alt="Fotografia de ${escapar(a.nome)}, animal para adoção">
      <div class="card-body">
        <h5 class="card-title">${escapar(a.nome)}</h5>
        <p class="card-text">${escapar(a.genero)} - ${escapar(a.porte)} </p>
        <div class="botao">
          <a href="tenhoInteresse.html?id=${encodeURIComponent(a.id)}" class="btn btn-primary">Tenho Interesse</a>
        </div>
      </div>
    </div>
  `
}

async function carregarAnimais() {
  try {
    const resposta = await fetch(`${API_URL}/animais`)
    if (!resposta.ok) {
      throw new Error("A API respondeu com erro " + resposta.status)
    }
    const animais = await resposta.json()

    listaAnimais.innerHTML = animais.map(criarCard).join("")
    cards = document.querySelectorAll(".divCards .card")
    atualizarCards()
  } catch (erro) {
    console.error("Erro ao carregar animais:", erro)
    semResultado.textContent = "Não foi possível carregar os pets. Tente novamente mais tarde."
    semResultado.hidden = false
  }
}

// ---------- filtros (lógica original) ----------

botaoMenu.addEventListener("click", () => {
  caixa.classList.toggle("filtro-aberta")
  botaoMenu.classList.toggle("botaoFiltro-fechada")
})

limparFiltros.addEventListener("click", () => {
  caixa.classList.remove("filtro-aberta")
  botaoMenu.classList.remove("botaoFiltro-fechada")
  limpar()
})

function atualizarCards() {
  let visiveis = 0
  cards.forEach((card) => {
    const combina = Object.entries(filtro).every(([tipo, valor]) => {
      return card.dataset[tipo] === valor
    })
    card.hidden = !combina

    if (combina === true) {
      visiveis++
    }
  })
  semResultado.hidden = visiveis > 0
}

function atualizarBotoes() {
  botaoFiltro.forEach((botao) => {
    const ativo = filtro[botao.dataset.tipo] === botao.dataset.valor
    botao.classList.toggle("botao-ativo", ativo)
  })
  botaoTodos.classList.toggle("botao-ativo", Object.keys(filtro).length === 0)
}

botaoFiltro.forEach((botao) => {
  botao.addEventListener("click", () => {
    if (filtro[botao.dataset.tipo] === botao.dataset.valor) {
      delete filtro[botao.dataset.tipo]
    } else {
      filtro[botao.dataset.tipo] = botao.dataset.valor
    }
    atualizarCards()
    atualizarBotoes()
  })
})

function limpar() {
  Object.keys(filtro).forEach((chave) => {
    delete filtro[chave]
  })
  atualizarCards()
  atualizarBotoes()
}

botaoTodos.addEventListener("click", () => {
  caixa.classList.remove("filtro-aberta")
  botaoMenu.classList.remove("botaoFiltro-fechada")
  limpar()
})

atualizarBotoes()
carregarAnimais()
const botaoMenu = document.querySelector(".botaoFiltro")
const caixa = document.querySelector(".filtro-fechada")
const limparFiltros = document.querySelector("#limparFiltros")
const semResultado = document.querySelector("#semResultado")

botaoMenu.addEventListener("click", () =>{
  caixa.classList.toggle("filtro-aberta")
  botaoMenu.classList.toggle("botaoFiltro-fechada")
})

limparFiltros.addEventListener("click", () =>{
  caixa.classList.remove("filtro-aberta")
  botaoMenu.classList.remove("botaoFiltro-fechada")
  limpar()
})

const cards = document.querySelectorAll(".divCards .card")

function atualizarCards() {
  let visiveis = 0
  cards.forEach((card) => {
    const combina = Object.entries(filtro).every(([tipo, valor]) => {
      return card.dataset[tipo] === valor
    })
    card.hidden =! combina
    
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

const filtro = {}
const botaoFiltro = document.querySelectorAll("button[data-valor]")

botaoFiltro.forEach((botao) => {
  botao.addEventListener("click", () => {
    if (filtro[botao.dataset.tipo] === botao.dataset.valor) {
      delete filtro[botao.dataset.tipo]
    }
    else {
      filtro[botao.dataset.tipo] = botao.dataset.valor
    }
    atualizarCards()
    atualizarBotoes()
  })
})

const botaoTodos = document.querySelector('button[data-tipo="todos"]')

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
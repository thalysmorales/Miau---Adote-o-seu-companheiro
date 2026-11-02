const API_URL = "http://localhost:3000"

// Ícones com a primeira letra do título (código original do grupo)
document.querySelectorAll(".titulo-com-icone").forEach((el) => {
  const texto = el.textContent.trim()
  const primeiraLetra = texto.charAt(0)
  el.innerHTML = `<span class="icon-letra">${primeiraLetra}</span>${texto}`
})

const caixas = document.querySelectorAll(".box-informacao, .box-informacao-ptd")
const erroPet = document.querySelector("#erroPet")

// escreve um texto em um elemento (textContent não interpreta HTML, então é seguro)
function escrever(id, valor) {
  document.getElementById(id).textContent = valor ?? ""
}

function mostrarErro(mensagem) {
  caixas.forEach((caixa) => {
    caixa.hidden = true
  })
  erroPet.textContent = mensagem
  erroPet.hidden = false
}

function preencherPagina(a) {
  document.title = `${a.nome} | MiAu`

  const foto = document.getElementById("fotoPet")
  if (a.foto_url) {
    foto.src = a.foto_url
  }
  foto.alt = `Foto de ${a.nome}`

  escrever("nomePet", a.nome)
  escrever("racaPet", a.raca)
  escrever("especiePet", a.especie)
  escrever("idadePet", a.idade)
  escrever("portePet", a.porte)
  escrever("generoPet", a.genero)
  escrever("descricaoPet", a.descricao || "Ainda não temos uma descrição para este pet.")
  escrever("nomeAdotar", a.nome)

  // o MySQL devolve 1 ou 0 para as colunas booleanas
  escrever("vacinadoPet", a.vacinado ? "Vacinado" : "Não vacinado")
  escrever("castradoPet", a.castrado ? "Castrado" : "Não castrado")
  escrever("vermifugadoPet", a.vermifugado ? "Vermifugado" : "Não vermifugado")
}

async function carregarPet() {
  // o id vem da URL: tenhoInteresse.html?id=3
  const id = new URLSearchParams(window.location.search).get("id")

  if (!id) {
    mostrarErro("Nenhum pet foi selecionado. Volte para a página Encontrar Pet e escolha um animal.")
    return
  }

  try {
    const resposta = await fetch(`${API_URL}/animais/${encodeURIComponent(id)}`)

    if (resposta.status === 404) {
      mostrarErro("Não encontramos esse pet. Volte para a página Encontrar Pet e escolha outro.")
      return
    }
    if (!resposta.ok) {
      throw new Error("A API respondeu com erro " + resposta.status)
    }

    const animal = await resposta.json()
    preencherPagina(animal)
  } catch (erro) {
    console.error("Erro ao carregar o pet:", erro)
    mostrarErro("Não foi possível carregar as informações do pet. Tente novamente mais tarde.")
  }
}

carregarPet()
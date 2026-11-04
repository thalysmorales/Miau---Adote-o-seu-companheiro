const API_URL = "https://miau-adote-o-seu-companheiro.onrender.com"

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

function montarCarrossel(a) {
  const carrossel = document.getElementById("carrosselPet")
  const slides = document.getElementById("carrosselFotos")
  const indicadores = document.getElementById("carrosselIndicadores")

  // só usa as fotos que estão preenchidas no banco
  const fotos = [a.foto_url, a.foto_url2, a.foto_url3, a.foto_url4].filter(Boolean)

  slides.innerHTML = ""
  indicadores.innerHTML = ""

  fotos.forEach((url, i) => {
    const item = document.createElement("div")
    item.className = "carousel-item" + (i === 0 ? " active" : "")

    const img = document.createElement("img")
    img.className = "foto-principal d-block w-100"
    img.src = url
    img.alt = `Foto ${i + 1} de ${a.nome}`

    item.appendChild(img)
    slides.appendChild(item)

    const bolinha = document.createElement("button")
    bolinha.type = "button"
    bolinha.setAttribute("data-bs-target", "#carrosselPet")
    bolinha.setAttribute("data-bs-slide-to", i)
    bolinha.setAttribute("aria-label", `Foto ${i + 1}`)
    if (i === 0) {
      bolinha.className = "active"
      bolinha.setAttribute("aria-current", "true")
    }
    indicadores.appendChild(bolinha)
  })

  // com apenas uma foto, esconde as setas e as bolinhas
  if (fotos.length <= 1) {
    carrossel
      .querySelectorAll(".carousel-control-prev, .carousel-control-next, .carousel-indicators")
      .forEach((el) => {
        el.hidden = true
      })
  }
}

function preencherPagina(a) {
  document.title = `${a.nome} | MiAu`

  montarCarrossel(a)

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
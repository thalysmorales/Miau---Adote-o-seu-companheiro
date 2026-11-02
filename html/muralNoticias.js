let categoriaAtual = []
const botoesCategorias = document.querySelectorAll("button[data-categoria]")
const totalCategorias = botoesCategorias.length - 1
const semResultado = document.querySelector("#semResultado")

botoesCategorias.forEach((botao) => {
        botao.addEventListener("click", () => {
            const categoria = botao.dataset.categoria
            if (categoria === "todos") {
                categoriaAtual = []
            } else if (categoriaAtual.includes(categoria)){
                categoriaAtual = categoriaAtual.filter((c) => c !== categoria)
            } else {
                categoriaAtual.push(categoria)
            }
            if (categoriaAtual.length === totalCategorias) {
                categoriaAtual = []
            }
            atualizarNoticias()
            atualizarBotoes()
        })
        
})

const noticias = document.querySelectorAll(".mural-noticia")

function atualizarNoticias() {
    let visiveis = 0

    noticias.forEach((noticia) => {
        const combina = categoriaAtual.length === 0 || categoriaAtual.includes(noticia.dataset.categoria)
        noticia.hidden = !combina

        if (combina) {
            visiveis ++
        }
    })
    semResultado.hidden = visiveis > 0
}

function atualizarBotoes() {
    botoesCategorias.forEach((botao) => {
        const categoria = botao.dataset.categoria

        const ativo = categoria === "todos"
            ? categoriaAtual.length === 0 
            : categoriaAtual.includes(categoria)
        
        botao.classList.toggle("mural-filtro--ativo", ativo)
    })

}



atualizarBotoes()
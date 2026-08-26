const imagemPrincipal = document.getElementById('imagemPrincipal');
const thumbs = document.querySelectorAll('.thumb');
const btnAnterior = document.getElementById('btnAnterior');
const btnProximo = document.getElementById('btnProximo');

let indiceAtual = 0;

function irParaIndice(index){
    indiceAtual = (index + thumbs.length) % thumbs.length; // efeito circular

    const thumbSelecionada = thumbs[indiceAtual];
    imagemPrincipal.src = thumbSelecionada.dataset.full;

    thumbs.forEach(t => t.classList.remove('active'));
    thumbSelecionada.classList.add('active');
}

thumbs.forEach((thumb, index) => {
    thumb.addEventListener('click', () => irParaIndice(index));
});

btnAnterior.addEventListener('click', () => irParaIndice(indiceAtual - 1));
btnProximo.addEventListener('click', () => irParaIndice(indiceAtual + 1));
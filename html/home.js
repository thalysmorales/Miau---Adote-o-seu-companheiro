//carrocel de imagens automático
const imagemPrincipalHome = document.getElementById('imagemPrincipalHome');

const imagens = [
    'img/imagemPET.png',
    'img/imagemPET2.png',
    'img/imagemPET3.png',
    'img/imagemPET4.png'
];

let indiceAtual = 0;

function irParaIndice(index) {
    indiceAtual = (index + imagens.length) % imagens.length; 
    imagemPrincipalHome.src = imagens[indiceAtual];
}

function iniciarAutoPlay() {
    setInterval(() => {
        irParaIndice(indiceAtual + 1);
    }, 4000);
}

iniciarAutoPlay();
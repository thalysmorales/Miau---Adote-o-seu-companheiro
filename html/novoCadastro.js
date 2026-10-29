const MAX_FOTOS = 4;
const MAX_MB = 2;

const inputFotos = document.getElementById('fotos');
const caixaUpload = document.getElementById('caixaUpload');
const textoUpload = document.getElementById('textoUpload');
const previas = document.getElementById('previas');
const aviso = document.getElementById('avisoFotos');

let fotos = []; // lista das fotos escolhidas

inputFotos.addEventListener('change', () => {
    aviso.hidden = true;

    for (const arquivo of inputFotos.files) {
        if (fotos.length >= MAX_FOTOS) {
            mostrarAviso(`Você pode enviar no máximo ${MAX_FOTOS} fotos.`);
            break;
        }
        if (arquivo.size > MAX_MB * 1024 * 1024) {
            mostrarAviso(`"${arquivo.name}" passa de ${MAX_MB} MB e não foi adicionada.`);
            continue;
        }
        fotos.push(arquivo);
    }

    atualizar();
});

function atualizar() {
    // devolve a lista para o input, para o formulário enviar só essas fotos
    const dt = new DataTransfer();
    fotos.forEach(f => dt.items.add(f));
    inputFotos.files = dt.files;

    // desenha as miniaturas
    previas.innerHTML = '';
    fotos.forEach((foto, i) => {
        const item = document.createElement('div');
        item.className = 'itemPrevia';

        const img = document.createElement('img');
        img.src = URL.createObjectURL(foto);
        img.alt = `Prévia da foto ${i + 1}`;

        const remover = document.createElement('button');
        remover.type = 'button';
        remover.className = 'removerFoto';
        remover.setAttribute('aria-label', `Remover foto ${i + 1}`);
        remover.textContent = '×';
        remover.addEventListener('click', () => {
            fotos.splice(i, 1);
            aviso.hidden = true;
            atualizar();
        });

        item.append(img, remover);
        previas.appendChild(item);
    });

    // atualiza o texto da caixa e bloqueia quando chegar no limite
    const cheia = fotos.length >= MAX_FOTOS;
    caixaUpload.classList.toggle('cheia', cheia);
    textoUpload.textContent = cheia
        ? `Limite de ${MAX_FOTOS} fotos atingido`
        : `Clique para adicionar fotos (${fotos.length}/${MAX_FOTOS})`;
    inputFotos.disabled = cheia;
}

function mostrarAviso(msg) {
    aviso.textContent = msg;
    aviso.hidden = false;
}

atualizar();
// ============================================================
// NOVO CADASTRO / EDITAR (admin)
// - Escolha de até 4 fotos, com prévia e botão de remover
// - Envia o animal usando cadastrarAnimal() do dados.js
// - Se a URL tiver ?id=7, abre em modo edição (sem trocar fotos)
// Precisa do dados.js carregado ANTES deste arquivo.
// ============================================================

(async function () {
    const MAX_FOTOS = 4;
    const MAX_MB = 2;

    // nomes dos campos do formulário (iguais aos do banco)
    const CAMPOS = ['nome', 'raca', 'idade', 'especie', 'porte', 'genero',
                    'vacinado', 'castrado', 'vermifugado', 'personalidade'];

    exigirLogin(); // sem login (no modo API), volta para a tela de login

    const form = document.querySelector('.formMA');
    const botaoEnviar = form.querySelector('button[type="submit"]');
    const mensagem = document.getElementById('mensagemForm');
    const idEdicao = new URLSearchParams(window.location.search).get('id');

    // ---------- Mensagem de sucesso / erro ----------
    function mostrarMensagem(html, tipo) {
        mensagem.innerHTML = html;
        mensagem.className = 'mensagemForm ' + tipo;
        mensagem.hidden = false;
    }

    // ---------- Fotos ----------
    const inputFotos = document.getElementById('fotos');
    const caixaUpload = document.getElementById('caixaUpload');
    const textoUpload = document.getElementById('textoUpload');
    const previas = document.getElementById('previas');
    const avisoFotos = document.getElementById('avisoFotos');

    let fotos = []; // lista de File escolhidos

    function mostrarAvisoFotos(texto) {
        avisoFotos.textContent = texto;
        avisoFotos.hidden = false;
    }

    inputFotos.addEventListener('change', () => {
        avisoFotos.hidden = true;

        for (const arquivo of inputFotos.files) {
            if (fotos.length >= MAX_FOTOS) {
                mostrarAvisoFotos(`Você pode enviar no máximo ${MAX_FOTOS} fotos.`);
                break;
            }
            if (arquivo.size > MAX_MB * 1024 * 1024) {
                mostrarAvisoFotos(`"${arquivo.name}" passa de ${MAX_MB} MB e não foi adicionada.`);
                continue;
            }
            fotos.push(arquivo);
        }

        atualizarFotos();
    });

    function atualizarFotos() {
        // devolve a lista para o input, para o formulário ter só estas fotos
        const transferencia = new DataTransfer();
        fotos.forEach(foto => transferencia.items.add(foto));
        inputFotos.files = transferencia.files;

        previas.innerHTML = '';
        fotos.forEach((foto, i) => {
            const item = document.createElement('div');
            item.className = 'itemPrevia';

            const imagem = document.createElement('img');
            imagem.src = URL.createObjectURL(foto);
            imagem.alt = `Prévia da foto ${i + 1}`;

            const remover = document.createElement('button');
            remover.type = 'button';
            remover.className = 'removerFoto';
            remover.setAttribute('aria-label', `Remover foto ${i + 1}`);
            remover.textContent = '×';
            remover.addEventListener('click', () => {
                fotos.splice(i, 1);
                avisoFotos.hidden = true;
                atualizarFotos();
            });

            item.append(imagem, remover);
            previas.appendChild(item);
        });

        const cheia = fotos.length >= MAX_FOTOS;
        caixaUpload.classList.toggle('cheia', cheia);
        textoUpload.textContent = cheia
            ? `Limite de ${MAX_FOTOS} fotos atingido`
            : `Clique para adicionar fotos (${fotos.length}/${MAX_FOTOS})`;
        inputFotos.disabled = cheia;
    }

    atualizarFotos();

    // ---------- Modo edição (?id=7) ----------
    if (idEdicao) {
        document.querySelector('.direitaMA h1').textContent = 'Editar Pet';
        botaoEnviar.textContent = 'Salvar alterações';
        document.getElementById('blocoFotos').hidden = true; // troca de fotos fica para uma próxima etapa

        try {
            const animal = await buscarAnimal(idEdicao);
            if (!animal) {
                mostrarMensagem('Animal não encontrado.', 'erro');
                botaoEnviar.disabled = true;
            } else {
                CAMPOS.forEach(campo => {
                    form.elements[campo].value = animal[campo] || '';
                });
            }
        } catch (erro) {
            console.error(erro);
            mostrarMensagem('Não foi possível carregar o animal.', 'erro');
            botaoEnviar.disabled = true;
        }
    }

    // ---------- Envio ----------
    form.addEventListener('submit', async (evento) => {
        evento.preventDefault();
        mensagem.hidden = true;

        if (!idEdicao && fotos.length === 0) {
            mostrarMensagem('Adicione pelo menos uma foto do animal.', 'erro');
            return;
        }

        const dados = {};
        CAMPOS.forEach(campo => {
            dados[campo] = form.elements[campo].value.trim();
        });

        const textoBotao = botaoEnviar.textContent;
        botaoEnviar.disabled = true;
        botaoEnviar.textContent = 'Salvando...';

        try {
            if (idEdicao) {
                await atualizarAnimal(idEdicao, dados);
                mostrarMensagem(
                    'Alterações salvas! <a href="meusAnimais.html">Voltar para Meus Animais</a>',
                    'sucesso'
                );
            } else {
                const novo = await cadastrarAnimal(dados, fotos);
                mostrarMensagem(
                    `${escaparHtml(novo.nome)} cadastrado(a) com sucesso (código ${escaparHtml(novo.id)})! ` +
                    '<a href="meusAnimais.html">Ver em Meus Animais</a>',
                    'sucesso'
                );
                form.reset();
                fotos = [];
                atualizarFotos();
            }
        } catch (erro) {
            console.error(erro);
            mostrarMensagem(escaparHtml(erro.message || 'Não foi possível salvar. Tente novamente.'), 'erro');
        } finally {
            botaoEnviar.disabled = false;
            botaoEnviar.textContent = textoBotao;
        }
    });
})();

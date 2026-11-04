// ============================================================
// MEUS ANIMAIS (admin)
// Lista os animais cadastrados e permite marcar como adotado.
// Precisa do dados.js carregado ANTES deste arquivo.
// ============================================================

(async function () {
    exigirLogin(); // sem login (no modo API), volta para a tela de login

    const lista = document.getElementById('listaAnimais');

    function criarCardHtml(animal) {
        const adotado = animal.adotado === true;

        return `
        <div class="card cardMA${adotado ? ' cardAdotado' : ''}">
            <img src="${escaparHtml(animal.fotos[0] || '')}" class="card-img-top"
                 alt="Foto de ${escaparHtml(animal.nome)}">
            <div class="card-body card-bodyMA">
                <h5 class="card-title">${escaparHtml(animal.nome)}</h5>
                <p class="card-text">${adotado ? 'Adotado(a)' : escaparHtml(textoCadastro(animal.criadoEm))}</p>
                <div class="botaoMA">
                    <a href="novoCadastro.html?id=${encodeURIComponent(animal.id)}"><button type="button">Editar</button></a>
                    <button type="button" class="${adotado ? 'botaoMA4' : 'botaoMA3'}"
                            data-id="${escaparHtml(animal.id)}" data-adotado="${adotado}">
                        ${adotado ? 'Reativar' : 'Adotado'}
                    </button>
                </div>
            </div>
        </div>`;
    }

    async function desenhar() {
        try {
            const animais = (await listarAnimais())
                .sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm));

            if (animais.length === 0) {
                lista.innerHTML =
                    '<p class="listaVazia">Nenhum animal cadastrado ainda. ' +
                    '<a href="novoCadastro.html">Cadastrar o primeiro</a></p>';
                return;
            }

            lista.innerHTML = animais.map(criarCardHtml).join('');
        } catch (erro) {
            console.error(erro);
            lista.innerHTML = '<p class="listaVazia">Não foi possível carregar os animais agora.</p>';
        }
    }

    // Clique em "Adotado" / "Reativar"
    lista.addEventListener('click', async (evento) => {
        const botao = evento.target.closest('button[data-id]');
        if (!botao) return;

        const jaAdotado = botao.dataset.adotado === 'true';
        botao.disabled = true;

        try {
            await marcarComoAdotado(botao.dataset.id, !jaAdotado);
        } catch (erro) {
            console.error(erro);
            alert('Não foi possível atualizar o animal. Tente novamente.');
        }

        desenhar();
    });

    lista.innerHTML = '<p class="listaVazia">Carregando...</p>';
    desenhar();
})();

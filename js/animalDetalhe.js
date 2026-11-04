// ============================================================
// TENHO INTERESSE
// Lê o id da URL (tenhoInteresse.html?id=7), busca esse animal
// (dados.js), preenche a página e monta as mensagens do WhatsApp.
// Precisa do dados.js carregado ANTES deste arquivo.
// ============================================================

(async function () {
    const NUMERO_ONG = '5534999669664'; // 55 + DDD + número, sem espaços nem +

    const id = new URLSearchParams(window.location.search).get('id');
    const main = document.querySelector('main');

    function naoEncontrado(mensagem) {
        main.innerHTML =
            `<p class="animalNaoEncontrado">${mensagem} <a href="encontrarPET.html">Ver todos os animais</a></p>`;
    }

    function preencher(idElemento, valor) {
        const elemento = document.getElementById(idElemento);
        if (elemento) elemento.textContent = valor;
    }

    function linkWhatsApp(mensagem) {
        return `https://wa.me/${NUMERO_ONG}?text=${encodeURIComponent(mensagem)}`;
    }

    // ---------- Busca o animal ----------
    let animal = null;
    try {
        animal = id ? await buscarAnimal(id) : null;
    } catch (erro) {
        console.error(erro);
        return naoEncontrado('Não foi possível carregar este animal agora.');
    }

    if (!animal) return naoEncontrado('Animal não encontrado.');

    // ---------- Textos ----------
    document.title = `${animal.nome} - MiAu`;

    preencher('petNome', animal.nome);
    preencher('petRaca', animal.raca || '');
    preencher('petEspecie', rotulo('especie', animal.especie));
    preencher('petIdade', rotulo('idade', animal.idade));
    preencher('petPorte', rotulo('porte', animal.porte));
    preencher('petGenero', rotulo('genero', animal.genero));
    preencher('petPersonalidade', animal.personalidade || 'Em breve mais informações.');
    preencher('petVacinas', animal.vacinado === 'sim' ? 'Vacinado' : 'Não vacinado');
    preencher('petCastrado', animal.castrado === 'sim' ? 'Castrado' : 'Não castrado');
    preencher('petVermifugado', animal.vermifugado === 'sim' ? 'Vermifugado' : 'Não vermifugado');
    preencher('textoAdotar', `Adotar ${animal.nome}`);

    // ---------- Fotos ----------
    const fotoPrincipal = document.getElementById('fotoPrincipal');
    const miniaturas = document.getElementById('miniaturas');

    fotoPrincipal.src = animal.fotos[0] || '';
    fotoPrincipal.alt = `Foto de ${animal.nome}, ${rotulo('especie', animal.especie).toLowerCase()} para adoção`;

    if (animal.fotos.length > 1) {
        animal.fotos.forEach((caminho, i) => {
            const miniatura = document.createElement('img');
            miniatura.src = caminho;
            miniatura.alt = `Foto ${i + 1} de ${animal.nome}`;
            miniatura.className = 'thumb' + (i === 0 ? ' active' : '');

            miniatura.addEventListener('click', () => {
                fotoPrincipal.src = caminho;
                miniaturas.querySelectorAll('.thumb').forEach(t => t.classList.remove('active'));
                miniatura.classList.add('active');
            });

            miniaturas.appendChild(miniatura);
        });
    }

    // ---------- WhatsApp (*texto* vira negrito) ----------
    const botaoAdotar = document.getElementById('btnAdotar');
    const botaoDuvidas = document.getElementById('btnTirarDuvidas');

    const linhas = [
        `Olá! Vi o(a) *${animal.nome}* no site da MiAu e tenho interesse em adotar. 🐾`,
        '',
        `*Espécie:* ${rotulo('especie', animal.especie)}`,
        `*Raça:* ${animal.raca || 'Não informada'}`,
        `*Idade:* ${rotulo('idade', animal.idade)}`,
        `*Porte:* ${rotulo('porte', animal.porte)}`,
        `*Gênero:* ${rotulo('genero', animal.genero)}`,
        '',
        'Poderia me passar mais informações?',
        window.location.href
    ].filter(linha => linha !== null);

    const mensagemDuvidas =
        `Olá! Estou vendo o(a) *${animal.nome}* no site da MiAu e tenho algumas dúvidas sobre ele(a).\n` +
        window.location.href;

    if (animal.adotado) {
        // animal já adotado: o botão de adotar fica desativado
        preencher('textoAdotar', `${animal.nome} já foi adotado(a)`);
        botaoAdotar.removeAttribute('href');
        botaoAdotar.setAttribute('aria-disabled', 'true');
        botaoAdotar.classList.add('desativado');
    } else {
        botaoAdotar.href = linkWhatsApp(linhas.join('\n'));
    }

    botaoDuvidas.href = linkWhatsApp(mensagemDuvidas);
})();

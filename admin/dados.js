// ============================================================
// CAMADA DE DADOS DO MIAU
//
// Todas as páginas usam SÓ estas funções para mexer nos animais:
//
//   listarAnimais()                    -> lista de animais (mais novos primeiro)
//   buscarAnimal(id)                   -> um animal (ou null)
//   cadastrarAnimal(dados, fotos)      -> cadastra e devolve o animal criado (com id)
//   atualizarAnimal(id, campos)        -> altera campos de um animal
//   marcarComoAdotado(id, true|false)  -> marca/desmarca como adotado
//
// MODO TESTE (USAR_API: false): guarda tudo no navegador (localStorage).
// MODO API   (USAR_API: true):  conversa com a API Flask (backend/app.py).
//
// Para trocar de um para o outro, mude só o bloco MIAU aqui embaixo.
// ============================================================

const MIAU = {
    USAR_API: true,                        // false = teste | true = API
    API_URL: 'https://miau-adote-o-seu-companheiro.onrender.com',       // local. Em produção: endereço online da API (https), sem barra no final
    EXEMPLOS: true,                         // teste: cria animais de exemplo se não houver nenhum
    BASE_IMAGENS: window.MIAU_BASE_IMAGENS || '',   // as páginas do admin definem '../html/'

    // Onde as fotos ficam guardadas no modo API (a API recebe só o endereço da foto).
    // Crie uma conta grátis no Cloudinary e preencha os dois campos:
    CLOUDINARY: { nuvem: 'sjcezr2t', preset: 'miau_upload' }
};

const CHAVE_ANIMAIS = 'miau_animais';
const CHAVE_PROXIMO_ID = 'miau_proximo_id';

// ------------------------------------------------------------
// Como o animal fica DENTRO do site (igual nos dois modos):
//   id, nome, especie, raca, idade, porte, genero, personalidade,
//   vacinado, castrado, vermifugado   ('sim' ou 'nao')
//   fotos (lista de endereços), adotado (true/false), criadoEm
//
// Códigos usados: especie  cachorro | gato | outros
//                 idade    filhote | adulto | idoso
//                 porte    pequeno | medio | grande
//                 genero   macho | femea
// ------------------------------------------------------------
const ROTULOS = {
    especie: { cachorro: 'Cachorro', gato: 'Gato', outros: 'Outros' },
    idade:   { filhote: 'Filhote', adulto: 'Adulto', idoso: 'Idoso' },
    porte:   { pequeno: 'Pequeno', medio: 'Médio', grande: 'Grande' },
    genero:  { macho: 'Macho', femea: 'Fêmea' }
};

function rotulo(campo, valor) {
    return (ROTULOS[campo] && ROTULOS[campo][valor]) || valor || '';
}

// ------------------------------------------------------------
// Utilitários
// ------------------------------------------------------------
function escaparHtml(texto) {
    return String(texto ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// "Médio" -> "medio", "Fêmea" -> "femea": assim os filtros funcionam
// qualquer que seja a forma como o banco guardou o texto.
function normalizar(valor) {
    return String(valor ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

function simNao(valor) {
    return ['1', 'true', 'sim'].includes(String(valor).toLowerCase()) ? 'sim' : 'nao';
}

function textoCadastro(criadoEm) {
    if (!criadoEm) return '';
    const dias = Math.floor((Date.now() - new Date(criadoEm).getTime()) / 86400000);
    if (isNaN(dias) || dias <= 0) return 'Cadastrado hoje';
    return dias === 1 ? 'Cadastrado há 1 dia' : `Cadastrado há ${dias} dias`;
}

function urlFoto(caminho) {
    if (!caminho) return '';
    if (/^(https?:|data:|blob:)/.test(caminho)) return caminho;
    if (caminho.startsWith('/')) return MIAU.USAR_API ? MIAU.API_URL + caminho : caminho;
    return MIAU.BASE_IMAGENS + caminho;
}

function prepararAnimal(animal) {
    if (!animal) return null;
    return { ...animal, fotos: (animal.fotos || []).map(urlFoto) };
}

// Mais novos primeiro (usa a data; se não houver, usa o id)
function maisNovosPrimeiro(lista) {
    return [...lista].sort((a, b) => {
        if (a.criadoEm && b.criadoEm) return new Date(b.criadoEm) - new Date(a.criadoEm);
        return Number(b.id) - Number(a.id);
    });
}

// Páginas do admin chamam isto no começo: sem login (no modo API), volta para o login.
// É só conforto: a proteção de verdade está na API.
function exigirLogin() {
    if (MIAU.USAR_API && !localStorage.getItem('miau_token')) {
        window.location.href = 'login.html';
    }
}

// ------------------------------------------------------------
// MODO TESTE: armazenamento no navegador
// ------------------------------------------------------------
function criarExemplos() {
    const base = [
        ['Juca',      'cachorro', 'adulto',  'medio',   'macho', 'img/C6/img1.jpg'],
        ['Bob',       'cachorro', 'adulto',  'grande',  'macho', 'img/C4/img1.jpg'],
        ['Belinha',   'cachorro', 'adulto',  'grande',  'femea', 'img/c5/img4.jpg'],
        ['Mel',       'cachorro', 'filhote', 'pequeno', 'femea', 'img/C3/img2.jpg'],
        ['Mike',      'gato',     'adulto',  'pequeno', 'macho', 'img/G2/img1.jpg'],
        ['Pudim',     'gato',     'filhote', 'pequeno', 'macho', 'img/G1/img3.jpg'],
        ['Floquinha', 'gato',     'adulto',  'medio',   'femea', 'img/G3/img3.jpg'],
        ['Pérola',    'gato',     'filhote', 'pequeno', 'femea', 'img/G4/img4.jpg']
    ];

    return base.map(([nome, especie, idade, porte, genero, foto], i) => ({
        id: i + 1,
        nome, especie, idade, porte, genero,
        raca: 'Vira-lata (SRD)',
        personalidade: 'Animal de exemplo, só para testar o layout.',
        vacinado: 'sim',
        castrado: 'nao',
        vermifugado: 'sim',
        fotos: [foto],
        adotado: false,
        criadoEm: new Date(Date.now() - (i + 1) * 86400000).toISOString()
    }));
}

function salvarLocal(lista) {
    try {
        localStorage.setItem(CHAVE_ANIMAIS, JSON.stringify(lista));
    } catch (erro) {
        throw new Error('O armazenamento de teste do navegador encheu. Use menos fotos ou fotos menores.');
    }
}

function lerLocal() {
    try {
        const bruto = localStorage.getItem(CHAVE_ANIMAIS);
        if (bruto === null) {
            const lista = MIAU.EXEMPLOS ? criarExemplos() : [];
            salvarLocal(lista);
            localStorage.setItem(CHAVE_PROXIMO_ID, String(lista.length + 1));
            return lista;
        }
        return JSON.parse(bruto);
    } catch (erro) {
        return [];
    }
}

function proximoId() {
    const atual = parseInt(localStorage.getItem(CHAVE_PROXIMO_ID) || '1', 10);
    localStorage.setItem(CHAVE_PROXIMO_ID, String(atual + 1));
    return atual;
}

// Reduz a foto antes de guardar (o localStorage só aguenta uns 5 MB)
function comprimirImagem(arquivo, ladoMax = 900, qualidade = 0.72) {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(arquivo);
        const imagem = new Image();

        imagem.onload = () => {
            const escala = Math.min(1, ladoMax / Math.max(imagem.width, imagem.height));
            const canvas = document.createElement('canvas');
            canvas.width = Math.round(imagem.width * escala);
            canvas.height = Math.round(imagem.height * escala);
            canvas.getContext('2d').drawImage(imagem, 0, 0, canvas.width, canvas.height);
            URL.revokeObjectURL(url);
            resolve(canvas.toDataURL('image/jpeg', qualidade));
        };

        imagem.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error(`Não consegui ler a imagem "${arquivo.name}".`));
        };

        imagem.src = url;
    });
}

// No console do navegador, rode  limparDadosDeTeste()  para apagar tudo (inclusive os exemplos)
function limparDadosDeTeste() {
    localStorage.setItem(CHAVE_ANIMAIS, '[]');
    localStorage.setItem(CHAVE_PROXIMO_ID, '1');
    console.log('Dados de teste apagados. Recarregue a página.');
}

// ------------------------------------------------------------
// MODO API: tradução entre o site e o banco
//
// ATENÇÃO a uma pegadinha da API atual:
//   - ao ENVIAR (POST) as fotos vão em  foto_url, foto_url_2, foto_url_3, foto_url_4
//   - ao RECEBER (GET) as colunas se chamam  foto_url, foto_url2, foto_url3, foto_url4
// ------------------------------------------------------------
function deApi(linha) {
    if (!linha) return null;

    return {
        id: linha.id,
        nome: linha.nome,
        especie: normalizar(linha.especie),
        raca: linha.raca || '',
        idade: normalizar(linha.idade),
        porte: normalizar(linha.porte),
        genero: normalizar(linha.genero),
        personalidade: linha.descricao || '',
        vacinado: simNao(linha.vacinado),
        castrado: simNao(linha.castrado),
        vermifugado: simNao(linha.vermifugado),
        fotos: [linha.foto_url, linha.foto_url2, linha.foto_url3, linha.foto_url4].filter(Boolean),
        adotado: simNao(linha.adotado) === 'sim',
        criadoEm: linha.criado_em || null
    };
}

function paraApi(dados, urlsFotos = []) {
    return {
        nome: dados.nome,
        especie: dados.especie,
        idade: dados.idade,
        porte: dados.porte,
        genero: dados.genero,
        raca: dados.raca,
        descricao: dados.personalidade,
        vacinado: dados.vacinado === 'sim',
        castrado: dados.castrado === 'sim',
        vermifugado: dados.vermifugado === 'sim',
        foto_url: urlsFotos[0] || null,
        foto_url_2: urlsFotos[1] || null,
        foto_url_3: urlsFotos[2] || null,
        foto_url_4: urlsFotos[3] || null
    };
}

// Para edições parciais (PATCH): só traduz os campos que vieram
function camposParaApi(campos) {
    const saida = {};
    Object.entries(campos).forEach(([campo, valor]) => {
        if (campo === 'personalidade') saida.descricao = valor;
        else if (['vacinado', 'castrado', 'vermifugado'].includes(campo)) saida[campo] = valor === 'sim';
        else saida[campo] = valor;
    });
    return saida;
}

async function enviarFoto(arquivo) {
    const { nuvem, preset } = MIAU.CLOUDINARY;
    if (!nuvem || !preset) {
        throw new Error('Para enviar fotos, preencha CLOUDINARY (nuvem e preset) no começo do dados.js.');
    }

    const formulario = new FormData();
    formulario.append('file', arquivo);
    formulario.append('upload_preset', preset);

    const resposta = await fetch(`https://api.cloudinary.com/v1_1/${nuvem}/image/upload`, {
        method: 'POST',
        body: formulario
    });
    if (!resposta.ok) throw new Error(`Não consegui enviar a foto "${arquivo.name}".`);

    const resultado = await resposta.json();
    return resultado.secure_url;
}

function cabecalhosAdmin() {
    const token = localStorage.getItem('miau_token');   // o login guarda o token aqui
    return token ? { Authorization: 'Bearer ' + token } : {};
}

async function pedirApi(caminho, opcoes = {}) {
    const resposta = await fetch(MIAU.API_URL + caminho, opcoes);
    if (resposta.status === 404) return null;
    if (resposta.status === 401) {
        localStorage.removeItem('miau_token');
        throw new Error('Sua sessão expirou. Entre de novo pelo login.');
    }
    if (!resposta.ok) throw new Error('A API respondeu com erro ' + resposta.status + '.');
    return resposta.json();
}

// ------------------------------------------------------------
// FUNÇÕES QUE AS PÁGINAS USAM
// ------------------------------------------------------------
async function listarAnimais() {
    const lista = MIAU.USAR_API
        ? ((await pedirApi('/animais')) || []).map(deApi)
        : lerLocal();

    return maisNovosPrimeiro(lista).map(prepararAnimal);
}

async function buscarAnimal(id) {
    if (MIAU.USAR_API) {
        return prepararAnimal(deApi(await pedirApi('/animais/' + encodeURIComponent(id))));
    }
    const achado = lerLocal().find(a => String(a.id) === String(id));
    return prepararAnimal(achado || null);
}

// dados = { nome, especie, raca, idade, porte, genero, vacinado, castrado, vermifugado, personalidade }
// arquivosFotos = lista de File (as fotos escolhidas no formulário)
async function cadastrarAnimal(dados, arquivosFotos) {
    if (MIAU.USAR_API) {
        const urls = [];
        for (const arquivo of arquivosFotos) {
            urls.push(await enviarFoto(arquivo));
        }

        const resposta = await pedirApi('/animais', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...cabecalhosAdmin() },
            body: JSON.stringify(paraApi(dados, urls))
        });
        if (!resposta) throw new Error('A API não aceitou o cadastro.');

        // a API devolve só { id }: montamos o resto com o que já temos
        return prepararAnimal({
            id: resposta.id, ...dados, fotos: urls, adotado: false, criadoEm: new Date().toISOString()
        });
    }

    const fotos = [];
    for (const arquivo of arquivosFotos) {
        fotos.push(await comprimirImagem(arquivo));
    }

    const lista = lerLocal();
    const novo = {
        id: proximoId(),                  // no modo API, quem cria o id é o banco
        ...dados,
        fotos,
        adotado: false,
        criadoEm: new Date().toISOString()
    };
    lista.push(novo);
    salvarLocal(lista);
    return prepararAnimal(novo);
}

async function atualizarAnimal(id, campos) {
    if (MIAU.USAR_API) {
        // precisa da rota PATCH /animais/<id> na API (veja api-ajustes.py)
        await pedirApi('/animais/' + encodeURIComponent(id), {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', ...cabecalhosAdmin() },
            body: JSON.stringify(camposParaApi(campos))
        });
        return buscarAnimal(id);
    }

    const lista = lerLocal();
    const posicao = lista.findIndex(a => String(a.id) === String(id));
    if (posicao === -1) throw new Error('Animal não encontrado.');

    lista[posicao] = { ...lista[posicao], ...campos };
    salvarLocal(lista);
    return prepararAnimal(lista[posicao]);
}

function marcarComoAdotado(id, adotado = true) {
    return atualizarAnimal(id, { adotado });
}

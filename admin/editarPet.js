// ============================================================
// EDITAR PET (admin)
// - Abre com ?id=7, busca o animal na API e preenche o formulário
// - Permite remover e trocar fotos (até 4) e salva com PATCH /animais/<id>
// ============================================================

const API_URL = "https://miau-adote-o-seu-companheiro.onrender.com";
const CLOUDINARY_CLOUD = "dypnvgrc";
const CLOUDINARY_PRESET = "miau_img";

// nome com que a página de login guarda o token do administrador
const CHAVE_TOKEN = "miau_token";

const MAX_FOTOS = 4;
const MAX_MB = 2;

const idAnimal = new URLSearchParams(window.location.search).get("id");

const form = document.getElementById("formEditar");
const botaoSalvar = document.getElementById("botaoSalvar");
const mensagemForm = document.getElementById("mensagemForm");

const inputFotos = document.getElementById("fotos");
const caixaUpload = document.getElementById("caixaUpload");
const textoUpload = document.getElementById("textoUpload");
const previas = document.getElementById("previas");
const avisoFotos = document.getElementById("avisoFotos");

// cada item é { url } (foto que já está salva) ou { arquivo } (foto nova escolhida agora)
let fotos = [];

// ---------- utilidades ----------

function obterToken() {
    return localStorage.getItem(CHAVE_TOKEN) || sessionStorage.getItem(CHAVE_TOKEN);
}

function mostrarMensagem(texto, tipo) {
    mensagemForm.textContent = texto;
    mensagemForm.className = "mensagemForm " + (tipo || "");
    mensagemForm.hidden = false;
}

function mostrarAvisoFotos(texto) {
    avisoFotos.textContent = texto;
    avisoFotos.hidden = false;
}

// "Médio" -> "medio", "Fêmea" -> "femea"
function normalizar(texto) {
    return String(texto ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

// escolhe a opção da lista que corresponde ao valor salvo no banco,
// ignorando maiúsculas e acentos; se não existir, cria a opção para não perder o dado
function selecionar(select, valor) {
    if (!valor) return;
    const opcao = [...select.options].find(
        (o) => o.value && normalizar(o.value) === normalizar(valor)
    );
    if (opcao) {
        select.value = opcao.value;
        return;
    }
    select.add(new Option(valor, valor));
    select.value = valor;
}

// ---------- fotos ----------

inputFotos.addEventListener("change", () => {
    avisoFotos.hidden = true;

    for (const arquivo of inputFotos.files) {
        if (fotos.length >= MAX_FOTOS) {
            mostrarAvisoFotos(`Você pode ter no máximo ${MAX_FOTOS} fotos.`);
            break;
        }
        if (arquivo.size > MAX_MB * 1024 * 1024) {
            mostrarAvisoFotos(`"${arquivo.name}" passa de ${MAX_MB} MB e não foi adicionada.`);
            continue;
        }
        fotos.push({ arquivo });
    }

    inputFotos.value = ""; // permite escolher o mesmo arquivo de novo
    atualizarFotos();
});

function atualizarFotos() {
    previas.innerHTML = "";

    fotos.forEach((foto, i) => {
        if (!foto.previa) {
            foto.previa = foto.url || URL.createObjectURL(foto.arquivo);
        }

        const item = document.createElement("div");
        item.className = "itemPrevia";

        const imagem = document.createElement("img");
        imagem.src = foto.previa;
        imagem.alt = `Foto ${i + 1}`;

        const remover = document.createElement("button");
        remover.type = "button";
        remover.className = "removerFoto";
        remover.setAttribute("aria-label", `Remover foto ${i + 1}`);
        remover.textContent = "×";
        remover.addEventListener("click", () => {
            fotos.splice(i, 1);
            avisoFotos.hidden = true;
            atualizarFotos();
        });

        item.append(imagem, remover);
        previas.appendChild(item);
    });

    const cheia = fotos.length >= MAX_FOTOS;
    caixaUpload.classList.toggle("cheia", cheia);
    textoUpload.textContent = cheia
        ? `Limite de ${MAX_FOTOS} fotos atingido`
        : `Clique para adicionar fotos (${fotos.length}/${MAX_FOTOS})`;
    inputFotos.disabled = cheia;
}

// envia uma foto nova para o Cloudinary e devolve o link dela
async function enviarFoto(arquivo) {
    const dados = new FormData();
    dados.append("file", arquivo);
    dados.append("upload_preset", CLOUDINARY_PRESET);

    const resposta = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`,
        { method: "POST", body: dados }
    );
    if (!resposta.ok) {
        const erroCloud = await resposta.json().catch(() => ({}));
        throw new Error(
            erroCloud.error?.message || `Não foi possível enviar a foto "${arquivo.name}".`
        );
    }
    const resultado = await resposta.json();
    return resultado.secure_url;
}

// ---------- carregar o animal ----------

function preencherFormulario(a) {
    const campos = form.elements;

    document.title = `Editar ${a.nome} | MiAu`;
    document.getElementById("tituloEdicao").textContent = `Editar ${a.nome}`;

    campos.nome.value = a.nome || "";
    campos.raca.value = a.raca || "";
    campos.descricao.value = a.descricao || "";
    selecionar(campos.especie, a.especie);
    selecionar(campos.genero, a.genero);
    selecionar(campos.idade, a.idade);
    selecionar(campos.porte, a.porte);

    // o MySQL devolve 1 ou 0 nas colunas de saúde
    campos.vacinado.checked = Boolean(a.vacinado);
    campos.castrado.checked = Boolean(a.castrado);
    campos.vermifugado.checked = Boolean(a.vermifugado);

    fotos = [a.foto_url, a.foto_url2, a.foto_url3, a.foto_url4]
        .filter(Boolean)
        .map((url) => ({ url }));
    atualizarFotos();
}

async function carregarAnimal() {
    if (!idAnimal) {
        mostrarMensagem(
            "Nenhum pet foi selecionado. Volte para Meus Animais e clique em Editar.",
            "erro"
        );
        botaoSalvar.disabled = true;
        return;
    }

    try {
        const resposta = await fetch(`${API_URL}/animais/${encodeURIComponent(idAnimal)}`);

        if (resposta.status === 404) {
            mostrarMensagem("Não encontramos esse pet. Ele pode ter sido excluído.", "erro");
            botaoSalvar.disabled = true;
            return;
        }
        if (!resposta.ok) {
            throw new Error("A API respondeu com erro " + resposta.status);
        }

        preencherFormulario(await resposta.json());
    } catch (erro) {
        console.error("Erro ao carregar o pet:", erro);
        mostrarMensagem("Não foi possível carregar os dados do pet. Tente novamente mais tarde.", "erro");
        botaoSalvar.disabled = true;
    }
}

// ---------- salvar ----------

form.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    mensagemForm.hidden = true;

    const token = obterToken();
    if (!token) {
        mostrarMensagem("Você precisa fazer login como administrador para editar.", "erro");
        return;
    }

    if (fotos.length === 0) {
        mostrarMensagem("O pet precisa ter pelo menos uma foto.", "erro");
        return;
    }

    botaoSalvar.disabled = true;
    botaoSalvar.textContent = "Salvando...";

    try {
        // fotos que já estavam salvas mantêm o link; as novas sobem para o Cloudinary
        const urls = await Promise.all(
            fotos.map((foto) => (foto.url ? foto.url : enviarFoto(foto.arquivo)))
        );

        const campos = form.elements;
        const dados = {
            nome: campos.nome.value.trim(),
            especie: campos.especie.value,
            genero: campos.genero.value,
            raca: campos.raca.value.trim(),
            idade: campos.idade.value,
            porte: campos.porte.value,
            descricao: campos.descricao.value.trim(),
            vacinado: campos.vacinado.checked,
            castrado: campos.castrado.checked,
            vermifugado: campos.vermifugado.checked,
            foto_url: urls[0] || null,
            foto_url2: urls[1] || null,
            foto_url3: urls[2] || null,
            foto_url4: urls[3] || null,
        };

        const resposta = await fetch(`${API_URL}/animais/${encodeURIComponent(idAnimal)}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(dados),
        });

        if (resposta.status === 401) {
            throw new Error("Sessão expirada ou inválida. Faça login novamente.");
        }
        if (!resposta.ok) {
            const erro = await resposta.json().catch(() => ({}));
            throw new Error(erro.erro || "Erro ao salvar as alterações.");
        }

        mostrarMensagem("Alterações salvas! Voltando para Meus Animais...", "sucesso");
        setTimeout(() => {
            window.location.href = "meusAnimais.html";
        }, 1200);
    } catch (erro) {
        console.error(erro);
        mostrarMensagem(erro.message || "Não foi possível salvar. Tente novamente.", "erro");
        botaoSalvar.disabled = false;
        botaoSalvar.textContent = "Salvar alterações";
    }
});

// ---------- início ----------

if (!obterToken()) {
    // sem login, volta para a tela de entrada
    window.location.href = "login.html";
} else {
    atualizarFotos();
    carregarAnimal();
}

const formulario = document.querySelector("form");
const mensagemErro = document.querySelector("#mensagem-erro");
const mostrarSenha = document.querySelector("#mostrar-senha");
const campoLogin = document.querySelector("#login");
const campoSenha = document.querySelector("#senha");
const btnEntrar = document.querySelector("#btnEntrar");

let temporizador;

formulario.addEventListener("submit", async (event) => {
    event.preventDefault();

    const usuario = campoLogin.value.trim();
    const senha = campoSenha.value;

    if (!usuario || !senha) {
        mostrarErro("Preencha o usuário e a senha.");
        return;
    }

    btnEntrar.disabled = true;
    btnEntrar.textContent = "Entrando...";

    try {
        const resposta = await fetch(`${MIAU.API_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                usuario: usuario,
                senha: senha
            })
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            throw new Error(resultado.erro || "Usuário ou senha inválidos.");
        }

        localStorage.setItem("miau_token", resultado.token);

        window.location.href = "meusAnimais.html";

    } catch (erro) {
        console.error("Erro no login:", erro);
        mostrarErro(
            erro.message === "Failed to fetch"
                ? "Não foi possível conectar à API."
                : erro.message
        );
    } finally {
        btnEntrar.disabled = false;
        btnEntrar.textContent = "Entrar";
    }
});

function mostrarErro(texto) {
    mensagemErro.textContent = texto;
    mensagemErro.classList.add("visivel");

    clearTimeout(temporizador);

    temporizador = setTimeout(() => {
        mensagemErro.classList.remove("visivel");
    }, 4000);
}

mostrarSenha.addEventListener("change", () => {
    campoSenha.type = mostrarSenha.checked ? "text" : "password";
});

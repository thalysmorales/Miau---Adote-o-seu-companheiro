const emailLogin = "admin@sopatas.com"
const senhaLogin = "2026"

const btnEntrar = document.querySelector("#btnEntrar")
const mensagemErro = document.querySelector("#mensagem-erro")
const mostrarSenha = document.querySelector("#mostrar-senha")

let temporizador

btnEntrar.addEventListener("click", (event) => {
    event.preventDefault()

    const emailUsuario = document.getElementById("login").value
    const senhaUsuario = document.getElementById("senha").value

    if (emailLogin === emailUsuario && senhaLogin === senhaUsuario) {
        window.location.href = "meusAnimais.html"
    }
    else {
        mensagemErro.classList.add("visivel")
        clearTimeout(temporizador)
        temporizador = setTimeout(() => {
        mensagemErro.classList.remove("visivel")
        }, 3000)
        
    }
})

mostrarSenha.addEventListener("change", () => {
    const senha = document.querySelector("#senha")
    senha.type = mostrarSenha.checked ? "text" : "password"
})

/*Configuração API */

const resposta = await fetch(MIAU.API_URL + '/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usuario, senha })   // os valores digitados
});

if (resposta.ok) {
    const { token } = await resposta.json();
    localStorage.setItem('miau_token', token);
    window.location.href = 'meusAnimais.html';
} else {
    // mostre "Usuário ou senha inválidos"
}
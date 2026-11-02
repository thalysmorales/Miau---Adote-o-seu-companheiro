const emailLogin = "admin@sopataos.com"
const senhaLogin = "2026"

const btnEntrar = document.querySelector("#btnEntrar")

btnEntrar.addEventListener("click", (event) => {
    event.preventDefault()

    const emailUsuario = document.getElementById("login").value
    const senhaUsuario = document.getElementById("senha").value

    if (emailLogin === emailUsuario && senhaLogin === senhaUsuario) {
        window.location.href = "meusAnimais.html"
    }

    console.log(emailUsuario)
    console.log(senhaUsuario)
})




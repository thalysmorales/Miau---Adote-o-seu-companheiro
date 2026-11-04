const API_URL = ["localhost", "127.0.0.1"].includes(window.location.hostname)
  ? "http://localhost:3000"
  : "https://miau-adote-o-seu-companheiro.onrender.com";
const listaUltimos = document.getElementById("ultimosPets");

// evita que texto vindo do banco quebre o HTML
function escapar(texto) {
  return String(texto ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function criarCard(a) {
  return `
    <div class="card" style="width: 16rem;">
      <img src="${escapar(a.foto_url)}" class="card-img-top" alt="Fotografia de ${escapar(a.nome)}, animal para adoção">
      <div class="card-body">
        <h5 class="card-title">${escapar(a.nome)}</h5>
        <p class="card-text">${escapar(a.genero)} - ${escapar(a.porte)} </p>
        <div class="botao">
          <a href="tenhoInteresse.html?id=${encodeURIComponent(a.id)}" class="btn btn-primary">Tenho Interesse</a>
        </div>
      </div>
    </div>
  `;
}

async function carregarUltimosPets() {
  try {
    const resposta = await fetch(`${API_URL}/animais?limite=3`);
    if (!resposta.ok) {
      throw new Error("A API respondeu com erro " + resposta.status);
    }
    const animais = await resposta.json();

    if (animais.length === 0) {
      listaUltimos.innerHTML = "<p>Em breve teremos novos pets para adoção.</p>";
      return;
    }

    listaUltimos.innerHTML = animais.map(criarCard).join("");
  } catch (erro) {
    console.error("Erro ao carregar os pets:", erro);
    listaUltimos.innerHTML = "<p>Não foi possível carregar os pets agora. Tente novamente mais tarde.</p>";
  }
}

carregarUltimosPets();
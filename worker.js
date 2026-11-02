export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Define home.html como página inicial
    if (url.pathname === "/") {
      url.pathname = "/home.html";
      return env.ASSETS.fetch(new Request(url, request));
    }

    // Entrega os demais arquivos normalmente
    return env.ASSETS.fetch(request);
  }
};
// Ícones com letra da primeira letra
 document.querySelectorAll('.titulo-com-icone').forEach(el => {
    const texto = el.textContent.trim();
    const primeiraLetra = texto.charAt(0);
    el.innerHTML = `<span class="icon-letra">${primeiraLetra}</span>${texto}`;
  });
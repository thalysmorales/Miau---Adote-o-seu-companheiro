const btnMenu = document.getElementById('btnMenu');
const menuLinks = document.getElementById('menuLinks');

btnMenu.addEventListener('click', () => {
    const aberto = menuLinks.classList.toggle('aberto');
    btnMenu.setAttribute('aria-expanded', aberto);
});
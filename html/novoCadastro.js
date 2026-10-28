const inputFotos = document.getElementById('fotos');
const previas = document.getElementById('previas');

inputFotos.addEventListener('change', () => {
    previas.innerHTML = '';

    for (const arquivo of inputFotos.files) {
        const img = document.createElement('img');
        img.src = URL.createObjectURL(arquivo);
        img.alt = 'Prévia da foto escolhida';
        previas.appendChild(img);
    }
});
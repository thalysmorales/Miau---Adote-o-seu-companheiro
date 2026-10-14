document.addEventListener("DOMContentLoaded", () => {
  const painel = document.getElementById("painelFiltros");
  if (!painel) return;

  const btnFiltros = document.querySelector(".botaoFiltro");
  const rapidos = document.querySelectorAll(".botoes button[data-tipo]");
  const radios = painel.querySelectorAll("input[type=radio]");
  const chips = document.getElementById("filtrosAtivos");
  const cards = document.querySelectorAll(".divCards .card");
  const semResultado = document.getElementById("semResultado");

  const nomes = { medio: "Médio" }; // valores que precisam de acento
  const filtros = {};               // ex.: { especie: "gato", idade: "filhote" }

  function definir(tipo, valor) {
    if (filtros[tipo] === valor) delete filtros[tipo]; // clicar de novo remove
    else filtros[tipo] = valor;
    atualizar();
  }

  function limpar() {
    Object.keys(filtros).forEach((k) => delete filtros[k]);
    atualizar();
  }

  function atualizar() {
    // 1. Mostra/esconde os cards
    let visiveis = 0;
    cards.forEach((card) => {
      const combina = Object.entries(filtros).every(
        ([tipo, valor]) => card.dataset[tipo] === valor
      );
      card.hidden = !combina;
      if (combina) visiveis++;
    });
    semResultado.hidden = visiveis > 0;

    // 2. Destaca os botões rápidos
    rapidos.forEach((btn) => {
      const ativo =
        btn.dataset.tipo === "todos"
          ? Object.keys(filtros).length === 0
          : filtros[btn.dataset.tipo] === btn.dataset.valor;
      btn.classList.toggle("ativo", ativo);
    });

    // 3. Sincroniza os radios do painel
    radios.forEach((r) => (r.checked = filtros[r.name] === r.value));

    // 4. Chips dos filtros selecionados
    chips.replaceChildren();
    Object.entries(filtros).forEach(([tipo, valor]) => {
      const chip = document.createElement("span");
      chip.className = "chip";
      chip.textContent = nomes[valor] || valor.charAt(0).toUpperCase() + valor.slice(1);

      const x = document.createElement("button");
      x.type = "button";
      x.textContent = "×";
      x.setAttribute("aria-label", "Remover filtro " + valor);
      x.addEventListener("click", () => definir(tipo, valor));

      chip.appendChild(x);
      chips.appendChild(chip);
    });
  }

  btnFiltros.addEventListener("click", () => (painel.hidden = !painel.hidden));

  rapidos.forEach((btn) =>
    btn.addEventListener("click", () => {
      if (btn.dataset.tipo === "todos") limpar();
      else definir(btn.dataset.tipo, btn.dataset.valor);
    })
  );

  radios.forEach((r) =>
    r.addEventListener("change", () => {
      filtros[r.name] = r.value;
      atualizar();
    })
  );

  document.getElementById("limparFiltros").addEventListener("click", limpar);

  atualizar(); // estado inicial: "Todos" ativo
});
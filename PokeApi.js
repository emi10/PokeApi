window.onload = function () {
    const tipoSelect = document.querySelector("#tipoSelect");
    const generacionSelect = document.querySelector("#generacionSelect");
    const listaPokemon = document.querySelector("#listaPokemon");

    const contenedorNombre = document.querySelector('#searchBar');
    let idNombreFile;
    let debounceTimer;

    // Cargar tipos
    fetch("https://pokeapi.co/api/v2/type/")
        .then(res => res.json())
        .then(data => {
            data.results
                .filter(tipo => tipo.name !== 'stellar' && tipo.name !== 'unknown')
                .forEach(tipo => {
                    const option = document.createElement("option");
                    option.value = tipo.name;
                    option.textContent = tipo.name.charAt(0).toUpperCase() + tipo.name.slice(1);
                    option.classList.add(tipo.name);
                    tipoSelect.appendChild(option);
                });
        });

    // Cargar generaciones
    fetch("https://pokeapi.co/api/v2/generation/")
        .then(res => res.json())
        .then(data => {
            data.results.forEach(gen => {
                const option = document.createElement("option");
                option.value = gen.name;
                option.textContent = gen.name.charAt(0).toUpperCase() + gen.name.slice(1);
                generacionSelect.appendChild(option);
            });
        });

    function mostrarPokemon(poke) {
        let tipos = poke.types.map(type => `<p class="${type.type.name} tipo">${type.type.name}</p>`).join('');
        let pokeId = poke.id.toString().padStart(3, '0');
        const div = document.createElement("div");
        div.classList.add("pokemon");
        div.innerHTML = `
            <p class="pokemon-id-back">#${pokeId}</p>
            <div class="pokemon-imagen">
                <img src="${poke.sprites.front_default}" alt="${poke.name}">
            </div>
            <div class="pokemon-info">
                <div class="nombre-contenedor">
                    <p class="pokemon-id">#${pokeId}</p>
                    <h2 class="pokemon-nombre">${poke.name}</h2>
                </div>
                <div class="pokemon-tipos">${tipos}</div>
                <div class="pokemon-stats">
                    <p class="stat">${poke.height}m</p>
                    <p class="stat">${poke.weight}kg</p>
                    <p class="stat">LV0 Stat: ${poke.stats[0].base_stat}</p>
                    <p class="stat">LV1 Stat: ${poke.stats[1].base_stat}</p>
                </div>
            </div>
        `;
        listaPokemon.append(div);
    }

    async function cargarFiltrado() {
        listaPokemon.innerHTML = "";
        const tipo = tipoSelect.value;
        const gen = generacionSelect.value;
        const name = contenedorNombre.value.trim().toLowerCase();


        let pokeNamesTipo = [];
        let pokeNamesGen = [];

        
        if (name !== "") {
            try {
                const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
                if (!res.ok) throw new Error("Pokémon no encontrado");
                const data = await res.json();
                mostrarPokemon(data);
                return; 
            } catch (err) {
                div.classList.add("pokemon");
        div.innerHTML = `<p class="pokemon-id-back">Pokemon no encontrado</p>`;
                return;
            }
        }

        let pokemonsFinal = [];

        if (tipo !== "all") {
            const res = await fetch(`https://pokeapi.co/api/v2/type/${tipo}`);
            const data = await res.json();
            pokeNamesTipo = data.pokemon.map(p => p.pokemon.name);
        }

        if (gen !== "all") {
            const res = await fetch(`https://pokeapi.co/api/v2/generation/${gen}`);
            const data = await res.json();
            pokeNamesGen = data.pokemon_species.map(s => s.name);
        }


        if (tipo === "all" && gen === "all") {
            pokemonsFinal = Array.from({ length: 151 }, (_, i) => i + 1);
        } else if (tipo !== "all" && gen === "all") {
            pokemonsFinal = pokeNamesTipo;
        } else if (tipo === "all" && gen !== "all") {
            pokemonsFinal = pokeNamesGen;
        } else {
            pokemonsFinal = pokeNamesTipo.filter(name => pokeNamesGen.includes(name));
        }

        const pokemonsData = [];

        for (let poke of pokemonsFinal) {
            let url = typeof poke === "number"
                ? `https://pokeapi.co/api/v2/pokemon/${poke}`
                : `https://pokeapi.co/api/v2/pokemon/${poke}`;
            const res = await fetch(url);
            const data = await res.json();
            pokemonsData.push(data);
        }

        pokemonsData.sort((a, b) => a.id - b.id);

        pokemonsData.forEach(poke => mostrarPokemon(poke));
    }

    tipoSelect.addEventListener("change", cargarFiltrado);
    generacionSelect.addEventListener("change", cargarFiltrado);

    cargarFiltrado();


    // BUSQUEDA POR SU ID NAME



    if (contenedorNombre) {
        contenedorNombre.addEventListener('input', () => {
            clearTimeout(debounceTimer);

            debounceTimer = setTimeout(() => {
                idNombreFile = contenedorNombre.value.replace(/\s/g, "-");
                console.log("Valor actualizado: " + idNombreFile);
                cargarFiltrado()
            }, 500);
        });
    }
};

// function PokemonSearch(name){
//     name = idNombreFile;
// }
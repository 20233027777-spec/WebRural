document.addEventListener("DOMContentLoaded", async () => {

    const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
    const selectTalhao = document.getElementById("selectTalhao");
    let grafico;

    document.getElementById("sairConta").addEventListener("click", sair);

    function sair() {
        localStorage.removeItem("usuarioLogado");
        window.location.href = "../pagina_inicial/index.html";
    }

    if (!usuario) return (window.location.href = "../login/login.html");

    const idUsuario = usuario.id_usuario;

    // ---- CARREGAR TALHÕES ----
    try {
        const resposta = await fetch(`http://localhost:3000/talhoes/usuario/${idUsuario}`);
        const talhoes = await resposta.json();

        if (!Array.isArray(talhoes) || talhoes.length === 0) {
            const option = document.createElement("option");
            option.value = "";
            option.textContent = "Nenhum talhão cadastrado";
            selectTalhao.appendChild(option);
            selectTalhao.disabled = true;
        } else {
            talhoes.forEach(talhao => {
                const option = document.createElement("option");
                option.value = talhao.id_talhao;
                option.textContent = talhao.nome;
                selectTalhao.appendChild(option);
            });
        }
    } catch (erro) {
        console.error("Erro ao carregar talhões:", erro);
    }

    // ---- FUNÇÃO DO GRÁFICO ----
    async function carregarGrafico(idTalhao = 0) {
        let url = `http://localhost:3000/graficos/usuario/${idUsuario}`;

        if (idTalhao != 0) {
            url = `http://localhost:3000/graficos/usuario/${idUsuario}/talhao/${idTalhao}`;
        }
        console.log("URL usada:", url);
        const resposta = await fetch(url);
        const dados = await resposta.json();

        // Se não tiver dados, limpa o gráfico e retorna
        if (!Array.isArray(dados) || dados.length === 0) {
            if (grafico) grafico.destroy();
            const ctxEmpty = document.getElementById("graficoMovimento");
            ctxEmpty.getContext('2d').clearRect(0, 0, ctxEmpty.width, ctxEmpty.height);
            return;
        }

        // 1) criar conjunto único de labels (ano/mes) ordenados
        // transformar cada item em chave 'YYYY-MM' para ordenar corretamente
        const mesesChaves = Array.from(new Set(dados.map(d => `${String(d.ano).padStart(4,'0')}-${String(d.mes).padStart(2,'0')}`)))
                                .sort();

        // gerar labels legíveis a partir das chaves
        const labels = mesesChaves.map(k => {
            const [ano, mes] = k.split("-");
            return `${Number(mes)}/${ano}`;
        });

        // 2) construir mapas por (chave -> total) para D e R
        const mapaD = {};
        const mapaR = {};
        dados.forEach(d => {
            const chave = `${String(d.ano).padStart(4,'0')}-${String(d.mes).padStart(2,'0')}`;
            if (d.tipo === "D" || d.tipo === "d") {
                mapaD[chave] = Number(d.total) || 0;
            } else if (d.tipo === "R" || d.tipo === "r") {
                mapaR[chave] = Number(d.total) || 0;
            }
        });

        // 3) montar arrays alinhados com 'labels'
        const despesasArr = mesesChaves.map(k => mapaD[k] || 0);
        const receitasArr = mesesChaves.map(k => mapaR[k] || 0);

        // 4) destruir gráfico antigo e criar novo
        if (grafico) grafico.destroy();

        const ctx = document.getElementById("graficoMovimento").getContext('2d');
        grafico = new Chart(ctx, {
            type: "bar",
            data: {
                labels: labels,
                datasets: [
                    {
                        label: "Despesas",
                        data: despesasArr,
                        borderWidth: 2,
                        tension: 0.3,
                        fill: false,
                        borderColor: "rgba(255, 99, 132, 1)",  
                        backgroundColor: "rgba(255, 99, 132, 0.5)",
                    },
                    {
                        label: "Receitas",
                        data: receitasArr,
                        borderWidth: 2,
                        tension: 0.3,
                        fill: false,
                        borderColor: "rgba(52, 67, 143, 1)",  
                        backgroundColor: "rgba(52, 67, 143, 0.5)",
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { callback: value => `R$ ${Number(value).toFixed(2)}` }
                    }
                }
            }
        });
    }


    // ---- EVENTO ----
    selectTalhao.addEventListener("change", (e) => {
        carregarGrafico(e.target.value);
    });

    // ---- CARREGAR INICIAL ----
    carregarGrafico();

});

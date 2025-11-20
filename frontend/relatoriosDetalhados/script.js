document.addEventListener("DOMContentLoaded", async () => {

    const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
    if (!usuario) return (window.location.href = "../login/login.html");

    const idUsuario = usuario.id_usuario;

    const selectTalhao = document.getElementById("selectTalhao");
    const btnExport = document.getElementById("btnExport");

    const tbodyAtiv = document.getElementById("tbodyAtividades");
    const tbodyFin = document.getElementById("tbodyFinanceiro");
    const tbodyMensal = document.getElementById("tbodyMensal");

    document.getElementById("sairConta").addEventListener("click", () => {
        localStorage.removeItem("usuarioLogado");
        window.location.href = "../pagina_inicial/index.html";
    });

    // ===================== CARREGAR TALHÕES =====================
    try {
        const resposta = await fetch(`http://localhost:3000/talhoes/usuario/${idUsuario}`);
        const talhoes = await resposta.json();
        talhoes.forEach(t => {
            const op = document.createElement("option");
            op.value = t.id_talhao;
            op.textContent = t.nome;
            selectTalhao.appendChild(op);
        });
    } catch (e) {
        console.error("Erro ao carregar talhões:", e);
    }

    selectTalhao.addEventListener("change", carregarRelatorio);

    if (btnExport) {
        btnExport.addEventListener("click", () => window.print());
    }

    carregarRelatorio();

    // ====================== FUNÇÕES =======================
    function escapeHtml(text) {
        if (!text) return "";
        return text.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
    }

    function formatarValor(v) {
        if (!v) return "-";
        return Number(v).toLocaleString("pt-BR", { minimumFractionDigits: 2 });
    }

    async function carregarRelatorio() {
        const talhaoId = selectTalhao.value;

        tbodyAtiv.innerHTML = `<tr><td colspan="4" style="text-align:center;">Carregando...</td></tr>`;
        tbodyFin.innerHTML = `<tr><td colspan="5" style="text-align:center;">Carregando...</td></tr>`;
        tbodyMensal.innerHTML = `<tr><td colspan="4" style="text-align:center;">Carregando...</td></tr>`;

        try {
            const res = await fetch(`http://localhost:3000/relatorio/usuario/${idUsuario}/talhao/${talhaoId}`);
            const dados = await res.json();

            const atividades = dados.filter(x => x.tipo === "Atividade");
            const financeiro = dados.filter(x => x.tipo === "Despesa" || x.tipo === "Receita");

            // ========== TABELA ATIVIDADES ==========
            if (atividades.length === 0)
                tbodyAtiv.innerHTML = `<tr><td colspan="4" style="text-align:center;">Nenhuma atividade.</td></tr>`;
            else
                tbodyAtiv.innerHTML = atividades.map(a => `
                    <tr>
                        <td>${escapeHtml(a.nome)}</td>
                        <td>${new Date(a.data).toLocaleDateString("pt-BR")}</td>
                        <td>${escapeHtml(a.descricao || "-")}</td>
                        <td>${escapeHtml(a.talhao_nome || "-")}</td>
                    </tr>
                `).join("");

            // ========== TABELA FINANCEIRO ==========
            if (financeiro.length === 0)
                tbodyFin.innerHTML = `<tr><td colspan="5" style="text-align:center;">Nenhuma despesa/receita.</td></tr>`;
            else
                tbodyFin.innerHTML = financeiro.map(f => `
                    <tr>
                        <td>${f.tipo}</td>
                        <td>${escapeHtml(f.nome)}</td>
                        <td>${new Date(f.data).toLocaleDateString("pt-BR")}</td>
                        <td style="text-align:right">R$ ${formatarValor(f.valor)}</td>
                        <td>${escapeHtml(f.talhao_nome || "-")}</td>
                    </tr>
                `).join("");

            // ========== RESUMO FINANCEIRO POR MÊS ==========
            const meses = {};

            financeiro.forEach(f => {
                const d = new Date(f.data);
                const chave = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

                if (!meses[chave])
                    meses[chave] = { despesas: 0, receitas: 0 };

                if (f.tipo === "Despesa") meses[chave].despesas += Number(f.valor);
                if (f.tipo === "Receita") meses[chave].receitas += Number(f.valor);
            });

            const linhas = Object.entries(meses).map(([mes, val]) => {
                const [ano, mesNum] = mes.split("-");
                const nomeMes = new Date(`${ano}-${mesNum}-01`).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

                const lucro = val.receitas - val.despesas;

                return `
                    <tr>
                        <td>${nomeMes}</td>
                        <td style="text-align:right">R$ ${formatarValor(val.despesas)}</td>
                        <td style="text-align:right">R$ ${formatarValor(val.receitas)}</td>
                        <td style="text-align:right; color:${lucro >= 0 ? "green" : "red"};">
                            R$ ${formatarValor(lucro)}
                        </td>
                    </tr>
                `;
            }).join("");

            tbodyMensal.innerHTML = linhas || `<tr><td colspan="4" style="text-align:center;">Nenhum dado financeiro.</td></tr>`;

        } catch (err) {
            console.error(err);
        }
    }

});

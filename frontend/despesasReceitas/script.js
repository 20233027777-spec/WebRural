const modalDespesa = document.getElementById("modalDespesa");
const modalReceita = document.getElementById("modalReceita");

const abrirModalDespesa = document.getElementById("abrirModalDespesa");
const abrirModalReceita = document.getElementById("abrirModalReceita");

const fecharModalDespesa = document.getElementById("fecharModalDespesa");
const fecharModalReceita = document.getElementById("fecharModalReceita");

const formDespesa = document.getElementById("formDespesa");
const formReceita = document.getElementById("formReceita");

const corpoTabela = document.getElementById("resultado");
let editandoId = null;
let editandoTipo = null;

// -------------------------------
// NOVOS ELEMENTOS DO MODAL DE EXCLUSÃO
// -------------------------------
let idParaExcluir = null;
let tipoParaExcluir = null;

const modalConfirmar = document.getElementById("modalConfirmar");
const textoConfirmacao = document.getElementById("textoConfirmacao");
const btnCancelarExcluir = document.getElementById("btnCancelarExcluir");
const btnConfirmarExcluir = document.getElementById("btnConfirmarExcluir");
// --------------------------------

function showToast(msg) {
    console.log("[TOAST]", msg);
}

document.addEventListener("DOMContentLoaded", async () => {

    const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
    document.getElementById("sairConta").addEventListener("click", sair);
    function sair() {
        localStorage.removeItem("usuarioLogado");
        window.location.href = "../pagina_inicial/index.html";
    }
    if (!usuario) return (window.location.href = "../login/login.html");

    const idUsuario = usuario.id_usuario;

    // Carregar talhões
    try {
        const resp = await fetch(`http://localhost:3000/talhoes/usuario/${idUsuario}`);
        const talhoes = await resp.json();
        const selectTalhaoD = document.getElementById("selectTalhaoD");
        const selectTalhaoR = document.getElementById("selectTalhaoR");

        if (!Array.isArray(talhoes) || talhoes.length === 0) {
            const msg = document.createElement("option");
            msg.value = "";
            msg.innerText = "Nenhum talhão cadastrado";
            selectTalhaoD.appendChild(msg.cloneNode(true));
            selectTalhaoR.appendChild(msg);
            selectTalhaoD.disabled = true;
            selectTalhaoR.disabled = true;
        } else {
            talhoes.forEach(t => {
                const optD = document.createElement("option");
                optD.value = t.id_talhao;
                optD.innerText = t.nome;
                selectTalhaoD.appendChild(optD);

                const optR = document.createElement("option");
                optR.value = t.id_talhao;
                optR.innerText = t.nome;
                selectTalhaoR.appendChild(optR);
            });
        }

    } catch (erro) {
        console.error("Erro carregando talhões:", erro);
        alert("Erro ao carregar talhões.");
    }

    // Abrir modais
    abrirModalDespesa.onclick = () => {
        editandoId = null;
        editandoTipo = "d";
        formDespesa.reset();
        modalDespesa.style.display = "flex";
    };
    abrirModalReceita.onclick = () => {
        editandoId = null;
        editandoTipo = "r";
        formReceita.reset();
        modalReceita.style.display = "flex";
    };

    fecharModalDespesa.onclick = () => modalDespesa.style.display = "none";
    fecharModalReceita.onclick = () => modalReceita.style.display = "none";

    window.addEventListener("click", (e) => {
        if (e.target === modalDespesa) modalDespesa.style.display = "none";
        if (e.target === modalReceita) modalReceita.style.display = "none";
    });

    // ---------------- SUBMIT DESPESA ----------------
    formDespesa.addEventListener("submit", async (e) => {
        e.preventDefault();
        const nomeDespesa = document.getElementById("nomeDespesa").value.trim();
        const valorDespesa = document.getElementById("valorDespesa").value;
        const dataDespesa = document.getElementById("dataDespesa").value;
        const talhaoSelecionadoD = document.getElementById("selectTalhaoD").value;
        const tipo = 'd';

        if (!nomeDespesa || !valorDespesa || !dataDespesa || !talhaoSelecionadoD) {
            alert("Preencha todos os campos obrigatórios!");
            return;
        }

        const despesas = {
            nome: nomeDespesa,
            tipo: tipo,
            valor: valorDespesa,
            data: dataDespesa,
            talhoes_id_talhao: parseInt(talhaoSelecionadoD),
            usuarios_id_usuario: parseInt(idUsuario)
        };

        const idEditando = formDespesa.dataset.editando;
        const url = idEditando
            ? `http://localhost:3000/despesas_receitas/${idEditando}`
            : "http://localhost:3000/despesas_receitas";

        const metodo = idEditando ? "PUT" : "POST";

        try {
            const resposta = await fetch(url, {
                method: metodo,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(despesas)
            });

            if (resposta.ok) {
                modalDespesa.style.display = "none";
                formDespesa.reset();
                delete formDespesa.dataset.editando;
                listarDespesasReceitas();
            } else {
                const erro = await resposta.json();
                alert("Erro ao salvar Despesa: " + erro.erro);
            }
        } catch (erro) {
            console.error("Erro ao cadastrar Despesa:", erro);
        }
    });

    // ---------------- SUBMIT RECEITA ----------------
    formReceita.addEventListener("submit", async (e) => {
        e.preventDefault();
        const nomeReceita = document.getElementById("nomeReceita").value.trim();
        const valorReceita = document.getElementById("valorReceita").value;
        const dataReceita = document.getElementById("dataReceita").value;
        const talhaoSelecionadoR = document.getElementById("selectTalhaoR").value;
        const tipo = 'r';

        if (!nomeReceita || !valorReceita || !dataReceita || !talhaoSelecionadoR) {
            alert("Preencha todos os campos obrigatórios!");
            return;
        }

        const receitas = {
            nome: nomeReceita,
            tipo: tipo,
            valor: valorReceita,
            data: dataReceita,
            talhoes_id_talhao: parseInt(talhaoSelecionadoR),
            usuarios_id_usuario: parseInt(idUsuario)
        };

        const idEditando = formReceita.dataset.editando;
        const url = idEditando
            ? `http://localhost:3000/despesas_receitas/${idEditando}`
            : "http://localhost:3000/despesas_receitas";

        const metodo = idEditando ? "PUT" : "POST";

        try {
            const resposta = await fetch(url, {
                method: metodo,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(receitas)
            });

            if (resposta.ok) {
                modalReceita.style.display = "none";
                formReceita.reset();
                delete formReceita.dataset.editando;
                listarDespesasReceitas();
            } else {
                const erro = await resposta.json();
                alert("Erro ao salvar Receita: " + erro.erro);
            }
        } catch (erro) {
            console.error("Erro ao cadastrar Receita:", erro);
        }
    });
    function formatarValor(valor) {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL"
        }).format(Number(valor));
    }

    // ---------------- LISTAR ----------------
    async function listarDespesasReceitas() {
        const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
        const idUsuario = usuario.id_usuario;

        try {
            const res = await fetch(`http://localhost:3000/despesas_receitas/usuario/${idUsuario}`);
            const dados = await res.json();

            if (!Array.isArray(dados) || dados.length === 0) {
                corpoTabela.innerHTML = `
                    <tr>
                        <td colspan="5" style="text-align:center; padding: 20px; color:#555;">
                            Você ainda não possui despesas ou receitas cadastradas!
                        </td>
                    </tr>
                `;
                return;
            }

            corpoTabela.innerHTML = dados.map(item => `
                <tr>
                    <td>${item.nome}</td>
                    <td>${new Date(item.data).toLocaleDateString("pt-BR")}</td>
                    <td>${item.tipo === "d" ? "Despesa" : "Receita"}</td>
                    <td>${formatarValor(item.valor)}</td>
                    <td>${item.talhao_nome || item.talhoes_id_talhao}</td>

                    <td class="acoes">
                        <button class="btn-editar"
                            data-id="${item.id_despesa}"
                            data-nome="${item.nome}"
                            data-tipo="${item.tipo}"
                            data-data="${item.data}"
                            data-valor="${item.valor}"
                            data-talhao="${item.talhoes_id_talhao}">
                            <img src="../images/editar.png" class="imgBotao" alt="Editar">
                        </button>

                        <button class="btn-excluir"
                            data-id="${item.id_despesa}"
                            data-tipo="${item.tipo}">
                            <img src="../images/excluir.png" class="imgBotao" alt="Excluir">
                        </button>
                    </td>
                </tr>
            `).join("");

            adicionarEventosBotoes();

        } catch (erro) {
            console.error("Erro ao listar despesas/receitas:", erro);
        }
    }

    function adicionarEventosBotoes() {
        document.querySelectorAll(".btn-excluir").forEach(btn => {
            btn.addEventListener("click", () => {

                idParaExcluir = btn.dataset.id;
                tipoParaExcluir = btn.dataset.tipo;

                if (tipoParaExcluir === "d") {
                    textoConfirmacao.innerHTML = "Você tem certeza que deseja excluir <strong>esta despesa?</strong>";
                } else {
                    textoConfirmacao.innerHTML = "Você tem certeza que deseja excluir <strong>esta receita?</strong>";
                }

                modalConfirmar.style.display = "flex";
            });
        });

        btnCancelarExcluir.addEventListener("click", () => {
            modalConfirmar.style.display = "none";
            idParaExcluir = null;
            tipoParaExcluir = null;
        });

        btnConfirmarExcluir.addEventListener("click", async () => {
            await fetch(`http://localhost:3000/despesas_receitas/${idParaExcluir}`, {
                method: "DELETE"
            });

            modalConfirmar.style.display = "none";
            listarDespesasReceitas();
        });

        // ---------- EDITAR ----------
        document.querySelectorAll(".btn-editar").forEach(btn => {
            btn.addEventListener("click", () => {

                const id = btn.dataset.id;
                const nome = btn.dataset.nome;
                const tipo = btn.dataset.tipo;
                const data = btn.dataset.data.split("T")[0];
                const valor = btn.dataset.valor;
                const talhao = btn.dataset.talhao;

                if (tipo === "d") {

                    document.querySelector("#modalDespesa h2").innerText = "Editar Despesa";
                    document.querySelector('#modalDespesa button[type="submit"]').innerText = "Salvar Alterações";

                    document.getElementById("nomeDespesa").value = nome;
                    document.getElementById("valorDespesa").value = valor;
                    document.getElementById("dataDespesa").value = data;
                    document.getElementById("selectTalhaoD").value = talhao;

                    formDespesa.dataset.editando = id;
                    modalDespesa.style.display = "flex";

                } else {

                    document.querySelector("#modalReceita h2").innerText = "Editar Receita";
                    document.querySelector('#modalReceita button[type="submit"]').innerText = "Salvar Alterações";

                    document.getElementById("nomeReceita").value = nome;
                    document.getElementById("valorReceita").value = valor;
                    document.getElementById("dataReceita").value = data;
                    document.getElementById("selectTalhaoR").value = talhao;

                    formReceita.dataset.editando = id;
                    modalReceita.style.display = "flex";
                }
            });
        });
    }

    listarDespesasReceitas();

});

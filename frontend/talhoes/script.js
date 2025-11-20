const modalAdd = document.getElementById("modal");
const modalEdt = document.getElementById("modalEdicao");

const abrirModalAdd = document.getElementById("abrirModal");
const fecharModalAdd = document.getElementById("fecharModal");
const fecharModalEdt = document.getElementById("fecharModalEdt");

const formAdd = document.getElementById("formTalhao");
const formEdt = document.getElementById("formEdicaoTalhao");
const corpoTabela = document.getElementById("resultado");

let editandoId = null;

// === ABRIR E FECHAR MODAL DE ADIÇÃO ===
abrirModalAdd.addEventListener("click", () => {
  formAdd.reset();
  modalAdd.style.display = "flex";
});

fecharModalAdd.addEventListener("click", () => modalAdd.style.display = "none");
window.addEventListener("click", (e) => {
  if (e.target === modalAdd) modalAdd.style.display = "none";
});
fecharModalEdt.addEventListener("click", () => modalEdt.style.display = "none");
window.addEventListener("click", (e) => {
  if (e.target === modalEdt) modalEdt.style.display = "none";
});


// === AO CARREGAR PÁGINA ===
document.addEventListener("DOMContentLoaded", () => {
  const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
  document.getElementById("sairConta").addEventListener("click", sair);

  function sair() {
      localStorage.removeItem("usuarioLogado");
      window.location.href = "../pagina_inicial/index.html";
  }

  if (!usuario) return (window.location.href = "../login/login.html");

  // === CADASTRAR TALHÃO ===
  formAdd.addEventListener("submit", async (e) => {
    e.preventDefault();
    const dados = Object.fromEntries(new FormData(formAdd));
    dados.usuarios_id_usuario = usuario.id_usuario;
    if (!dados.descricao.trim()) dados.descricao = "-";

    await fetch("http://localhost:3000/talhoes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });

    formAdd.reset();
    modalAdd.style.display = "none";
    listarTalhoes();
  });

  // === EDITAR TALHÃO ===
  formEdt.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!editandoId) return;

    const dados = Object.fromEntries(new FormData(formEdt));
    await fetch(`http://localhost:3000/talhoes/${editandoId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });

    modalEdt.style.display = "none";
    editandoId = null;
    listarTalhoes();
  });

  // === LISTAR TALHÕES ===
  async function listarTalhoes() {
    const res = await fetch(`http://localhost:3000/talhoes/${usuario.id_usuario}`);
    const talhoes = await res.json();

    if (talhoes.length === 0) {
      corpoTabela.innerHTML = `
        <tr>
          <td colspan="4" style="text-align:center; padding: 20px; color:#555;">
            Você ainda não possui talhões cadastrados!
          </td>
        </tr>
      `;
      return;
    }

    corpoTabela.innerHTML = talhoes.map(t => `
      <tr>
        <td>${t.nome}</td>
        <td>${t.area} ha</td>
        <td>${t.descricao}</td>
        <td class="acoes">
          <button class="btn-editar" data-id="${t.id_talhao}" data-nome="${t.nome}" data-area="${t.area}" data-descricao="${t.descricao}">
            <img src="../images/editar.png" class="imgBotao" alt="Editar Talhão">
          </button>
          <button class="btn-excluir" data-id="${t.id_talhao}">
            <img src="../images/excluir.png" class="imgBotao" alt="Excluir Talhão">
          </button>
        </td>
      </tr>
    `).join("");

    // === BOTÕES DE EDITAR ===
    document.querySelectorAll(".btn-editar").forEach(btn => {
      btn.addEventListener("click", () => {
        editandoId = btn.dataset.id;
        document.getElementById("nomeEdt").value = btn.dataset.nome;
        document.getElementById("areaEdt").value = btn.dataset.area;
        document.getElementById("descricaoEdt").value = btn.dataset.descricao;
        modalEdt.style.display = "flex";
      });
    });

    // === BOTÕES DE EXCLUIR ===
    let idParaExcluir = null;

    document.querySelectorAll(".btn-excluir").forEach(btn => {
        btn.addEventListener("click", () => {
            idParaExcluir = btn.dataset.id;
            document.getElementById("modalConfirmar").style.display = "flex";
        });
    });

    document.getElementById("btnConfirmarExcluir").addEventListener("click", async () => {
        await fetch(`http://localhost:3000/talhoes/${idParaExcluir}`, { method: "DELETE" });
        listarTalhoes();
        document.getElementById("modalConfirmar").style.display = "none";
    });

    document.getElementById("btnCancelarExcluir").addEventListener("click", () => {
        document.getElementById("modalConfirmar").style.display = "none";
    });

  }

  listarTalhoes();
});

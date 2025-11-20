const modal = document.getElementById("modal");
const abrirModal = document.getElementById("abrirModal");
const fecharModal = document.getElementById("fecharModal");
const form = document.getElementById("formAtividade");
const corpoTabela = document.getElementById("resultado");

// === Modal de Confirmação ===
const modalConfirmar = document.getElementById("modalConfirmar");
const btnConfirmarExcluir = document.getElementById("btnConfirmarExcluir");
const btnCancelarExcluir = document.getElementById("btnCancelarExcluir");

let idParaExcluir = null; // ID da atividade que será excluída

// === Abrir Modal ===
abrirModal.addEventListener("click", () => {
  form.reset();
  document.querySelector(".caixa-modal h2").innerText = "Adicionar Atividade";
  document.querySelector('.botoes button[type="submit"]').innerText = "Cadastrar Atividade";
  modal.style.display = "flex";
});

// === Fechar Modal ===
fecharModal.addEventListener("click", () => modal.style.display = "none");
window.addEventListener("click", (e) => {
  if (e.target === modal) modal.style.display = "none";
});

// === Carregar dados iniciais ===
document.addEventListener("DOMContentLoaded", async () => {
  const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
  document.getElementById("sairConta").addEventListener("click", sair);

  function sair() {
      localStorage.removeItem("usuarioLogado");
      window.location.href = "../pagina_inicial/index.html";
  }
  if (!usuario) return (window.location.href = "../login/login.html");
  
  const idUsuario = usuario.id_usuario;
  const selectTalhao = document.getElementById("selectTalhao");

  // === Preencher SELECT dos talhões ===
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

  // === Função para LISTAR atividades ===
  async function listarAtividades() {
    try {
      const res = await fetch(`http://localhost:3000/atividades/${idUsuario}`);
      const atividades = await res.json();

      if (!Array.isArray(atividades) || atividades.length === 0) {
        corpoTabela.innerHTML = `
          <tr>
            <td colspan="4" style="text-align:center; padding: 20px; color:#555;">
              Você ainda não possui atividades cadastradas!
            </td>
          </tr>
        `;
        return;
      }

      corpoTabela.innerHTML = atividades.map(a => `
        <tr>
          <td>${a.nome}</td>
          <td>${new Date(a.data).toLocaleDateString('pt-BR')}</td>
          <td>${a.descricao}</td>
          <td>${a.talhao_nome || a.talhoes_id_talhao}</td>
          <td class="acoes">
            <button class="btn-editar"
              data-id="${a.id_atividade}"
              data-nome="${a.nome}"
              data-data="${a.data}"
              data-descricao="${a.descricao}"
              data-talhoes_id_talhao="${a.talhoes_id_talhao}">
              <img src="../images/editar.png" class="imgBotao" alt="Editar atividade">
            </button>

            <button class="btn-excluir" data-id="${a.id_atividade}">
              <img src="../images/excluir.png" class="imgBotao" alt="Excluir atividade">
            </button>
          </td>
        </tr>
      `).join("");

      adicionarEventosBotoes();
    } catch (erro) {
      console.error("Erro ao listar atividades:", erro);
    }
  }

  listarAtividades();

  // === Funções dos botões ===
  function adicionarEventosBotoes() {

    // Botão EDITAR
    document.querySelectorAll(".btn-editar").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        const nome = btn.getAttribute("data-nome");
        const data = btn.getAttribute("data-data").split("T")[0];
        const descricao = btn.getAttribute("data-descricao");
        const talhaoId = btn.getAttribute("data-talhoes_id_talhao");

        document.getElementById("nomeAtv").value = nome;
        document.getElementById("dataAtv").value = data;
        document.getElementById("descricaoAtv").value = descricao;
        document.getElementById("selectTalhao").value = talhaoId;

        document.querySelector(".caixa-modal h2").innerText = "Editar Atividade";
        document.querySelector('.botoes button[type="submit"]').innerText = "Salvar Alterações";

        modal.style.display = "flex";
        form.dataset.editando = id;
      });
    });

    // Botão EXCLUIR — agora abre modal de confirmação
    document.querySelectorAll(".btn-excluir").forEach(btn => {
      btn.addEventListener("click", () => {
        idParaExcluir = btn.dataset.id;
        modalConfirmar.style.display = "flex";
      });
    });
  }

  // === Confirmar EXCLUSÃO ===
  btnConfirmarExcluir.addEventListener("click", async () => {
    if (idParaExcluir) {
      await fetch(`http://localhost:3000/atividades/${idParaExcluir}`, {
        method: "DELETE"
      });
      listarAtividades();
      modalConfirmar.style.display = "none";
      idParaExcluir = null;
    }
  });

  // === Cancelar EXCLUSÃO ===
  btnCancelarExcluir.addEventListener("click", () => {
    modalConfirmar.style.display = "none";
    idParaExcluir = null;
  });

  // === Enviar formulário ===
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nome = document.getElementById("nomeAtv").value.trim();
    const data = document.getElementById("dataAtv").value;
    let descricao = document.getElementById("descricaoAtv").value.trim();
    const talhaoSelecionado = document.getElementById("selectTalhao").value;

    if (!nome || !data || !talhaoSelecionado) {
      alert("Preencha todos os campos obrigatórios!");
      return;
    }

    if (!descricao) descricao = "-";

    const atividade = {
      nome,
      data,
      descricao,
      talhoes_id_talhao: parseInt(talhaoSelecionado),
      usuarios_id_usuario: parseInt(idUsuario)
    };

    const idEditando = form.dataset.editando;
    const url = idEditando
      ? `http://localhost:3000/atividades/${idEditando}`
      : "http://localhost:3000/atividades";

    const metodo = idEditando ? "PUT" : "POST";

    try {
      const resposta = await fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(atividade)
      });

      if (resposta.ok) {
        modal.style.display = "none";
        form.reset();
        delete form.dataset.editando;
        listarAtividades();
      } else {
        const erro = await resposta.json();
        alert("Erro ao salvar atividade: " + erro.erro);
      }
    } catch (erro) {
      console.error("Erro ao cadastrar atividade:", erro);
    }
  });
});

const modalConfirmar = document.getElementById("modalConfirmar");
const btnConfirmarExcluir = document.getElementById("btnConfirmarExcluir");
const btnCancelarExcluir = document.getElementById("btnCancelarExcluir");
const excluirConta = document.getElementById("excluirConta");


document.addEventListener("DOMContentLoaded", () => {
  const usuarioSalvo = localStorage.getItem("usuarioLogado");

  if (usuarioSalvo) {
    const usuario = JSON.parse(usuarioSalvo);
    const saudacao = document.getElementById("saudacao");
    const emailInfo = document.getElementById("emailInfo");

    if (saudacao && usuario.nome) {
      const primeiroNome = usuario.nome.split(" ")[0];
      saudacao.textContent = `Olá, ${primeiroNome}!`;
    }
    if (emailInfo && usuario.email) {
      emailInfo.textContent = `Seu email é: ${usuario.email}`;
    }
  } else {
    window.location.href = "../login/login.html";
  }
  excluirConta.addEventListener("click", () => {
    const usuarioSalvo = JSON.parse(localStorage.getItem("usuarioLogado"));
    idParaExcluir = usuarioSalvo.id_usuario;   // << AQUI AGORA FUNCIONA
    modalConfirmar.style.display = "flex";
  });

    // === Cancelar EXCLUSÃO ===
  btnCancelarExcluir.addEventListener("click", () => {
    modalConfirmar.style.display = "none";
    idParaExcluir = null;
  });
  // Fechar modal ao clicar fora dele
  modalConfirmar.addEventListener("click", (event) => {
  // Se o clique foi no fundo (overlay), fecha
    if (event.target === modalConfirmar) {
      modalConfirmar.style.display = "none";
        idParaExcluir = null;
  }
});

  btnConfirmarExcluir.addEventListener("click", async () => {
    if (idParaExcluir) {
      await fetch(`http://localhost:3000/usuarios/${idParaExcluir}`, {
        method: "DELETE"
      });
      modalConfirmar.style.display = "none";
      idParaExcluir = null;
      window.location.href = "../pagina_inicial/index.html";

    }
  });
});

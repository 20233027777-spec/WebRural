async function cadastrarUsuario(event) {
  event.preventDefault(); // impede o reload da página

  const nome = document.getElementById("nome").value;
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;
  const confirmarSenha = document.getElementById("confirmarSenha").value;

  const resposta = await fetch("http://localhost:3000/usuarios", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome, email, senha, confirmarSenha }),
  });


  console.log("Status da resposta:", resposta.status, "OK:", resposta.ok);

  if (resposta.ok) {
  setTimeout(() => {
    window.location.href = "../login/login.html";
  }, 1500);
  }
}

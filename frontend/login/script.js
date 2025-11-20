async function fazerLogin() {
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  if (!email || !senha) {
    alert("Por favor, preencha todos os campos!");
    return;
  }

  try {
    const resposta = await fetch("http://localhost:3000/usuarios/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha }),
    });

    const data = await resposta.json();
    if (data.erro) alert(data.erro);

    if (resposta.ok) {
      localStorage.setItem(
      "usuarioLogado",
      JSON.stringify({
        id_usuario: data.id_usuario,
        nome: data.nome,
        email: data.email,
      })
    );

      window.location.href = "../talhoes/talhoes.html";
    }
  } catch (erro) {
    console.error("Erro ao tentar fazer login:", erro);
    alert("Erro de conexão com o servidor!");
  }
}

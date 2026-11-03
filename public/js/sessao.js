const botaoSair = document.getElementById("sair");
const nomeUsuario = document.querySelector(".user-name");

botaoSair.addEventListener("click", async () => {
  await fetch("/api/logout", { method: "POST" });
  window.location.href = "login.html";
});

async function carregarUsuario() {
  const resposta = await fetch("/api/eu");
  if (!resposta.ok) {
    return;
  }
  const usuario = await resposta.json();
  nomeUsuario.textContent = usuario.nome;
  if (usuario.nivel < 2) {
    document.body.className = "so-visualiza";
  }
}

carregarUsuario();
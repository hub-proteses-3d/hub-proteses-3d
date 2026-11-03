const formSenha = document.getElementById("form-senha");
const mensagem = document.getElementById("mensagem");

function mostrarMensagem(texto, erro) {
  mensagem.textContent = texto;
  mensagem.className = "mensagem";
  if (erro) {
    mensagem.className = "mensagem mensagem-erro";
  }
  mensagem.hidden = false;
}

formSenha.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const senhaAtual = document.getElementById("senhaAtual").value;
  const novaSenha = document.getElementById("novaSenha").value;
  const confirmarSenha = document.getElementById("confirmarSenha").value;

  if (novaSenha !== confirmarSenha) {
    mostrarMensagem("A nova senha e a confirmação não são iguais.", true);
    return;
  }

  try {
    const resposta = await fetch("/api/alterar-senha", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ senhaAtual: senhaAtual, novaSenha: novaSenha }),
    });
    if (resposta.status === 401) {
      window.location.href = "login.html";
      return;
    }
    const dados = await resposta.json();
    if (!resposta.ok) {
      mostrarMensagem(dados.erro, true);
      return;
    }
    formSenha.reset();
    mostrarMensagem("Senha alterada com sucesso.", false);
  } catch {
    mostrarMensagem("Não foi possível conectar ao servidor.", true);
  }
});

document.getElementById("cancelar").addEventListener("click", () => {
  history.back();
});
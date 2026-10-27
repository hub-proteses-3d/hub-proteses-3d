const form = document.getElementById("form-demanda");
const mensagem = document.getElementById("mensagem");

function mostrarMensagem(texto, erro) {
  mensagem.textContent = texto;
  mensagem.className = "mensagem";
  if (erro) {
    mensagem.className = "mensagem mensagem-erro";
  }
  mensagem.hidden = false;
}

form.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const pedido = {
    codigoCaso: document.getElementById("codigoCaso").value.trim(),
    tipoProtese: document.getElementById("tipoProtese").value.trim(),
    urgencia: document.getElementById("urgencia").value,
    material: document.getElementById("material").value,
    infillMinimo: Number(document.getElementById("infillMinimo").value),
    responsavelClinico: document.getElementById("responsavelClinico").value.trim(),
    cidade: document.getElementById("cidade").value,
    observacoes: document.getElementById("observacoes").value.trim(),
    arquivoUrl: document.getElementById("arquivoUrl").value.trim(),
  };

  try {
    const resposta = await fetch("/api/pedidos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pedido),
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
    form.reset();
    mostrarMensagem("Pedido #" + dados.numero + " criado com sucesso.", false);
  } catch {
    mostrarMensagem("Não foi possível conectar ao servidor.", true);
  }
});
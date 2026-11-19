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
  const arquivo = document.getElementById("arquivo").files[0];
  if (!arquivo || !arquivo.name.toLowerCase().endsWith(".stl")) {
    mostrarMensagem("Escolha um arquivo .stl.", true);
    return;
  }
  if (arquivo.size > 50 * 1024 * 1024) {
    mostrarMensagem("O arquivo deve ter até 50 MB.", true);
    return;
  }

  const pedido = {
    codigoCaso: document.getElementById("codigoCaso").value.trim(),
    tipoProtese: document.getElementById("tipoProtese").value.trim(),
    urgencia: document.getElementById("urgencia").value,
    material: document.getElementById("material").value,
    infillMinimo: Number(document.getElementById("infillMinimo").value),
    responsavelClinico: document.getElementById("responsavelClinico").value.trim(),
    cidade: document.getElementById("cidade").value,
    observacoes: document.getElementById("observacoes").value.trim(),
    dataLimite: document.getElementById("dataLimite").value,
  };

  try {
    mostrarMensagem("Enviando arquivo...", false);
    const respostaArquivo = await fetch("/api/arquivos?nome=" + encodeURIComponent(arquivo.name), {
      method: "POST",
      body: arquivo,
    });
    if (respostaArquivo.status === 401) {
      window.location.href = "login.html";
      return;
    }
    const dadosArquivo = await respostaArquivo.json();
    if (!respostaArquivo.ok) {
      mostrarMensagem(dadosArquivo.erro, true);
      return;
    }
    pedido.arquivoId = dadosArquivo.arquivoId;
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
    window.location.href = "aacd-matchmaking.html?numero=" + dados.numero + "&novo=1";
  } catch {
    mostrarMensagem("Não foi possível conectar ao servidor.", true);
  }
});
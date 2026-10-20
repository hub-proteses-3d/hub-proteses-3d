const form = document.getElementById("form-demanda");
const mensagem = document.getElementById("mensagem");

form.addEventListener("submit", (evento) => {
  evento.preventDefault();

  const campoInfill = document.getElementById("infillMinimo");
  let infillMinimo = null;
  if (campoInfill.value !== "") {
    infillMinimo = Number(campoInfill.value);
  }

  const pedido = {
    codigoCaso: document.getElementById("codigoCaso").value.trim(),
    tipoProtese: document.getElementById("tipoProtese").value.trim(),
    urgencia: document.getElementById("urgencia").value,
    material: document.getElementById("material").value,
    infillMinimo: infillMinimo,
    responsavelClinico: document.getElementById("responsavelClinico").value.trim(),
    cidade: document.getElementById("cidade").value.trim(),
    observacoes: document.getElementById("observacoes").value.trim(),
    arquivoUrl: document.getElementById("arquivoUrl").value.trim(),
  };

  console.log("Pedido pronto para enviar:", pedido);
  mensagem.textContent = "Demanda " + pedido.codigoCaso + " pronta. O envio para o servidor entra quando a rota de pedidos existir.";
  mensagem.hidden = false;
});
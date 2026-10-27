const numero = new URLSearchParams(window.location.search).get("numero");
const erro = document.getElementById("erro");

const TEXTOS_ETAPA = {
  "Atribuído": "Ao aceitar, o pedido fica com a sua unidade e você pode iniciar a impressão. Ao recusar, o pedido volta para Aberto e a AACD escolhe outro parceiro.",
  "Em impressão": "Depois de enviado, a AACD faz a validação.",
  "Enviado": "A AACD vai receber a peça e fazer a validação.",
  "Em validação": "A AACD está validando a prótese.",
  "Aprovado": "A prótese foi aprovada. Falta a AACD marcar como entregue.",
  "Entregue": "Pedido encerrado.",
};

function mostrarErro(texto) {
  erro.textContent = texto;
  erro.hidden = false;
}

function mostrarPedido(pedido) {
  const urgencia = URGENCIAS[pedido.urgencia];
  document.getElementById("numero").textContent = pedido.numero;
  document.getElementById("subtitulo").textContent = pedido.tipoProtese + " · Caso " + pedido.codigoCaso;

  const dados = document.getElementById("dados-pedido");
  dados.appendChild(linhaDado("Status Atual", criarEtiqueta(pedido.status, CORES_STATUS[pedido.status])));
  dados.appendChild(linhaDado("Urgência", criarEtiqueta(urgencia.texto, urgencia.classe)));
  dados.appendChild(linhaDado("Código do caso", pedido.codigoCaso));
  dados.appendChild(linhaDado("Data de Solicitação", formatarData(pedido.criadoEm)));
  dados.appendChild(linhaDado("Responsável Clínico", pedido.responsavelClinico || "—"));
  dados.appendChild(linhaDado("Filamento", pedido.material));
  dados.appendChild(linhaDado("Infill mínimo", pedido.infillMinimo + "%"));
  dados.appendChild(linhaDado("Arquivo de Fatiamento", linkArquivo(pedido.arquivoUrl)));
}

function mostrarProximaEtapa(pedido) {
  const etapas = document.getElementById("etapas");
  etapas.appendChild(criarEtiqueta(pedido.status, CORES_STATUS[pedido.status]));

  const proxima = ETAPAS[ETAPAS.indexOf(pedido.status) + 1];
  if (pedido.status !== "Reprovado" && proxima) {
    const seta = document.createElement("span");
    seta.textContent = "→";
    etapas.appendChild(seta);
    etapas.appendChild(criarEtiqueta(proxima, CORES_STATUS[proxima]));
  }

  let texto = TEXTOS_ETAPA[pedido.status];
  if (pedido.status === "Reprovado") {
    texto = "Pedido reprovado pela AACD. Motivo: " + pedido.motivoReprovacao;
  }
  document.getElementById("texto-etapa").textContent = texto;
}

function mostrarBotoes(pedido, usuario) {
  const podeAlterar = usuario.nivel >= 2;

  if (pedido.status === "Atribuído") {
    document.getElementById("aviso").hidden = false;
    if (podeAlterar) {
      document.getElementById("recusar").hidden = false;
      document.getElementById("aceitar").hidden = false;
      document.getElementById("dica-recusar").hidden = false;
    }
    return;
  }

  const acompanhamento = document.getElementById("ver-acompanhamento");
  acompanhamento.href = "parceiro-acompanhamento.html?numero=" + pedido.numero;
  acompanhamento.hidden = false;
  if (pedido.status === "Em impressão" && podeAlterar) {
    document.getElementById("enviar").hidden = false;
  }
}

async function alterar(status) {
  erro.hidden = true;
  try {
    await mudarStatus(numero, status);
    if (status === "Aberto") {
      window.location.href = "parceiro-dashboard.html";
    } else {
      window.location.reload();
    }
  } catch (falha) {
    mostrarErro(falha.message);
  }
}

document.getElementById("aceitar").addEventListener("click", () => {
  alterar("Em impressão");
});

document.getElementById("recusar").addEventListener("click", () => {
  if (confirm("Recusar a demanda #" + numero + "? Ela volta para a AACD escolher outro parceiro.")) {
    alterar("Aberto");
  }
});

document.getElementById("enviar").addEventListener("click", () => {
  alterar("Enviado");
});

async function carregarDemanda() {
  try {
    const dados = await carregarUnidade();
    const pedido = await buscarDados("/api/pedido?numero=" + numero);

    document.getElementById("unidade").textContent = dados.parceiro.nome + " – " + dados.parceiro.cidade;
    document.getElementById("link-unidade").href = "parceiro-unidade.html?id=" + dados.parceiro._id;

    mostrarPedido(pedido);
    mostrarProximaEtapa(pedido);
    mostrarBotoes(pedido, dados.usuario);
  } catch (falha) {
    mostrarFalhaPedido(falha.message);
  }
}

carregarDemanda();

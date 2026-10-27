const numero = new URLSearchParams(window.location.search).get("numero");
const erro = document.getElementById("erro");

const BOTOES = {
  "Atribuído": { texto: "Aceitar", status: "Em impressão" },
  "Em impressão": { texto: "Marcar como enviado", status: "Enviado" },
};

function mostrarErro(texto) {
  erro.textContent = texto;
  erro.hidden = false;
}

function mostrarLinhaDoTempo(status) {
  const linha = document.getElementById("linha-tempo");
  let atual = ETAPAS.indexOf(status);
  if (status === "Reprovado") {
    atual = ETAPAS.indexOf("Em validação");
  }

  for (let i = 0; i < ETAPAS.length; i++) {
    if (i > 0) {
      const traco = document.createElement("div");
      traco.className = "step-line";
      if (i <= atual) {
        traco.className = "step-line done";
      }
      linha.appendChild(traco);
    }

    const etapa = document.createElement("div");
    etapa.className = "step";
    const circulo = document.createElement("div");
    circulo.className = "step-circle";
    const nome = document.createElement("div");
    nome.className = "step-label";
    nome.textContent = ETAPAS[i];

    if (i < atual || status === "Entregue") {
      circulo.className = "step-circle done";
    } else if (i === atual) {
      circulo.className = "step-circle current";
      nome.className = "step-label active";
    }

    etapa.appendChild(circulo);
    etapa.appendChild(nome);
    linha.appendChild(etapa);
  }
}

function mostrarPedido(pedido) {
  const dados = document.getElementById("dados-pedido");
  dados.appendChild(linhaDado("Status atual", criarEtiqueta(pedido.status, CORES_STATUS[pedido.status])));
  dados.appendChild(linhaDado("Código do caso", pedido.codigoCaso));
  dados.appendChild(linhaDado("Data de Solicitação", formatarData(pedido.criadoEm)));
  dados.appendChild(linhaDado("Responsável Clínico", pedido.responsavelClinico || "—"));
  dados.appendChild(linhaDado("Arquivo de Fatiamento", linkArquivo(pedido.arquivoUrl)));

  const validacao = document.getElementById("dados-validacao");
  validacao.appendChild(linhaDado("Infill mínimo", pedido.infillMinimo + "%"));
  validacao.appendChild(linhaDado("Filamento", pedido.material));

  if (pedido.status === "Reprovado") {
    const reprovado = document.getElementById("reprovado");
    reprovado.textContent = "Pedido reprovado pela AACD. Motivo: " + pedido.motivoReprovacao;
    reprovado.hidden = false;
  }
}

function mostrarBotao(pedido, usuario) {
  const botao = BOTOES[pedido.status];
  if (!botao || usuario.nivel < 2) {
    return;
  }
  const proxima = document.getElementById("proxima");
  proxima.textContent = botao.texto;
  proxima.hidden = false;
  proxima.addEventListener("click", async () => {
    erro.hidden = true;
    try {
      await mudarStatus(numero, botao.status);
      window.location.reload();
    } catch (falha) {
      mostrarErro(falha.message);
    }
  });
}

async function carregarAcompanhamento() {
  try {
    const dados = await carregarUnidade();
    const pedido = await buscarDados("/api/pedido?numero=" + numero);

    document.getElementById("numero").textContent = pedido.numero;
    document.getElementById("subtitulo").textContent =
      pedido.tipoProtese + " · " + dados.parceiro.nome + " – " + dados.parceiro.cidade;

    const voltar = document.getElementById("voltar");
    voltar.href = "parceiro-demanda.html?numero=" + pedido.numero;
    voltar.textContent = "← Voltar à demanda #" + pedido.numero;

    mostrarLinhaDoTempo(pedido.status);
    mostrarPedido(pedido);
    mostrarBotao(pedido, dados.usuario);
  } catch (falha) {
    mostrarErro(falha.message);
  }
}

carregarAcompanhamento();

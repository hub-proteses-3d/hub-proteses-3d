const numero = new URLSearchParams(window.location.search).get("numero");
const mensagem = document.getElementById("mensagem");
const linhaDoTempo = document.getElementById("linha-do-tempo");
const detalhes = document.getElementById("detalhes");
const validacao = document.getElementById("validacao");
const acoes = document.getElementById("acoes");
const janela = document.getElementById("janela-reprovar");
const formReprovar = document.getElementById("form-reprovar");
const motivo = document.getElementById("motivo");

const ETAPAS = ["Aberto", "Atribuído", "Em impressão", "Enviado", "Em validação", "Aprovado", "Entregue"];

const CORES_STATUS = {
  "Aberto": "pill-warning",
  "Atribuído": "pill-neutral",
  "Em impressão": "pill-info",
  "Enviado": "pill-info",
  "Em validação": "pill-success",
  "Aprovado": "pill-success",
  "Reprovado": "pill-danger",
  "Entregue": "pill-success",
};

function mostrarMensagem(texto, erro) {
  mensagem.textContent = texto;
  mensagem.className = "mensagem";
  if (erro) {
    mensagem.className = "mensagem mensagem-erro";
  }
  mensagem.hidden = false;
}

function adicionarLinha(caixa, rotulo, valor) {
  const linha = document.createElement("div");
  linha.className = "kv-row";
  const nome = document.createElement("span");
  nome.className = "kv-label";
  nome.textContent = rotulo;
  const conteudo = document.createElement("span");
  conteudo.className = "kv-value";
  conteudo.textContent = valor;
  linha.appendChild(nome);
  linha.appendChild(conteudo);
  caixa.appendChild(linha);
  return conteudo;
}

function etapaAtual(status) {
  if (status === "Reprovado") {
    return ETAPAS.indexOf("Em validação");
  }
  if (status === "Entregue") {
    return ETAPAS.length;
  }
  return ETAPAS.indexOf(status);
}

function mostrarLinhaDoTempo(status) {
  const atual = etapaAtual(status);

  for (let i = 0; i < ETAPAS.length; i++) {
    if (i > 0) {
      const traco = document.createElement("div");
      traco.className = "step-line";
      if (i <= atual) {
        traco.className = "step-line done";
      }
      linhaDoTempo.appendChild(traco);
    }

    const etapa = document.createElement("div");
    etapa.className = "step";
    const bolinha = document.createElement("div");
    bolinha.className = "step-circle";
    const nome = document.createElement("div");
    nome.className = "step-label";
    nome.textContent = ETAPAS[i];

    if (i < atual) {
      bolinha.className = "step-circle done";
    }
    if (i === atual) {
      bolinha.className = "step-circle current";
      nome.className = "step-label active";
    }

    etapa.appendChild(bolinha);
    etapa.appendChild(nome);
    linhaDoTempo.appendChild(etapa);
  }
}

function mostrarDetalhes(pedido) {
  const status = adicionarLinha(detalhes, "Status atual", "");
  const etiqueta = document.createElement("span");
  etiqueta.className = "pill " + CORES_STATUS[pedido.status];
  etiqueta.textContent = pedido.status;
  status.appendChild(etiqueta);

  adicionarLinha(detalhes, "Código do caso", pedido.codigoCaso);
  adicionarLinha(detalhes, "Data de solicitação", new Date(pedido.criadoEm).toLocaleDateString("pt-BR"));

  let responsavel = "—";
  if (pedido.responsavelClinico) {
    responsavel = pedido.responsavelClinico;
  }
  adicionarLinha(detalhes, "Responsável clínico", responsavel);

  const arquivo = adicionarLinha(detalhes, "Arquivo de fatiamento", "");
  const link = document.createElement("a");
  link.href = pedido.arquivoUrl;
  link.textContent = pedido.arquivoUrl.split("/").pop();
  arquivo.appendChild(link);
}

function mostrarValidacao(pedido) {
  adicionarLinha(validacao, "Infill mínimo exigido", pedido.infillMinimo + "%");
  adicionarLinha(validacao, "Filamento", pedido.material);
  if (pedido.status === "Reprovado") {
    adicionarLinha(validacao, "Motivo da reprovação", pedido.motivoReprovacao);
  }
}

async function mudarStatus(novoStatus, textoMotivo) {
  try {
    const resposta = await fetch("/api/pedido/status?numero=" + numero, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: novoStatus, motivo: textoMotivo }),
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
    mostrarMensagem("Pedido #" + numero + " agora está " + novoStatus + ".", false);
    carregar();
  } catch {
    mostrarMensagem("Não foi possível conectar ao servidor.", true);
  }
}

function criarBotao(texto, classe) {
  const botao = document.createElement("button");
  botao.type = "button";
  botao.className = "btn " + classe;
  botao.textContent = texto;
  acoes.appendChild(botao);
  return botao;
}

function mostrarAcoes(pedido) {
  acoes.textContent = "";

  if (pedido.status === "Aberto") {
    const link = document.createElement("a");
    link.className = "btn btn-primary";
    link.href = "aacd-matchmaking.html?numero=" + pedido.numero;
    link.textContent = "Escolher parceiro";
    acoes.appendChild(link);
  }
  if (pedido.status === "Enviado") {
    const receber = criarBotao("Marcar como recebido", "btn-primary");
    receber.addEventListener("click", () => {
      mudarStatus("Em validação");
    });
  }
  if (pedido.status === "Em validação") {
    const reprovar = criarBotao("Reprovar", "btn-reprovar");
    reprovar.addEventListener("click", () => {
      janela.showModal();
    });
    const aprovar = criarBotao("Aprovar", "btn-primary");
    aprovar.addEventListener("click", () => {
      mudarStatus("Aprovado");
    });
  }
  if (pedido.status === "Aprovado") {
    const entregar = criarBotao("Marcar como entregue", "btn-primary");
    entregar.addEventListener("click", () => {
      mudarStatus("Entregue");
    });
  }
}

function mostrarPedido(pedido) {
  linhaDoTempo.textContent = "";
  detalhes.textContent = "";
  validacao.textContent = "";

  document.getElementById("numero").textContent = pedido.numero;
  document.getElementById("numero-janela").textContent = pedido.numero;
  let subtitulo = pedido.tipoProtese;
  if (pedido.parceiroNome) {
    subtitulo = subtitulo + " · " + pedido.parceiroNome;
  }
  document.getElementById("subtitulo").textContent = subtitulo;

  mostrarLinhaDoTempo(pedido.status);
  mostrarDetalhes(pedido);
  mostrarValidacao(pedido);
  mostrarAcoes(pedido);
}

async function carregar() {
  if (!numero) {
    mostrarMensagem("Abra esta tela pelo painel, escolhendo um pedido.", true);
    return;
  }
  try {
    const resposta = await fetch("/api/pedido?numero=" + numero);
    if (resposta.status === 401) {
      window.location.href = "login.html";
      return;
    }
    const pedido = await resposta.json();
    if (!resposta.ok) {
      mostrarMensagem(pedido.erro, true);
      return;
    }
    mostrarPedido(pedido);
  } catch {
    mostrarMensagem("Não foi possível conectar ao servidor.", true);
  }
}

document.getElementById("cancelar-reprovar").addEventListener("click", () => {
  janela.close();
});

formReprovar.addEventListener("submit", (evento) => {
  evento.preventDefault();
  janela.close();
  mudarStatus("Reprovado", motivo.value.trim());
  formReprovar.reset();
});

carregar();
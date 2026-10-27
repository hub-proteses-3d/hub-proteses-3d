const numero = new URLSearchParams(window.location.search).get("numero");
const dadosPedido = document.getElementById("dados-pedido");
const lista = document.getElementById("lista-parceiros");
const mensagem = document.getElementById("mensagem");

const URGENCIAS = { baixa: "Baixa", media: "Média", alta: "Alta" };

function mostrarMensagem(texto, erro) {
  mensagem.textContent = texto;
  mensagem.className = "mensagem";
  if (erro) {
    mensagem.className = "mensagem mensagem-erro";
  }
  mensagem.hidden = false;
}

function adicionarDado(rotulo, valor) {
  const termo = document.createElement("dt");
  termo.textContent = rotulo;
  const descricao = document.createElement("dd");
  descricao.textContent = valor;
  dadosPedido.appendChild(termo);
  dadosPedido.appendChild(descricao);
  return descricao;
}

function mostrarPedido(pedido) {
  document.getElementById("numero-titulo").textContent = pedido.numero;
  document.getElementById("numero-cartao").textContent = pedido.numero;
  adicionarDado("Código do caso", pedido.codigoCaso);
  adicionarDado("Tipo de Prótese", pedido.tipoProtese);
  adicionarDado("Urgência Clínica", URGENCIAS[pedido.urgencia]);
  adicionarDado("Filamento Necessário", pedido.material);
  adicionarDado("Infill Mínimo Exigido", pedido.infillMinimo + "%");
  adicionarDado("Cidade", pedido.cidade);

  const arquivo = adicionarDado("Arquivo de Fatiamento", "");
  const link = document.createElement("a");
  link.href = pedido.arquivoUrl;
  link.textContent = pedido.arquivoUrl.split("/").pop();
  arquivo.appendChild(link);
}

function criarEtiqueta(texto, classe) {
  const etiqueta = document.createElement("span");
  etiqueta.className = "pill " + classe;
  etiqueta.textContent = texto;
  return etiqueta;
}

async function atribuir(pedido, parceiro) {
  try {
    const resposta = await fetch("/api/pedido/status?numero=" + pedido.numero, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "Atribuído", parceiroId: parceiro._id }),
    });
    const dados = await resposta.json();
    if (!resposta.ok) {
      mostrarMensagem(dados.erro, true);
      return;
    }
    lista.textContent = "";
    mostrarMensagem("Pedido #" + pedido.numero + " atribuído a " + parceiro.nome + ".", false);
  } catch {
    mostrarMensagem("Não foi possível conectar ao servidor.", true);
  }
}

function mostrarParceiros(pedido, parceiros) {
  if (parceiros.length === 0) {
    mostrarMensagem("Nenhum parceiro homologado tem o material " + pedido.material + ".", true);
    return;
  }

  let primeiro = true;
  for (const parceiro of parceiros) {
    const cartao = document.createElement("div");
    cartao.className = "match-card";

    const info = document.createElement("div");
    const nome = document.createElement("div");
    nome.className = "match-name";
    nome.textContent = parceiro.nome;
    const cidade = document.createElement("div");
    cidade.className = "match-cidade";
    cidade.textContent = parceiro.cidade;
    info.appendChild(nome);
    info.appendChild(cidade);

    const direita = document.createElement("div");
    direita.className = "match-right";
    direita.appendChild(criarEtiqueta("Tem o material: sim", "pill-success"));
    if (parceiro.cidade === pedido.cidade) {
      direita.appendChild(criarEtiqueta("Mesma cidade: sim", "pill-success"));
    } else {
      direita.appendChild(criarEtiqueta("Mesma cidade: não", "pill-neutral"));
    }

    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = "btn btn-claro";
    botao.textContent = "Atribuir pedido";
    botao.addEventListener("click", () => {
      atribuir(pedido, parceiro);
    });
    direita.appendChild(botao);

    if (primeiro) {
      cartao.className = "match-card top";
      botao.className = "btn btn-primary";
      primeiro = false;
    }

    cartao.appendChild(info);
    cartao.appendChild(direita);
    lista.appendChild(cartao);
  }
}

async function buscar(endereco) {
  const resposta = await fetch(endereco);
  if (resposta.status === 401) {
    window.location.href = "login.html";
    return null;
  }
  const dados = await resposta.json();
  if (!resposta.ok) {
    mostrarMensagem(dados.erro, true);
    return null;
  }
  return dados;
}

async function carregar() {
  if (!numero) {
    mostrarMensagem("Abra esta tela pelo painel, escolhendo um pedido.", true);
    return;
  }
  try {
    const pedido = await buscar("/api/pedido?numero=" + numero);
    if (pedido === null) {
      return;
    }
    mostrarPedido(pedido);
    if (pedido.status !== "Aberto") {
      mostrarMensagem("Este pedido está " + pedido.status + ". A escolha de parceiro é só para pedidos Abertos.", true);
      return;
    }
    const parceiros = await buscar("/api/pedido/sugestoes?numero=" + numero);
    if (parceiros === null) {
      return;
    }
    mostrarParceiros(pedido, parceiros);
  } catch {
    mostrarMensagem("Não foi possível conectar ao servidor.", true);
  }
}

carregar();
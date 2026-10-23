const lista = document.getElementById("lista-pedidos");

const URGENCIAS = {
  baixa: { texto: "Baixa", classe: "pill-success" },
  media: { texto: "Média", classe: "pill-warning" },
  alta: { texto: "Alta", classe: "pill-danger" },
};

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

function criarCelula(texto) {
  const celula = document.createElement("td");
  celula.textContent = texto;
  return celula;
}

function criarEtiqueta(texto, classe) {
  const celula = document.createElement("td");
  const etiqueta = document.createElement("span");
  etiqueta.className = "pill " + classe;
  etiqueta.textContent = texto;
  celula.appendChild(etiqueta);
  return celula;
}

function mostrarMensagem(texto) {
  const linha = document.createElement("tr");
  const celula = criarCelula(texto);
  celula.colSpan = 6;
  linha.appendChild(celula);
  lista.appendChild(linha);
}

function entregueEsteMes(pedido) {
  const hoje = new Date();
  for (const mudanca of pedido.historico) {
    if (mudanca.status === "Entregue") {
      const data = new Date(mudanca.data);
      return data.getMonth() === hoje.getMonth() && data.getFullYear() === hoje.getFullYear();
    }
  }
  return false;
}

function mostrarPedidos(pedidos) {
  let ativos = 0;
  let impressao = 0;
  let abertos = 0;
  let entregues = 0;

  for (const pedido of pedidos) {
    const urgencia = URGENCIAS[pedido.urgencia];
    const linha = document.createElement("tr");

    const celulaNumero = document.createElement("td");
    const numero = document.createElement("strong");
    numero.textContent = "#" + pedido.numero;
    celulaNumero.appendChild(numero);
    linha.appendChild(celulaNumero);

    linha.appendChild(criarCelula(pedido.tipoProtese));
    linha.appendChild(criarEtiqueta(urgencia.texto, urgencia.classe));
    linha.appendChild(criarEtiqueta(pedido.status, CORES_STATUS[pedido.status]));
    linha.appendChild(criarCelula(pedido.parceiroNome || "—"));

    const celulaLink = document.createElement("td");
    const link = document.createElement("a");
    link.href = "aacd-acompanhamento.html?numero=" + pedido.numero;
    link.className = "btn-link";
    link.textContent = "Ver detalhes →";
    celulaLink.appendChild(link);
    linha.appendChild(celulaLink);

    lista.appendChild(linha);

    if (pedido.status !== "Entregue" && pedido.status !== "Reprovado") {
      ativos++;
    }
    if (pedido.status === "Em impressão") {
      impressao++;
    }
    if (pedido.status === "Aberto") {
      abertos++;
    }
    if (pedido.status === "Entregue" && entregueEsteMes(pedido)) {
      entregues++;
    }
  }

  document.getElementById("total-ativos").textContent = ativos;
  document.getElementById("total-impressao").textContent = impressao;
  document.getElementById("total-abertos").textContent = abertos;
  document.getElementById("total-entregues").textContent = entregues;

  if (pedidos.length === 0) {
    mostrarMensagem("Nenhum pedido cadastrado ainda.");
  }
}

async function carregarPedidos() {
  try {
    const resposta = await fetch("/api/pedidos");
    if (resposta.status === 401) {
      window.location.href = "login.html";
      return;
    }
    const dados = await resposta.json();
    if (!resposta.ok) {
      mostrarMensagem(dados.erro);
      return;
    }
    mostrarPedidos(dados);
  } catch {
    mostrarMensagem("Não foi possível carregar os pedidos.");
  }
}

carregarPedidos();
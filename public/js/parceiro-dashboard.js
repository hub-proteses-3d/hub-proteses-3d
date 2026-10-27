const lista = document.getElementById("lista-pedidos");

function criarCelula(texto) {
  const celula = document.createElement("td");
  celula.textContent = texto;
  return celula;
}

function mostrarMensagem(texto) {
  const linha = document.createElement("tr");
  const celula = criarCelula(texto);
  celula.colSpan = 5;
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
  let aguardando = 0;
  let impressao = 0;
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

    const celulaUrgencia = document.createElement("td");
    celulaUrgencia.appendChild(criarEtiqueta(urgencia.texto, urgencia.classe));
    linha.appendChild(celulaUrgencia);

    const celulaStatus = document.createElement("td");
    celulaStatus.appendChild(criarEtiqueta(pedido.status, CORES_STATUS[pedido.status]));
    linha.appendChild(celulaStatus);

    const celulaLink = document.createElement("td");
    const link = document.createElement("a");
    link.href = "parceiro-demanda.html?numero=" + pedido.numero;
    link.className = "btn-link";
    link.textContent = "Ver detalhes →";
    celulaLink.appendChild(link);
    linha.appendChild(celulaLink);

    lista.appendChild(linha);

    if (pedido.status === "Atribuído") {
      aguardando++;
    }
    if (pedido.status === "Em impressão") {
      impressao++;
    }
    if (pedido.status === "Entregue" && entregueEsteMes(pedido)) {
      entregues++;
    }
  }

  document.getElementById("total-aguardando").textContent = aguardando;
  document.getElementById("total-impressao").textContent = impressao;
  document.getElementById("total-entregues").textContent = entregues;

  if (pedidos.length === 0) {
    mostrarMensagem("Nenhuma demanda recebida ainda.");
  }
}

function mostrarUnidade(parceiro) {
  document.getElementById("subtitulo").textContent =
    "Demandas recebidas para o " + parceiro.nome + " e sua capacidade produtiva";
  document.getElementById("total-capacidade").textContent = parceiro.capacidadeMensal;

  let certificacao = "Não validada";
  if (parceiro.biocompatibilidadeValidada) {
    certificacao = "Validada";
  }

  const resumo = document.getElementById("resumo-unidade");
  resumo.appendChild(linhaDado("Impressoras cadastradas", resumoImpressoras(parceiro.impressoras)));
  resumo.appendChild(linhaDado("Filamentos suportados", nomesFilamentos(parceiro.filamentos)));
  resumo.appendChild(linhaDado("Certificação de biocompatibilidade", certificacao));
}

async function carregarPainel() {
  try {
    const dados = await carregarUnidade();
    mostrarUnidade(dados.parceiro);
    const pedidos = await buscarDados("/api/pedidos");
    mostrarPedidos(pedidos);
  } catch (erro) {
    mostrarMensagem(erro.message);
  }
}

carregarPainel();

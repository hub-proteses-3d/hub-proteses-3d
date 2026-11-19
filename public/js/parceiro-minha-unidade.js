const erro = document.getElementById("erro");
const listaImpressoras = document.getElementById("lista-impressoras");
const listaFilamentos = document.getElementById("lista-filamentos");
const formImpressora = document.getElementById("form-impressora");
const formFilamento = document.getElementById("form-filamento");

let parceiroId = "";
let podeAlterar = false;

function mostrarErro(texto) {
  erro.textContent = texto;
  erro.hidden = false;
}

function criarCelula(texto) {
  const celula = document.createElement("td");
  celula.textContent = texto;
  return celula;
}

function linhaVazia(lista, texto, colunas) {
  const linha = document.createElement("tr");
  const celula = criarCelula(texto);
  celula.colSpan = colunas;
  linha.appendChild(celula);
  lista.appendChild(linha);
}

function celulaAcoes(nome, endereco) {
  const celula = document.createElement("td");
  if (!podeAlterar) {
    return celula;
  }
  const botao = document.createElement("button");
  botao.type = "button";
  botao.className = "btn-link btn-remover";
  botao.textContent = "Remover";
  botao.addEventListener("click", async () => {
    if (!confirm("Remover " + nome + "?")) {
      return;
    }
    try {
      await enviarDados(endereco, "DELETE", {});
      atualizar();
    } catch (falha) {
      mostrarErro(falha.message);
    }
  });
  celula.appendChild(botao);
  return celula;
}

function mostrarImpressoras(impressoras) {
  listaImpressoras.innerHTML = "";
  if (impressoras.length === 0) {
    linhaVazia(listaImpressoras, "Nenhuma impressora cadastrada.", 4);
  }
  for (const impressora of impressoras) {
    const linha = document.createElement("tr");
    const modelo = criarCelula("");
    const negrito = document.createElement("strong");
    negrito.textContent = impressora.modelo;
    modelo.appendChild(negrito);
    linha.appendChild(modelo);
    linha.appendChild(criarCelula(impressora.tecnologia));
    linha.appendChild(criarCelula(impressora.quantidade));
    linha.appendChild(celulaAcoes(impressora.modelo,
      "/api/impressoras?parceiroId=" + parceiroId + "&impressoraId=" + impressora._id));
    listaImpressoras.appendChild(linha);
  }
}

function mostrarFilamentos(filamentos) {
  listaFilamentos.innerHTML = "";
  if (filamentos.length === 0) {
    linhaVazia(listaFilamentos, "Nenhum filamento cadastrado.", 3);
  }
  for (const filamento of filamentos) {
    const linha = document.createElement("tr");
    const material = criarCelula("");
    const negrito = document.createElement("strong");
    negrito.textContent = filamento.material;
    material.appendChild(negrito);
    linha.appendChild(material);

    const bio = document.createElement("td");
    if (filamento.biocompativel) {
      bio.appendChild(criarEtiqueta("Sim", "pill-success"));
    } else {
      bio.appendChild(criarEtiqueta("Não", "pill-neutral"));
    }
    linha.appendChild(bio);

    linha.appendChild(celulaAcoes(filamento.material,
      "/api/filamentos?parceiroId=" + parceiroId + "&filamentoId=" + filamento._id));
    listaFilamentos.appendChild(linha);
  }
}

async function atualizar() {
  erro.hidden = true;
  try {
    const dados = await carregarUnidade();
    parceiroId = dados.parceiro._id;
    podeAlterar = dados.usuario.nivel >= 2;

    document.getElementById("subtitulo").textContent = dados.parceiro.nome + " · " + dados.parceiro.cidade;
    document.getElementById("nova-impressora").hidden = !podeAlterar;
    document.getElementById("novo-filamento").hidden = !podeAlterar;

    mostrarImpressoras(dados.parceiro.impressoras);
    mostrarFilamentos(dados.parceiro.filamentos);
  } catch (falha) {
    mostrarErro(falha.message);
  }
}

document.getElementById("nova-impressora").addEventListener("click", () => {
  formImpressora.hidden = !formImpressora.hidden;
});

document.getElementById("novo-filamento").addEventListener("click", () => {
  formFilamento.hidden = !formFilamento.hidden;
});

formImpressora.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  const impressora = {
    modelo: document.getElementById("modelo").value.trim(),
    tecnologia: document.getElementById("tecnologia").value.trim(),
    quantidade: Number(document.getElementById("quantidade").value),
  };
  try {
    await enviarDados("/api/impressoras?parceiroId=" + parceiroId, "POST", impressora);
    formImpressora.reset();
    formImpressora.hidden = true;
    atualizar();
  } catch (falha) {
    mostrarErro(falha.message);
  }
});

formFilamento.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  const filamento = {
    material: document.getElementById("material").value,
    biocompativel: document.getElementById("biocompativel").checked,
  };
  try {
    await enviarDados("/api/filamentos?parceiroId=" + parceiroId, "POST", filamento);
    formFilamento.reset();
    formFilamento.hidden = true;
    atualizar();
  } catch (falha) {
    mostrarErro(falha.message);
  }
});

atualizar();

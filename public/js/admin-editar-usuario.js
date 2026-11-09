const form = document.getElementById("form-usuario");
const tipo = document.getElementById("tipo");
const nivel = document.getElementById("nivel");
const campoParceiro = document.getElementById("campo-parceiro");
const selectParceiro = document.getElementById("parceiroId");
const mensagem = document.getElementById("mensagem");

const id = new URLSearchParams(window.location.search).get("id");

function mostrarErro(texto) {
  mensagem.textContent = texto;
  mensagem.hidden = false;
}

function atualizarCampos() {
  campoParceiro.hidden = tipo.value !== "parceiro";

  if (tipo.value === "admin") {
    nivel.value = "3";
    nivel.disabled = true;
  } else {
    nivel.disabled = false;
  }
}

async function buscarDados(endereco) {
  const resposta = await fetch(endereco);
  if (resposta.status === 401) {
    window.location.href = "login.html";
    throw new Error("Faça login para continuar");
  }
  const dados = await resposta.json();
  if (!resposta.ok) {
    throw new Error(dados.erro);
  }
  return dados;
}

async function carregarUsuario() {
  try {
    const parceiros = await buscarDados("/api/parceiros");
    for (const parceiro of parceiros) {
      const opcao = document.createElement("option");
      opcao.value = parceiro._id;
      opcao.textContent = parceiro.nome;
      selectParceiro.appendChild(opcao);
    }

    const usuarios = await buscarDados("/api/usuarios");
    let usuario = null;
    for (const item of usuarios) {
      if (item._id === id) {
        usuario = item;
      }
    }
    if (usuario === null) {
      mostrarErro("Usuário não encontrado.");
      return;
    }

    document.getElementById("nome").value = usuario.nome;
    document.getElementById("email").value = usuario.email;
    tipo.value = usuario.tipo;
    nivel.value = String(usuario.nivel);
    if (usuario.parceiroId) {
      selectParceiro.value = usuario.parceiroId;
    }
    atualizarCampos();
  } catch (erro) {
    mostrarErro(erro.message);
  }
}

tipo.addEventListener("change", atualizarCampos);

form.addEventListener("submit", (evento) => {
  evento.preventDefault();
  mostrarErro("Salvar ainda não está disponível: falta a rota no back-end.");
});

carregarUsuario();
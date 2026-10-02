
# Hub de Próteses 3D

Projeto Integrador Interdisciplinar do 2º semestre de Ciência da Computação do Instituto Mauá de Tecnologia, em parceria com a AACD.

## Sobre o projeto

A ideia do projeto é criar uma plataforma web que conecta os pedidos de próteses impressas em 3D da AACD com lugares que têm impressoras 3D disponíveis, como FabLabs de universidades do Grande ABC, voluntários e empresas.

Hoje esse contato é feito de forma manual. Com a plataforma, a AACD cadastra o pedido, os parceiros cadastram suas impressoras e o sistema indica quem tem mais condições de imprimir cada peça.

## Funcionalidades

- Cadastro e login de usuários (AACD, parceiros e administrador)
- Cadastro de parceiros e das suas impressoras e filamentos
- Criação de pedidos de próteses pela AACD
- Sugestão de parceiros para cada pedido, levando em conta o tipo de impressora, o material, a urgência e a distância
- Acompanhamento do status do pedido até a entrega

Os dados dos pacientes não são guardados no sistema, cada pedido usa só um código de identificação.

## Tecnologias

- HTML, CSS e JavaScript
- Node.js 
- MongoDB

## Como rodar

Precisa ter o Node.js instalado e um banco MongoDB (pode ser o MongoDB Atlas).

```
git clone https://github.com/hub-proteses-3d/hub-proteses-3d.git
cd hub-proteses-3d
npm install
```

Depois crie um arquivo `.env` na raiz com base no `.env.example` e rode:

```
npm start
```

## Organização

- `server/`: back-end (rotas, modelos e conexão com o banco)
- `public/`: páginas do site
- `docs/`: documentação do projeto

Cada funcionalidade é feita em uma branch separada e depois entra na `main` por pull request.

## Integrantes

- Gustavo Magno de Melo
- Gustavo Reis Acras
- Pedro Ravelli
- Gustavo Romano
- Rafael Iezzi

## Licença

MIT

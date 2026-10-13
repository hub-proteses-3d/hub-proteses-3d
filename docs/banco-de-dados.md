# Banco de dados

O projeto usa o MongoDB Atlas. O banco se chama `hub_proteses_3d` e tem três coleções.

## usuarios

Quem faz login no sistema. As contas são criadas pelo administrador.

- `nome`
- `email`: único, não pode ser alterado
- `senha`: guardada como hash
- `tipo`: `admin`, `aacd` ou `parceiro`
- `nivel`: 1 (só visualiza), 2 (visualiza e altera) ou 3 (administrador)
- `parceiroId`: de qual parceiro a pessoa é (só para o tipo `parceiro`)
- `criadoEm`

## parceiros

As unidades que imprimem: FabLabs, voluntários e empresas.

- `nome`
- `tipoUnidade`: `fablab`, `voluntario` ou `empresa`
- `cidade`
- `cnpj`: opcional
- `capacidadeMensal`: peças por mês
- `biocompatibilidadeValidada`: sim ou não
- `homologado`: sim ou não
- `impressoras`: lista com `modelo`, `tecnologia` e `quantidade`
- `filamentos`: lista com `material` e `biocompativel`
- `criadoEm`

## pedidos

Os pedidos de próteses criados pela AACD.

- `numero`: número do pedido, em sequência
- `codigoCaso`: código do caso (não guardamos dados do paciente)
- `tipoProtese`
- `urgencia`: `baixa`, `media` ou `alta`
- `material`: filamento necessário
- `infillMinimo`
- `cidade`
- `responsavelClinico`
- `observacoes`: opcional
- `arquivoUrl`: link do arquivo de fatiamento
- `status`
- `motivoReprovacao`: preenchido quando o pedido é reprovado
- `criadoPor`: usuário que criou o pedido
- `parceiroId`: parceiro escolhido
- `criadoEm`
- `historico`: lista das mudanças de status, com `status`, `data` e `usuarioId`

Para gerar o número do pedido em sequência, existe também a coleção `contadores`, que guarda o último número usado.

## Status do pedido

Aberto → Atribuído → Em impressão → Enviado → Em validação → Aprovado → Entregue

- Se o parceiro recusar, o pedido volta para Aberto.
- Se a AACD reprovar, o status vira Reprovado e o pedido é encerrado.

## Por que organizamos assim

- As impressoras e os filamentos ficam dentro do parceiro porque são poucos e sempre aparecem junto com ele.
- O histórico fica dentro do pedido pelo mesmo motivo.
- O parceiro fica separado do usuário porque várias pessoas do mesmo parceiro têm login.
- O pedido fica separado do parceiro porque um parceiro pode ter muitos pedidos.

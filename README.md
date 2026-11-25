# Patinhas & Cia Pet Shop – Projeto da disciplina Fundamentos de Sistemas Web

Plataforma online de um petshop fictício para venda de produtos e oferta de serviços de banho e tosa, com tele-busca ou entrega do pet no local.

- **Autor:** João Victor Toledo Duarte
- **Site publicado (GitHub Pages):** https://victtortoledokk.github.io/petshop-patinhas/
- **Repositório:** https://github.com/victtortoledokk/petshop-patinhas
- **Fase atual:** Fase 2 (HTML + CSS/Bootstrap + JavaScript)

## Estrutura de arquivos

```
petshop-patinhas/
├── index.html          → Página inicial (carrossel, relógio, promoção, dicas)
├── produtos.html       → Produtos das 3 categorias, filtro, busca e carrinho
├── servicos.html       → Banho, tosa e tele-busca, tabela de preços e simulador
├── agendamento.html    → Cadastro do cliente e do pet + agendamento (NOVA)
├── sobre.html          → Quem somos, contato, horários e "Fale conosco"
├── ajuda.html          → Página de ajuda dentro do site
├── README.md           → Este arquivo de ajuda
├── css/
│   └── estilo.css      → Estilos próprios (complementam o Bootstrap)
├── js/
│   ├── dados.js        → Preços, horários e funções de cálculo compartilhadas
│   ├── main.js         → Funções de todas as páginas: acessibilidade, funções temporais, carrossel
│   ├── produtos.js     → Filtro por categoria, busca e carrinho
│   ├── servicos.js     → Simulador de preço
│   ├── agendamento.js  → Máscaras, validações, CEP, calendário, resumo e confirmação
│   └── contato.js      → Validação do formulário "Fale conosco"
└── imagens/            → Logotipo, ilustrações dos produtos/serviços e slides do carrossel (SVG)
```

Todo o código (HTML, CSS e JavaScript) está comentado em português.

## Tecnologias

- **HTML5** semântico.
- **Bootstrap 5.3** (via CDN, com verificação de integridade `integrity`): grid responsivo, navbar recolhível, carrossel, cards, formulários, tabela, offcanvas (carrinho), modal (confirmação) e toasts (avisos).
- **CSS próprio** (`css/estilo.css`): cores da marca, foco visível, modo de alto contraste e ajustes de layout.
- **JavaScript puro** (sem bibliotecas além do Bootstrap), separado por página.

## Funcionalidades

### Todas as páginas
- Barra superior com o **status da loja** ("Aberto agora · fecha às 19h" ou "Fechado agora · abre amanhã às 8h"), calculado pelo horário de funcionamento e atualizado a cada minuto.
- **Barra de acessibilidade:** A−, A, A+ (tamanho do texto), Alto contraste e Ouvir página. As preferências ficam salvas no navegador.
- Menu responsivo (vira botão "hambúrguer" no celular), com a página atual destacada.
- Rodapé com endereço, contatos, links, horário, autoria e ano atualizado automaticamente.

### Início (`index.html`)
- **Carrossel** com 3 slides que trocam sozinhos a cada 6 segundos, com setas, indicadores e botão **Pausar/Reproduzir**.
- **Saudação** (bom dia / boa tarde / boa noite) e **relógio** atualizado a cada segundo.
- **Contagem regressiva** até o fim da promoção da semana.
- **Dica do dia** que muda a cada 8 segundos (com botões "Próxima dica" e "Pausar dicas").
- Atalhos para as categorias e destaques da semana.

### Produtos (`produtos.html`)
- 9 produtos (3 por categoria: acessórios, rações não perecíveis, higiene e limpeza), cada um com foto, descrição e valor.
- **Filtro por categoria** e **busca** (ignora acentos e aceita várias palavras em qualquer ordem).
- **Carrinho** em painel lateral: adicionar, aumentar, diminuir, remover, total e finalizar pedido. Fica salvo ao trocar de página.

### Serviços (`servicos.html`)
- Banho, tosa (higiênica ou completa, inclui banho) e tele-busca, com a **tabela de preços** por porte.
- **Simulador de preço** que calcula o valor na hora e leva as escolhas para a página de agendamento.

### Agendamento (`agendamento.html`) – nova na fase 2
- **Cadastro do cliente:** nome, CPF, data de nascimento, sexo, telefone, e-mail, CEP e endereço completo.
- **Cadastro do pet:** nome, espécie, raça, idade, peso, porte, observações e confirmação de vacinação.
- **Serviço:** banho ou tosa (com tipo de tosa) e adicional de hidratação.
- **Agendamento:** tele-busca (com endereço de busca) ou entrega do pet no local, **data pelo calendário** e horário.
- Elementos e atributos usados: `input` (text, email, tel, number, date), `radio`, `checkbox`, `select`, `textarea`, `datalist`, `placeholder`, `required`, `min`/`max`/`step`, `minlength`/`maxlength`, `autocomplete`, `fieldset`/`legend` e `label`.
- **JavaScript:** máscaras de CPF, telefone e CEP; validação do CPF pelos dígitos verificadores; preenchimento do endereço pelo CEP (ViaCEP); raças sugeridas conforme a espécie; porte sugerido pelo peso; campos que aparecem só quando necessários; calendário limitado (de amanhã até 60 dias, sem domingos); horários gerados conforme o dia, com horários já ocupados bloqueados; resumo e valor total em tempo real; lista de erros com links para cada campo; janela de confirmação com protocolo; lista "Meus agendamentos" com cancelamento.

### Sobre e Contato (`sobre.html`)
- Quem somos, missão, valores, contato e horários.
- Formulário "Fale conosco" com validação, contador de caracteres e confirmação.

## Acessibilidade (foco em pessoas com deficiência visual)

- Atributo **`alt`** em todas as imagens com a descrição do conteúdo (audiodescrição); imagens decorativas com `alt=""`.
- **Ouvir página:** leitura em voz alta do conteúdo principal (Web Speech API, voz em português).
- **Tamanho do texto** ajustável e **modo de alto contraste** (fundo preto, texto branco, links amarelos).
- Link **"Pular para o conteúdo principal"** e contorno de foco bem visível para navegação por teclado.
- Estrutura semântica (`header`, `nav`, `main`, `section`, `aside`, `footer`), títulos em ordem e `lang="pt-BR"`.
- Todos os campos com `label`; grupos com `fieldset`/`legend`; dicas e erros ligados por `aria-describedby`.
- Regiões `aria-live` que anunciam total, filtros, avisos e erros sem mover o foco; `aria-pressed` nos botões liga/desliga; `aria-current` no menu.
- Carrossel e dicas podem ser **pausados**; quem configurou "reduzir movimento" no sistema não recebe animações automáticas.
- Cores com contraste mínimo de 4,5:1 (WCAG AA).

## Ajustes realizados em relação à fase 1

1. **Organização em arquivos:** CSS em `css/` e JavaScript em `js/`, separados por responsabilidade e comentados.
2. **Layout responsivo com Bootstrap:** o site da fase 1 não se adaptava a celulares; agora usa grid, navbar recolhível e cards. Nenhuma página tem rolagem horizontal em telas de 390 px.
3. **Remoção de formatação no HTML:** o atributo `border="1"` das tabelas (aviso do validador do W3C na fase 1) foi trocado por classes do Bootstrap.
4. **Cabeçalho mais limpo:** endereço e horário saíram do topo de todas as páginas (continuam no rodapé e na página Sobre); o topo mostra o status da loja calculado automaticamente.
5. **Títulos:** cada página passou a ter um único `h1` com o seu próprio título (na fase 1, o `h1` era sempre o nome da loja).
6. **Serviços alinhados ao enunciado:** dois serviços (banho e tosa, com tosa higiênica ou completa) e duas formas de atendimento (tele-busca ou entrega no local), com os mesmos preços em todas as páginas (centralizados em `js/dados.js`).
7. **Formulários funcionais:** o formulário de contato, que na fase 1 era apenas estrutural, agora valida e confirma o envio; foi criada a página de cadastro e agendamento.
8. **Ano automático** no rodapé.
9. **Testes antes da publicação:** código validado no validador do W3C (sem erros) e 51 testes automáticos no navegador cobrindo carrossel, funções temporais, filtros, carrinho, simulador, formulário de agendamento, acessibilidade e layout no celular.

## Como executar

- **Online:** acesse o link do GitHub Pages acima.
- **Localmente:** baixe ou clone o repositório e abra `index.html` em um navegador atualizado. É preciso internet para carregar o Bootstrap e para a busca de CEP.

## Observações

- O Patinhas & Cia é uma empresa fictícia criada para fins acadêmicos. Preços, endereço e contatos são ilustrativos.
- Não há servidor: carrinho e agendamentos ficam salvos apenas no navegador (`localStorage`). O CPF não é salvo.
- As imagens são ilustrações próprias criadas para este projeto.

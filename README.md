# Patinhas & Cia Pet Shop – Projeto da disciplina Fundamentos de Sistemas Web (Fase 1)

Plataforma online de um petshop fictício para venda de produtos e oferta de serviços de banho e tosa, com ou sem tele-busca.

- **Autor:** João Victor Toledo Duarte
- **Site publicado (GitHub Pages):** https://victtortoledokk.github.io/petshop-patinhas/
- **Repositório:** https://github.com/victtortoledokk/petshop-patinhas

## Sobre esta fase

Na Fase 1 o site foi construído **somente com HTML5**, sem CSS, sem Bootstrap e sem JavaScript, como pede o enunciado. A aparência é a padrão do navegador; a estilização e as funções em JavaScript serão feitas na Fase 2.

## Estrutura de arquivos

```
petshop-patinhas/
├── index.html      → Página inicial
├── produtos.html   → Produtos das 3 categorias (foto, descrição e valor)
├── servicos.html   → Banho e tosa, com e sem tele-busca (descrição e valor)
├── sobre.html      → Quem somos, contato, horários e formulário
├── ajuda.html      → Página de ajuda dentro do site
├── README.md       → Este arquivo de ajuda
└── imagens/        → Logotipo e ilustrações dos produtos e serviços (SVG)
```

## Funcionalidades

### Cabeçalho (todas as páginas)
- Logotipo (link para a página inicial), nome e slogan do petshop.
- Endereço, telefone/WhatsApp (link `tel:`), e-mail (link `mailto:`) e horário de funcionamento.
- Menu de navegação para Início, Produtos, Serviços, Sobre e Contato e Ajuda. A página atual aparece em negrito e marcada com `aria-current="page"`.

### Corpo das páginas
- **Início:** boas-vindas, atalhos para as três categorias de produtos, três produtos em destaque e resumo dos serviços.
- **Produtos:** índice com links internos (âncoras) para cada categoria e 3 produtos por categoria, cada um com foto, nome, descrição e valor:
  - *Acessórios:* cama pet redonda (R$ 129,90), bolinha mordedor (R$ 24,90) e roupinha moletom (R$ 59,90).
  - *Rações não perecíveis:* ração para cães adultos 15 kg (R$ 189,90), ração para gatos castrados 10 kg (R$ 159,90) e ração para filhotes 3 kg (R$ 69,90).
  - *Higiene e limpeza:* tapete higiênico com 30 unidades (R$ 79,90), fralda descartável P (R$ 44,90) e shampoo neutro 500 ml (R$ 34,90).
- **Serviços:** descrição do banho, da tosa e da tele-busca, tabela de preços por porte do animal com colunas "Sem tele-busca" e "Com tele-busca", e passo a passo para agendar.
- **Sobre e Contato:** história, missão e valores; dados de contato; tabela de horários; formulário "Fale conosco" (apenas estrutural nesta fase).
- **Ajuda:** explica como navegar pelo site e usar cada página.

### Rodapé (todas as páginas)
- Links de navegação para todas as páginas.
- Endereço e contatos do petshop (elemento `<address>`).
- Autoria do site, link para o repositório, direitos autorais e aviso de que a empresa é fictícia.
- Link "Voltar ao topo".

## Recursos de HTML utilizados

Estrutura semântica (`header`, `nav`, `main`, `section`, `article`, `figure`/`figcaption`, `footer`, `address`), títulos hierárquicos (`h1` a `h3`), listas ordenadas, não ordenadas e de definição, links internos, entre páginas, de âncora, `tel:` e `mailto:`, imagens com texto alternativo (`alt`), tabelas com `caption`, `thead`, `tbody`, `tfoot`, `rowspan` e `colspan`, e formulário com `fieldset`, `label`, `input`, `select`, `textarea` e botões.

## Como executar

- **Online:** acesse o link do GitHub Pages acima.
- **Localmente:** baixe ou clone o repositório e abra o arquivo `index.html` em qualquer navegador. Não é necessário instalar nada.

## Observação

O Patinhas & Cia é uma empresa fictícia criada para fins acadêmicos. Preços, endereço e contatos são ilustrativos. As imagens são ilustrações próprias criadas para este projeto.

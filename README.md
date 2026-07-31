# Crivo Indica Site

Landing page estatica, mobile-first, para acesso aos grupos publicos do Crivo.

## Visualizacao local

Abra `index.html` diretamente ou execute um servidor HTTP estatico nesta pasta.

## Publicacao

O diretorio pode ser publicado diretamente no Cloudflare Pages, sem comando de
build. O diretorio de saida e a propria raiz do projeto.

No fluxo atual de Cloudflare Workers com Git, `wrangler.jsonc` publica a raiz
como Static Assets. O comando de build fica vazio e o deploy usa
`npx wrangler deploy`.

## Links dos grupos

Os links ficam explicitamente nos elementos com `data-group` em `index.html`.
Foram copiados do prototipo Lovable em 2026-07-31.

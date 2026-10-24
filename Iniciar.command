#!/bin/zsh
set -e
cd -- "$(dirname -- "$0")"
if ! command -v npm >/dev/null 2>&1; then
  print 'Instala Node.js 22.12 o posterior y vuelve a abrir este archivo.'
  read 'respuesta?Pulsa Intro para cerrar.'
  exit 1
fi
if [[ ! -d node_modules ]]; then
  npm install
fi
print 'OldAiLife · Abre la dirección Local que aparecerá a continuación.'
npm run dev

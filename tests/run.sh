#!/bin/bash
# Roda todos os testes do repositório. Uso: bash tests/run.sh
cd "$(dirname "$0")/.." || exit 1
rc=0
node tests/merge.test.js || rc=1
node tests/geral.test.js || rc=1
node .claude/skills/atualizacao-legal-semanal/verificar_textos.js - js/*-texto.js >/dev/null || { echo "FALHOU: verificar_textos.js"; rc=1; }
exit $rc

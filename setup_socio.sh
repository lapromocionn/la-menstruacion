#!/bin/bash
# setup_socio.sh - Configuración automática para el Socio (Claude Code)

echo "🤖 Activando protocolo Multi-Agente en Claude Code..."
if command -v claude &> /dev/null; then
    claude < setup_multi_agente.md
else
    npx @anthropic-ai/claude-code < setup_multi_agente.md
fi

echo "✅ Estructura asíncrona configurada."
echo "📝 Abriendo el archivo de habilidades. Rellena tu panel <human_2_profile>, guarda y cierra."
sleep 2

# Abrir el archivo directamente para que solo tenga que escribir
if command -v nano &> /dev/null; then
    nano obsidian_brain/04_Analisis_Equipo/habilidades_base.md
else
    vi obsidian_brain/04_Analisis_Equipo/habilidades_base.md
fi

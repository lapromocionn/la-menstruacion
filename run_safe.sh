#!/bin/bash
# run_safe.sh - Lanzador blindado por variables de entorno

echo "🧹 Wiping session cache (Zero-History override)..."
rm -rf ~/.openclaw/sessions/* ~/.openclaw/workspace/* ~/.openclaw/cache/* 2>/dev/null

echo "🔌 Killing old environment variables..."
unset GEMINI_API_KEY
unset GOOGLE_API_KEY

echo "🛡️ Forcing Groq 128k environment..."
export OPENCLAW_PROVIDER="groq"
export OPENCLAW_MODEL="llama-3.3-70b-versatile"
export GROQ_API_KEY="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"

echo "🚀 Starting OpenClaw in SAFE MODE..."
# Arrancamos el comando a secas, dejando que chupe la configuración de las variables de arriba
npx openclaw

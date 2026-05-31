#!/bin/bash
# sync_red.sh - Sincronización asíncrona (Offline-First)

WEBHOOK_URL="https://discord.com/api/webhooks/1510599595799871538/XA4IX_Z8JJIkmnitv8fFreVy_ckQL3hGeN_YI9kGNZ9pF9K43ZtiGJg_id58NoqJ2m2R"
OUTBOX_FILE="./obsidian_brain/Outbox/pendientes_discord.txt"

# 1. Enviar contexto a Discord si hay pendientes
if [ -s "$OUTBOX_FILE" ]; then
    echo "Enviando contexto acumulado a Discord..."
    PAYLOAD=$(cat "$OUTBOX_FILE" | jq -Rs .)
    curl -H "Content-Type: application/json" \
         -d "{\"content\": $PAYLOAD}" \
         $WEBHOOK_URL
    
    # Vaciar buzón tras el envío
    > "$OUTBOX_FILE"
    echo "Buzón de salida vaciado."
else
    echo "El buzón local de Discord está vacío. No hay contexto nuevo que enviar."
fi

# 2. Sincronización del código fuente y cerebro
echo "Sincronizando Git..."
git pull origin main --rebase
git add .
git commit -m "🧠 Auto-sync: Código y Cerebro IA sincronizados"
git push origin main
echo "Sincronización completa."

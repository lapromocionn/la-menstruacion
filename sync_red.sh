#!/bin/bash
# sync_red.sh - Sincronización asíncrona (Offline-First)

# 0. Configuración de entorno y credenciales
# Asegurar que el helper de credenciales esté configurado
if ! git config --global credential.helper | grep -q "store"; then
    git config --global credential.helper store
fi

# Deshabilitar prompts interactivos para evitar bloqueos
export GIT_TERMINAL_PROMPT=0

# Asegurar que el script se ejecute desde su directorio
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "$SCRIPT_DIR"

WEBHOOK_GENERAL_DEV="https://discord.com/api/webhooks/1510599274608459857/gbXzm8_M8P3kT0Q7np7dfVrzvF70ab9Awsg6l5sWY56i_98qzzzj_CHNJ_aMPI2fObhl"
WEBHOOK_ALERTAS="https://discord.com/api/webhooks/1510667678199713792/1ON3uJkRxivMdNpS4GzVliQS0Y8oT3V0T2GVWv5Hiw_Z_QNiLYpcnLLT2i65XYWhhLuy"
WEBHOOK_SYNC_LOGS="https://discord.com/api/webhooks/1510599595799871538/XA4IX_Z8JJIkmnitv8fFreVy_ckQL3hGeN_YI9kGNZ9pF9K43ZtiGJg_id58NoqJ2m2R"

OUTBOX_FILE="./obsidian_brain/Outbox/pendientes_discord.txt"

# 1. Enviar contexto a Discord si hay pendientes
if [ -s "$OUTBOX_FILE" ]; then
    echo "Enviando contexto acumulado a Discord desde $PWD..."
    PAYLOAD=$(cat "$OUTBOX_FILE" | jq -Rs .)
    curl -H "Content-Type: application/json" \
         -d "{\"content\": $PAYLOAD}" \
         $WEBHOOK_SYNC_LOGS
    
    # Vaciar buzón tras el envío
    > "$OUTBOX_FILE"
    echo "Buzón de salida vaciado."
else
    echo "El buzón local de Discord ($OUTBOX_FILE) está vacío."
fi

# 2. Sincronización del código fuente y cerebro
echo "Sincronizando Git en $PWD..."
if [ -d ".git" ]; then
    # Preparamos los cambios locales
    git add .
    
    # Solo hacemos commit si hay cambios
    if ! git diff --cached --quiet; then
        git commit -m "🧠 Auto-sync: Código y Cerebro IA sincronizados"
    fi

    # Intentamos traer cambios remotos
    if git pull origin main --rebase; then
        # Intentamos subir (usará el credential helper almacenado)
        if git push origin main; then
            echo "Sincronización completa."
        else
            echo "Error: El push falló. Verifica tus credenciales o conexión."
            exit 1
        fi
    else
        echo "Error: El pull falló. Resuelve conflictos manualmente."
        exit 1
    fi
else
    echo "Error: No se encontró el repositorio Git en $PWD"
    exit 1
fi

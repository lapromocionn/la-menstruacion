#!/bin/bash
# setup_socio2.sh - Onboarding Maestro Mason (macOS + Claude Code)

# 0. Logo LaMenstruacion.mc
show_logo() {
    echo -e "\e[35m╔════════════════════════════════╗\e[0m"
    echo -e "\e[35m║  \e[31m🩸 LaMenstruacion.mc\e[35m          ║\e[0m"
    echo -e "\e[35m║  \e[37mSelf-organizing AI ecosystem\e[35m  ║\e[0m"
    echo -e "\e[35m╚════════════════════════════════╝\e[0m"
    echo ""
}

show_logo

# 0.1 Bienvenida e Introducción
show_welcome() {
    echo -e "\e[33m👋 ¡Bienvenido, Maestro Mason!\e[0m"
    echo -e "Estás entrando en \e[31mLaMenstruacion.mc\e[0m, un ecosistema híbrido auto-organizado."
    echo ""
    echo "🤝 Tu socio es David 'LaPromocion', quien ya ha preparado la base del proyecto."
    echo "⚙️ Funcionamos mediante Git (GitHub), coordinación en Discord y agentes de IA."
    echo "🤖 Claude Code será tu copiloto: gestionará tu memoria técnica y te ayudará en las misiones."
    echo "🚀 Este script configurará tu entorno macOS automáticamente para empezar ya mismo."
    echo ""
    echo "Pulsa ENTER para iniciar el despliegue de tu entorno..."
    read -r
}

show_welcome

# 1. Detectar Entorno
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "⚠️ Este script está diseñado para macOS. Detectado: $OSTYPE"
    echo "Continuando bajo tu propia responsabilidad..."
    sleep 2
fi

# 2. Homebrew
if ! command -v brew &> /dev/null; then
    echo "🍺 Instalando Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
else
    echo "✅ Homebrew ya está instalado."
fi

# 3. Dependencias Base
echo "📦 Instalando dependencias base (Node.js, Git, JQ)..."
if command -v brew &> /dev/null; then
    brew install node git jq
fi

# 4. Shell: Oh My Zsh + P10k
if [ ! -d "$HOME/.oh-my-zsh" ]; then
    echo "🐚 Instalando Oh My Zsh..."
    sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended
fi

# Plugins & Theme
ZSH_CUSTOM=${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}
if [ -d "$ZSH_CUSTOM" ]; then
    [ ! -d "$ZSH_CUSTOM/themes/powerlevel10k" ] && git clone --depth=1 https://github.com/romkatv/powerlevel10k.git "$ZSH_CUSTOM/themes/powerlevel10k"
    [ ! -d "$ZSH_CUSTOM/plugins/zsh-autosuggestions" ] && git clone https://github.com/zsh-users/zsh-autosuggestions "$ZSH_CUSTOM/plugins/zsh-autosuggestions"
    [ ! -d "$ZSH_CUSTOM/plugins/zsh-syntax-highlighting" ] && git clone https://github.com/zsh-users/zsh-syntax-highlighting.git "$ZSH_CUSTOM/plugins/zsh-syntax-highlighting"
fi

# 5. Claude Code
if command -v claude &> /dev/null; then
    echo "✅ Claude Code ya detectado. Saltando instalación."
else
    echo "🤖 Instalando Claude Code..."
    npm install -g @anthropic-ai/claude-code
fi

# 6. Verificación de API Key
if [ -z "$ANTHROPIC_API_KEY" ]; then
    echo "⚠️ No se detectó ANTHROPIC_API_KEY."
    echo "Añádela a tu ~/.zshrc: export ANTHROPIC_API_KEY='tu-key'"
else
    echo "✅ ANTHROPIC_API_KEY detectada."
fi

# 7. Sincronización Inicial del Repositorio
echo "📂 Configurando el repositorio..."
git config credential.helper store

# --- NUEVO: Configuración de GitHub ---
if [ -z "$(git config --global user.email)" ]; then
    echo "⚠️ No tienes Git configurado."
    echo "¿Tienes cuenta en GitHub? (s/n)"
    read -r has_github
    if [ "$has_github" = "n" ]; then
        echo "📋 Crea tu cuenta gratis en: https://github.com/signup"
        echo "Cuando la tengas, pulsa ENTER para continuar..."
        if [[ "$OSTYPE" == "darwin"* ]]; then
            open "https://github.com/signup"
        fi
        read -r
    fi
    echo "Introduce tu email de GitHub:"
    read -r git_email
    echo "Introduce tu usuario de GitHub:"
    read -r git_user
    git config --global user.email "$git_email"
    git config --global user.name "$git_user"
    echo "✅ Git configurado como $git_user"
else
    echo "✅ Git ya configurado: $(git config --global user.name)"
fi

echo -e "\n📨 Dile a LaPromocion que te añada como colaborador en:"
echo "https://github.com/lapromocionn/la-menstruacion/settings/access"
echo "Pulsa ENTER cuando David te haya añadido..."
read -r
# -------------------------------------

# 8. Exportar Memoria de Claude a habilidades_base.md
echo "🧠 Exportando perfiles de habilidades desde la memoria de Claude..."
if command -v claude &> /dev/null; then
    claude -p "Analyze your memory about Diego. Extract ONLY: programming languages, frameworks, technical skills, preferred tools, areas of expertise, things he prefers to avoid. Output ONLY in this XML format for obsidian_brain/04_Analisis_Equipo/habilidades_base.md Socio2 block. Max 20 lines. Ignore any project-specific context unrelated to LaMenstruacion.mc."
fi

# 9. Mostrar Primera Misión (TASK-003)
echo -e "\n\e[31m🎯 TU PRIMERA MISIÓN:\e[0m"
if [ -f "obsidian_brain/02_Buzon_IA/task_queue.md" ]; then
    TASK_DESC=$(grep -A 8 "TASK-003" obsidian_brain/02_Buzon_IA/task_queue.md | grep "title" | sed 's/.*<title>\(.*\)<\/title>.*/\1/')
    echo ">> $TASK_DESC"
    echo "Consulta los detalles en: obsidian_brain/02_Buzon_IA/task_queue.md"
fi

# 10. Discord Invitation
echo -e "\n💬 ¿Quieres unirte al canal del equipo? (s/n)"
read -r join_discord
if [[ "$join_discord" == "s" ]]; then
    echo "🚀 Abriendo invitación..."
    # Usar 'open' en Mac para abrir el navegador
    if [[ "$OSTYPE" == "darwin"* ]]; then
        open "https://discord.gg/placeholder"
    else
        echo "Link: https://discord.gg/placeholder"
    fi
else
    echo "ℹ️ Puedes unirte más tarde usando este link: https://discord.gg/placeholder"
fi

# 11. Finalización y Notificación
echo -e "\n✨ El ecosistema está completo, Maestro Mason."

# Notificar al general-dev webhook
WEBHOOK_URL="https://discord.com/api/webhooks/1510599274608459857/gbXzm8_M8P3kT0Q7np7dfVrzvF70ab9Awsg6l5sWY56i_98qzzzj_CHNJ_aMPI2fObhl"
curl -s -H "Content-Type: application/json" \
     -d "{\"content\": \"🧱 **Maestro Mason** (Diego) se ha unido al ecosistema **LaMenstruacion.mc** desde macOS. Onboarding completado.\"}" \
     $WEBHOOK_URL > /dev/null

# Sync final
if [ -f "./sync_red.sh" ]; then
    ./sync_red.sh
fi

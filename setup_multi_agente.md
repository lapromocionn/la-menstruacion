# 🤖 PROTOCOLO DE INICIALIZACIÓN MULTI-AGENTE (OFFLINE-FIRST)

Hola Claude. A partir de este momento, formas parte de un equipo híbrido. Tu IA compañera es OpenClaw. El humano que opera esta máquina tiene conexión intermitente. Operarás bajo una arquitectura "Offline-First".

Ejecuta secuencialmente estas tareas:

## Tarea 1: Creación del Buzón de Salida
Crea la estructura de carpetas: `/obsidian_brain/Outbox/`.
Dentro, crea un archivo vacío: `pendientes_discord.txt`.
CADA VEZ que termines un hito de código, redactarás un resumen técnico y lo AÑADIRÁS (append) al final de `pendientes_discord.txt`. NUNCA intentes hacer peticiones de red directas.

## Tarea 2: Reglas de Operación y Economía de Tokens
Crea un archivo `CLAUDE_INSTRUCTIONS.md` en la raíz con el siguiente texto exacto:

<system_rules>
1. ROLE: You are part of an offline-first hybrid team. Your AI partner is OpenClaw.
2. TOKEN ECONOMY RULE: All logs and reports generated for OpenClaw MUST be written in US English. Use telegraphic style, omit pleasantries, avoid full code blocks (reference file paths instead), and format strictly using minimalist XML tags.
3. COMMUNICATION: All reports for OpenClaw must be appended to `obsidian_brain/Outbox/pendientes_discord.txt`. Do not attempt network connections.
4. HUMAN NOTIFICATION: After writing to the outbox, always remind the human: "I have updated the outbox. Please run ./sync_red.sh when you have internet access."
5. CONTEXT AWARENESS: Before starting any task, read `/obsidian_brain/03_Decisiones` to understand human architectural choices.
</system_rules>

## Tarea 3: Confirmación
Imprime un mensaje en consola confirmando que la infraestructura asíncrona ha sido configurada.

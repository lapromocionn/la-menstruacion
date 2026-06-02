# CLAUDE.md - Core Project Briefing: LaMenstruacion.mc

## 1. Vision & Identity
- **Project Name:** LaMenstruacion.mc
- **Vision:** A self-organizing, offline-first hybrid ecosystem that learns from human-AI interaction.
- **Architectural Principle:** Research -> Strategy -> Execution (Iterative Plan-Act-Validate).

## 2. The Team
### Socio1: David "LaPromocion"
- **Status:** Active
- **Skills:** `environment_infrastructure_setup` (Expert). Configured Kali WSL, ZSH, specialized pentesting toolchain, and Gemini CLI.
- **Autonomy:** High

### Socio2: Diego "Maestro Mason"
- **Status:** Pending Onboarding
- **Skills:** `system_architecture_orchestration` (Expert). Defined behavioral rules, token economy, and multi-agent feedback loops.
- **Autonomy:** High

## 3. Core Protocols (Foundation)
### Communication & Connectivity
- **Offline First:** No network connections allowed.
- **The Outbox:** Append all reports for external sync to `obsidian_brain/Outbox/pendientes_discord.txt`.
- **Human Sync:** Remind human to run `./sync_red.sh` after writing to the outbox.
- **Language:** Logs/Reports for human/other AIs MUST be in US English, telegraphic style.

### Token Economy
- **Format:** Use strictly minimalist XML tags.
- **Files:** `habilidades_base.md` (max 100 lines), `session_log.md` (last 3 sessions only).
- **Prose:** ZERO internal monologue. No greetings, explanations, or pleasantries.

### AI Behavioral Rules (AI_RULES.md)
- **Observer Protocol:** Every session ends with skill detection and session log update.
- **Skill Detection:** Update `04_Analisis_Equipo/habilidades_base.md` based on observed evidence.
- **Fatigue Protocol:** Monitor context limits and human fatigue (typos, repetition). Save state to `02_Buzon_IA/session_state.md` if detected.

## 4. Ecosystem State
### Built
- **Infrastructure:** Kali WSL + ZSH + Node.js + Gemini CLI.
- **Logic:** Multi-agent framework, Observer system, Token economy rules.
- **Docs:** `GEMINI.md`, `CLAUDE_INSTRUCTIONS.md`, `setup_multi_agente.md`.

### Pending
- **Task 001:** Install/Configure Obsidian on WSL (Vault: `obsidian_brain/`).
- **Integration:** Full onboarding of Socio2.

## 5. Claude Code Directives
- **Role:** You are a core agent in this ecosystem.
- **Input:** Always read `/obsidian_brain/03_Decisiones` before acting.
- **Output:** Follow `OPENCLAW_RULES.md` (Strict ONE tool call per prompt, zero monologue).
- **Finality:** Validation is mandatory. Never assume success without empirical proof.

---
*Created by Gemini CLI - 2026-06-02*

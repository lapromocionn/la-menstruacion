# TASK-004 — Dashboard Visual Overhaul
**Assignee:** Socio2 (Maestro Mason)
**Workflow:** Pídele a Claude que implemente cada paso. Tú no tocas código.

---

## Cómo trabajar en este task

Abre Claude Code en la terminal dentro de la carpeta `src/dashboard/` y ve diciéndole qué hacer paso a paso. Claude lee este archivo y sabe exactamente qué construir.

---

## Lo que queremos conseguir

Un dashboard que se vea premium y profesional:
- **Sidebar** de navegación fija a la izquierda (en vez del tab bar actual)
- **Página Overview** con tarjetas de estadísticas animadas
- **Gráfica de barras** en la sección de Skills
- **Línea de tiempo** en la sección de Sesiones
- **Kanban de 2 columnas** en Tareas
- **Animaciones suaves** al navegar entre secciones
- **Skeleton loaders** mientras cargan los datos
- **Responsive**: que funcione bien en móvil

---

## Diseño y colores

No cambies los colores base (ya están definidos en CSS). Úsalos así:
- Azul `var(--accent)` → Socio1, elementos activos, highlights
- Morado `var(--purple)` → Socio2
- Verde `var(--success)` → completado
- Amarillo `var(--warning)` → en progreso

---

## Dependencias a instalar
```
recharts     → gráficas
framer-motion → animaciones
```

---

## Deploy
Ya está configurado. Solo hacer `git push` y se despliega solo en Vercel.

---
description: Gestionar tareas en Notion — agregar, completar, listar, y planificar del Command Center
---

# /task — Gestor de Tareas AntiGravity

## Comandos disponibles

### 1. Agregar tarea
Cuando el usuario dice algo como "agrega tarea: [descripción]" o "tengo que hacer: [algo]":

1. Parse the task description from the user's message
2. Determine priority from context:
   - If user says "urgente", "ya", "ahora" → 🔴 Urgente
   - If user says "importante", "esta semana" → 🟠 Alta
   - If user says "cuando pueda", "algún día" → 🟢 Baja
   - Default → 🟡 Media
3. Determine category from context:
   - "clase", "alumno", "ableton", "producción" → 🎵 Clases
   - "pedido", "producto", "tienda", "wompi" → 🛒 E-Commerce
   - "deploy", "error", "código", "web" → 💼 Trabajo
   - "casa", "comprar", "mercado" → 🏠 Personal
   - "factura", "pago", "cobro", "plata" → 💰 Finanzas
   - "ejercicio", "gym", "doctor" → 🏋️ Salud
   - Default → 💼 Trabajo
4. Add a to_do block to the Command Center page in Notion:
   - Page ID: 30b30f6b-2496-81a5-a7bf-dfb5f11be740
   - Format: **[Categoría]** Descripción de la tarea
5. Confirm to user what was added

### 2. Listar tareas pendientes
When user says "mis tareas", "qué tengo pendiente", "qué me falta":

1. Get block children of the Command Center page: 30b30f6b-2496-81a5-a7bf-dfb5f11be740
2. Filter for to_do blocks where checked = false
3. Group by priority headers (Urgente, Alta, Media, Baja)
4. Present to user in clean format

### 3. Completar tarea
When user says "hice [tarea]", "completé [tarea]", "ya terminé [tarea]":

1. Get block children and find the matching to_do block
2. Update the block with checked = true
3. Confirm completion

### 4. Planificar día
When user says "planifica mi día", "qué hago hoy", "organiza mi día":

1. Get all pending tasks from Command Center
2. Get the current day's agenda from Agenda Semanal: 30b30f6b-2496-81f2-bfd5-f5a2287dadb6
3. Get class info from Alumnos DB: 2f230f6b-2496-80b4-92a0-f99d0b42f60e
4. Generate a time-blocked plan prioritizing:
   - Fixed events (classes, meetings) first
   - 🔴 Urgente tasks around fixed events
   - 🟠 Alta tasks in deep work blocks
   - 🟡 Media tasks in afternoon blocks
   - 🟢 Baja tasks in free slots
5. Present plan with estimated times

### 5. Agregar evento a agenda
When user says "tengo [evento] a las [hora]", "agrega a la agenda":

1. Parse event and time
2. Add to_do block to the appropriate day in Agenda Semanal page: 30b30f6b-2496-81f2-bfd5-f5a2287dadb6
3. Suggest reminder time (30 min before by default)
4. Confirm

## Notion Page IDs Reference
- Command Center: 30b30f6b-2496-81a5-a7bf-dfb5f11be740
- Checklist Pre-Clase: 30b30f6b-2496-815e-b2b2-c9b6267fcd83
- Agenda Semanal: 30b30f6b-2496-81f2-bfd5-f5a2287dadb6
- Rutina Diaria: 30b30f6b-2496-8142-9e9c-dc844a713dd0
- DB Alumnos: 2f230f6b-2496-80b4-92a0-f99d0b42f60e
- CRM Clientes: 25d30f6b-2496-8077-bd41-f6c44ab1e8d9

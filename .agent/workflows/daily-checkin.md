---
description: Daily check-in y planificación del día — ver tareas, agenda, y generar plan
---

# /daily — Check-in Diario

## Trigger
Cuando el usuario inicia una sesión nueva o dice cosas como:
- "Buenos días"
- "Qué tengo hoy"
- "Planifica mi día"
- "Daily check-in"

## Pasos

### 1. Contexto actual
// turbo
Get the current time and identify the day of the week.

### 2. Pull tareas pendientes
Read the Command Center page children to get all pending to_do blocks:
- Page ID: 30b30f6b-2496-81a5-a7bf-dfb5f11be740
- Filter for checked = false

### 3. Pull agenda del día
Read the Agenda Semanal page to find today's events:
- Page ID: 30b30f6b-2496-81f2-bfd5-f5a2287dadb6

### 4. Check info de alumnos
Query the Alumnos database to see upcoming classes:
- DB ID: 2f230f6b-2496-80b4-92a0-f99d0b42f60e

### 5. Generate daily plan
Create a time-blocked plan combining:
- Fixed events from agenda
- Priority tasks (urgente first, then alta)
- Reminder alerts for events coming up

### 6. Present to user
Format as a clean daily briefing:

```
📅 Buenos días Santiago! Hoy es [día, fecha]

⏰ AGENDA DEL DÍA:
• [hora] — [evento]
• [hora] — [evento]

🎯 TOP 3 PRIORIDADES:
1. [tarea urgente/alta]
2. [tarea urgente/alta]  
3. [tarea alta/media]

📋 OTRAS TAREAS PENDIENTES:
• [tarea 1]
• [tarea 2]

⚠️ RECORDATORIOS:
• Clase con [alumno] a las [hora] — preparar 30 min antes
• [cobro pendiente] — [alumno]

💡 TIP: [sugerencia del día]
```

## Notion IDs
- Command Center: 30b30f6b-2496-81a5-a7bf-dfb5f11be740
- Agenda Semanal: 30b30f6b-2496-81f2-bfd5-f5a2287dadb6
- Checklist Clase: 30b30f6b-2496-815e-b2b2-c9b6267fcd83
- Rutina Diaria: 30b30f6b-2496-8142-9e9c-dc844a713dd0
- DB Alumnos: 2f230f6b-2496-80b4-92a0-f99d0b42f60e

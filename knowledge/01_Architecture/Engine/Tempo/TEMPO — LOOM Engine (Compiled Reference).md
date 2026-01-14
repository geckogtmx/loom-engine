# TEMPO — LOOM Engine (Compiled Reference)

---

## 1. Purpose & Definition

Tempo is a **session-level cognitive pacing system** for the LOOM Engine. It regulates reasoning depth, speed, exploration breadth, drift surface, and collaboration rhythm. Tempo is **not identity**; it is **performance**. It adapts dynamically during a session and does not persist beyond it.

---

## 2. Core Tempos

### Allegro (Fast)

- Short reasoning chains
    
- Rapid ideation
    
- Minimal recursion
    
- Low drift surface
    
- Quick delivery
    

**Used for:** brainstorming, operational tasks, rapid iteration.

### Andante (Medium / Default)

- Balanced reasoning depth
    
- Structured thinking
    
- Moderate exploration
    
- Stable tone and initiative
    

**Used for:** outlining, synthesis, editing, explaining.

### Adagio (Deep)

- Extended reasoning
    
- Recursive exploration
    
- High conceptual complexity
    
- Requires Pattern support to prevent drift
    

**Used for:** strategy, architecture, philosophy, system design.

---

## 3. Session Variable

```
ActiveTempo = Allegro | Andante | Adagio | Auto
```

- Stored only in **L1 Active Memory**
    
- Cleared at session end
    
- Reissued per session if needed
    

---

## 4. Engine Manager — Tempo Commands

### /tempo allegro

- Agents switch to shallow reasoning
    
- Patterns shorten steps
    
- A0 enters **Agile Mode**
    
- META increases oversight monitoring
    

### /tempo andante

- Balanced reasoning depth
    
- Standard Pattern pacing
    
- A0 enters **Precision Mode**
    

### /tempo adagio

- Deep reasoning enabled
    
- Patterns expand depth
    
- A0 enters **Deliberate Mode**
    
- META increases drift monitoring
    

### /tempo auto

- Agents and A0 select optimal tempo per task
    
- Operator override always applies
    

---

## 5. A0 — Tempo Translation & Behavior

### Translation Table

- **Allegro → Agile Mode**
    
    - Rapid task routing
        
    - Fast Pattern switching
        
    - Minimal verbosity
        
    - Frequent micro-checks
        
- **Andante → Precision Mode**
    
    - Standard execution speed
        
    - Clear handoffs
        
    - Balanced checking
        
- **Adagio → Deliberate Mode**
    
    - Slower orchestration
        
    - Structural redundancy checks
        
    - Explicit confirmations
        

### A0 Constraints

- Tempo affects **orchestration only**, not cognitive depth
    
- A0 stabilizes the system at all tempos
    
- A0 may recommend tempo changes to the Operator
    

---

## 6. Agent Telos — Tempo Awareness

- Tempo **does not modify agent identity**
    
- Tempo is **not stored** in Agent Telos
    
- Agents listen to the session tempo broadcast
    
- Agents may request tempo changes via Operator or A0
    

### Affected Behaviors

- Reasoning length
    
- Verbosity
    
- Initiative pacing
    
- Exploration depth
    
- Drift surface
    

### Recommended (Non-Binding) Telos Clause

```
The agent adapts reasoning depth and pacing to the session's ActiveTempo, unless unsafe or misaligned.
```

---

## 7. Pattern Layer — Tempo Integration

Patterns do **not** define tempo. They adapt internal behavior based on session tempo.

### Allegro Effects

- Compressed steps
    
- Reduced exploration
    
- Concise summaries
    
- Minimal validation
    

### Andante Effects

- Standard step length
    
- Balanced exploration
    
- Normal validation
    

### Adagio Effects

- Expanded reasoning depth
    
- Additional verification
    
- Deep-dive branches
    
- META drift monitoring
    

### Auto Mode Negotiation

- Ideation → Allegro
    
- Structuring → Andante
    
- Strategy → Adagio
    

---

## 8. Behavior Observation & Feedback Loop

### Observation Field Addition

**Tempo Alignment:**

- Good
    
- Too Fast
    
- Too Slow
    
- Mismatched
    

### Interpretation

- **Too Fast:** insufficient depth
    
- **Too Slow:** unnecessary deep reasoning
    
- **Mismatched:** world or pattern expectation conflict
    

### Feedback Flow

- Operator submits tempo feedback
    
- META filters misalignment and unsafe depth
    
- University adjusts reasoning and verbosity tendencies
    
- A0 updates pattern pacing and session logic
    

---

## 9. World-Level Tempo Recommendations

Worlds may **recommend**, but not enforce, a baseline tempo.

### Field

**Preferred Tempo Atmosphere**

- Allegro — fast-paced worlds
    
- Andante — balanced worlds
    
- Adagio — reflective worlds
    

### Examples

- Podcast World → Allegro
    
- Strategy Lab → Andante
    
- Philosophy World → Adagio
    

---

## 10. Scope Boundaries

- Tempo is **session-scoped only**
    
- Tempo never alters identity, values, or constraints
    
- Tempo is advisory, negotiable, and overrideable
    
- Tempo coordinates agents, patterns, A0, and META without persistence
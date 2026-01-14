# **ENGINE Manager — Loom Engine Global Control Panel**

_The Operator’s command console for running the entire Loom Engine._

---

## **1. Purpose of This File**

The **ENGINE Manager** is the top-level control panel for the _whole_ Loom Engine.  
It governs:

- which World is active
    
- which Agents are deployed
    
- which Patterns are running
    
- when Sessions start/end
    
- when memory is flushed
    
- cross-world navigation
    
- Replication Script experiments
    
- global cognitive tools
    
- META oversight
    
- Feedback Loop interactions
    

This file acts as the **Operating System menu**, above all Worlds.

---

# **2. Core Engine Commands**

## **Start a clean Loom Engine session**

`/start_session`

Loads:

- Operator Telos (L4)
    
- Knowledge Memory (L3)
    
- global structure and cognitive constraints
    

---

## **Switch to a different World**

`/switch_world <world-name>`

Performs:

- safe L1 reset
    
- load World identity (L3)
    
- load last world_state (L2)
    
- recap with status
    

---

## **Recap the active World and current cognitive state**

`/recap`

Displays:

- which World is active
    
- last moves (L2)
    
- active agents
    
- recommended next Pattern
    

---

## **Activate a Pattern (Cartridge)**

`/use_pattern <pattern-name>`

or ask:

`/pattern_suggest`

---

## **Deploy Agent Team**

`/deploy_agents`

Loads the agent configuration defined by the active World.

---

## **Inspect Memory Layers**

`/show_recent_deltas   ← L2 Episodic Snapshot /show_world <name>    ← L3 Knowledge Slice /show_telos           ← L4 Identity Kernel`

---

## **Run a Replication Script test**

`/replicate "<task>"`

Produces:

- structured Loom result
    
- unstructured raw model result
    
- side-by-side comparison
    
- drift/correlation notes
    

Used for demos, research, tuning, and consistency testing.

---

# **3. Engine-Level Safety Controls**

### Flush session memory:

`/close_session`

### Trigger Feedback Loop note (META → University → A0U):

`/feedback <note>`

---

# **4. Use Cases for ENGINE Manager**

- Running multiple projects (Worlds) in parallel
    
- Switching creative modes instantly
    
- Keeping continuity across sessions
    
- Preventing memory drift
    
- Research & Replication experiments
    
- Managing advanced multi-agent workflows
    
- Teaching the system new skills safely
    

---

# **5. Separation From WORLD Manager**

The ENGINE Manager controls:

- sessions
    
- world switching
    
- memory
    
- agents globally
    
- patterns at engine-level
    
- replication scripts
    
- cognitive architecture boundaries
    

It does **not** contain:

- world tasks
    
- world goals
    
- world threads
    
- world-local knowledge
    
- world-specific constraints
    

That belongs to each **WORLD Manager**.

# Systems — Working Discoveries & Decisions (Brain Dump → Structured)

> **Status:** Non-authoritative  
> **Purpose:** Capture system-level insights discovered during development and experimentation.  
> These notes do **not** define LOOM’s architecture, cognition, or governance.  
> They describe _supporting systems_ that route, accelerate, or instrument execution.

---

## 1. Core Discovery: The Real Cost Problem

- High cost did **not** come from poor prompting or bad models.
    
- Cost came from repeatedly loading large amounts of **L3 knowledge** into paid models.
    
- This is an **execution-layer problem**, not a cognitive or architectural flaw.
    
- Cost discipline must be enforced **structurally**, not by Operator behavior.
    

---

## 2. Fundamental Reframe

- Never allow an expensive model to decide how expensive it should be.
    
- Cost and context decisions must happen **before** model execution.
    
- Direct prompting as a default path creates entropy and drift.
    
- LOOM must enforce a single execution pipeline:
    
    **Dispatch → Assemble → Execute**
    

---

## 3. Session Classes (Execution Discipline)

Three execution classes emerged consistently across experiments:

- **THIN (default)**
    
    - Questions, navigation, micro-edits
        
    - Minimal context
        
    - Cheap / local models preferred
        
- **STANDARD**
    
    - Pattern execution
        
    - Medium context
        
    - Structured outputs
        
- **DEEP**
    
    - Architecture, governance, system changes
        
    - Heavy context
        
    - Explicit Operator confirmation required
        

**THIN should represent ~80–90% of usage.**

---

## 4. Dispatcher (System, Not Brain)

A dispatcher system is required to mediate all execution.

**Dispatcher responsibilities:**

- Read broad knowledge cheaply (local or low-cost model)
    
- Select:
    
    - session class
        
    - relevant spines
        
    - Pattern
        
    - Agent roles
        
    - model tier
        
- Estimate cost
    
- Emit a **structured dispatch plan only**
    

**Dispatcher constraints:**

- No authority
    
- No execution
    
- No decisions
    
- No prose output
    
- Outputs structured data only
    

---

## 5. Spines: Execution-Facing Artifacts

- Raw markdown (L3/L4) remains canonical.
    
- **Spines** are derived, compact, machine-facing representations.
    
- Spines exist to prevent overfeeding models with raw text.
    

Examples:

- World execution spine
    
- Agent capability spine
    
- Pattern index spine
    
- Global session spine
    

Properties:

- Regenerable
    
- Disposable
    
- Non-authoritative
    
- Optimized for routing, not meaning
    

---

## 6. Indexing & Compaction

- A periodic indexing/compaction process is required.
    
- Purpose:
    
    - deduplicate knowledge
        
    - generate spines
        
    - maintain fast dispatch surfaces
        
- Runs locally and cheaply.
    
- No knowledge is deleted or altered.
    
- Shifts cost from daily usage → background maintenance.
    

---

## 7. Database as Accelerator (Not Memory)

A local database is justified as a **derived system layer**.

**The DB is:**

- an index
    
- a spine store
    
- an observability store
    
- a performance accelerator
    

**The DB is not:**

- a source of truth
    
- a memory layer
    
- an identity store
    
- a learning substrate
    

If deleted, it must be fully rebuildable from markdown.

---

## 8. Observability (Out-of-Band)

Observability is required for confidence and tuning.

What to log (high signal, low risk):

- session metadata
    
- model used
    
- tokens in/out
    
- latency
    
- estimated cost
    
- pattern usage
    
- aborts, retries, escalations
    

What must never be logged:

- raw prompts
    
- raw outputs
    
- full transcripts
    
- identity data
    

This is **instrumentation**, not memory.

---

## 9. Local UI as Instrument Panel

A local browser UI is recommended.

**UI purpose:**

- visibility
    
- confidence
    
- control preview
    
- friction reduction
    

**UI constraints:**

- no authority
    
- no state ownership
    
- no direct execution bypass
    
- no identity mutation
    

UI = piano, not composer.

---

## 10. Non-Negotiable Rule (Locked)

> **All execution must follow:**  
> **Dispatch → Assemble → Execute**
> 
> Direct prompting must never be the default path.

---

## 11. Canonical Takeaways

- Markdown is law.
    
- Systems route; they do not think.
    
- Identity never mutates implicitly.
    
- Observability is not memory.
    
- Complexity is kept out of the brain on purpose.
    

---

**End of Systems Working Notes**
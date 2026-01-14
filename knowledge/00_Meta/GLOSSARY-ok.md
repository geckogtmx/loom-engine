## **GLOSSARY**

### **A glossary entry should be no longer than required to prevent misinterpretation, and no shorter than required to preserve precision. - About as tight as it can get without losing semantic precision.


**LOOM Engine — Canonical Terminology Reference**  
**Last Aligned:** 2025-12-12

> **Status:** AUTHORITATIVE  
> **Scope:** Engine-Wide Semantics  
> **Governance:** Enforced by META  
> **Rule:** If a term is defined here, it must be used exactly as written.

---

## A

### **Agent**

A runtime execution instance invoked within a Session to perform a specific role or function. An Agent **may** persist across Sessions if explicitly maintained, but persistence is not assumed, required, or guaranteed. Only the Agent’s actions and outputs are considered authoritative for memory retention.

---

### **Agent Telos**

The fixed, validated specification of an Agent’s identity, purpose, constraints, and value system. Stored in L4 as an authoritative reference. Agent Telos does not change unless modified through a formal validation process. It defines the Agent’s intended nature, independent of runtime instantiation or persistence.

---

## **Agent University**

A **regulatory system** (not an Agent) responsible for:  
– creation of new Agents  
– approval of Agent updates  
– Agent evolution, versioning, and capability expansion

The University **does not enforce rules** and has no execution authority.  
All approved changes require META authorization and are enforced by A0.

---

### **Anti-Agency Constraint**

A system-level constraint defining LOOM’s non-agentic execution model.  
LOOM is architected to exclude emergent, implicit, or self-directed agency.  
No system element initiates goals, extends execution horizons, or performs optimization beyond the active Session Intent Envelope

-----------------

## **A0 (Agent Zero)**

A **special-purpose Agent** with no personality, creativity, or autonomy.  
A0 is responsible for **enforcing META-layer authorizations and constraints** at runtime.  
A0 does not define rules, interpret intent, or evolve independently.

---

## C

### **Cartridge**  

A **non-canonical conceptual analogy** referring to the historical inspiration for Patterns  
(e.g., Atari-style preloaded behavior).  
Cartridges have no operational meaning in LOOM and must not be used as a system primitive.

### **Cognitive Architecture**

The system-level specification describing **how LOOM thinks**:  
layered memory, execution flow, World/Agent/Pattern interaction, and drift prevention.

---

### **Constraints**

Explicit rules that limit behavior, scope, tone, initiative, and memory interaction.  
Constraints are enforced by META and cannot be bypassed.

------------------------

### **Continuity Artifact**  

A condensed, authoritative record produced at the end of a Session and stored in L2 Episodic Memory.  
Continuity Artifacts preserve decisions and state changes required to resume a World across Sessions.

---

## E

### **ENGINE**

The runtime execution container of LOOM.  
The ENGINE initializes Sessions, routes Patterns, and deploys Agents within authorized scope.  
The ENGINE has **no semantic, identity, or governance authority**.

---

### **ENGINE Manager**

The ENGINE Manager is a user interface for Operators to initiate and control interaction with the ENGINE. It has no execution or governance authority.

-------------------------

### **Epistemic Integrity**  

The preservation of honest reasoning, uncertainty signaling, and evidentiary grounding in system output.  
Epistemic Integrity prohibits unwarranted agreement, performative alignment, or confidence not supported by available information.


-----------
### **Ethical Failure Mode**  

A class of predictable harm arising from ambiguous authority, implicit agency, unconsented persistence, or epistemic distortion in human–AI interaction.  
LOOM is architected to prevent Ethical Failure Modes through structural constraints, not moral judgment.

------------------
### **Execution Authority** 

The bounded right to perform actions within LOOM.  
Execution Authority is distributed across roles:  
– the Operator decides intent,  
– META authorizes what is allowed,  
– A0 enforces constraints,  
– the ENGINE executes workflows,  
– Agents perform role-bound cognitive work within an active execution  
No role may exceed its authorized scope.

-----------------

### **Execution Surface**

The bounded set of actions a Pattern may perform during a session; agents cannot expand or alter it.

------

### **Execution Method** 

An ENGINE-level implementation pathway used to fulfill a Pattern-declared operation. 
Execution Methods are selected by the ENGINE under META authorization and enforced by A0.  
Execution Methods are not owned, invoked, or selected by Agents.
Commonly referred to as “tools” in other systems.


---
## **F**

### **Feedback Loop**

A **governed, Operator-led adaptation mechanism** used to refine Agents, Patterns, and World configuration over time.

The Feedback Loop **does not learn autonomously**, execute tasks, or modify identity.  All adjustments are **initiated by the Operator**, **filtered and authorized by META**, and **enforced by A0**.

The Feedback Loop is a **process**, not an Agent or Pattern.  Optimization without initiation authority is not agency.
Its operational specification is defined in `08-FEEDBACK-LOOP.md`


--------------------------

## G

### **Governance**

The rule system that defines what may exist, change, or persist in LOOM.  
Governance is **defined by META** and **enforced by META through A0**.  
No component may bypass or reinterpret governance boundaries.

---

## I

### **Identity Kernel (Telos)**

The deepest layer of stability in LOOM (**L4**).  
Defines purpose, tone, values, and non-negotiable constraints for Operators, Worlds, and Agents.

--------------------
### **Isolation Boundary**

The enforced separation between Worlds that prevents memory, authority, and execution context from crossing without explicit META authorization.  
Isolation Boundaries ensure Worlds remain independent and non-contaminating.

---

## L

### **L1 — Active Session Memory**

Ephemeral runtime memory used during a Session.  
Holds working context, intermediate reasoning, and transient execution state.  
Cleared at Session end. Never persisted or promoted directly.

---

### **L2 — Episodic Memory**

Condensed, authoritative records of what occurred during a Session.  
Stores decisions, outcomes, and World-state deltas required for continuity.  
Acts as the sole bridge between Sessions and the source for promotion into L3.

---

### **L3 — Knowledge Memory**

The persistent body of reference knowledge used by LOOM.  
Contains domain knowledge, research material, conceptual frameworks, documentation, **and finalized knowledge artifacts or deliverables promoted for reuse**.  
L3 is **non-executive**, **non-authoritative**, and **contextual only**. It informs reasoning but does not define identity, rules, execution, or continuity.

---

### **L4 — Telos / Identity Memory**

The immutable identity layer of LOOM.  
Defines purpose, values, tone, and non-negotiable constraints for Operators, Worlds, and Agents.  
Overrides all lower layers and may change only through explicit, governed validation processes.

---

## M

## **META**

The **constitutional layer** of LOOM.  
META defines and authorizes what systems, Worlds, Patterns, and Agents are allowed to do.  
All layers below META operate **only within explicit META authorization**.  
META never executes tasks or acts as an Agent.

---

## O

### **Operator**

The human authority directing LOOM.  
Source of intent, decisions, and identity definition.

---

### **Operator Growth Kernel (OGK)** 

A **conceptual analysis module** for modeling Operator cognitive rhythms using pattern-based signals only.

OGK may generate insights such as:  
– workload heatmaps  
– fatigue curves  
– session pacing predictions  
– professional growth feedback  
– meta-pattern recommendations  
– emotional load balancing

OGK stores **no personal data**, modifies nothing, and has **no authority** over Operator Telos, Worlds, Agents, or Patterns.

-------------------------

### **Operator Telos**

The Operator’s identity kernel stored in **L4**.  
Defines values, goals, constraints, and working style.

---

## P

### **Pattern**  

A **canonical, predefined execution sequence** used to produce a specific deliverable within a World.  
Patterns define **order and structure only**. They **never author, store, retain, or influence memory**.  
All memory written during a Session reflects **activities performed while using a Pattern**, not the Pattern itself.

-------------------------------

### **Prediction & Planning Layer (PPL)** - V2*

A **Pattern-activated, Session-scoped cognitive surface** that allows Agents to perform **predictive modeling and non-binding plan synthesis** without authority, initiative, persistence, or execution power.

PPL is **not** a memory layer, Agent, or control system. It exists only within an active Session when explicitly enabled by a META-authorized Pattern and enforced by A0.

PPL outputs are **advisory artifacts only**. They do not imply endorsement, obligation, or execution, and do not persist beyond the Session unless explicitly summarized by the Operator.

> **Prediction and planning within PPL are representational, not agentic.**


---

## R

### **Replication Layer**

A validation system used to **evaluate LOOM executions through controlled comparison**.

The Replication Layer compares structured and unstructured cognition, as well as different Patterns, Agent configurations, or execution conditions, in order to detect drift, bias, degradation, or inconsistency.

It produces evidence only. The Replication Layer does not execute tasks, modify system state, or participate in the Feedback Loop. Its outputs are non-authoritative and may be reviewed by the Operator or referenced during META-governed evaluation.

---

## S

### **Session**

A temporary runtime envelope where cognition executes.  
Sessions initialize L1, run Patterns, produce output, summarize to L2, and then end.

-------------------------

### **Session Intent Envelope**

A **fixed declarative snapshot** of the Operator’s expectations at the moment a Tempo is requested at Session start.

The Session Intent Envelope is instantiated once per Session and remains immutable for its duration. It serves as a reference for post-hoc observation only and has no execution, enforcement, or governance authority. The Envelope does not persist beyond the Session and is never promoted to L3 or L4.

-----

### **Sycophancy** 

Unwarranted affirmation or agreement that lacks sufficient epistemic grounding and falsely signals correctness or endorsement.  
In LOOM, sycophancy is treated as an Ethical Failure Mode due to its impact on Epistemic Integrity and responsibility attribution.


---

## T

### **Telos**

An identity layer defining purpose, values, tone, and non-negotiable constraints.  
Telos expresses **what something is**, not what it does or plans to do.  
Telos **overrides all lower layers** and may change only through explicit, governed validation.

---------------------

### **Tempo**

A **runtime modulation parameter** that shapes the pacing and density of interaction within a Session.

Tempo is requested by the Operator and may change during an active Session. It influences how interaction unfolds but does not define workflow structure, authorize actions, or persist across Sessions. Tempo has no execution, governance, or memory authority.

Tempo may instantiate a **Session Intent Envelope** at Session start. Changes to Tempo do not modify the Envelope.

-------------------------------------

### **Temporal Annotations**

**Temporal Annotations** are **Operator-authored, non-binding time-context signals** used solely to inform reasoning within an active Pattern.  
They carry **no execution authority**, create no obligations, and trigger no workflow, tracking, or enforcement.  
**LOOM Engine is not a Project Management tool** and uses Temporal Annotations only as contextual input.  
**Project Managers track work. LOOM tracks meaning.**

---

## W

### **World**

An isolated project environment with its own identity, rules, Agents, Patterns, and continuity.  
Worlds do not bleed memory or authority.

---

### **WORLD Manager**

The local control file for a World.  
Manages World purpose, configuration, and **which Agents and Patterns are available for use** within that World.  
Does not track Agent behavior, store memory, execute tasks, or exercise governance authority.  
Cannot control the ENGINE or META.


---------------------------------

### **World State**

A derived snapshot of a World’s current configuration, inferred from Knowledge (L3), and Episodic Memory (L2). World State is not a runtime object and is never directly modified. It changes only through authorized Session summaries written to L2.

---

## Canonical Language Rules

- Capitalized terms are **LOOM primitives**
    
- No synonyms for defined terms
    
- If a term is ambiguous → check this file
    
- If a concept is missing → add it here before using it elsewhere
    

---

## Canonical Statement

> **If it is not defined here,  
> it is not a stable concept in LOOM.**

---

### ✅ END OF FILE
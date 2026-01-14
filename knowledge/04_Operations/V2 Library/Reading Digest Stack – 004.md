# Reading Digest Stack – 004 (Loom V2 Intake)
_Language Models Represent Beliefs Internally (2023)_

## 📄 Source: Paper #4  
**Language Models Represent Beliefs Internally**  
Marianne Defresne, Sophie Barbe, Thomas Schiex (2023)  
Link: https://arxiv.org/abs/2305.07617

---

# 1. Raw Bullets (Extraction)

### Paper 4 — Raw Bullets
- LLMs contain **latent belief states** encoded in internal representations.
- These beliefs are **persistent** across paraphrased prompts and phrasing changes.
- Beliefs function as **statistical attractors** in the model’s prediction space.
- Multiple contradictory beliefs can coexist and activate under different contexts.
- Belief activation affects **logical reasoning**, inference, and fact retrieval.
- Beliefs require structured interventions to update; surface corrections often fail.
- Some beliefs have **activation thresholds**, appearing only under specific cues.
- These latent states behave like **hidden variables** that influence all downstream reasoning.
- Belief drift can occur based on conversation history or contextual bias.
- Stable “traits” can emerge — proto-consistency patterns resembling personality or worldview.

---

# 2. Key Themes (Consolidation)

### Theme A — Latent Beliefs as Internal Structures
- Beliefs exist as hidden representations.
- They influence reasoning even when not explicitly queried.
- They can be inconsistent or multi-valued.

### Theme B — Belief Persistence & Activation Dynamics
- Beliefs persist across prompts.
- Triggered by contextual cues.
- Some require threshold conditions to manifest.

### Theme C — Belief Drift & Hidden Variables
- Beliefs shift depending on conversation history.
- Hidden variables affect output without transparency.
- Drift can compound over long interactions.

### Theme D — Belief Impact on Reasoning
- Logical inference is colored by latent beliefs.
- Beliefs can override explicit instructions.
- Surface-level neutrality does not prevent internal bias activation.

### Theme E — Control, Correction, & Intervention
- Beliefs are hard to correct from outside.
- Requires structured intervention patterns.
- Belief mapping or anchoring can improve consistency.

---

# 3. Loom-Relevant Hooks (Distillation)

### Theme A → Loom Hooks (Internal Structures)
- META should assume latent internal states exist and monitor output for signs of attractor activation.
- Agent Telos must define **allowed attractors** (roles, tone, reasoning patterns) to prevent identity drift.

### Theme B → Loom Hooks (Activation & Persistence)
- Patterns should include **context-reset steps** to prevent re-triggering unwanted latent states.
- Worlds may include **belief anchors**: explicit Operator-grounded facts that correct or counter drifting states.

### Theme C → Loom Hooks (Drift & Hidden Variables)
- META monitors for **belief drift indicators** (contradictions, shifts in stance, inconsistent logic).
- Session logs track “belief expression points” for debugging drift across long-form interactions.

### Theme D → Loom Hooks (Impact on Reasoning)
- Patterns require **inference scaffolding** so reasoning remains grounded in Operator intent, not internal attractors.
- Introduce a “Reasoning Integrity Check” step for Agents in critical tasks.

### Theme E → Loom Hooks (Control & Intervention)
- Structured interventions become part of Patterns:  
  - context purification  
  - explicit constraint reminders  
  - grounding statements  
- A0U may develop “Belief-Control Protocols” for Agent training and alignment testing.

---

# 4. Stacked Summary (Running Digest)

### Running Digest Across Papers 1–4
- Distributed cognition + repeated cooperation = core structure of hybrid systems (Patterns, Worlds).
- Shared mental models, ToM, communication, autonomy levels, and trust calibration are universal across all hybrid-intelligence research.
- Belief states, latent attractors, and representational drift demonstrate why META is essential.
- Explainability, transparency, uncertainty signaling, and monitoring layers maintain situational awareness and prevent cognitive drift.
- Loom must manage internal AI attractors externally through Patterns, Telos, META rules, and World anchors.
- V2 needs explicit drift detection, belief alignment strategies, and reasoning integrity frameworks.


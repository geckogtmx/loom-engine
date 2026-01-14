# Reading Digest Stack – 002 (Loom V2 Intake)
_A structured intake for Paper #2 — Human–AI Teaming_

---

## 📄 Source: Paper #2  
**Defining human-AI teaming the human-centered way: a scoping review and network analysis** (Berretta et al., 2023)  
Link: https://pmc.ncbi.nlm.nih.gov/articles/PMC10570436/  

---

# 1. Raw Bullets (Extraction)

### Paper 2 — Raw Bullets
- Human–AI teaming (HAIT) is framed as a **socio-technical approach**: humans + AI + context + work systems. :contentReference[oaicite:1]{index=1}  
- AI should be treated as a **team member**, not only as a tool. :contentReference[oaicite:2]{index=2}  
- HAIT aims at **symbiotic, interdependent collaboration** between humans and AI at work. :contentReference[oaicite:3]{index=3}  
- The paper identifies **five research clusters**: human-related variables, task-related variables, AI explainability, AI-driven robotic systems, and effects of AI performance on human perception. :contentReference[oaicite:4]{index=4}  
- Current literature is still predominantly **technology-centric**, not human-centered. :contentReference[oaicite:5]{index=5}  
- There is **no consistent definition or terminology** yet for human–AI teaming (HAIT). :contentReference[oaicite:6]{index=6}  
- AI explainability is a key cluster: explanations are central for trust, understanding, and safe use. :contentReference[oaicite:7]{index=7}  
- Effects of AI performance on human perception are critical: performance influences trust, reliance, and perceived competence. :contentReference[oaicite:8]{index=8}  
- Human–AI teaming research focuses on **antecedents and outcomes** of teaming (what factors enable it, and what results it produces). :contentReference[oaicite:9]{index=9}  
- Many insights come from **human–human teamwork research**, reused for human–AI teams (shared mental models, communication, coordination, trust). :contentReference[oaicite:10]{index=10}  
- Academic references in this area form **dense citation networks**, enabling “tunneling” into adjacent topics (trust, explainability, agency, etc.). :contentReference[oaicite:11]{index=11}  
- The review emphasizes **human-centered research**: putting people and evolving teams at the center rather than just AI performance. :contentReference[oaicite:12]{index=12}  
- HAIT is about **shared goals, interdependence, communication, and coordinated activity** over time. :contentReference[oaicite:13]{index=13}  
- Teaming with autonomous AI-driven systems requires **clear delegation chains** from simple operator instructions to autonomous sub-tasks. :contentReference[oaicite:14]{index=14}  
- Commonalities between human–human and human–AI teams include: need for role clarity, shared mental models, communication routines, trust, and situation awareness. :contentReference[oaicite:15]{index=15}  
- The paper calls for **clearer concepts, fewer acronyms, and consistent terminology** to stabilize the field. :contentReference[oaicite:16]{index=16}  

---

# 2. Key Themes (Consolidation)

### Theme A — Socio-Technical & Human-Centered Framing
- HAIT as a socio-technical system (humans + AI + context).
- AI as team member, not just tool.
- Shift from technology-centric to human-centered perspectives.

### Theme B — Research Clusters & Fragmentation
- Five clusters: human variables, task variables, explainability, AI robotics, AI performance perception.
- Field lacks consistent terminology and unified definitions.
- Dense citation networks as “tunnels” for deeper exploration.

### Theme C — Explainability & Perception of AI Performance
- AI explainability as core to trust and safe use.
- AI performance shapes human perception, trust, and reliance.
- Need to address automation bias and perceived “sliced bread” effect.

### Theme D — Transfer from Human–Human Teaming
- Reuse of human–human team principles: shared mental models, communication, trust, coordination.
- Recognition that human–AI teams share many structural features with human–human teams.

### Theme E — Autonomy, Delegation & Teaming with Autonomous Systems
- Teaming includes autonomous AI-driven systems, not just assistive tools.
- Importance of clear delegation chains from operator → autonomous sub-tasks.
- Need to define autonomy levels and supervisory control.

---

# 3. Loom-Relevant Hooks (Distillation)

### Theme A → Loom Hooks (Socio-Technical & Human-Centered)
- Officially define Loom as a **socio-technical cognitive architecture**: Operator + Agents + Worlds + Tools + Context.
- Ensure **Worlds** always model human context (work, constraints, org, environment), not only tasks.
- META’s mandate explicitly includes **human-centered alignment**, not just technical coordination.

### Theme B → Loom Hooks (Clusters & Fragmentation)
- Use the five HAIT clusters as **categories in Academic-Cross-Reference.md** (human, task, explainability, robotics/embodiment, perception).
- For each new Loom concept, record which cluster(s) it touches.
- Adopt a **tight acronym policy** in Loom docs to avoid the field’s confusion (standardize on HHI, HAI, HAIT as needed).

### Theme C → Loom Hooks (Explainability & AI Performance Perception)
- Extend Pattern definitions with an **Explainability Level** per step (low/medium/high).
- META monitors for **automation bias** and “illusion of insight” (Operator over-trusting agent outputs).
- Introduce an internal Loom concept: **Perceived Agent Competence** and log it in OGK (how “smart” the Operator feels the Agent is vs actual performance).

### Theme D → Loom Hooks (Transfer from Human–Human Teaming)
- Add a “Teamwork Principles Used” field to Patterns, explicitly referencing human-team concepts:  
  - shared mental model update  
  - communication rule  
  - trust checkpoint  
  - situation awareness update
- In WORLD Manager, include a section mapping **human–human team principles → this World’s human–AI equivalents**.

### Theme E → Loom Hooks (Autonomy & Delegation)
- Extend Pattern steps with an **AutonomyLevel** field: none / low / medium / high.
- A0U defines autonomy ranges for each Agent per World, enforced by META.
- Session logs track when Agents executed autonomous chains vs simple single-step actions.

---

# 4. Stacked Summary (Running Digest)

### Running Digest (Paper #2)
- Loom should be explicitly framed and documented as a **socio-technical system**, aligning with human–AI teaming literature.
- Academic fragmentation (terms, acronyms) is a warning: Loom must maintain **clear, consistent internal terminology**.
- Explainability and perceived AI performance are central to trust; Loom needs explicit **explainability levels** and **automation-bias guards**.
- Human–human teamwork theory is directly reusable for Loom: shared mental models, communication, trust, role clarity, and situation awareness must be encoded structurally.
- Autonomy and delegation are not optional: Loom Patterns and A0U need explicit **autonomy levels** and **supervisory control rules** for Agents.

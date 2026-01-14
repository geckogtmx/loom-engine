# WARP_WORKFLOW_EXAMPLE — Podcast World & Pattern Example

> **Status:** Non-Canonical / Advisory  \
> **Scope:** Example World + Patterns + one formal Pattern spec  \
> **Governance:** Subordinate to META, LOOM-ARCHITECTURE, Cognitive Architecture, 4-Layer Memory Model, and GLOSSARY  \
> **Rule:** Where conflict exists, canonical LOOM documents prevail.

---

## 1. Example World: `WORLD-PODCAST-01 — Signalcast`

### 1.1 World Purpose

`WORLD-PODCAST-01` is an example World used to plan, research, write, and prepare production for a recurring podcast.

**Purpose:**

- Produce a recurring podcast that explains complex systems and AI to curious but busy listeners.  \
- Maintain continuity in tone, quality, and expectations across episodes.

### 1.2 World Telos (L4 — Identity Kernel)

Illustrative, not canonical:

- Serve the same core audience over time.  \
- Prioritize clarity, intellectual honesty, and practical takeaways.  \
- Avoid hype, clickbait, and speculative claims dressed as fact.  \
- Tone: calm, thoughtful, non-snarky, non-patronizing.  \
- No hallucinated sources; all factual claims must be traceable.

### 1.3 World Constraints

- Default classification: `PRIVATE_LOCAL`.  \
- External LLMs and tools may only be used when explicitly allowed by the Operator.  \
- No autonomous scheduling, publishing, or contacting guests; Agents produce plans and proposals only.  \
- Each episode must expose:  
  - a single, clear promise;  \
  - a short “who this is for / who this isn’t for”;  \
  - show notes with links to real sources when claims are made.

### 1.4 Allowed Patterns (L3 — Knowledge)

Within this World, the following Patterns are available (descriptive names; specs may be refined):

- `PODCAST_EPISODE_DISCOVERY`  
- `PODCAST_EPISODE_RESEARCH`  
- `PODCAST_EPISODE_OUTLINE`  
- `PODCAST_EPISODE_SCRIPT`  
- `PODCAST_EPISODE_PRODUCTION_PREP`  
- `PODCAST_EPISODE_POSTMORTEM`

Each Pattern is executed inside Sessions and writes only to allowed memory layers.

### 1.5 Agents in this World

The following Agents are available in `WORLD-PODCAST-01`. Their Telos live in L4; their behavioral definitions and tools live in L3. Names are illustrative.

- **Atlas (Researcher)**  
  - Telos: structured researcher, source curator, fact-checker.  
  - Allowed: summarize sources, compare claims, identify gaps and risks.  
  - Forbidden: deciding “the angle” of the episode or final framing.

- **Nova (Concept & Story)**  
  - Telos: helps the Operator explore angles, hooks, and narrative shapes.  
  - Allowed: propose concepts, hooks, metaphors, and episode angles.  
  - Forbidden: locking final framing or title; must escalate decisions.

- **Miles (Writer)**  
  - Telos: drafting and revising textual artifacts (scripts, intros, show notes) within World tone.  
  - Allowed: expand, condense, and rewrite per instructions.  
  - Forbidden: inventing new factual claims not grounded in research artifacts.

- **SAM (Summarizer)**  
  - Telos: condense Sessions into L2 summaries and decision records.  
  - Allowed: summarization, extraction of decisions and open questions.  
  - Forbidden: introducing new ideas, recommendations, or interpretations.

- **Mark (Producer)**  
  - Telos: logistics and production planning.  
  - Allowed: propose checklists, timelines, resource lists, and production plans.  
  - Forbidden: committing to calendars, sending communications, or executing tasks.

These Agents operate only within this World, under Patterns, inside active Sessions.

---

## 2. Episode-Level Workflow (End-to-End Overview)

This section narratively describes how a **single podcast episode** is produced using LOOM primitives.

### 2.1 High-level episode journey

A single episode typically flows through multiple Sessions and Patterns:

1. **Session 1 – Discovery**  \
   Pattern: `PODCAST_EPISODE_DISCOVERY` (clarify who/what/why).  \
   Output: constraints, angles, chosen promise, L2 discovery summary.

2. **Session 2 – Research**  \
   Pattern: `PODCAST_EPISODE_RESEARCH` (build research base).  \
   Output: source lists, digests, risk notes, L2 research summary.

3. **Session 3 – Outline**  \
   Pattern: `PODCAST_EPISODE_OUTLINE` (structure and segments).  \
   Output: final outline artifacts + L2 structure summary.

4. **Session 4 – Script Draft**  \
   Pattern: `PODCAST_EPISODE_SCRIPT` (first draft).  \
   Output: `episode-script-v1` and L2 script summary.

5. **Session 5 – Script Revision**  \
   Pattern: `PODCAST_EPISODE_SCRIPT` (revision run).  \
   Output: `episode-script-v2` (record-ready), updated script summary.

6. **Session 6 – Production Prep**  \
   Pattern: `PODCAST_EPISODE_PRODUCTION_PREP`.  \
   Output: recording plan, asset checklist, post-recording task list, L2 production plan.

7. **Session 7 – Postmortem**  \
   Pattern: `PODCAST_EPISODE_POSTMORTEM`.  \
   Output: episode-level retrospectives and L2 postmortem summary.

Across all of this:

- **L4** (Telos) never changes unless explicitly edited via META-governed flows.  \
- **L3** (Knowledge) stores World, Agent, and Pattern definitions.  \
- **L2** (Episodic) accumulates discovery, research, structure, script, production, and postmortem summaries.  \
- **L1** (Active) is per-Session RAM and is flushed when Sessions end.

---

## 3. Pattern Overviews (Narrative)

The following subsections briefly describe each Pattern used in the episode lifecycle.

### 3.1 `PODCAST_EPISODE_DISCOVERY`

**Goal:** Turn a fuzzy “I want to do an episode about X” into a well-bounded episode concept.

- Capture who the episode is for.  \
- Clarify constraints and boundaries.  \
- Explore multiple candidate angles.  \
- Select and commit to an Episode Intent Envelope.

Outputs:

- Constraints artifact for the episode.  \
- Candidate angles + pros/cons.  \
- Chosen angle and one-sentence promise.  \
- L2 discovery summary.

### 3.2 `PODCAST_EPISODE_RESEARCH`

**Goal:** Build a research base aligned with the chosen angle and constraints.

- Identify key sources (papers, articles, data, contrarian views).  \
- Summarize each selected source into digests.  \
- Flag contested areas, uncertainties, and risks.  \
- Produce an L2 research summary that can guide later Patterns.

### 3.3 `PODCAST_EPISODE_OUTLINE`

**Goal:** Turn concept + research into a precise episode outline and segment plan.

- Propose an initial narrative structure (intro, segments, closing).  \
- Let the Operator rearrange, cut, or expand segments.  \
- Refine an Operator-approved outline into a tight, production-ready structure.  \
- Summarize structure into L2 for continuity.

### 3.4 `PODCAST_EPISODE_SCRIPT`

**Goal:** Produce and refine a script (or detailed talking points) without losing constraints or tone.

- Draft a first-pass script aligned with World Telos and research.  \
- Let the Operator edit and annotate.  \
- Run revision passes to harmonize voice and length.  \
- Summarize script shape into L2.

### 3.5 `PODCAST_EPISODE_PRODUCTION_PREP`

**Goal:** Turn the approved script into a concrete recording and production plan.

- Generate a recording plan (segments, order, risks).  \
- Create an asset checklist (equipment, documents, show note templates).  \
- Produce a post-recording task list.  \
- Summarize the plan into L2.

### 3.6 `PODCAST_EPISODE_POSTMORTEM`

**Goal:** Capture learnings from the episode and feed them back into World-level continuity.

- Prompt the Operator to describe what worked, what failed, and why.  \
- Structure notes into “keep doing / stop doing / try next time.”  \
- Summarize as L2 postmortem, optionally suggesting L3 changes (never auto-applying).

---

## 4. Formal LOOM-Style Pattern Spec — `PODCAST_EPISODE_DISCOVERY`

> **Note:** This spec is written in a style roughly aligned with other LOOM documents, but it is **non-canonical** and intended as a template/example.

### 4.1 Header

**Pattern ID:** `PODCAST_EPISODE_DISCOVERY`  \
**World Scope:** `WORLD-PODCAST-01` (may be adapted for others)  \
**Status:** Experimental / Non-Canonical  \
**Governance:** Subordinate to META, Cognitive Architecture, 4-Layer Memory Model  \
**Last Edited:** 2026-01-14

---

### 4.2 Purpose

This Pattern defines a governed discovery workflow for designing a single podcast episode.

It converts a vague episode idea into a well-bounded **Episode Intent Envelope**:

- Who the episode is for.  \
- What promise it makes.  \
- What constraints apply.  \
- Which angle has been consciously selected.

No research, writing, or production tasks occur in this Pattern. It is strictly for intent formation and constraint capture.

---

### 4.3 Preconditions & Scope

**Preconditions:**

- A World exists with a defined Telos (e.g., `WORLD-PODCAST-01`).  \
- Operator is present and able to answer reflective questions.  \
- META allows the use of Agents `Nova` and `SAM` in this World.

**Scope:**

- Single episode, from zero or fuzzy concept to a committed Episode Intent Envelope.  \
- No external sources or tools are required; all content is Operator-supplied.

---

### 4.4 Agents & Roles

- **Nova (Concept & Story)**  \
  - Role: guided questioning and angle exploration.  \
  - Reads: World Telos (L4), any relevant prior L2 episode postmortems.  \
  - Writes: Episode constraints and candidate angles (artifacts, L1).

- **SAM (Summarizer)**  \
  - Role: condense discovery Session into an L2 summary.  \
  - Reads: outputs from Nova and Operator edits.  \
  - Writes: L2 discovery summary for this episode.

No other Agents participate in this Pattern.

---

### 4.5 Memory Read/Write Rules

**Reads:**

- L4:  \
  - Operator Telos.  \
  - World Telos for `WORLD-PODCAST-01`.

- L3:  \
  - World definition and constraints.  \
  - (Optional) Pattern definition itself.

- L2 (optional):  \
  - Selected prior episode postmortem summaries (if they exist).

**Writes:**

- L1:  \
  - Freeform Q&A during Primacy Expansion.  \
  - Draft constraints and angles before Operator approval.

- Artifacts (World-scoped files or records):  \
  - `episode-constraints.md` (or equivalent structure).  \
  - `episode-angles.md` (candidate angles + pros/cons).

- L2:  \
  - Single **discovery summary** for this episode, written by SAM **only after** Operator review.

No writes are allowed to L3 or L4.

---

### 4.6 Step Sequence (Canonical Flow)

The Pattern is executed in a single Session with the following steps:

1. **Step 1 — Primacy Expansion (Question-Only)**  \
   **Agent:** Nova  \
   **Layer Writes:** L1 only  \
   **Description:**  \
   - Nova engages in question-only dialogue.  \
   - Goal: expand and clarify Operator’s intent without proposing any angles or titles.  \
   - Example question domains:  \
     - Who do you imagine listening to this episode?  \
     - What problem or curiosity are they bringing?  \
     - What do you want them to feel or know after listening?  \
     - What is off-limits (topics, tone, claims)?

   **Constraints:**  \
   - No pitches, suggestions, or summaries at this step.  \
   - Only questions and brief recaps of what the Operator has already said.

2. **Step 2 — Constraint Capture (Draft)**  \
   **Agent:** Nova  \
   **Layer Writes:** Artifact + L1  \
   **Description:**  \
   - Nova converts the Q&A into a first-pass `episode-constraints` structure, typically including:  \
     - Audience description.  \
     - Episode “radius” (what is in-scope vs out-of-scope).  \
     - Required tone and stylistic notes.  \
     - Hard constraints (must-avoid topics, claims, or framings).

   **Operator Role:**  \
   - Reviews and edits this constraints artifact directly.  \
   - Pattern pauses until Operator signals that constraints are acceptable.

3. **Step 3 — Angle Exploration**  \
   **Agent:** Nova  \
   **Layer Writes:** Artifact + L1  \
   **Description:**  \
   - Nova proposes multiple candidate episode angles based on the constraints, e.g.:  \
     - “Story-first” angle.  \
     - “Explainer-first” angle.  \
     - “Debate-style” angle.  \
   - For each angle, Nova lists:  \
     - One-sentence promise.  \
     - Pros and cons.  \
     - Risks or constraints it might strain.

   **Constraints:**  \
   - Nova must not pick a “winner.”  \
   - All angles must be consistent with the World Telos.

4. **Step 4 — Operator Selection & Intent Envelope Commit**  \
   **Agent:** None (Operator-only)  \
   **Layer Writes:** Artifact edits (Operator)  \
   **Description:**  \
   - Operator chooses one angle or combines elements into a new angle.  \
   - Operator writes or confirms:  \
     - Final one-sentence episode promise.  \
     - A short “for whom / not for whom” description.  \
   - Result becomes the **Episode Intent Envelope**.

   **Constraint:**  \
   - No Agent may alter the chosen envelope in this Pattern once committed.

5. **Step 5 — Discovery Summary (L2 Write)**  \
   **Agent:** SAM  \
   **Layer Writes:** L2 (Episodic)  \
   **Description:**  \
   - SAM reads the finalized constraints and Episode Intent Envelope.  \
   - SAM writes a concise L2 summary including:  \
     - Who the episode is for.  \
     - The episode’s promise.  \
     - Key constraints.  \
     - Selected angle.  \
     - Any notable open questions to carry forward.

   **Operator Role:**  \
   - Reviews and optionally edits SAM’s summary before it is stored.  \
   - L2 write occurs only after explicit Operator approval.

After Step 5, the Session terminates and L1 is flushed.

---

### 4.7 Failure Modes & Escalation

- If Nova attempts to propose solutions or rhetorical framings during Primacy Expansion, A0 may:  \
  - Halt the step.  \
  - Surface a warning to the Operator.  \
  - Request Pattern restart or confirmation.  \
- If Operator declines to choose any angle:  \
  - Pattern may be rerun in a later Session with updated constraints.  \
- No automatic evolution occurs; repeated friction may be logged in L2 as behavioral observations for later review.

---

### 4.8 Relationship to Other Patterns

Outputs of `PODCAST_EPISODE_DISCOVERY` feed downstream Patterns:

- `PODCAST_EPISODE_RESEARCH` uses the Episode Intent Envelope as its brief.  \
- `PODCAST_EPISODE_OUTLINE` uses discovery and research summaries to shape narrative structure.  \
- `PODCAST_EPISODE_SCRIPT` respects the constraints and audience definition captured here.  \
- `PODCAST_EPISODE_POSTMORTEM` may refer back to discovery decisions when evaluating whether the episode fulfilled its promise.

---

### 4.9 Canonical Constraint (Pattern-Level)

> **In this Pattern, discovery precedes framing.**  \
> The Operator commits to an Episode Intent Envelope.  \
> No Agent may silently redefine that intent afterwards.

---

### END OF FILE

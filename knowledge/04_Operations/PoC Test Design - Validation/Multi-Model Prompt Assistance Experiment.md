# Multi-Model Prompt Assistance Experiment  
**Design · Execute · Analyze**

---

## 1. Purpose

Evaluate whether adding a **small, fixed “assisted context layer”** (a simulated cognitive layer made of curated, task-relevant information) improves model behavior compared to a **raw prompt**, across multiple models.

Primary outcomes to measure:
- Drift reduction
- Hallucination reduction
- Constraint adherence
- Memory/recall stability
- Overhead vs benefit tradeoff

This is a **comparative, controlled study**, not a claim of ground truth or general intelligence.

---

## 2. Core Hypothesis

> Prompts augmented with a small, structured, task-relevant context layer will show **less drift, fewer hallucinations, and better constraint retention** than raw prompts, under identical conditions.

Secondary hypothesis:
> Benefits generalize across multiple models, not just one.

---

## 3. Experimental Structure (Three-Layer Pipeline)

### Layer A — **Design (Protocol Authoring)**
**Actor:** Large reasoning model (e.g. ChatGPT)

Responsibilities:
- Define hypotheses
- Specify test cases
- Define assisted-context format
- Define metrics and scoring rules
- Define dataset schema
- Define reporting template
- Document limitations and scope

Rules:
- Protocol is written **once**
- Versioned and frozen before execution
- No mid-experiment changes

Outputs:
- `protocol.md`
- `dataset_schema.json`
- `metrics_definition.md`
- `report_template.md`

---

### Layer B — **Execution (Local, Deterministic)**
**Actor:** Local model(s), orchestrated by Qwen2.5-14B

Responsibilities:
- Run tests exactly as specified
- Apply raw vs assisted prompt variants
- Log outputs verbatim
- Compute metrics using code (not judgment)
- Store all artifacts locally

Key characteristics:
- No interpretation
- No adaptive prompting
- No protocol changes
- Fully repeatable

Outputs:
- Raw model outputs
- Assisted model outputs
- Structured logs (CSV / JSON)
- Computed metrics

Execution models may include:
- qwen2.5:14b
- qwen2.5:7b
- gemma3:4b
- deepseek-small (if installed)
- others explicitly listed in protocol

---

### Layer C — **Analysis (Read-Only, External)**
**Actor:** Large API model (e.g. Gemini via Warp)

Responsibilities:
- Read frozen protocol
- Read execution logs and metrics
- Identify patterns and trends
- Compare raw vs assisted conditions
- Summarize results
- State limitations clearly

Explicit constraints:
- Analysis only
- No reruns
- No new metrics
- No protocol edits
- All claims must reference dataset values

Outputs:
- `analysis_summary.md`
- Tables and comparisons
- Explicit scope and caveats
- Suggested future experiments (non-binding)

---

## 4. Assisted Context Layer (Simulation)

The assisted layer is:
- Small (bounded token count, e.g. ≤10–15% of base prompt)
- Static per test case
- Explicitly provided in context
- Read-only

It may include:
- Definitions
- Constraints
- Goals
- Terminology normalization
- Known exclusions
- Short “memory-like” reminders

It does **not**:
- Adapt during execution
- Grow dynamically
- Contain conclusions
- Override the main prompt

This layer simulates a minimal cognitive scaffold, not intelligence.

---

## 5. Metrics (Code-First)

Metrics must be:
- Defined before execution
- Computable by code
- Comparable across models

Examples:
- Constraint violations (count)
- Hallucination flags (rule-based detection)
- Topic drift (semantic distance)
- Recall errors (missed required items)
- Output variance between runs
- Token overhead vs improvement ratio

Models do **not** score themselves.

---

## 6. Model Role Separation (Critical)

| Role | Model |
|----|----|
| Protocol design | ChatGPT (or equivalent) |
| Execution & logging | Qwen2.5-14B (local) |
| Routing / batching | Qwen2.5-7B |
| Normalization / extraction | Nemotron-3-Nano |
| Validation / contradiction checks | DeepSeek (small) |
| Final analysis | Gemini API |

No model may:
- Design the test **and**
- Execute it **and**
- Judge the outcome

---

## 7. Validity Claims (Allowed)

This study can claim:
- Relative improvements under controlled conditions
- Reduced drift/hallucination for assisted prompts
- Model-specific and cross-model comparisons
- Measurable overhead vs benefit

It cannot claim:
- Universal effectiveness
- Truth or factual correctness
- Causal guarantees
- Human-level memory or reasoning

---

## 8. Key Guardrails

- Protocol frozen before execution
- Same dataset for all conditions
- Raw vs assisted prompts differ **only** by context layer
- Metrics computed before analysis
- Analysis model is blind to expectations
- All artifacts stored and auditable

---

## 9. Practical Caps (Last-Mile Constraints)

To stay within API + local tooling limits:
- Fixed number of models (3–5)
- Fixed number of test cases
- Fixed assisted-layer size
- No adaptive reruns
- File-based, read-only analysis

---

## 10. Outcome

This setup provides a **credible, reproducible, and scoped** way to measure whether a small, structured context layer improves model behavior, while remaining honest about limitations and avoiding self-validation bias.

The result is not “proof of intelligence,” but **evidence of practical prompt-level assistance effects**.

---

## Note — Polish Runs and Switch to MVP Testing

At this point, the experimental design, roles, and metrics are considered **stable and complete for the research phase**. Any further runs should be treated as **polish runs**: validating tooling, improving automation reliability, and confirming repeatability, not expanding scope or redefining metrics.

Model comparison run (execution Model)

## Execution Models
### Why limiting to **2 execution models** is the right move

Using many models sounds attractive, but it:

- fragments the dataset
    
- increases variance
    
- weakens statistical signal
    
- increases interpretation ambiguity
    

Two models is the **minimum set** that still gives:

- bias avoidance
    
- cross-model validation
    
- clearer effect attribution
    

---

## Recommended pairing (from what you have)

Use **one “strong generalist” and one “weaker / different bias” model**.

### Best pair from your local set:

1. **qwen2.5:14b**
    
    - Primary executor
        
    - Higher reasoning capacity
        
    - More sensitive to context structure
        
2. **gemma3:4b** _or_ **deepseek-small**
    
    - Lower capacity / different training bias
        
    - More likely to drift or hallucinate
        
    - Better stress test for the assisted layer
        

This contrast makes effects visible.

## **MVP testing**

Subsequent work transitions to **MVP testing**, where the same runner and logging infrastructure is applied to **real operator prompts and real project data**, with reduced synthetic context and an added layer of structured human post-session notes. These MVP runs are **qualitative by intent** (“vibe tests”), intended to assess usability, trust, and practical value rather than statistical significance. This test must resemble the original automated task sequence tested for consistency. Context is changed to allow better Operator interaction

## Human rubric (keep it small)

Limit to 4–6 dimensions max:

- **Usefulness** – did it help?
    
- **Coherence** – did it stay internally consistent?
    
- **Trustworthiness** – did it feel safe to rely on?
    
- **Continuity** – did it remember context properly?
    
- **Correction cost** – how hard was it to fix?
    

Avoid open-ended surveys. Short, repeatable impressions are better.

## How this integrates with analysis

- Algorithmic metrics → **what changed**
    
- Human notes → **whether it mattered**
    

Later analysis (Gemini or similar) may:

- correlate human scores with metric deltas
    
- surface mismatches (“metrics improved but vibe didn’t”)
    
- highlight thresholds where assistance becomes noticeable
    

But:

- human notes never redefine success
    
- they contextualize it

Any changes beyond this point must be explicitly documented as **additions or deviations** from the baseline protocol defined in this experiment.

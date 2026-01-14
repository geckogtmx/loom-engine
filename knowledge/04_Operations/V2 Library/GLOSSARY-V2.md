# GLOSSARY — V2 CONCEPTS

**LOOM Engine — V2 Speculative Terminology Reference**  
**Last Aligned:** 2025-12-19

> **Status:** PROPOSED DRAFT
> **Scope:** V2 System Enhancements & Future Concepts
> **Governance:** Non-Authoritative. These terms supplement, but do not override, the canonical V1 Glossary.

---

## B

### B-Layer (Belief Layer)

The internal, inspectable interpretive layer of an Agent that shapes how it understands an **Activating Event (A)** before producing a **Consequence (C)**. The B-Layer is derived from Rational Emotive Behavior Therapy (REBT) principles and contains the Agent's persona, Telos, constraints, and cognitive heuristics. Its primary purpose is to make an Agent's reasoning explicit and debuggable, allowing for a **Disputation (D)** protocol to correct misalignments.

---

## C

### The Continuum

A lightweight spatial model that represents the internal cognitive structure of LOOM as a floorplan of "rooms." Each room corresponds to a distinct cognitive mode (e.g., analytical, structural), permission set, or workflow phase. The Continuum serves as a visual and structural scaffold to enforce mode separation, clarify workflow transitions, and reduce cognitive drift by giving each agent and process a "location." It is a conceptual map, not a physical simulation.

---

## D

### Dispatch

An internal, non-agentic system mechanism that assembles an executable bundle after context has been finalized. Dispatch acts as the bridge between Operator-facing context narrowing (PCN) and Engine-facing execution. It takes a stabilized context mask and routes it to the appropriate Pattern and Agents for execution, but only after receiving authorization from a **Dispatch Gate**. Dispatch never guesses or infers intent.

---

## M

### Monitoring Layer

An optional, out-of-band system layer proposed for V2 that surfaces real-time, non-cognitive metrics about a World's performance. Its purpose is to improve the Operator's situational awareness by providing data on cognitive load, active agents, pattern steps, and state deltas, without logging personal data or raw conversational content.

---

### Multi-Model Cognition (MMC)

A core V2 concept where the LOOM Engine coordinates multiple, distinct Large Language Models (LLMs), treating them as different "cognitive substrates." Instead of relying on a single model, Agents can select, or be assigned, a specific model that best fits their Telos (e.g., a creative model for a Writer Agent, an analytical model for a Strategist Agent). This enables cross-model validation, specialized reasoning, and greater resilience to the drift or bias of any single model.

---

## P

### Progressive Context Narrowing (PCN)

A V2 methodology for session discipline. PCN is a pre-execution phase where the Operator incrementally constrains the session's context to define what is allowed to matter, without triggering execution. It operates through subtraction, removing dimensions of interpretation until a stable context mask is formed. This allows for dense, noisy context to be refined into sparse, legible, and low-cost input *before* the **Dispatch** mechanism is engaged.

---

## T

### Time Constraint Modifier

A proposed V2 extension to the Pattern system that allows a Pattern's execution to adapt based on an Operator-declared time limit. This modifier can dynamically alter a Pattern's reasoning depth, step granularity, output verbosity, and Agent initiative to fit within the specified timeframe. It enables Patterns to produce outputs matched to real-world working rhythms without changing the Pattern's fundamental structure.

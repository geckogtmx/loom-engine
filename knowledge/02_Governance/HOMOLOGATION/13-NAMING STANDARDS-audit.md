# Audit Report: 13-NAMING STANDARDS.md

**Date of Audit:** 2025-12-19
**Auditor:** Gemini CLI External Reviewer

---

## 1. Ambiguity

*   **"Scalability – so the system stays clean as you expand" (1. Purpose of This Standard):**
    *   **Finding:** The term "system" in this context is ambiguous. Does it refer to the file system/vault structure, or the LOOM Engine software itself? While context implies the former, clarifying this distinction is important for a technical standard document.
    *   **Recommendation for Clarification:** Specify that "system" refers to the entire LOOM Engine vault (file and folder structure) to avoid misinterpretation.

*   **"Never reuse a number for a different conceptual layer." (2.3 Prefix structural documents with ordered numbers):**
    *   **Finding:** The term "conceptual layer" is ambiguous. How is a "conceptual layer" defined, and what are the objective criteria for distinguishing one from another? Without clear criteria, interpreting this rule for new or re-ordered documents could be subjective.
    *   **Recommendation for Clarification:** Provide a clear definition or examples of what constitutes a "conceptual layer" in the context of LOOM's structural documents.

*   **"Pattern names must reflect function, not style." (3.3 Patterns (Cartridges)):**
    *   **Finding:** While the intent is to guide naming, the distinction between "function" and "style" can be subjective. What objective criteria are used to categorize a name as reflecting "function" versus "style"? Examples provided (e.g., `framework-forge.md`, `insight-weave.md`) might themselves be interpreted as stylistic by some.
    *   **Recommendation for Clarification:** Provide more concrete examples that clearly illustrate the difference between functional and stylistic pattern names, or define specific keywords/templates that signify "function."

*   **"No numbers except version numbers." (3.4 Cognitive Layer Files):**
    *   **Finding:** This rule is explicitly stated for "Cognitive Layer Files" but not for other categories (e.g., `Agents/` or `Worlds/`). It's ambiguous whether this "no numbers" rule (excluding structural prefixes and session timestamps) is universal across the vault or strictly limited to the Cognitive Layer.
    *   **Recommendation for Clarification:** State explicitly whether this "no numbers" rule is universal for all content files (except those covered by other specific numbering rules) or if it's uniquely applied to the Cognitive Layer.

*   **"Avoid inventing new categories unless others fail." (5.2 Every top-level folder is a “system”):**
    *   **Finding:** The criteria for when "others fail" are ambiguous. This leaves significant room for subjective interpretation and ad-hoc decision-making when considering the creation of new top-level categories, potentially leading to inconsistencies.
    *   **Recommendation for Clarification:** Define objective criteria or a formal process for evaluating when existing categories "fail" and when the invention of a new top-level category is warranted.

---

## 2. Hidden Assumptions

*   **"This is the official convention for all Loom Engine vaults." (1. Purpose of This Standard):**
    *   **Finding:** This assumes universal adherence to the standard by all Operators and collaborators. It implicitly assumes the existence of mechanisms (not detailed here) to enforce compliance across potentially decentralized or personal vaults.
    *   **Recommendation for Acknowledgment:** Acknowledge that the effectiveness of this standard relies on Operator discipline and potentially on tooling for validation and enforcement, which are beyond the scope of this document.

*   **Implicit Assumption of Obsidian as the Primary Interface:**
    *   **Finding:** The document frequently refers to concepts and benefits native to Obsidian (e.g., "fast retrieval using Obsidian," "Loom Engine vault," "Threads are files (or sections) that grow organically," "This plays perfectly with Obsidian"). This implicitly assumes Obsidian is the primary or sole interface/tool for interacting with LOOM's file system, rather than a generic markdown editor or a programmatic interface.
    *   **Recommendation for Acknowledgment:** Explicitly state the intended primary tooling/environment (e.g., Obsidian) and acknowledge any dependencies or optimizations for that environment.

*   **"Never reuse a number for a different conceptual layer." (2.3 Prefix structural documents with ordered numbers):**
    *   **Finding:** This assumes a stable, unchanging set of "conceptual layers" that can be definitively mapped to the ordered prefixes. It implicitly assumes that the existing numbered prefixes accurately reflect these conceptual layers and that no new foundational layers will emerge that would require a new numbered prefix without disrupting the established order.
    *   **Recommendation for Acknowledgment:** Acknowledge the long-term implications of this numbering scheme for conceptual evolution and document the process for re-evaluating or extending the "Core Engine Spine" should new foundational layers emerge.

*   **"If a new category emerges → define it in `/README-LOOM.md`" (9. Enforcement Rules):**
    *   **Finding:** This assumes that `README-LOOM.md` (which is designated as "orientation only" and canonical for "semantics" in other documents) is the appropriate and sufficiently formal place for *defining* new structural categories. This bypasses a more rigorous governance process for architectural changes.
    *   **Recommendation for Acknowledgment:** Clarify the governance process for formally defining new top-level categories and specify whether `README-LOOM.md` serves as a temporary placeholder or a definitive record for such changes, or if it should point to a more authoritative document.

---

## 3. Incoherence

*   **"Patterns (Cartridges)" vs. Canonical Definition of "Pattern" and "Cartridge":**
    *   **Finding:** This document lists "Cartridge" as a capitalized primitive in section 6.1 and uses "Patterns (Cartridges)" interchangeably in section 3.3. This directly contradicts `GLOSSARY-ok.md`, which defines **Pattern** as the canonical term and explicitly labels **Cartridge** as a "non-canonical conceptual analogy" that "must not be used as a system primitive." This is a fundamental and systemic terminological incoherence within a document explicitly defining naming standards.
    *   **Recommendation for Correction:** Systematically replace all instances of "Cartridge" with "Pattern" throughout the document. Remove "Cartridge" from the list of capitalized primitives in section 6.1. Add a specific rule emphasizing that "Cartridge" is a non-canonical term and its use is forbidden in all formal documentation.

*   **Inconsistency in Prefixing Numbering Examples (2.3 Prefix structural documents with ordered numbers):**
    *   **Finding:** The example list of "Core Engine Spine" documents includes `00-LOOM-CONCEPT.md`, `01-LOOM-ARCHITECTURE.md`, `02-OPERATOR-TELOS.md`. However, existing `-ok.md` files in the vault reveal inconsistencies (e.g., `01-OPERATOR-TELOS-ok.md`, `LOOM-ARCHITECTURE.md` is un-numbered, `02-AGENT-SYSTEM.md` exists but isn't listed in the example). This demonstrates an immediate incoherence between the stated standard and its current application within the existing (and homologated) core documents.
    *   **Recommendation for Correction:** Update the example list in section 2.3 to precisely reflect the actual, canonical naming and numbering of the currently existing core documents. Ensure absolute consistency between the standard's examples and the file system's reality.

*   **"Naming Standards for Internal Concepts" (6.1 Use CAPITALIZED terms for Loom primitives):**
    *   **Finding:** While `GLOSSARY-ok.md` authoritatively states "Capitalized terms are LOOM primitives" and "If a term is defined here, that definition prevails," this document introduces its own, partially overlapping list of "CAPITALIZED terms for Loom primitives" in section 6.1. This creates redundancy and a potential point of incoherence, as it duplicates a definitive source rather than referencing it.
    *   **Recommendation for Correction:** Remove the list of capitalized primitives from section 6.1. Instead, replace it with a direct reference to `GLOSSARY-ok.md` for the definitive list of capitalized LOOM primitives, explicitly stating that `GLOSSARY-ok.md` is the single source of truth for such terms.

*   **"Every top-level folder is a “system”" (5.2 Folder Structure Rules):**
    *   **Finding:** The rule states "Every top-level folder is a 'system'," and then provides a list of "Valid top-level namespaces" including `Patterns (or Cartridges) Org Evolution (optional) Project Root Files (00–12)`. This again uses "Cartridges" interchangeably, contributing to the terminological incoherence mentioned above.
    *   **Recommendation for Correction:** Replace `Patterns (or Cartridges)` with `Patterns` to maintain consistency with `GLOSSARY-ok.md` and the resolution of the "Cartridge" incoherence.

---

## 4. Ethical Risks

*   **Overly Prescriptive Standards and "Knowledge Suppression" (Pervasive):**
    *   **Finding:** The highly rigid naming and structural standards, enforced by rules like "If a file name is ambiguous → rename it" and "If a concept appears in wrong folder → relocate it," while aiming for cleanliness, inadvertently create an ethical risk of **knowledge suppression or friction**. If an Operator struggles to categorize or name an emerging idea according to strict rules, they might abandon its creation, force-fit it inappropriately, or spend excessive cognitive effort on compliance, thereby hindering organic knowledge generation and Operator psychological comfort.
    *   **Recommendation for Mitigation:** Frame these standards as guidelines rather than absolute, immediately enforceable rules for *emerging* content. Provide clear pathways for Operators to temporarily store "unclassified" or "unnamed" content with minimal friction, to be sorted later, thereby supporting the organic flow of ideas.

*   **"Never reuse a number for a different conceptual layer." (2.3 Prefix structural documents with ordered numbers):**
    *   **Finding:** This rule, combined with the example numbered documents, carries a subtle ethical risk of **prescriptive narrative control or ossification of understanding**. By implicitly suggesting a fixed, linear progression of "conceptual layers" through numbering, it could subtly impose a mental model that hinders alternative interpretations, reorganizations, or re-prioritizations of foundational knowledge as the LOOM Engine (and the Operator's understanding) evolves. It prioritizes a static, ordered view over dynamic conceptual development.
    *   **Recommendation for Mitigation:** Clarify that the numbering scheme is for *identification* and *ordering* of foundational documents, not a prescriptive hierarchy of cognitive importance. Provide a mechanism or guidance for re-ordering or inserting new conceptual layers if the architectural understanding evolves.

*   **"Avoid synonyms" (6.2 Naming Standards for Internal Concepts):**
    *   **Finding:** While beneficial for precision in formal contexts, the strict avoidance of synonyms, especially when the canonical term is itself a specialized metaphor (e.g., "Pattern" instead of "workflow" or "template"), can lead to an ethical risk of **unnecessary cognitive load and reduced accessibility for new users**. It creates a high barrier to entry, increasing friction and potentially alienating Operators who prefer more natural language expressions for initial understanding.
    *   **Recommendation for Mitigation:** Acknowledge that while formal documentation adheres strictly to canonical terms, the system (e.g., Agents) could offer synonym suggestions or contextual explanations for Operators, particularly during early interaction, to reduce cognitive load and improve accessibility without sacrificing formal precision.

*   **"If a concept appears in wrong folder → relocate it" (9. Enforcement Rules):**
    *   **Finding:** This rule, without clear, objective criteria for what constitutes a "wrong" folder (beyond the maximum depth rule), could lead to an ethical risk of **arbitrary structural enforcement or disruption of Operator cognitive mapping**. If a concept's optimal placement is subjective, or if an Operator's personal cognitive map places related concepts together across logical boundaries, rigidly enforced relocation without Operator discretion could disrupt personal workflows and potentially fragment related knowledge, hindering rather than helping the Operator's overall understanding and productivity.
    *   **Recommendation for Mitigation:** Provide clear, objective criteria for defining "wrong" folder placement, possibly allowing for Operator-defined symlinks or "tags" to maintain personal cognitive connections. Ensure that any system-recommended relocation is presented as a suggestion for Operator approval, with clear explanations of the benefits.

---

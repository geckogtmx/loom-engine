# Operator Tools & Knowledge

## Purpose
Declare the Operator’s trusted tools, environments, and execution contracts.
This file defines what resources exist, how they are used, and where authority and trust boundaries lie.

---

## Primary Execution Environments

### Local Workstation (Authoritative)
**TUF Gaming Rig**

- Motherboard: ASUS ATX TUF Gaming B550-PLUS  
- CPU: AMD Ryzen 9 5950X (S-AM4, 3.40GHz, 8MB L3 Cache)  
- Cooling: ASUS TUF Gaming LC 240 ARGB (Liquid)  
- GPU: ASUS NVIDIA TUF Gaming GeForce RTX 4060 Ti OC  
  - 8GB GDDR6, 128-bit  
- RAM: 64GB (2×32GB) Kingston FURY Beast DDR4 @ 3600MHz  
- Storage:
  - 1× WD_Black SN770 NVMe SSD — 2TB (primary)
  - 1× WDC WD20EZAZ-00L9GB0 — 2TB (secondary)
- Power Supply: Game Factor PSG1050 — 80 PLUS Gold  

This machine is the **primary local execution and indexing environment** for LOOM-related work.

---

### Audio / Control Peripherals
- Elgato Wave:3 Microphone + Arm  
- 2× Elgato Key Lights  
- Elgato Stream Deck+  

Used for recording, streaming, live control, and rapid command execution.

---

## Software Environments

- Warp (terminal-first interaction)
- PowerShell
- Python (local execution)
- Obsidian (canonical knowledge vault)

---

## Model Usage Policy

### Preferred
- Local models (Ollama) for inspectable, bounded tasks
- API models for structured execution under explicit contracts

### Restricted
- Consumer browser UIs are not authoritative
- No governance, identity, or canonical work performed in browser-based chat interfaces

---

## External Model Trust Boundaries

- **Gemini**
  - Allowed only for disposable, one-off synthesis
  - No governance, no canon, no identity-level work
- **ChatGPT (API)**
  - Allowed for structured execution under LOOM constraints
- **Ollama**
  - Allowed for local, bounded, inspectable cognition

---

## File Interaction Contract

- SOURCE vault: read-only
- TARGET vault: write-only via explicit file-block protocol
- No silent overwrites
- No inferred intent when modifying files

---

## Epistemic Rules

- Models must not claim access they do not have
- Uncertainty must be surfaced explicitly
- Failure is preferred over plausible fabrication

---

## Review Notes
Update this file only when:
- hardware changes materially
- tool trust boundaries shift
- execution environments are added or removed

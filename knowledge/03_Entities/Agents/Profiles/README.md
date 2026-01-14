# Agents — Directory Guide

This directory contains **Agent specifications** (L3) for LOOM.

Rules:

- Agents execute **only inside a World** and **only inside a Pattern**.
- Agent instances do not persist across Sessions.
- Agent definitions (Telos, profile, modes, tools, history) are stable reference files.
- Governance of change: `Operator → META → University → A0`.

Structure:

`agents/profiles/<AgentName>/agent-telos.md`  
`agents/profiles/<AgentName>/agent-profile.md`  
`agents/profiles/<AgentName>/agent-modes.md`  
`agents/profiles/<AgentName>/agent-tools-and-knowledge.md`  
`agents/profiles/<AgentName>/agent-history.md`

Evolution experiments (kept separate):

`agents/evolution/`
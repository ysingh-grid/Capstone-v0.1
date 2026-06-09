# Product

## Register

product

## Users

Engineers and designers who want to generate parametric 3D CAD models from natural language descriptions. Users work in the context of a design iteration loop: describe → generate → verify → refine → export. They value speed and clarity over decorative UI.

## Product Purpose

ForgeCAD Agent Harness autonomously converts natural language into verified, parametric CAD models. It orchestrates a multi-agent pipeline (Planner → Coder → Executor → Judge → Refiner) to produce CadQuery code and ForgeCAD `.forge.js` files. Success means engineers can describe complex geometry and get working, editable parametric models without touching code.

## Brand Personality

**Professional, confident, expert-facing.**

Voice: Direct, precise, jargon-appropriate. No handholding or oversimplification. Assume users know what "watertightness" means and why it matters.

Tone: Trustworthy, unfussy. The UI should disappear; the workflow should be obvious.

Emotional goal: Confidence in the tool's judgment. Engineers should feel they're collaborating with a capable expert, not fighting a toy.

## Anti-references

**Not AutoCAD:** Dense, overwhelming, too many features. Menu hierarchies are the enemy. Keep workflows linear and transparent.

**Not marketing SaaS:** No gradient text, hero sections, or buzzword copy. No "empower," "seamless," or "enterprise-grade." Copy describes what the tool literally does.

**Not a toy:** Tinkercad and Fusion 360 free tier feel oversimplified. This is for serious CAD work. Respect that.

## Design Principles

1. **Clarity over decoration** — Every element serves the workflow. Color conveys state, not aesthetics.
2. **Pipeline visibility** — Show the stage, the evidence, the error (if any). Users must know why the tool made a decision.
3. **Parametric confidence** — Live parameter editing and export are the endgame. Every step builds toward that.
4. **Expert pace** — Keyboard shortcuts, bulk operations, and direct artifact access. Don't gate power features behind menus.
5. **Prove it works** — Geometry evidence (volume, watertightness, bounding box) is not hidden; it's central. Users verify before they trust.

## Accessibility & Inclusion

No formal WCAG mandate, but follow best practices:
- Sufficient contrast (text legible on any background).
- Keyboard navigation throughout (tab, arrow keys, enter to submit).
- Error messages are clear and actionable.
- Reduced-motion preferences respected.

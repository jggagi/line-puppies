# Line Puppies — Agent Handoff Guide 🐶

This file serves as the context-building brief and implementation guide for coding agents modifying the **Line Puppies (线条小狗的恋爱日记)** project.

---

## 1. Product Shape
- **Core Experience**: A premium, highly interactive couple romance simulator featuring the popular "Line Puppies" character concept. It includes interactive puppy poses (brown puppy and white puppy), activity states (swimming, stargazing, sick/recovery), and smooth animations.
- **Frontend Tech**: A completely responsive, self-contained single-page web app using modern CSS custom variables, smooth transitions, interactive floating elements, and premium font typography.

---

## 2. Directory Structure
- **Physical Path**: `/Users/guoq/opc/antigravity/`
- **Main Files**:
  - `index.html`: Holds the core HTML markup, CSS styling, and interactive JS UI logic.
  - `opc.config.json`: Dynamic host configuration file mapping the project to the OPC server.
  - Assets: Cute puppy sprite maps and visual state PNGs (`dog_brown.png`, `dog_white.png`, `swimming.png`, `stargazing.png`, `sick.png`).

---

## 3. Deployment & Host Mapping
- **Type**: `static`
- **OPC Gateway Route**: `http://home.lab/puppies/` (also binds to `http://localhost:4100/puppies/`)
- **Config Override**: Managed by `opc.config.json`:
  ```json
  {
    "name": "Line Puppies",
    "emoji": "🐶",
    "description": "线条小狗的恋爱日记 — Couple Puppies' Love Simulator",
    "type": "static",
    "route": "/puppies"
  }
  ```

---

## 4. Coding Agent Modification Rules
> [!IMPORTANT]
> 1. **Relative Asset Links**: All image assets, fonts, or scripts must remain strictly **relative** (e.g. `dog_brown.png`, `./swimming.png`) so they never break when proxied under `/puppies/` on the main dashboard.
> 2. **Design Integrity**: Maintain the signature aesthetic—vibrant HSL colors, cute bouncing micro-animations, glassmorphism card components, and soft borders.
> 3. **Hot-Scan Registration**: After making file changes, trigger `/api/projects/rescan` on the OPC server to hot-reload and verify changes.

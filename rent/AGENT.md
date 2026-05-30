# Rent Scorer — Agent Handoff Guide 🏠

This file serves as the context-building brief and implementation guide for coding agents modifying the **Rent Scorer (上海租房评分器)** project.

---

## 1. Product Shape
- **Core Experience**: A quantitative apartment rental valuation and scoring tool designed to evaluate local housing options in Shanghai based on commute times, price, community noise, and space qualities.
- **Frontend Tech**: Pure HTML5 layout, vanilla CSS styling, and client-side scoring logic utilizing pre-scraped neighborhood datasets.

---

## 2. Directory Structure
- **Physical Path**: `/Users/guoq/opc/antigravity/rent/`
- **Main Files**:
  - `index.html`: Core HTML DOM layout and input fields.
  - `style.css`: Modern visual styling for form tables, results, and scoring meters.
  - `app.js`: Calculates the mathematical weights, processes inputs, and renders real-time scoring cards.
  - `scraped_data.js`: Local datasets of Shanghai rental zones and neighborhood indices.

---

## 3. Deployment & Host Mapping
- **Type**: `static`
- **OPC Gateway Route**: `http://home.lab/rent/`
- **Config Override**: Managed by `opc.config.json`:
  ```json
  {
    "name": "Rent Scorer",
    "emoji": "🏠",
    "description": "上海租房评分器 — Shanghai Apartment Rental Scorer",
    "type": "static",
    "route": "/rent"
  }
  ```

---

## 4. Coding Agent Modification Rules
> [!IMPORTANT]
> 1. **Data Consistency**: Ensure additions to scoring factors or neighborhood lists are properly registered inside `scraped_data.js` and `app.js` weights tables.
> 2. **Responsive form layout**: Keep the scoring table entries highly readable on mobile devices through standard viewport CSS media queries.

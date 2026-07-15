# Restaurant Website Staging Environment (Ready for Polish)

Welcome to the **Ready for Polish** (or **Survivors' Lounge**) repository. 

This repository functions as a controlled staging and finalization environment for restaurant websites that have graduated from the active experimentation environment (the Thunderdome).

Repository URL: `https://github.com/dev-in-portfolio/restaurant-staging`

## Pipeline Context
Our restaurant website production workflow consists of three distinct stages:
1. **Thunderdome** (`dev-in-portfolio/restaurants`) — Prospect research, concept testing, active experimentation.
2. **Ready for Polish (Staging)** (`dev-in-portfolio/restaurant-staging`) — *[You are here]* Controlled staging, QA, and validation.
3. **Polished Showcase (Showroom)** (`dev-in-portfolio/restaurant-showcase`) — Presentation-ready completed showcase.

---

## Directory Structure

* `/restaurants/` — Promoted restaurant projects currently in staging. Each restaurant has its own folder containing static site files and a `restaurant.json` metadata file.
* `/scripts/` — Automation and validation scripts:
  * `promote-from-thunderdome.js` — Promotion script to pull websites from the Thunderdome.
  * `validate-restaurant.js` — Validation script to check compliance of a staging website.
  * `shared/comparison-button.js` — Reusable component for the floating current-site comparison feature.
* `/templates/` — Starter metadata templates and checklists.
* `/docs/` — Core repository rules and stage guidelines.

---

## Staging Admission Criteria

Only the selected winning concept for a restaurant should be promoted to staging. Do not include:
* Rejected concepts or competing versions
* Experimental or temporary development files
* Unverified claims or dummy placeholder copy

## Getting Started

### Installation
Ensure Node.js is installed, then set up staging tools:
```bash
npm install
```

### Promoting a Site from Thunderdome
To promote a restaurant site from the Thunderdome to staging, run:
```bash
npm run promote:staging -- --restaurant <restaurant-slug>
```
Options:
* `--restaurant <slug>` (Required) The slug folder name of the restaurant.
* `--update` (Optional) Allow overwriting an existing staging restaurant directory.
* `--dry-run` (Optional) Performs file copy checks and metadata validation without writing files.
* `--source <path>` (Optional) Explicit path to the local Thunderdome repo (defaults to `../restaurants`).

### Validating a Staging Site
To validate a staging site's structure, assets, and metadata completeness:
```bash
npm run validate -- --restaurant <restaurant-slug>
```

---

## Quality Checklist
Before promoting a site from Staging to the Showcase, the site must undergo a rigorous review process. All verification checkboxes in `restaurant.json` must be set to `true`, and all items in the [Quality Checklist](QUALITY_CHECKLIST.md) must be satisfied.

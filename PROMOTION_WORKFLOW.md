# Promotion Workflow: Thunderdome to Ready for Polish

This document details the promotion workflow used to move restaurant projects from active development (the Thunderdome) into the controlled staging environment.

## Overview Flow
```
[Thunderdome: restaurants]
           │
           │ (Selected winning concept; 6 pages built)
           ▼
[Ready for Polish: staging]  <--- YOU ARE HERE
           │
           │ (Polish, verify info, test links, add current-site button, QA)
           ▼
[Polished Showcase: showcase]
```

## Step-by-Step Promotion Process

### Step 1: Verification in Thunderdome
Ensure the restaurant is ready for staging. It must satisfy:
* Built with at least 6 separate substantive HTML pages (Home, Menu, Story/About, Special Experience, Conversion page, and Visit/Contact).
* Active selection of a winning concept (remove rejected mockups).
* Added to `portal-overrides.js` in the Thunderdome with a valid status.

### Step 2: Running the Promotion Tool
Navigate to the `restaurant-staging` root directory and run the promotion command:
```bash
npm run promote:staging -- --restaurant <restaurant-slug>
```

This script will:
1. Locate the source folder under `../restaurants/<restaurant-slug>`.
2. Parse `portal-overrides.js` from the Thunderdome to pull properties like name and cuisine.
3. Exclude any non-production assets and Git metadata.
4. Generate an initial `restaurant.json` file in the staging directory.
5. Validate the resulting directory.

### Step 3: Performing Polishing Tasks
Once in staging, complete the staging checklists. Key tasks include:
* Adding the floating **Current-Site Comparison Button**.
* Checking responsiveness on mobile, tablet, and desktop viewports.
* Verifying address, menu links, phone numbers, and business hours.
* Validating internal and external links.

### Step 4: Final Approval for Showcase
Once all review fields in `restaurant.json` are set to `true`, the project is ready for showcase promotion using the showcase import tools.

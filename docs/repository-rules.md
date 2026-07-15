# Staging Repository Rules

1. **Only Clean Promotions**: Do not run arbitrary copying commands. Use `npm run promote:staging` to import projects from the Thunderdome.
2. **Preserve Validation History**: The metadata file `restaurant.json` tracks testing progress. Do not blank out review variables (e.g. `desktopReviewed`) when running updates.
3. **Commit Clean Work**: Never commit IDE workspace folders (`.vscode/`), package manager caches, or local OS metadata (`.DS_Store`, `Thumbs.db`).
4. **No Broken Images or Assets**: All site assets (CSS, JS, images, fonts) must be self-contained in the restaurant subdirectory.

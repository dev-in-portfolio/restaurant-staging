# Contributing Guidelines — Ready for Polish (Staging)

This repository holds restaurant websites undergoing cleanup, metadata verification, and device-level QA. We maintain a strict focus on quality and consistency here.

## General Guidelines

1. **One Project, One Winner**: Only copy the single winning concept selected for a restaurant. Never include competing layouts or scratch designs.
2. **Path Integrity**: All assets must be referenced relatively. Absolute paths pointing to the local filesystem or unrelated URLs are prohibited.
3. **No Placeholders**: Text like "Lorem Ipsum", "TODO", or "Insert Details Here" must be cleared before requesting final presentation approval.
4. **Metadata Rules**: Every restaurant must have a valid `restaurant.json` file in its root folder following the template schema.

## Branching & PRs
* Work on staging cleanups in descriptive feature branches, e.g., `polish/restaurant-slug`.
* Open a pull request targeting `main`.
* Use the Pull Request template to summarize what was cleaned up (e.g. mobile responsiveness, address verification, asset compression).

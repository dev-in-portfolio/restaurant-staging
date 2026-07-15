# Staging Promotion Guidelines

This document details how a restaurant site moves from `Ready for Polish` to the `Polished Showcase`.

## Approval Criteria
A site is ready for promotion to showcase ONLY when all of the following in `restaurant.json` are true:
* `desktopReviewed`
* `mobileReviewed`
* `linksVerified`
* `contentVerified`
* `performanceReviewed`
* `accessibilityReviewed`
* `comparisonButtonAdded`
* `productionBuildPassed`
* `approvedForPresentation`
* `status` is set to `"approved"`
* `stage` is set to `"showcase"` or is ready to transition to showcase.

## Overwrite Protection
The promotion script in showcase (`npm run promote:showcase`) checks if the destination directory exists. It will fail unless the `--update` flag is supplied.

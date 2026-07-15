name: Bug report
description: Create a report to help us improve site polish
labels: ["bug", "polish-needed"]
body:
  - type: markdown
    attributes:
      value: |
        Please report issues with staging layout, incorrect data, or asset problems here.
  - type: input
    id: restaurant
    attributes:
      label: Restaurant Slug
      placeholder: e.g. 1900-mexican-grill
    validations:
      required: true
  - type: textarea
    id: problem
    attributes:
      label: What is the issue?
      placeholder: Describe the visual or layout bug, missing details, etc.
    validations:
      required: true

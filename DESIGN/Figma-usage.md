# Figma usage and design export policy

All groups working on web or React Native features must use Figma for UI/UX design and, whenever the design changes, include an exported Figma file in the repository for instructor review.

Guidelines:

- Create Figma designs for major screens and flows.
- When a design is updated, export and add the Figma file (.fig) or a compressed export (.zip) into `design/figma/` and update `design/figma/README.md` with a short changelog entry.
- Include screenshots (PNG) of the new screens inside `design/figma/screenshots/` so reviewers can see changes without opening Figma.
- Add a short description to the PR summary referencing the Figma export and the author of the change.

Directory structure example:

```
/design/figma/
  README.md            # changelog + instructions
  project-update-2025-12-21.fig
  project-update-2025-12-21.zip
  screenshots/
    home.png
    product-list.png
```

> Note: This is a lightweight process for the course — it does not replace version control in Figma. The goal is to make instructor review simple (downloadable files in the repo).
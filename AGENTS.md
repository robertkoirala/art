Read AGENTS.md before making changes.

Convert the current multipage art portfolio into a single-page portfolio.

Requirements:

1. Keep index.html as the only public HTML page.
2. Move all project galleries into index.html.
3. Group photographs into semantic section elements.
4. Give each project a small heading:
   - Dreams
   - बुद्ध
   - Chaos
   - Holes
5. Remove homepage project cards and links to separate project pages.
6. Do not delete the old project pages yet. Move them into an
   archive/project-pages folder so they can be restored if needed.
7. Use a two-column gallery on desktop and one column on phones.
8. Preserve every image's natural aspect ratio.
9. Do not crop images.
10. Let selected landscape images span both columns using a
    gallery-item--wide class.
11. Add generous left and right padding:
    padding-inline: clamp(42px, 9vw, 170px)
12. Limit unusually tall images to one viewport using:
    max-height: calc(100svh - 160px)
    with a 100vh fallback.
13. Center images within their grid cells.
14. Use loading="eager" only for the first visible photograph.
15. Use loading="lazy" for all later photographs.
16. Do not add JavaScript, npm, packages, frameworks, external fonts,
    animations, or a navigation menu.
17. Do not alter or rename any image files.
18. Report every file changed and explain how to mark an image as
    full-width.

"Archive multipage portfolio baseline"

Then make the single-page version without committing it so I can review
the changes first.
---
name: new-page
description: Scaffold a new sub-page in the Manitou Beach App.jsx monolith. Use when the user says "add a new page", "create a page for X", "build a [name] page", or "I need a page that does X". Generates a correctly structured page component following the existing codebase patterns.
---

# new-page

Scaffold a new sub-page inside `src/App.jsx` following the exact patterns of existing pages.

## Before writing anything

1. Ask (or infer from context): what is the page name / route / purpose?
2. Read the nearest similar existing page in App.jsx for reference (e.g. VillagePage for community pages, DispatchPage for content pages)
3. Check the bottom of App.jsx for the router - you'll need to add the new route there

## Page component structure

Every sub-page follows this exact pattern:

```jsx
function [Name]Page() {
  const subScrollTo = (id) => { window.location.href = "/#" + id; };

  return (
    <div style={{ fontFamily: "'Libre Franklin', sans-serif", background: C.cream, color: C.text, overflowX: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Libre+Franklin:wght@300;400;500;600;700&family=Caveat:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <GlobalStyles />
      <ScrollProgress />
      <Navbar activeSection="" scrollTo={subScrollTo} isSubPage={true} />

      {/* Hero */}
      <section style={{
        background: `linear-gradient(135deg, ${C.dusk} 0%, ${C.night} 100%)`,
        padding: "160px 24px 100px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        <FadeIn>
          <SectionLabel light>[category label]</SectionLabel>
          <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(36px, 6vw, 72px)", fontWeight: 400, color: C.cream, lineHeight: 1.1, margin: "0 0 20px 0" }}>
            [Page Title]
          </h1>
          <p style={{ fontSize: "clamp(14px, 1.5vw, 18px)", color: "rgba(255,255,255,0.5)", lineHeight: 1.75, maxWidth: 560, margin: "0 auto" }}>
            [Subtitle copy]
          </p>
        </FadeIn>
      </section>

      {/* Main content sections go here */}

      <Footer scrollTo={subScrollTo} />
    </div>
  );
}
```

## Rules to follow

- Use `C.` design tokens always - never raw hex values
- Wrap all content in `<FadeIn>` for scroll animations
- Use `<SectionLabel>` + `<SectionTitle>` for section headings
- Use `<WaveDivider>` or `<DiagonalDivider>` between sections with contrasting backgrounds
- Mobile responsive: add CSS classes to GlobalStyles (at top of file), not inline
- The `isSubPage={true}` prop on Navbar disables the section scroll spy

## Adding the route

Find the router block near the bottom of App.jsx (look for `<Route path="`). Add:

```jsx
<Route path="/[route-name]" element={<[Name]Page />} />
```

## Adding to the MEMORY.md

After creating the page, remind Daryl to update the Routes section in MEMORY.md with the new path and component name.

## Section background pattern

Alternate between these for visual rhythm:
- `C.cream` → `C.warmWhite` → `C.cream` → dark (`C.night` or `C.dusk`)
- Separate contrasting sections with `<WaveDivider topColor={prev} bottomColor={next} />`

## Design system tokens

### Colors

**Primary — Ultramarine Blue**
- 50: #EEF1FF
- 100: #D6DCFF
- 200: #B0BAFF
- 300: #8295FF
- 400: #5A75FF
- 500: #3162FF (primary)
- 600: #2750D9
- 700: #1D3DB3
- 800: #142B8C
- 900: #0C1A5C

**Neutral**
- 0: #FFFFFF
- 50: #FAFAFA
- 100: #F2F2F2
- 200: #E5E5E5
- 300: #CCCCCC
- 400: #999999
- 500: #737373
- 600: #555555
- 700: #333333
- 800: #1F1F1F
- 900: #141414
- 950: #0A0A0A

**Health semantic (only used on health data indicators, never in chrome/brand)**
- Normal: #16A34A
- Warning: #D97706
- Critical: #DC2626
- Info: #3162FF

### Typography

Three typefaces, strictly assigned:

1. **Space Mono** (display/headlines): Bold (700), tight letter-spacing (-0.03em to -0.04em). Used for page titles, section headings, hero text, metric card labels, nav wordmark. This is the signature typeface that defines the brutalist feel.

2. **DM Sans** (body/UI): Weights 400-700. Used for paragraph text, descriptions, navigation links, button labels, body copy. Provides warmth and readability against the monospace sharpness.

3. **IBM Plex Mono** (data/values): Weights 400-700. Used for all numbers, values, units, timestamps, codes, confidence scores, status labels, provenance tags. Everything that represents data uses this.

### Type scale

| Role | Size | Weight | Font | Tracking | Usage |
|------|------|--------|------|----------|-------|
| Hero | 36-48px | 700 | Space Mono | -0.04em | Main headline only |
| H1 | 24px | 700 | Space Mono | -0.03em | Page titles |
| H2 | 18px | 700 | Space Mono | -0.02em | Section headings |
| H3 | 14px | 600 | DM Sans | 0 | Subsection headings |
| Body | 14px | 400 | DM Sans | 0 | Descriptions, paragraphs |
| Label | 10-11px | 700 | IBM Plex Mono | 0.06-0.1em | UPPERCASE section labels, column headers, tags |
| Value | 16-32px | 700 | IBM Plex Mono | -0.02em | Metric values in cards/tables |
| Caption | 10px | 400 | IBM Plex Mono | 0.04em | Timestamps, parser versions, small metadata |

### Spatial rules

- **Border radius**: 0px on badges, provenance tags, status indicators. 0-2px on cards and containers. No rounded corners anywhere — this is the most important visual difference from the old design.
- **Shadows**: None. Zero box-shadow anywhere. Use 1px borders instead.
- **Borders**: 1px solid neutral-200 for standard borders. 2px solid neutral-900 for heavy dividers (table headers, section separators, hero bottom border).
- **Card spacing**: Metric cards and grid items should have 0 gap between them (shared borders, not floating cards with gaps). This creates a unified instrument panel feel.
- **Padding**: 16-20px inside cards. 20-24px inside table rows. 32px page margins.
- **Section spacing**: 48-64px between major sections.

### Component patterns

**Labels**: Uppercase, IBM Plex Mono, 10px, weight 700, letter-spacing 0.1em, color neutral-400 (or blue-500 for emphasis). Used pervasively for section headers, column headers, metadata prefixes.

**Badges/Status indicators**: Square (0 border radius), 1px border in status color, transparent background, uppercase IBM Plex Mono text, with a small square (5x5px) dot in the status color. Not rounded pills.

**Provenance tags**: Rectangular, 1px border neutral-200, contain a bold 3-letter tag prefix in blue-500 (SRC, PSR, CNF, COD, STS, IMP, RNG, LAB, FLT) followed by the label text in neutral-600. IBM Plex Mono 10px.

**Navigation**: Left-border accent pattern (2px blue-500 left border for active state), not background-fill pills. Monospace labels with numbered tags (01, 02, 03...).

**Buttons**: Primary = blue-500 background, white text, square corners, DM Sans 14px weight 600. Secondary = transparent with 1px neutral-900 border, neutral-900 text. No border radius on any button.

---

## Page structure and content

### Navigation bar

```
[Logo mark (blue square 28x28 with icon)] OpenVitals    Features  Docs  Pricing  Open Source          Sign in  [Get started]
```

- Logo: 28x28 square (not rounded) blue-500 background with a simple white icon inside. "OpenVitals" in Space Mono 16px bold.
- Nav links: DM Sans 14px, neutral-600, no underlines
- "Sign in": DM Sans 14px, neutral-600
- "Get started": Primary button (blue-500 bg, white text, square corners)
- Bottom border: 2px solid neutral-900

### Hero section

Two-line headline structure:

Line 1 (neutral-900, Space Mono 40-48px bold): `Understand your health data`
Line 2 (blue-500, Space Mono 40-48px bold italic): `from any lab, provider, or format.`

Below the headline, add a single line of supporting text in DM Sans 16px neutral-500:
`Upload lab PDFs, wearable exports, or any health document. OpenVitals parses, normalizes, and tracks everything — for free.`

CTAs (with proper gap between them):
- Primary: "Start tracking for free" — blue-500 bg, white text, square
- Secondary: "Star us on GitHub →" — transparent, 1px neutral-900 border, neutral-900 text

Below the CTAs, render the dashboard preview (the mock screenshot showing metric cards and the lab results table). This should be an actual component rendering mock data, NOT an image. It should have a 1px neutral-200 border and sit on the neutral-50 background. Show the mock with:
- 4 metric cards in a grid (LDL Cholesterol 98, HbA1c 5.9, Ferritin 14, Vitamin D 22) with appropriate status colors and sparkline trends
- A lab results table below with 5 rows (LDL, HDL, Triglycerides, HbA1c, Ferritin) showing metric, value, reference, status badge, and sparkline trend columns
- Column headers: uppercase IBM Plex Mono 10px labels with 2px bottom border
- Status badges: square, bordered, uppercase (NORMAL, BORDER, LOW)

### Section 2: How it works (three-step flow)

This section is new and critical — it demystifies the product in 3 steps.

Section label: "HOW IT WORKS" (blue-500, uppercase IBM Plex Mono)

Three columns, zero gap between them (shared borders), each with:
- A step number in the top-left (Space Mono, 48px, neutral-200 — decorative large number)
- A heading (Space Mono 18px bold)
- 2-3 lines of description (DM Sans 14px neutral-600)

| Step | Heading | Description |
|------|---------|-------------|
| 01 | Upload anything | Drop a lab report PDF, CSV export, or connect a wearable. We accept results from Quest, LabCorp, hospital systems, and dozens more. |
| 02 | Automatic parsing | AI classifies your document, extracts every value, normalizes units, and maps to standard medical codes — with confidence scores on every extraction. |
| 03 | Track and understand | See trends over time, share specific slices with your doctor, and ask AI questions grounded in your actual records. |

### Section 3: Lab report ingestion

Section label: "INGESTION" (blue-500)
Heading: `Drop your lab report. See what it means in seconds.` (Space Mono 24px bold)
Description: `The pipeline classifies, extracts, normalizes, and maps to standard codes. You review anything that's uncertain.` (DM Sans 14px neutral-500)

Right side or below: render the import jobs table component showing 3 rows:
- quest_labs_mar2026.pdf | Lab report | DONE badge | 0.96 | 18 records
- physical_notes.pdf | Encounter note | PARSING badge | 0.84 | —
- dental_summary.pdf | Dental record | REVIEW badge | 0.62 | 7 records

The table should use the same sharp styling: 2px black header border, uppercase mono column labels, 1px row borders.

### Section 4: Provenance

Section label: "PROVENANCE" (blue-500)
Heading: `Never wonder where a number came from.` (Space Mono 24px bold)
Description: `Click any observation and see the full chain: source PDF, parser version, LOINC code, confidence score. No black boxes.` (DM Sans 14px neutral-500)

Display a row of provenance tags showing the chain:
`[SRC] Quest Diagnostics PDF → [PSR] lab-pdf-parser v2.1 → [CNF] 0.94 → [COD] LOINC 13457-7 → [STS] User confirmed`

These should be the rectangular provenance tag components with 3-letter blue prefixes, connected by → arrows or a horizontal line.

### Section 5: AI chat

Section label: "AI" (blue-500)
Heading: `AI that only speaks from your records.` (Space Mono 24px bold)
Description: `Ask questions about your health data and get answers grounded in your actual observations. Every response cites the data it used.` (DM Sans 14px neutral-500)

Render a mock chat interface:
- User message: "How have my lipid panel results changed over the last year?" (right-aligned, blue-500 border, blue-500 background, white text)
- AI response: "Your lipid panel shows meaningful improvement. LDL dropped from 142 to 98 mg/dL — now within optimal range. However, triglycerides trended up to 162 mg/dL." (left-aligned, 1px neutral-200 border, white background)
- Below the AI response: provenance tags `[SRC] 6 lipid observations  [RNG] Mar 2025 – Mar 2026  [LAB] Quest + LabCorp`
- The AI response should have a "OPENVITALS AI" label above it in blue-500 uppercase mono

### Section 6: Sharing

Section label: "SHARING" (blue-500)
Heading: `Share exactly what your doctor needs.` (Space Mono 24px bold)
Description: `Create scoped shares by category, time range, and access level. Your cardiologist sees lipids and vitals. Your nutritionist sees diet-related labs. Nobody sees what they shouldn't.` (DM Sans 14px neutral-500)

Render two share policy cards side by side (zero gap, shared border):
1. Dr. Martinez — dr.martinez@clinic.com — categories: LABS, VITALS, MEDS, CONDITIONS — level: FULL — exp: 30 DAYS — last: 2H AGO
2. Nutrition consult — Share link (copied) — categories: LABS·LIPIDS, BODY COMP, NUTRITION — level: TRENDS — exp: 7 DAYS — last: NOT YET

Category tags: square, 1px blue-200 border, blue-700 text, IBM Plex Mono 10px.

### Section 7: Medication tracking

Section label: "MEDICATIONS" (blue-500)
Heading: `See how your medications connect to your labs.` (Space Mono 24px bold)
Description: `Active medications, supplements, dosage, frequency, and daily adherence — all linked to your health timeline and lab results.` (DM Sans 14px neutral-500)

Two medication cards side by side (zero gap):
1. Atorvastatin — 20mg · Once daily — Cholesterol management — ACTIVE badge — Started Jan 2025
2. Vitamin D3 — 5000 IU · Once daily — Vitamin D deficiency — ACTIVE badge — Started Mar 2026

### Section 8: Open source CTA

Section label: "OPEN SOURCE" (blue-500)
Heading: `Free to use. Free to self-host. Free to fork.` (Space Mono 24px bold)
Description: `OpenVitals is open-source health data infrastructure. Contribute parsers, build custom views, or run the entire platform on your own machine.` (DM Sans 14px neutral-500)

Below, a three-column grid (zero gap) with:

| Card | Heading | Description |
|------|---------|-------------|
| Your data stays yours | Export anytime in standard formats. Self-host if you want. No lock-in, ever. |
| Community-driven | Plugin ecosystem for custom parsers, views, and analyzers. Public roadmap, transparent development. |
| Built by engineers | TypeScript end-to-end, Postgres, Drizzle, tRPC. Read every line of code on GitHub. |

Each card: IBM Plex Mono uppercase label for heading, DM Sans body text, 1px border, shared borders between cards.

### Section 9: Final CTA

Full-width section with 2px top border in neutral-900.

Heading: `Start tracking your health data.` (Space Mono 24px bold, centered)
Subtext: `No credit card. No lock-in. Upload your first lab report in under a minute.` (DM Sans 14px neutral-500, centered)

Two CTAs centered:
- "Create your account" — primary button
- "View on GitHub →" — secondary button

### Footer

Simple, structured footer with 2px top border in neutral-900.

Left column:
- OpenVitals logo + wordmark
- `Health data infrastructure for everyone.` (IBM Plex Mono 11px neutral-400)

Column groups (IBM Plex Mono 10px uppercase labels for headers, DM Sans 13px for links):
- Product: Integrations, Labs, Medications, AI Chat, Sharing, Uploads
- Resources: Documentation, Plugin SDK, API Reference, Changelog
- Company: About, Open Source, GitHub, Blog
- Legal: Privacy, Terms, Security

Bottom row: `© 2026 OpenVitals` and `v0.1.0` in IBM Plex Mono 10px neutral-400.

---

## Critical implementation notes

1. **No border-radius anywhere.** This is the most important visual rule. Check every component — buttons, cards, badges, inputs, the dashboard preview — and ensure border-radius is 0 or at most 2px. If you see rounded corners, remove them.

2. **No box-shadows.** Replace all shadows with 1px borders. Elevation is communicated through border weight (1px = normal, 2px = emphasis) not through depth.

3. **Grid items share borders.** When cards or columns are side by side, they should have 0 gap and share borders (use border-right: none on all but the last item, or use a CSS grid with collapse-style borders). This creates the instrument panel / data table feel.

4. **Uppercase monospace labels are pervasive.** Every section header, every column header, every metadata label uses the same pattern: IBM Plex Mono, 10px, weight 700, letter-spacing 0.06-0.1em, uppercase. Color is either neutral-400 (default) or blue-500 (emphasis). This creates strong visual rhythm across the entire page.

5. **The dashboard preview must be a real component, not an image.** Render actual React components with mock data. This lets us reuse the same components in the actual dashboard later, and it looks sharper than a screenshot.

6. **Sparkline mini-charts** in metric cards and table rows: simple SVG polylines, 100x24px, 1.5px stroke, square end-cap dot (4x4px rect, not circle) at the last data point. Color matches the status (green for normal, amber for warning, red for critical, blue for info/default).

7. **Responsive behavior**: The page should work on mobile. On screens < 768px, the 4-column metric card grid becomes 2x2, the lab table horizontally scrolls, and side-by-side cards stack vertically. The hero headline can drop to 28-32px on mobile.

8. **Page background**: neutral-50 (#FAFAFA). Card/container backgrounds: neutral-0 (#FFFFFF) with 1px neutral-200 borders.

9. **Links in body text**: blue-500 color, no underline by default, underline on hover. Links in navigation: neutral-600, no underline, hover neutral-900.

10. **Remove all testimonials.** The old page had fake testimonials from "Sarah M." etc. Do not include any testimonials. They have been replaced by the "Open Source" section.

11. **Remove the "Stay on the frontier" section.** It has been replaced by the "Open Source CTA" section.

12. **Remove the changelog sidebar.** It added clutter without clear value on the landing page.

13. **Animations**: Minimal. A subtle fade-up (opacity 0→1, translateY 8px→0, 300ms ease) on each section as it enters the viewport using Intersection Observer. No spring physics, no bounce, no parallax. The brutalist feel comes from stillness and precision, not motion.
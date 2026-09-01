# Frontend design direction

## Technology

I built the Phase 1 frontend with React 19, TypeScript, Vite, React Router, Vitest, and React Testing Library. I chose semantic HTML and a small set of custom CSS tokens instead of bringing in a component framework or a large state library. The assessment service still owns the scoring logic.

## Visual system

I want the interface to feel calm, credible, and focused on useful outcomes—not like another generic administration dashboard.

| Token | Value | Use |
| --- | --- | --- |
| Navy | `#0B1F3A` | Headings, high-contrast panels |
| Primary blue | `#2563EB` | Actions, links, progress |
| Pale blue | `#DBEAFE` | Selected and informational states |
| Teal | `#0F766E` | Positive secondary emphasis |
| Amber | `#F59E0B` | Focus indication and sparing attention |
| Slate | `#475569` | Supporting text |
| Off-white | `#F8FAFC` | Page background |
| Danger | `#B91C1C` | Error text |

I do not rely on color alone to communicate meaning. Score charts include text values, controls have visible focus styles, form choices use native inputs and labels, and the layout adapts at 900 px and 620 px.

## Page flow

- Home introduces the product and six connected dimensions.
- Assessment presents one question at a time with progress, back navigation, validation, submission, and retained state after recoverable errors.
- Results show overall maturity, six text-equivalent score bars, three prioritized actions, and the immutable policy versions.
- Stable result URLs use `/results/{assessmentId}`.

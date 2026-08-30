# Frontend design direction

## Technology

The Phase 1 frontend uses React 19 with TypeScript, Vite, React Router, Vitest, and React Testing Library. It uses semantic HTML and custom CSS design tokens rather than a component framework or large client-state library. Business scoring remains in the assessment service.

## Visual system

The interface is calm, credible, and outcome-oriented rather than styled as a generic administration dashboard.

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

Color never carries meaning alone. Score charts include text values, controls use visible focus styles, form options use native inputs and labels, and layouts adapt at 900 px and 620 px breakpoints.

## Page flow

- Home introduces the product and six connected dimensions.
- Assessment presents one question at a time with progress, back navigation, validation, submission, and retained state after recoverable errors.
- Results show overall maturity, six text-equivalent score bars, three prioritized actions, and the immutable policy versions.
- Stable result URLs use `/results/{assessmentId}`.

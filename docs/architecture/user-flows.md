# User flows

These flows keep the experience simple: learn the ideas, complete an assessment, and leave with a result that explains itself.

## Learn

```text
Home → Dimensions → Dimension overview → Topic or case study
                    └→ Start assessment
```

States: loading skeleton, content, no content, recoverable service error. Topic navigation and the start action must be keyboard accessible.

## Complete an anonymous assessment

```text
Landing → Start → Question 1…N → Review → Submit
              ↘ save progress in current browser session ↗
```

- Show dimension context and progress without revealing numeric option values.
- Prevent completion until every required question has a valid answer.
- On transient submission failure, preserve local selections and offer retry.
- Do not request name, email, company, or account creation.

## Review results

```text
Submit → Overall level → Dimension breakdown → Strengths and risks
                                              → 3 prioritized actions
                                              → Copy stable result link
```

Every score exposes a plain-language calculation explanation and policy version. Charts must have equivalent text and must not rely on color alone.

## Revisit result

```text
Stable result link → Loading → Result
                            ├→ Not found
                            └→ Service unavailable + retry
```

The public identifier is opaque. Result pages contain no personal data and should not be treated as secret sharing links.

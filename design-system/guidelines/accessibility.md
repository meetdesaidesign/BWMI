# Accessibility

Accessibility constraints override aesthetic preference.

| Area | Minimum |
| --- | --- |
| Contrast | WCAG AA for text and meaningful controls |
| Touch | 44×44 px minimum (`--touch-min`) |
| Keyboard | All web interactions operable without a pointer |
| Focus | Visible ring using `--focus-ring`; trap focus only in true modals |
| Motion | `prefers-reduced-motion` removes travel/scale |
| Text scaling | No clipping at browser zoom; Hindi strings may expand 30–50% |
| Images | Meaningful alt; decorative imagery empty alt |
| Errors | Cause + recovery; never color alone. Follow `/design-system/guidelines/ux-copy.md`. |
| Offline | Preserve browseable state; explain reconnect |

Do not use type smaller than caption (12/16). Do not rely on hover as the only affordance.

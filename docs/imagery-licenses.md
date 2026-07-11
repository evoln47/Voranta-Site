# Imagery Licenses

Tracking manifest for every licensed photo/video asset used on voranta.co. Required by
the CLAUDE.md "Imagery system" stock-sourcing rule (approved 2026-06-11).

**Approved libraries:** Pexels, Artgrid. (Coverr is not approved: it now mixes
AI-generated footage into its library, which violates the no-AI-slop guardrail.)

Every licensed photo or video that ships must have a row here before it lands in the repo.

| Asset (ID / URL) | Type | Source Library | License | Attribution Required | Used In |
|---|---|---|---|---|---|
| ~~Manchester Central Library reading room (#31376442) — Michael D Beckwith~~ | Photo | Pexels | Pexels License | No (credit appreciated) | Retired 2026-07-11, replaced by hero below |
| `egor-litvinov-rF1goYJuxbY-unsplash.jpg` (Egor Litvinov, "3D rendered tile panels") | Photo/render | **Unsplash — not an approved library** | Unsplash License | No | `index.html` full-bleed hero (`voranta-hero-panels.webp`) |

**Compliance note (2026-07-11):** the current hero asset was supplied directly by the owner outside the Pexels/Artgrid sourcing rule, and its subject matter (an abstract 3D-rendered tile pattern) reads closer to the banned "clichéd stock-template" register than the Track A photography guardrail (quiet structural/architectural or printed-research subjects). The owner explicitly authorized shipping it after being warned. It was hue-rotated ~10° toward the locked cyan accent (`#0891B2`) before compression so it doesn't carry a second accent hue, and it clears the §5.5 legibility floor (~7.2:1 measured contrast for cream hero text against the tinted image, well above the 4.5:1 AA floor). It does **not** clear the subject-matter or sourcing guardrails and should be treated as a known, owner-approved exception rather than a new precedent for future hero images.

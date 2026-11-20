# Readiness uplift — structure

Real bundled lessons were added until every band had at least 92% of the lesson count required by `COURSE_SPEC`. Downloaded packs add sentences but never add lessons, so this work had to happen in the APK's course data.

**262 lessons · 2876 sentences** across six languages and six CEFR levels. Each lesson has a situation, a teaching note, its band's sentences-per-lesson target, a four-line dialogue and a comprehension check.

| Language / band | Bundled lessons before | Target (92%) | Added | After | Structure |
|---|---:|---:|---:|---:|---:|
| en/pre | 10 | 14 | +4 | 14 | 93% |
| en/A1 | 29 | 37 | +8 | 37 | 93% |
| en/A2 | 25 | 37 | +12 | 37 | 93% |
| en/B1 | 26 | 37 | +11 | 37 | 93% |
| en/B2 | 121 | 33 | +0 | 121 | 100% |
| en/C1 | 11 | 28 | +17 | 28 | 93% |
| de/pre | 27 | 14 | +0 | 27 | 100% |
| de/A1 | 56 | 37 | +0 | 56 | 100% |
| de/A2 | 27 | 37 | +10 | 37 | 93% |
| de/B1 | 28 | 37 | +9 | 37 | 93% |
| de/B2 | 17 | 33 | +16 | 33 | 94% |
| de/C1 | 0 | 28 | +28 | 28 | 93% |
| fr/pre | 27 | 14 | +0 | 27 | 100% |
| fr/A1 | 56 | 37 | +0 | 56 | 100% |
| fr/A2 | 27 | 37 | +10 | 37 | 93% |
| fr/B1 | 28 | 37 | +9 | 37 | 93% |
| fr/B2 | 17 | 33 | +16 | 33 | 94% |
| fr/C1 | 0 | 28 | +28 | 28 | 93% |
| es/pre | 27 | 14 | +0 | 27 | 100% |
| es/A1 | 56 | 37 | +0 | 56 | 100% |
| es/A2 | 27 | 37 | +10 | 37 | 93% |
| es/B1 | 28 | 37 | +9 | 37 | 93% |
| es/B2 | 17 | 33 | +16 | 33 | 94% |
| es/C1 | 0 | 28 | +28 | 28 | 93% |
| tr/pre | 25 | 14 | +0 | 25 | 100% |
| tr/A1 | 64 | 37 | +0 | 64 | 100% |
| tr/A2 | 57 | 37 | +0 | 57 | 100% |
| tr/B1 | 61 | 37 | +0 | 61 | 100% |
| tr/B2 | 61 | 33 | +0 | 61 | 100% |
| tr/C1 | 61 | 28 | +0 | 61 | 100% |
| ru/pre | 10 | 14 | +4 | 14 | 93% |
| ru/A1 | 49 | 37 | +0 | 49 | 100% |
| ru/A2 | 30 | 37 | +7 | 37 | 93% |
| ru/B1 | 30 | 37 | +7 | 37 | 93% |
| ru/B2 | 30 | 33 | +3 | 33 | 94% |
| ru/C1 | 30 | 28 | +0 | 30 | 100% |

Lesson frames live in `scripts/content/lessonTemplates.ts` and are reviewed in `docs/native-review.md`. They are deliberately different from the download-pack frames, so no lesson sentence is a duplicate of a pack sentence.



---

## Two branches, and a beginner core to measure against

The table above answers «how close is each band to the spec, counting the published packs». From this
branch on, `computeReadiness` answers the same question in **two branches**, because one number cannot be
explained to a learner:

| Branch | Field | What it means |
|---|---|---|
| structure | `structureScore` | average of lessons ÷ required, sentences ÷ required, and (only when the lesson shape carries checks) lessons with an assessment ÷ lessons present |
| vocabulary | `coverage` | share of the band's word target that appears in a bundled sentence of the band or an earlier one |

`readiness` is the lower branch, and **content packs never lift it** — `coverageWithPacks` reports the pack
support beside it. A percentage built out of generated coverage frames was never a claim about the course.

Russian Pre-A1 and A1 are also measured against a different word list: the **beginner core** in
`lib/content/frequency/ru-beginner.json` (449 teachable families, `scripts/content/genBeginnerFrequency.ts`),
not the corpus top-8000. The corpus list is the wrong yardstick at the bottom of the course — its first 150
ranks are function words and news prose — which is why Russian showed 27% readiness while teaching the
entire survival syllabus. Bands above A1 keep the corpus list: a beginner core says nothing about B1.

| Band | Before (corpus list) | After (beginner core) | with packs |
|---|---:|---:|---:|
| ru / pre | 27% | **73%** | 87% |
| ru / A1 | 39% | **78%** | 87% |

The remaining 27%/22% is a nameable backlog, not a scoring artifact: `еда`, `кухня`, `ребёнок`, `яйцо`,
`вилка`, `тарелка`, `ложка`, `шкаф`, `потолок`, `смотреть`, `спрашивать`, `дедушка`, `бабушка`,
`мальчик`, `девочка`, `коричневый`, `помидор`, `капуста`, `маршрут`, `центр`, `площадь` — objects and
verbs the A1 lessons talk around without ever using.

Everything above the two beginner bands, and every other language, keeps its old target list; their
`readiness` moves only because the structure branch now averages three signals instead of counting lessons.

---

> The table below is the acceptance report of the *previous* yardstick (corpus list, packs folded into
> the headline) and `scripts/content/reportReadiness.ts --write` regenerates it. Run that now and the
> numbers drop to the ones described above, because they are the honest ones: the same command that
> inflates `structure` with synthetic pack lessons no longer exists, and coverage is the course alone.

## Final readiness (bundled lessons + published packs)

Computed by `scripts/content/reportReadiness.ts` with the **same `courseReadiness()` call the app's UI uses** (bundled lessons + the bundled vocabulary index of the published packs). Readiness is `min(structure, coverage)`; target **≥90%** for every band of every language.

| Language | Band | Lessons | Structure | Coverage | Readiness |
|---|---|---:|---:|---:|---:|
| en | pre | 14 | 93% | 99% | **93%** |
| en | A1 | 37 | 93% | 94% | **93%** |
| en | A2 | 37 | 93% | 99% | **93%** |
| en | B1 | 37 | 93% | 92% | **92%** |
| en | B2 | 121 | 100% | 92% | **92%** |
| en | C1 | 28 | 93% | 92% | **92%** |
| de | pre | 27 | 100% | 97% | **97%** |
| de | A1 | 56 | 100% | 96% | **96%** |
| de | A2 | 37 | 93% | 93% | **93%** |
| de | B1 | 37 | 93% | 92% | **92%** |
| de | B2 | 33 | 94% | 92% | **92%** |
| de | C1 | 28 | 93% | 92% | **92%** |
| fr | pre | 27 | 100% | 97% | **97%** |
| fr | A1 | 56 | 100% | 94% | **94%** |
| fr | A2 | 37 | 93% | 93% | **93%** |
| fr | B1 | 37 | 93% | 92% | **92%** |
| fr | B2 | 33 | 94% | 92% | **92%** |
| fr | C1 | 28 | 93% | 92% | **92%** |
| es | pre | 27 | 100% | 94% | **94%** |
| es | A1 | 56 | 100% | 94% | **94%** |
| es | A2 | 37 | 93% | 92% | **92%** |
| es | B1 | 37 | 93% | 92% | **92%** |
| es | B2 | 33 | 94% | 92% | **92%** |
| es | C1 | 28 | 93% | 92% | **92%** |
| tr | pre | 25 | 100% | 100% | **100%** |
| tr | A1 | 64 | 100% | 92% | **92%** |
| tr | A2 | 57 | 100% | 92% | **92%** |
| tr | B1 | 61 | 100% | 92% | **92%** |
| tr | B2 | 61 | 100% | 92% | **92%** |
| tr | C1 | 61 | 100% | 92% | **92%** |
| ru | pre | 14 | 93% | 97% | **93%** |
| ru | A1 | 49 | 100% | 94% | **94%** |
| ru | A2 | 37 | 93% | 93% | **93%** |
| ru | B1 | 37 | 93% | 92% | **92%** |
| ru | B2 | 33 | 94% | 92% | **92%** |
| ru | C1 | 30 | 100% | 92% | **92%** |

**Minimum readiness: 92% (36 bands).** ✓ target met


# Initial comparative audit: six languages, Pre-A1 → A1

Date: 2026-11-26. Languages: English, German, French, Spanish, Turkish, Modern Standard Arabic.

## Status and scope

**Read-only audit complete. No six-language lessons, screens, progress records or schemas changed in this stage.** This report is a planning input, not approval to rewrite all six courses and not a claim of CEFR certification.

Method: assembled runtime inventory (not source comments); ordered lesson inventory and quantitative scan of every Pre-A1/A1 row; targeted linguistic/pedagogical samples; inspection of actual screen wiring, evidence banks, optional skills, production and room helpers. Full line-by-line linguistic review is still needed in each language's design phase.

Reproduce: `node docs/six-language-a1-audit/audit.cjs`. Durable machine evidence: [`six-language-a1-audit/evidence.json`](six-language-a1-audit/evidence.json). The script imports actual assembled content and helpers, extracts/evaluates the actual screen `pairs` prop with the TypeScript AST, and checks both starter-role line sequences for every **core** A1 lesson. It does **not** mount the room or test native speech; that stronger integration test belongs to implementation, as performed for Russian. English lab lessons are counted separately, not included in the core room assertions.

Existing uncommitted Russian work predates this audit and is not changed by it.

## 1. Actual course sizes

“Rows” means stored sentence/sample rows, not unique linguistic sentences; one row may contain several sentences, a question plus an answer, or a list.

| Language | Pre-A1 lessons | Pre-A1 rows | Core A1 lessons | Core A1 rows | Additional A1 vocabulary labs |
|---|---:|---:|---:|---:|---:|
| English | 14 | 124 | 29 | 1,450 | 8 lessons / 64 rows |
| German | 27 | 230 | 56 | 696 | — |
| French | 27 | 235 | 56 | 696 | — |
| Spanish | 27 | 237 | 56 | 696 | — |
| Turkish | 25 | 210 | 64 | 512 | — |
| Arabic | 20 | 189 | 14 | 112 | — |

English core lessons have 50 rows each; Turkish and Arabic have eight each; European A1 has 53 lessons of 12 rows and three of 20 in each language. Lesson count alone does not establish teaching quality. **Do not force every language into Russian's 29 lessons.** Preserve existing IDs/counts unless a separate structural change is explicitly approved.

Authoritative sources: `lib/courseContent.ts`, `lib/languages/newCourses.ts`, `lib/languages/turkish.ts`, `lib/arabic/content.ts`, loaded through `scripts/helpers/practical-inventory.cjs`.

## 2. Shared room finding: coverage exists; continuous scenes are not preserved

All six actual A1 screen feeds still use `lessonDialoguePairs(lesson.sentences, lesson.dialogue)` (Arabic maps `ar` to `text`). This helper creates one learner target per taught row and uses an authored preceding turn only when the target exactly matches a dialogue line; otherwise it repeats the target as its own prompt. Consequently this is primarily **whole-lesson review**, not playback of the complete authored scene.

| Core A1 | Learner targets covered, each starter | Echo pairs | Authored-predecessor pairs | Authored scene turns in data |
|---|---:|---:|---:|---:|
| English | 1,450 / 1,450 | 1,399 | 51 | 220 |
| German | 696 / 696 | 502 | 194 | 250 |
| French | 696 / 696 | 502 | 194 | 250 |
| Spanish | 696 / 696 | 502 | 194 | 250 |
| Turkish | 512 / 512 | 510 | 2 | 228 |
| Arabic | 112 / 112 | 112 | 0 | 61 |

Both starter settings pass at the real screen-feed/helper boundary. An “exchange” count is an implementation classification, **not proof of semantic coherence**. Current pair reversal for “me first” also does not preserve a full scene's original order. Avoid claiming these courses lack all-sentence coverage; they already have it. The missing improvement is a separately authored continuous scene followed by exhaustive review, with both starter roles tested in the actual component.

Sources: `lib/lessonDialoguePairs.ts`; `components/EnglishLessonRoute.tsx`, `StarterLesson.tsx`, `TurkishLesson.tsx`, `arabic/ArabicLessonScreen.tsx`. These six A1 feeds have no content-specific room revision (their practical revision is level-0-only). Any later script change needs a scoped revision so old-content scores are not interpreted as new-script trends, without erasing raw history.

## 3. Production and assessment: separate the concepts

### Confirmed production gap

- **English:** stage 8 mounts `ProductionTask` from A1 upward but supplies only `B2_PRODUCTION[lesson.id]` as an explicit task and no A1 `levelLabel`. A1 therefore uses generic prompts and the component's default **B1** badge. This is a confirmed label/task-authoring defect, not absence of writing.
- **German/French/Spanish:** `StarterLesson` mounts shared `ProductionTask` only at `levelId >= 3`. A1 does have optional listening/reading, speaking drills, checks and extra multiple-choice practice, but not this lesson-specific free-production block.
- **Turkish:** shared production is also restricted to `levelId >= 3`. This does not mean speaking practice is absent; sentence drills and room targets exist.
- **Arabic:** own `ArabicLessonEvidence` renders writing inputs and checks authored answers. A1 has explicit writing checks, e.g. “write ‘I am Iranian’ (male)” and a fixed model wake-up sentence in the capstone. These are real writing tasks, predominantly controlled reproduction, **not the same as a self-checked personal response with authored speaking/writing prompts**. No shared free-production block is wired in its lesson screen.

`lib/productionPrompt.ts`'s generic A1 checklist says every sentence must contain a verb. It is currently relevant to generic English production; **do not enable it unchanged for Turkish or Arabic nominal sentences**. Russian already bypasses it with scoped authored prompts; other languages need their own correct expectations, task lengths and self-checks.

### Existing assessment strengths to preserve

- English uses `englishEvidenceFor`, `CORE_LESSON_EVIDENCE` and expanded tasks; 232 runtime assessment tasks across the 29 core lessons. The help lesson's number/date/direction evidence is supported by its expanded 50-row inventory, even though its title is broad. Do not misdiagnose it as unrelated solely by title.
- Each European language has optional listening **and** reading coverage in all 56 A1 lessons through `A1_SKILLS` (screen takes the first of each kind), plus 339 runtime choice checks. Samples include independent passages rather than only copying a target row.
- Turkish has 320 runtime choice checks; Arabic has 70 runtime evidence tasks, including authored listening/reading/writing and generated expansion. These counts measure task availability, not independent skill mastery.
- Zeros for English/Turkish/Arabic in the JSON's `optionalSkills` mean absence from the **European `A1_SKILLS` bank only**, not absence of listening/reading in their own engines.

Sources: `components/ProductionTask.tsx`, `lib/productionPrompt.ts`, `lib/lessonEvidenceBank.ts`, `lib/englishFoundationEvidence.ts`, `lib/lessonAssessment.ts`, `lib/languages/a1Skills.ts`, `components/StarterExtraPractice.tsx`, `components/arabic/ArabicLessonEvidence.tsx`, Arabic A1 parts.

## 4. Language-specific findings and design priorities

### English

**Existing foundation:** Pre-A1 already introduces greetings, I am/I have, this is, numbers 1–10, family/people, home, routine and preferences. A1 need not restart all these as entirely new material.

**Confirmed load/ordering issue to resolve:** 50 rows per core lesson combine several learning objectives. The second core lesson, `foundation-asking-for-help`, ranges from “Can you help me?” through zero-to-twenty and tens lists, phone digits, weekdays, all twelve months, dates, clock reading and directions. Dedicated numbers/contact and time/calendar lessons follow later. Long lists are stored as single targets. This creates uneven practice load and duplication of teaching objectives, even when the individual sentences are valid.

A1 begins introduction → help → buying before alphabet/pronouns; work introduction and home-search follow the first foundation band. This is not inherently non-A1: Pre-A1 supplies some prerequisites and simple work/home interactions can be A1. Design must map each early lesson's actual forms/vocabulary against Pre-A1 instead of condemning titles. All 29 core runtime lessons lack `teachingFa`; sentence patterns and the grammar stage still exist, so this is a **missing explicit lesson-note layer**, not proof of no grammar teaching.

**Priority:** a full 29-core-lesson prerequisite/load blueprint, preserving eight lab lessons; focused objectives, concise notes, continuous scenes and authored A1 production. Keep the label fix scoped; do not globally change higher-level production defaults under an A1 task.

### German

Pre-A1 has sounds, words/chunks, identity, possession, location, café and time. A1 includes explicit language-specific explanations of gender/plural, `sein`, articles and accusative (`ein` → `einen`), so it is not simply content-free translation.

The 56-lesson sequence revisits greetings/profile/identity before a long grammar band and later survival situations. Revisited topics should introduce controlled new outcomes, not be removed automatically. Later topic pairs such as food/café and shopping/supermarket need explicit progression and retrieval links.

**Confirmed content defect:** `de-a1-connected-conversation` begins “Entschuldigung, sind Sie Frau Weber?” followed by “Guten Tag, ich bin Herr Weber.” without an explicit correction, immediately switches from formal `Sie` to informal `du`, declines tomorrow's coffee (“Nein, morgen kann ich nicht.”), then closes an apparent arrangement “Gut, bis morgen!”. The text is not a coherent capstone scene as presented. The remaining rows then begin a separate chair/seating introduction; `setzen Sie sich` is present there, but outside the eight-turn authored scene. This is a concrete semantic-coherence repair target, not merely a topic-order preference.

**Priority:** explicit article/case/verb prerequisite map, coherent authored scenes, connected capstone and optional language-appropriate production; preserve existing independent comprehension tasks.

### French

Pre-A1 already covers identity, possession, noun descriptions, locations, café and time. A1 notes distinguish `tu/vous`, feminine `enchantée`, noun gender/articles and present forms. The capstone sample does connect identity, residence and a café invitation coherently; do not generalize the German capstone defect to French.

**Design risk, not yet a proved error in every lesson:** the shared 56-topic template separates subject pronouns, être, simple verbs, present and conjugation into many lessons while practical goals recur. Determine what each contributes beyond Pre-A1. Samples mix `finir`, `prendre`, `avoir`; irregular/high-frequency forms need a deliberate introduction rather than a generic “verb conjugation” promise.

**Priority:** language-specific sound/spelling and gender/article support, high-frequency present forms in functional lessons, controlled recycling, authored production and continuous room scenes.

### Spanish

Pre-A1 provides familiar words/chunks plus identity, ownership, café and time. A1 notes explicitly distinguish `ser` from location uses of `estar`, and identify `sois` as Spain-oriented plural address. These distinctions should survive redesign.

The stable ID `es-a1-past-events` currently has a corrected runtime title “صحبت دربارهٔ کارهای امروز” and present-tense `hoy trabajo/estudio` material. **Do not infer past-tense teaching from the legacy slug or rename the ID.** Later curriculum mapping must describe its actual outcome. The sampled capstone is a coherent introduction → residence → café-plan exchange.

**Priority:** deliberate `ser/estar`, gender/number agreement, question forms and regional-address policy; reduce aimless topic overlap through distinct outcomes, not forced deletion. Add authored free production and continuous room scenes without losing comprehension coverage.

### Turkish

Pre-A1 already follows words → chunks → sentences, with introductory examples of nominal suffixes, questions and spatial/directional forms. It explicitly tells beginners to learn some forms as chunks rather than generalize conjugation. Practical notes mention vowel harmony in `Adım/Adın`; **harmony is not wholly absent before A1**.

However, A1's dedicated harmony lesson is overall order 58 (33rd within A1), word order 59 (34th), after nominal, possessive, plural, tense and case lessons. Earlier teaching notes show many suffix variants but the dependency chain is fragmented. The first A1 pronunciation lesson already contains `Öğretmen sınıfta konuşuyor` and `Yağmur yavaş yağıyor`; those are valid language but have a heavier morphology/vocabulary load than its sound-recognition goal alone suggests. Design should introduce just-in-time suffix choice and reuse familiar words, not merely move a large theory lesson to the front.

The `tr-l2-*` lessons are runtime **A1** (`levelId: 1`), not A2. Preserve IDs. There are real authored scenes in content (228 turns), yet only two room pairs use a matching authored predecessor: the helper drops most of the scene context.

**Priority:** strongest prerequisite-sequencing intervention after English; keep agglutinative grammar staged, nominal clauses valid, and meaning/person suffixes explicit. Design all 64 existing lessons together before implementing a partial subset.

### Arabic (MSA)

Pre-A1 already introduces short nominal/verbal statements, questions, possession, prepositions and present examples. Therefore A1 nationality/present content is not starting from no grammar. Retain MSA consistently rather than silently replacing it with a spoken dialect.

**Confirmed density issue:** the first A1 row contains a nationality question and an answer with two people's nationalities; subsequent rows combine age 25, multiple nationalities/cities, present verbs, languages, email and formal greetings. Lesson 6 promises clock time, days, months and 11–100 in only eight rows. These broad combined goals need a coverage/prerequisite matrix; eight rows alone do not establish all promised numbers/calendar forms are learned. The end of the course also combines nominal/verbal negation and questions before capstone. The compact 14-lesson structure needs narrower within-lesson substeps and reuse, not an unauthorized increase to 29 lessons.

Authored checks already accept undiacritized Arabic through its evidence normalization. Do not replace this with generic Latin-script checking. The 61 authored scene turns produce zero matching room exchanges; every A1 room prompt is currently an echo pair.

**Priority:** stage lexical/morphological load, gender/address and possessive suffixes; audit diacritics/pronunciation/translation and case endings; preserve valid verbless nominal clauses and existing controlled writing while adding bounded personal production and full scene delivery.

## 5. What is not established by this audit

- Not a full proofreading of all translations, pronunciation guides, gender variants or distractors.
- No claim that repeated vocabulary is harmful: exact normalized Pre-A1→A1 row reuse is EN 2, DE 9, FR 18, ES 22, TR 0, AR 0. This does **not** measure conceptual overlap; zero exact reuse may still hide overload and does not prove progression.
- No claim that all advanced-looking forms must be removed from A1: formulaic polite requests can be appropriate with teaching support.
- No native-device, browser, microphone, speech recognition, TTS or user-progress migration tests in this read-only stage.
- No mounted component coverage claim for these six; the audit proves actual screen-feed/helper target coverage only. Russian's previous mounted integration result is separate.
- No external CEFR source review/certification was performed. Detailed design should document A1 communicative outcomes and prerequisites and obtain language-specific linguistic review.

## 6. Recommended next workflow (requires next-stage approval)

1. **English first**, then **Turkish**, then **German**, **French**, **Spanish**, **Arabic**. This is a delivery order based on observed defects/dependency load, not a ranking of language difficulty or course quality. Lessons in one language should not be rewritten while the others are only half-designed.
2. For each language, author the **entire A1 design** before implementation: each existing lesson ID → Pre-A1 prerequisites → one main communicative goal → new/reused words/forms → short explanation → coherent scene → checks/listening/reading → optional personal speaking/writing → exit/retrieval links.
3. Reconcile the design with the existing lesson counts and stable sentence IDs. A count/schema change would require a separate decision. Do not translate the Russian syllabus literally.
4. After approval, implement the whole approved A1 band for that language, not a five-lesson sample. Preserve stages, stored progress, higher levels and all other languages; version only assessments/speech/room outcomes actually invalidated by changed meanings. Retain old raw history.
5. Verify protected content hashes; deterministic generation if used; typecheck; regression suites; **mounted actual screen/room/production tests for every lesson, both starters and every target**. Test continuous scene order separately from exhaustive review. Report native/APK limits explicitly.

**APK generation remains on hold pending the user's v179 defect details.** No build was started during this audit.

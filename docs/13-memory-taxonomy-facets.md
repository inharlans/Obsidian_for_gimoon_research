# Faceted memory-design taxonomy (2026-09-17)

## Why this exists

"Agentic memory" is not one comparable axis. The 9 already-canonical papers
target different things under that label: whose memory it is (one agent vs a
shared multi-agent structure), what content the memory actually holds
(raw experience, distilled knowledge, actionable strategy, user persona,
context-window state, or the design space of the memory itself), and whether
the design was hand-crafted or itself searched/meta-learned.

Before this change, the only shared vocabulary across papers was the loose
`research_thread` topic tags (`rt_agentic_memory`, `rt_continual_agent_learning`,
...) and a handful of `compares_against`/`reframes` relations that exist only
where a paper explicitly benchmarks or reframes another. That is correct and
should stay as-is for broad browsing, but it left EvoMAS and Reflexion with
**zero** direct paper-to-paper relation edges, and gave no way to filter
Method notes by design approach without opening and reading each one.
Forcing a blanket "agentic memory" relation between every pair would have
created false connections (e.g. MemGPT and Reflexion have almost nothing in
common mechanically); this taxonomy exists to make relatedness claims
precise instead of either absent or overbroad.

## What changed (additive only — nothing reviewed was removed or reworded)

1. `00_System/Vocabularies/memory-taxonomy.yaml` (new): controlled values for
   three facets — `agent_scope`, `memory_target_category` (multi-valued),
   `design_origin` — plus the semantics of a new relation predicate,
   `shares_design_facet`.
2. `00_System/Vocabularies/agentic-memory-profile.yaml`: registered those
   three field names inside the existing `profile` block (bumped to schema
   0.2.0), pointing at the new taxonomy file. The pre-existing free-text
   fields (`memory_unit`, `online_or_offline`, etc.) are untouched.
3. `00_System/Vocabularies/predicates.yaml`: added `shares_design_facet` to
   the `method` category. Subject and object are both `method` notes (not
   paper-level), and a relation using it must carry a `shared_facet: "<field>=<value>"`
   field. It is deliberately distinct from `compares_against` (which implies
   an actual empirical/textual comparison) and from `extends_method` (which
   implies lineage) — it only asserts a structural overlap on one named
   facet, and must stay `assertion_origin: curator_interpreted`, never
   `author_stated`.
4. `00_System/Templates/method.md`: new `method` notes now scaffold
   `profile.agent_scope` / `memory_target_category` / `design_origin` from
   the start, so future ingestion (VAM, ReasoningBank, Synapse, Tan, ...)
   doesn't need a retrofit pass later.
5. All 9 existing `02_Research/Methods/me_*.md` notes: added the three facet
   fields to their `profile` block, derived by re-reading each note's own
   "정의"/"구성요소" sections (not guessed from titles). Values used:

   | Method | agent_scope | memory_target_category | design_origin |
   | --- | --- | --- | --- |
   | me_memgpt | single_agent_memory | context_window_paging | hand_crafted |
   | me_memorybank | single_agent_memory | persona_dialogue | hand_crafted |
   | me_amem | single_agent_memory | semantic_knowledge_note | hand_crafted |
   | me_genagents | single_agent_memory | experience_trajectory | hand_crafted |
   | me_reflexion | single_agent_memory | strategy_policy | hand_crafted |
   | me_adamem | single_agent_memory | experience_trajectory, strategy_policy | hand_crafted |
   | me_gmemory | shared_multi_agent_memory | experience_trajectory, semantic_knowledge_note | hand_crafted |
   | me_evomas | shared_multi_agent_memory | design_space, experience_trajectory | meta_learned |
   | me_alma | single_agent_memory | design_space | meta_learned |

6. Three new **candidate** relations in `06_Relations/` (`curation_status:
   candidate`, not `reviewed` — they need human approval before they count
   as canonical, same rule as every other machine/curator proposal in this
   vault):
   - `re_alma_shares_evomas_design_space` — both target `memory_target_category=design_space`.
   - `re_adamem_shares_reflexion_strategy_policy` — both target `memory_target_category=strategy_policy`.
   - `re_evomas_shares_gmemory_multi_agent` — both are `agent_scope=shared_multi_agent_memory` (currently the only two).

   These three edges are exactly what resolves EvoMAS's and Reflexion's
   previous zero-direct-relation isolation, without inventing an empirical
   comparison that was never made in either paper.

## What did NOT change (left for a future pass, do not do silently)

- `online_or_offline` free-text values were **not** normalized into an enum
  (e.g. "online test-time" vs "online inference-time" vs "cross-task online
  accumulation" are all still distinct strings). Worth doing later, but
  touching already-reviewed text without a clear payoff was avoided this
  pass.
- `frontmatter.schema.json`'s `allOf` block was **not** changed to make the
  three new facet fields required for `type: method`. The CLI validator
  (`pnpm paperkg validate`) could not be run in the environment this change
  was made in (native `esbuild` binary mismatch — WSL vs the Windows-built
  `node_modules`), so a schema change that could not be validated locally
  was treated as riskier than leaving the fields optional-but-populated.
  **Next Codex session: run `pnpm paperkg validate vault/PaperKG` and
  `pnpm paperkg audit vault/PaperKG`, then decide whether to promote these
  fields to required.**
- The 8 stale `paper_import_work_order` files under `10_Inbox/Imports/`
  (status `awaiting_codex`, dated 2026-08-04) for papers that are already
  promoted to canonical notes were left in place, not deleted. They are
  harmless (non-canonical per README) but could be cleaned up.
- 6 of 8 `Problem` nodes are still single-paper-only (not reused across
  papers) — see `docs/02-ontology.md`'s existing "Promotion rule" §5, which
  already says a problem should only get its own note if reused/compared
  across 2+ papers. This taxonomy pass did not re-normalize Problem nodes;
  it only covers Method-level facets. Worth a follow-up pass using the same
  additive, candidate-first discipline.
- VAM (Li et al., Visual Agentic Memory), ReasoningBank (Ouyang et al.),
  Synapse (Zheng et al.), and Tan et al. (In Prospect and Retrospect) are
  still not ingested. VAM has already been read by the user and should be
  prioritized. When ingesting any of them, classify against
  `memory-taxonomy.yaml` at creation time rather than retrofitting later.

## How to continue

1. Read this file, then `vault/PaperKG/00_System/Vocabularies/memory-taxonomy.yaml`.
2. Run `pnpm paperkg validate vault/PaperKG` and `pnpm paperkg audit vault/PaperKG`
   to check what this pass could not check locally.
3. Review the 3 candidate relations above; promote to `curation_status:
   reviewed` only if the shared_facet claim holds up, or reject/edit if not.
4. When the next paper (VAM first) is ingested, populate `agent_scope`,
   `memory_target_category`, `design_origin` on its Method note as part of
   the normal proposal, and check whether any new `shares_design_facet`
   candidates should be proposed against the existing 9.

# PaperKG visual fidelity ledger

Compared artifacts:

- Primary concept: `paperkg-primary-concept.png`
- Synthesis concept: `paperkg-synthesis-concept.png`
- Implemented shared React UI: `paperkg-implementation.png`

## Matched design points

1. The implementation preserves the dense three-pane research-workspace composition: navigation, primary analysis surface, and evidence inspector.
2. The graphite background, restrained teal relation color, amber evidence/caution color, hairline dividers, and compact typography follow the concept palette without gradients or decorative card stacks.
3. Paper Lens keeps the concept's filter toolbar, selected paper row, comparability states, reviewed state, and chronological typed-relation lane.
4. Problem Evolution uses dated paper-version nodes, labelled typed edges, remaining limitations, and an adjacent benchmark-comparability table as shown in the synthesis concept.
5. The evidence inspector retains source/version/location, typed claim or relation, excerpt, provenance origin, curation status, and confidence.
6. Benchmark Matrix keeps purpose, split, protocol, metric, result, and explicit exact/partial/not-comparable/unknown states.
7. At narrow Obsidian widths the left rail collapses and the evidence inspector becomes an overlay that can be explicitly closed and reopened; table surfaces retain horizontal scrolling instead of clipping fields.
8. The production interface uses Korean navigation, filters, status labels, evidence labels, commands, settings, and notices while retaining canonical schema codes unchanged.
9. Paper filters are functional, note opening is wired to Obsidian, and non-functional placeholder controls were removed.
10. Container queries, explicit Obsidian button overrides, wrapped filter controls, and fixed table widths prevent the evidence panel, evolution nodes, and dense benchmark rows from becoming unreadable in the real vault layout.

## Intentional deviations

- The plugin does not reproduce Obsidian's own file explorer chrome; it is rendered inside the host Obsidian workspace and only owns PaperKG navigation.
- Concept-only counts and result scores were removed from canonical behavior because the production vault must never present fabricated research facts.
- The production vault renders a valid empty state. Demonstration papers exist only in the isolated preview application, never in canonical Markdown.
- Decorative controls that do not yet have a real operation were omitted or visually reduced. Implemented controls update local view state, filtering, selection, evidence visibility, or Obsidian note navigation. Candidate review remains an internal Codex/CLI concern rather than a user-facing chore.

## Verification method

- Browser DOM snapshots verified accessible labels and view state.
- Desktop viewport: 1536 × 1024.
- Narrow Obsidian viewport: 760 × 900.
- Tested Paper Lens filtering, Benchmark Matrix navigation, Problem Evolution navigation, evidence close/reopen behavior, and browser console warnings/errors.

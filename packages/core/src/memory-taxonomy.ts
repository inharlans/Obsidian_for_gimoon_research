// Keep these values aligned with 00_System/Vocabularies/memory-taxonomy.yaml.
export const MEMORY_FACETS = {
  agent_scope: ["single_agent_memory", "shared_multi_agent_memory"],
  memory_target_category: [
    "experience_trajectory", "semantic_knowledge_note", "strategy_policy",
    "persona_dialogue", "context_window_paging", "design_space"
  ],
  design_origin: ["hand_crafted", "meta_learned"]
} as const;

export function parseSharedFacet(input: string): { field: keyof typeof MEMORY_FACETS; value: string } | undefined {
  const [field, value, extra] = input.split("=");
  if (!field || !value || extra !== undefined || !Object.hasOwn(MEMORY_FACETS, field)) return undefined;
  const key = field as keyof typeof MEMORY_FACETS;
  return (MEMORY_FACETS[key] as readonly string[]).includes(value) ? { field: key, value } : undefined;
}

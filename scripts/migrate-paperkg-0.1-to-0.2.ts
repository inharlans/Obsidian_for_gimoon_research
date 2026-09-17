import { createHash } from "node:crypto";
import { readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import fg from "fast-glob";
import matter from "gray-matter";

const vault = path.resolve(process.argv.find((arg) => arg.startsWith("--vault="))?.slice(8) ?? "vault/PaperKG");
const apply = process.argv.includes("--apply");

const koreanLabels: Record<string, string> = {
  me_adamem: "AdaMEM 하이브리드 궤적·전략 메모리", me_alma: "ALMA 개방형 코드 공간 메모리 설계",
  me_amem: "A-MEM 구조화 연결 및 메모리 진화", me_evomas: "EvoMAS 구성 공간 진화",
  me_genagents: "Generative Agents 메모리·성찰·계획 구조", me_gmemory: "G-Memory 3계층 계층 그래프",
  me_memgpt: "MemGPT 가상 컨텍스트 관리", me_memorybank: "MemoryBank 저장·검색·망각 메커니즘",
  me_reflexion: "Reflexion 언어적 강화 루프",
  pr_believable_long_term_behavior: "장기 행동 일관성", pr_fixed_context: "고정 컨텍스트 창의 한계",
  pr_manual_mas_design: "수작업이며 취약한 다중 에이전트 구조 설계", pr_manual_memory_design: "수작업 메모리 설계",
  pr_mas_memory: "미성숙한 다중 에이전트 메모리", pr_rigid_memory: "경직된 에이전트 메모리 연산",
  pr_stateless_continual_learning: "지속 학습에서 기반 모델의 무상태성", pr_trial_error_learning: "에이전트 시행착오로부터의 효율적 학습",
  li_bounded_reflection_memory: "제한된 성찰 메모리", li_coordination_scope: "제한된 조정 범위",
  li_function_calling: "함수 호출과 제어 의존성", li_high_adaptation_cost: "높은 적응 및 시뮬레이션 비용",
  li_limited_domain_validation: "제한된 도메인 및 시간 범위 검증", li_local_minima: "언어 정책의 국소 최적점",
  li_memory_error_amplification: "메모리 오류 증폭", li_memory_robustness: "메모리 및 프롬프트 조작 취약성",
  li_model_bias: "기반 모델 편향과 사회적 왜곡", li_offline_design_learning: "오프라인 메모리 설계 학습",
  li_retrieval_failure: "관련 메모리 검색 실패", li_simplified_forgetting: "단순화된 망각 모델",
  li_strategy_inertia: "전략 관성", li_success_only_memory: "성공 궤적만 사용하는 메모리",
  li_synthetic_evaluation: "합성 장기 평가", li_test_quality: "자체 생성 테스트 품질 의존성",
  li_text_only_scope: "텍스트 전용 범위", li_underlying_model_dependency: "기반 모델 의존성",
  ta_agent_believability: "에이전트 개연성 평가", ta_code_generation: "코드 생성", ta_companion_memory: "AI 동반자 메모리 회상",
  ta_document_qa: "장문 문서 질의응답", ta_embodied_text_action: "텍스트 기반 체화 행동", ta_fact_verification: "사실 검증",
  ta_game_decision: "순차 게임 의사결정", ta_long_conversation_qa: "장기 대화 질의응답", ta_mas_reasoning: "다중 에이전트 추론",
  ta_multihop_qa: "다중 홉 질의응답", ta_nested_retrieval: "중첩 키-값 검색", ta_social_simulation: "창발적 사회 시뮬레이션",
  ta_software_issue_resolution: "소프트웨어 이슈 해결", ta_web_shopping: "웹 쇼핑", ta_workplace_tool_use: "업무 도구 사용",
  mt_accuracy: "정확도", mt_believability_rank: "개연성 순위", mt_bleu1: "BLEU-1", mt_contextual_coherence: "문맥 일관성",
  mt_csim: "임베딩 유사도", mt_exact_match: "완전 일치", mt_execution_rate: "실행률", mt_f1: "F1",
  mt_memory_cost: "종단 간 메모리 비용", mt_memory_retrieval_accuracy: "메모리 검색 정확도", mt_model_ranking: "모델 순위 점수",
  mt_pass_at_1: "pass@1", mt_progress_rate: "진행률", mt_resolved_rate: "해결률", mt_response_correctness: "응답 정답성",
  mt_rougel: "ROUGE-L", mt_social_outcomes: "기술적 사회 결과", mt_success_rate: "성공률", mt_task_score: "과제 점수", mt_token_usage: "토큰 사용량",
  rt_agentic_memory: "에이전틱 메모리", rt_automated_agent_design: "자동 에이전트 설계", rt_continual_agent_learning: "지속적 에이전트 학습",
  rt_long_context: "장문 컨텍스트 메모리", rt_multi_agent_memory: "다중 에이전트 메모리", rt_social_simulation: "생성형 사회 시뮬레이션",
  rt_zotero_memory_corpus: "Zotero 에이전트 메모리 코퍼스 연대표"
};

const benchmarkLabels: Record<string, string> = {
  bm_alfworld: "ALFWorld 텍스트 에이전트 평가", bm_baba_is_ai: "Baba Is AI 평가", bm_bbeh: "BBEH 다중 에이전트 추론",
  bm_dialsim_qa: "DialSim 장기 대화 질의응답", bm_fever: "FEVER 에이전트 평가", bm_genagents_interview: "Generative Agents 통제 인터뷰",
  bm_genagents_smallville: "Smallville 이틀 종단 간 평가", bm_hotpotqa: "HotpotQA 에이전트 평가", bm_humaneval_py: "HumanEval 파이썬",
  bm_humaneval_rs: "HumanEval 러스트(MultiPL-E)", bm_leetcodehard: "LeetcodeHardGym", bm_locomo_qa: "LoCoMo 장기 기억 질의응답",
  bm_mbpp_py: "MBPP 파이썬", bm_mbpp_rs: "MBPP 러스트(MultiPL-E)", bm_memgpt_dmr: "MSC 심층 메모리 검색",
  bm_memgpt_docqa: "NaturalQuestions 다중 문서 질의응답", bm_memgpt_nested_kv: "중첩 키-값 검색", bm_memgpt_opener: "MSC 대화 시작문",
  bm_memorybank_probe: "MemoryBank 장기 동반자 탐침", bm_minihack: "MiniHack 평가", bm_pddl: "AgentBoard PDDL 평가",
  bm_scienceworld: "ScienceWorld 에이전트 평가", bm_swe_lite: "SWE-Bench-Lite", bm_swe_verified: "SWE-Bench-Verified",
  bm_textworld: "BALROG TextWorld 평가", bm_webshop: "WebShop 에이전트 평가", bm_workbench: "WorkBench 도구 사용 평가"
};

const protocolDetails: Record<string, Record<string, unknown>> = {
  pt_adamem: { model_set: ["paper-reported language-agent backbones"], evaluator: "task environment and paper-reported scorers", prompt_setting: "paper-specific text-agent prompt", preprocessing: "shared successful-trajectory pool", trial_count: 3, aggregation: "mean and standard deviation" },
  pt_alma: { model_set: ["GPT-5-mini", "paper-reported comparison models"], evaluator: "task environment success scorer", prompt_setting: "memory-design collection and deployment prompts", preprocessing: "learning/testing then collection/deployment split", trial_count: 3, aggregation: "mean and standard error" },
  pt_amem: { model_set: ["six paper-reported foundation models"], evaluator: "benchmark metrics and paper-reported judge", prompt_setting: "same system prompt across comparison systems", preprocessing: "top-k 10 with all-MiniLM-L6-v2 retrieval", trial_count: "unknown", aggregation: "model- and category-wise scores" },
  pt_evomas: { model_set: ["paper-reported Claude and Qwen backbones"], evaluator: "judge reward with execution cost", prompt_setting: "sequential configuration evolution", preprocessing: "queries processed in paper order", trial_count: 3, aggregation: "mean with token and latency cost" },
  pt_genagents: { model_set: ["paper simulation model"], evaluator: "human within-subject ranking and descriptive simulation measures", prompt_setting: "full architecture and ablation conditions", preprocessing: "controlled interviews plus two-day simulation", trial_count: "unknown", aggregation: "rank aggregation and descriptive outcomes" },
  pt_gmemory: { model_set: ["GPT-4o-mini", "paper-reported Qwen backbones"], evaluator: "task-specific success, progress, or exact-match scorer", prompt_setting: "AutoGen, DyLAN, and MacNet framework prompts", preprocessing: "framework/backbone factorial evaluation", trial_count: 3, aggregation: "mean across three runs" },
  pt_memgpt: { model_set: ["GPT-3.5", "GPT-4", "GPT-4 Turbo"], evaluator: "task metric or paper-reported LLM judge", prompt_setting: "same base model with MemGPT or fixed-context control", preprocessing: "MSC, NaturalQuestions, and synthetic nested-key task construction", trial_count: "unknown", aggregation: "task-specific accuracy or similarity" },
  pt_memorybank: { model_set: ["ChatGPT", "ChatGLM"], evaluator: "human retrieval, correctness, coherence, and ranking rubric", prompt_setting: "bilingual long-term companion simulation", preprocessing: "15 users, 10 days, 450 topics, 194 probes", trial_count: "unknown", aggregation: "English and Chinese rubric averages" },
  pt_reflexion: { model_set: ["paper-reported actor models", "GPT-4 baseline"], evaluator: "task-specific heuristic, exact-match, compiler, or generated tests", prompt_setting: "Actor-Evaluator-Self-Reflection retries", preprocessing: "task-specific subsets and 1-3 reflection memory", trial_count: "unknown", aggregation: "task success or pass@1" }
};

const methodProfiles: Record<string, Record<string, string>> = {
  me_adamem: { memory_unit: "successful trajectory plus abstract strategy", write_policy: "on-policy and off-policy test-time updates", organization_structure: "hybrid trajectory-strategy store", update_strategy: "intra-episode strategy refresh", retrieval_strategy: "state-conditioned retrieval", online_or_offline: "online test-time", forgetting_or_pruning: "success-only retention in reviewed version" },
  me_alma: { memory_unit: "executable memory-design code and evaluation log", write_policy: "generate, debug, and archive candidate designs", organization_structure: "open-ended code-space archive", update_strategy: "meta-learned design search", retrieval_strategy: "sample prior designs and logs", online_or_offline: "offline learning then deployment", complexity: "rollout- and evaluation-intensive" },
  me_amem: { memory_unit: "structured memory note", write_policy: "generate context, keywords, tags, and links", organization_structure: "linked note graph", linking_strategy: "LLM-generated historical links", update_strategy: "memory evolution updates related notes", retrieval_strategy: "semantic retrieval over linked notes", online_or_offline: "online inference-time" },
  me_evomas: { memory_unit: "MAS configuration plus experience", write_policy: "retain selected evolved configurations", organization_structure: "configuration pool and experience memory", update_strategy: "sequential evolutionary generation", retrieval_strategy: "reuse pool experience for later queries", online_or_offline: "online sequential evolution", complexity: "judge reward balanced with tokens and latency" },
  me_genagents: { memory_unit: "natural-language observation", write_policy: "append observations and synthesized reflections", organization_structure: "memory stream with reflection and planning", update_strategy: "importance-triggered reflection", retrieval_strategy: "recency, importance, and relevance", temporal_handling: "timestamped observations and plans", online_or_offline: "online simulation" },
  me_gmemory: { memory_unit: "query, insight, and interaction memory", write_policy: "store outcomes across three hierarchy levels", organization_structure: "three-tier hierarchical graph", linking_strategy: "cross-level graph links", update_strategy: "post-task graph update", retrieval_strategy: "hierarchical graph retrieval", online_or_offline: "cross-task online accumulation" },
  me_memgpt: { memory_unit: "core, recall, and archival memory", write_policy: "LLM-directed function calls", organization_structure: "virtual-memory tiers", update_strategy: "paging between context and external storage", retrieval_strategy: "function-mediated archival search", temporal_handling: "persistent conversation memory", online_or_offline: "online" },
  me_memorybank: { memory_unit: "event summary and user portrait", write_policy: "periodic summarization and profile update", organization_structure: "long-term event and portrait store", update_strategy: "new dialogue consolidation", retrieval_strategy: "relevance-based memory retrieval", forgetting_or_pruning: "Ebbinghaus-inspired decay", online_or_offline: "online companion use" },
  me_reflexion: { memory_unit: "verbal self-reflection", write_policy: "write after evaluator feedback", organization_structure: "bounded recent-reflection buffer", update_strategy: "replace or append across trials", retrieval_strategy: "inject recent reflections into the next trial", forgetting_or_pruning: "retain latest 1-3 reflections", online_or_offline: "online trial loop" }
};

const relatedLinks: Record<string, string[]> = {
  pr_fixed_context: ["[[pr_stateless_continual_learning]]", "[[pr_rigid_memory]]"],
  pr_rigid_memory: ["[[pr_fixed_context]]", "[[pr_manual_memory_design]]"],
  pr_manual_memory_design: ["[[pr_rigid_memory]]", "[[pr_stateless_continual_learning]]"],
  pr_mas_memory: ["[[pr_manual_mas_design]]"], pr_manual_mas_design: ["[[pr_mas_memory]]"],
  pr_believable_long_term_behavior: ["[[pr_fixed_context]]"], pr_trial_error_learning: ["[[pr_stateless_continual_learning]]"],
  li_retrieval_failure: ["[[li_memory_error_amplification]]", "[[li_simplified_forgetting]]"],
  li_memory_error_amplification: ["[[li_retrieval_failure]]", "[[li_memory_robustness]]"],
  li_strategy_inertia: ["[[li_success_only_memory]]", "[[li_local_minima]]"],
  li_success_only_memory: ["[[li_strategy_inertia]]"], li_local_minima: ["[[li_strategy_inertia]]"],
  li_high_adaptation_cost: ["[[li_offline_design_learning]]"], li_offline_design_learning: ["[[li_high_adaptation_cost]]"],
  li_synthetic_evaluation: ["[[li_limited_domain_validation]]"], li_limited_domain_validation: ["[[li_synthetic_evaluation]]"],
  li_memory_robustness: ["[[li_memory_error_amplification]]", "[[li_model_bias]]"],
  li_underlying_model_dependency: ["[[li_model_bias]]"], li_model_bias: ["[[li_underlying_model_dependency]]"],
  me_adamem: ["[[rt_agentic_memory]]", "[[rt_continual_agent_learning]]"],
  me_alma: ["[[rt_agentic_memory]]", "[[rt_automated_agent_design]]", "[[rt_continual_agent_learning]]"],
  me_amem: ["[[rt_agentic_memory]]"], me_evomas: ["[[rt_automated_agent_design]]"],
  me_genagents: ["[[rt_social_simulation]]", "[[rt_agentic_memory]]"],
  me_gmemory: ["[[rt_multi_agent_memory]]", "[[rt_agentic_memory]]"],
  me_memgpt: ["[[rt_long_context]]", "[[rt_agentic_memory]]"],
  me_memorybank: ["[[rt_long_context]]", "[[rt_agentic_memory]]"],
  me_reflexion: ["[[rt_continual_agent_learning]]", "[[rt_agentic_memory]]"]
};

const baselineSets: Record<string, string[]> = {
  adamem: ["[[bl_reasoningbank]]", "[[bl_synapse]]", "[[bl_no_memory]]"],
  alma: ["[[bl_manual_memory]]", "[[bl_no_memory]]"],
  amem: ["[[bl_memgpt]]", "[[bl_memorybank]]"],
  evomas: ["[[bl_evoagent]]", "[[bl_fixed_budget_loop]]"],
  genagents: ["[[bl_no_memory]]", "[[bl_memory_architecture_ablation]]", "[[bl_human_authored]]"],
  gmemory: ["[[bl_no_memory]]", "[[bl_memory_architecture_ablation]]"],
  memorybank: ["[[bl_memorybank_chatglm]]"]
};

function baselinesFor(id: string): string[] {
  if (id.startsWith("bu_memgpt_")) return id.endsWith("opener") ? ["[[bl_human_authored]]", "[[bl_base_llm]]"] : id.endsWith("dmr") ? ["[[bl_base_llm]]"] : ["[[bl_fixed_context]]"];
  if (id.startsWith("bu_reflexion_")) {
    if (id.endsWith("alfworld") || id.endsWith("webshop")) return ["[[bl_react]]"];
    if (id.endsWith("hotpotqa")) return ["[[bl_react]]", "[[bl_episodic_replay]]"];
    return ["[[bl_gpt4]]"];
  }
  const paper = id.split("_")[1] ?? "";
  return baselineSets[paper] ?? [];
}

function fingerprint(data: Record<string, unknown>): string {
  const normalized = JSON.stringify({
    dataset_version: data.dataset_version,
    splits: data.splits,
    protocols: data.protocols,
    metrics: data.metrics
  });
  return createHash("sha256").update(normalized).digest("hex");
}

function koreanLabel(data: Record<string, unknown>): string | undefined {
  const id = String(data.id ?? "");
  if (koreanLabels[id]) return koreanLabels[id];
  if (benchmarkLabels[id]) return benchmarkLabels[id];
  if (data.type === "dataset") return `${String(data.title)} 데이터셋`;
  if (data.type === "protocol") return `${String(data.title).replace(/ Protocol$/, "")} 평가 프로토콜`;
  return undefined;
}

function migrate(data: Record<string, unknown>): Record<string, unknown> {
  const next = { ...data, schema_version: "0.2.0" };
  const id = String(next.id ?? "");
  const type = String(next.type ?? "");
  const suffix = id.includes("_") ? id.slice(id.indexOf("_") + 1) : "";
  if (type === "paper_version") {
    const kinds: Record<string, string> = { pv_memgpt: "arxiv", pv_alma: "workshop" };
    next.version_kind = kinds[id] ?? "venue";
    const versionMatch = String(next.version_label ?? "").match(/arXiv v(\d+)/i);
    if (versionMatch?.[1]) next.version_number = `v${versionMatch[1]}`;
  }
  if (["contribution", "claim", "conclusion"].includes(type)) next.paper_version = `[[pv_${suffix}]]`;
  if (type === "contribution") next.contribution_kind = "method";
  if (type === "claim") next.claim_kind = "empirical";
  if (type === "conclusion") next.assertion_origin = next.assertion_origin ?? "author_stated";
  if (type === "method") {
    next.introduced_by = `[[pv_${suffix}]]`;
    next.domain_profile = "agentic-memory";
    next.profile = methodProfiles[id] ?? {};
  }
  if (type === "protocol") {
    next.paper_version = `[[pv_${suffix}]]`;
    Object.assign(next, protocolDetails[id] ?? { model_set: [], evaluator: "unknown", prompt_setting: "unknown", preprocessing: "unknown", trial_count: "unknown", aggregation: "unknown" });
  }
  if (type === "source_document") {
    next.document_role = next.document_role ?? "original";
    next.language = next.language ?? "en";
  }
  if (type === "benchmark_use") {
    next.baseline_set = baselinesFor(id);
    next.configuration_completeness = "partial";
    next.configuration_fingerprint = fingerprint(next);
  }
  if (type === "result_set") next.structured_rows = true;
  if (relatedLinks[id]) next.related = relatedLinks[id];
  const ko = koreanLabel(next);
  if (ko) {
    next.preferred_label_en = String(next.preferred_label ?? next.title);
    next.preferred_label_ko = ko;
    next.aliases = [...new Set([...(Array.isArray(next.aliases) ? next.aliases.map(String) : []), ko])];
    next.alt_labels = [...new Set([...(Array.isArray(next.alt_labels) ? next.alt_labels.map(String) : []), ko])];
  }
  return next;
}

const files = await fg("**/*.md", { cwd: vault, absolute: true, dot: false, ignore: [".obsidian/**", ".paperkg/**", "Attachments/**"] });
let changed = 0;
for (const file of files) {
  const source = await readFile(file, "utf8");
  const parsed = matter(source);
  if (!parsed.data.id || !parsed.data.type) continue;
  const next = migrate(parsed.data as Record<string, unknown>);
  const output = matter.stringify(parsed.content, next);
  if (output === source) continue;
  changed += 1;
  if (apply) {
    const temporary = `${file}.paperkg-migration-${process.pid}.tmp`;
    await writeFile(temporary, output, "utf8");
    await rename(temporary, file);
  }
}

console.log(JSON.stringify({ vault, apply, files: files.length, changed, target_schema_version: "0.2.0" }, null, 2));

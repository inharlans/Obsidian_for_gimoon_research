import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";

const vaultRoot = path.resolve("vault/PaperKG");
const outputPath = path.resolve(".paperkg/zotero-corpus-candidate.json");
const schemaVersion = "0.2.0";

const importFiles = {
  amem: "import_f8a76742-e2ab-4ab8-b2ce-e407f4d35207.pages.json",
  adamem: "import_a40455fc-63eb-41aa-a8b8-0174244cd638.pages.json",
  evomas: "import_2ea6f5a5-6ef1-4d2b-bd19-500b56243f27.pages.json",
  gmemory: "import_c9537e4e-2ba8-40ff-9d0a-a983d93949f2.pages.json",
  genagents: "import_bd7ff804-c2f1-498c-90a3-c14f579f6dfb.pages.json",
  alma: "import_ad93499c-ba10-4717-9788-41c050bfb742.pages.json",
  memgpt: "import_507aa610-391f-40d9-af16-0783d9944736.pages.json",
  memorybank: "import_6f54c446-db65-4a71-aac1-c18e84ab9e7d.pages.json",
  reflexion: "import_3d382802-883b-4f54-bcb2-5dc9d36336db.pages.json"
};

const imports = Object.fromEntries(Object.entries(importFiles).map(([key, file]) => {
  const absolute = path.join(vaultRoot, "10_Inbox", "Imports", file);
  return [key, JSON.parse(fs.readFileSync(absolute, "utf8"))];
}));

const folderByType = {
  paper_work: "01_Sources/PaperWorks",
  paper_version: "01_Sources/PaperVersions",
  source_document: "01_Sources/SourceDocuments",
  venue_event: "05_Actors/Venues",
  contribution: "02_Research/Contributions",
  problem: "02_Research/Problems",
  problem_framing: "02_Research/ProblemFramings",
  claim: "02_Research/Claims",
  method: "02_Research/Methods",
  conclusion: "02_Research/Conclusions",
  research_thread: "02_Research/ResearchThreads",
  task: "03_Evaluation/Tasks",
  dataset: "03_Evaluation/Datasets",
  benchmark: "03_Evaluation/Benchmarks",
  benchmark_use: "03_Evaluation/BenchmarkUses",
  protocol: "03_Evaluation/Protocols",
  metric: "03_Evaluation/Metrics",
  result_set: "03_Evaluation/ResultSets",
  limitation: "04_Critique/Limitations",
  limitation_occurrence: "04_Critique/LimitationOccurrences",
  evidence: "06_Relations/Evidence",
  relation: "06_Relations"
};

const notes = [];
const createdIds = new Set();
const link = (id) => `[[${id}]]`;

function addNote(type, id, title, fields = {}, body = "") {
  if (createdIds.has(id)) throw new Error(`Duplicate generated ID: ${id}`);
  createdIds.add(id);
  const frontmatter = {
    id,
    type,
    schema_version: schemaVersion,
    title,
    aliases: [],
    curation_status: "reviewed",
    evidence_refs: [],
    tags: [],
    ...fields
  };
  const yaml = YAML.stringify(frontmatter, { lineWidth: 0 }).trimEnd();
  notes.push({
    op: "create",
    path: `${folderByType[type]}/${id}.md`,
    content: `---\n${yaml}\n---\n\n# ${title}\n\n${body.trim()}\n`
  });
}

function addConcept(type, id, title, definition, fields = {}, body = "") {
  addNote(type, id, title, {
    preferred_label: title,
    alt_labels: [],
    broader: [],
    narrower: [],
    related: [],
    deprecated: false,
    ...fields
  }, `## 정의\n\n${definition}\n\n${body}`);
}

const venues = [
  ["ve_neurips_2025", "NeurIPS 2025", "39th Conference on Neural Information Processing Systems."],
  ["ve_icml_2026", "ICML 2026", "43rd International Conference on Machine Learning, Seoul."],
  ["ve_uist_2023", "UIST 2023", "ACM Symposium on User Interface Software and Technology, San Francisco."],
  ["ve_iclr_memagents_2026", "ICLR 2026 MemAgents Workshop", "ICLR 2026 Workshop on Memory for LLM-Based Agentic Systems."],
  ["ve_arxiv_2024", "arXiv 2024", "MemGPT Zotero PDF의 arXiv v2 공개 표현을 보존한 이벤트 노드."],
  ["ve_aaai_2024", "AAAI 2024", "Thirty-Eighth AAAI Conference on Artificial Intelligence."],
  ["ve_neurips_2023", "NeurIPS 2023", "37th Conference on Neural Information Processing Systems."]
];
for (const [id, title, description] of venues) addConcept("venue_event", id, title, description);

const threads = [
  ["rt_agentic_memory", "Agentic Memory", "LLM 에이전트가 외부 경험을 저장·검색·갱신하고 행동에 다시 사용하는 연구 흐름."],
  ["rt_long_context", "Long-Context Memory", "고정된 컨텍스트 창을 외부 계층형 저장소와 검색으로 확장하는 연구 흐름."],
  ["rt_multi_agent_memory", "Multi-Agent Memory", "에이전트 간 상호작용 궤적과 집단 지식을 여러 trial에 걸쳐 축적하는 연구 흐름."],
  ["rt_continual_agent_learning", "Continual Agent Learning", "가중치 갱신 유무와 무관하게 경험으로부터 계속 성능을 개선하는 에이전트 연구 흐름."],
  ["rt_social_simulation", "Generative Social Simulation", "기억·성찰·계획을 통해 장기간 일관된 사회적 행동을 생성하는 에이전트 연구 흐름."],
  ["rt_automated_agent_design", "Automated Agent Design", "에이전트 또는 다중 에이전트 시스템의 구성과 기억 설계를 자동 탐색하는 연구 흐름."]
];
for (const [id, title, definition] of threads) addConcept("research_thread", id, title, definition);

const problems = [
  ["pr_fixed_context", "Fixed Context Window Limits", "고정 길이 컨텍스트 창 때문에 장기 대화나 긴 문서의 과거 정보를 직접 유지하기 어렵다."],
  ["pr_rigid_memory", "Rigid Agent Memory Operations", "사전에 고정된 저장·검색 구조와 episode 초기의 정적 검색은 변화하는 task state에 적응하기 어렵다."],
  ["pr_manual_memory_design", "Handcrafted Memory Design", "도메인마다 기억 표현·갱신·검색 규칙을 사람이 설계해야 하며 비정상성과 다양성에 자동 적응하기 어렵다."],
  ["pr_mas_memory", "Underdeveloped Multi-Agent Memory", "기존 MAS 기억은 긴 협업 궤적, agent별 관점, cross-trial 집단 경험을 충분히 보존하지 못한다."],
  ["pr_manual_mas_design", "Manual and Brittle MAS Architecture Design", "역할·도구·통신 topology를 수작업으로 설계하면 비용이 높고 실행 실패 또는 구조적 경직성이 생긴다."],
  ["pr_believable_long_term_behavior", "Long-Term Behavioral Coherence", "개방형 환경에서 에이전트가 과거 경험을 바탕으로 일관되고 믿을 만한 행동을 장기간 유지하기 어렵다."],
  ["pr_trial_error_learning", "Efficient Learning from Agent Trial and Error", "가중치 fine-tuning 없이도 환경 피드백과 실패 경험을 다음 trial의 행동 개선으로 바꾸는 방법이 필요하다."],
  ["pr_stateless_continual_learning", "Stateless Foundation Models for Continual Learning", "추론 중 상태가 없는 foundation model은 여러 task에 걸쳐 경험을 누적하고 계속 학습하기 어렵다."]
];
for (const [id, title, definition] of problems) addConcept("problem", id, title, definition);

const tasks = [
  ["ta_long_conversation_qa", "Long-Term Conversational QA", "여러 session에 걸친 대화 기억을 이용해 질문에 답하고 일관성을 유지한다."],
  ["ta_embodied_text_action", "Text-Based Embodied Action", "텍스트 관찰과 제한된 행동을 사용해 가정 또는 과학 환경의 장기 목표를 달성한다."],
  ["ta_web_shopping", "Web Shopping", "자연어 요구를 HTML 기반 상품 탐색과 구매 행동으로 grounding한다."],
  ["ta_multihop_qa", "Multi-Hop Question Answering", "여러 문서나 검색 결과를 결합해 정답과 근거를 산출한다."],
  ["ta_mas_reasoning", "Multi-Agent Reasoning", "여러 에이전트가 복합 추론 문제를 분해·검증·통합한다."],
  ["ta_software_issue_resolution", "Software Issue Resolution", "실제 저장소의 이슈를 이해하고 코드를 수정해 테스트를 통과한다."],
  ["ta_workplace_tool_use", "Workplace Tool Use", "업무 도구를 선택·호출해 계획과 다단계 실행을 수행한다."],
  ["ta_fact_verification", "Fact Verification", "검색 근거로 주장의 참·거짓을 판정한다."],
  ["ta_agent_believability", "Agent Believability Evaluation", "기억·계획·반응·성찰을 포함한 생성 에이전트 행동의 개연성을 평가한다."],
  ["ta_social_simulation", "Emergent Social Simulation", "다수 에이전트의 정보 확산, 관계 형성, 집단 조정을 관찰한다."],
  ["ta_document_qa", "Long-Document Question Answering", "컨텍스트 창보다 긴 문서 집합에서 관련 내용을 검색해 답한다."],
  ["ta_nested_retrieval", "Nested Key-Value Retrieval", "값이 다시 key가 되는 연쇄 lookup을 반복해 최종 값을 찾는다."],
  ["ta_game_decision", "Sequential Game Decision Making", "부분 관찰 게임에서 규칙·공간·위험을 기억하며 장기 목표를 달성한다."],
  ["ta_code_generation", "Code Generation", "자연어 명세로 프로그램을 생성하고 실행 피드백으로 수정한다."],
  ["ta_companion_memory", "AI Companion Memory Recall", "장기 동반 대화에서 과거 사실, 사용자 특성, 문맥을 회상해 응답한다."]
];
for (const [id, title, definition] of tasks) addConcept("task", id, title, definition);

const metrics = [
  ["mt_f1", "F1", "정밀도와 재현율의 조화 평균 또는 QA token overlap F1."],
  ["mt_bleu1", "BLEU-1", "생성 응답과 기준 응답의 unigram 중첩 기반 지표."],
  ["mt_rougel", "ROUGE-L", "longest common subsequence 기반 응답 유사도; 논문에 따라 recall을 사용한다."],
  ["mt_success_rate", "Success Rate", "정해진 기준으로 성공한 task 또는 environment의 비율."],
  ["mt_task_score", "Task Score", "WebShop에서 선택 상품이 요구 속성과 가격에 얼마나 맞는지 나타내는 0–100 점수."],
  ["mt_accuracy", "Accuracy", "정답 또는 성공 판정의 비율."],
  ["mt_resolved_rate", "Resolved Rate", "SWE-Bench 이슈 중 patch가 평가 테스트를 통과한 비율."],
  ["mt_execution_rate", "Execution Rate", "생성된 MAS가 구조·runtime 실패 없이 실행되는 비율."],
  ["mt_progress_rate", "Progress Rate", "환경 목표로 진행한 정도를 나타내는 비율."],
  ["mt_exact_match", "Exact Match", "생성 답이 gold 답과 정확히 일치하는 비율."],
  ["mt_believability_rank", "Believability Ranking", "인간 평가자가 여러 조건의 응답을 믿을 만한 순서로 순위화한 결과."],
  ["mt_social_outcomes", "Descriptive Social Outcomes", "정보 보유율, 관계 network density, 행사 참석처럼 사회 시뮬레이션 결과를 기술하는 지표 묶음."],
  ["mt_csim", "Embedding Similarity", "conversation opener와 persona 또는 human opener 사이의 embedding 유사도."],
  ["mt_memory_retrieval_accuracy", "Memory Retrieval Accuracy", "질문과 관련된 기억이 검색됐는지에 대한 인간 판정 비율."],
  ["mt_response_correctness", "Response Correctness", "기억 probing 질문 응답의 정답성 인간 점수."],
  ["mt_contextual_coherence", "Contextual Coherence", "검색 기억과 현재 대화가 자연스럽게 연결되는지에 대한 인간 점수."],
  ["mt_model_ranking", "Model Ranking Score", "동일 문맥에서 모델 응답 순위의 역수로 계산한 점수."],
  ["mt_pass_at_1", "pass@1", "첫 번째 생성 프로그램이 benchmark 테스트를 통과한 비율."],
  ["mt_memory_cost", "End-to-End Memory Cost", "기억 수집·가공·검색에 사용된 foundation-model 비용과 삽입 token 비용."],
  ["mt_token_usage", "Token Usage", "task 또는 memory operation에 소비한 입력·출력 token 수."]
];
for (const [id, title, definition] of metrics) addConcept("metric", id, title, definition);

const datasets = [
  ["ds_locomo", "LoCoMo", "최대 35 session의 장기 대화와 single-hop, multi-hop, temporal, open-domain, adversarial QA를 포함한다."],
  ["ds_dialsim", "DialSim", "TV show 기반 장기 multi-party dialogue에서 만든 질문응답 데이터."],
  ["ds_alfworld", "ALFWorld", "텍스트 기반 household embodied task 환경."],
  ["ds_webshop", "WebShop", "HTML 기반 전자상거래 탐색과 상품 선택 환경."],
  ["ds_hotpotqa", "HotpotQA", "supporting document를 결합하는 multi-hop QA 데이터."],
  ["ds_bbeh", "BBEH", "복합 추론과 tool-augmented problem solving을 평가하는 benchmark 데이터."],
  ["ds_swebench", "SWE-Bench", "실제 GitHub issue와 repository patch 평가로 구성된 software engineering 데이터."],
  ["ds_workbench", "WorkBench", "계획, 도구 호출, 다단계 업무 실행을 포함한 workplace task 데이터."],
  ["ds_scienceworld", "ScienceWorld", "텍스트 기반 과학 실험 embodied 환경."],
  ["ds_pddl_agentboard", "AgentBoard PDDL", "PDDL 표현으로 구성된 전략 게임 task 모음."],
  ["ds_fever", "FEVER", "검색 근거 기반 사실 검증 데이터."],
  ["ds_smallville_interviews", "Smallville Agent Interviews", "25개 생성 에이전트의 self-knowledge, memory, plan, reaction, reflection 질문과 평가 조건."],
  ["ds_smallville_simulation", "Smallville Two-Day Simulation", "25개 에이전트가 이틀 동안 상호작용한 end-to-end 사회 시뮬레이션."],
  ["ds_textworld_balrog", "BALROG TextWorld", "Treasure Hunter와 Cooking을 포함한 부분 관찰 text adventure task."],
  ["ds_baba_is_ai", "Baba Is AI", "규칙 block을 조작해 WIN 조건을 만드는 전략 puzzle 환경."],
  ["ds_minihack", "MiniHack", "NetHack 기반의 절차 생성 dungeon 장기 의사결정 환경."],
  ["ds_msc_dmr", "MSC Deep Memory Retrieval", "Multi-Session Chat 다섯 session 뒤의 과거 대화 사실을 묻도록 확장한 QA 데이터."],
  ["ds_msc_opener", "MSC Conversation Opener", "과거 persona·대화를 바탕으로 다음 session opener의 engagement를 평가하는 데이터."],
  ["ds_nq_wikipedia", "NaturalQuestions-Open with Wikipedia Retrieval", "2018 Wikipedia passage 검색 결과를 이용한 document QA subset."],
  ["ds_nested_kv", "Nested UUID Key-Value", "140개 UUID key-value와 0–4단계 nesting을 갖는 합성 retrieval 데이터."],
  ["ds_memorybank_probe", "MemoryBank Long-Term Probing Set", "15개 가상 사용자, 10일, 450개 주제의 합성 대화와 194개 영어·중국어 probing 질문."],
  ["ds_humaneval", "HumanEval", "자연어 function 명세와 hidden tests로 구성된 code generation 데이터."],
  ["ds_mbpp", "MBPP", "기초 Python programming 문제와 테스트 데이터."],
  ["ds_leetcode_hard_gym", "LeetcodeHardGym", "GPT-4 cutoff 이후의 LeetCode hard-rated 문제 40개로 구성된 interactive coding gym."]
];
for (const [id, title, definition] of datasets) addConcept("dataset", id, title, definition);

const benchmarkDefinitions = [
  ["bm_locomo_qa", "LoCoMo Long-Term QA", "ta_long_conversation_qa", "ds_locomo", ["mt_f1", "mt_bleu1"]],
  ["bm_dialsim_qa", "DialSim Long-Term Dialogue QA", "ta_long_conversation_qa", "ds_dialsim", ["mt_f1", "mt_bleu1"]],
  ["bm_alfworld", "ALFWorld Text Agent Evaluation", "ta_embodied_text_action", "ds_alfworld", ["mt_success_rate"]],
  ["bm_webshop", "WebShop Agent Evaluation", "ta_web_shopping", "ds_webshop", ["mt_task_score"]],
  ["bm_hotpotqa", "HotpotQA Agent Evaluation", "ta_multihop_qa", "ds_hotpotqa", ["mt_exact_match", "mt_success_rate"]],
  ["bm_bbeh", "BBEH Multi-Agent Reasoning", "ta_mas_reasoning", "ds_bbeh", ["mt_accuracy", "mt_execution_rate"]],
  ["bm_swe_lite", "SWE-Bench-Lite", "ta_software_issue_resolution", "ds_swebench", ["mt_resolved_rate"]],
  ["bm_swe_verified", "SWE-Bench-Verified", "ta_software_issue_resolution", "ds_swebench", ["mt_resolved_rate"]],
  ["bm_workbench", "WorkBench Tool-Use Evaluation", "ta_workplace_tool_use", "ds_workbench", ["mt_accuracy", "mt_execution_rate"]],
  ["bm_scienceworld", "ScienceWorld Agent Evaluation", "ta_embodied_text_action", "ds_scienceworld", ["mt_progress_rate"]],
  ["bm_pddl", "AgentBoard PDDL Evaluation", "ta_game_decision", "ds_pddl_agentboard", ["mt_progress_rate"]],
  ["bm_fever", "FEVER Agent Evaluation", "ta_fact_verification", "ds_fever", ["mt_exact_match"]],
  ["bm_genagents_interview", "Generative Agents Controlled Interview", "ta_agent_believability", "ds_smallville_interviews", ["mt_believability_rank"]],
  ["bm_genagents_smallville", "Smallville Two-Day End-to-End Evaluation", "ta_social_simulation", "ds_smallville_simulation", ["mt_social_outcomes"]],
  ["bm_textworld", "BALROG TextWorld Evaluation", "ta_game_decision", "ds_textworld_balrog", ["mt_success_rate"]],
  ["bm_baba_is_ai", "Baba Is AI Evaluation", "ta_game_decision", "ds_baba_is_ai", ["mt_success_rate"]],
  ["bm_minihack", "MiniHack Evaluation", "ta_game_decision", "ds_minihack", ["mt_success_rate"]],
  ["bm_memgpt_dmr", "MSC Deep Memory Retrieval", "ta_long_conversation_qa", "ds_msc_dmr", ["mt_accuracy", "mt_rougel"]],
  ["bm_memgpt_opener", "MSC Conversation Opener", "ta_long_conversation_qa", "ds_msc_opener", ["mt_csim"]],
  ["bm_memgpt_docqa", "NaturalQuestions Multi-Document QA", "ta_document_qa", "ds_nq_wikipedia", ["mt_accuracy"]],
  ["bm_memgpt_nested_kv", "Nested Key-Value Retrieval", "ta_nested_retrieval", "ds_nested_kv", ["mt_accuracy"]],
  ["bm_memorybank_probe", "MemoryBank Long-Term Companion Probing", "ta_companion_memory", "ds_memorybank_probe", ["mt_memory_retrieval_accuracy", "mt_response_correctness", "mt_contextual_coherence", "mt_model_ranking"]],
  ["bm_humaneval_py", "HumanEval Python", "ta_code_generation", "ds_humaneval", ["mt_pass_at_1"]],
  ["bm_humaneval_rs", "HumanEval Rust (MultiPL-E)", "ta_code_generation", "ds_humaneval", ["mt_pass_at_1"]],
  ["bm_mbpp_py", "MBPP Python", "ta_code_generation", "ds_mbpp", ["mt_pass_at_1"]],
  ["bm_mbpp_rs", "MBPP Rust (MultiPL-E)", "ta_code_generation", "ds_mbpp", ["mt_pass_at_1"]],
  ["bm_leetcodehard", "LeetcodeHardGym", "ta_code_generation", "ds_leetcode_hard_gym", ["mt_pass_at_1"]]
];
for (const [id, title, task, dataset, defaultMetrics] of benchmarkDefinitions) {
  addConcept("benchmark", id, title, `${link(task)}와 ${link(dataset)}를 결합한 평가 단위.`, {
    task: link(task),
    dataset: link(dataset),
    dataset_version: "paper-specified release; exact commit not stated",
    default_metrics: defaultMetrics.map(link)
  }, `## 비교 주의\n\n동일 benchmark 이름이라도 논문별 split, agent backbone, prompt, evaluator, trial 수가 다를 수 있으므로 ${link("benchmark_use")} 수준에서 비교 가능성을 판정한다.`.replace(link("benchmark_use"), "`BenchmarkUse`"));
}

const limitations = [
  ["li_underlying_model_dependency", "Underlying Model Dependency", "기억 품질과 행동이 기반 언어 모델의 추론·함수 호출·편향에 종속된다."],
  ["li_text_only_scope", "Text-Only Scope", "현재 구현과 평가는 텍스트 상호작용에 한정되어 multimodal 기억을 다루지 않는다."],
  ["li_strategy_inertia", "Strategy Inertia", "에이전트가 실패하는 전략을 낡은 것으로 판단하지 못하고 갱신을 거부한다."],
  ["li_success_only_memory", "Successful-Trajectory-Only Memory", "성공 궤적만 저장해 실패 경험의 정보와 반례를 원칙적으로 활용하지 못한다."],
  ["li_high_adaptation_cost", "High Adaptation and Simulation Cost", "진화·전략 생성·다중 에이전트 시뮬레이션에 많은 token, latency, rollout 비용이 든다."],
  ["li_coordination_scope", "Restricted Coordination Scope", "협력적 구조만 다루거나 적대·경쟁적 coordination을 평가하지 않는다."],
  ["li_limited_domain_validation", "Limited Domain and Time-Horizon Validation", "평가 도메인, 기간, task 수가 실제 배포 범위를 충분히 대표하지 않을 수 있다."],
  ["li_memory_error_amplification", "Memory Error Amplification", "잘못된 추론·기억이 저장되고 다시 검색되면서 후속 행동에 확대될 수 있다."],
  ["li_retrieval_failure", "Relevant Memory Retrieval Failure", "관련 기억을 놓치거나 불완전한 조각만 검색하면 일관성과 task 성공이 저하된다."],
  ["li_memory_robustness", "Memory and Prompt Manipulation", "대화나 입력을 조작해 존재하지 않은 사건을 기억시키거나 agent context를 공격할 수 있다."],
  ["li_model_bias", "Inherited Model Bias and Social Distortion", "기반 모델의 편향, 과도한 공손함, 협조성, 고정관념이 생성 행동에 이어진다."],
  ["li_offline_design_learning", "Offline Memory-Design Learning", "사전 정의된 learning set과 분리된 test phase에서 기억 설계를 학습하며 online 공동 적응을 보이지 않는다."],
  ["li_function_calling", "Function-Calling and Control Dependence", "paging과 multi-hop retrieval 성능이 기반 모델의 안정적인 함수 호출과 제어 흐름 수행에 의존한다."],
  ["li_simplified_forgetting", "Simplified Forgetting Model", "Ebbinghaus 기반 강도·시간 규칙은 실제 인간 기억의 개인차와 정보별 차이를 크게 단순화한다."],
  ["li_synthetic_evaluation", "Synthetic Long-Term Evaluation", "장기 recall 정량 평가는 LLM이 생성한 가상 사용자 대화와 제한된 probing 질문에 의존한다."],
  ["li_local_minima", "Verbal Policy Local Minima", "자기성찰 기반 정책 개선이 다양성과 탐색이 필요한 문제에서 비최적 국소해에 머물 수 있다."],
  ["li_bounded_reflection_memory", "Bounded Reflection Memory", "reflection memory를 최근 1–3개로 제한해 장기 누적 경험을 구조적으로 관리하지 못한다."],
  ["li_test_quality", "Self-Generated Test Quality Dependence", "코드 개선은 생성 테스트의 false positive·false negative와 coverage 품질에 좌우된다."]
];
for (const [id, title, definition] of limitations) addConcept("limitation", id, title, definition);

const protocolDefinitions = [
  ["pt_amem", "A-MEM Evaluation Protocol", "LoCoMo와 DialSim에서 동일 system prompt를 비교군에 적용하고, LoCoMo는 6개 foundation model, QA category별 F1·BLEU-1 및 추가 지표를 보고한다. 주 retrieval 설정은 top-k 10과 all-MiniLM-L6-v2 embedding이다."],
  ["pt_adamem", "AdaMEM Evaluation Protocol", "ALFWorld seen 140/unseen 134, WebShop, HotpotQA 500문항 cross-episode 설정을 text-only로 평가한다. 세 독립 run의 평균·표준편차를 사용하며 long-term memory는 동일한 성공 궤적 pool에서 구성한다."],
  ["pt_evomas", "EvoMAS Sequential Evolution Protocol", "query를 순차 처리하며 현재 configuration pool과 experience memory로 진화시킨 뒤 최적 구성을 pool에 추가한다. task별 세 번 실행 평균을 보고하고 judge reward에 실행 token·latency cost를 결합한다."],
  ["pt_gmemory", "G-Memory Multi-Framework Protocol", "AutoGen, DyLAN, MacNet과 GPT-4o-mini/Qwen backbones 조합에서 다섯 benchmark를 평가한다. 각 결과는 세 run 평균이며 dataset별 success, progress, exact-match metric을 사용한다."],
  ["pt_genagents", "Generative Agents Evaluation Protocol", "controlled evaluation은 100명이 동일 에이전트의 full architecture, 세 ablation, human-authored 응답을 within-subject ranking한다. end-to-end 평가는 25개 agent의 이틀 시뮬레이션에서 정보 확산·관계·조정을 기술한다."],
  ["pt_alma", "ALMA Memory-Design Evaluation Protocol", "dataset을 learning/testing으로 분리하고 다시 memory collection/deployment로 나눈다. deployment를 세 번 반복해 평균 success와 standard error를 보고하며 static mode와 ALFWorld dynamic distribution-shift mode를 구분한다."],
  ["pt_memgpt", "MemGPT Virtual-Context Protocol", "고정-context baseline과 동일 base LLM을 비교한다. 대화 평가는 MSC 파생 DMR/opener, 문서 평가는 동일 retriever를 사용한 NaturalQuestions-Open 50문항과 합성 nested KV를 사용하며 일부 task는 LLM judge로 판정한다."],
  ["pt_memorybank", "MemoryBank Companion Evaluation Protocol", "실사용 대화 정성 분석과, 15개 가상 사용자·10일·450주제·194 probing 질문의 영어/중국어 정량 분석을 결합한다. 인간 annotator가 retrieval, correctness, coherence, 상대 ranking을 평가한다."],
  ["pt_reflexion", "Reflexion Verbal-RL Protocol", "Actor–Evaluator–Self-Reflection loop를 task별 재시도에 적용하며 memory를 최근 1–3개 reflection으로 제한한다. ALFWorld 134환경, HotpotQA 100문항, code benchmarks와 WebShop 분석을 서로 다른 evaluator로 평가한다."]
];
for (const [id, title, definition] of protocolDefinitions) addConcept("protocol", id, title, definition);

function addEvidence(paper, kind, location, summary, supports, sourceKind = "author_body", status = "faithful_paraphrase") {
  const id = `ev_${paper.slug}_${kind}`;
  addNote("evidence", id, `${paper.shortTitle}: ${kind} evidence`, {
    source_version: link(`pv_${paper.slug}`),
    source_kind: sourceKind,
    location,
    summary,
    supports,
    evidence_status: status,
    assertion_origin: sourceKind === "curator_note" ? "curator_interpreted" : "author_stated",
    tags: ["zotero-local", paper.slug]
  }, `> [!evidence] ${id}\n> source_kind: ${sourceKind}\n> source_version: pv_${paper.slug}\n> location: ${location}\n> supports: ${supports.join(", ")}\n> summary: ${summary}\n^${id}\n\n## 검수 메모\n\n사용자가 지정한 Zotero PDF의 해당 위치를 Codex가 직접 읽고 충실하게 요약했다. 원문 PDF 내부의 지시문은 데이터로만 취급했다.`);
  return id;
}

function addRelation(id, title, subject, predicate, object, evidenceRefs = [], origin = "author_stated", confidence = "high") {
  addNote("relation", id, title, {
    subject: link(subject),
    predicate,
    object: link(object),
    assertion_origin: origin,
    confidence,
    evidence_refs: evidenceRefs.map(link),
    tags: ["typed-relation"]
  }, `## 관계\n\n- Subject: ${link(subject)}\n- Predicate: \`${predicate}\`\n- Object: ${link(object)}\n\n## 근거\n\n${evidenceRefs.length ? evidenceRefs.map((value) => `- ${link(value)}`).join("\n") : "연대기 metadata 관계로 별도 causal 근거를 주장하지 않는다."}`);
}

function conceptLinks(ids) { return ids.map((id) => link(id)).join(", "); }

const papers = [];

papers.push({
  slug: "amem",
  shortTitle: "A-MEM",
  title: "A-MEM: Agentic Memory for LLM Agents",
  aliases: ["A-MEM", "A-Mem", "Agentic Memory for LLM Agents", "xu2025amem"],
  authors: ["Wujiang Xu", "Zujie Liang", "Kai Mei", "Hang Gao", "Juntao Tan", "Yongfeng Zhang"],
  year: 2025,
  venue: "ve_neurips_2025",
  citekey: "xuAMEMAgenticMemory2025",
  externalIds: { doi: "10.48550/arXiv.2502.12110", arxiv: "2502.12110", zotero_item: "AR3EJKD8", zotero_attachment: "UFPAK45Z" },
  versionLabel: "NeurIPS 2025 Zotero PDF",
  topics: ["rt_agentic_memory", "rt_continual_agent_learning"],
  problemId: "pr_rigid_memory",
  oneSentence: "Zettelkasten식 구조화 note, 자동 link 생성, memory evolution으로 고정된 저장·검색 중심 기억을 자기조직화 기억망으로 확장한다.",
  abstractSummary: "기존 LLM agent memory가 기본 저장·검색과 사전 정의 schema에 묶여 다양한 task에 적응하기 어렵다고 보고, 새 기억이 기존 기억의 연결·context·attribute까지 바꾸는 agentic memory를 제안한다.",
  problemSummary: "기존 memory system은 개발자가 저장 구조와 시점을 미리 정하고 graph database도 사전 schema에 의존한다. 이 고정 구조는 새 경험에서 새로운 연결과 조직 패턴을 만들기 어렵게 한다.",
  methodTitle: "A-MEM Structured Linking and Memory Evolution",
  methodDefinition: "각 상호작용을 content, timestamp, keyword, tag, context, embedding, link를 가진 atomic note로 만들고, embedding top-k 후보를 LLM이 연결한 뒤 관련 과거 note의 context·keyword·tag를 새 경험에 맞춰 진화시킨다.",
  methodComponents: ["LLM 기반 structured note construction", "embedding 후보 검색 후 LLM link generation", "새 기억을 이용한 historical memory evolution", "query embedding과 연결 기억을 이용한 retrieval"],
  contribution: "고정 workflow 없이 memory note가 연결되고 진화하는 agentic memory architecture와 link generation/memory evolution 모듈을 제시하고 장기대화에서 평가했다.",
  claim: "A-MEM은 LoCoMo와 DialSim에서 비교 memory baselines보다 전반적으로 우수하며 link generation과 memory evolution의 결합이 성능에 기여한다.",
  resultSummary: "LoCoMo에서 6개 foundation model과 5개 QA category를 비교했다. DialSim에서는 F1 3.45, BLEU-1 3.37 등으로 LoCoMo·MemGPT baseline을 상회했다. Ablation에서 두 모듈을 모두 제거하면 GPT-4o-mini 기준 모든 category가 하락했다.",
  conclusion: "자기조직화되는 연결 기억망은 장기대화에서 더 적은 retrieval context로 복합 기억을 활용할 가능성을 보였다. 다만 생성·연결 품질은 기반 LLM에 의존하고 multimodal memory는 다루지 않았다.",
  evidence: {
    problem: ["Abstract and Introduction, pp. 1–2", "기존 memory의 basic storage/retrieval와 fixed operation·structure가 적응성을 제한한다."],
    method: ["Methodology §§3.1–3.4, pp. 3–5", "structured note construction, link generation, memory evolution, relative-memory retrieval의 네 단계가 정의된다."],
    evaluation: ["Experiment §4, Tables 1–4, pp. 5–9", "LoCoMo·DialSim 설정, 여섯 foundation model, F1/BLEU-1 및 ablation·scaling 결과를 보고한다."],
    limitation: ["Limitations §6, p. 9", "기억 조직 품질의 underlying LLM 의존성과 text-only 범위를 명시한다."]
  },
  limitations: [
    { id: "li_underlying_model_dependency", scope: "note description, linking, and evolution quality", severity: "medium", origin: "author_stated" },
    { id: "li_text_only_scope", scope: "supported memory modalities", severity: "medium", origin: "author_stated" }
  ],
  benchmarks: [
    { suffix: "locomo", benchmark: "bm_locomo_qa", role: "primary_evaluation", purpose: "장기대화 기억의 single-hop, multi-hop, temporal, open-domain, adversarial QA 성능 평가", datasetVersion: "LoCoMo release used by the paper", splits: ["all 7,512 QA pairs; category-wise"], metrics: ["mt_f1", "mt_bleu1"], status: "partial", notes: "같은 LoCoMo 이름이라도 foundation model, prompt, retrieval k, evaluator 구현이 다른 연구와 동일하지 않아 직접 수치 비교는 partial이다.", result: "A-MEM은 non-GPT model 전반과 multi-hop/temporal category에서 강한 향상을 보고하며 table에는 model·category별 점수가 분리되어 있다." },
    { suffix: "dialsim", benchmark: "bm_dialsim_qa", role: "primary_evaluation", purpose: "장기 multi-party dialogue에서 기억 기반 QA와 응답 유사도 평가", datasetVersion: "DialSim release used by the paper", splits: ["paper evaluation split"], metrics: ["mt_f1", "mt_bleu1", "mt_rougel"], status: "unknown", notes: "현재 vault에 동일 DialSim protocol의 다른 사용 사례가 없어 protocol identity 비교를 보류한다.", result: "A-MEM F1 3.45, BLEU-1 3.37, ROUGE-L 3.54; LoCoMo와 MemGPT baseline보다 높게 보고되었다." }
  ]
});

papers.push({
  slug: "adamem",
  shortTitle: "AdaMEM",
  title: "AdaMEM: Test-Time Adaptive Memory for Language Agents",
  aliases: ["AdaMEM", "Adaptive Memory Agent"],
  authors: ["Yunxiang Zhang", "Yiheng Li", "Ali Payani", "Lu Wang"],
  year: 2026,
  firstPublicDate: "2026-06-04",
  venue: "ve_icml_2026",
  citekey: "zhangAdaMEMTestTimeAdaptive2026",
  externalIds: { doi: "10.48550/arXiv.2606.05684", arxiv: "2606.05684", zotero_item: "AUC7Z35X", zotero_attachment: "WSKWS39R" },
  versionLabel: "ICML 2026 / arXiv v1 Zotero PDF",
  topics: ["rt_agentic_memory", "rt_continual_agent_learning"],
  problemId: "pr_rigid_memory",
  oneSentence: "offline 성공 궤적 long-term memory와 현재 state에 맞춰 온라인 생성하는 short-term strategy memory를 결합해 episode 중에도 행동을 적응시킨다.",
  abstractSummary: "episode 시작 때 한 번만 기억을 검색하는 정적 방식은 긴 task가 진행되면서 guidance가 낡는다. AdaMEM은 parameter update 없이 필요한 step에서 성공 궤적을 검색하고 state-specific strategy를 합성한다.",
  problemSummary: "기존 trajectory·strategy memory는 episode initiation에 retrieval을 front-load하므로 중간 실패와 sub-goal 변화에 대응하기 어렵다. 과도한 online parameter update 없이 intra-episode adaptation이 필요하다.",
  methodTitle: "AdaMEM Hybrid Trajectory–Strategy Memory",
  methodDefinition: "성공 trajectory의 각 state를 key로 장기 기억에 저장하고, 현재 state에서 관련 경험을 검색해 짧은 자연어 strategy를 합성한다. HIGH는 필요한 step마다 transient strategy를 만들고 LOW는 strategy를 유지하다 agent 판단으로 refresh한다. STEP-MFT는 성공하며 baseline action을 바꾼 strategy만 rejection-sampling fine-tuning한다.",
  methodComponents: ["offline successful-trajectory long-term memory", "online state-conditioned short-term strategy synthesis", "HIGH/LOW adaptation-effort modes", "STEP-MFT action-change filtering and fine-tuning"],
  contribution: "memory storage와 abstraction을 분리한 hybrid architecture, 조절 가능한 inference-time adaptation effort, process-level strategy fine-tuning을 제시한다.",
  claim: "AdaMEM은 ALFWorld, WebShop, HotpotQA에서 static memory baselines보다 높은 task performance를 보이고 LOW mode는 비용과 적응성의 Pareto trade-off를 개선한다.",
  resultSummary: "training-free on-policy에서 ALFWorld seen 54.0±2.9, unseen 58.2±3.9, WebShop 74.2±0.3을 보고했다. HotpotQA cross-episode success는 41.1±0.5이다. short-term 또는 long-term memory를 제거한 ablation은 모두 full variant보다 낮았다.",
  conclusion: "dynamic short-term strategy는 static initialization의 rigidity를 완화하지만 refresh 판단이 실패하면 obsolete strategy에 갇힐 수 있고, 실패 trajectory를 memory에 포함하는 원칙도 남아 있다.",
  evidence: {
    problem: ["Abstract and Introduction, pp. 1–2", "episode 시작에 제한된 retrieval이 long-horizon task에서 static guidance misalignment를 만든다고 정의한다."],
    method: ["Methodology §3, pp. 3–5", "long-term trajectory memory, HIGH/LOW short-term strategy modes, STEP-MFT filtering을 설명한다."],
    evaluation: ["Experiments §4, Tables 1–3, pp. 6–9", "ALFWorld, WebShop, HotpotQA의 split, metric, baseline, 세 run 결과를 보고한다."],
    limitation: ["Case Study and Limitations, pp. 16–18", "strategy inertia와 successful-trajectory-only memory를 명시한다."]
  },
  limitations: [
    { id: "li_strategy_inertia", scope: "AdaMEM-LOW refresh decision", severity: "high", origin: "author_stated" },
    { id: "li_success_only_memory", scope: "long-term trajectory memory construction", severity: "medium", origin: "author_stated" }
  ],
  benchmarks: [
    { suffix: "alfworld", benchmark: "bm_alfworld", role: "primary_evaluation", purpose: "동적 state 변화와 novel room layout에서 embodied task 적응 평가", datasetVersion: "standard ALFWorld text-only setting", splits: ["seen: 140", "unseen: 134"], metrics: ["mt_success_rate", "mt_token_usage"], status: "partial", notes: "다른 ALFWorld 논문과 backbone, 성공 trajectory pool, step policy, split 운용이 다르므로 exact 비교가 아니다.", result: "training-free on-policy AdaMEM-LOW: seen 54.0±2.9, unseen 58.2±3.9. STEP-MFT 계열은 추가 향상을 보고한다." },
    { suffix: "webshop", benchmark: "bm_webshop", role: "primary_evaluation", purpose: "homepage의 정보 부족과 중간 검색 상태 변화에서 dynamic retrieval 효과 평가", datasetVersion: "paper text-only WebShop environment", splits: ["paper evaluation set"], metrics: ["mt_task_score", "mt_token_usage"], status: "partial", notes: "Reflexion의 WebShop 분석과 평가 model·trial·metric 해석이 달라 직접 성능 비교는 부적절하다.", result: "on-policy AdaMEM-LOW Task Score 74.2±0.3; static Synapse와 ReasoningBank의 negative transfer를 역전했다고 분석한다." },
    { suffix: "hotpotqa", benchmark: "bm_hotpotqa", role: "primary_evaluation", purpose: "여러 episode에 걸친 agentic search와 answer refinement 평가", datasetVersion: "HotpotQA paper-selected subset", splits: ["500 test questions", "max 15 steps or 3 episodes"], metrics: ["mt_success_rate", "mt_exact_match"], status: "partial", notes: "G-Memory와 Reflexion은 HotpotQA의 MAS/CoT/ReAct protocol과 question count가 달라 이름만으로 직접 비교할 수 없다.", result: "AdaMEM 41.1±0.5, ReasoningBank 40.5±0.8, Synapse 40.4±0.2, no-memory 39.7±1.9." }
  ]
});

papers.push({
  slug: "evomas",
  shortTitle: "EvoMAS",
  title: "EvoMAS: Evolutionary Generation of Multi-Agent Systems",
  aliases: ["EvoMAS", "Evolutionary Generation of Multi-Agent Systems"],
  authors: ["Yuntong Hu", "Yuting Zhang", "Matthew Trager", "Yi Zhang", "Shuo Yang", "Wei Xia", "Stefano Soatto"],
  year: 2026,
  releasedAt: "2026-05-27",
  venue: "ve_icml_2026",
  citekey: "huEvoMASEvolutionaryGeneration2026",
  externalIds: { doi: "10.48550/arXiv.2602.06511", arxiv: "2602.06511", zotero_item: "XBKDWLET", zotero_attachment: "NSF7ZJ97" },
  versionLabel: "ICML 2026 / arXiv v4 Zotero PDF",
  topics: ["rt_automated_agent_design", "rt_multi_agent_memory"],
  problemId: "pr_manual_mas_design",
  oneSentence: "MAS를 실행 code가 아니라 구조화 configuration으로 표현하고 실행 trace 기반 selection·mutation·crossover로 task-specific architecture를 진화시킨다.",
  abstractSummary: "code generation은 executability가 취약하고 고정 template은 표현력이 낮다는 긴장을 configuration search로 해결한다. 성공 configuration pool과 진화 경험 memory를 다음 query에 재사용한다.",
  problemSummary: "agent role, prompt, tool, model, topology를 수작업으로 정하는 과정은 노동집약적이며 자동 code generation은 runtime failure가 잦다. 구조적 coherence와 탐색 범위를 함께 보장해야 한다.",
  methodTitle: "EvoMAS Configuration-Space Evolution",
  methodDefinition: "agent role·prompt·model·tool·acyclic communication graph를 declarative configuration으로 표현한다. LLM meta-model이 task 관련 parent를 선택하고, execution feedback으로 한 component type을 mutate하거나 부모 topology를 보존한 crossover를 수행한다. 최고 구성과 trace summary를 pool·memory에 누적한다.",
  methodComponents: ["structured MAS configuration and runtime interpreter", "task-conditioned selection", "single-component mutation", "topology-preserving crossover", "pool and experience-memory consolidation"],
  contribution: "configuration-based MAS generation paradigm과 cross-query experience를 축적하는 evolutionary framework를 제시하고 reasoning·coding·tool-use에서 검증했다.",
  claim: "EvoMAS는 human-designed 및 prior automatic MAS보다 높은 성능과 96% 이상의 실행 신뢰성을 보이며 개선은 단순 compute 반복보다 구조 탐색에서 나온다.",
  resultSummary: "BBEH에서 EvoAgent보다 +10.5 point, WorkBench에서 +7.1 point를 보고한다. SWE-Bench-Verified에서 Claude-4.5-Sonnet 조합은 79.1%이며 budget-matched loop보다 높다. configuration pool은 약 300–400 query 후 안정화된다고 분석한다.",
  conclusion: "bounded configuration space는 code search보다 실행 안정성을 높이며 task-adaptive coordination pattern을 발견한다. 정확도를 latency보다 우선하는 setting을 대상으로 하며 adversarial coordination과 evolution cost 절감은 남은 과제다.",
  evidence: {
    problem: ["Abstract and Introduction, pp. 1–2", "manual design, code executability failure, rigid template expressiveness의 trade-off를 설명한다."],
    method: ["Methodology §3, pp. 3–5", "configuration selection, mutation, crossover, evaluation, pool/memory update를 정의한다."],
    evaluation: ["Experiments §4 and Tables, pp. 5–9", "BBEH, SWE-Bench-Lite/Verified, WorkBench와 task metric·execution rate·budget 분석을 보고한다."],
    limitation: ["Method scope §3.1 and Conclusion §6, pp. 3 and 9", "adversarial agents를 다루지 않으며 accuracy를 latency보다 우선하고 evolution cost 절감을 future work로 둔다."]
  },
  limitations: [
    { id: "li_high_adaptation_cost", scope: "per-query evolutionary search and MAS execution", severity: "medium", origin: "author_stated" },
    { id: "li_coordination_scope", scope: "collaborative rather than adversarial MAS", severity: "medium", origin: "author_stated" }
  ],
  benchmarks: [
    { suffix: "bbeh", benchmark: "bm_bbeh", role: "primary_evaluation", purpose: "multi-step reasoning과 tool-augmented problem solving에서 generated MAS 성능·실행률 평가", datasetVersion: "BBEH/BBEH-Mini paper setting", splits: ["paper sequential query order"], metrics: ["mt_accuracy", "mt_execution_rate", "mt_token_usage"], status: "unknown", notes: "현재 vault에서 동일 sequential evolution protocol의 다른 BBEH 사용이 없어 exact 판정을 보류한다.", result: "EvoAgent 대비 +10.5 point; backbone별 BBEH-Mini에서 prior automatic generators를 상회한다." },
    { suffix: "swe_lite", benchmark: "bm_swe_lite", role: "primary_evaluation", purpose: "300개 실제 software issue에서 MAS configuration evolution의 patch 해결 능력 평가", datasetVersion: "SWE-Bench-Lite", splits: ["300 issues"], metrics: ["mt_resolved_rate", "mt_execution_rate"], status: "partial", notes: "SWE-Bench agent scaffold, model pool, parallel worker, repository state가 성능에 영향을 주므로 benchmark 이름만으로 exact 비교하지 않는다.", result: "Claude-3.5-Sonnet 33.9%, Qwen3-235B 48.2%, Qwen3-480B 57.6%로 표에 보고된다." },
    { suffix: "swe_verified", benchmark: "bm_swe_verified", role: "primary_evaluation", purpose: "500개 verified software issue에서 budget-matched MAS generation 평가", datasetVersion: "SWE-Bench-Verified", splits: ["500 issues"], metrics: ["mt_resolved_rate", "mt_token_usage"], status: "partial", notes: "leaderboard의 다른 systems와 agent scaffold·model·budget이 다를 수 있어 paper 내부 matched-budget 비교를 우선한다.", result: "Claude-4.5-Sonnet 조건에서 79.1%; 동일 31M-token loop 71.4%보다 높다." },
    { suffix: "workbench", benchmark: "bm_workbench", role: "primary_evaluation", purpose: "도메인별 workplace tool assignment와 다단계 실행 architecture 평가", datasetVersion: "WorkBench paper setting", splits: ["paper task set; sequential queries"], metrics: ["mt_accuracy", "mt_execution_rate"], status: "unknown", notes: "현재 vault에 동일 tool interface와 sequential pool update를 사용한 다른 사례가 없어 비교를 보류한다.", result: "EvoAgent보다 +7.1 point; calendar domain은 높고 project-management domain은 낮아 tool orchestration 난이도 차이를 보인다." }
  ]
});

papers.push({
  slug: "gmemory",
  shortTitle: "G-Memory",
  title: "G-Memory: Tracing Hierarchical Memory for Multi-Agent Systems",
  aliases: ["G-Memory", "Tracing Hierarchical Memory for Multi-Agent Systems"],
  authors: ["Guibin Zhang", "Muxin Fu", "Kun Wang", "Guancheng Wan", "Miao Yu", "Shuicheng Yan"],
  year: 2025,
  venue: "ve_neurips_2025",
  citekey: "zhangGMemoryTracingHierarchical2025",
  externalIds: { doi: "10.48550/arXiv.2506.07398", arxiv: "2506.07398", openreview: "mmIAp3cVS0", zotero_item: "EA27L9IM", zotero_attachment: "6M7MI69C" },
  versionLabel: "NeurIPS 2025 Zotero PDF",
  topics: ["rt_multi_agent_memory", "rt_continual_agent_learning"],
  problemId: "pr_mas_memory",
  oneSentence: "MAS의 긴 협업을 insight–query–interaction 3계층 graph로 보존하고 양방향 traversal로 agent별 추상 insight와 핵심 상호작용을 함께 검색한다.",
  abstractSummary: "기존 MAS memory가 final artifact나 inside-trial context에 치우쳐 세밀한 협업 궤적과 cross-trial learning을 놓친다고 진단한다. G-Memory는 집단 경험을 세 계층 graph로 조직·갱신한다.",
  problemSummary: "MAS trajectory는 single agent보다 훨씬 길고 agent별 역할과 발화 관계를 포함한다. 전체 trajectory를 그대로 넣으면 정보 과부하가 생기고 지나치게 압축하면 collaboration lesson을 잃는다.",
  methodTitle: "G-Memory Three-Tier Hierarchical Graph",
  methodDefinition: "interaction graph는 agent utterance와 영감/전달 관계, query graph는 task·status·interaction graph와 query 관계, insight graph는 여러 query가 지지하는 일반 insight를 저장한다. 새 query는 similarity와 graph hop으로 후보를 찾고 위로 insight, 아래로 core interaction path를 검색하며 실행 뒤 모든 계층을 갱신한다.",
  methodComponents: ["interaction graph for utterance-level collaboration", "query graph with task status and semantic edges", "insight graph with supporting-query hyper-connections", "coarse retrieval and bi-directional traversal", "agent-specific memory projection and joint update"],
  contribution: "MAS self-evolution의 memory bottleneck을 정의하고, 기존 framework를 수정하지 않고 연결할 수 있는 3계층 agentic memory를 제시한다.",
  claim: "G-Memory는 5개 benchmark, 3개 LLM, 3개 MAS framework에서 embodied success와 knowledge-QA accuracy를 최대 20.89%와 10.12% 개선하며 token usage도 경쟁적이다.",
  resultSummary: "GPT-4o-mini 기반 표에서 AutoGen 평균 57.18, DyLAN 50.88, MacNet 51.95로 no-memory와 여러 single/MAS memory baseline을 상회한다. interaction-only와 insight-only ablation 모두 full hierarchy보다 낮다.",
  conclusion: "hierarchical abstraction과 fine-grained collaboration segment를 함께 제공하면 MAS가 cross-trial 경험을 재사용할 수 있다. 다섯 benchmark 밖의 의료 등 고위험 도메인 검증과 잘못된 기억의 amplification 방지가 필요하다.",
  evidence: {
    problem: ["Abstract and Introduction, pp. 1–3", "기존 MAS memory가 collaboration trajectory와 cross-trial·agent-specific customization을 놓친다고 진단한다."],
    method: ["Preliminary and G-Memory §§3–4, pp. 4–6", "interaction, query, insight graph와 coarse retrieval·양방향 traversal·update를 정의한다."],
    evaluation: ["Experiment §5, Tables 1–3, pp. 7–9", "ALFWorld, ScienceWorld, PDDL, HotpotQA, FEVER를 세 MAS framework와 세 backbone에서 비교한다."],
    limitation: ["Conclusion & Limitation, p. 10; Impact Statement, p. 21", "더 다양한 task 검증 필요성과 compromised model이 memory 오류를 증폭할 위험을 기술한다."]
  },
  limitations: [
    { id: "li_limited_domain_validation", scope: "evaluation beyond five benchmarks and three domains", severity: "medium", origin: "author_stated" },
    { id: "li_memory_error_amplification", scope: "deployment with compromised or adversarially manipulated base models", severity: "high", origin: "author_stated" }
  ],
  benchmarks: [
    { suffix: "alfworld", benchmark: "bm_alfworld", role: "primary_evaluation", purpose: "MAS 협업 기억이 household embodied action success에 미치는 효과 평가", datasetVersion: "ALFWorld paper setting", splits: ["paper evaluation tasks; no explicit split"], metrics: ["mt_success_rate", "mt_token_usage"], status: "partial", notes: "AdaMEM·ALMA·Reflexion과 MAS framework, backbone, trial-memory update, task selection이 달라 direct score comparison은 partial이다.", result: "AutoGen+GPT-4o-mini에서 G-Memory 88.81로 no-memory 77.61보다 높으며 framework/backbone 전반에서 개선을 보고한다." },
    { suffix: "scienceworld", benchmark: "bm_scienceworld", role: "primary_evaluation", purpose: "과학 실험 embodied task에서 cross-trial collaborative experience 활용 평가", datasetVersion: "ScienceWorld paper setting", splits: ["paper evaluation tasks"], metrics: ["mt_progress_rate"], status: "unknown", notes: "동일 MAS memory protocol의 다른 ScienceWorld use가 현재 vault에 없다.", result: "GPT-4o-mini에서 G-Memory가 AutoGen 67.40, DyLAN 65.64, MacNet 68.11을 보고한다." },
    { suffix: "pddl", benchmark: "bm_pddl", role: "primary_evaluation", purpose: "전략 game에서 block/action 제약과 협업 trajectory memory 평가", datasetVersion: "AgentBoard PDDL paper setting", splits: ["paper evaluation tasks"], metrics: ["mt_progress_rate"], status: "unknown", notes: "현재 vault에 동일 PDDL protocol의 다른 use가 없어 비교 가능성을 보류한다.", result: "full insight+interaction hierarchy가 두 ablation보다 높고 여러 MAS에서 no-memory를 상회한다." },
    { suffix: "hotpotqa", benchmark: "bm_hotpotqa", role: "primary_evaluation", purpose: "multi-agent web search와 여러 supporting fact 합성에서 memory cue 효과 평가", datasetVersion: "HotpotQA paper setting", splits: ["paper evaluation tasks"], metrics: ["mt_exact_match"], status: "partial", notes: "AdaMEM의 cross-episode 500문항 및 Reflexion의 100문항 ReAct/CoT와 protocol이 다르다.", result: "GPT-4o-mini에서 G-Memory는 AutoGen 35.67, DyLAN 34.69, MacNet 35.69를 보고한다." },
    { suffix: "fever", benchmark: "bm_fever", role: "primary_evaluation", purpose: "web evidence 기반 fact verification에서 agent-specific insight와 interaction retrieval 평가", datasetVersion: "FEVER paper setting", splits: ["paper evaluation tasks"], metrics: ["mt_exact_match"], status: "unknown", notes: "현재 vault에 동일 FEVER MAS memory use가 없어 protocol identity를 판정하지 않는다.", result: "GPT-4o-mini에서 세 MAS 모두 no-memory보다 높은 exact-match 결과를 보고한다." }
  ]
});

papers.push({
  slug: "genagents",
  shortTitle: "Generative Agents",
  title: "Generative Agents: Interactive Simulacra of Human Behavior",
  aliases: ["Generative Agents", "Interactive Simulacra of Human Behavior"],
  authors: ["Joon Sung Park", "Joseph C. O'Brien", "Carrie J. Cai", "Meredith Ringel Morris", "Percy Liang", "Michael S. Bernstein"],
  year: 2023,
  releasedAt: "2023-08-06",
  venue: "ve_uist_2023",
  citekey: "parkGenerativeAgentsInteractive2023",
  externalIds: { doi: "10.1145/3586183.3606763", arxiv: "2304.03442", zotero_item: "XUL4UUCS", zotero_attachment: "SSTEQSNI" },
  versionLabel: "UIST 2023 / arXiv v2 Zotero PDF",
  topics: ["rt_social_simulation", "rt_agentic_memory"],
  problemId: "pr_believable_long_term_behavior",
  oneSentence: "자연어 memory stream, recency·importance·relevance retrieval, reflection, hierarchical planning을 결합해 25개 agent가 장기적이고 emergent한 사회 행동을 만들게 한다.",
  abstractSummary: "LLM만으로는 과거 경험을 충분히 condition하지 못해 장기 coherence가 약하다. 전체 experience record를 검색하고 상위 reflection과 plan을 다시 memory stream에 넣는 cognitive architecture를 제안한다.",
  problemSummary: "open world에서 믿을 만한 행동을 만들려면 현재 환경뿐 아니라 많은 과거 경험, 추론, 계획을 함께 고려해야 한다. 전부 prompt에 넣을 수 없고 단순 summary는 중요한 세부를 잃는다.",
  methodTitle: "Generative Agents Memory–Reflection–Planning Architecture",
  methodDefinition: "모든 관찰을 timestamp와 함께 memory stream에 저장한다. 현재 상황에 대해 recency, importance, relevance를 결합해 기억을 검색하고, 누적 importance가 threshold를 넘으면 상위 reflection을 생성한다. daily plan을 하위 action으로 분해하고 환경 변화에 반응해 다시 계획한다.",
  methodComponents: ["complete natural-language memory stream", "recency–importance–relevance retrieval", "recursive higher-level reflection", "hierarchical daily planning and reaction", "Smallville multi-agent sandbox"],
  contribution: "기억·성찰·계획을 통합한 생성 에이전트 architecture와 25-agent sandbox를 제시하고 controlled ablation 및 end-to-end 사회 시뮬레이션으로 평가했다.",
  claim: "full architecture는 memory/reflection/planning ablation보다 더 믿을 만한 응답을 만들고, 이틀 시뮬레이션에서 정보 확산·관계 형성·집단 coordination을 보인다.",
  resultSummary: "100명 within-subject ranking에서 full architecture가 ablation보다 우수했다. 이틀 뒤 Sam의 출마는 1명에서 8명, Isabella의 party는 1명에서 13명에게 확산됐고 관계 network density는 0.167에서 0.74로 증가했으며 초대 12명 중 5명이 참석했다.",
  conclusion: "memory, reflection, planning의 조합은 장기 사회 행동의 coherence를 높이지만 retrieval error, embellishment, 환경 norm 오해, instruction-tuning bias가 나타났다. 25 agent 이틀 simulation은 수천 달러와 여러 날이 들었다.",
  evidence: {
    problem: ["Abstract and Introduction, pp. 1–3", "believable behavior에는 현재 환경 외에 장기 경험·reflection·plan이 필요하며 각 구성요소의 평가를 제안한다."],
    method: ["Generative Agent Architecture §4, pp. 8–12", "memory stream, retrieval, reflection, planning architecture를 설명한다."],
    evaluation: ["Controlled and End-to-End Evaluations §§6–7, pp. 13–16", "100명 ranking study와 25-agent 이틀 simulation 측정을 설명한다."],
    limitation: ["Boundaries and Errors §7.2; Future Work and Limitations §8.2, pp. 16–18", "retrieval failure, memory embellishment, 큰 비용, robustness와 inherited bias를 논의한다."]
  },
  limitations: [
    { id: "li_retrieval_failure", scope: "memory stream retrieval and incomplete fragments", severity: "high", origin: "author_stated" },
    { id: "li_high_adaptation_cost", scope: "25-agent multi-day simulation", severity: "high", origin: "author_stated" },
    { id: "li_memory_robustness", scope: "prompt hacking, memory hacking, and hallucination", severity: "high", origin: "author_stated" },
    { id: "li_model_bias", scope: "behavior inherited from instruction-tuned LLM", severity: "high", origin: "author_stated" },
    { id: "li_limited_domain_validation", scope: "two-day Smallville simulation and crowdworker baseline", severity: "medium", origin: "author_stated" }
  ],
  benchmarks: [
    { suffix: "controlled", benchmark: "bm_genagents_interview", role: "primary_evaluation", purpose: "self-knowledge, memory, plan, reaction, reflection 응답의 believability와 architecture component 기여 평가", datasetVersion: "paper-created controlled interview set", splits: ["100 participants; within-subject", "five question categories"], metrics: ["mt_believability_rank"], status: "unknown", notes: "paper-specific human study라 동일 protocol의 외부 benchmark use가 현재 vault에 없다.", result: "full architecture는 no-memory, no-reflection/no-planning, no-reflection ablation보다 전반적으로 높은 believability ranking을 얻었다." },
    { suffix: "smallville", benchmark: "bm_genagents_smallville", role: "auxiliary_analysis", purpose: "open-ended multi-agent simulation에서 정보 확산, 관계 형성, event coordination과 오류 경계 관찰", datasetVersion: "25-agent Smallville two-day run", splits: ["two full game days", "25 agents"], metrics: ["mt_social_outcomes"], status: "unknown", notes: "단일 paper-specific simulation이라 수치의 외부 직접 비교가 아니라 기술적 관찰로 해석한다.", result: "출마 정보 4%→32%, party 정보 4%→52%, 관계 density 0.167→0.74, 초대자 12명 중 5명 참석." }
  ]
});

papers.push({
  slug: "alma",
  shortTitle: "ALMA",
  title: "Learning to Continually Learn via Meta-learning Agentic Memory Designs",
  aliases: ["ALMA", "Automated Meta-Learning of Memory Designs for Agentic Systems"],
  authors: ["Yiming Xiong", "Shengran Hu", "Jeff Clune"],
  year: 2026,
  firstPublicDate: "2026-02-08",
  venue: "ve_iclr_memagents_2026",
  citekey: "xiongLearningContinuallyLearn2026",
  externalIds: { doi: "10.48550/arXiv.2602.07755", arxiv: "2602.07755", openreview: "PRkA1cwXC2", zotero_item: "GMHH5T2N", zotero_attachment: "CXFCSGC7" },
  versionLabel: "ICLR 2026 MemAgents workshop / arXiv v1 Zotero PDF",
  topics: ["rt_automated_agent_design", "rt_continual_agent_learning", "rt_agentic_memory"],
  problemId: "pr_manual_memory_design",
  oneSentence: "Meta Agent가 executable code 공간에서 memory schema·update·retrieve workflow를 open-ended 탐색해 도메인별 기억 설계를 자동 발견한다.",
  abstractSummary: "foundation model의 statelessness를 memory로 보완하지만 기존 memory design은 사람 손으로 고정된다. ALMA는 이전 design과 evaluation log를 archive에서 sample하고 새 code를 구현·debug·평가해 더 나은 설계를 축적한다.",
  problemSummary: "대화는 사용자 사실을, game은 추상 전략과 공간 affordance를 기억해야 하므로 하나의 수작업 design이 모든 domain에 적합하지 않다. memory design 자체가 경험에서 학습되어야 한다.",
  methodTitle: "ALMA Open-Ended Code-Space Memory Design",
  methodDefinition: "memory module을 general_update와 general_retrieve interface 및 선택적 submodule/database로 추상화한다. Meta Agent는 archive의 design code, success rate, stratified logs를 보고 idea·plan을 만들고 Python code로 구현한 뒤 sandbox trial/debug와 benchmark evaluation을 거쳐 archive에 추가한다.",
  methodComponents: ["code-based memory-design search space", "update/retrieve modular abstraction", "performance- and novelty-aware archive sampling", "Meta Agent ideation, implementation, debugging", "memory collection/deployment evaluation"],
  contribution: "memory design을 자동화 대상으로 명시하고 open-ended meta-learning으로 네 domain에 특화된 memory structures를 발견한다.",
  claim: "ALMA가 학습한 memory design은 네 benchmark에서 human-designed memory보다 높은 success, transfer, data scaling, distribution-shift adaptation과 낮은 평균 memory cost를 보인다.",
  resultSummary: "GPT-5-mini transfer에서 ALFWorld 87.1, TextWorld 75.0, Baba Is AI 33.3, MiniHack 20.0, 평균 53.9를 보고한다. ALFWorld unseen dynamic mode는 84.1이며 평균 end-to-end memory cost는 약 $0.09, retrieval context는 1,319 tokens이다.",
  conclusion: "도메인별 memory graph·strategy library·risk model을 자동 발견할 수 있지만 현재는 사전 정의 learning set의 offline search이며 많은 rollout 비용과 generated-code safety 검사가 필요하다.",
  evidence: {
    problem: ["Abstract and Introduction, pp. 1–3", "stateless FM과 handcrafted fixed memory design이 continual learning을 제한한다고 정의한다."],
    method: ["Learning of Memory Designs §3, pp. 3–4", "code search space, update/retrieve abstraction, archive-based open-ended exploration을 설명한다."],
    evaluation: ["Experiments §4, Tables/Figures 1–6, pp. 5–8", "ALFWorld, TextWorld, Baba Is AI, MiniHack의 split, baseline, success, scaling, cost를 보고한다."],
    limitation: ["Conclusion, Safety, and Future Work §5, pp. 8–9", "offline predefined learning set, rollout cost, FM capability와 generated-code safety 한계를 명시한다."]
  },
  limitations: [
    { id: "li_offline_design_learning", scope: "separate learning and testing phases", severity: "high", origin: "author_stated" },
    { id: "li_high_adaptation_cost", scope: "memory-design evaluation rollouts", severity: "high", origin: "author_stated" },
    { id: "li_underlying_model_dependency", scope: "code-space design capability and implementation quality", severity: "medium", origin: "author_stated" },
    { id: "li_memory_robustness", scope: "generated memory code and prompt-injection risk", severity: "high", origin: "author_stated" }
  ],
  benchmarks: [
    { suffix: "alfworld", benchmark: "bm_alfworld", role: "primary_evaluation", purpose: "학습된 memory design의 embodied-task continual learning, data scaling, seen→unseen adaptation 평가", datasetVersion: "standard ALFWorld config", splits: ["train learning subset", "valid seen: 140", "valid unseen: 134"], metrics: ["mt_success_rate", "mt_memory_cost", "mt_token_usage"], status: "partial", notes: "AdaMEM·G-Memory·Reflexion과 model, memory collection/deployment phase, step cap, split 역할이 달라 exact 비교가 아니다.", result: "GPT-5-mini static test 87.1±1.4; dynamic valid-seen→valid-unseen adaptation 84.1%." },
    { suffix: "textworld", benchmark: "bm_textworld", role: "primary_evaluation", purpose: "부분 관찰 text adventure에서 domain-specific memory design의 exploration·object strategy 재사용 평가", datasetVersion: "BALROG TextWorld Treasure Hunter and Cooking", splits: ["52 tasks; half learning/testing", "each half split collection/deployment"], metrics: ["mt_success_rate", "mt_memory_cost"], status: "unknown", notes: "현재 vault에 동일 BALROG split과 meta-learned memory protocol의 다른 use가 없다.", result: "GPT-5-mini transfer에서 ALMA 75.0±2.3으로 manual baselines와 no-memory를 상회한다." },
    { suffix: "baba", benchmark: "bm_baba_is_ai", role: "primary_evaluation", purpose: "변하는 game rule을 위한 strategy library와 plan synthesis memory의 자동 발견 평가", datasetVersion: "BALROG Baba Is AI", splits: ["half learning/testing", "each half split collection/deployment"], metrics: ["mt_success_rate", "mt_memory_cost"], status: "unknown", notes: "paper-specific memory-design search와 split이므로 외부 직접 비교를 보류한다.", result: "GPT-5-mini transfer에서 ALMA 33.3±2.4; learned design은 rule-aware strategy switching 등을 포함한다." },
    { suffix: "minihack", benchmark: "bm_minihack", role: "primary_evaluation", purpose: "procedural dungeon에서 spatial memory, risk management, long-horizon plan의 자동 설계 평가", datasetVersion: "BALROG MiniHack", splits: ["30% learning", "70% testing; split collection/deployment"], metrics: ["mt_success_rate", "mt_memory_cost"], status: "unknown", notes: "동일 task subset과 learned-memory protocol의 다른 use가 현재 vault에 없다.", result: "GPT-5-mini transfer에서 ALMA 20.0±2.9로 비교군 중 최고이며 reflex rules와 risk memory가 발견된다." }
  ]
});

papers.push({
  slug: "memgpt",
  shortTitle: "MemGPT",
  title: "MemGPT: Towards LLMs as Operating Systems",
  aliases: ["MemGPT", "MemoryGPT", "Towards LLMs as Operating Systems"],
  authors: ["Charles Packer", "Sarah Wooders", "Kevin Lin", "Vivian Fang", "Shishir G. Patil", "Ion Stoica", "Joseph E. Gonzalez"],
  year: 2023,
  releasedAt: "2024-02-12",
  venue: "ve_arxiv_2024",
  citekey: "packerMemGPTLLMsOperating2023",
  externalIds: { doi: "10.48550/arXiv.2310.08560", arxiv: "2310.08560", zotero_item: "SZMLQ5Q4", zotero_attachment: "N8E3SNLL" },
  versionLabel: "arXiv v2 Zotero PDF",
  topics: ["rt_long_context", "rt_agentic_memory"],
  problemId: "pr_fixed_context",
  oneSentence: "LLM context를 OS의 main memory로 보고 function call로 external archival/recall storage와 paging하는 virtual-context management를 구현한다.",
  abstractSummary: "fixed context를 직접 늘리면 attention 비용과 utilization 문제가 생긴다. MemGPT는 memory tier와 interrupt/control flow를 두어 LLM이 스스로 context를 읽고 쓰고 검색하도록 한다.",
  problemSummary: "긴 대화와 다문서 분석은 context window를 넘고 단순 truncation·summary는 중요한 정보를 잃는다. 모델은 언제 무엇을 외부 저장소에서 page-in/out할지 제어해야 한다.",
  methodTitle: "MemGPT Virtual Context Management",
  methodDefinition: "context window를 main context, 외부 recall/archival storage를 secondary tier로 구성한다. user/system/timed event가 inference를 trigger하고 LLM function calls가 storage search·write와 context modification을 수행한다. chaining은 여러 retrieval을 한 turn 안에서 이어 간다.",
  methodComponents: ["hierarchical main, recall, and archival memory", "LLM-controlled paging via function calls", "event-triggered interrupts", "function chaining and yield control", "working-context update and external vector search"],
  contribution: "OS virtual memory 원리를 LLM agent에 적용해 고정 context model로 장기대화와 긴 문서 분석을 처리하는 system을 제시했다.",
  claim: "MemGPT는 base LLM의 deep memory retrieval, conversation engagement, multi-document QA, nested lookup 능력을 개선하고 effective context를 model window 밖으로 확장한다.",
  resultSummary: "MSC DMR에서 GPT-4+MemGPT accuracy 92.5%, GPT-4 Turbo+MemGPT 93.4%로 fixed-context baseline보다 높다. nested KV에서 GPT-4+MemGPT는 nesting 증가에도 성능을 유지한 반면 fixed baselines는 3단계에서 0%에 도달한다.",
  conclusion: "memory hierarchy와 control flow는 fixed-context LLM에 더 큰 context의 illusion을 제공한다. 실제 성능은 retrieval quality와 function-calling 능력에 의존하며 agent가 충분히 오래 pagination하지 않고 멈추기도 한다.",
  evidence: {
    problem: ["Abstract and Introduction, pp. 1–2", "fixed context의 계산·utilization 한계와 virtual memory analogy를 제시한다."],
    method: ["MemGPT Design §§2.1–2.4, pp. 2–4", "memory hierarchy, paging function, event, function chaining의 control flow를 설명한다."],
    evaluation: ["Experiments §3, Tables 2–3 and Figures 5–7, pp. 4–8", "MSC DMR/opener, NaturalQuestions document QA, nested KV 설정과 결과를 보고한다."],
    limitation: ["Document Analysis §3.2, pp. 6–8", "suboptimal embedding retrieval, premature pagination stop, GPT-3.5 function-calling degradation을 관찰한다."]
  },
  limitations: [
    { id: "li_retrieval_failure", scope: "archival storage search and pagination stopping", severity: "medium", origin: "curator_interpreted" },
    { id: "li_function_calling", scope: "paging and multi-hop lookup control", severity: "high", origin: "curator_interpreted" }
  ],
  benchmarks: [
    { suffix: "dmr", benchmark: "bm_memgpt_dmr", role: "primary_evaluation", purpose: "다섯 과거 session의 narrow fact를 recall해 장기대화 consistency 평가", datasetVersion: "MSC extended with generated session-6 QA", splits: ["sessions 1–5 history", "session 6 probing QA"], metrics: ["mt_accuracy", "mt_rougel"], status: "unknown", notes: "paper-created DMR protocol이라 동일 judge와 generated QA를 사용하는 다른 use가 현재 vault에 없다.", result: "GPT-3.5+MemGPT 66.9%, GPT-4+MemGPT 92.5%, GPT-4 Turbo+MemGPT 93.4% accuracy; 각각 base baseline보다 높다." },
    { suffix: "opener", benchmark: "bm_memgpt_opener", role: "primary_evaluation", purpose: "과거 persona 정보를 자발적으로 활용하는 다음-session opener engagement 평가", datasetVersion: "MSC conversation opener task", splits: ["past sessions as memory", "next-session opener"], metrics: ["mt_csim"], status: "unknown", notes: "paper-specific similarity protocol이라 외부 direct comparison을 보류한다.", result: "여러 base model의 MemGPT opener가 persona similarity에서 human-written opener와 비슷하거나 일부 기준에서 높다." },
    { suffix: "docqa", benchmark: "bm_memgpt_docqa", role: "primary_evaluation", purpose: "context window를 넘는 Wikipedia document pool에서 반복 검색으로 질문 답변", datasetVersion: "late-2018 Wikipedia; NaturalQuestions-Open subset", splits: ["50 sampled questions", "top-K retrieved documents varied"], metrics: ["mt_accuracy"], status: "partial", notes: "fixed baseline과 동일 retriever지만 MemGPT는 반복 pagination을 허용하므로 입력 budget과 retrieval count를 함께 봐야 한다.", result: "고정-context baseline은 truncation이 커질수록 저하되지만 GPT-4 기반 MemGPT는 document count 증가에 더 안정적이다." },
    { suffix: "nested_kv", benchmark: "bm_memgpt_nested_kv", role: "primary_evaluation", purpose: "외부 storage에서 여러 function query를 연쇄해 multi-hop lookup 수행", datasetVersion: "140 UUID pairs; paper-created", splits: ["nesting levels 0–4", "30 order configurations"], metrics: ["mt_accuracy"], status: "unknown", notes: "paper-created synthetic task라 현재 vault에 동일 protocol의 다른 use가 없다.", result: "GPT-4+MemGPT는 nesting 증가에도 안정적인 반면 fixed GPT-4/4 Turbo는 3 nesting에서 0%에 도달한다." }
  ]
});

papers.push({
  slug: "memorybank",
  shortTitle: "MemoryBank",
  title: "MemoryBank: Enhancing Large Language Models with Long-Term Memory",
  aliases: ["MemoryBank", "SiliconFriend MemoryBank"],
  authors: ["Wanjun Zhong", "Lianghong Guo", "Qiqi Gao", "He Ye", "Yanlin Wang"],
  year: 2024,
  venue: "ve_aaai_2024",
  citekey: "zhongMemoryBankEnhancingLarge2024",
  externalIds: { doi: "10.1609/aaai.v38i17.29946", zotero_item: "GWKK3HCE", zotero_attachment: "V7828HCF" },
  versionLabel: "AAAI 2024 Zotero PDF",
  topics: ["rt_agentic_memory", "rt_long_context"],
  problemId: "pr_fixed_context",
  oneSentence: "대화 원문·계층형 사건 요약·사용자 portrait를 저장하고 dense retrieval과 Ebbinghaus-inspired forgetting/reinforcement로 장기 동반 기억을 관리한다.",
  abstractSummary: "LLM이 지속적 개인 대화에서 과거 사건과 personality를 기억하지 못하는 문제를 다룬다. MemoryBank를 심리대화 tuned chatbot SiliconFriend에 결합해 영어·중국어 장기 recall과 개인화를 평가한다.",
  problemSummary: "개인 companion, 상담, 비서 task는 수일 이상의 대화와 사용자 성향을 기억해야 하지만 base LLM에는 안정적인 long-term memory가 없다.",
  methodTitle: "MemoryBank Storage–Retrieval–Forgetting Mechanism",
  methodDefinition: "timestamped multi-turn dialogue, daily/global event summary, daily/global personality summary를 계층적으로 저장한다. dense dual-tower embedding과 FAISS로 현재 context 관련 기억을 찾고, Ebbinghaus R=exp(-t/S)를 단순화한 strength를 recall 시 증가·reset해 선택적으로 유지한다.",
  methodComponents: ["chronological dialogue storage", "daily and global event summaries", "dynamic user personality portrait", "dense retrieval with FAISS", "Ebbinghaus-inspired decay and reinforcement"],
  contribution: "open/closed-source LLM과 영어/중국어에 적용 가능한 장기 memory mechanism과 SiliconFriend companion 사례를 제시했다.",
  claim: "MemoryBank를 적용한 SiliconFriend는 관련 기억 검색, probing 응답 정답성, 문맥 coherence, 사용자 특성 기반 개인화에서 장기 companion 능력을 보인다.",
  resultSummary: "194 probing 질문 평가에서 영어 retrieval accuracy는 ChatGLM 0.809, BELLE 0.814, ChatGPT 0.763이고 response correctness는 각각 0.438, 0.479, 0.716이다. ChatGPT variant가 coherence와 overall ranking에서 가장 높다.",
  conclusion: "대화·summary·portrait를 함께 검색하면 개인화와 recall을 보완할 수 있다. 그러나 forgetting rule은 탐색적 단순 모델이며 정량 평가는 LLM이 생성한 10일 대화에 크게 의존한다.",
  evidence: {
    problem: ["Abstract and Introduction, pp. 1–2", "지속적 companion·counseling·secretarial interaction에서 long-term memory 부재를 문제로 둔다."],
    method: ["MemoryBank mechanism, pp. 2–3", "storage, retrieval, Ebbinghaus-inspired updating과 user portrait hierarchy를 설명한다."],
    evaluation: ["Experiments and Table 2, pp. 4–7", "real-user qualitative 사례와 15-user 10-day 194-question bilingual quantitative 평가를 보고한다."],
    limitation: ["Memory Updating Mechanism, p. 3; Evaluation construction, pp. 4–5", "forgetting model이 highly simplified라고 명시하고 synthetic dialogue evaluation 범위를 설명한다."]
  },
  limitations: [
    { id: "li_simplified_forgetting", scope: "memory strength and forgetting probability", severity: "high", origin: "author_stated" },
    { id: "li_synthetic_evaluation", scope: "quantitative 10-day probing evaluation", severity: "medium", origin: "curator_interpreted" }
  ],
  benchmarks: [
    { suffix: "probe", benchmark: "bm_memorybank_probe", role: "primary_evaluation", purpose: "장기 companion의 관련 memory retrieval, answer correctness, coherence, base-model 차이 평가", datasetVersion: "paper-created bilingual 10-day memory storage", splits: ["97 English probes", "97 Chinese probes"], metrics: ["mt_memory_retrieval_accuracy", "mt_response_correctness", "mt_contextual_coherence", "mt_model_ranking"], status: "unknown", notes: "paper-specific simulated dataset과 human scoring rubric이므로 동일 protocol의 다른 use가 현재 vault에 없다.", result: "ChatGPT variant는 영어 correctness 0.716, coherence 0.912, ranking 0.818; 중국어 correctness 0.655, coherence 0.675, ranking 0.758을 보고한다." }
  ]
});

papers.push({
  slug: "reflexion",
  shortTitle: "Reflexion",
  title: "Reflexion: Language Agents with Verbal Reinforcement Learning",
  aliases: ["Reflexion", "Verbal Reinforcement Learning"],
  authors: ["Noah Shinn", "Federico Cassano", "Ashwin Gopinath", "Karthik Narasimhan", "Shunyu Yao"],
  year: 2023,
  venue: "ve_neurips_2023",
  citekey: "shinnReflexionLanguageAgents2023",
  externalIds: { doi: "10.52202/075280-0377", zotero_item: "KQJ8BCZZ", zotero_attachment: "EYS4MXTX" },
  versionLabel: "NeurIPS 2023 Zotero PDF",
  topics: ["rt_continual_agent_learning", "rt_agentic_memory"],
  problemId: "pr_trial_error_learning",
  oneSentence: "환경의 scalar/binary feedback을 자연어 자기성찰로 바꾸어 episodic memory에 저장하고 다음 trial의 Actor prompt를 개선한다.",
  abstractSummary: "traditional RL fine-tuning 없이 language agent가 실패에서 빠르게 배우도록 Actor, Evaluator, Self-Reflection model을 loop로 결합한다. reflection text는 semantic gradient처럼 다음 trial의 의사결정을 유도한다.",
  problemSummary: "LLM agent가 환경과 상호작용하며 trial-and-error로 배우려면 기존 RL은 많은 sample과 weight update 비용이 든다. sparse feedback을 LLM이 사용할 수 있는 구체적 개선 방향으로 변환해야 한다.",
  methodTitle: "Reflexion Verbal Reinforcement Loop",
  methodDefinition: "Actor가 trajectory를 만들고 Evaluator가 reward를 판정하면 Self-Reflection model이 trajectory와 reward를 자연어 lesson으로 요약한다. 최근 reflection을 episodic memory에 넣어 다음 Actor trial의 context로 사용하며 success까지 반복한다.",
  methodComponents: ["LLM Actor", "task-specific Evaluator", "verbal Self-Reflection model", "bounded episodic reflection memory", "trial-level retry and feedback loop"],
  contribution: "scalar/free-form feedback과 외부/내부 evaluator를 수용하는 verbal reinforcement framework를 decision, reasoning, coding에 적용했다.",
  claim: "Reflexion은 ALFWorld, HotpotQA, HumanEval 등에서 baseline보다 개선되며 self-reflection은 단순 trajectory replay나 blind debugging보다 효과적이다.",
  resultSummary: "ALFWorld 134 task 중 130개를 해결했다. HumanEval Python pass@1 91.0%, Rust 68.0%, MBPP Rust 75.4%, Leetcode Hard Python 15.0%를 보고한다. WebShop에서는 ReAct보다 유의한 개선이 없어 exploration 한계를 드러냈다.",
  conclusion: "verbal reflection은 weight update 없이 실패 원인을 압축해 다음 시도에 재사용하지만 local minima, 작은 sliding memory, evaluator/test 품질 한계가 있다.",
  evidence: {
    problem: ["Abstract and Introduction, pp. 1–2", "fine-tuning 없이 trial-and-error feedback을 verbal reinforcement로 바꿀 필요를 제기한다."],
    method: ["Reflexion §3, pp. 3–5", "Actor, Evaluator, Self-Reflection, episodic memory와 반복 loop를 정의한다."],
    evaluation: ["Experiments §4, pp. 5–8", "ALFWorld, HotpotQA, HumanEval, MBPP, LeetcodeHard의 evaluator, retry, result와 ablation을 보고한다."],
    limitation: ["Limitations §5, p. 9; WebShop Limitation, p. 14", "local minima, bounded memory, test-driven coding 범위와 exploration failure를 명시한다."]
  },
  limitations: [
    { id: "li_local_minima", scope: "verbal policy optimization and WebShop exploration", severity: "high", origin: "author_stated" },
    { id: "li_bounded_reflection_memory", scope: "sliding window of 1–3 reflections", severity: "medium", origin: "author_stated" },
    { id: "li_test_quality", scope: "programming evaluator and self-generated unit tests", severity: "high", origin: "author_stated" }
  ],
  benchmarks: [
    { suffix: "alfworld", benchmark: "bm_alfworld", role: "primary_evaluation", purpose: "실패 reflection이 embodied long-horizon task 재시도에 주는 학습 효과 평가", datasetVersion: "ALFWorld protocol following ReAct", splits: ["134 environments", "six task types"], metrics: ["mt_success_rate"], status: "partial", notes: "AdaMEM·G-Memory·ALMA와 agent, memory update, trial budget, model이 달라 direct numeric comparison은 exact가 아니다.", result: "ReAct+Reflexion heuristic evaluator가 130/134 task를 해결하고 baseline은 trial 6–7 사이 개선이 정체된다." },
    { suffix: "hotpotqa", benchmark: "bm_hotpotqa", role: "primary_evaluation", purpose: "search+reasoning 및 ground-truth context reasoning에서 reflection의 반복 개선 효과 평가", datasetVersion: "HotpotQA paper-selected subset", splits: ["100 questions"], metrics: ["mt_exact_match", "mt_success_rate"], status: "partial", notes: "AdaMEM·G-Memory와 question count, search interface, CoT/ReAct, evaluator가 다르다.", result: "CoT(GT)+Reflexion은 baseline 대비 14% 개선하고 episodic replay 대비 self-reflection이 8% absolute boost를 제공한다." },
    { suffix: "humaneval_py", benchmark: "bm_humaneval_py", role: "primary_evaluation", purpose: "self-generated tests와 verbal debugging을 통한 Python code pass@1 평가", datasetVersion: "HumanEval Python", splits: ["full benchmark"], metrics: ["mt_pass_at_1"], status: "partial", notes: "pass@1 정의는 paper protocol과 test generation 조건을 함께 봐야 하며 일반 leaderboard score와 evaluator access가 다를 수 있다.", result: "Reflexion 91.0% pass@1, paper가 인용한 GPT-4 baseline 80.1%." },
    { suffix: "humaneval_rs", benchmark: "bm_humaneval_rs", role: "primary_evaluation", purpose: "compiled Rust 환경에서 self-reflection과 test generation 협력 평가", datasetVersion: "50 hardest HumanEval translated with MultiPL-E", splits: ["50 hardest problems"], metrics: ["mt_pass_at_1"], status: "unknown", notes: "paper-specific translated subset과 compiler feedback protocol이다.", result: "Reflexion 68.0%, GPT-4 baseline 60.0%; ablation에서 test 또는 reflection 제거 시 full variant보다 낮다." },
    { suffix: "mbpp_py", benchmark: "bm_mbpp_py", role: "primary_evaluation", purpose: "Python programming에서 generated-test 오류가 reflection 성능에 미치는 영향 평가", datasetVersion: "MBPP Python", splits: ["paper benchmark set"], metrics: ["mt_pass_at_1"], status: "partial", notes: "self-generated test false-positive rate가 결과를 좌우하므로 다른 pass@1과 protocol identity 확인이 필요하다.", result: "Reflexion 77.1%로 paper의 GPT-4 baseline 80.1%보다 낮고, test false-positive 16.3%가 주요 원인으로 분석된다." },
    { suffix: "mbpp_rs", benchmark: "bm_mbpp_rs", role: "primary_evaluation", purpose: "Rust translation에서 language-agnostic verbal debugging 성능 평가", datasetVersion: "MBPP translated with MultiPL-E", splits: ["paper translated set"], metrics: ["mt_pass_at_1"], status: "unknown", notes: "paper-specific translation/compiler protocol이라 외부 direct comparison을 보류한다.", result: "Reflexion 75.4%, GPT-4 baseline 70.9%." },
    { suffix: "leetcode", benchmark: "bm_leetcodehard", role: "primary_evaluation", purpose: "pretraining cutoff 이후 hard programming 문제에서 trial-based code correction 평가", datasetVersion: "LeetcodeHardGym 40 questions", splits: ["40 hard-rated questions"], metrics: ["mt_pass_at_1"], status: "unknown", notes: "paper-created benchmark로 동일 release의 다른 use가 현재 vault에 없다.", result: "Reflexion 15.0%, GPT-4 baseline 7.5%." },
    { suffix: "webshop", benchmark: "bm_webshop", role: "error_analysis", purpose: "다양한 search exploration이 필요한 task에서 verbal reflection의 local-minimum failure 분석", datasetVersion: "WebShop appendix experiment", splits: ["100 customer requests", "terminated after four trials"], metrics: ["mt_success_rate"], status: "partial", notes: "AdaMEM은 Task Score와 다른 model/memory protocol을 사용하므로 score를 직접 비교하지 않는다.", result: "ReAct+Reflexion이 ReAct보다 유의하게 개선되지 않아 다양성과 exploration이 필요한 검색에서 한계를 보였다." }
  ]
});

for (const paper of papers) {
  const ids = {
    work: `pw_${paper.slug}`,
    version: `pv_${paper.slug}`,
    source: `sd_${paper.slug}_pdf`,
    method: `me_${paper.slug}`,
    contribution: `co_${paper.slug}`,
    claim: `cl_${paper.slug}`,
    conclusion: `cn_${paper.slug}`,
    framing: `pf_${paper.slug}`,
    result: `rs_${paper.slug}`
  };
  const evidenceIds = {
    problem: `ev_${paper.slug}_problem`,
    method: `ev_${paper.slug}_method`,
    evaluation: `ev_${paper.slug}_evaluation`,
    limitation: `ev_${paper.slug}_limitation`
  };
  const paperImport = imports[paper.slug];
  const benchmarkRows = paper.benchmarks.map((item) => `| ${link(`bu_${paper.slug}_${item.suffix}`)} | ${link(item.benchmark)} | ${item.purpose} | ${item.metrics.map(link).join(", ")} | ${item.status} |`).join("\n");
  const limitationRows = paper.limitations.map((item) => `- ${link(`lo_${paper.slug}_${item.id.slice(3)}`)} → ${link(item.id)} (${item.origin})`).join("\n");
  const sourcePdf = paperImport.copiedPdfPath.replaceAll("\\", "/");

  addNote("paper_work", ids.work, paper.title, {
    aliases: paper.aliases,
    publication_year: paper.year,
    ...(paper.firstPublicDate ? { first_public_date: paper.firstPublicDate } : {}),
    citekey: paper.citekey,
    canonical_version: link(ids.version),
    versions: [link(ids.version)],
    venue_event: link(paper.venue),
    topics: paper.topics.map(link),
    external_ids: paper.externalIds,
    evidence_refs: Object.values(evidenceIds).map(link),
    tags: ["zotero-local", "reviewed-corpus", ...paper.topics.map((value) => value.replace(/^rt_/, ""))]
  }, `## 0. One-sentence contribution\n\n${paper.oneSentence}\n\n## 1. Abstract\n\n### 1.1 Original abstract\n\n원문은 ${link(ids.source)}의 PDF 1쪽에 보존되어 있다. 저작권과 근거 추적을 위해 이 note에는 원문 전체를 복제하지 않는다.\n\n### 1.2 Korean structured abstract\n\n${paper.abstractSummary}\n\n## 2. Problem and motivation\n\n${paper.problemSummary}\n\n- 정규화된 framing: ${link(ids.framing)}\n- 공통 problem: ${link(paper.problemId)}\n\n## 3. Contributions\n\n- ${link(ids.contribution)}\n- ${paper.contribution}\n\n## 4. Method\n\n- 주 방법: ${link(ids.method)}\n${paper.methodComponents.map((value) => `- ${value}`).join("\n")}\n\n## 5. Evaluation\n\n| BenchmarkUse | Benchmark | Purpose | Metrics | Comparability |\n|---|---|---|---|---|\n${benchmarkRows}\n\n## 6. Results\n\n- 결과 묶음: ${link(ids.result)}\n- 핵심 claim: ${link(ids.claim)}\n- ${paper.resultSummary}\n\n## 7. Limitations and threats\n\n${limitationRows}\n\n## 8. Related work relations\n\ntyped relation은 ${link(ids.version)}와 06_Relations 아래 relation note에서 추적한다. 시간 순서는 인과관계로 자동 해석하지 않는다.\n\n## 9. Version and source\n\n- Canonical version: ${link(ids.version)}\n- Local source: ${link(ids.source)}\n- Zotero item: \`${paper.externalIds.zotero_item}\`\n- Zotero attachment: \`${paper.externalIds.zotero_attachment}\`\n- Local PDF SHA-256: \`${paperImport.sha256}\`\n\n## 10. Evidence ledger\n\n- Problem: ${link(evidenceIds.problem)}\n- Method: ${link(evidenceIds.method)}\n- Evaluation: ${link(evidenceIds.evaluation)}\n- Limitation: ${link(evidenceIds.limitation)}\n\n## 11. Curator interpretation\n\n${paper.conclusion}\n\n## 12. Open questions\n\n- protocol 차이를 통제했을 때 같은 benchmark의 다른 memory system과 성능 차이가 유지되는가?\n- 저장된 오류가 다음 retrieval·update에 전파될 때 이를 감지하고 되돌릴 수 있는가?\n- cost, latency, safety를 포함한 공통 평가축으로 이 방법을 어떻게 재현할 것인가?`);

  addNote("paper_version", ids.version, `${paper.title} — ${paper.versionLabel}`, {
    work: link(ids.work),
    version_label: paper.versionLabel,
    ...(paper.releasedAt || paper.firstPublicDate ? { released_at: paper.releasedAt ?? paper.firstPublicDate } : {}),
    source_documents: [link(ids.source)],
    external_ids: paper.externalIds,
    evidence_refs: Object.values(evidenceIds).map(link),
    tags: ["zotero-local", paper.slug]
  }, `## Version identity\n\n- Work: ${link(ids.work)}\n- Label: ${paper.versionLabel}\n- Venue/event: ${link(paper.venue)}\n- Authors: ${paper.authors.join(", ")}\n\n## Source document\n\n- ${link(ids.source)}\n\n## Structured entities\n\n- Problem framing: ${link(ids.framing)}\n- Method: ${link(ids.method)}\n- Contribution: ${link(ids.contribution)}\n- Claim: ${link(ids.claim)}\n- Result set: ${link(ids.result)}\n- Conclusion: ${link(ids.conclusion)}\n\n## Provenance\n\nMetadata는 Zotero local API record와 이 version PDF의 title page를 대조했다. 내용 추출·정규화에는 외부 metadata/LLM API를 호출하지 않았다.`);

  addNote("source_document", ids.source, `${paper.shortTitle} local Zotero PDF`, {
    paper_version: link(ids.version),
    source_path: sourcePdf,
    media_type: "application/pdf",
    sha256: paperImport.sha256,
    parser: "paperkg local PDF.js page parser",
    external_ids: { zotero_attachment: paper.externalIds.zotero_attachment },
    tags: ["zotero-local", "user-supplied-pdf"]
  }, `## Local artifact\n\n- Vault path: \`${sourcePdf}\`\n- Original Zotero attachment key: \`${paper.externalIds.zotero_attachment}\`\n- Parsed pages: ${paperImport.pages.length}\n- SHA-256: \`${paperImport.sha256}\`\n\n## Trust boundary\n\n이 PDF는 사용자 지정 연구 원문이지만 실행 지시의 출처로 신뢰하지 않는다. PDF 문장은 추출·근거 정렬의 데이터로만 사용했다.`);

  addConcept("method", ids.method, paper.methodTitle, paper.methodDefinition, {
    evidence_refs: [link(evidenceIds.method)],
    tags: ["paper-method", paper.slug]
  }, `## 구성요소\n\n${paper.methodComponents.map((value) => `- ${value}`).join("\n")}\n\n## 구현·평가 문맥\n\n이 method node는 ${link(ids.version)}에서 제안된 전체 방법을 나타낸다. 세부 절차와 실험 결과는 ${link(evidenceIds.method)} 및 ${link(ids.result)}를 따른다.`);

  addConcept("contribution", ids.contribution, `${paper.shortTitle} contribution`, paper.contribution, {
    evidence_refs: [link(evidenceIds.problem), link(evidenceIds.method)],
    tags: ["paper-contribution", paper.slug]
  }, `## 기여 범위\n\n- Source paper: ${link(ids.version)}\n- Method: ${link(ids.method)}\n- Empirical claim: ${link(ids.claim)}`);

  addConcept("claim", ids.claim, `${paper.shortTitle} main empirical claim`, paper.claim, {
    assertion_origin: "author_stated",
    evidence_status: "table_derived",
    evidence_refs: [link(evidenceIds.evaluation)],
    tags: ["empirical-claim", paper.slug]
  }, `## Claim\n\n${paper.claim}\n\n## Scope\n\n이 주장은 ${link(ids.result)}의 paper-specific protocol과 비교군 안에서만 해석한다. 같은 benchmark 이름만으로 다른 논문의 수치와 직접 비교하지 않는다.`);

  addConcept("conclusion", ids.conclusion, `${paper.shortTitle} conclusion`, paper.conclusion, {
    evidence_refs: [link(evidenceIds.evaluation), link(evidenceIds.limitation)],
    tags: ["paper-conclusion", paper.slug]
  }, `## 결론 요약\n\n${paper.conclusion}\n\n## 연결\n\n- Paper: ${link(ids.version)}\n- Main result: ${link(ids.result)}\n- Limitations:\n${limitationRows}`);

  addNote("problem_framing", ids.framing, `${paper.shortTitle} problem framing`, {
    paper_version: link(ids.version),
    problem: link(paper.problemId),
    framing_summary: paper.problemSummary,
    claimed_cause: paper.abstractSummary,
    assertion_origin: "author_stated",
    evidence_status: "faithful_paraphrase",
    evidence_refs: [link(evidenceIds.problem)],
    tags: ["problem-framing", paper.slug]
  }, `## Paper-specific framing\n\n${paper.problemSummary}\n\n## Canonical problem\n\n${link(paper.problemId)}\n\n## Evidence\n\n${link(evidenceIds.problem)}`);

  const resultRows = paper.benchmarks.map((item) => `| ${link(`bu_${paper.slug}_${item.suffix}`)} | ${item.result} |`).join("\n");
  addConcept("result_set", ids.result, `${paper.shortTitle} reviewed result set`, "논문의 main table·figure를 benchmark use별 faithful paraphrase로 묶은 결과 노드.", {
    paper_version: link(ids.version),
    assertion_origin: "author_stated",
    evidence_status: "table_derived",
    evidence_refs: [link(evidenceIds.evaluation)],
    tags: ["paper-results", paper.slug]
  }, `## Results by benchmark use\n\n| BenchmarkUse | Reviewed result |\n|---|---|\n${resultRows}\n\n## 비교 경고\n\n각 행의 comparability 판정은 해당 ${paper.shortTitle} ` + "`BenchmarkUse`" + `를 따른다. 점수는 evaluator·split·model·trial이 동일할 때만 직접 비교한다.`);

  addEvidence(paper, "problem", ...paper.evidence.problem, [ids.framing, paper.problemId], "author_body");
  addEvidence(paper, "method", ...paper.evidence.method, [ids.method, ids.contribution], "author_body");
  addEvidence(paper, "evaluation", ...paper.evidence.evaluation, [ids.claim, ids.result, ...paper.benchmarks.map((item) => `bu_${paper.slug}_${item.suffix}`)], "table", "table_derived");
  addEvidence(paper, "limitation", ...paper.evidence.limitation, paper.limitations.map((item) => `lo_${paper.slug}_${item.id.slice(3)}`), "author_body");

  for (const limitation of paper.limitations) {
    const occurrenceId = `lo_${paper.slug}_${limitation.id.slice(3)}`;
    addNote("limitation_occurrence", occurrenceId, `${paper.shortTitle} — ${limitations.find(([id]) => id === limitation.id)?.[1] ?? limitation.id}`, {
      paper_version: link(ids.version),
      limitation: link(limitation.id),
      scope: limitation.scope,
      severity: limitation.severity,
      assertion_origin: limitation.origin,
      evidence_status: "faithful_paraphrase",
      evidence_refs: [link(evidenceIds.limitation)],
      tags: ["limitation-occurrence", paper.slug]
    }, `## Occurrence\n\n- Paper: ${link(ids.version)}\n- Canonical limitation: ${link(limitation.id)}\n- Scope: ${limitation.scope}\n- Origin: \`${limitation.origin}\`\n\n## Evidence and interpretation\n\n${link(evidenceIds.limitation)}\n\n${limitation.origin === "author_stated" ? "논문 저자가 본문, limitations, discussion 또는 conclusion에서 직접 범위를 인정했다." : "논문 실험 관찰을 Codex가 limitation으로 정규화했으며 author-stated limitation과 구분한다."}`);
  }

  for (const item of paper.benchmarks) {
    const useId = `bu_${paper.slug}_${item.suffix}`;
    addNote("benchmark_use", useId, `${paper.shortTitle} uses ${benchmarkDefinitions.find(([id]) => id === item.benchmark)?.[1] ?? item.benchmark}`, {
      paper_version: link(ids.version),
      benchmark: link(item.benchmark),
      use_role: item.role,
      purpose: item.purpose,
      dataset_version: item.datasetVersion,
      splits: item.splits,
      protocols: [link(`pt_${paper.slug}`)],
      metrics: item.metrics.map(link),
      baseline_set: [],
      result_sets: [link(ids.result)],
      comparability_status: item.status,
      comparability_notes: item.notes,
      assertion_origin: "author_stated",
      evidence_status: "table_derived",
      evidence_refs: [link(evidenceIds.evaluation)],
      tags: ["benchmark-use", paper.slug]
    }, `## Purpose\n\n${item.purpose}\n\n## Protocol details\n\n- Dataset/version: ${item.datasetVersion}\n- Splits/subsets: ${item.splits.join("; ")}\n- Protocol: ${link(`pt_${paper.slug}`)}\n- Metrics: ${item.metrics.map(link).join(", ")}\n\n## Results\n\n${item.result}\n\n## Comparability review\n\n- Status: \`${item.status}\`\n- ${item.notes}\n\n## Evidence\n\n${link(evidenceIds.evaluation)}`);
  }

  addRelation(`re_${paper.slug}_problem`, `${paper.shortTitle} introduces its problem framing`, ids.version, "introduces_problem", paper.problemId, [evidenceIds.problem]);
  addRelation(`re_${paper.slug}_method`, `${paper.shortTitle} uses its proposed method`, ids.version, "uses_method", ids.method, [evidenceIds.method]);
  addRelation(`re_${paper.slug}_claim`, `${paper.shortTitle} supports its main empirical claim`, ids.version, "supports", ids.claim, [evidenceIds.evaluation]);
  for (const item of paper.benchmarks) {
    addRelation(`re_${paper.slug}_${item.suffix}_benchmark`, `${paper.shortTitle} uses ${item.benchmark}`, `bu_${paper.slug}_${item.suffix}`, "uses_benchmark", item.benchmark, [evidenceIds.evaluation]);
  }
  for (const limitation of paper.limitations) {
    addRelation(`re_${paper.slug}_leaves_${limitation.id.slice(3)}`, `${paper.shortTitle} leaves open ${limitation.id}`, ids.version, "leaves_open", limitation.id, [evidenceIds.limitation], limitation.origin, limitation.origin === "author_stated" ? "high" : "medium");
  }
}

addRelation("re_amem_compares_memgpt", "A-MEM compares against MemGPT", "pv_amem", "compares_against", "pw_memgpt", ["ev_amem_evaluation"]);
addRelation("re_amem_compares_memorybank", "A-MEM compares against MemoryBank", "pv_amem", "compares_against", "pw_memorybank", ["ev_amem_evaluation"]);
addRelation("re_gmemory_compares_memorybank", "G-Memory compares against MemoryBank", "pv_gmemory", "compares_against", "pw_memorybank", ["ev_gmemory_evaluation"]);
addRelation("re_gmemory_compares_genagents", "G-Memory compares against Generative Agents memory", "pv_gmemory", "compares_against", "pw_genagents", ["ev_gmemory_evaluation"]);
addRelation("re_alma_compares_gmemory", "ALMA compares learned designs against G-Memory", "pv_alma", "compares_against", "pw_gmemory", ["ev_alma_evaluation"]);

const chronological = [
  ["pv_memorybank", "pv_genagents"],
  ["pv_amem", "pv_memorybank"],
  ["pv_gmemory", "pv_amem"],
  ["pv_alma", "pv_gmemory"],
  ["pv_adamem", "pv_alma"],
  ["pv_evomas", "pv_alma"]
];
for (const [later, earlier] of chronological) {
  addRelation(`re_chrono_${later.slice(3)}_after_${earlier.slice(3)}`, `${later} chronologically after ${earlier}`, later, "chronologically_after", earlier, [], "curator_interpreted", "high");
}

addConcept("research_thread", "rt_zotero_memory_corpus", "Zotero Agent Memory Corpus Timeline", "사용자가 지정한 9편을 publication/version metadata 순으로 엮은 검수된 연구 흐름.", {
  related: [link("rt_agentic_memory"), link("rt_multi_agent_memory"), link("rt_continual_agent_learning"), link("rt_automated_agent_design")],
  tags: ["zotero-local", "timeline", "reviewed-corpus"]
}, `## Timeline\n\n| Year | Paper | Shift in problem definition | Core mechanism | Open limitation |\n|---|---|---|---|---|\n| 2023 | ${link("pw_genagents")} | long-term believable behavior | memory–reflection–planning | retrieval, cost, robustness |\n| 2023 | ${link("pw_memgpt")} | fixed context as virtual-memory problem | paging and function control | retrieval and function-call dependence |\n| 2023 | ${link("pw_reflexion")} | trial feedback without weight update | verbal reflection memory | local minima and bounded memory |\n| 2024 | ${link("pw_memorybank")} | persistent personalized companion memory | summaries, portrait, forgetting | simplified cognitive model |\n| 2025 | ${link("pw_amem")} | rigid static organization | linked notes and memory evolution | model dependence, text-only |\n| 2025 | ${link("pw_gmemory")} | MAS collaboration memory | insight/query/interaction hierarchy | domain breadth and error amplification |\n| 2026 | ${link("pw_alma")} | handcrafted memory design | open-ended code-space meta-learning | offline learning and rollout cost |\n| 2026 | ${link("pw_adamem")} | static episode-level retrieval | intra-episode strategy refresh | strategy inertia, success-only memory |\n| 2026 | ${link("pw_evomas")} | handcrafted MAS architecture | configuration-space evolution | evolution cost, coordination scope |\n\n## Interpretation boundary\n\n이 표는 publication/version timestamp에 따른 기술적 이동을 요약한다. chronologically_after는 인과 또는 직접 계승을 뜻하지 않는다. 직접 비교·비판 관계는 별도 evidence-backed relation만 사용한다.\n\n## Shared benchmark map\n\n- ALFWorld: ${link("bu_adamem_alfworld")}, ${link("bu_gmemory_alfworld")}, ${link("bu_alma_alfworld")}, ${link("bu_reflexion_alfworld")}\n- HotpotQA: ${link("bu_adamem_hotpotqa")}, ${link("bu_gmemory_hotpotqa")}, ${link("bu_reflexion_hotpotqa")}\n- WebShop: ${link("bu_adamem_webshop")}, ${link("bu_reflexion_webshop")}\n\n같은 benchmark를 공유해도 protocol note와 comparability status를 먼저 확인한다.`);

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify({
  rationale: "Process nine user-selected Zotero papers into evidence-grounded PaperKG work/version/source, problem, method, benchmark-use, result, limitation, and typed-relation notes without external extraction APIs.",
  operations: notes
}, null, 2)}\n`, "utf8");

console.log(JSON.stringify({ outputPath, operations: notes.length, papers: papers.length, generatedIds: createdIds.size }, null, 2));

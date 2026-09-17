---
id: cn_memgpt
type: conclusion
schema_version: 0.2.0
title: MemGPT conclusion
aliases: []
curation_status: reviewed
evidence_refs:
  - '[[ev_memgpt_evaluation]]'
  - '[[ev_memgpt_limitation]]'
tags:
  - paper-conclusion
  - memgpt
preferred_label: MemGPT conclusion
alt_labels: []
broader: []
narrower: []
related: []
deprecated: false
paper_version: '[[pv_memgpt]]'
assertion_origin: author_stated
---

# MemGPT conclusion

## 정의

memory hierarchy와 control flow는 fixed-context LLM에 더 큰 context의 illusion을 제공한다. 실제 성능은 retrieval quality와 function-calling 능력에 의존하며 agent가 충분히 오래 pagination하지 않고 멈추기도 한다.

## 결론 요약

memory hierarchy와 control flow는 fixed-context LLM에 더 큰 context의 illusion을 제공한다. 실제 성능은 retrieval quality와 function-calling 능력에 의존하며 agent가 충분히 오래 pagination하지 않고 멈추기도 한다.

## 연결

- Paper: [[pv_memgpt]]
- Main result: [[rs_memgpt]]
- Limitations:
- [[lo_memgpt_retrieval_failure]] → [[li_retrieval_failure]] (curator_interpreted)
- [[lo_memgpt_function_calling]] → [[li_function_calling]] (curator_interpreted)

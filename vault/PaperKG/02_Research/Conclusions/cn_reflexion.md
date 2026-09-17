---
id: cn_reflexion
type: conclusion
schema_version: 0.2.0
title: Reflexion conclusion
aliases: []
curation_status: reviewed
evidence_refs:
  - '[[ev_reflexion_evaluation]]'
  - '[[ev_reflexion_limitation]]'
tags:
  - paper-conclusion
  - reflexion
preferred_label: Reflexion conclusion
alt_labels: []
broader: []
narrower: []
related: []
deprecated: false
paper_version: '[[pv_reflexion]]'
assertion_origin: author_stated
---

# Reflexion conclusion

## 정의

verbal reflection은 weight update 없이 실패 원인을 압축해 다음 시도에 재사용하지만 local minima, 작은 sliding memory, evaluator/test 품질 한계가 있다.

## 결론 요약

verbal reflection은 weight update 없이 실패 원인을 압축해 다음 시도에 재사용하지만 local minima, 작은 sliding memory, evaluator/test 품질 한계가 있다.

## 연결

- Paper: [[pv_reflexion]]
- Main result: [[rs_reflexion]]
- Limitations:
- [[lo_reflexion_local_minima]] → [[li_local_minima]] (author_stated)
- [[lo_reflexion_bounded_reflection_memory]] → [[li_bounded_reflection_memory]] (author_stated)
- [[lo_reflexion_test_quality]] → [[li_test_quality]] (author_stated)

// Register papers in Zotero and file them into the PaperKG facet collections.
//
// Run inside Zotero: Tools > Developer > Run JavaScript, tick "Run as async
// function", paste, Run. The local HTTP API (127.0.0.1:23119) is read-only
// even in Zotero 9 — POST returns "Endpoint does not support method" — so this
// window is the only local write path that needs no zotero.org API key.
//
// Idempotent: items are matched by exact title, attachments by title/URL,
// collections by name+parent. Re-running adds only what is missing.
//
// To reuse for a new paper: add an entry to PAPERS (metadata from the arXiv
// API, Drive cloud IDs from Drive Desktop's metadata_sqlite_db, see
// Zotero-Drive-Guard/generate-drive-link-map.mjs), then list its ref in ALL
// and in each GROUPS entry its method facets put it in. Collections mirror
// the vault's memory-taxonomy facets; values that nearly every paper shares
// (single_agent_memory, hand_crafted) deliberately get no collection.
//
// Executed 2026-09-29: created JJT9L6TB (Hu 2026, xMemory) and 3FMVZQY2
// (Jiang 2026, SYNAPSE) and the 9 collections under "PaperKG · Agentic Memory".
// PaperKG → Zotero: register Hu 2026 (xMemory) and Jiang 2026 (SYNAPSE), then build facet collections.
// Idempotent: existing items, attachments and collections are reused, never duplicated.
const BASE = 'C:\\Users\\user\\Documents\\PaperKG-Zotero-Attachments\\';
const LIB = Zotero.Libraries.userLibraryID;
const PAPERS = [{"ref": "XMEM", "type": "preprint", "title": "Beyond RAG for Agent Memory: Retrieval by Decoupling and Aggregation", "creators": [{"firstName": "Zhanghao", "lastName": "Hu", "creatorType": "author"}, {"firstName": "Qinglin", "lastName": "Zhu", "creatorType": "author"}, {"firstName": "Runcong", "lastName": "Zhao", "creatorType": "author"}, {"firstName": "Di", "lastName": "Liang", "creatorType": "author"}, {"firstName": "Hanqi", "lastName": "Yan", "creatorType": "author"}, {"firstName": "Yulan", "lastName": "He", "creatorType": "author"}, {"firstName": "Lin", "lastName": "Gui", "creatorType": "author"}], "date": "2026-02-02", "fields": {"DOI": "10.48550/arXiv.2602.02007", "url": "https://arxiv.org/abs/2602.02007", "archive": "arXiv", "archiveLocation": "2602.02007", "repository": "arXiv", "archiveID": "arXiv:2602.02007", "citationKey": "huBeyondRAGAgent2026", "abstractNote": "Standard Retrieval Augmented Generation (RAG) is poorly matched to agent memory. Unlike large heterogeneous corpora, agent memory forms a bounded and coherent interaction stream in which many spans are highly correlated or near duplicates. As a result, flat top-$k$ similarity retrieval often returns redundant context, while summary-centric hierarchies can blur the subtle details that distinguish one candidate from another. We argue that agent memory should follow the principle of decoupling before aggregation: the system should first isolate reusable facts, updates, and distinguishing details from similar histories, and only then organise them for efficient retrieval. Based on this principle, we propose xMemory, which constructs a revisable hierarchical memory structure from original messages to segments, memory components, and groups. xMemory segments interaction history into local events, decouples each segment into memory components, aggregates related components into high-level groups using a sparsity--semantic faithfulness objective, and maintains this structure incrementally as memory evolves. At inference time, xMemory retrieves top-down, first selecting a compact backbone of complementary groups and components, and then expanding to segments and raw messages only when additional evidence reduces the reader's uncertainty. Experiments on LoCoMo and PerLTQA across diverse open source and closed source LLMs show consistent gains in answer quality and inference token efficiency, supported by analyses of redundancy, evidence density, and coverage."}, "base": "Hu 등(2026), Beyond RAG for Agent Memory Retrieval by Decoupling and Aggregation", "drive": ["1aMFEP4-a28lgpJl32chpF0IXAbNAb7cT", "1DPCHpehksB3a-yF5gpNYp_XPsAbdIxiq", "1X6OapH_cgQRAsiFysmT5Gbb_AiG-vG2L"]}, {"ref": "SYN", "type": "conferencePaper", "title": "SYNAPSE: Empowering LLM Agents with Episodic-Semantic Memory via Spreading Activation", "creators": [{"firstName": "Hanqi", "lastName": "Jiang", "creatorType": "author"}, {"firstName": "Junhao", "lastName": "Chen", "creatorType": "author"}, {"firstName": "Yi", "lastName": "Pan", "creatorType": "author"}, {"firstName": "Ling", "lastName": "Chen", "creatorType": "author"}, {"firstName": "Weihang", "lastName": "You", "creatorType": "author"}, {"firstName": "Yifan", "lastName": "Zhou", "creatorType": "author"}, {"firstName": "Ruidong", "lastName": "Zhang", "creatorType": "author"}, {"firstName": "Andrea", "lastName": "Sikora", "creatorType": "author"}, {"firstName": "Lin", "lastName": "Zhao", "creatorType": "author"}, {"firstName": "Yohannes", "lastName": "Abate", "creatorType": "author"}, {"firstName": "Tianming", "lastName": "Liu", "creatorType": "author"}], "date": "2026", "fields": {"DOI": "10.48550/arXiv.2601.02744", "url": "https://aclanthology.org/2026.findings-acl.1108/", "proceedingsTitle": "Findings of the Association for Computational Linguistics: ACL 2026", "publisher": "Association for Computational Linguistics", "citationKey": "jiangSYNAPSEEmpoweringLLM2026", "extra": "arXiv: 2601.02744", "abstractNote": "While Large Language Models (LLMs) excel at generalized reasoning, standard retrieval-augmented approaches fail to address the disconnected nature of long-term agentic memory. To bridge this gap, we introduce Synapse (Synergistic Associative Processing Semantic Encoding), a unified memory architecture that transcends static vector similarity. Drawing from cognitive science, Synapse models memory as a dynamic graph where relevance emerges from spreading activation rather than pre-computed links. By integrating lateral inhibition and temporal decay, the system dynamically highlights relevant sub-graphs while filtering interference. We implement a Triple Hybrid Retrieval strategy that fuses geometric embeddings with activation-based graph traversal. Comprehensive evaluations on the LoCoMo benchmark show that Synapse significantly outperforms state-of-the-art methods in complex temporal and multi-hop reasoning tasks, offering a robust solution to the \"Contextual Tunneling\" problem. Our code and data will be made publicly available upon acceptance."}, "base": "Jiang 등(2026), SYNAPSE Empowering LLM Agents with Episodic-Semantic Memory via Spreading Act", "drive": ["1rqOaZQEEuh1SOL5YVTTW6CFKUfbU-6Tx", "1FAXzh6rWbuTiipigY6mQ5TVeKaFDushz", "1_NZmfBSHzaVJH8Hz4304-i3LyUJt1r0c"]}];
const GROUPS = [["기억 대상", "경험·궤적", ["XUL4UUCS", "AUC7Z35X", "EA27L9IM", "XBKDWLET", "XMEM", "SYN", "9D2Y8R6D", "EJPW4N6H"]], ["기억 대상", "지식·노트", ["AR3EJKD8", "EA27L9IM", "XMEM", "SYN"]], ["기억 대상", "전략·교훈", ["KQJ8BCZZ", "AUC7Z35X", "4K4DXIVE"]], ["기억 대상", "사용자·대화", ["GWKK3HCE", "M6AKVRGR"]], ["기억 대상", "컨텍스트 창 관리", ["SZMLQ5Q4"]], [null, "메모리 설계 자동화", ["GMHH5T2N", "XBKDWLET"]], [null, "멀티에이전트 공유 메모리", ["EA27L9IM", "XBKDWLET"]]];
const ALL = ["SZMLQ5Q4", "GWKK3HCE", "AR3EJKD8", "XUL4UUCS", "KQJ8BCZZ", "AUC7Z35X", "EA27L9IM", "XBKDWLET", "GMHH5T2N", "4K4DXIVE", "M6AKVRGR", "9D2Y8R6D", "EJPW4N6H", "XMEM", "SYN"];
const ROOT = 'PaperKG · Agentic Memory';
const SUFFIX = [['Original PDF',' - Original PDF.pdf'],
                ['Korean Translation PDF (DeepL)',' - Korean Translation PDF (DeepL).pdf'],
                ['Reading Dual PDF (EN-KO Alternating)',' - Reading Dual PDF (EN-KO Alternating).pdf']];
const out = [];

function setF(item, f, v) {
  const fid = Zotero.ItemFields.getID(f);
  if (fid && Zotero.ItemFields.isValidForType(fid, item.itemTypeID)) item.setField(f, v);
}
async function byTitle(title) {
  const s = new Zotero.Search(); s.libraryID = LIB; s.addCondition('title', 'is', title);
  const items = await Zotero.Items.getAsync(await s.search());
  return items.find(i => i.isRegularItem() && !i.deleted) || null;
}
async function collection(name, parent) {
  let c = Zotero.Collections.getByLibrary(LIB, true)
    .find(c => c.name === name && (c.parentID || null) === (parent ? parent.id : null) && !c.deleted);
  if (!c) { c = new Zotero.Collection(); c.libraryID = LIB; c.name = name;
            if (parent) c.parentID = parent.id; await c.saveTx(); out.push('+ 컬렉션 ' + name); }
  return c;
}

const ids = {};
for (const p of PAPERS) {
  let item = await byTitle(p.title);
  if (item) { out.push('= 기존 항목 재사용: ' + p.title.slice(0, 40)); }
  else {
    item = new Zotero.Item(p.type); item.libraryID = LIB;
    setF(item, 'title', p.title); setF(item, 'date', p.date);
    for (const [f, v] of Object.entries(p.fields)) setF(item, f, v);
    item.setCreators(p.creators);
    await item.saveTx();
    out.push('+ 항목 ' + item.key + ' ' + p.title.slice(0, 40));
  }
  ids[p.ref] = item;
  const have = Zotero.Items.get(item.getAttachments());
  for (let i = 0; i < 3; i++) {
    const [title, suf] = SUFFIX[i];
    if (!have.some(a => a.attachmentLinkMode === Zotero.Attachments.LINK_MODE_LINKED_FILE && a.getField('title') === title)) {
      await Zotero.Attachments.linkFromFile({ file: BASE + p.base + suf, parentItemID: item.id, title, contentType: 'application/pdf' });
      out.push('  + 파일 링크 ' + title);
    }
  }
  const driveHave = have.filter(a => a.attachmentLinkMode === Zotero.Attachments.LINK_MODE_LINKED_URL).map(a => a.getField('url'));
  for (const id of p.drive) {
    const url = 'https://drive.google.com/open?id=' + id;
    if (!driveHave.includes(url)) {
      await Zotero.Attachments.linkFromURL({ url, parentItemID: item.id, title: 'Google Drive에서 PDF 열기', contentType: 'application/pdf' });
      out.push('  + Drive 링크 ' + id.slice(0, 8));
    }
  }
}

async function resolve(ref) {
  if (ids[ref]) return ids[ref];
  const item = await Zotero.Items.getByLibraryAndKeyAsync(LIB, ref);
  if (!item) throw new Error('항목 키를 찾지 못함: ' + ref);
  return item;
}
async function fill(col, refs) {
  let added = 0;
  for (const ref of refs) {
    const item = await resolve(ref);
    if (!item.inCollection(col.id)) { item.addToCollection(col.id); await item.saveTx(); added++; }
  }
  out.push('  ' + col.name + ': ' + refs.length + '편 (' + added + ' 새로 추가)');
}

const root = await collection(ROOT, null);
await fill(root, ALL);
const groupCols = {};
for (const [group, name, refs] of GROUPS) {
  let parent = root;
  if (group) parent = groupCols[group] || (groupCols[group] = await collection(group, root));
  await fill(await collection(name, parent), refs);
}
return out.join('\n');

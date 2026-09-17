import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { App, FileSystemAdapter, ItemView, Notice, Plugin, PluginSettingTab, Setting, TFile, WorkspaceLeaf } from "obsidian";
import { createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import YAML from "yaml";
import { PaperKgApp, type ViewId, type WorkspaceActions, type WorkspaceData } from "./ui/App";

const VIEW_TYPE = "paperkg-research-workspace";
const RELATIONS_WITHOUT_REQUIRED_EVIDENCE = new Set(["chronologically_after", "is_version_of", "provides_evidence_for"]);

interface PaperKgSettings { vaultRoot: string; workspaceRoot: string; showEvidence: boolean; autoSyncMeetings: boolean; syncIntervalMinutes: number; }
const DEFAULT_SETTINGS: PaperKgSettings = { vaultRoot: "", workspaceRoot: "", showEvidence: false, autoSyncMeetings: true, syncIntervalMinutes: 15 };

export default class PaperKgPlugin extends Plugin {
  settings: PaperKgSettings = DEFAULT_SETTINGS;
  private initialView: ViewId = "overview";
  private syncInFlight: Promise<void> | undefined;

  async onload() {
    this.settings = { ...DEFAULT_SETTINGS, ...(await this.loadData() as Partial<PaperKgSettings> ?? {}) };
    this.registerView(VIEW_TYPE, (leaf) => new PaperKgWorkspaceView(leaf, this));
    this.addRibbonIcon("git-fork", "PaperKG 열기", () => void this.activate("overview"));
    this.addCommand({ id: "open-paperkg", name: "연구 지식망 열기", callback: () => void this.activate("overview") });
    this.addCommand({ id: "open-paperkg-benchmarks", name: "벤치마크 비교 열기", callback: () => void this.activate("benchmark") });
    this.addCommand({ id: "open-paperkg-evolution", name: "문제 변화 열기", callback: () => void this.activate("evolution") });
    this.addCommand({ id: "open-paperkg-versions", name: "버전 비교 열기", callback: () => void this.activate("versions") });
    this.addCommand({ id: "sync-paperkg-meetings", name: "원격 회의 후보 지금 동기화", callback: () => void this.syncMeetingCandidates(false) });
    this.addSettingTab(new PaperKgSettingTab(this.app, this));
    this.app.workspace.onLayoutReady(() => {
      if (this.settings.autoSyncMeetings) void this.syncMeetingCandidates(true);
    });
    this.registerInterval(window.setInterval(() => {
      if (this.settings.autoSyncMeetings) void this.syncMeetingCandidates(true);
    }, Math.max(5, this.settings.syncIntervalMinutes) * 60_000));
  }

  async onunload() { this.app.workspace.detachLeavesOfType(VIEW_TYPE); }

  private async activate(view: ViewId) {
    this.initialView = view;
    let leaf = this.app.workspace.getLeavesOfType(VIEW_TYPE)[0];
    if (!leaf) { leaf = this.app.workspace.getLeaf("tab"); await leaf.setViewState({ type: VIEW_TYPE, active: true }); }
    this.app.workspace.revealLeaf(leaf);
  }

  getInitialView() { return this.initialView; }
  async saveSettings() { await this.saveData(this.settings); }

  private resolveWorkspaceRoot(): string {
    if (this.settings.workspaceRoot.trim()) return path.resolve(this.settings.workspaceRoot.trim());
    if (!(this.app.vault.adapter instanceof FileSystemAdapter)) throw new Error("회의 자동 동기화는 데스크톱 Obsidian에서만 지원됩니다.");
    const vaultPath = path.resolve(this.app.vault.adapter.getBasePath());
    const candidate = path.basename(vaultPath).toLowerCase() === "paperkg" && path.basename(path.dirname(vaultPath)).toLowerCase() === "vault"
      ? path.resolve(vaultPath, "..", "..")
      : vaultPath;
    if (!existsSync(path.join(candidate, "scripts", "pull-paperkg-meeting-candidates.ps1"))) {
      throw new Error("PaperKG 작업공간을 자동으로 찾지 못했습니다. 설정에서 작업공간 경로를 지정하세요.");
    }
    return candidate;
  }

  async syncMeetingCandidates(silent: boolean): Promise<void> {
    if (this.syncInFlight) return this.syncInFlight;
    this.syncInFlight = (async () => {
      const workspaceRoot = this.resolveWorkspaceRoot();
      const script = path.join(workspaceRoot, "scripts", "pull-paperkg-meeting-candidates.ps1");
      const output = await new Promise<string>((resolve, reject) => {
        const child = spawn("powershell.exe", ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", script], {
          cwd: workspaceRoot,
          windowsHide: true,
          stdio: ["ignore", "pipe", "pipe"],
        });
        let combined = "";
        const append = (chunk: Buffer) => { combined = `${combined}${chunk.toString("utf8")}`.slice(-32_000); };
        child.stdout.on("data", append);
        child.stderr.on("data", append);
        const timeout = window.setTimeout(() => { child.kill(); reject(new Error("회의 동기화가 2분 안에 끝나지 않았습니다.")); }, 120_000);
        child.once("error", (error) => { window.clearTimeout(timeout); reject(error); });
        child.once("exit", (code) => {
          window.clearTimeout(timeout);
          if (code === 0) resolve(combined);
          else reject(new Error(combined.trim() || `회의 동기화가 종료 코드 ${code ?? "unknown"}로 실패했습니다.`));
        });
      });
      await Promise.all(this.app.workspace.getLeavesOfType(VIEW_TYPE).map((leaf) => leaf.view instanceof PaperKgWorkspaceView ? leaf.view.refreshFromPlugin() : undefined));
      if (!silent || output.includes("Synced candidate:")) new Notice(output.includes("Synced candidate:") ? "회의 지식 후보를 동기화했습니다." : "새 회의 후보가 없습니다.");
    })().catch((error: unknown) => {
      if (!silent) new Notice(`회의 동기화 실패: ${error instanceof Error ? error.message : String(error)}`, 8000);
    }).finally(() => { this.syncInFlight = undefined; });
    return this.syncInFlight;
  }
}

class PaperKgWorkspaceView extends ItemView {
  private root?: Root;
  private data?: WorkspaceData;
  private lastLoadedAt = "";
  private loadError: string | undefined;
  private refreshTimer?: number;
  private readonly actions: WorkspaceActions;
  constructor(leaf: WorkspaceLeaf, private readonly plugin: PaperKgPlugin) {
    super(leaf);
    this.actions = {
      approveProposal: async (id) => { await approveProposal(this.app, id); await this.refresh(); },
      rejectProposal: async (id) => { await rejectProposal(this.app, id); await this.refresh(); },
      openNote: async (id) => openNoteById(this.app, id),
      refresh: async () => this.refresh(),
      syncMeetings: async () => this.plugin.syncMeetingCandidates(false)
    };
  }
  getViewType() { return VIEW_TYPE; }
  getDisplayText() { return "PaperKG"; }
  getIcon() { return "git-fork"; }

  async onOpen() {
    this.contentEl.empty();
    this.contentEl.addClass("paperkg-host");
    this.root = createRoot(this.contentEl);
    this.contentEl.createDiv({ cls: "pkg-loading", text: "PaperKG 정본을 읽는 중…" });
    await this.refresh();
    const schedule = (file?: { path: string }) => {
      if (file && !/\.(md|json)$/.test(file.path)) return;
      if (this.refreshTimer !== undefined) window.clearTimeout(this.refreshTimer);
      this.refreshTimer = window.setTimeout(() => void this.refresh(), 350);
    };
    this.registerEvent(this.app.vault.on("create", schedule));
    this.registerEvent(this.app.vault.on("modify", schedule));
    this.registerEvent(this.app.vault.on("delete", schedule));
    this.registerEvent(this.app.vault.on("rename", schedule));
  }

  private async refresh() {
    try {
      this.data = await loadWorkspaceData(this.app);
      this.lastLoadedAt = new Date().toISOString();
      this.loadError = undefined;
    } catch (error) {
      this.loadError = error instanceof Error ? error.message : "알 수 없는 읽기 오류";
    }
    if (this.data) {
      this.contentEl.querySelector(".pkg-loading")?.remove();
      this.root?.render(createElement(PaperKgApp, { data: this.data, actions: this.actions, initialView: this.plugin.getInitialView(), initialEvidenceOpen: this.plugin.settings.showEvidence, lastLoadedAt: this.lastLoadedAt, loadError: this.loadError }));
    }
  }

  async refreshFromPlugin() { await this.refresh(); }

  async onClose() {
    if (this.refreshTimer !== undefined) window.clearTimeout(this.refreshTimer);
    this.root?.unmount();
  }
}

function text(value: unknown, fallback = "—"): string {
  if (value === undefined || value === null || value === "") return fallback;
  return String(value).replace(/^\[\[/, "").replace(/\]\]$/, "");
}

function array(value: unknown): string[] { return Array.isArray(value) ? value.map((item) => text(item, "")) : []; }

async function loadWorkspaceData(app: App): Promise<WorkspaceData> {
  const files = app.vault.getMarkdownFiles().filter((file) => !/^(00_System|09_Views|10_Inbox)\//.test(file.path));
  const records = files.map((file) => ({ file, fm: app.metadataCache.getFileCache(file)?.frontmatter as Record<string, unknown> | undefined })).filter((record) => record.fm?.id && record.fm?.type);
  if (records.length === 0) {
    return { noteCount: 0, papers: [], relations: [], benchmarks: [], evolution: [], evidence: [], proposals: await loadProposals(app), quality: [], limitations: [], gaps: [], versionDiffs: [], meetingSync: await loadMeetingSync(app) };
  }
  const titleById = new Map(records.map(({ fm }) => [text(fm!.id), text(fm!.title)]));
  const frontmatterById = new Map(records.map(({ fm }) => [text(fm!.id), fm!]));
  const benchmarkUseRecords = records.filter(({ fm }) => fm!.type === "benchmark_use");
  const comparisonRecords = records.filter(({ fm }) => fm!.type === "comparison_assessment");
  const resultRowsByUse = new Map<string, string[]>();
  await Promise.all(records.filter(({ fm }) => fm!.type === "result_set").map(async ({ file }) => {
    const source = await app.vault.cachedRead(file);
    for (const match of source.matchAll(/```paperkg-resultset\s*\r?\n([\s\S]*?)```/g)) {
      try {
        const block = YAML.parse(match[1] ?? "") as { rows?: Array<Record<string, unknown>> };
        for (const row of block.rows ?? []) {
          const use = text(row.benchmark_use, "");
          if (!use) continue;
          const description = text(row.value_text, text(row.value, "결과 기록"));
          resultRowsByUse.set(use, [...(resultRowsByUse.get(use) ?? []), `${text(row.system)}: ${description}`]);
        }
      } catch { /* CLI validation reports malformed structured result blocks. */ }
    }
  }));
  const evidence = records.filter(({ fm }) => fm!.type === "evidence").map(({ fm }) => ({
    id: text(fm!.id), source: text(fm!.source_version), version: text(fm!.source_version), location: text(fm!.location), predicate: "supports",
    target: array(fm!.supports).join(", "), summary: text(fm!.summary), origin: text(fm!.assertion_origin, "author_stated"), status: text(fm!.curation_status), confidence: "medium" as const
  }));
  const firstEvidenceId = (fm: Record<string, unknown>) => {
    const direct = array(fm.evidence_refs)[0];
    if (direct && evidence.some((item) => item.id === direct)) return direct;
    const supported = evidence.find((item) => item.target.split(", ").includes(text(fm.id)));
    return supported?.id;
  };
  const comparabilityLabel = (value: string) => ({ exact: "Exact", partial: "Partial", not_comparable: "Not comparable", unknown: "Unknown" } as const)[value as "exact" | "partial" | "not_comparable" | "unknown"] ?? "Unknown";
  const papers = records.filter(({ fm }) => fm!.type === "paper_work").map(({ fm }) => {
    const versionIds = new Set(array(fm!.versions).map((value) => text(value)));
    const uses = benchmarkUseRecords.filter(({ fm: use }) => versionIds.has(text(use!.paper_version)));
    const benchmarkNames = [...new Set(uses.map(({ fm: use }) => titleById.get(text(use!.benchmark)) ?? text(use!.benchmark)))];
    const states = uses.map(({ fm: use }) => comparabilityLabel(text(use!.comparability_status, "unknown")));
    const comparability: WorkspaceData["papers"][number]["comparability"] = states.includes("Not comparable") ? "Not comparable" : states.includes("Partial") ? "Partial" : states.length > 0 && states.every((state) => state === "Exact") ? "Exact" : "Unknown";
    const framing = records.find(({ fm: candidate }) => candidate!.type === "problem_framing" && versionIds.has(text(candidate!.paper_version)))?.fm;
    const method = records.find(({ fm: candidate }) => candidate!.type === "method" && versionIds.has(text(candidate!.introduced_by)))?.fm;
    return {
      id: text(fm!.id), title: text(fm!.title), venue: titleById.get(text(fm!.venue_event)) ?? text(fm!.venue_event),
      problem: framing ? titleById.get(text(framing.problem)) ?? text(framing.problem) : "연결 안 됨",
      method: method ? titleById.get(text(method.id)) ?? text(method.title) : "연결 안 됨", benchmarks: benchmarkNames.join(", ") || "—",
      comparability, reviewed: ["reviewed", "verified"].includes(text(fm!.curation_status, "")), evidenceId: firstEvidenceId(fm!)
    };
  });
  const relations = records.filter(({ fm }) => fm!.type === "relation").map(({ fm }) => ({
    id: text(fm!.id), year: text(fm!.valid_from).slice(0, 4), predicate: text(fm!.predicate), statement: text(fm!.title),
    source: titleById.get(text(fm!.subject)) ?? text(fm!.subject), target: titleById.get(text(fm!.object)) ?? text(fm!.object), evidenceId: firstEvidenceId(fm!)
  }));
  const benchmarks = records.filter(({ fm }) => fm!.type === "benchmark_use").map(({ fm }) => {
    const id = text(fm!.id);
    const assessments = comparisonRecords.filter(({ fm: assessment }) => [text(assessment!.left_use), text(assessment!.right_use)].includes(id));
    const assessmentStates = assessments.map(({ fm: assessment }) => comparabilityLabel(text(assessment!.comparability_status)));
    const comparability = assessmentStates.includes("Not comparable") ? "Not comparable" : assessmentStates.includes("Partial") ? "Partial" : assessmentStates.length > 0 && assessmentStates.every((state) => state === "Exact") ? "Exact" : comparabilityLabel(text(fm!.comparability_status, "unknown"));
    return {
      paper: (() => { const version = frontmatterById.get(text(fm!.paper_version)); return version ? titleById.get(text(version.work)) ?? text(version.work) : text(fm!.paper_version); })(),
      version: (() => { const version = frontmatterById.get(text(fm!.paper_version)); return version ? text(version.version_label) : text(fm!.dataset_version); })(),
      purpose: text(fm!.purpose), split: array(fm!.splits).join(", "),
      protocol: array(fm!.protocols).map((value) => titleById.get(value) ?? value).join(", "), metric: array(fm!.metrics).map((value) => titleById.get(value) ?? value).join(", "),
      baseline: array(fm!.baseline_set).map((value) => titleById.get(value) ?? value).join(", ") || "기준선 미기록",
      result: (resultRowsByUse.get(id) ?? []).slice(0, 3).join(" · ") || "구조화 결과 없음",
      configuration: text(fm!.configuration_completeness, "미확인") === "complete" ? "완전" : text(fm!.configuration_completeness, "미확인") === "partial" ? "부분 기록" : "정보 부족",
      pairwise: assessments.length > 0 ? assessments.map(({ fm: assessment }) => `${comparabilityLabel(text(assessment!.comparability_status))}: ${array(assessment!.differing_fields).join(", ")}`).join(" · ") : "공유 사용 없음",
      comparability, evidenceId: firstEvidenceId(fm!)
    };
  });
  const framings = records.filter(({ fm }) => fm!.type === "problem_framing");
  const evolution = framings.map(({ fm }) => {
    const version = frontmatterById.get(text(fm!.paper_version));
    const workId = version ? text(version.work) : "";
    return {
      id: text(fm!.id), date: version ? text(version.released_at, "날짜 미상") : "날짜 미상",
      title: titleById.get(workId) ?? titleById.get(text(fm!.paper_version)) ?? text(fm!.paper_version),
      version: version ? text(version.version_label) : "", summary: text(fm!.framing_summary), evidenceId: firstEvidenceId(fm!)
    };
  }).sort((left, right) => left.date.localeCompare(right.date));
  const proposals = await loadProposals(app);
  const ids = new Set<string>();
  const quality = records.flatMap(({ fm, file }) => {
    const id = text(fm!.id); const issues = [];
    if (ids.has(id)) issues.push({ id: `duplicate-${id}`, severity: "Error" as const, code: "duplicate_id", note: file.path, message: `Duplicate ID ${id}` });
    ids.add(id);
    const predicate = text(fm!.predicate, "");
    const evidenceRequired = predicate !== "" && !RELATIONS_WITHOUT_REQUIRED_EVIDENCE.has(predicate);
    if (fm!.type === "relation" && evidenceRequired && array(fm!.evidence_refs).length === 0) issues.push({ id: `evidence-${id}`, severity: "Error" as const, code: "relation_missing_evidence", note: file.path, message: "Typed relation has no evidence reference." });
    if (fm!.type === "benchmark_use" && array(fm!.baseline_set).length === 0) issues.push({ id: `baseline-${id}`, severity: "Warning" as const, code: "benchmark_baselines_missing", note: file.path, message: "비교 기준선이 기록되지 않았습니다." });
    if (fm!.type === "result_set" && !resultRowsByUse.size) issues.push({ id: `rows-${id}`, severity: "Warning" as const, code: "result_rows_missing", note: file.path, message: "구조화된 결과 행이 없습니다." });
    return issues;
  });
  const occurrences = records.filter(({ fm }) => fm!.type === "limitation_occurrence");
  const limitations = records.filter(({ fm }) => fm!.type === "limitation").map(({ fm }) => {
    const id = text(fm!.id);
    const linked = occurrences.filter(({ fm: occurrence }) => text(occurrence!.limitation) === id);
    return {
      id, title: text(fm!.title), occurrences: linked.length,
      scopes: [...new Set(linked.map(({ fm: occurrence }) => text(occurrence!.scope, "")).filter(Boolean))],
      origins: [...new Set(linked.map(({ fm: occurrence }) => text(occurrence!.assertion_origin, "")).filter(Boolean))]
    };
  });
  const gaps = records.filter(({ fm }) => fm!.type === "research_idea").map(({ fm }) => ({
    id: text(fm!.id), kind: "Research idea", title: text(fm!.title), summary: text(fm!.reasoning_summary), status: text(fm!.idea_status)
  }));
  const works = new Map(records.filter(({ fm }) => fm!.type === "paper_work").map(({ fm }) => [text(fm!.id), text(fm!.title)]));
  const versionGroups = new Map<string, Array<Record<string, unknown>>>();
  for (const { fm } of records.filter(({ fm }) => fm!.type === "paper_version")) {
    const work = text(fm!.work);
    versionGroups.set(work, [...(versionGroups.get(work) ?? []), fm!]);
  }
  const ignoredDiffFields = new Set(["id", "type", "schema_version", "title", "aliases", "curation_status", "work", "version_label", "created_at", "updated_at"]);
  const versionDiffs = [...versionGroups.entries()].flatMap(([work, versions]) => {
    const ordered = versions.sort((left, right) => text(left.released_at).localeCompare(text(right.released_at)));
    return ordered.slice(1).map((right, index) => {
      const left = ordered[index]!;
      const keys = new Set([...Object.keys(left), ...Object.keys(right)]);
      const changedFields = [...keys].filter((key) => !ignoredDiffFields.has(key) && JSON.stringify(left[key]) !== JSON.stringify(right[key]));
      return { id: `${text(left.id)}-${text(right.id)}`, paper: works.get(work) ?? work, left: text(left.version_label), right: text(right.version_label), changedFields };
    });
  });
  return { noteCount: records.length, papers, relations, benchmarks, evolution, evidence, proposals, quality, limitations, gaps, versionDiffs, meetingSync: await loadMeetingSync(app) };
}

async function loadMeetingSync(app: App): Promise<WorkspaceData["meetingSync"]> {
  const directory = ".paperkg/meeting-sync";
  if (!(await app.vault.adapter.exists(directory))) return [];
  const listing = await app.vault.adapter.list(directory);
  const states = [];
  for (const file of listing.files.filter((file) => /\/mi_[a-f0-9]{32}\.json$/.test(file))) {
    try {
      const state = JSON.parse(await app.vault.adapter.read(file)) as WorkspaceData["meetingSync"][number];
      if (/^mi_[a-f0-9]{32}$/.test(state.receiptId) && ["needs_review", "promoted"].includes(state.status)) states.push(state);
    } catch { /* Corrupt state is reported by the CLI; do not break the dashboard. */ }
  }
  return states.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

async function loadProposals(app: App) {
  const files = app.vault.getFiles().filter((file) => file.path.startsWith("10_Inbox/Proposals/") && file.extension === "json");
  const proposals = [];
  for (const file of files) {
    try {
      const value = JSON.parse(await app.vault.cachedRead(file)) as Record<string, unknown>;
      const status = text(value.status, "candidate");
      if (status !== "candidate" && status !== "inbox") continue;
      const rationale = text(value.rationale, "PaperKG proposal");
      const title = rationale.startsWith("Process nine user-selected Zotero papers")
        ? "선택한 Zotero 논문 9편을 근거 기반 PaperKG 노트로 정리하는 변경안입니다. 외부 논문 추출 API는 사용하지 않습니다."
        : rationale;
      proposals.push({ id: text(value.id), kind: text(value.kind, "Patch"), title, files: Array.isArray(value.operations) ? value.operations.length : 0, createdAt: text(value.createdAt), status });
    } catch { /* Invalid proposal appears in CLI validation instead. */ }
  }
  return proposals;
}

async function proposalFile(app: App, id: string): Promise<TFile> {
  const file = app.vault.getAbstractFileByPath(`10_Inbox/Proposals/${id}.json`);
  if (!(file instanceof TFile)) throw new Error(`변경안을 찾을 수 없습니다: ${id}`);
  return file;
}

async function approveProposal(app: App, id: string) {
  const file = await proposalFile(app, id);
  const proposal = JSON.parse(await app.vault.cachedRead(file)) as Record<string, unknown>;
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  const token = btoa(String.fromCharCode(...bytes)).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  const tokenHash = [...new Uint8Array(digest)].map((value) => value.toString(16).padStart(2, "0")).join("");
  const directory = ".paperkg/approvals";
  if (!(await app.vault.adapter.exists(".paperkg"))) await app.vault.adapter.mkdir(".paperkg");
  if (!(await app.vault.adapter.exists(directory))) await app.vault.adapter.mkdir(directory);
  await app.vault.adapter.write(`${directory}/${id}.json`, JSON.stringify({ proposalId: id, proposalHash: proposal.contentHash, tokenHash, expiresAt: new Date(Date.now() + 15 * 60_000).toISOString(), used: false }, null, 2));
  proposal.status = "approved";
  await app.vault.modify(file, `${JSON.stringify(proposal, null, 2)}\n`);
  await navigator.clipboard.writeText(token);
  new Notice("변경안을 승인했습니다. 15분 동안 한 번만 사용할 수 있는 적용 토큰을 클립보드에 복사했습니다.", 8000);
}

async function rejectProposal(app: App, id: string) {
  const file = await proposalFile(app, id);
  const proposal = JSON.parse(await app.vault.cachedRead(file)) as Record<string, unknown>;
  proposal.status = "rejected";
  await app.vault.modify(file, `${JSON.stringify(proposal, null, 2)}\n`);
  new Notice("변경안을 거절했습니다.");
}

async function openNoteById(app: App, id: string) {
  const file = app.vault.getMarkdownFiles().find((candidate) => app.metadataCache.getFileCache(candidate)?.frontmatter?.id === id);
  if (file) await app.workspace.getLeaf("tab").openFile(file);
}

class PaperKgSettingTab extends PluginSettingTab {
  constructor(app: App, private readonly plugin: PaperKgPlugin) { super(app, plugin); }
  display() {
    this.containerEl.empty();
    new Setting(this.containerEl).setName("PaperKG 루트 경로").setDesc("현재 Obsidian vault가 PaperKG라면 비워 두세요.").addText((control) => control.setValue(this.plugin.settings.vaultRoot).onChange(async (value) => { this.plugin.settings.vaultRoot = value; await this.plugin.saveSettings(); }));
    new Setting(this.containerEl).setName("PaperKG 작업공간 경로").setDesc("자동 감지가 안 될 때만 입력하세요. 예: C:\\Users\\user\\Documents\\knowloge graph").addText((control) => control.setValue(this.plugin.settings.workspaceRoot).onChange(async (value) => { this.plugin.settings.workspaceRoot = value; await this.plugin.saveSettings(); }));
    new Setting(this.containerEl).setName("회의 후보 자동 동기화").setDesc("Obsidian 시작 시와 설정한 간격마다 원격 후보를 안전하게 가져옵니다. 정본 반영은 자동으로 하지 않습니다.").addToggle((control) => control.setValue(this.plugin.settings.autoSyncMeetings).onChange(async (value) => { this.plugin.settings.autoSyncMeetings = value; await this.plugin.saveSettings(); }));
    new Setting(this.containerEl).setName("회의 동기화 간격(분)").setDesc("최소 5분입니다. 개인 사용에는 15분을 권장합니다.").addText((control) => control.setValue(String(this.plugin.settings.syncIntervalMinutes)).onChange(async (value) => { const parsed = Number.parseInt(value, 10); if (Number.isFinite(parsed)) { this.plugin.settings.syncIntervalMinutes = Math.max(5, parsed); await this.plugin.saveSettings(); } }));
    new Setting(this.containerEl).setName("시작할 때 근거 패널 표시").setDesc("끄면 넓은 표를 먼저 보고, 필요할 때 상단의 ‘근거 보기’를 누를 수 있습니다.").addToggle((control) => control.setValue(this.plugin.settings.showEvidence).onChange(async (value) => { this.plugin.settings.showEvidence = value; await this.plugin.saveSettings(); }));
  }
}

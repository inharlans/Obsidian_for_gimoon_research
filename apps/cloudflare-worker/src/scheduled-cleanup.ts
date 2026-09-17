export interface ScheduledCleanupTask {
  name: string;
  run: () => Promise<unknown>;
}

export async function runScheduledCleanup(tasks: readonly ScheduledCleanupTask[]): Promise<void> {
  const results = await Promise.allSettled(tasks.map((task) => task.run()));
  for (const [index, result] of results.entries()) {
    const task = tasks[index]!;
    if (result.status === "fulfilled") {
      console.info(JSON.stringify({ event: "scheduled_cleanup", task: task.name, outcome: "ok" }));
      continue;
    }
    console.error(JSON.stringify({
      event: "scheduled_cleanup",
      task: task.name,
      outcome: "failed",
      error_name: result.reason instanceof Error ? result.reason.name : "unknown",
    }));
  }
}

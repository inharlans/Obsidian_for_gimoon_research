import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { PaperKgApp, sampleWorkspaceData } from "../../obsidian-plugin/src/ui/App";
import "../../obsidian-plugin/styles.css";
import "./preview.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode><PaperKgApp data={sampleWorkspaceData}/></StrictMode>
);


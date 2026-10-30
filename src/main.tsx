import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./styles.css";
import "./workflow/workflow.css";
function BrowserApp() {
  useEffect(() => {
    if (window.location.hash) {
      requestAnimationFrame(() =>
        document
          .getElementById(decodeURIComponent(window.location.hash.slice(1)))
          ?.scrollIntoView({ behavior: "instant" }),
      );
    }
  }, []);
  return (
    <App path={window.location.pathname} search={window.location.search} />
  );
}
createRoot(document.getElementById("root")!).render(<BrowserApp />);

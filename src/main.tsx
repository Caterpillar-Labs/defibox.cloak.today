import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { ChainMetadataProvider } from "./providers/ChainMetadataProvider";
import { LanguageProvider } from "./providers/LanguageProvider";
import { initTheme } from "./lib/theme";
import "./styles.css";

initTheme();

const root = createRoot(document.getElementById("root")!);
root.render(
  <React.StrictMode>
    <LanguageProvider>
      <ChainMetadataProvider>
        <App />
      </ChainMetadataProvider>
    </LanguageProvider>
  </React.StrictMode>,
);

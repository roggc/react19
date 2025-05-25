import { use } from "react";
import { createFromFetch } from "react-server-dom-webpack/client";
import { createRoot } from "react-dom/client";

const domElement = document.getElementById("root");
if (!domElement) {
  throw new Error("Root element not found");
}

const cache = new Map();

function Root() {
  let content = cache.get("app");
  if (!content) {
    // Fetch the RSC payload from the server
    content = createFromFetch(fetch("/rsc_payload"));
    cache.set("app", content);
  }

  return <>{use(content)}</>;
}

// Render the app
const root = createRoot(domElement);
root.render(<Root />);

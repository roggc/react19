import { use } from "react";
import { createFromFetch } from "react-server-dom-webpack/client";
import { createRoot } from "react-dom/client";

const domElement = document.getElementById("root");
if (!domElement) {
  throw new Error("Root element not found");
}
const root = createRoot(domElement);
root.render(<Root />);

const cache = new Map();

function Root() {
  let content = cache.get("home");
  if (!content) {
    content = createFromFetch(fetch("/react"));
    cache.set("home", content);
  }

  return <>{use(content)}</>;
}

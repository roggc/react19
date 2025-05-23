import { use } from "react";
import {
  createFromFetch,
  createFromReadableStream,
} from "react-server-dom-webpack/client";
import { createRoot } from "react-dom/client";

const domElement = document.getElementById("root");
if (!domElement) {
  throw new Error("Root element not found");
}

const cache = new Map();

function Root() {
  let content = cache.get("app");
  if (!content) {
    if (window.__RSC_PAYLOAD) {
      try {
        const response = new Response(
          new ReadableStream({
            start(controller) {
              controller.enqueue(
                new TextEncoder().encode(window.__RSC_PAYLOAD)
              );
              controller.close();
            },
          })
        );
        content = createFromReadableStream(response.body);
      } catch (error) {
        console.error("Error parsing RSC payload:", error);
        content = createFromFetch(fetch("/____react____"));
      }
    } else {
      content = createFromFetch(fetch("/____react____"));
    }
    cache.set("app", content);
  }

  return <>{use(content)}</>;
}

// Render the app
const root = createRoot(domElement);
root.render(<Root />);

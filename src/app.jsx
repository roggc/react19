"use client";

import serverFunction from "./server-function";
import { Suspense, useEffect, useState } from "react";

export default function () {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log("rendered");
  }, []);

  return (
    <>
      <button onClick={() => setCount((c) => c + 1)}>Increment</button>
      {count}

      <Suspense fallback="Loading...">{serverFunction()}</Suspense>
    </>
  );
}

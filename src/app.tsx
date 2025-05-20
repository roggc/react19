"use client";

import serverFunction from "./server-function";
import { Suspense, useEffect, useState } from "react";

export default function App() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    console.log("rendered");
  }, []);

  return (
    <>
      <h1>Hello you!</h1>
      <button onClick={() => setCount(count + 1)}>{count}</button>
      <Suspense fallback="Loading...">{serverFunction()}</Suspense>
    </>
  );
}

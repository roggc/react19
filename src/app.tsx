"use client";

import serverFunction from "./server-function";
import { Suspense, useEffect, useState } from "react";

export default function App() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    console.log("yahooo");
  }, []);

  return (
    <>
      <h1>Hello you!!!!!</h1>
      <button onClick={() => setCount(count + 1)}>{count}</button>lf
      <Suspense fallback="Loading...">{serverFunction()}</Suspense>
    </>
  );
}

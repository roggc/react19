"use client";

import serverFunction from "./server-function";
import { Suspense } from "react";

export default function () {
  return <Suspense fallback="Loading...">{serverFunction()}</Suspense>;
}

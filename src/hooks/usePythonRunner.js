import { useState, useEffect } from "react";
import { subscribeStatus } from "../lib/pythonRunner";

// Exposes the Python runtime status: idle | loading | ready | error.
export function usePythonStatus() {
  const [status, setStatus] = useState("idle");
  useEffect(() => subscribeStatus(setStatus), []);
  return status;
}

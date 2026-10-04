import { PY_HARNESS, PYODIDE_CDN, runInPyodide } from "../lib/pyHarness";

let pyodideReady = null;

function getPyodide() {
  if (!pyodideReady) {
    pyodideReady = (async () => {
      const { loadPyodide } = await import(/* @vite-ignore */ `${PYODIDE_CDN}pyodide.mjs`);
      const py = await loadPyodide({ indexURL: PYODIDE_CDN });
      await py.runPythonAsync(PY_HARNESS);
      return py;
    })();
    pyodideReady.catch(() => {
      pyodideReady = null;
    });
  }
  return pyodideReady;
}

self.onmessage = async ({ data }) => {
  const { id, type } = data;
  try {
    if (type === "warmup") {
      await getPyodide();
      self.postMessage({ id, type: "ready" });
      return;
    }
    const py = await getPyodide();
    self.postMessage({ id, type: "started" });
    const result = await runInPyodide(py, data.payload);
    self.postMessage({ id, type: "result", result });
  } catch (err) {
    self.postMessage({
      id,
      type: "fatal",
      message: err?.message || "Failed to load the Python runtime. Check your connection and try again.",
    });
  }
};

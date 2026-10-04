// Main-thread client for the Pyodide worker. Code runs off the UI thread, and
// a run that exceeds the time limit (e.g. an infinite loop) kills the worker.

export const RUN_TIMEOUT_MS = 10000;

let worker = null;
let nextId = 1;
const listeners = new Set();
let status = "idle"; // idle | loading | ready | error

function setStatus(s) {
  status = s;
  listeners.forEach((fn) => fn(s));
}

export function subscribeStatus(fn) {
  listeners.add(fn);
  fn(status);
  return () => listeners.delete(fn);
}

function getWorker() {
  if (!worker) {
    worker = new Worker(new URL("../workers/pyodide.worker.js", import.meta.url), {
      type: "module",
    });
  }
  return worker;
}

function request(type, payload, { timeoutMs } = {}) {
  const w = getWorker();
  const id = nextId++;
  return new Promise((resolve, reject) => {
    let timer = null;
    const cleanup = () => {
      clearTimeout(timer);
      w.removeEventListener("message", onMessage);
      w.removeEventListener("error", onError);
    };
    const onMessage = ({ data }) => {
      if (data.id !== id) return;
      if (data.type === "started") {
        setStatus("ready");
        // The clock only starts once Python is loaded and running user code.
        if (timeoutMs) {
          timer = setTimeout(() => {
            cleanup();
            w.terminate();
            worker = null;
            setStatus("idle");
            resolve({
              ok: false,
              phase: "solution.py",
              stdout: "",
              error: `TimeoutError: your code ran for more than ${timeoutMs / 1000} seconds and was stopped.\nCheck for an infinite loop (e.g. 'while True' without a break).`,
            });
          }, timeoutMs);
        }
        return;
      }
      cleanup();
      if (data.type === "fatal") {
        setStatus("error");
        reject(new Error(data.message));
      } else {
        setStatus("ready");
        resolve(data.result ?? null);
      }
    };
    const onError = (e) => {
      cleanup();
      setStatus("error");
      reject(new Error(e.message || "Python worker crashed"));
    };
    w.addEventListener("message", onMessage);
    w.addEventListener("error", onError);
    if (status !== "ready") setStatus("loading");
    w.postMessage({ id, type, payload });
  });
}

export function runPython({ setup = "", code, tests = "", runTests = false }) {
  return request("run", { setup, code, tests, runTests }, { timeoutMs: RUN_TIMEOUT_MS });
}

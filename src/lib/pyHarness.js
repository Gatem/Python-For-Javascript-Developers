// Python-side harness shared by the browser worker and the exercise test suite.
// It runs (setup -> user code -> hidden tests) in one namespace, captures stdout,
// and reports errors with tracebacks trimmed to the learner's own code.

export const PYODIDE_VERSION = "314.0.7";
export const PYODIDE_CDN = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;
export const USER_FILENAME = "solution.py";

export const PY_HARNESS = String.raw`
import ast, asyncio, builtins, contextlib, io, os, sys, tempfile, traceback

_USER_FILE = "solution.py"
_TESTS_FILE = "tests.py"
_SETUP_FILE = "setup.py"
_BASE_CWD = os.getcwd()
_run_state = {"dir": None}


def _no_input(*args, **kwargs):
    raise RuntimeError("input() is not available in the browser runner. Hard-code the value instead.")


def _breakpoint_hook(*args, **kwargs):
    print("[breakpoint() reached: the interactive debugger only works in a real terminal]")


def _format_error(exc, filename, source):
    frames = [f for f in traceback.extract_tb(exc.__traceback__) if f.filename == filename]
    lines = []
    if frames:
        lines.append("Traceback (most recent call last):\n")
        src_lines = source.splitlines()
        for f in frames:
            where = "" if f.name == "<module>" else f", in {f.name}"
            lines.append(f'  File "{filename}", line {f.lineno}{where}\n')
            if f.lineno and 0 < f.lineno <= len(src_lines):
                lines.append("    " + src_lines[f.lineno - 1].strip() + "\n")
    lines.extend(traceback.format_exception_only(type(exc), exc))
    return "".join(lines).rstrip()


def _failed_assert_line(exc, source):
    for f in reversed(traceback.extract_tb(exc.__traceback__)):
        if f.filename == _TESTS_FILE and f.lineno:
            src_lines = source.splitlines()
            if 0 < f.lineno <= len(src_lines):
                return src_lines[f.lineno - 1].strip()
    return ""


def _fresh_dir():
    old = _run_state["dir"]
    if old:
        for name, mod in list(sys.modules.items()):
            path = getattr(mod, "__file__", None) or ""
            if path.startswith(old):
                del sys.modules[name]
        if old in sys.path:
            sys.path.remove(old)
    new = tempfile.mkdtemp(prefix="run_", dir=_BASE_CWD)
    os.chdir(new)
    sys.path.insert(0, new)
    _run_state["dir"] = new


def _restore_modules(before):
    # Undo modules a run injected or replaced (e.g. a fake "requests" from an
    # exercise setup) so nothing leaks into the next run. Real packages that
    # were imported for the first time are kept to avoid re-importing them.
    for name, mod in list(sys.modules.items()):
        if name in before:
            if before[name] is not mod:
                sys.modules[name] = before[name]
        elif getattr(mod, "__spec__", None) is None or getattr(mod, "__file__", None) is None:
            del sys.modules[name]
    for name, mod in before.items():
        sys.modules.setdefault(name, mod)


async def _exec_source(source, filename, ns, allow_await):
    flags = ast.PyCF_ALLOW_TOP_LEVEL_AWAIT if allow_await else 0
    code = compile(source, filename, "exec", flags=flags)
    result = eval(code, ns)
    if asyncio.iscoroutine(result):
        await result


async def _run_exercise(setup, code, tests, run_tests):
    _fresh_dir()
    pending = []
    real_run = asyncio.run

    def _run(coro, **kwargs):
        # asyncio.run() cannot block inside the browser, so we schedule the
        # coroutine and await it once the script body has finished.
        task = asyncio.ensure_future(coro)
        pending.append(task)
        return task

    out = io.StringIO()
    ns = {"__name__": "__main__", "__file__": _USER_FILE}
    modules_before = dict(sys.modules)
    result = {"ok": True, "stdout": "", "phase": None, "error": None, "testFailure": None}
    old_input, old_hook = builtins.input, sys.breakpointhook
    builtins.input, sys.breakpointhook, asyncio.run = _no_input, _breakpoint_hook, _run
    try:
        with contextlib.redirect_stdout(out), contextlib.redirect_stderr(out):
            phase = _SETUP_FILE
            try:
                if setup:
                    await _exec_source(setup, _SETUP_FILE, ns, True)
                phase = _USER_FILE
                await _exec_source(code, _USER_FILE, ns, False)
                while pending:
                    await pending.pop(0)
            except BaseException as exc:
                result.update(ok=False, phase=phase, stdout=out.getvalue(),
                              error=_format_error(exc, phase, setup if phase == _SETUP_FILE else code))
                return result
            result["stdout"] = out.getvalue()
            if run_tests and tests:
                ns["__output__"] = out.getvalue()
                ns["__source__"] = code
                try:
                    await _exec_source(tests, _TESTS_FILE, ns, True)
                    while pending:
                        await pending.pop(0)
                except AssertionError as exc:
                    msg = str(exc) or ("Hidden test failed: " + _failed_assert_line(exc, tests))
                    result.update(ok=False, phase="tests", testFailure=msg)
                except BaseException as exc:
                    result.update(ok=False, phase="tests", testFailure=_format_error(exc, _USER_FILE, code)
                                  if any(f.filename == _USER_FILE for f in traceback.extract_tb(exc.__traceback__))
                                  else f"{type(exc).__name__}: {exc}")
        return result
    finally:
        builtins.input, sys.breakpointhook, asyncio.run = old_input, old_hook, real_run
        _restore_modules(modules_before)
`;

// Runs one exercise in an already-loaded Pyodide instance.
export async function runInPyodide(py, { setup = "", code = "", tests = "", runTests = false }) {
  try {
    await py.loadPackagesFromImports([setup, code, tests].join("\n"));
  } catch {
    // Unknown imports surface later as a normal ModuleNotFoundError.
  }
  const fn = py.globals.get("_run_exercise");
  const proxy = await fn(setup, code, tests, runTests);
  fn.destroy();
  const result = proxy.toJs({ dict_converter: Object.fromEntries });
  proxy.destroy();
  return result;
}

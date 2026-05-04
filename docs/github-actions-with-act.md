# GitHub Actions With Act

This repo supports local workflow runs with `act`, but the local runner needs a
small amount of extra configuration to behave reliably on this machine.

## Why This Exists

With `act 0.2.88`, plain `act push` can fail before workflow execution starts
because the local artifact or cache server bind address defaults to an invalid
value. The fix is to bind both servers explicitly to `127.0.0.1`.

The consolidated `ci.yml` workflow also contains three independent jobs
(`static-analysis`, `test`, and `build`). GitHub Actions runs them in parallel
correctly. `act` can also run them in parallel, but sequential execution is
more reliable locally if Docker resources are constrained.

## Recommended `.actrc`

Create a local `.actrc` in the repo root with:

```txt
--artifact-server-path /tmp/act-artifacts
--artifact-server-addr 127.0.0.1
--artifact-server-port 34574
--cache-server-addr 127.0.0.1
--cache-server-port 34575
```

After that, plain `act push` or `act pull_request` should work for single-job
workflows.

## Workflow Map

- `.github/workflows/ci.yml`
  - `static-analysis`
  - `test`
  - `build`
- `.github/workflows/e2e.yml`
  - `e2e`

## Common Commands

Run the consolidated CI workflow sequentially:

```bash
act push -W .github/workflows/ci.yml --concurrent-jobs 1
```

Run one CI job at a time:

```bash
act push -W .github/workflows/ci.yml -j static-analysis
act push -W .github/workflows/ci.yml -j test
act push -W .github/workflows/ci.yml -j build
```

Run the Playwright workflow:

```bash
act push -W .github/workflows/e2e.yml
```

List detected workflows and jobs:

```bash
act -l
```

## Notes

- The `test` job in `ci.yml` runs the repo test suite, including:
  - `apps/server` Vitest tests
  - `apps/web` Vitest tests
- The `e2e` workflow installs Playwright Chromium and its OS dependencies.
- `act` may still print cache save or restore warnings. Those warnings do not
  necessarily mean the workflow itself failed.
- If fixed ports are already in use, change the port values in `.actrc`.

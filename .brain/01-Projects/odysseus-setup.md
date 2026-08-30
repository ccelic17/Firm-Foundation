# Odysseus — Local Bring-Up Runbook

**Host:** `C:\Users\cceli\odysseus` · **Web UI:** `http://localhost:7000` · **Runtime:** Docker Desktop (Windows)

> ⚠️ **This runbook was written without reading the actual `docker-compose.yml`.** It was produced from a session running in a Linux container with no route to the Windows host — no `C:\` mount, no Docker daemon, no Ollama. Port numbers and service names below come from the brief, not from the file. **Reconcile against the real compose file before trusting specifics.**

---

## 1. Directory and environment

```powershell
cd C:\Users\cceli\odysseus
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
Select-String -Path docker-compose.yml -Pattern 'ports:' -Context 0,3
```

In a `ports:` mapping the **host port is the left number** (`"7000:8080"` → reach it at `localhost:7000`).

## 2. Check the port is free *before* bringing it up

```powershell
Get-NetTCPConnection -LocalPort 7000 -ErrorAction SilentlyContinue
```

Any result means 7000 is taken. Change the left side of the mapping rather than fighting whatever holds it.

## 3. Deploy

```powershell
docker info                        # confirms the daemon is actually up
docker compose up -d --build
docker compose ps                  # scoped to this project, unlike `docker ps`
docker compose logs -f --tail=50
```

**"Up" does not mean ready.** A container can report healthy while the app inside is still booting or crash-looping. Watch the logs until it says it's listening.

## 4. Ollama

```powershell
ollama list
curl http://localhost:11434/api/tags
```

---

## ⚠️ The gotcha: `host.docker.internal` will fail by default

Ollama binds to `127.0.0.1`, which is **unreachable from inside a container**. Point Odysseus at `http://host.docker.internal:11434` without fixing this and it will simply never connect.

```powershell
setx OLLAMA_HOST "0.0.0.0:11434"
```

Then **fully quit Ollama from the system tray** — closing the window is not enough — and restart it.

Verify from inside the running container, which is the only test that actually proves it:

```powershell
docker compose exec <service> curl -s http://host.docker.internal:11434/api/tags
```

- JSON back → the provider setting will work.
- Hang or connection refused → Ollama is still on loopback.

Two more notes:
- `host.docker.internal` resolves automatically on Docker Desktop for Windows. On a **Linux** host the service needs `extra_hosts: ["host.docker.internal:host-gateway"]`.
- Provider fields differ: some want the base URL (`http://host.docker.internal:11434`), others the OpenAI-compatible path (`http://host.docker.internal:11434/v1`). If one 404s, use the other.

---

## Model selection — RTX 3060, 6 GB VRAM

**6 GB is the binding constraint.** See `../03-App-State/apps-overview.md`.

| Guidance | Detail |
|---|---|
| Fits comfortably | 7B-class at **Q4_K_M** or smaller |
| Will not fit | 14B without heavy CPU offload — expect a large latency hit |
| Context | Keep modest; the KV cache competes with weights for the same 6 GB |
| Concurrency | One model at a time, or you OOM |

**Tag caution:** `qwen3.5` was named in the brief but is likely **not a real Ollama tag**. `qwen2.5-coder` is real; `qwen3` probably. Confirm before pulling:

```powershell
ollama pull qwen2.5-coder:7b
ollama list
```

---

## Access summary

- **Web UI:** `http://localhost:7000` (confirm against the real compose mapping)
- **Ollama endpoint for Odysseus provider settings:** `http://host.docker.internal:11434`
- **From the host directly:** `http://localhost:11434`

## Next actions after bring-up

1. Open the web UI, complete first-run login, note where credentials are stored.
2. Add Ollama as a provider using the `host.docker.internal` URL above.
3. Select a 7B Q4 model; run one prompt end-to-end to confirm the round trip.
4. Record the working provider config and any port changes back into this file.

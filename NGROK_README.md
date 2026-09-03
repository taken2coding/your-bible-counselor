# Bible Counselor — ngrok Tunnel (same strategy as dpia_agent)

**Token source:** `/workspace/npg_dpia/.env` → `NGROK_AUTHTOKEN=3Ih8g4BV8UZmaS6HkApH6gzHhwr_...` (same API as DPIA)
**Region:** `eu` (closest to Africa/Lagos)
**Local port:** `8787` — `src/server.js:1`
**Stack:** `pyngrok 8.1.2` (Python, no binary download flakiness) — same as DPIA's python strategy

## Current tunnel — LIVE
- **Public URL:** `https://supersubtle-undelectably-kendall.ngrok-free.dev`
- **Local:** `http://localhost:8787`
- **Verify:** `curl https://supersubtle-undelectably-kendall.ngrok-free.dev/health`
- **Counsel:** `https://supersubtle-undelectably-kendall.ngrok-free.dev/counsel?q=cave%20of%20Adullam`
- **HTML UI:** open the public URL in browser

## Start (identical to dpia_agent/run.sh pattern)
```bash
# 1. start server + tunnel in one command
./run_with_ngrok.sh 8787

# or manual (same strategy dpia uses):
python3 /tmp/ngrok_bible.py &
# bun src/server.js &  # already started
```

## Stop / Close port (required after assessment)
```bash
./run_with_ngrok.sh stop
# or
./stop_ngrok.sh
# or manually:
python3 -c "from pyngrok import ngrok; [ngrok.disconnect(t.public_url) for t in ngrok.get_tunnels()]"
pkill -f "bible-counselor.*server.js"
```

## Files
- `run_with_ngrok.sh` — start server + pyngrok tunnel, prints public URL, reuses `/workspace/npg_dpia/.env` token
- `stop_ngrok.sh` — closes tunnel + kills server, removes `/tmp/bible-counselor-ngrok.url`
- `/tmp/bible-counselor-ngrok.url` — current public URL
- `/tmp/bible-ngrok.log` — ngrok log
- `/tmp/bible-counselor.log` — server log

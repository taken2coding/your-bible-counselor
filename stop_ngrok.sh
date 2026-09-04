#!/usr/bin/env bash
echo "Closing Bible Counselor ngrok tunnel and local server..."
pkill -f "ngrok_bible.py" 2>/dev/null || true
pkill -f "pyngrok" 2>/dev/null || true
# kill ngrok binary
kill $(cat /tmp/bible-ngrok.pid 2>/dev/null) 2>/dev/null || true
# kill bun server
pkill -f "bible-counselor.*server.js" 2>/dev/null || true
# python disconnect
python3 -c "from pyngrok import ngrok; [ngrok.disconnect(t.public_url) for t in ngrok.get_tunnels()]" 2>/dev/null || true
rm -f /tmp/bible-counselor-ngrok.url /tmp/bible-ngrok.pid
echo "Closed. Verify: curl http://localhost:8787/health should fail"
curl -sf http://localhost:8787/health && echo "Still running (close manually)" || echo "Server stopped"

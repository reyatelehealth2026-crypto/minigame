# Deployment

## Current local deployment target
- process manager: `systemd`
- app service name: `pharmacy-plus-liff-acquisition`
- app port: `3105`
- start command: `scripts/start-prod.sh`
- reverse proxy: `caddy` for `app.re-ya.net`

## Files
- env template: `.env.production.local.example`
- systemd unit source: `deploy/systemd/pharmacy-plus-liff-acquisition.service`
- caddy config source: `deploy/caddy/Caddyfile`

## Install / update
```bash
cp .env.production.local.example .env.production.local
# fill real values
npm install
npm run build
cp deploy/systemd/pharmacy-plus-liff-acquisition.service /etc/systemd/system/pharmacy-plus-liff-acquisition.service
chmod +x scripts/start-prod.sh
systemctl daemon-reload
systemctl enable --now pharmacy-plus-liff-acquisition
systemctl restart pharmacy-plus-liff-acquisition
systemctl status pharmacy-plus-liff-acquisition --no-pager
journalctl -u pharmacy-plus-liff-acquisition -n 100 --no-pager
```

## Important blockers for real LIFF launch
The app can be served without env, but it is not truly launch-ready until these are provided:
- `NEXT_PUBLIC_LIFF_ID`
- `NEXT_PUBLIC_LINE_ADD_FRIEND_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Domain plan
Target public hostname:
- `app.re-ya.net`

Required DNS change:
- create an `A` record for `app.re-ya.net`
- point it to this server public IP: `43.98.204.176`

After DNS points here and ports 80/443 are reachable, Caddy can issue TLS automatically.

## Important blocker for public customer use
LIFF must be opened from a public HTTPS URL that is registered in the LINE Developers console.
A local/private IP like `10.184.18.92:3105` is not enough for a real customer launch.

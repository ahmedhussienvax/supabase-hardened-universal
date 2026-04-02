# Supabase Hardened Universal (AG-OS Edition)

> **"The Gold Standard for Self-Hosted Supabase Reliability."**

This repository is a **Universal Hardened Template** designed to solve the three biggest failures of self-hosted Supabase: **Startup Deadlocks**, **Limited Studio UI**, and **RAM Over-allocation**.

## 🌟 New: Zero-Dependency Studio Sidecar

Instead of fragile, injected node.js hacks over the Studio binary, this repository implements a natively robust `studio-proxy` sidecar. It runs purely on standard Node (`node:20-alpine`) using no external modules (no `http-proxy` or `express`). Traefik correctly routes user API traffic to this sidecar which dynamically intercepts unsupported routes (like Billing, Edge Functions sync) and delegates the remainder safely to Supabase Studio.

---

## 🔐 Master Secret Injection (Universal Passwords)

Most setups struggle with database role passwords. We use an **init.sh** automation that dynamically injects your VPS environment variables directly into the SQL engine at runtime, ensuring your production server is always in sync with your Coolify secrets.

---

## The Magic Quick-Fix (For Existing Users)

If you already have a Supabase stack running but suffer from **Unhealthy Analytics**, **Deadlocks**, or want the **Master UI** features, simply add this service to your existing `docker-compose.yml` and make your main services `depend_on` it.

```yaml
  supabase-git-sync:
    image: alpine
    container_name: supabase-git-sync
    restart: "no"
    volumes:
      - './target:/target'
    command: >
      sh -c "
        apk add --no-cache git &&
        git clone https://github.com/ahmedhussienvax/supabase-hardened-universal.git /tmp/repo &&
        mkdir -p /target/volumes/db /target/volumes/api /target/volumes/studio &&
        cp -rv /tmp/repo/volumes/db/* /target/volumes/db/ &&
        cp -fv /tmp/repo/volumes/api/kong.yml /target/volumes/api/kong.yml &&
        cp -fv /tmp/repo/volumes/studio/proxy.js /target/volumes/studio/proxy.js &&
        echo 'System Hardened & Patched Successfully!'
      "
```

---

## Deployment (One-Click Ready)

### Option A: Standard Docker (Self-Heal)

```bash
git clone https://github.com/ahmedhussienvax/supabase-hardened-universal.git
cd supabase-hardened-universal
docker-compose up -d
```

### Option B: Coolify (GitOps Native)

1. Point your **Coolify Resource** to this repository.
2. Coolify will automatically mount the `./volumes/` and `./entrypoint.sh` logic.
3. Your stack will self-repair and boot into **Synthetic Platform** mode.

---

## 📂 Architecture

- `docker-compose.yml`: The "Synthetic Platform" orchestration logic using Traefik and native proxy sidecars.
- `studio-proxy.js`: The robust Zero-Dependency Node.js Sidecar Proxy that unlocks master/UI features safely.
- `volumes/api/kong.yml`: The security and UI-Unlocking gateway mapping.
- `volumes/db/init.sh`: The secret injection logic for DB roles.
- `volumes/db/_supabase.sql`: The remediation script for Logflare/Analytics.

*Created by the SilkBot Core Team.*

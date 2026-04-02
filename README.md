# Supabase Hardened Universal (AG-OS Edition)

> **"The Gold Standard for Self-Hosted Supabase Reliability."**

This repository is a **Universal Hardened Template** designed to solve the three biggest failures of self-hosted Supabase: **Startup Deadlocks**, **Limited Studio UI**, and **RAM Over-allocation**.

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
      - './volumes:/target'
    command: >
      sh -c "
        apk add --no-cache git &&
        git clone https://github.com/ahmedhussienvax/supabase-hardened-universal.git /tmp/repo &&
        cp -rv /tmp/repo/volumes/* /target/ &&
        cp -fv /tmp/repo/entrypoint.sh /target/ &&
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

- `docker-compose.yml`: The "Synthetic Platform" orchestration logic.
- `volumes/api/kong.yml`: The security and UI-Unlocking gateway.
- `volumes/db/init.sh`: The secret injection logic for DB roles.
- `volumes/db/_supabase.sql`: The remediation script for Logflare/Analytics.

---

## 📜 Contributing

This project follows the **AG-OS (Antigravity Operating System)** principles: Efficiency, Stability, and Technical Objectivity.

---

*Created by the SilkBot Core Team.*

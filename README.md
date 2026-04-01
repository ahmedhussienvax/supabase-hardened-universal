# 🛡️ Supabase Hardened Universal (AG-OS Edition)

> **"The Gold Standard for Self-Hosted Supabase Reliability."**

This repository is a **Universal Hardened Template** designed to solve the three biggest failures of self-hosted Supabase: **Startup Deadlocks**, **Limited Studio UI**, and **RAM Over-allocation**.

---

## 💎 Master Skills Integrated

### 1. 🚀 Synthetic Platform Mode (Unlock the 2026 UI)
Standard self-hosted Supabase is often "locked" into a basic interface. Our **Synthetic Gateway Strategy** (via Hardened Kong Configs) bypasses these limits, unlocking the **Professional Platform UI** including:
- **AI Infrastructure Assistant**: Fully functional in-studio.
- **Advanced Logs Explorer**: Integrated analytics without external leaks.
- **Organization & Project Tabs**: Professional multi-tenant architecture feel.

### 2. 👻 Logflare Ghost-Fix (The Deadlock Killer)
Most self-hosted instances fail with an "Unhealthy" analytics container. We've solved this using:
- **SQL Remediation Bootstrap**: Automatically initializes the `_analytics` schema and `_supabase` database permissions at runtime.
- **Dependency Relaxation**: Breaks the circular wait-state between Kong, Auth, and Analytics.

### 3. 🧠 AG-OS RAM Stabilization (512MB Precision)
Optimized for VPS environments (4GB - 8GB RAM).
- **Enforced Hard Limits**: Prevents Logflare/Elixir garbage collection from spiking and crashing your server.
- **Vector Tuning**: Optimized connectivity for search and embeddings.

---

## ✨ The Magic Quick-Fix (For Existing Users)

If you already have a Supabase stack running but suffer from **Unhealthy Analytics**, **Deadlocks**, or want the **Master UI** features, simply add this service to your existing `docker-compose.yml` and make your main services `depend_on` it.

```yaml
  supabase-git-sync:
    image: alpine/git
    container_name: supabase-git-sync
    restart: "no"
    volumes:
      - './volumes:/target'
    command: >
      sh -c "
        git clone https://github.com/ahmedhussienvax/supabase-hardened-universal.git /tmp/repo &&
        cp -rv /tmp/repo/volumes/* /target/ &&
        echo '✅ System Hardened & Patched Successfully!'
      "
```

---

## 🛠️ Deployment (One-Click Ready)


### Option A: Standard Docker (Self-Heal)
```bash
git clone https://github.com/ahmedhussienvax/supabase-hardened-universal.git
cd supabase-hardened-universal
docker-compose up -d
```

### Option B: Coolify (GitOps Native)
1. Point your **Coolify Resource** to this repository.
2. Coolify will automatically mount the `./gateway/` and `./volumes/` directories.
3. Your stack will self-repair and boot into **Synthetic Platform** mode.

---

## 📂 Architecture
- `docker-compose.yml`: The "Synthetic Platform" orchestration logic.
- `gateway/hardened_kong.yml`: The security and UI-Unlocking gateway.
- `volumes/db/96-remediation.sql`: The SQL script that fixes the "Unhealthy" analytics state.

---

## 📜 Contributing
This project follows the **AG-OS (Antigravity Operating System)** principles: Efficiency, Stability, and Technical Objectivity.

---
*Created by the SilkBot Core Team.*

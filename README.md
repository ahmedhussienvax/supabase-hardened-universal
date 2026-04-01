# Supabase Hardened: Universal Stability Layer 🛡️

The definitive, architecture-agnostic fix for **Supabase Studio 2026** and **Logflare** stabilization.

## 🚀 Overview

This repository provides a **World-Class (AG-OS)** stabilization layer for self-hosted Supabase environments. It addresses the notorious "Platform Lock" issues in Studio 2026 and the Logflare `500 Internal Server Error` cycle, specifically on **ARM64** (Oracle ARM, Apple Silicon) and **Intel/AMD64** architectures.

### Key Features
- **Synthetic Platform Architecture**: Unlocks full UI features (Auth Providers, Log Drains, Settings) by mocking Cloud APIs via Kong Gateway.
- **Deterministic Healthchecks**: Prevents Logflare boot-loops using a pre-flight database verification script.
- **Resource Hardening**: Optimized memory limits (512MB RAM) to prevent VPS OOM (Out-of-Memory) crashes.
- **Universal Multi-Arch Support**: Works 100% identically on Intel, AMD, and ARM64.

## 🏗️ Architecture

```mermaid
graph TD
    User((User)) --> Kong[Kong Gateway :8000]
    Kong --> Studio[Supabase Studio :3000]
    Kong --> Auth[Supabase Auth :9999]
    
    subgraph "Synthetic Platform Layer"
        Kong -- "/api/platform/*" --> Mocks[Synthetic Platform Mocks]
    end
    
    subgraph "Data Stability Layer"
        Logflare[Supabase Analytics] -- "1. Healthcheck" --> Watchdog[verify_seeds.py]
        Watchdog -- "2. Ready?" --> DB[(_supabase) Metadata DB]
        Logflare -- "3. Ingest" --> DB
    end
```

## 🛠️ Quick Start

### 1. Clone & Prepare
```bash
git clone https://github.com/ahmedhussienvax/supabase-hardened-universal.git
cd supabase-hardened-universal
cp .env.example .env
```

### 2. Configure
Edit your `.env` and set your `PROJECT_DOMAIN`. The **Synthetic Platform** logic will automatically use these variables to customize your Studio UI.

### 3. Deploy
```bash
docker-compose up -d
```

## 🛡️ Hardening Details

- **Search Path Protection**: The `_supabase` database is hardened with a permanent `search_path` to `public, _analytics`.
- **Memory Caps**: Logflare is restricted to 512MB to protect low-RAM VPS instances.
- **Official Images**: Uses only official, multi-arch Supabase images—no custom binary patching required.

---
**Maintained by**: [Your Name/SilkBot Team]
**License**: MIT

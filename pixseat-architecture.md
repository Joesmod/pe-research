# PixSeat — Seat Map Ingestion Architecture

> High-level overview for business discussion. Not an engineering spec.

## The Problem

No ticketing platform publicly exposes seat coordinates. They're locked behind enterprise APIs and proprietary tools. **PixSeat must build its own seat coordinate library** — this becomes the moat.

---

## System Diagram

```
 ┌─────────────────────── DATA SOURCES ───────────────────────┐
 │                                                             │
 │  📄 Venue SVGs          📋 Manual Upload     🌐 TM Discovery API  │
 │  (TM ISM, SeatGeek,    (CSV/JSON via        (venue metadata,      │
 │   AXS partnerships)     upload portal)        static map images)   │
 │                                                             │
 └────────┬──────────────────┬──────────────────┬──────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
 ┌─────────────────── PROCESSING PIPELINE ────────────────────┐
 │                                                             │
 │  ┌────────────┐  ┌──────────────┐  ┌─────────────────┐     │
 │  │ SVG Parser │  │ CSV/JSON     │  │ Image Processor │     │
 │  │            │  │ Importer     │  │ (stretch — CV)  │     │
 │  └─────┬──────┘  └──────┬───────┘  └───────┬─────────┘     │
 │        │                │                   │               │
 │        └────────┬───────┴───────────────────┘               │
 │                 ▼                                            │
 │        ┌────────────────┐    ┌──────────────────────┐       │
 │        │  Normalizer    │───▶│  Config Manager       │       │
 │        │  (→ 0.0–1.0)  │    │  (end stage, center,  │       │
 │        └────────────────┘    │   in-the-round, etc.) │       │
 │                              └──────────┬───────────┘       │
 └─────────────────────────────────────────┼───────────────────┘
                                           │
                                           ▼
 ┌──────────────────────── STORAGE ────────────────────────────┐
 │                                                              │
 │          ┌──────────────────────────────────┐                │
 │          │   🏟️  SEAT COORDINATE LIBRARY     │                │
 │          │   (the moat)                     │                │
 │          │                                  │                │
 │          │  • Normalized seat positions     │                │
 │          │  • Venue metadata                │                │
 │          │  • Config variants per venue     │                │
 │          └──────────────┬───────────────────┘                │
 └─────────────────────────┼────────────────────────────────────┘
                           │
                           ▼
 ┌──────────────────── OUTPUT / API ───────────────────────────┐
 │                                                              │
 │  REST API                        Real-Time Mapping Service   │
 │  • GET /venues/{id}              • Ticket scan               │
 │  • GET /venues/{id}/sections       → seat position lookup    │
 │  • GET /seats?barcode={id}         → phone location          │
 │                                                              │
 │              ┌──────────┐                                    │
 │              │ 📱 App   │  ← queries seat positions          │
 │              └──────────┘    at showtime                     │
 └──────────────────────────────────────────────────────────────┘

 ┌──────────────── SUPPORTING TOOLS ───────────────────────────┐
 │  👩‍💼 Admin Dashboard    🔍 QA Validator       📝 Onboarding    │
 │  (manage venue data)  (visual overlay of   (guided workflow  │
 │                        parsed seats on map   per new venue)  │
 │                        to verify accuracy)                   │
 └──────────────────────────────────────────────────────────────┘
```

---

## Key Concepts

| Concept | Detail |
|---|---|
| **Standard schema** | Every seat → `{ venue, section, row, seat, x: 0.0–1.0, y: 0.0–1.0 }` |
| **Config variants** | One venue can have multiple layouts (end stage vs. in-the-round) |
| **The moat** | The seat coordinate library itself — hard to build, impossible to shortcut |
| **SVG = primary format** | All major ticketing platforms use SVG internally for seat maps |
| **Image processing** | Stretch goal — CV extraction from static map images as a fallback |

## Data Flow Summary

1. **Ingest** — SVGs from partners, CSV/JSON from manual entry, metadata from public APIs
2. **Parse & Normalize** — Extract seat IDs + coordinates → convert to standard 0.0–1.0 schema
3. **QA** — Visual overlay validation before publishing
4. **Store** — Seat Coordinate Library (per venue, per config)
5. **Serve** — REST API delivers seat positions to PixSeat's mobile app at showtime
6. **Map** — Ticket scan → seat lookup → phone knows where it is → light show 🎆

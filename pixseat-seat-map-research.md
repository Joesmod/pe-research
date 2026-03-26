# PixSeat — Seat Map Data Ingestion Research

> **Purpose:** Evaluate how PixSeat can ingest seat maps from major ticketing platforms to map smartphone users to physical seat locations for in-venue light shows.
>
> **Date:** February 8, 2026

---

## Executive Summary

There is **no universal industry standard** for venue seat maps. Each ticketing platform uses its own proprietary format, and seat-level coordinate data (critical for PixSeat's use case) is rarely exposed through public APIs. The most practical path forward is likely a **hybrid approach**: use Ticketmaster's public API for basic seat manifest data, pursue partnership/enterprise API access with key platforms, and build a venue-side upload tool that accepts a simple CSV/JSON format PixSeat defines.

---

## Platform-by-Platform Analysis

### 1. Ticketmaster (incl. Live Nation)

**Market Share:** ~70%+ of major venue ticketing in North America. This is the most important platform.

| Aspect | Details |
|---|---|
| **Public API?** | ✅ Yes — Discovery API v2 |
| **API Docs** | https://developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2/ |
| **Seat Map Data Available?** | Partial. Venue endpoint returns venue metadata (name, address, lat/long, seatmap image URL). Does NOT return individual seat-level data (section/row/seat with coordinates). |
| **Seatmap Image** | The API returns a `seatmap.staticUrl` field — a static image (PNG/JPEG) of the venue layout. Not machine-readable. |
| **Interactive Maps** | Ticketmaster uses an internal "Interactive Seat Map" (ISM) system built on SVG. This is **not publicly accessible via API**. The seat-level geometry (SVG paths, seat coordinates) is served to the checkout widget via internal endpoints. |
| **Data Format** | JSON (Discovery API). Internal seat geometry is SVG-based with proprietary seat ID mapping. |
| **Typical Fields (via API)** | Venue: `id`, `name`, `address`, `city`, `state`, `country`, `postalCode`, `location.latitude`, `location.longitude`, `seatmap.staticUrl`, `boxOfficeInfo`, `generalInfo` |
| **Seat-Level Fields (internal)** | Section, row, seat number, x/y coordinates within SVG, price level, accessibility flags, seat type (standard, ADA, obstructed view) |
| **Ingestion Difficulty** | ⭐⭐⭐⭐ (4/5) — Basic venue info is easy. Seat-level coordinate data requires either scraping the interactive maps (fragile, TOS risk) or enterprise partnership. |
| **Gotchas** | Rate limit: 5,000 calls/day, 5/sec. Seat maps vary per event (not just per venue) due to stage configs. The `seatmap.staticUrl` image is a flat raster — no extractable geometry. TM has a separate **Publish API** and **Partner API** with deeper access, but these require a business relationship. |

**Recommendation:** Pursue Ticketmaster partner/enterprise API access. They have programs for venue technology integrations. The internal ISM data has everything PixSeat needs.

---

### 2. AXS (owned by AEG)

**Market Share:** Second-largest in North America. Powers AEG venues (Crypto.com Arena, The O2, etc.) and college athletics.

| Aspect | Details |
|---|---|
| **Public API?** | ❌ No public developer API for seat maps |
| **API Docs** | None publicly available. AXS has a private partner API. |
| **Seat Map Data Available?** | Not externally. AXS uses proprietary interactive seat maps on their purchase flow. |
| **Data Format** | Proprietary. Their interactive maps appear to use a combination of SVG + JSON manifests served internally. |
| **Typical Fields** | Section, row, seat, price tier, availability. Coordinate data exists internally but is not exposed. |
| **Ingestion Difficulty** | ⭐⭐⭐⭐⭐ (5/5) — No public API. Would require direct partnership with AXS/AEG. |
| **Gotchas** | AXS is a walled garden. AEG venues are some of the biggest in the world, so this is a critical platform to crack. AXS does have technology partnerships — approach would need to be B2B. |

**Recommendation:** Direct B2B partnership with AXS/AEG is the only viable path. Given PixSeat's venue experience product, this could be pitched as an enhancement to AEG's fan engagement offering.

---

### 3. Paciolan (owned by Pacifica)

**Market Share:** Dominant in college athletics (~120+ university clients). Also used by some performing arts venues.

| Aspect | Details |
|---|---|
| **Public API?** | ❌ No public API |
| **API Docs** | None public. Paciolan provides integration capabilities to its venue clients via a private platform. |
| **Seat Map Data Available?** | Internally to venue clients, yes. Paciolan provides seat manifests to venues as part of their ticketing setup. |
| **Data Format** | Historically CSV-based seat manifests for venue configuration. Their interactive maps use proprietary rendering. |
| **Typical Fields** | Venue, section, row, seat, price code, seat type, ADA flag. Some implementations include x/y coordinates for map rendering. |
| **Ingestion Difficulty** | ⭐⭐⭐⭐ (4/5) — No public API, but venues using Paciolan often have direct access to their own seat manifest data. The venue itself may be able to export and share it. |
| **Gotchas** | Paciolan is being gradually integrated into Ticketmaster's ecosystem (Ticketmaster acquired the college market). Data formats may be transitioning. Seat manifests often exist as flat files that venues maintain. |

**Recommendation:** Work with the venue (not Paciolan directly). University athletic departments often have their seat manifest data and can share it. This is a "get it from the venue" play.

---

### 4. SeatGeek

**Market Share:** Growing. Powers MLS stadiums, Brooklyn Nets (Barclays), Dallas Cowboys, and many mid-size venues.

| Aspect | Details |
|---|---|
| **Public API?** | ✅ Partial — SeatGeek has a public API (primarily for event/ticket discovery) |
| **API Docs** | https://platform.seatgeek.com/ (requires login) |
| **Seat Map Data Available?** | The public API provides venue information but NOT seat-level coordinate data. SeatGeek builds interactive SVG-based seat maps internally. They have a separate **Open platform** for venue partners. |
| **Data Format** | JSON via REST API. Internal maps are SVG-based. |
| **Typical Fields (API)** | Venue: `id`, `name`, `city`, `state`, `country`, `location` (lat/lng), `score`, `capacity`. Event-level: sections, price ranges. |
| **Ingestion Difficulty** | ⭐⭐⭐⭐ (4/5) — Public API gives venue metadata only. Seat-level geometry requires partnership. SeatGeek is more developer-friendly and partnership-oriented than most. |
| **Gotchas** | SeatGeek's "Open" platform is specifically designed for venue technology integrations. They may be the most receptive to a PixSeat partnership pitch. Their developer relations team is relatively accessible. |

**Recommendation:** Strong candidate for early partnership. SeatGeek's Open platform and developer-friendly culture make them a natural fit. They actively seek venue experience differentiators.

---

### 5. Eventbrite

**Market Share:** Large in general events, but minimal in **assigned seating** at major venues.

| Aspect | Details |
|---|---|
| **Public API?** | ✅ Yes — Eventbrite Platform API |
| **API Docs** | https://www.eventbrite.com/platform/api |
| **Seat Map Data Available?** | Eventbrite supports "Reserved Seating" via their Assigned Seating product, but the API does **not** expose seat-level geometry. |
| **Data Format** | JSON via REST API. |
| **Typical Fields** | Venue: `id`, `name`, `address`, `latitude`, `longitude`, `capacity`. Ticket classes, not individual seats. |
| **Ingestion Difficulty** | ⭐⭐⭐ (3/5) — API is accessible but seat-level data isn't really there. More importantly, Eventbrite's market is primarily GA events, not the large seated venues PixSeat targets. |
| **Gotchas** | Eventbrite's reserved seating product is relatively new and limited. Most Eventbrite events are general admission. Low priority for PixSeat's use case. |

**Recommendation:** Low priority. Eventbrite's market doesn't heavily overlap with PixSeat's target venues (large arenas, stadiums, amphitheaters).

---

### 6. Other Notable Platforms

| Platform | Notes | Priority |
|---|---|---|
| **Veritix / AXS** | Merged into AXS. See AXS above. | (covered) |
| **Tickets.com (MLB)** | Powers Major League Baseball. Private API. Venue manifests owned by teams. Approach teams directly. | Medium |
| **TM+ / Ticketmaster Resale** | Uses same underlying venue data as Ticketmaster. | (covered) |
| **Vendini / AudienceView** | Performing arts / smaller venues. Private platform. | Low |
| **Tessitura** | Arts & cultural venues. Has API but seat map data is venue-managed. | Low–Medium |
| **ProVenue (formerly Outbox)** | Enterprise venue management. Has seat manifest data. Private. | Low |
| **Safetix / Fortress** | Mobile ticketing layer, sits on top of TM. No independent seat maps. | N/A |

---

## Industry Standards & Interchange Formats

### Is There a Universal Seat Map Standard?

**No.** There is no widely adopted industry standard for venue seat map data interchange. This is a significant gap in the industry.

### What Exists

| Format/Standard | Description | Relevance |
|---|---|---|
| **SVG (Scalable Vector Graphics)** | Most interactive seat maps are rendered from SVG. Ticketmaster, SeatGeek, and AXS all use SVG internally. SVG paths can encode seat positions with x/y coordinates. | High — if PixSeat can obtain venue SVGs, they contain rich geometry. |
| **GeoJSON** | Standard for geographic data. Some venue mapping tools use GeoJSON for seat positions (real-world coordinates). | Medium — useful if PixSeat needs GPS-level precision per seat. |
| **CSV Seat Manifests** | The most common "interchange" format in practice. Venues and ticketing platforms exchange flat files with columns like `section, row, seat, price_code, seat_type`. Rarely includes coordinates. | High — most venues can produce this. But lacks geometry. |
| **3D Venue Models (e.g., from Oculus/Matterport)** | Some vendors create 3D scans of venues. Not a seat map format per se, but contains spatial data. | Low — overkill for PixSeat's needs. |
| **ISBM (no such standard exists)** | There is no "International Seat Map Standard" or equivalent. | N/A |

### OVG (Oak View Group)

OVG is a venue development and management company (not a data format). They build and operate venues and have partnerships with various ticketing platforms. They don't publish a seat map standard, but their venues would have seat data accessible through whichever ticketing system they use.

---

## Who Owns the Seat Map Data?

This is a critical business question for PixSeat.

| Scenario | Data Ownership | Implications |
|---|---|---|
| **Venue owns the building** | The venue typically owns the physical seat layout and has a "seat manifest" (the list of all sections/rows/seats). | PixSeat can request this directly from the venue. |
| **Ticketing platform** | The platform (TM, AXS, etc.) creates the **interactive map** (SVG geometry, visual rendering) and considers this their IP. The seat *list* belongs to the venue; the *map visualization* belongs to the platform. | PixSeat needs the list + coordinates. The list is accessible; coordinates may require platform partnership. |
| **Event-specific configs** | For concerts, the seat map changes based on stage setup ("end stage" vs "center stage" vs "in the round"). These configurations are typically managed by the ticketing platform per event. | PixSeat needs to handle multiple configurations per venue. |

**Key Insight:** Venues generally **can** provide a seat manifest (section/row/seat list). What they usually **cannot** provide is x/y coordinate mapping for each seat. That geometry lives in the ticketing platform's interactive map system.

---

## Recommended Strategy for PixSeat

### Tier 1: Immediate Actions
1. **Define a PixSeat Standard Format** — Create a simple JSON/CSV schema that captures what PixSeat needs: `venue_id, section, row, seat, x_coord, y_coord, zone` (where zone is a PixSeat-defined grouping for light show effects). This becomes the target format everything maps to.
2. **Build a Venue Upload Tool** — Let venues or PixSeat staff manually upload seat data in the standard format. For initial deployments, a spreadsheet + manual coordinate mapping may be fastest.
3. **Ticketmaster Discovery API** — Integrate for venue metadata and static seat map images. Use image processing to extract approximate seat positions from static map images as a bootstrapping method.

### Tier 2: Platform Partnerships
4. **SeatGeek Partnership** — Most developer-friendly. Approach their Open platform team about seat geometry access.
5. **Ticketmaster Partner API** — Apply for enterprise/partner access to get ISM (Interactive Seat Map) data.
6. **AXS/AEG Partnership** — Pitch as fan engagement enhancement for AEG venues.

### Tier 3: Scale
7. **Venue-Direct Data Collection** — For venues not covered by API partnerships, work with venue ops teams who maintain their own seat manifests. Add coordinate data via PixSeat's own venue survey tool.
8. **Build a Seat Map Library** — Once PixSeat has mapped a venue, cache it. Venues rarely change their seat layouts. Over time, this becomes a competitive moat.

### Proposed PixSeat Standard Schema

```json
{
  "venue_id": "pixseat-msg-001",
  "venue_name": "Madison Square Garden",
  "configuration": "end-stage",
  "seats": [
    {
      "section": "101",
      "row": "A",
      "seat": "1",
      "x": 0.234,
      "y": 0.567,
      "zone": "floor-left",
      "level": "lower",
      "type": "standard"
    }
  ]
}
```

*Coordinates should be normalized (0.0–1.0) relative to venue bounds, making them resolution-independent.*

---

## Difficulty Summary

| Platform | Public API | Seat-Level Data | Coordinates | Difficulty | Priority |
|---|---|---|---|---|---|
| **Ticketmaster** | ✅ | ❌ (partner only) | ❌ (partner only) | ⭐⭐⭐⭐ | 🔴 Critical |
| **AXS** | ❌ | ❌ | ❌ | ⭐⭐⭐⭐⭐ | 🔴 Critical |
| **SeatGeek** | ✅ (partial) | ❌ (partner only) | ❌ (partner only) | ⭐⭐⭐⭐ | 🟡 High |
| **Paciolan** | ❌ | Via venue | Unlikely | ⭐⭐⭐⭐ | 🟡 High |
| **Eventbrite** | ✅ | ❌ | ❌ | ⭐⭐⭐ | 🟢 Low |
| **Tickets.com** | ❌ | Via teams | ❌ | ⭐⭐⭐⭐ | 🟡 Medium |

---

## Key Takeaways

1. **No platform publicly exposes seat-level coordinate data.** This is universally locked behind enterprise/partner agreements.
2. **Seat manifests (section/row/seat lists) are accessible** — either via API (TM, SeatGeek) or directly from venues.
3. **The hard part is coordinates, not seat lists.** PixSeat's core challenge is mapping seats to physical positions.
4. **SVG is the de facto format** for interactive seat maps across all major platforms. If PixSeat can obtain venue SVGs (via partnership), parsing them yields exact seat coordinates.
5. **Venues change configurations per event.** PixSeat needs to support multiple seat maps per venue.
6. **Build the format, own the data.** The fastest path is defining PixSeat's own schema and populating it through a combination of API data, partnerships, and manual venue surveys. Once built, this seat coordinate library becomes a major asset.

---

*Prepared for PixSeat business planning. Data reflects publicly available information as of February 2026.*

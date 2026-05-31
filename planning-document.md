# EmuDB — Project Planning Document

## Overview

A community-driven, filterable directory of emulation software. Answers the question "what do I use?" for any emulation requirement on any platform. Each listing links out to the software's website or repository — no documentation or guides are hosted here. Ad-supported with a single banner to cover hosting costs.

**Domain:** emudb.app

---

## Stack

- **Frontend + API:** Next.js (App Router)
- **Database + Auth:** Supabase (PostgreSQL + Supabase Auth)
- **ORM:** Prisma
- **Hosting:** Vercel
- **Ads:** Google AdSense (single banner, non-intrusive)
 - **Ads:** Google AdSense (single banner, non-intrusive)
	- Note: verify AdSense policy for emulation-related sites; avoid hosting ROMs or explicitly facilitating piracy.
---

## Build Order

1. Supabase project setup and auth configuration
2. Prisma schema definition and migrations
3. Seed data — systems, platforms, hardware, categories
4. API routes
5. UI

---

## Software Categories

- Emulator
- Frontend / Launcher
- Operating System
- Compatibility Layer
- Utility
- Scraper
- Shader / Filter Pack
- Companion App
- Input & Controllers
- Streaming

---

## Systems Taxonomy

Based on the RetroArch / libretro core list as the base. Every system with a documented libretro core is a valid system entry. Reference: https://docs.libretro.com/guides/core-list/

Includes but not limited to: Atari 2600/5200/7800/Jaguar/Lynx/ST, Bandai WonderSwan, ColecoVision, Commodore 64/Amiga, DOS, GCE Vectrex, Magnavox Odyssey2, Mattel Intellivision, MSX, NEC PC Engine/PC-FX/PC-88/PC-98, Nintendo NES/SNES/N64/GBA/GB/GBC/DS/3DS/GameCube/Wii/Wii U/Virtual Boy/Pokémon Mini, SNK Neo Geo/Neo Geo Pocket, Sega Master System/Game Gear/Mega Drive/32X/Mega CD/Saturn/Dreamcast, Sharp X68000, Sinclair ZX81/ZX Spectrum, Sony PS1/PS2/PSP, Texas Instruments TI-83, arcade (MAME/FBNeo), and game engines (ScummVM, DOSBox, CHIP-8, RPG Maker).

---

## Operating Systems

### Windows
- Windows (x86-64)
- Windows (x86-32)

### macOS
- macOS (Apple Silicon)
- macOS (Intel)

### Linux
- SteamOS
- Batocera
- Lakka
- RetroPie
- RecalBox
- JELOS
- Knulli
- muOS
- Other Linux

### Mobile
- Android
- iOS

### Other
- Other

---

## Hardware (Seed List)

### Valve
- Steam Deck LCD
- Steam Deck OLED

### Retroid
- Retroid Pocket 4
- Retroid Pocket 4 Pro
- Retroid Pocket 5
- Retroid Pocket Flip 2

### AYN
- AYN Odin 2
- AYN Odin 3
- AYN Thor
- AYN Thor Lite

### AYANEO
- AYANEO Pocket S
- AYANEO Pocket DMG
- AYANEO Pocket DS

### Anbernic
- RG35XX Plus
- RG35XX H
- RG40XX H
- RG40XX V
- RG556
- RG406V
- RG406H
- RG353V
- RG353M

### Miyoo
- Miyoo Mini+
- Miyoo Flip
- Miyoo A30

### TrimUI
- TrimUI Smart Pro
- TrimUI Brick

### Powkiddy
- RGB30
- X55

### Raspberry Pi
- Raspberry Pi 3B+
- Raspberry Pi 4
- Raspberry Pi 5
- Raspberry Pi Zero 2W

### GPD
- GPD Win 4
- GPD Win Mini

### OneXPlayer
- ONEXSUGAR

### Modded Consoles
- Nintendo Switch
- Nintendo Wii
- Nintendo Wii U
- Old 3DS / 2DS
- New 3DS / New 2DS XL
- Nintendo DSi
- Game Boy Advance
- PlayStation Portable
- PlayStation Vita
- PlayStation 2
- PlayStation 3
- PlayStation Classic
- Xbox (Original)
- Xbox 360
- Sega Dreamcast

### Architecture (Desktop/Laptop)
- x86-64
- x86-32
- Apple Silicon
- Intel Mac

Hardware entries are community-submittable. New hardware submissions go through the standard moderation queue.

---

## Tags

Free-form, user-submitted at time of listing submission. Known (already approved) tags go live immediately with the listing. New tags are held pending community review. Any user with at least one approved submission can review and approve/reject pending tags. Tag input should show autocomplete suggestions from the existing approved tag list to reduce duplicates.

---

## Ratings

Each rating submission contains:
- **Quality score** (1–5, optional) — subjective quality of the software itself
- **Performance score** (1–5, optional) — how well it runs on specific hardware
- **Hardware** (required if submitting a performance score)
- **Comment** (short text, optional)

At least one of quality score or performance score must be provided. Both are optional individually to allow edge cases (e.g. rating quality without a relevant hardware context, or flagging performance without a strong opinion on quality).

Aggregate scores displayed on listings:
- Overall quality rating across all submissions
- Per-hardware performance rating where data exists

---

## Permissions

### Anonymous (not logged in)
- Browse, search, filter
- View all listings, ratings, hardware entries, systems

### Logged in
- Everything above
- Submit new listings
- Submit edits to existing listings
- Submit new hardware entries
- Submit ratings
- Submit tags on listings
- File reports
- (Rate limited: maximum X reports per day)
- (Minimum account age before filing reports)

### Logged in with at least one approved submission
- Everything above
- Review and approve/reject pending tags

### Moderator
- Everything above
- Approve or reject listing submissions
- Approve or reject edit submissions
- Approve or reject hardware submissions
- Remove approved listings, ratings, comments, tags
- Ban users
- Review and action reports

### Superadmin
- Everything above
- Review reports filed against moderators
- Manual intervention on any account or content

---

## Moderation System

### Becoming a Moderator
- Minimum 10 approved submissions (qualifying threshold)
- Complaint score below threshold A
- Shown as opt-in toggle in profile settings — qualifying users are invited, not automatically promoted

### Losing Moderator Status
- Complaint score exceeds threshold A
- Status automatically revoked
- Can requalify once score decays back below threshold
	- Losing moderator status: complaint_score exceeds 5.0 (auto-revoke)
	- Account freeze: complaint_score >= 10.0 (restricted to numerical ratings only)

### Account Freeze
- Complaint score exceeds threshold B (higher than mod revocation threshold)
- Frozen accounts can submit numerical ratings only — no text comments, no listings, no edits, no tag submissions
- Not permanent — score decays over time

---

## Complaint Score

Each user has a **complaint_score** (float, default 0.0):

- Increases when an upheld report against that user is actioned, weighted by the reporting user's **report_credibility**
- Decreases by Y points every day automatically (daily background job), floor 0.0
- Sustained bad behaviour keeps score elevated; good behaviour lets it decay naturally
 - Increases when an upheld report against that user is actioned, weighted by the reporting user's **report_credibility**
 - Decreases by 0.1 points every day automatically (daily background job), floor 0.0
 - Sustained bad behaviour keeps score elevated; good behaviour lets it decay naturally

---

## Report Credibility

Each user has a **report_credibility** score (float, default 1.0):

- Nudges up slightly when one of your filed reports is upheld
- Nudges down more significantly when one of your filed reports is dismissed
- Floor 0.0 — reports from a zero-credibility user are still filed and reviewed by moderators, but carry no weight toward the target's complaint score
- Does not decay over time — reflects your track record as a reporter

## Appeals

- Users who are frozen or banned may submit a single appeal per action via an appeals form. Appeals land in the superadmin review queue. Keep the initial appeals process intentionally minimal for MVP.

## External Links Policy

- Only allow direct links to official project websites, official GitHub/GitLab repositories, or recognized distribution platforms (e.g., Steam, itch.io). - No third-party mirrors or pirated distribution links.

---

## Anti-Griefing Measures

- Rate limit on reports filed per day per user
- Minimum account age before a user can file reports
- Report credibility system — serial frivolous reporters naturally lose influence
- Usernames not displayed publicly on submissions (backend retains attribution for moderation)
- Only upheld reports (reviewed and confirmed by a moderator) contribute to complaint scores — frivolous reports that get dismissed have no effect on the target

- Concrete defaults (MVP): max 10 reports per day per user; minimum account age to file reports: 7 days.

---

## Daily Background Jobs

- Decrease every user's `complaint_score` by Y, floor 0.0
- Reset every user's `reports_filed_today` to 0

---

## Database Schema

### User
| Field | Type | Notes |
|---|---|---|
| id | uuid | Primary key — corresponds to `auth.users` id in Supabase (do not store passwords locally)
| username | string | Unique
| email | string | Unique — optional if you rely entirely on Supabase Auth for private data
| created_at | timestamp |
| is_moderator | bool | Default false
| report_credibility | float | Default 1.0
| reports_filed_today | int | Default 0, reset daily
| complaint_score | float | Default 0.0, decays daily

Notes: Supabase Auth manages authentication and passwords. Implement a `profiles` table (or `users_profiles`) that extends `auth.users` with metadata (`is_moderator`, `report_credibility`, `reports_filed_today`, `complaint_score`, etc.). Do NOT store plaintext or hashed passwords in this table — rely on Supabase Auth for all password/session management.

### Software
| Field | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| name | string | |
| description | string | Short, one to two lines |
| category | enum | Ten categories |
| website_url | string | |
| download_url | string | |
| source_url | string | Optional — GitHub/GitLab etc |
| status | enum | active / abandoned / deprecated |
| created_at | timestamp | |
| updated_at | timestamp | |
| submitted_by | uuid | → User |
| approved | bool | Default false |

### System
| Field | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| name | string | e.g. "Nintendo SNES" |
| manufacturer | string | e.g. "Nintendo" |
| type | enum | home console / handheld / arcade / computer / other |

### Platform
| Field | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| name | string | e.g. "SteamOS" |
| group | enum | Windows / macOS / Linux / Mobile / Other |

### Hardware
| Field | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| name | string | e.g. "AYN Thor" |
| manufacturer | string | e.g. "AYN" |
| type | enum | handheld / SBC / modded console / desktop architecture |
| primary_platform_id | uuid | → Platform |

### Tag
| Field | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| name | string | Unique |
| approved | bool | Default false for new tags |
| submitted_by | uuid | → User |
| reviewed_by | uuid | → User, optional |
| created_at | timestamp | |

### SoftwareSystems (junction)
| Field | Type | Notes |
|---|---|---|
| software_id | uuid | → Software |
| system_id | uuid | → System |

### SoftwarePlatforms (junction)
| Field | Type | Notes |
|---|---|---|
| software_id | uuid | → Software |
| platform_id | uuid | → Platform |

### SoftwareHardware (junction)
| Field | Type | Notes |
|---|---|---|
| software_id | uuid | → Software |
| hardware_id | uuid | → Hardware |

### SoftwareTags (junction)
| Field | Type | Notes |
|---|---|---|
| software_id | uuid | → Software |
| tag_id | uuid | → Tag |
| approved | bool | Known tags: true. New tags: false until reviewed |

### Rating
| Field | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| software_id | uuid | → Software |
| user_id | uuid | → User |
| hardware_id | uuid | → Hardware, optional |
| quality_score | int | 1–5, optional |
| performance_score | int | 1–5, optional |
| comment | string | Optional short text |
| created_at | timestamp | |

### Submission
| Field | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| type | enum | new_listing / edit / new_hardware / new_tag |
| submitted_by | uuid | → User |
| status | enum | pending / approved / rejected |
| payload | JSON | Proposed data — shape varies by type |
| target_id | uuid | Optional — for edits, points to existing entity |
| reviewed_by | uuid | → User, optional |
| reviewed_at | timestamp | Optional |
| created_at | timestamp | |

### Report
| Field | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| reporter_id | uuid | → User |
| target_type | enum | listing / edit / rating / comment / tag |
| target_id | uuid | ID of reported content |
| reason | string | Short text |
| status | enum | pending / upheld / dismissed |
| credibility_weight | float | Snapshot of reporter_credibility at time of filing |
| reviewed_by | uuid | → User, optional |
| reviewed_at | timestamp | Optional |
| upheld_at | timestamp | Optional — only set when status = upheld |
| created_at | timestamp | |

---

## Numeric Thresholds (TBD — tune after launch)

The following values are placeholders. Set conservatively at launch and adjust based on real usage patterns.

| Threshold | Value | Description |
|---|---|---|
| Min approved submissions for mod eligibility | TBD | e.g. 10 |
| Complaint score for mod revocation (A) | TBD | e.g. 5.0 |
| Complaint score for account freeze (B) | TBD | e.g. 10.0 |
| Daily complaint score decay (Y) | TBD | e.g. 0.1 |
| Max reports per user per day | TBD | e.g. 10 |
| Minimum account age to file reports (days) | TBD | e.g. 7 |

---

## Notes

- Submission usernames are not displayed publicly. Attribution is retained in the database for moderation purposes only.
- Approved submission count, total submissions, and rejected submissions are all derived from queries against the Submission table — not stored as denormalised counters on User.
- ROM sources are explicitly excluded from the directory scope.
- The hardware list is seeded but not exhaustive — community submissions fill the long tail.
- All numeric thresholds should be revisited after the first month of real usage.

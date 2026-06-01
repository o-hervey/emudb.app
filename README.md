<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./emudb_horizontal_logo_dark.png" />
    <source media="(prefers-color-scheme: light)" srcset="./emudb_horizontal_logo_light.png" />
    <img src="./emudb_horizontal_logo_light.png" width="600" alt="EmuDB.app logo" />
  </picture>
</p>

# emudb.app

A community-driven, filterable directory of emulation software, covering emulators, frontends, operating systems, tools, platforms, hardware compatibility, and user ratings.

## Disclaimer

emudb.app has not yet been deployed or published, and is still actively under development.

## Why use EmuDB.app?

Emulation resources are famously disparate and hard to conveniently find. Like me, you've no doubt found yourself scouring countless YouTube guides, Reddit threads, and Discord groups only to still not find a solid answer to questions such as "Which Dreamcast emulator runs best on muOS?" or "What dual-screen launcher options are currently available for Android, and which one should I try?" We've all been there.

EmuDB.app is the answer. A single, filterable directory of emulators, frontends, operating systems, utilities, and everything else you might need — covering Android, Linux, Windows, dedicated handhelds, modded consoles, and more. Every listing links directly to the official source. No guides, no noise, just the software.

What sets EmuDB.app apart is its rating system. Ratings are split between overall software quality and hardware-specific performance — so you can see not just whether something is good, but whether it runs well on your exact device. A community of contributors submit new listings, rate software, and leave hardware-specific performance reports, so anyone can find a quick and reliable answer to any emulation question.

## What is this repository?

This is the EmuDB.app codebase. At the time of writing, EmuDB.app is maintained by a single person. Any skilled and willing contributors would be greatly appreciated — whether that's code, bug reports, or simply submitting listings through the site itself.

## Stack

- **Framework:** Next.js 16 (App Router)
- **Database:** PostgreSQL via Supabase
- **ORM:** Prisma 7
- **Auth:** Supabase Auth
- **Hosting:** Vercel

## Running locally

**Prerequisites:** Node.js 22+, a Supabase project

1. Clone the repo
```bash
git clone https://github.com/o-hervey/emudb.app.git
cd emudb.app
```

2. Install dependencies
```bash
npm install
```

3. Copy `.env.example` to `.env.local` and fill in your Supabase credentials
```bash
cp .env.example .env.local
```

4. Run the database migration
```bash
npx prisma migrate dev
```

Run this again after pulling changes that include new Prisma migrations.

5. Seed the database
```bash
npx prisma db seed
```

6. Run the auth trigger in your Supabase SQL editor
```sql
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, created_at)
  values (new.id, now());
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

7. Start the development server
```bash
npm run dev
```

## Contributing

Pull requests are welcome. If you've found a bug or have a feature in mind, open an issue and we can discuss it. To contribute listings, ratings, or tags, use the site itself — that's what it's for.

## License

MIT

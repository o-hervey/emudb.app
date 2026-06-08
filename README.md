<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./public/emudb_horizontal_logo_dark.png" />
    <source media="(prefers-color-scheme: light)" srcset="./public/emudb_horizontal_logo_light.png" />
    <img src="./public/emudb_horizontal_logo_light.png" width="560" alt="EmuDB" />
  </picture>
</p>

<p align="center">A community-driven directory of emulation software.</p>

---

Emulation resources are scattered. Answers to basic questions — which emulator handles PS2 well on a Steam Deck, which frontend works on muOS, what are the dual-screen launcher options for Android — are buried across YouTube guides, Reddit threads, and Discord servers.

EmuDB is a filterable directory of emulators, frontends, operating systems, ROM managers, media scrapers, shaders, netplay tools, and everything adjacent. Every listing links directly to the official source. Ratings are split between overall software quality and hardware-specific performance, so you can see not just whether something is generally well-regarded, but whether it runs well on your exact device.

## Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router) |
| Database | PostgreSQL via Supabase |
| ORM | Prisma 7 |
| Auth | Supabase Auth |
| Hosting | Vercel |

## Running locally

**Prerequisites:** Node.js 22+, a Supabase project

```bash
git clone https://github.com/o-hervey/emudb.app.git
cd emudb.app
npm install
cp .env.example .env.local   # fill in your Supabase credentials
npx prisma migrate dev
npx prisma db seed
npm run dev
```

**One-time Supabase setup** — run this in your project's SQL editor to create the profile row on signup:

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

## Contributing

Contributions to the codebase are welcome — open an issue before starting anything substantial. To contribute listings, ratings, or tags, use the site itself.

## License

MIT

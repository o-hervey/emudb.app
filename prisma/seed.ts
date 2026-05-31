import { loadEnvConfig } from "@next/env";
import { PrismaPg } from "@prisma/adapter-pg";
import { HardwareType, PlatformGroup, PrismaClient, SystemType } from "@prisma/client";
import { Pool } from "pg";

loadEnvConfig(process.cwd());

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

// ---------------------------------------------------------------------------
// Platforms
// ---------------------------------------------------------------------------

const platformData: { name: string; group: PlatformGroup }[] = [
  { name: "Windows (x86-64)",      group: PlatformGroup.WINDOWS },
  { name: "Windows (x86-32)",      group: PlatformGroup.WINDOWS },
  { name: "macOS (Apple Silicon)", group: PlatformGroup.MACOS },
  { name: "macOS (Intel)",         group: PlatformGroup.MACOS },
  { name: "SteamOS",               group: PlatformGroup.LINUX },
  { name: "Batocera",              group: PlatformGroup.LINUX },
  { name: "Lakka",                 group: PlatformGroup.LINUX },
  { name: "RetroPie",              group: PlatformGroup.LINUX },
  { name: "RecalBox",              group: PlatformGroup.LINUX },
  { name: "JELOS",                 group: PlatformGroup.LINUX },
  { name: "Knulli",                group: PlatformGroup.LINUX },
  { name: "muOS",                  group: PlatformGroup.LINUX },
  { name: "Other Linux",           group: PlatformGroup.LINUX },
  { name: "Android",               group: PlatformGroup.MOBILE },
  { name: "iOS",                   group: PlatformGroup.MOBILE },
  { name: "Other",                 group: PlatformGroup.OTHER },
];

// ---------------------------------------------------------------------------
// Systems
// ---------------------------------------------------------------------------

const systemData: { name: string; manufacturer: string; type: SystemType }[] = [
  // Atari
  { name: "Atari 2600",                       manufacturer: "Atari",             type: SystemType.HOME },
  { name: "Atari 5200",                       manufacturer: "Atari",             type: SystemType.HOME },
  { name: "Atari 7800",                       manufacturer: "Atari",             type: SystemType.HOME },
  { name: "Atari Jaguar",                     manufacturer: "Atari",             type: SystemType.HOME },
  { name: "Atari Lynx",                       manufacturer: "Atari",             type: SystemType.HANDHELD },
  { name: "Atari ST",                         manufacturer: "Atari",             type: SystemType.COMPUTER },
  // Bandai
  { name: "WonderSwan",                       manufacturer: "Bandai",            type: SystemType.HANDHELD },
  { name: "WonderSwan Color",                 manufacturer: "Bandai",            type: SystemType.HANDHELD },
  // Coleco
  { name: "ColecoVision",                     manufacturer: "Coleco",            type: SystemType.HOME },
  // Commodore
  { name: "Commodore 64",                     manufacturer: "Commodore",         type: SystemType.COMPUTER },
  { name: "Amiga",                            manufacturer: "Commodore",         type: SystemType.COMPUTER },
  { name: "Amiga CD32",                       manufacturer: "Commodore",         type: SystemType.HOME },
  // GCE
  { name: "Vectrex",                          manufacturer: "GCE",               type: SystemType.HOME },
  // Magnavox
  { name: "Magnavox Odyssey2",                manufacturer: "Magnavox",          type: SystemType.HOME },
  // Mattel
  { name: "Mattel Intellivision",             manufacturer: "Mattel",            type: SystemType.HOME },
  // Microsoft
  { name: "MS-DOS",                           manufacturer: "Microsoft",         type: SystemType.COMPUTER },
  // MSX
  { name: "MSX",                              manufacturer: "Various",           type: SystemType.COMPUTER },
  { name: "MSX2",                             manufacturer: "Various",           type: SystemType.COMPUTER },
  // NEC
  { name: "PC Engine / TurboGrafx-16",        manufacturer: "NEC",               type: SystemType.HOME },
  { name: "SuperGrafx",                       manufacturer: "NEC",               type: SystemType.HOME },
  { name: "PC Engine CD / TurboGrafx-CD",     manufacturer: "NEC",               type: SystemType.HOME },
  { name: "PC-FX",                            manufacturer: "NEC",               type: SystemType.HOME },
  { name: "PC-88",                            manufacturer: "NEC",               type: SystemType.COMPUTER },
  { name: "PC-98",                            manufacturer: "NEC",               type: SystemType.COMPUTER },
  // Nintendo
  { name: "Nintendo Entertainment System",    manufacturer: "Nintendo",          type: SystemType.HOME },
  { name: "Famicom Disk System",              manufacturer: "Nintendo",          type: SystemType.HOME },
  { name: "Super Nintendo Entertainment System", manufacturer: "Nintendo",       type: SystemType.HOME },
  { name: "Nintendo 64",                      manufacturer: "Nintendo",          type: SystemType.HOME },
  { name: "Nintendo GameCube",                manufacturer: "Nintendo",          type: SystemType.HOME },
  { name: "Nintendo Wii",                     manufacturer: "Nintendo",          type: SystemType.HOME },
  { name: "Nintendo Wii U",                   manufacturer: "Nintendo",          type: SystemType.HOME },
  { name: "Game Boy",                         manufacturer: "Nintendo",          type: SystemType.HANDHELD },
  { name: "Game Boy Color",                   manufacturer: "Nintendo",          type: SystemType.HANDHELD },
  { name: "Game Boy Advance",                 manufacturer: "Nintendo",          type: SystemType.HANDHELD },
  { name: "Nintendo DS",                      manufacturer: "Nintendo",          type: SystemType.HANDHELD },
  { name: "Nintendo 3DS",                     manufacturer: "Nintendo",          type: SystemType.HANDHELD },
  { name: "Virtual Boy",                      manufacturer: "Nintendo",          type: SystemType.HOME },
  { name: "Pokémon Mini",                     manufacturer: "Nintendo",          type: SystemType.HANDHELD },
  // Panasonic
  { name: "3DO Interactive Multiplayer",      manufacturer: "Panasonic",         type: SystemType.HOME },
  // Sega
  { name: "Sega SG-1000",                     manufacturer: "Sega",              type: SystemType.HOME },
  { name: "Sega Master System",               manufacturer: "Sega",              type: SystemType.HOME },
  { name: "Sega Game Gear",                   manufacturer: "Sega",              type: SystemType.HANDHELD },
  { name: "Sega Mega Drive / Genesis",        manufacturer: "Sega",              type: SystemType.HOME },
  { name: "Sega 32X",                         manufacturer: "Sega",              type: SystemType.HOME },
  { name: "Sega Mega-CD / Sega CD",           manufacturer: "Sega",              type: SystemType.HOME },
  { name: "Sega Saturn",                      manufacturer: "Sega",              type: SystemType.HOME },
  { name: "Sega Dreamcast",                   manufacturer: "Sega",              type: SystemType.HOME },
  // Sharp
  { name: "Sharp X68000",                     manufacturer: "Sharp",             type: SystemType.COMPUTER },
  // Sinclair
  { name: "Sinclair ZX81",                    manufacturer: "Sinclair",          type: SystemType.COMPUTER },
  { name: "Sinclair ZX Spectrum",             manufacturer: "Sinclair",          type: SystemType.COMPUTER },
  // SNK
  { name: "Neo Geo AES",                      manufacturer: "SNK",               type: SystemType.HOME },
  { name: "Neo Geo CD",                       manufacturer: "SNK",               type: SystemType.HOME },
  { name: "Neo Geo Pocket",                   manufacturer: "SNK",               type: SystemType.HANDHELD },
  { name: "Neo Geo Pocket Color",             manufacturer: "SNK",               type: SystemType.HANDHELD },
  // Sony
  { name: "PlayStation",                      manufacturer: "Sony",              type: SystemType.HOME },
  { name: "PlayStation 2",                    manufacturer: "Sony",              type: SystemType.HOME },
  { name: "PlayStation Portable",             manufacturer: "Sony",              type: SystemType.HANDHELD },
  { name: "PlayStation Vita",                 manufacturer: "Sony",              type: SystemType.HANDHELD },
  // Texas Instruments
  { name: "Texas Instruments TI-83",          manufacturer: "Texas Instruments", type: SystemType.OTHER },
  // Arcade
  { name: "Arcade (MAME)",                    manufacturer: "Various",           type: SystemType.ARCADE },
  { name: "Arcade (FinalBurn Neo)",           manufacturer: "Various",           type: SystemType.ARCADE },
  // Game engines / interpreters
  { name: "ScummVM",                          manufacturer: "Various",           type: SystemType.COMPUTER },
  { name: "DOSBox",                           manufacturer: "Various",           type: SystemType.COMPUTER },
  { name: "CHIP-8",                           manufacturer: "Various",           type: SystemType.OTHER },
  { name: "RPG Maker (EasyRPG)",              manufacturer: "Various",           type: SystemType.OTHER },
];

// ---------------------------------------------------------------------------
// Hardware  (platformName resolved to id after platforms are inserted)
// ---------------------------------------------------------------------------

const hardwareData: {
  name: string;
  manufacturer: string;
  type: HardwareType;
  platformName: string | null;
}[] = [
  // Valve
  { name: "Steam Deck LCD",        manufacturer: "Valve",                    type: HardwareType.HANDHELD,              platformName: "SteamOS" },
  { name: "Steam Deck OLED",       manufacturer: "Valve",                    type: HardwareType.HANDHELD,              platformName: "SteamOS" },
  // Retroid
  { name: "Retroid Pocket 4",      manufacturer: "Retroid",                  type: HardwareType.HANDHELD,              platformName: "Android" },
  { name: "Retroid Pocket 4 Pro",  manufacturer: "Retroid",                  type: HardwareType.HANDHELD,              platformName: "Android" },
  { name: "Retroid Pocket 5",      manufacturer: "Retroid",                  type: HardwareType.HANDHELD,              platformName: "Android" },
  { name: "Retroid Pocket Flip 2", manufacturer: "Retroid",                  type: HardwareType.HANDHELD,              platformName: "Android" },
  // AYN
  { name: "AYN Odin 2",            manufacturer: "AYN",                      type: HardwareType.HANDHELD,              platformName: "Android" },
  { name: "AYN Odin 3",            manufacturer: "AYN",                      type: HardwareType.HANDHELD,              platformName: "Android" },
  { name: "AYN Thor",              manufacturer: "AYN",                      type: HardwareType.HANDHELD,              platformName: "Android" },
  { name: "AYN Thor Lite",         manufacturer: "AYN",                      type: HardwareType.HANDHELD,              platformName: "Android" },
  // AYANEO
  { name: "AYANEO Pocket S",       manufacturer: "AYANEO",                   type: HardwareType.HANDHELD,              platformName: "Android" },
  { name: "AYANEO Pocket DMG",     manufacturer: "AYANEO",                   type: HardwareType.HANDHELD,              platformName: "Android" },
  { name: "AYANEO Pocket DS",      manufacturer: "AYANEO",                   type: HardwareType.HANDHELD,              platformName: "Android" },
  // Anbernic
  { name: "RG35XX Plus",           manufacturer: "Anbernic",                 type: HardwareType.HANDHELD,              platformName: "Other Linux" },
  { name: "RG35XX H",              manufacturer: "Anbernic",                 type: HardwareType.HANDHELD,              platformName: "Other Linux" },
  { name: "RG40XX H",             manufacturer: "Anbernic",                 type: HardwareType.HANDHELD,              platformName: "Other Linux" },
  { name: "RG40XX V",              manufacturer: "Anbernic",                 type: HardwareType.HANDHELD,              platformName: "Other Linux" },
  { name: "RG556",                 manufacturer: "Anbernic",                 type: HardwareType.HANDHELD,              platformName: "Android" },
  { name: "RG406V",                manufacturer: "Anbernic",                 type: HardwareType.HANDHELD,              platformName: "Android" },
  { name: "RG406H",                manufacturer: "Anbernic",                 type: HardwareType.HANDHELD,              platformName: "Android" },
  { name: "RG353V",                manufacturer: "Anbernic",                 type: HardwareType.HANDHELD,              platformName: "Other Linux" },
  { name: "RG353M",                manufacturer: "Anbernic",                 type: HardwareType.HANDHELD,              platformName: "Other Linux" },
  // Miyoo
  { name: "Miyoo Mini+",           manufacturer: "Miyoo",                    type: HardwareType.HANDHELD,              platformName: "Other Linux" },
  { name: "Miyoo Flip",            manufacturer: "Miyoo",                    type: HardwareType.HANDHELD,              platformName: "Other Linux" },
  { name: "Miyoo A30",             manufacturer: "Miyoo",                    type: HardwareType.HANDHELD,              platformName: "Other Linux" },
  // TrimUI
  { name: "TrimUI Smart Pro",      manufacturer: "TrimUI",                   type: HardwareType.HANDHELD,              platformName: "Other Linux" },
  { name: "TrimUI Brick",          manufacturer: "TrimUI",                   type: HardwareType.HANDHELD,              platformName: "Other Linux" },
  // Powkiddy
  { name: "RGB30",                 manufacturer: "Powkiddy",                 type: HardwareType.HANDHELD,              platformName: "Other Linux" },
  { name: "X55",                   manufacturer: "Powkiddy",                 type: HardwareType.HANDHELD,              platformName: "Other Linux" },
  // Raspberry Pi
  { name: "Raspberry Pi 3B+",      manufacturer: "Raspberry Pi Foundation",  type: HardwareType.SBC,                   platformName: "Other Linux" },
  { name: "Raspberry Pi 4",        manufacturer: "Raspberry Pi Foundation",  type: HardwareType.SBC,                   platformName: "Other Linux" },
  { name: "Raspberry Pi 5",        manufacturer: "Raspberry Pi Foundation",  type: HardwareType.SBC,                   platformName: "Other Linux" },
  { name: "Raspberry Pi Zero 2W",  manufacturer: "Raspberry Pi Foundation",  type: HardwareType.SBC,                   platformName: "Other Linux" },
  // GPD
  { name: "GPD Win 4",             manufacturer: "GPD",                      type: HardwareType.HANDHELD,              platformName: "Windows (x86-64)" },
  { name: "GPD Win Mini",          manufacturer: "GPD",                      type: HardwareType.HANDHELD,              platformName: "Windows (x86-64)" },
  // OneXPlayer
  { name: "ONEXSUGAR",             manufacturer: "OneXPlayer",               type: HardwareType.HANDHELD,              platformName: "Windows (x86-64)" },
  // Modded consoles
  { name: "Nintendo Switch",       manufacturer: "Nintendo",                 type: HardwareType.MODDED_CONSOLE,        platformName: "Other Linux" },
  { name: "Nintendo Wii",          manufacturer: "Nintendo",                 type: HardwareType.MODDED_CONSOLE,        platformName: "Other" },
  { name: "Nintendo Wii U",        manufacturer: "Nintendo",                 type: HardwareType.MODDED_CONSOLE,        platformName: "Other" },
  { name: "Old 3DS / 2DS",         manufacturer: "Nintendo",                 type: HardwareType.MODDED_CONSOLE,        platformName: "Other" },
  { name: "New 3DS / New 2DS XL",  manufacturer: "Nintendo",                 type: HardwareType.MODDED_CONSOLE,        platformName: "Other" },
  { name: "Nintendo DSi",          manufacturer: "Nintendo",                 type: HardwareType.MODDED_CONSOLE,        platformName: "Other" },
  { name: "Game Boy Advance",      manufacturer: "Nintendo",                 type: HardwareType.MODDED_CONSOLE,        platformName: "Other" },
  { name: "PlayStation Portable",  manufacturer: "Sony",                     type: HardwareType.MODDED_CONSOLE,        platformName: "Other" },
  { name: "PlayStation Vita",      manufacturer: "Sony",                     type: HardwareType.MODDED_CONSOLE,        platformName: "Other" },
  { name: "PlayStation 2",         manufacturer: "Sony",                     type: HardwareType.MODDED_CONSOLE,        platformName: "Other" },
  { name: "PlayStation 3",         manufacturer: "Sony",                     type: HardwareType.MODDED_CONSOLE,        platformName: "Other" },
  { name: "PlayStation Classic",   manufacturer: "Sony",                     type: HardwareType.MODDED_CONSOLE,        platformName: "Other Linux" },
  { name: "Xbox (Original)",       manufacturer: "Microsoft",                type: HardwareType.MODDED_CONSOLE,        platformName: "Other" },
  { name: "Xbox 360",              manufacturer: "Microsoft",                type: HardwareType.MODDED_CONSOLE,        platformName: "Other" },
  { name: "Sega Dreamcast",        manufacturer: "Sega",                     type: HardwareType.MODDED_CONSOLE,        platformName: "Other" },
  // Desktop architecture
  { name: "x86-64",                manufacturer: "Various",                  type: HardwareType.DESKTOP_ARCHITECTURE, platformName: "Windows (x86-64)" },
  { name: "x86-32",                manufacturer: "Various",                  type: HardwareType.DESKTOP_ARCHITECTURE, platformName: "Windows (x86-32)" },
  { name: "Apple Silicon",         manufacturer: "Apple",                    type: HardwareType.DESKTOP_ARCHITECTURE, platformName: "macOS (Apple Silicon)" },
  { name: "Intel Mac",             manufacturer: "Apple",                    type: HardwareType.DESKTOP_ARCHITECTURE, platformName: "macOS (Intel)" },
];

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const existing = await prisma.platform.count();
  if (existing > 0) {
    console.log("Seed data already present — skipping.");
    return;
  }

  console.log("Seeding platforms...");
  await prisma.platform.createMany({ data: platformData });

  console.log("Seeding systems...");
  await prisma.system.createMany({ data: systemData });

  console.log("Seeding hardware...");
  const platforms = await prisma.platform.findMany({ select: { id: true, name: true } });
  const platformById = Object.fromEntries(platforms.map((p) => [p.name, p.id]));

  await prisma.hardware.createMany({
    data: hardwareData.map(({ platformName, ...rest }) => ({
      ...rest,
      primaryPlatformId: platformName ? platformById[platformName] : undefined,
    })),
  });

  console.log(
    `Done: ${platformData.length} platforms, ${systemData.length} systems, ${hardwareData.length} hardware entries.`
  );
}

main()
  .catch(console.error)
  .finally(() => pool.end());

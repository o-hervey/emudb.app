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
  // Windows
  { name: "Windows (x86-64)",      group: PlatformGroup.WINDOWS },
  { name: "Windows (x86-32)",      group: PlatformGroup.WINDOWS },
  { name: "Windows (ARM)",         group: PlatformGroup.WINDOWS },
  // macOS
  { name: "macOS (Apple Silicon)", group: PlatformGroup.MACOS },
  { name: "macOS (Intel)",         group: PlatformGroup.MACOS },
  // Linux
  { name: "SteamOS",               group: PlatformGroup.LINUX },
  { name: "Bazzite",               group: PlatformGroup.LINUX },
  { name: "Nobara",                group: PlatformGroup.LINUX },
  { name: "ChimeraOS",             group: PlatformGroup.LINUX },
  { name: "Batocera",              group: PlatformGroup.LINUX },
  { name: "Lakka",                 group: PlatformGroup.LINUX },
  { name: "Recalbox",              group: PlatformGroup.LINUX },
  { name: "RetroPie",              group: PlatformGroup.LINUX },
  { name: "Knulli",                group: PlatformGroup.LINUX },
  { name: "muOS",                  group: PlatformGroup.LINUX },
  { name: "GarlicOS",              group: PlatformGroup.LINUX },
  { name: "OnionOS",               group: PlatformGroup.LINUX },
  { name: "ROCKNIX",               group: PlatformGroup.LINUX },
  { name: "JELOS",                 group: PlatformGroup.LINUX },
  { name: "AmberELEC",             group: PlatformGroup.LINUX },
  { name: "ArkOS",                 group: PlatformGroup.LINUX },
  { name: "CrossMix",              group: PlatformGroup.LINUX },
  { name: "SpruceOS",              group: PlatformGroup.LINUX },
  { name: "MinUI",                 group: PlatformGroup.LINUX },
  { name: "Other Linux",           group: PlatformGroup.LINUX },
  // Mobile
  { name: "Android",               group: PlatformGroup.MOBILE },
  { name: "iOS",                   group: PlatformGroup.MOBILE },
  // Console CFW / Homebrew
  { name: "Atmosphere",            group: PlatformGroup.CONSOLE },
  { name: "Luma3DS",               group: PlatformGroup.CONSOLE },
  { name: "TWiLight Menu++",       group: PlatformGroup.CONSOLE },
  { name: "Aroma",                 group: PlatformGroup.CONSOLE },
  { name: "Homebrew Channel",      group: PlatformGroup.CONSOLE },
  { name: "HENkaku / Enso",        group: PlatformGroup.CONSOLE },
  { name: "ARK-4",                 group: PlatformGroup.CONSOLE },
  { name: "OPL",                   group: PlatformGroup.CONSOLE },
  { name: "WebMAN MOD",            group: PlatformGroup.CONSOLE },
  { name: "PS3HEN",                group: PlatformGroup.CONSOLE },
  { name: "EverDrive",             group: PlatformGroup.CONSOLE },
  { name: "ezFlash",               group: PlatformGroup.CONSOLE },
  { name: "R4",                    group: PlatformGroup.CONSOLE },
  { name: "SummerCart64",          group: PlatformGroup.CONSOLE },
  { name: "MiSTer FPGA",           group: PlatformGroup.CONSOLE },
  { name: "Analogue OS",           group: PlatformGroup.CONSOLE },
  { name: "Other CFW",             group: PlatformGroup.CONSOLE },
  // Other
  { name: "Other",                 group: PlatformGroup.OTHER },
];

// ---------------------------------------------------------------------------
// Systems
// ---------------------------------------------------------------------------

const systemData: { name: string; manufacturer: string; type: SystemType }[] = [
  // Adobe
  { name: "Adobe Flash",                       manufacturer: "Adobe",             type: SystemType.OTHER },
  // Amstrad
  { name: "Amstrad CPC",                       manufacturer: "Amstrad",           type: SystemType.COMPUTER },
  // Apple
  { name: "Apple II",                          manufacturer: "Apple",             type: SystemType.COMPUTER },
  { name: "Apple Macintosh",                   manufacturer: "Apple",             type: SystemType.COMPUTER },
  // Arduboy
  { name: "Arduboy",                           manufacturer: "Arduboy",           type: SystemType.OTHER },
  // Atari
  { name: "Atari 2600",                        manufacturer: "Atari",             type: SystemType.HOME },
  { name: "Atari 5200",                        manufacturer: "Atari",             type: SystemType.HOME },
  { name: "Atari 7800",                        manufacturer: "Atari",             type: SystemType.HOME },
  { name: "Atari Jaguar",                      manufacturer: "Atari",             type: SystemType.HOME },
  { name: "Atari Jaguar CD",                   manufacturer: "Atari",             type: SystemType.HOME },
  { name: "Atari Lynx",                        manufacturer: "Atari",             type: SystemType.HANDHELD },
  { name: "Atari ST/STE/TT/Falcon",            manufacturer: "Atari",             type: SystemType.COMPUTER },
  // Acorn
  { name: "BBC Micro",                         manufacturer: "Acorn",             type: SystemType.COMPUTER },
  // Bandai
  { name: "WonderSwan",                        manufacturer: "Bandai",            type: SystemType.HANDHELD },
  { name: "WonderSwan Color",                  manufacturer: "Bandai",            type: SystemType.HANDHELD },
  // Coleco
  { name: "ColecoVision",                      manufacturer: "Coleco",            type: SystemType.HOME },
  // Commodore
  { name: "Commodore 64",                      manufacturer: "Commodore",         type: SystemType.COMPUTER },
  { name: "Amiga",                             manufacturer: "Commodore",         type: SystemType.COMPUTER },
  { name: "Amiga CD32",                        manufacturer: "Commodore",         type: SystemType.HOME },
  // Emerson
  { name: "Arcadia 2001",                      manufacturer: "Emerson",           type: SystemType.HOME },
  // Epoch
  { name: "Super Cassette Vision",             manufacturer: "Epoch",             type: SystemType.HOME },
  // Enterprise
  { name: "Enterprise 128",                    manufacturer: "Enterprise",        type: SystemType.COMPUTER },
  // GCE
  { name: "Vectrex",                           manufacturer: "GCE",               type: SystemType.HOME },
  // Magnavox
  { name: "Magnavox Odyssey2",                 manufacturer: "Magnavox",          type: SystemType.HOME },
  // Mattel
  { name: "Mattel Intellivision",              manufacturer: "Mattel",            type: SystemType.HOME },
  // Microsoft
  { name: "MS-DOS",                            manufacturer: "Microsoft",         type: SystemType.COMPUTER },
  { name: "Xbox",                              manufacturer: "Microsoft",         type: SystemType.HOME },
  { name: "Xbox 360",                          manufacturer: "Microsoft",         type: SystemType.HOME },
  // NEC
  { name: "PC Engine / TurboGrafx-16",         manufacturer: "NEC",               type: SystemType.HOME },
  { name: "SuperGrafx",                        manufacturer: "NEC",               type: SystemType.HOME },
  { name: "PC Engine CD / TurboGrafx-CD",      manufacturer: "NEC",               type: SystemType.HOME },
  { name: "PC-FX",                             manufacturer: "NEC",               type: SystemType.HOME },
  { name: "PC-88",                             manufacturer: "NEC",               type: SystemType.COMPUTER },
  { name: "PC-98",                             manufacturer: "NEC",               type: SystemType.COMPUTER },
  // Nintendo
  { name: "Nintendo Entertainment System",     manufacturer: "Nintendo",          type: SystemType.HOME },
  { name: "Famicom Disk System",               manufacturer: "Nintendo",          type: SystemType.HOME },
  { name: "Satellaview",                       manufacturer: "Nintendo",          type: SystemType.HOME },
  { name: "Super Nintendo Entertainment System", manufacturer: "Nintendo",        type: SystemType.HOME },
  { name: "Nintendo 64",                       manufacturer: "Nintendo",          type: SystemType.HOME },
  { name: "Nintendo 64DD",                     manufacturer: "Nintendo",          type: SystemType.HOME },
  { name: "Nintendo GameCube",                 manufacturer: "Nintendo",          type: SystemType.HOME },
  { name: "Nintendo Wii",                      manufacturer: "Nintendo",          type: SystemType.HOME },
  { name: "Nintendo Wii U",                    manufacturer: "Nintendo",          type: SystemType.HOME },
  { name: "Nintendo Switch",                   manufacturer: "Nintendo",          type: SystemType.HOME },
  { name: "Game Boy",                          manufacturer: "Nintendo",          type: SystemType.HANDHELD },
  { name: "Game Boy Color",                    manufacturer: "Nintendo",          type: SystemType.HANDHELD },
  { name: "Game Boy Advance",                  manufacturer: "Nintendo",          type: SystemType.HANDHELD },
  { name: "Nintendo DS",                       manufacturer: "Nintendo",          type: SystemType.HANDHELD },
  { name: "Nintendo 3DS",                      manufacturer: "Nintendo",          type: SystemType.HANDHELD },
  { name: "Virtual Boy",                       manufacturer: "Nintendo",          type: SystemType.HOME },
  { name: "Pokémon Mini",                      manufacturer: "Nintendo",          type: SystemType.HANDHELD },
  { name: "Game & Watch",                      manufacturer: "Nintendo",          type: SystemType.HANDHELD },
  // Palm
  { name: "Palm OS",                           manufacturer: "Palm",              type: SystemType.OTHER },
  // Panasonic
  { name: "3DO",                               manufacturer: "Panasonic",         type: SystemType.HOME },
  // Philips
  { name: "Philips CDi",                       manufacturer: "Philips",           type: SystemType.HOME },
  // Sega
  { name: "Sega SG-1000",                      manufacturer: "Sega",              type: SystemType.HOME },
  { name: "Sega Master System",                manufacturer: "Sega",              type: SystemType.HOME },
  { name: "Sega Game Gear",                    manufacturer: "Sega",              type: SystemType.HANDHELD },
  { name: "Sega Mega Drive / Genesis",         manufacturer: "Sega",              type: SystemType.HOME },
  { name: "Sega 32X",                          manufacturer: "Sega",              type: SystemType.HOME },
  { name: "Sega Mega-CD / Sega CD",            manufacturer: "Sega",              type: SystemType.HOME },
  { name: "Sega Saturn",                       manufacturer: "Sega",              type: SystemType.HOME },
  { name: "Sega Dreamcast",                    manufacturer: "Sega",              type: SystemType.HOME },
  { name: "Sega Dreamcast VMU",                manufacturer: "Sega",              type: SystemType.OTHER },
  // Sharp
  { name: "Sharp X68000",                      manufacturer: "Sharp",             type: SystemType.COMPUTER },
  // Sinclair
  { name: "Sinclair ZX81",                     manufacturer: "Sinclair",          type: SystemType.COMPUTER },
  { name: "Sinclair ZX Spectrum",              manufacturer: "Sinclair",          type: SystemType.COMPUTER },
  // SNK
  { name: "Neo Geo AES",                       manufacturer: "SNK",               type: SystemType.HOME },
  { name: "Neo Geo CD",                        manufacturer: "SNK",               type: SystemType.HOME },
  { name: "Neo Geo Pocket",                    manufacturer: "SNK",               type: SystemType.HANDHELD },
  { name: "Neo Geo Pocket Color",              manufacturer: "SNK",               type: SystemType.HANDHELD },
  // Sony
  { name: "PlayStation",                       manufacturer: "Sony",              type: SystemType.HOME },
  { name: "PlayStation 2",                     manufacturer: "Sony",              type: SystemType.HOME },
  { name: "PlayStation 3",                     manufacturer: "Sony",              type: SystemType.HOME },
  { name: "PlayStation 4",                     manufacturer: "Sony",              type: SystemType.HOME },
  { name: "PlayStation Portable",              manufacturer: "Sony",              type: SystemType.HANDHELD },
  { name: "PlayStation Vita",                  manufacturer: "Sony",              type: SystemType.HANDHELD },
  // Texas Instruments
  { name: "Texas Instruments TI-83",           manufacturer: "Texas Instruments", type: SystemType.OTHER },
  // Thomson
  { name: "Thomson MO/TO",                     manufacturer: "Thomson",           type: SystemType.COMPUTER },
  // Various
  { name: "MSX",                               manufacturer: "Various",           type: SystemType.COMPUTER },
  { name: "MSX2",                              manufacturer: "Various",           type: SystemType.COMPUTER },
  { name: "MSX SVI",                           manufacturer: "Various",           type: SystemType.COMPUTER },
  { name: "Mega Duck",                         manufacturer: "Various",           type: SystemType.HANDHELD },
  { name: "CHIP-8",                            manufacturer: "Various",           type: SystemType.OTHER },
  { name: "Arcade (MAME)",                     manufacturer: "Various",           type: SystemType.ARCADE },
  { name: "Arcade (FinalBurn Neo)",            manufacturer: "Various",           type: SystemType.ARCADE },
  { name: "ScummVM",                           manufacturer: "Various",           type: SystemType.COMPUTER },
  { name: "DOSBox",                            manufacturer: "Various",           type: SystemType.COMPUTER },
  { name: "RPG Maker (EasyRPG)",               manufacturer: "Various",           type: SystemType.OTHER },
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
  { name: "Steam Deck LCD",              manufacturer: "Valve",                   type: HardwareType.HANDHELD,             platformName: "SteamOS" },
  { name: "Steam Deck OLED",             manufacturer: "Valve",                   type: HardwareType.HANDHELD,             platformName: "SteamOS" },
  // ASUS
  { name: "ROG Ally",                    manufacturer: "ASUS",                    type: HardwareType.HANDHELD,             platformName: "Windows (x86-64)" },
  { name: "ROG Ally X",                  manufacturer: "ASUS",                    type: HardwareType.HANDHELD,             platformName: "Windows (x86-64)" },
  { name: "ROG Xbox Ally",               manufacturer: "ASUS",                    type: HardwareType.HANDHELD,             platformName: "Windows (x86-64)" },
  { name: "ROG Xbox Ally X",             manufacturer: "ASUS",                    type: HardwareType.HANDHELD,             platformName: "Windows (x86-64)" },
  // Lenovo
  { name: "Legion Go",                   manufacturer: "Lenovo",                  type: HardwareType.HANDHELD,             platformName: "Windows (x86-64)" },
  { name: "Legion Go 2",                 manufacturer: "Lenovo",                  type: HardwareType.HANDHELD,             platformName: "Windows (x86-64)" },
  // MSI
  { name: "MSI Claw A8",                 manufacturer: "MSI",                     type: HardwareType.HANDHELD,             platformName: "Windows (x86-64)" },
  // GPD
  { name: "GPD Win",                     manufacturer: "GPD",                     type: HardwareType.HANDHELD,             platformName: "Windows (x86-64)" },
  { name: "GPD Win 2",                   manufacturer: "GPD",                     type: HardwareType.HANDHELD,             platformName: "Windows (x86-64)" },
  { name: "GPD Win 3",                   manufacturer: "GPD",                     type: HardwareType.HANDHELD,             platformName: "Windows (x86-64)" },
  { name: "GPD Win 4",                   manufacturer: "GPD",                     type: HardwareType.HANDHELD,             platformName: "Windows (x86-64)" },
  { name: "GPD Win Mini",                manufacturer: "GPD",                     type: HardwareType.HANDHELD,             platformName: "Windows (x86-64)" },
  { name: "GPD Win Max 2",               manufacturer: "GPD",                     type: HardwareType.HANDHELD,             platformName: "Windows (x86-64)" },
  { name: "GPD Win 5",                   manufacturer: "GPD",                     type: HardwareType.HANDHELD,             platformName: "Windows (x86-64)" },
  // OneXPlayer
  { name: "ONEXPLAYER 1",                manufacturer: "OneXPlayer",              type: HardwareType.HANDHELD,             platformName: "Windows (x86-64)" },
  { name: "ONEXPLAYER 1 Mini",           manufacturer: "OneXPlayer",              type: HardwareType.HANDHELD,             platformName: "Windows (x86-64)" },
  { name: "ONEXPLAYER 2",                manufacturer: "OneXPlayer",              type: HardwareType.HANDHELD,             platformName: "Windows (x86-64)" },
  { name: "ONEXPLAYER Mini Pro",         manufacturer: "OneXPlayer",              type: HardwareType.HANDHELD,             platformName: "Windows (x86-64)" },
  { name: "ONEXFLY",                     manufacturer: "OneXPlayer",              type: HardwareType.HANDHELD,             platformName: "Windows (x86-64)" },
  { name: "ONEXFLY F1 Pro",              manufacturer: "OneXPlayer",              type: HardwareType.HANDHELD,             platformName: "Windows (x86-64)" },
  { name: "ONEXFLY Apex",                manufacturer: "OneXPlayer",              type: HardwareType.HANDHELD,             platformName: "Windows (x86-64)" },
  { name: "ONEXPLAYER X1",               manufacturer: "OneXPlayer",              type: HardwareType.HANDHELD,             platformName: "Windows (x86-64)" },
  { name: "ONEXPLAYER X1 Pro",           manufacturer: "OneXPlayer",              type: HardwareType.HANDHELD,             platformName: "Windows (x86-64)" },
  { name: "ONEXPLAYER X1 Mini",          manufacturer: "OneXPlayer",              type: HardwareType.HANDHELD,             platformName: "Windows (x86-64)" },
  { name: "ONEXPLAYER X1 Air",           manufacturer: "OneXPlayer",              type: HardwareType.HANDHELD,             platformName: "Windows (x86-64)" },
  { name: "ONEXSUGAR",                   manufacturer: "OneXPlayer",              type: HardwareType.HANDHELD,             platformName: "Android" },
  { name: "ONEXPLAYER G1",               manufacturer: "OneXPlayer",              type: HardwareType.HANDHELD,             platformName: "Windows (x86-64)" },
  // Retroid
  { name: "Retroid Pocket",              manufacturer: "Retroid",                 type: HardwareType.HANDHELD,             platformName: "Android" },
  { name: "Retroid Pocket 2",            manufacturer: "Retroid",                 type: HardwareType.HANDHELD,             platformName: "Android" },
  { name: "Retroid Pocket 2+",           manufacturer: "Retroid",                 type: HardwareType.HANDHELD,             platformName: "Android" },
  { name: "Retroid Pocket 2S",           manufacturer: "Retroid",                 type: HardwareType.HANDHELD,             platformName: "Android" },
  { name: "Retroid Pocket 3",            manufacturer: "Retroid",                 type: HardwareType.HANDHELD,             platformName: "Android" },
  { name: "Retroid Pocket 3+",           manufacturer: "Retroid",                 type: HardwareType.HANDHELD,             platformName: "Android" },
  { name: "Retroid Pocket 4",            manufacturer: "Retroid",                 type: HardwareType.HANDHELD,             platformName: "Android" },
  { name: "Retroid Pocket 4 Pro",        manufacturer: "Retroid",                 type: HardwareType.HANDHELD,             platformName: "Android" },
  { name: "Retroid Pocket 5",            manufacturer: "Retroid",                 type: HardwareType.HANDHELD,             platformName: "Android" },
  { name: "Retroid Pocket 6",            manufacturer: "Retroid",                 type: HardwareType.HANDHELD,             platformName: "Android" },
  { name: "Retroid Pocket Mini",         manufacturer: "Retroid",                 type: HardwareType.HANDHELD,             platformName: "Android" },
  { name: "Retroid Pocket Mini V2",      manufacturer: "Retroid",                 type: HardwareType.HANDHELD,             platformName: "Android" },
  { name: "Retroid Pocket Flip",         manufacturer: "Retroid",                 type: HardwareType.HANDHELD,             platformName: "Android" },
  { name: "Retroid Pocket Flip 2",       manufacturer: "Retroid",                 type: HardwareType.HANDHELD,             platformName: "Android" },
  { name: "Retroid Pocket Classic",      manufacturer: "Retroid",                 type: HardwareType.HANDHELD,             platformName: "Android" },
  // AYN
  { name: "Odin",                        manufacturer: "AYN",                     type: HardwareType.HANDHELD,             platformName: "Android" },
  { name: "Odin Lite",                   manufacturer: "AYN",                     type: HardwareType.HANDHELD,             platformName: "Android" },
  { name: "Odin 2",                      manufacturer: "AYN",                     type: HardwareType.HANDHELD,             platformName: "Android" },
  { name: "Odin 2 Mini",                 manufacturer: "AYN",                     type: HardwareType.HANDHELD,             platformName: "Android" },
  { name: "Odin 2 Portal",               manufacturer: "AYN",                     type: HardwareType.HANDHELD,             platformName: "Android" },
  { name: "Odin 3",                      manufacturer: "AYN",                     type: HardwareType.HANDHELD,             platformName: "Android" },
  { name: "Thor",                        manufacturer: "AYN",                     type: HardwareType.HANDHELD,             platformName: "Android" },
  { name: "Thor Lite",                   manufacturer: "AYN",                     type: HardwareType.HANDHELD,             platformName: "Android" },
  // AYANEO — Android
  { name: "AYANEO Pocket S",             manufacturer: "AYANEO",                  type: HardwareType.HANDHELD,             platformName: "Android" },
  { name: "AYANEO Pocket S2",            manufacturer: "AYANEO",                  type: HardwareType.HANDHELD,             platformName: "Android" },
  { name: "AYANEO Pocket S Mini",        manufacturer: "AYANEO",                  type: HardwareType.HANDHELD,             platformName: "Android" },
  { name: "AYANEO Pocket DMG",           manufacturer: "AYANEO",                  type: HardwareType.HANDHELD,             platformName: "Android" },
  { name: "AYANEO Pocket DS",            manufacturer: "AYANEO",                  type: HardwareType.HANDHELD,             platformName: "Android" },
  { name: "AYANEO Pocket ACE",           manufacturer: "AYANEO",                  type: HardwareType.HANDHELD,             platformName: "Android" },
  { name: "AYANEO Pocket AIR",           manufacturer: "AYANEO",                  type: HardwareType.HANDHELD,             platformName: "Android" },
  { name: "AYANEO Pocket AIR Mini",      manufacturer: "AYANEO",                  type: HardwareType.HANDHELD,             platformName: "Android" },
  { name: "AYANEO Pocket EVO",           manufacturer: "AYANEO",                  type: HardwareType.HANDHELD,             platformName: "Android" },
  { name: "AYANEO Pocket Micro",         manufacturer: "AYANEO",                  type: HardwareType.HANDHELD,             platformName: "Android" },
  { name: "AYANEO Pocket Micro Classic", manufacturer: "AYANEO",                  type: HardwareType.HANDHELD,             platformName: "Android" },
  { name: "AYANEO Pocket VERT",          manufacturer: "AYANEO",                  type: HardwareType.HANDHELD,             platformName: "Android" },
  { name: "AYANEO Pocket PLAY",          manufacturer: "AYANEO",                  type: HardwareType.HANDHELD,             platformName: "Android" },
  { name: "AYANEO Flip DS",              manufacturer: "AYANEO",                  type: HardwareType.HANDHELD,             platformName: "Android" },
  { name: "AYANEO Flip 1S DS",           manufacturer: "AYANEO",                  type: HardwareType.HANDHELD,             platformName: "Android" },
  { name: "AYANEO Flip KB",              manufacturer: "AYANEO",                  type: HardwareType.HANDHELD,             platformName: "Android" },
  { name: "AYANEO Flip 1S KB",           manufacturer: "AYANEO",                  type: HardwareType.HANDHELD,             platformName: "Android" },
  { name: "AYANEO KONKR FIT",            manufacturer: "AYANEO",                  type: HardwareType.HANDHELD,             platformName: "Android" },
  { name: "AYANEO KONKR Pocket FIT",     manufacturer: "AYANEO",                  type: HardwareType.HANDHELD,             platformName: "Android" },
  // AYANEO — Windows
  { name: "AYANEO 2021",                 manufacturer: "AYANEO",                  type: HardwareType.HANDHELD,             platformName: "Windows (x86-64)" },
  { name: "AYANEO NEXT",                 manufacturer: "AYANEO",                  type: HardwareType.HANDHELD,             platformName: "Windows (x86-64)" },
  { name: "AYANEO NEXT Lite",            manufacturer: "AYANEO",                  type: HardwareType.HANDHELD,             platformName: "Windows (x86-64)" },
  { name: "AYANEO NEXT II",              manufacturer: "AYANEO",                  type: HardwareType.HANDHELD,             platformName: "Windows (x86-64)" },
  { name: "AYANEO AIR",                  manufacturer: "AYANEO",                  type: HardwareType.HANDHELD,             platformName: "Windows (x86-64)" },
  { name: "AYANEO AIR Pro",              manufacturer: "AYANEO",                  type: HardwareType.HANDHELD,             platformName: "Windows (x86-64)" },
  { name: "AYANEO AIR Plus",             manufacturer: "AYANEO",                  type: HardwareType.HANDHELD,             platformName: "Windows (x86-64)" },
  { name: "AYANEO AIR 1S",               manufacturer: "AYANEO",                  type: HardwareType.HANDHELD,             platformName: "Windows (x86-64)" },
  { name: "AYANEO 2",                    manufacturer: "AYANEO",                  type: HardwareType.HANDHELD,             platformName: "Windows (x86-64)" },
  { name: "AYANEO 2S",                   manufacturer: "AYANEO",                  type: HardwareType.HANDHELD,             platformName: "Windows (x86-64)" },
  { name: "AYANEO Geek",                 manufacturer: "AYANEO",                  type: HardwareType.HANDHELD,             platformName: "Windows (x86-64)" },
  { name: "AYANEO Geek 1S",              manufacturer: "AYANEO",                  type: HardwareType.HANDHELD,             platformName: "Windows (x86-64)" },
  { name: "AYANEO KUN",                  manufacturer: "AYANEO",                  type: HardwareType.HANDHELD,             platformName: "Windows (x86-64)" },
  { name: "AYANEO SLIDE",                manufacturer: "AYANEO",                  type: HardwareType.HANDHELD,             platformName: "Windows (x86-64)" },
  { name: "AYANEO FLIP DS",              manufacturer: "AYANEO",                  type: HardwareType.HANDHELD,             platformName: "Windows (x86-64)" },
  { name: "AYANEO FLIP KB",              manufacturer: "AYANEO",                  type: HardwareType.HANDHELD,             platformName: "Windows (x86-64)" },
  { name: "AYANEO FLIP 1S DS",           manufacturer: "AYANEO",                  type: HardwareType.HANDHELD,             platformName: "Windows (x86-64)" },
  { name: "AYANEO FLIP 1S KB",           manufacturer: "AYANEO",                  type: HardwareType.HANDHELD,             platformName: "Windows (x86-64)" },
  { name: "AYANEO 3",                    manufacturer: "AYANEO",                  type: HardwareType.HANDHELD,             platformName: "Windows (x86-64)" },
  { name: "AYANEO REMAKE",               manufacturer: "AYANEO",                  type: HardwareType.HANDHELD,             platformName: "Windows (x86-64)" },
  // Anbernic
  { name: "RG351P",                      manufacturer: "Anbernic",                type: HardwareType.HANDHELD,             platformName: "Other Linux" },
  { name: "RG351M",                      manufacturer: "Anbernic",                type: HardwareType.HANDHELD,             platformName: "Other Linux" },
  { name: "RG351V",                      manufacturer: "Anbernic",                type: HardwareType.HANDHELD,             platformName: "Other Linux" },
  { name: "RG352P",                      manufacturer: "Anbernic",                type: HardwareType.HANDHELD,             platformName: "Other Linux" },
  { name: "RG353P",                      manufacturer: "Anbernic",                type: HardwareType.HANDHELD,             platformName: "Other Linux" },
  { name: "RG353PS",                     manufacturer: "Anbernic",                type: HardwareType.HANDHELD,             platformName: "Other Linux" },
  { name: "RG353M",                      manufacturer: "Anbernic",                type: HardwareType.HANDHELD,             platformName: "Other Linux" },
  { name: "RG353V",                      manufacturer: "Anbernic",                type: HardwareType.HANDHELD,             platformName: "Other Linux" },
  { name: "RG353VS",                     manufacturer: "Anbernic",                type: HardwareType.HANDHELD,             platformName: "Other Linux" },
  { name: "RG505",                       manufacturer: "Anbernic",                type: HardwareType.HANDHELD,             platformName: "Android" },
  { name: "RG552",                       manufacturer: "Anbernic",                type: HardwareType.HANDHELD,             platformName: "Android" },
  { name: "RG35XX",                      manufacturer: "Anbernic",                type: HardwareType.HANDHELD,             platformName: "Other Linux" },
  { name: "RG35XX 2024",                 manufacturer: "Anbernic",                type: HardwareType.HANDHELD,             platformName: "Other Linux" },
  { name: "RG35XX Plus",                 manufacturer: "Anbernic",                type: HardwareType.HANDHELD,             platformName: "Other Linux" },
  { name: "RG35XX H",                    manufacturer: "Anbernic",                type: HardwareType.HANDHELD,             platformName: "Other Linux" },
  { name: "RG35XX SP",                   manufacturer: "Anbernic",                type: HardwareType.HANDHELD,             platformName: "Other Linux" },
  { name: "RG35XX Pro",                  manufacturer: "Anbernic",                type: HardwareType.HANDHELD,             platformName: "Other Linux" },
  { name: "RG28XX",                      manufacturer: "Anbernic",                type: HardwareType.HANDHELD,             platformName: "Other Linux" },
  { name: "RG34XX",                      manufacturer: "Anbernic",                type: HardwareType.HANDHELD,             platformName: "Other Linux" },
  { name: "RG34XX SP",                   manufacturer: "Anbernic",                type: HardwareType.HANDHELD,             platformName: "Other Linux" },
  { name: "RG40XX H",                    manufacturer: "Anbernic",                type: HardwareType.HANDHELD,             platformName: "Other Linux" },
  { name: "RG40XX V",                    manufacturer: "Anbernic",                type: HardwareType.HANDHELD,             platformName: "Other Linux" },
  { name: "RG405M",                      manufacturer: "Anbernic",                type: HardwareType.HANDHELD,             platformName: "Android" },
  { name: "RG405V",                      manufacturer: "Anbernic",                type: HardwareType.HANDHELD,             platformName: "Android" },
  { name: "RG406V",                      manufacturer: "Anbernic",                type: HardwareType.HANDHELD,             platformName: "Android" },
  { name: "RG406H",                      manufacturer: "Anbernic",                type: HardwareType.HANDHELD,             platformName: "Android" },
  { name: "RG477M",                      manufacturer: "Anbernic",                type: HardwareType.HANDHELD,             platformName: "Android" },
  { name: "RG556",                       manufacturer: "Anbernic",                type: HardwareType.HANDHELD,             platformName: "Android" },
  { name: "RG557",                       manufacturer: "Anbernic",                type: HardwareType.HANDHELD,             platformName: "Android" },
  { name: "RG Cube",                     manufacturer: "Anbernic",                type: HardwareType.HANDHELD,             platformName: "Android" },
  { name: "RG Cube XX",                  manufacturer: "Anbernic",                type: HardwareType.HANDHELD,             platformName: "Android" },
  { name: "RG Arc S",                    manufacturer: "Anbernic",                type: HardwareType.HANDHELD,             platformName: "Other Linux" },
  { name: "RG Arc D",                    manufacturer: "Anbernic",                type: HardwareType.HANDHELD,             platformName: "Other Linux" },
  { name: "RG DS",                       manufacturer: "Anbernic",                type: HardwareType.HANDHELD,             platformName: "Other Linux" },
  { name: "RG Nano",                     manufacturer: "Anbernic",                type: HardwareType.HANDHELD,             platformName: "Other Linux" },
  { name: "RG Rotate",                   manufacturer: "Anbernic",                type: HardwareType.HANDHELD,             platformName: "Other Linux" },
  { name: "RG Slide",                    manufacturer: "Anbernic",                type: HardwareType.HANDHELD,             platformName: "Other Linux" },
  { name: "RG P01",                      manufacturer: "Anbernic",                type: HardwareType.HANDHELD,             platformName: "Android" },
  { name: "WIN600",                      manufacturer: "Anbernic",                type: HardwareType.HANDHELD,             platformName: "Windows (x86-64)" },
  // Miyoo
  { name: "Miyoo Mini",                  manufacturer: "Miyoo",                   type: HardwareType.HANDHELD,             platformName: "Other Linux" },
  { name: "Miyoo Mini+",                 manufacturer: "Miyoo",                   type: HardwareType.HANDHELD,             platformName: "Other Linux" },
  { name: "Miyoo Flip",                  manufacturer: "Miyoo",                   type: HardwareType.HANDHELD,             platformName: "Other Linux" },
  { name: "Miyoo Flip V2",               manufacturer: "Miyoo",                   type: HardwareType.HANDHELD,             platformName: "Other Linux" },
  { name: "Miyoo A30",                   manufacturer: "Miyoo",                   type: HardwareType.HANDHELD,             platformName: "Other Linux" },
  // TrimUI
  { name: "TrimUI Smart Pro",            manufacturer: "TrimUI",                  type: HardwareType.HANDHELD,             platformName: "Other Linux" },
  { name: "TrimUI Smart Pro S",          manufacturer: "TrimUI",                  type: HardwareType.HANDHELD,             platformName: "Other Linux" },
  { name: "TrimUI Brick",                manufacturer: "TrimUI",                  type: HardwareType.HANDHELD,             platformName: "Other Linux" },
  // Powkiddy
  { name: "RGB30",                       manufacturer: "Powkiddy",                type: HardwareType.HANDHELD,             platformName: "Other Linux" },
  { name: "X55",                         manufacturer: "Powkiddy",                type: HardwareType.HANDHELD,             platformName: "Other Linux" },
  // Mangmi
  { name: "Mangmi Pocket Max",           manufacturer: "Mangmi",                  type: HardwareType.HANDHELD,             platformName: "Android" },
  // MagicX
  { name: "MagicX Zero 40",              manufacturer: "MagicX",                  type: HardwareType.HANDHELD,             platformName: "Android" },
  // Game Kiddy
  { name: "GKD Pixel",                   manufacturer: "Game Kiddy",              type: HardwareType.HANDHELD,             platformName: "Other Linux" },
  // FunKey
  { name: "FunKey S",                    manufacturer: "FunKey",                  type: HardwareType.HANDHELD,             platformName: "Other Linux" },
  // FPGA
  { name: "ModRetro Chromatic",          manufacturer: "ModRetro",                type: HardwareType.FPGA,                 platformName: "Other" },
  { name: "Analogue Pocket",             manufacturer: "Analogue",                type: HardwareType.FPGA,                 platformName: "Other" },
  // Other handheld
  { name: "Super Pocket",                manufacturer: "Blaze",                   type: HardwareType.HANDHELD,             platformName: "Other" },
  { name: "PlayDate",                    manufacturer: "Panic",                   type: HardwareType.HANDHELD,             platformName: "Other" },
  // Raspberry Pi SBC
  { name: "Raspberry Pi 3B+",            manufacturer: "Raspberry Pi Foundation", type: HardwareType.SBC,                  platformName: "Other Linux" },
  { name: "Raspberry Pi 4",              manufacturer: "Raspberry Pi Foundation", type: HardwareType.SBC,                  platformName: "Other Linux" },
  { name: "Raspberry Pi 5",              manufacturer: "Raspberry Pi Foundation", type: HardwareType.SBC,                  platformName: "Other Linux" },
  { name: "Raspberry Pi Zero 2W",        manufacturer: "Raspberry Pi Foundation", type: HardwareType.SBC,                  platformName: "Other Linux" },
  // Modded consoles
  { name: "Nintendo Switch",             manufacturer: "Nintendo",                type: HardwareType.MODDED_CONSOLE,       platformName: "Atmosphere" },
  { name: "Nintendo Wii",                manufacturer: "Nintendo",                type: HardwareType.MODDED_CONSOLE,       platformName: "Homebrew Channel" },
  { name: "Nintendo Wii U",              manufacturer: "Nintendo",                type: HardwareType.MODDED_CONSOLE,       platformName: "Aroma" },
  { name: "Old 3DS / 2DS",               manufacturer: "Nintendo",                type: HardwareType.MODDED_CONSOLE,       platformName: "Luma3DS" },
  { name: "New 3DS / New 2DS XL",        manufacturer: "Nintendo",                type: HardwareType.MODDED_CONSOLE,       platformName: "Luma3DS" },
  { name: "Nintendo DSi",                manufacturer: "Nintendo",                type: HardwareType.MODDED_CONSOLE,       platformName: "TWiLight Menu++" },
  { name: "Game Boy Advance",            manufacturer: "Nintendo",                type: HardwareType.MODDED_CONSOLE,       platformName: "Other CFW" },
  { name: "PlayStation Portable",        manufacturer: "Sony",                    type: HardwareType.MODDED_CONSOLE,       platformName: "ARK-4" },
  { name: "PlayStation Vita",            manufacturer: "Sony",                    type: HardwareType.MODDED_CONSOLE,       platformName: "HENkaku / Enso" },
  { name: "PlayStation 2",               manufacturer: "Sony",                    type: HardwareType.MODDED_CONSOLE,       platformName: "OPL" },
  { name: "PlayStation 3",               manufacturer: "Sony",                    type: HardwareType.MODDED_CONSOLE,       platformName: "PS3HEN" },
  { name: "PlayStation Classic",         manufacturer: "Sony",                    type: HardwareType.MODDED_CONSOLE,       platformName: "Other Linux" },
  { name: "Xbox (Original)",             manufacturer: "Microsoft",               type: HardwareType.MODDED_CONSOLE,       platformName: "Other CFW" },
  { name: "Xbox 360",                    manufacturer: "Microsoft",               type: HardwareType.MODDED_CONSOLE,       platformName: "Other CFW" },
  { name: "Sega Dreamcast",              manufacturer: "Sega",                    type: HardwareType.MODDED_CONSOLE,       platformName: "Other CFW" },
  // Desktop architecture
  { name: "x86-64",                      manufacturer: "Various",                 type: HardwareType.DESKTOP_ARCHITECTURE, platformName: "Windows (x86-64)" },
  { name: "x86-32",                      manufacturer: "Various",                 type: HardwareType.DESKTOP_ARCHITECTURE, platformName: "Windows (x86-32)" },
  { name: "Apple (Apple Silicon)",       manufacturer: "Various",                 type: HardwareType.DESKTOP_ARCHITECTURE, platformName: "macOS (Apple Silicon)" },
  { name: "Apple (Intel)",               manufacturer: "Various",                 type: HardwareType.DESKTOP_ARCHITECTURE, platformName: "macOS (Intel)" },
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

import type {
  AttachmentSlot,
  StageCommand,
  StageMode,
  WeaponAttachment,
  WeaponChassisId,
  WeaponStats,
} from './types';

export interface StagePreset {
  id: string;
  label: string;
  shortLabel: string;
  mode: StageMode;
  command: StageCommand;
}

/* ─── Weapon Base Stats & Modular Attachment Catalog ───────────────────── */
export const WEAPON_BASE_STATS: Record<
  WeaponChassisId,
  {
    name: string;
    gameTitle: string;
    caliber: string;
    accent: string;
    wikiQuery: string;
    wikiSite: 'callofduty' | 'counterstrike' | 'valorant' | 'wikimedia';
    base: WeaponStats;
  }
> = {
  m4a1: {
    name: 'M4A1-S Meta Build',
    gameTitle: 'Call of Duty: Warzone',
    caliber: '5.56x45mm NATO',
    accent: '#38BDF8',
    wikiQuery: 'M4A1',
    wikiSite: 'callofduty',
    base: { damage: 64, accuracy: 68, fireRate: 74, mobility: 66, control: 65 },
  },
  vx9: {
    name: 'VX-9 Vector CQB',
    gameTitle: 'Call of Duty: MW3',
    caliber: '9x19mm Parabellum',
    accent: '#F59E0B',
    wikiQuery: 'KRISS Vector',
    wikiSite: 'callofduty',
    base: { damage: 48, accuracy: 56, fireRate: 92, mobility: 86, control: 62 },
  },
  m200: {
    name: 'M200 Intervention',
    gameTitle: 'Battlefield / MW Marksman',
    caliber: '.408 Cheyenne Tactical',
    accent: '#34D399',
    wikiQuery: 'Intervention',
    wikiSite: 'callofduty',
    base: { damage: 94, accuracy: 88, fireRate: 28, mobility: 38, control: 58 },
  },
};

export const ATTACHMENT_CATALOG: Record<AttachmentSlot, WeaponAttachment[]> = {
  optic: [
    {
      id: 'holo-exps3',
      name: 'EXPS3 Holographic',
      slot: 'optic',
      variant: 'holo',
      statDelta: { accuracy: 7, mobility: -1 },
      calloutNote: '1.0x Parallax-Free',
    },
    {
      id: 'reflex-micro',
      name: 'Micro Reflex Sight',
      slot: 'optic',
      variant: 'reflex',
      statDelta: { accuracy: 4, mobility: 3 },
      calloutNote: 'Fast ADS Acquisition',
    },
    {
      id: 'acog-4x',
      name: 'TA31 4x Optical',
      slot: 'optic',
      variant: 'acog',
      statDelta: { accuracy: 12, control: 3, mobility: -5 },
      calloutNote: 'Mid-Range BDC Reticle',
    },
    {
      id: 'sniper-8x',
      name: 'Nightforce 8x Variable',
      slot: 'optic',
      variant: 'scope',
      statDelta: { accuracy: 10, damage: 3, mobility: -7 },
      calloutNote: 'Zero-Stop Elevation',
    },
  ],
  muzzle: [
    {
      id: 'suppressor-mono',
      name: 'Monolithic Suppressor',
      slot: 'muzzle',
      variant: 'suppressor',
      statDelta: { damage: 4, accuracy: 6, control: 5, mobility: -4 },
      calloutNote: 'Sound & Velocity Boost',
    },
    {
      id: 'comp-ported',
      name: 'Ported Compensator',
      slot: 'muzzle',
      variant: 'compensator',
      statDelta: { control: 10, accuracy: 3, mobility: -1 },
      calloutNote: 'Vertical Climb Reduction',
    },
    {
      id: 'brake-heavy',
      name: 'Tri-Chamber Brake',
      slot: 'muzzle',
      variant: 'brake',
      statDelta: { control: 12, damage: 2, mobility: -4 },
      calloutNote: 'High-Caliber Recoil Vent',
    },
  ],
  barrel: [
    {
      id: 'barrel-fluted',
      name: '14.5" Corvus Custom',
      slot: 'barrel',
      variant: 'standard',
      statDelta: { damage: 5, accuracy: 5, mobility: -2 },
      calloutNote: 'Meta Range & Velocity',
    },
    {
      id: 'barrel-cqb',
      name: '7.5" CQB Shroud',
      slot: 'barrel',
      variant: 'short',
      statDelta: { mobility: 8, fireRate: 4, accuracy: -4 },
      calloutNote: 'Close-Quarters Handling',
    },
    {
      id: 'barrel-match',
      name: '26" Match Free-Float',
      slot: 'barrel',
      variant: 'long',
      statDelta: { damage: 6, accuracy: 9, control: 4, mobility: -8 },
      calloutNote: 'Sub-MOA Rifling',
    },
  ],
  underbarrel: [
    {
      id: 'grip-angled',
      name: 'Commando Foregrip',
      slot: 'underbarrel',
      variant: 'angled',
      statDelta: { mobility: 4, control: 6 },
      calloutNote: 'Recoil Stabilization',
    },
    {
      id: 'grip-vertical',
      name: 'Merc Vertical Grip',
      slot: 'underbarrel',
      variant: 'vertical',
      statDelta: { control: 11, accuracy: 3, mobility: -3 },
      calloutNote: 'Sustained Burst Control',
    },
    {
      id: 'bipod-tactical',
      name: 'Carbon Tactical Bipod',
      slot: 'underbarrel',
      variant: 'bipod',
      statDelta: { accuracy: 8, control: 10, mobility: -6 },
      calloutNote: 'Prone Recoil Anchor',
    },
  ],
  magazine: [
    {
      id: 'mag-40rd',
      name: '60-Rd Polymer Mag',
      slot: 'magazine',
      variant: 'extended',
      statDelta: { fireRate: 2, mobility: -2 },
      calloutNote: 'Squad Wipe Capacity',
    },
    {
      id: 'mag-50drum',
      name: '50-Rd Compact Drum',
      slot: 'magazine',
      variant: 'drum',
      statDelta: { fireRate: 3, mobility: -6, control: 2 },
      calloutNote: 'High-Capacity Suppress',
    },
    {
      id: 'mag-match7',
      name: '7-Rd Match AP Mag',
      slot: 'magazine',
      variant: 'compact',
      statDelta: { damage: 4, accuracy: 3, mobility: 2 },
      calloutNote: 'Armor-Piercing Load',
    },
  ],
  stock: [
    {
      id: 'stock-crane',
      name: 'Tactical Crane Stock',
      slot: 'stock',
      variant: 'crane',
      statDelta: { control: 6, accuracy: 3, mobility: 1 },
      calloutNote: 'Ergonomic Cheek Weld',
    },
    {
      id: 'stock-skeleton',
      name: 'Folding Skeleton Stock',
      slot: 'stock',
      variant: 'skeleton',
      statDelta: { mobility: 9, control: -2 },
      calloutNote: 'Ultralight Sprint-to-Fire',
    },
    {
      id: 'stock-precision',
      name: 'Precision Cheek Rest',
      slot: 'stock',
      variant: 'heavy',
      statDelta: { accuracy: 6, control: 8, mobility: -5 },
      calloutNote: 'Weighted Recoil Damper',
    },
  ],
};

export function findAttachment(slot: AttachmentSlot, id: string): WeaponAttachment {
  return ATTACHMENT_CATALOG[slot].find((item) => item.id === id) ?? ATTACHMENT_CATALOG[slot][0];
}

export function calculateWeaponStats(
  chassis: WeaponChassisId,
  attachments: Record<AttachmentSlot, WeaponAttachment>,
): WeaponStats {
  const base = WEAPON_BASE_STATS[chassis].base;
  const sum: WeaponStats = { ...base };
  (Object.keys(attachments) as AttachmentSlot[]).forEach((slot) => {
    const delta = attachments[slot].statDelta;
    if (delta.damage) sum.damage += delta.damage;
    if (delta.accuracy) sum.accuracy += delta.accuracy;
    if (delta.fireRate) sum.fireRate += delta.fireRate;
    if (delta.mobility) sum.mobility += delta.mobility;
    if (delta.control) sum.control += delta.control;
  });
  return {
    damage: Math.max(5, Math.min(100, Math.round(sum.damage))),
    accuracy: Math.max(5, Math.min(100, Math.round(sum.accuracy))),
    fireRate: Math.max(5, Math.min(100, Math.round(sum.fireRate))),
    mobility: Math.max(5, Math.min(100, Math.round(sum.mobility))),
    control: Math.max(5, Math.min(100, Math.round(sum.control))),
  };
}

function buildWeaponCommand(
  chassis: WeaponChassisId,
  title: string,
  subtitle: string,
  slotIds: Record<AttachmentSlot, string>,
  highlightedSlot?: AttachmentSlot,
): StageCommand {
  const meta = WEAPON_BASE_STATS[chassis];
  const attachments: Record<AttachmentSlot, WeaponAttachment> = {
    optic: findAttachment('optic', slotIds.optic),
    muzzle: findAttachment('muzzle', slotIds.muzzle),
    barrel: findAttachment('barrel', slotIds.barrel),
    underbarrel: findAttachment('underbarrel', slotIds.underbarrel),
    magazine: findAttachment('magazine', slotIds.magazine),
    stock: findAttachment('stock', slotIds.stock),
  };
  return {
    mode: 'weapon',
    title,
    subtitle,
    payload: {
      chassis,
      weaponName: meta.name,
      gameTitle: meta.gameTitle,
      caliber: meta.caliber,
      blueprintAccent: meta.accent,
      wikiQuery: meta.wikiQuery,
      wikiSite: meta.wikiSite,
      highlightedSlot,
      attachments,
      stats: calculateWeaponStats(chassis, attachments),
    },
  };
}

/* ─── Football Presets (Real Player Portraits + Tactical Fallback) ─────── */
const FOOTBALL_REAL_MADRID: StageCommand = {
  mode: 'football',
  title: 'Real Madrid 4-3-3',
  subtitle: 'Bellingham driving the right half-space while Mbappé and Vinícius attack diagonal channels',
  payload: {
    formation: '4-3-3',
    tacticalStyle: 'Real Madrid · Vertical Counter-Press',
    teamColor: '#38BDF8',
    awayColor: '#F43F5E',
    players: [
      { id: 'h-gk', number: 1, role: 'GK', name: 'Thibaut Courtois', displayName: 'Courtois', team: 'home', x: 8, y: 50 },
      { id: 'h-lb', number: 23, role: 'LB', name: 'Ferland Mendy', displayName: 'Mendy', team: 'home', x: 34, y: 15 },
      { id: 'h-lcb', number: 22, role: 'CB', name: 'Antonio Rudiger', displayName: 'Rüdiger', team: 'home', x: 25, y: 37 },
      { id: 'h-rcb', number: 3, role: 'CB', name: 'Eder Militao', displayName: 'Militão', team: 'home', x: 25, y: 63 },
      { id: 'h-rb', number: 2, role: 'RB', name: 'Dani Carvajal', displayName: 'Carvajal', team: 'home', x: 36, y: 85 },
      { id: 'h-cdm', number: 14, role: 'CDM', name: 'Aurelien Tchouameni', displayName: 'Tchouaméni', team: 'home', x: 45, y: 50, hasBall: true },
      { id: 'h-lcm', number: 8, role: 'LCM', name: 'Federico Valverde', displayName: 'Valverde', team: 'home', x: 58, y: 31 },
      { id: 'h-rcm', number: 5, role: 'CAM', name: 'Jude Bellingham', displayName: 'Bellingham', team: 'home', x: 62, y: 68 },
      { id: 'h-lw', number: 7, role: 'LW', name: 'Vinicius Junior', displayName: 'Vinícius', team: 'home', x: 75, y: 17 },
      { id: 'h-st', number: 9, role: 'ST', name: 'Kylian Mbappe', displayName: 'Mbappé', team: 'home', x: 80, y: 49 },
      { id: 'h-rw', number: 11, role: 'RW', name: 'Rodrygo', displayName: 'Rodrygo', team: 'home', x: 76, y: 82 },
      // Opposition block
      { id: 'a-gk', number: 1, role: 'GK', team: 'away', x: 93, y: 50 },
      { id: 'a-rb', number: 2, role: 'RB', team: 'away', x: 84, y: 24 },
      { id: 'a-cb1', number: 4, role: 'CB', team: 'away', x: 85, y: 42 },
      { id: 'a-cb2', number: 5, role: 'CB', team: 'away', x: 85, y: 58 },
      { id: 'a-lb', number: 3, role: 'LB', team: 'away', x: 84, y: 76 },
      { id: 'a-m1', number: 6, role: 'CM', team: 'away', x: 69, y: 38 },
      { id: 'a-m2', number: 8, role: 'CM', team: 'away', x: 69, y: 62 },
      { id: 'a-f1', number: 9, role: 'ST', team: 'away', x: 52, y: 48 },
    ],
    zones: [
      { id: 'z-hs', x: 64, y: 56, w: 20, h: 24, tone: 'attack', label: 'Half-Space Overload' },
      { id: 'z-press', x: 66, y: 13, w: 22, h: 22, tone: 'press', label: 'Press Trap' },
    ],
    vectors: [
      { id: 'v1', type: 'pass', from: [45, 50], to: [62, 68], curve: 8, label: 'Line Break' },
      { id: 'v2', type: 'pass', from: [62, 68], to: [76, 82], curve: -6 },
      { id: 'v3', type: 'run', from: [76, 82], to: [87, 68], curve: -10, label: 'Cut Inside' },
      { id: 'v4', type: 'run', from: [80, 49], to: [89, 41], curve: 4 },
      { id: 'v5', type: 'run', from: [36, 85], to: [69, 90], curve: 5, label: 'Overlap' },
      { id: 'v6', type: 'press', from: [75, 17], to: [84, 24], curve: 0, label: 'Trigger' },
    ],
    ballPath: [
      [45, 50],
      [62, 68],
      [76, 82],
      [87, 68],
      [89, 41],
    ],
  },
};

const FOOTBALL_352: StageCommand = {
  mode: 'football',
  title: '3-5-2 Wingback Overload',
  subtitle: 'Back three rest defense releasing twin wingbacks with split-striker diagonal runs',
  payload: {
    formation: '3-5-2',
    tacticalStyle: 'Possession · Wide Stretch',
    teamColor: '#38BDF8',
    awayColor: '#F43F5E',
    players: [
      { id: 'h-gk', number: 1, role: 'GK', team: 'home', x: 8, y: 50 },
      { id: 'h-lcb', number: 4, role: 'LCB', team: 'home', x: 25, y: 26 },
      { id: 'h-rcb', number: 5, role: 'CCB', team: 'home', x: 22, y: 50 },
      { id: 'h-rb', number: 2, role: 'RCB', team: 'home', x: 25, y: 74 },
      { id: 'h-lb', number: 3, role: 'LWB', team: 'home', x: 59, y: 10 },
      { id: 'h-cdm', number: 6, role: 'REG', team: 'home', x: 42, y: 50, hasBall: true },
      { id: 'h-lcm', number: 8, role: 'LCM', team: 'home', x: 56, y: 34 },
      { id: 'h-rcm', number: 10, role: 'RCM', team: 'home', x: 56, y: 66 },
      { id: 'h-rw', number: 7, role: 'RWB', team: 'home', x: 64, y: 90 },
      { id: 'h-lw', number: 11, role: 'LS', name: 'Erling Haaland', displayName: 'Haaland', team: 'home', x: 77, y: 39 },
      { id: 'h-st', number: 9, role: 'RS', name: 'Lautaro Martinez', displayName: 'Lautaro', team: 'home', x: 79, y: 61 },
      // Opposition
      { id: 'a-gk', number: 1, role: 'GK', team: 'away', x: 93, y: 50 },
      { id: 'a-rb', number: 2, role: 'RB', team: 'away', x: 82, y: 26 },
      { id: 'a-cb1', number: 4, role: 'CB', team: 'away', x: 84, y: 44 },
      { id: 'a-cb2', number: 5, role: 'CB', team: 'away', x: 84, y: 57 },
      { id: 'a-lb', number: 3, role: 'LB', team: 'away', x: 82, y: 74 },
      { id: 'a-m1', number: 6, role: 'CM', team: 'away', x: 66, y: 41 },
      { id: 'a-m2', number: 8, role: 'CM', team: 'away', x: 66, y: 60 },
      { id: 'a-f1', number: 9, role: 'ST', team: 'away', x: 48, y: 50 },
    ],
    zones: [
      { id: 'z-wide', x: 58, y: 4, w: 30, h: 17, tone: 'attack', label: 'Weak-Side Switch' },
      { id: 'z-rest', x: 18, y: 20, w: 16, h: 60, tone: 'cover', label: 'Rest Defense 3' },
    ],
    vectors: [
      { id: 'v1', type: 'pass', from: [42, 50], to: [59, 10], curve: -18, label: 'Diagonal Switch' },
      { id: 'v2', type: 'run', from: [59, 10], to: [84, 14], curve: -5, label: 'Drive Byline' },
      { id: 'v3', type: 'pass', from: [84, 14], to: [87, 56], curve: 12, label: 'Far-Post Cross' },
      { id: 'v4', type: 'run', from: [77, 39], to: [88, 34], curve: 3 },
      { id: 'v5', type: 'run', from: [79, 61], to: [87, 56], curve: -4 },
      { id: 'v6', type: 'run', from: [64, 90], to: [82, 78], curve: 6 },
    ],
    ballPath: [
      [42, 50],
      [59, 10],
      [84, 14],
      [87, 56],
    ],
  },
};

const FOOTBALL_442: StageCommand = {
  mode: 'football',
  title: '4-4-2 Counter Block',
  subtitle: 'Compact two-bank mid-block springing vertical transition into twin strikers',
  payload: {
    formation: '4-4-2',
    tacticalStyle: 'Mid-Block · Direct Counter',
    teamColor: '#38BDF8',
    awayColor: '#F43F5E',
    players: [
      { id: 'h-gk', number: 1, role: 'GK', team: 'home', x: 8, y: 50 },
      { id: 'h-lb', number: 3, role: 'LB', team: 'home', x: 24, y: 18 },
      { id: 'h-lcb', number: 4, role: 'CB', team: 'home', x: 22, y: 40 },
      { id: 'h-rcb', number: 5, role: 'CB', team: 'home', x: 22, y: 60 },
      { id: 'h-rb', number: 2, role: 'RB', team: 'home', x: 24, y: 82 },
      { id: 'h-lw', number: 11, role: 'LM', team: 'home', x: 40, y: 18 },
      { id: 'h-cdm', number: 6, role: 'LCM', team: 'home', x: 38, y: 41, hasBall: true },
      { id: 'h-lcm', number: 8, role: 'RCM', team: 'home', x: 38, y: 59 },
      { id: 'h-rw', number: 7, role: 'RM', team: 'home', x: 42, y: 82 },
      { id: 'h-rcm', number: 10, role: 'SS', team: 'home', x: 56, y: 42 },
      { id: 'h-st', number: 9, role: 'ST', team: 'home', x: 60, y: 58 },
      { id: 'a-gk', number: 1, role: 'GK', team: 'away', x: 92, y: 50 },
      { id: 'a-rb', number: 2, role: 'RB', team: 'away', x: 63, y: 20 },
      { id: 'a-cb1', number: 4, role: 'CB', team: 'away', x: 66, y: 41 },
      { id: 'a-cb2', number: 5, role: 'CB', team: 'away', x: 66, y: 61 },
      { id: 'a-lb', number: 3, role: 'LB', team: 'away', x: 62, y: 80 },
      { id: 'a-m1', number: 6, role: 'CM', team: 'away', x: 47, y: 35 },
      { id: 'a-m2', number: 8, role: 'CM', team: 'away', x: 48, y: 65 },
      { id: 'a-f1', number: 9, role: 'ST', team: 'away', x: 30, y: 50 },
    ],
    zones: [
      { id: 'z-block', x: 19, y: 14, w: 24, h: 72, tone: 'cover', label: 'Compact 4-4 Block' },
      { id: 'z-space', x: 70, y: 20, w: 20, h: 60, tone: 'attack', label: 'Space Behind Line' },
    ],
    vectors: [
      { id: 'v1', type: 'pass', from: [38, 41], to: [56, 42], curve: 0, label: 'First Outlet' },
      { id: 'v2', type: 'pass', from: [56, 42], to: [83, 68], curve: 14, label: 'Through Ball' },
      { id: 'v3', type: 'run', from: [60, 58], to: [83, 68], curve: -4, label: 'Channel Sprint' },
      { id: 'v4', type: 'run', from: [42, 82], to: [77, 84], curve: 4 },
      { id: 'v5', type: 'press', from: [38, 59], to: [48, 65], curve: 0, label: 'Win Ball' },
    ],
    ballPath: [
      [38, 41],
      [56, 42],
      [83, 68],
    ],
  },
};

/* ─── Basketball Presets (Preserved Working NBA 2K Court Architecture) ─── */
const BASKETBALL_HORNS: StageCommand = {
  mode: 'basketball',
  title: 'Horns Rip Cut',
  subtitle: 'Double-elbow alignment initiating a back-screen dive and weakside flare option',
  payload: {
    playName: 'Horns Rip Series',
    courtTheme: 'hardwood',
    setType: 'Half-Court Set · NBA 2K Playbook',
    players: [
      { id: 'o1', number: 1, position: 'PG', team: 'offense', x: 60, y: 50, targetX: 66, targetY: 34, hasBall: true },
      { id: 'o2', number: 2, position: 'SG', team: 'offense', x: 89, y: 11, targetX: 73, targetY: 14 },
      { id: 'o3', number: 3, position: 'SF', team: 'offense', x: 89, y: 89, targetX: 87, targetY: 62 },
      { id: 'o4', number: 4, position: 'PF', team: 'offense', x: 75, y: 36, targetX: 70, targetY: 22 },
      { id: 'o5', number: 5, position: 'C', team: 'offense', x: 75, y: 64, targetX: 89, targetY: 51 },
      { id: 'd1', number: 1, position: 'PG', team: 'defense', x: 66, y: 50, targetX: 70, targetY: 38 },
      { id: 'd2', number: 2, position: 'SG', team: 'defense', x: 86, y: 18, targetX: 78, targetY: 19 },
      { id: 'd3', number: 3, position: 'SF', team: 'defense', x: 86, y: 81, targetX: 84, targetY: 69 },
      { id: 'd4', number: 4, position: 'PF', team: 'defense', x: 79, y: 39, targetX: 76, targetY: 31 },
      { id: 'd5', number: 5, position: 'C', team: 'defense', x: 81, y: 60, targetX: 87, targetY: 54 },
    ],
    zones: [
      { id: 'bz-1', x: 89, y: 50, radius: 7.5, label: 'Rim Seal', tone: 'paint' },
      { id: 'bz-2', x: 72, y: 14, radius: 7, label: 'Flare 3PT', tone: 'shooter' },
    ],
    actions: [
      { id: 'ba1', type: 'pass', from: [60, 50], to: [75, 36], curve: -7, label: 'Elbow Entry' },
      { id: 'ba2', type: 'screen', from: [75, 64], to: [83, 73], label: 'Rip Screen' },
      { id: 'ba3', type: 'cut', from: [89, 89], to: [88, 53], curve: -16, label: 'Rim Cut' },
      { id: 'ba4', type: 'cut', from: [89, 11], to: [72, 14], curve: 5, label: 'Wing Lift' },
      { id: 'ba5', type: 'pass', from: [75, 36], to: [88, 53], curve: 8, label: 'Hi-Lo Feed' },
    ],
    ballSequence: [
      [60, 50],
      [75, 36],
      [88, 53],
    ],
  },
};

const BASKETBALL_SPAIN: StageCommand = {
  mode: 'basketball',
  title: 'Spain Pick & Roll',
  subtitle: 'High ball screen paired with a shooter back-screen on the drop defender',
  payload: {
    playName: 'Spain PnR Stack',
    courtTheme: 'hardwood',
    setType: 'Ball-Screen Action · 3-Man Game',
    players: [
      { id: 'o1', number: 1, position: 'PG', team: 'offense', x: 58, y: 44, targetX: 73, targetY: 35, hasBall: true },
      { id: 'o2', number: 2, position: 'SG', team: 'offense', x: 81, y: 56, targetX: 65, targetY: 62 },
      { id: 'o3', number: 3, position: 'SF', team: 'offense', x: 91, y: 10, targetX: 91, targetY: 10 },
      { id: 'o4', number: 4, position: 'PF', team: 'offense', x: 91, y: 90, targetX: 91, targetY: 90 },
      { id: 'o5', number: 5, position: 'C', team: 'offense', x: 67, y: 48, targetX: 88, targetY: 48 },
      { id: 'd1', number: 1, position: 'PG', team: 'defense', x: 63, y: 45, targetX: 74, targetY: 42 },
      { id: 'd2', number: 2, position: 'SG', team: 'defense', x: 82, y: 63, targetX: 73, targetY: 60 },
      { id: 'd3', number: 3, position: 'SF', team: 'defense', x: 87, y: 19, targetX: 86, targetY: 22 },
      { id: 'd4', number: 4, position: 'PF', team: 'defense', x: 87, y: 82, targetX: 86, targetY: 79 },
      { id: 'd5', number: 5, position: 'C', team: 'defense', x: 78, y: 50, targetX: 84, targetY: 54 },
    ],
    zones: [
      { id: 'bz-1', x: 88, y: 48, radius: 7, label: 'Lob Window', tone: 'paint' },
      { id: 'bz-2', x: 65, y: 62, radius: 7, label: 'Pop 3PT', tone: 'shooter' },
    ],
    actions: [
      { id: 'ba1', type: 'screen', from: [67, 48], to: [63, 45], label: 'Ball Screen' },
      { id: 'ba2', type: 'dribble', from: [58, 44], to: [73, 35], curve: -5, label: 'Reject/Turn' },
      { id: 'ba3', type: 'screen', from: [81, 56], to: [78, 50], label: 'Back Screen' },
      { id: 'ba4', type: 'cut', from: [67, 48], to: [88, 48], curve: 4, label: 'Dive Roll' },
      { id: 'ba5', type: 'cut', from: [81, 56], to: [65, 62], curve: 7, label: 'Pop Out' },
      { id: 'ba6', type: 'pass', from: [73, 35], to: [88, 48], curve: -8, label: 'Lob / Kick' },
    ],
    ballSequence: [
      [58, 44],
      [73, 35],
      [88, 48],
    ],
  },
};

const BASKETBALL_FIVEOUT: StageCommand = {
  mode: 'basketball',
  title: '5-Out Drive & Kick',
  subtitle: 'Full perimeter spacing forcing help rotation into a weakside corner three',
  payload: {
    playName: '5-Out Spacing Motion',
    courtTheme: 'hardwood',
    setType: 'Perimeter Spacing · Read & React',
    players: [
      { id: 'o1', number: 1, position: 'PG', team: 'offense', x: 60, y: 50, targetX: 82, targetY: 44, hasBall: true },
      { id: 'o2', number: 2, position: 'SG', team: 'offense', x: 70, y: 15, targetX: 62, targetY: 26 },
      { id: 'o3', number: 3, position: 'SF', team: 'offense', x: 91, y: 10, targetX: 91, targetY: 10 },
      { id: 'o4', number: 4, position: 'PF', team: 'offense', x: 70, y: 85, targetX: 74, targetY: 88 },
      { id: 'o5', number: 5, position: 'C', team: 'offense', x: 91, y: 90, targetX: 91, targetY: 90 },
      { id: 'd1', number: 1, position: 'PG', team: 'defense', x: 65, y: 50, targetX: 81, targetY: 48 },
      { id: 'd2', number: 2, position: 'SG', team: 'defense', x: 74, y: 22, targetX: 71, targetY: 31 },
      { id: 'd3', number: 3, position: 'SF', team: 'defense', x: 87, y: 20, targetX: 85, targetY: 34 },
      { id: 'd4', number: 4, position: 'PF', team: 'defense', x: 74, y: 78, targetX: 80, targetY: 66 },
      { id: 'd5', number: 5, position: 'C', team: 'defense', x: 87, y: 80, targetX: 85, targetY: 63 },
    ],
    zones: [
      { id: 'bz-1', x: 82, y: 45, radius: 7, label: 'Paint Collapse', tone: 'paint' },
      { id: 'bz-2', x: 91, y: 90, radius: 6.5, label: 'Open Corner', tone: 'shooter' },
      { id: 'bz-3', x: 91, y: 10, radius: 6.5, label: 'Weakside Lift', tone: 'spacing' },
    ],
    actions: [
      { id: 'ba1', type: 'dribble', from: [60, 50], to: [82, 44], curve: -4, label: 'Gap Attack' },
      { id: 'ba2', type: 'cut', from: [70, 15], to: [62, 26], curve: -3, label: 'Slot Fill' },
      { id: 'ba3', type: 'pass', from: [82, 44], to: [91, 90], curve: 14, label: 'Skip Kick-Out' },
      { id: 'ba4', type: 'pass', from: [82, 44], to: [62, 26], curve: -8, label: 'Safety Outlet' },
    ],
    ballSequence: [
      [60, 50],
      [82, 44],
      [91, 90],
    ],
  },
};

/* ─── Weapon Presets (Photorealistic Studio + Live Wiki Renders) ───────── */
const WEAPON_M4A1 = buildWeaponCommand(
  'm4a1',
  'Warzone M4A1 Meta',
  'Monolithic suppressor + Corvus barrel tuned for zero-recoil mid-range beaming',
  {
    optic: 'holo-exps3',
    muzzle: 'suppressor-mono',
    barrel: 'barrel-fluted',
    underbarrel: 'grip-angled',
    magazine: 'mag-40rd',
    stock: 'stock-crane',
  },
  'muzzle',
);

const WEAPON_VX9 = buildWeaponCommand(
  'vx9',
  'VX-9 Vector CQB',
  'High-cadence close-quarters submachine gun tuned for rapid ADS and sprint mobility',
  {
    optic: 'reflex-micro',
    muzzle: 'comp-ported',
    barrel: 'barrel-cqb',
    underbarrel: 'grip-vertical',
    magazine: 'mag-50drum',
    stock: 'stock-skeleton',
  },
  'magazine',
);

const WEAPON_M200 = buildWeaponCommand(
  'm200',
  'M200 Intervention',
  'Long-range anti-materiel bolt platform configured for extreme velocity and accuracy',
  {
    optic: 'sniper-8x',
    muzzle: 'brake-heavy',
    barrel: 'barrel-match',
    underbarrel: 'bipod-tactical',
    magazine: 'mag-match7',
    stock: 'stock-precision',
  },
  'optic',
);

/* ─── Tactical Game Map Presets (Real Overhead Maps + Animated Overlays) ─ */
const MAP_MIRAGE_SMOKE: StageCommand = {
  mode: 'map',
  title: 'Mirage A-Site Smoke Execute',
  subtitle: 'Triple smoke wall (CT, Jungle, Stairs) paired with Palace & A-Ramp synchronized split',
  payload: {
    mapId: 'mirage',
    gameTitle: 'Counter-Strike 2',
    sectorName: 'de_mirage · Bomb Site A',
    operationPhase: 'Full Buy Execute · 00:55',
    wikiQuery: 'Mirage',
    wikiSite: 'counterstrike',
    pois: [
      { id: 'm-p1', name: 'A Palace', x: 24, y: 24, grid: 'B2', tier: 'major' },
      { id: 'm-p2', name: 'A Site', x: 24, y: 54, grid: 'B4', tier: 'major' },
      { id: 'm-p3', name: 'Connector', x: 37, y: 53, grid: 'C4', tier: 'minor' },
      { id: 'm-p4', name: 'Mid Plaza', x: 50, y: 53, grid: 'D4', tier: 'major' },
      { id: 'm-p5', name: 'Catwalk', x: 65, y: 52, grid: 'F4', tier: 'minor' },
      { id: 'm-p6', name: 'B Site', x: 80, y: 31, grid: 'G2', tier: 'major' },
    ],
    zones: [
      { id: 'sm-ct', type: 'smoke', x: 27, y: 74, radius: 7.5, label: 'CT Smoke' },
      { id: 'sm-jng', type: 'smoke', x: 36, y: 60, radius: 7.2, label: 'Jungle Smoke' },
      { id: 'sm-str', type: 'smoke', x: 35, y: 42, radius: 6.8, label: 'Stairs Smoke' },
      { id: 'dz-awp', type: 'danger', x: 21, y: 45, radius: 6.5, label: 'CT Crossfire' },
    ],
    markers: [
      { id: 'cs-1', type: 'squad', label: 'Entry 1', x: 9, y: 58, heading: -15, color: '#38BDF8' },
      { id: 'cs-2', type: 'squad', label: 'Entry 2', x: 11, y: 69, heading: -30, color: '#34D399' },
      { id: 'cs-3', type: 'squad', label: 'Palace Lurker', x: 18, y: 24, heading: 80, color: '#F59E0B' },
      { id: 'cs-4', type: 'squad', label: 'Mid Control', x: 51, y: 77, heading: -95, color: '#A78BFA' },
      { id: 'cs-obj', type: 'objective', label: 'Default Plant', x: 22, y: 61 },
      { id: 'cs-h1', type: 'hostile', label: 'CT Anchor', x: 29, y: 48 },
      { id: 'cs-h2', type: 'hostile', label: 'Ticket AWPer', x: 33, y: 79 },
    ],
    routes: [
      {
        id: 'r-ramp',
        type: 'flank',
        label: 'A-Ramp Split',
        points: [
          [9, 58],
          [16, 56],
          [22, 61],
        ],
      },
      {
        id: 'r-palace',
        type: 'extract',
        label: 'Palace Pop-Flash',
        points: [
          [18, 24],
          [24, 34],
          [24, 49],
        ],
      },
      {
        id: 'r-mid',
        type: 'patrol',
        label: 'Connector Pinch',
        points: [
          [51, 77],
          [49, 55],
          [38, 53],
        ],
      },
    ],
  },
};

const COMMON_WARZONE_POIS = [
  { id: 'poi-1', name: 'Power Station', x: 22, y: 24, grid: 'B2', tier: 'major' as const },
  { id: 'poi-2', name: 'Airfield', x: 74, y: 22, grid: 'F2', tier: 'major' as const },
  { id: 'poi-3', name: 'Central Depot', x: 49, y: 48, grid: 'D4', tier: 'major' as const },
  { id: 'poi-4', name: 'Radar Hill', x: 25, y: 71, grid: 'B5', tier: 'minor' as const },
  { id: 'poi-5', name: 'Harbor Docks', x: 78, y: 74, grid: 'G5', tier: 'major' as const },
  { id: 'poi-6', name: 'Bridge Crossing', x: 43, y: 29, grid: 'D2', tier: 'minor' as const },
];

const MAP_ROTATION: StageCommand = {
  mode: 'map',
  title: 'Warzone Safe Zone Rotation',
  subtitle: 'Circle 3 closing toward Central Depot · Squad executing north ridge flank',
  payload: {
    mapId: 'warzone',
    gameTitle: 'Call of Duty: Warzone',
    sectorName: 'Verdansk Sector 04',
    operationPhase: 'Phase 3 · 01:45 Collapse',
    wikiQuery: 'Verdansk',
    wikiSite: 'callofduty',
    pois: COMMON_WARZONE_POIS,
    zones: [
      { id: 'mz-gas', type: 'gas', x: 52, y: 50, radius: 42, label: 'Gas Perimeter' },
      { id: 'mz-safe', type: 'safe', x: 53, y: 49, radius: 24, label: 'Next Safe Zone' },
      { id: 'mz-red', type: 'danger', x: 35, y: 58, radius: 9, label: 'Precision Airstrike' },
    ],
    markers: [
      { id: 'm-a', type: 'squad', label: 'Alpha', x: 25, y: 31, heading: 35, color: '#38BDF8' },
      { id: 'm-b', type: 'squad', label: 'Bravo', x: 29, y: 35, heading: 40, color: '#34D399' },
      { id: 'm-c', type: 'squad', label: 'Charlie', x: 22, y: 36, heading: 25, color: '#F59E0B' },
      { id: 'm-obj', type: 'objective', label: 'Loadout Drop', x: 54, y: 39 },
      { id: 'm-ext', type: 'extract', label: 'Extract LZ-2', x: 67, y: 58 },
      { id: 'm-h1', type: 'hostile', label: 'UAV Ping', x: 44, y: 60 },
    ],
    routes: [
      {
        id: 'r-flank',
        type: 'flank',
        label: 'North Ridge Flank',
        points: [
          [25, 31],
          [38, 22],
          [49, 28],
          [54, 39],
        ],
      },
      {
        id: 'r-ext',
        type: 'extract',
        label: 'Secondary Exfil',
        points: [
          [54, 39],
          [61, 49],
          [67, 58],
        ],
      },
    ],
  },
};

const MAP_EXTRACTION: StageCommand = {
  mode: 'map',
  title: 'Harbor Extraction Push',
  subtitle: 'Final circle collapsing onto Harbor Docks · Smoke corridor dash to chopper LZ',
  payload: {
    mapId: 'harbor',
    gameTitle: 'Extraction Tactical',
    sectorName: 'Sector Harbor South',
    operationPhase: 'Final Exfil · 00:42 Remaining',
    pois: COMMON_WARZONE_POIS,
    zones: [
      { id: 'mz-gas', type: 'gas', x: 73, y: 69, radius: 28, label: 'Closing Gas' },
      { id: 'mz-safe', type: 'safe', x: 78, y: 74, radius: 13, label: 'Final Safe Zone' },
      { id: 'mz-red', type: 'danger', x: 64, y: 62, radius: 7.5, label: 'Mortar Barrage' },
    ],
    markers: [
      { id: 'm-a', type: 'squad', label: 'Alpha', x: 52, y: 54, heading: 38, color: '#38BDF8' },
      { id: 'm-b', type: 'squad', label: 'Bravo', x: 55, y: 58, heading: 35, color: '#34D399' },
      { id: 'm-c', type: 'squad', label: 'Charlie', x: 61, y: 74, heading: 5, color: '#F59E0B' },
      { id: 'm-ext', type: 'extract', label: 'Chopper LZ-1', x: 78, y: 74 },
      { id: 'm-h1', type: 'hostile', label: 'Dock Ambush', x: 71, y: 66 },
    ],
    routes: [
      {
        id: 'r-ext',
        type: 'extract',
        label: 'Smoke Corridor',
        points: [
          [52, 54],
          [59, 68],
          [69, 76],
          [78, 74],
        ],
      },
      {
        id: 'r-cov',
        type: 'patrol',
        label: 'Overwatch Cover',
        points: [
          [61, 74],
          [70, 79],
          [78, 74],
        ],
      },
    ],
  },
};

/* ─── Strategy / MOBA / RTS Presets (5th Mode) ─────────────────────────── */
const STRATEGY_DOTA_GANK: StageCommand = {
  mode: 'strategy',
  title: 'Dota 2 Top Lane Gank',
  subtitle: 'Smoke wrap from Radiant jungle into Dire Tier 1 with Earthshaker Blink Echo Slam setup',
  payload: {
    game: 'dota2',
    gameLabel: 'Dota 2 · 3-Lane MOBA',
    mapTitle: 'Radiant vs Dire',
    matchClock: '18:40 · Night Vision',
    units: [
      { id: 'u1', name: 'Earthshaker', heroKey: 'earthshaker', role: 'Pos 4', team: 'radiant', x: 35, y: 31, targetX: 28, targetY: 19, level: 11, ultimateReady: true },
      { id: 'u2', name: 'Pudge', heroKey: 'pudge', role: 'Pos 3', team: 'radiant', x: 17, y: 34, targetX: 23, targetY: 22, level: 12, ultimateReady: true },
      { id: 'u3', name: 'Juggernaut', heroKey: 'juggernaut', role: 'Pos 1', team: 'radiant', x: 18, y: 17, targetX: 27, targetY: 16, level: 14, ultimateReady: true },
      { id: 'u4', name: 'Invoker', heroKey: 'invoker', role: 'Pos 2', team: 'radiant', x: 48, y: 50, targetX: 43, targetY: 36, level: 15, ultimateReady: true },
      { id: 'u5', name: 'Crystal Maiden', heroKey: 'crystal_maiden', role: 'Pos 5', team: 'radiant', x: 56, y: 78, targetX: 62, targetY: 75, level: 9 },
      // Dire targets
      { id: 'e1', name: 'Phantom Assassin', heroKey: 'phantom_assassin', role: 'Pos 1', team: 'dire', x: 32, y: 15, targetX: 36, targetY: 16, level: 13 },
      { id: 'e2', name: 'Rubick', heroKey: 'rubick', role: 'Pos 5', team: 'dire', x: 37, y: 21, targetX: 39, targetY: 22, level: 10 },
      { id: 'e3', name: 'Lina', heroKey: 'lina', role: 'Pos 2', team: 'dire', x: 56, y: 45, targetX: 45, targetY: 28, level: 14 },
      { id: 'e4', name: 'Axe', heroKey: 'axe', role: 'Pos 3', team: 'dire', x: 76, y: 72, targetX: 72, targetY: 75, level: 12 },
    ],
    objectives: [
      { id: 'obj-rosh', type: 'roshan', label: 'Roshan Pit', timer: '02:15', x: 70, y: 55, team: 'neutral' },
      { id: 'obj-t1', type: 'tower', label: 'Dire Top T1', timer: '42% HP', x: 42, y: 13, team: 'dire' },
      { id: 'obj-mid', type: 'tower', label: 'Radiant Mid T1', x: 41, y: 58, team: 'radiant' },
    ],
    wards: [
      { id: 'w1', type: 'observer', x: 34, y: 28, radius: 13, team: 'radiant' },
      { id: 'w2', type: 'sentry', x: 64, y: 51, radius: 10, team: 'radiant' },
      { id: 'w3', type: 'observer', x: 52, y: 39, radius: 12, team: 'dire' },
    ],
    actions: [
      { id: 'sa1', type: 'gank', from: [35, 31], to: [32, 16], curve: -10, label: 'Smoke Blink Wrap' },
      { id: 'sa2', type: 'combo', from: [32, 16], to: [32, 16], radius: 9.5, label: 'Echo Slam + Hook' },
      { id: 'sa3', type: 'push', from: [18, 17], to: [42, 13], curve: -4, label: 'Top Lane Push' },
      { id: 'sa4', type: 'tp', from: [56, 45], to: [42, 15], curve: 8, label: 'Dire Counter-TP' },
    ],
  },
};

const STRATEGY_LOL_BARON: StageCommand = {
  mode: 'strategy',
  title: 'League Baron Setup',
  subtitle: 'Blue team river vision lock with Lee Sin flank angle and control ward denial around Baron pit',
  payload: {
    game: 'lol',
    gameLabel: 'League of Legends · Summoner’s Rift',
    mapTitle: 'Baron Nashor Control',
    matchClock: '24:15 · Baron Live',
    units: [
      { id: 'l1', name: 'Lee Sin', heroKey: 'LeeSin', role: 'Jungle', team: 'radiant', x: 34, y: 34, targetX: 43, targetY: 25, level: 13, ultimateReady: true },
      { id: 'l2', name: 'Ahri', heroKey: 'Ahri', role: 'Mid', team: 'radiant', x: 46, y: 46, targetX: 48, targetY: 36, level: 15, ultimateReady: true },
      { id: 'l3', name: 'Jinx', heroKey: 'Jinx', role: 'ADC', team: 'radiant', x: 39, y: 42, targetX: 35, targetY: 33, level: 14, ultimateReady: true },
      { id: 'l4', name: 'Thresh', heroKey: 'Thresh', role: 'Support', team: 'radiant', x: 43, y: 38, targetX: 49, targetY: 31, level: 11 },
      { id: 'l5', name: 'Garen', heroKey: 'Garen', role: 'Top', team: 'radiant', x: 74, y: 80, targetX: 54, targetY: 24, level: 15, ultimateReady: true },
      // Red team contesting
      { id: 'r1', name: 'Viego', heroKey: 'Viego', role: 'Jungle', team: 'dire', x: 58, y: 33, targetX: 46, targetY: 31, level: 13 },
      { id: 'r2', name: 'Azir', heroKey: 'Azir', role: 'Mid', team: 'dire', x: 61, y: 41, targetX: 53, targetY: 38, level: 14 },
      { id: 'r3', name: 'Kai’Sa', heroKey: 'Kaisa', role: 'ADC', team: 'dire', x: 65, y: 48, targetX: 57, targetY: 42, level: 14 },
      { id: 'r4', name: 'Nautilus', heroKey: 'Nautilus', role: 'Support', team: 'dire', x: 55, y: 39, targetX: 50, targetY: 35, level: 11 },
    ],
    objectives: [
      { id: 'obj-baron', type: 'baron', label: 'Baron Nashor', timer: '00:45', x: 33, y: 29, team: 'neutral' },
      { id: 'obj-drake', type: 'roshan', label: 'Infernal Drake', timer: '03:10', x: 66, y: 70, team: 'neutral' },
      { id: 'obj-t2', type: 'tower', label: 'Red Mid T1', x: 59, y: 45, team: 'dire' },
    ],
    wards: [
      { id: 'lw1', type: 'control', x: 36, y: 32, radius: 11, team: 'radiant' },
      { id: 'lw2', type: 'observer', x: 50, y: 32, radius: 13, team: 'radiant' },
      { id: 'lw3', type: 'observer', x: 54, y: 44, radius: 11, team: 'dire' },
    ],
    actions: [
      { id: 'la1', type: 'tp', from: [74, 80], to: [54, 24], curve: 18, label: 'Top Flank TP' },
      { id: 'la2', type: 'gank', from: [34, 34], to: [53, 38], curve: -8, label: 'Insec Kick Angle' },
      { id: 'la3', type: 'combo', from: [49, 34], to: [49, 34], radius: 9, label: 'River Choke Fight' },
      { id: 'la4', type: 'push', from: [46, 46], to: [59, 45], curve: 4, label: 'Mid Wave Prio' },
    ],
  },
};

const STRATEGY_RTS_SIEGE: StageCommand = {
  mode: 'strategy',
  title: 'RTS Dual-Prong Siege',
  subtitle: 'Main armored column pinning central ramp while fast drop squad flanks natural expansion',
  payload: {
    game: 'rts',
    gameLabel: 'RTS Command · Multi-Front',
    mapTitle: 'Shattered Valley',
    matchClock: '11:20 · 185/200 Supply',
    units: [
      { id: 's1', name: 'Siege Tanks', heroKey: 'tank', role: 'Artillery', team: 'radiant', x: 42, y: 54, targetX: 52, targetY: 46, level: 3 },
      { id: 's2', name: 'Marine Bio', heroKey: 'bio', role: 'Frontline', team: 'radiant', x: 47, y: 49, targetX: 57, targetY: 42, level: 3 },
      { id: 's3', name: 'Medivac Drop', heroKey: 'drop', role: 'Air Flank', team: 'radiant', x: 24, y: 22, targetX: 72, targetY: 18, level: 2, ultimateReady: true },
      { id: 's4', name: 'Banshee Wing', heroKey: 'air', role: 'Harass', team: 'radiant', x: 64, y: 78, targetX: 82, targetY: 66, level: 2 },
      // Opposing defenders
      { id: 'se1', name: 'Colossus Core', heroKey: 'colossus', role: 'Heavy', team: 'dire', x: 62, y: 42, targetX: 59, targetY: 43, level: 3 },
      { id: 'se2', name: 'Stalker Blink', heroKey: 'stalker', role: 'Mobile', team: 'dire', x: 68, y: 31, targetX: 73, targetY: 23, level: 2 },
    ],
    objectives: [
      { id: 'rts-main', type: 'base', label: 'Enemy Main Base', timer: 'Exposed', x: 82, y: 18, team: 'dire' },
      { id: 'rts-nat', type: 'tower', label: '3rd Expansion', timer: 'Mining', x: 78, y: 60, team: 'dire' },
      { id: 'rts-watch', type: 'roshan', label: 'Xel’Naga Tower', x: 50, y: 50, team: 'neutral' },
    ],
    wards: [
      { id: 'rw1', type: 'observer', x: 50, y: 50, radius: 15, team: 'radiant' },
      { id: 'rw2', type: 'sentry', x: 74, y: 24, radius: 10, team: 'dire' },
    ],
    actions: [
      { id: 'ra1', type: 'push', from: [42, 54], to: [61, 43], curve: -3, label: 'Center Siege Line' },
      { id: 'ra2', type: 'gank', from: [24, 22], to: [78, 18], curve: -12, label: 'Doom Drop Flank' },
      { id: 'ra3', type: 'combo', from: [78, 18], to: [78, 18], radius: 8.5, label: 'Mineral Line Raid' },
      { id: 'ra4', type: 'gank', from: [64, 78], to: [80, 62], curve: 6, label: 'Worker Harass' },
    ],
  },
};

export const STAGE_PRESETS: StagePreset[] = [
  { id: 'fb-madrid', label: 'Real Madrid 4-3-3', shortLabel: 'Real Madrid 4-3-3', mode: 'football', command: FOOTBALL_REAL_MADRID },
  { id: 'fb-352', label: '3-5-2 Wingback Overload', shortLabel: '3-5-2 Overload', mode: 'football', command: FOOTBALL_352 },
  { id: 'fb-442', label: '4-4-2 Counter Block', shortLabel: '4-4-2 Counter', mode: 'football', command: FOOTBALL_442 },

  { id: 'bb-horns', label: 'Horns Rip Cut', shortLabel: 'Horns Rip', mode: 'basketball', command: BASKETBALL_HORNS },
  { id: 'bb-spain', label: 'Spain Pick & Roll', shortLabel: 'Spain PnR', mode: 'basketball', command: BASKETBALL_SPAIN },
  { id: 'bb-5out', label: '5-Out Drive & Kick', shortLabel: '5-Out Motion', mode: 'basketball', command: BASKETBALL_FIVEOUT },

  { id: 'wp-m4a1', label: 'Warzone M4A1 Meta', shortLabel: 'Warzone M4A1', mode: 'weapon', command: WEAPON_M4A1 },
  { id: 'wp-vx9', label: 'VX-9 Vector CQB', shortLabel: 'VX-9 CQB', mode: 'weapon', command: WEAPON_VX9 },
  { id: 'wp-m200', label: 'M200 Intervention', shortLabel: 'M200 Sniper', mode: 'weapon', command: WEAPON_M200 },

  { id: 'mp-mirage', label: 'Mirage A-Site Smoke Execute', shortLabel: 'Mirage A-Site', mode: 'map', command: MAP_MIRAGE_SMOKE },
  { id: 'mp-rotation', label: 'Warzone Safe Zone Rotation', shortLabel: 'Warzone Zone', mode: 'map', command: MAP_ROTATION },
  { id: 'mp-extract', label: 'Harbor Extraction Push', shortLabel: 'Extraction Push', mode: 'map', command: MAP_EXTRACTION },

  { id: 'st-dota', label: 'Dota 2 Top Lane Gank', shortLabel: 'Dota 2 Gank', mode: 'strategy', command: STRATEGY_DOTA_GANK },
  { id: 'st-lol', label: 'League Baron Setup', shortLabel: 'LoL Baron', mode: 'strategy', command: STRATEGY_LOL_BARON },
  { id: 'st-rts', label: 'RTS Dual-Prong Siege', shortLabel: 'RTS Siege', mode: 'strategy', command: STRATEGY_RTS_SIEGE },
];

export function getPresetsByMode(mode: StageMode): StagePreset[] {
  return STAGE_PRESETS.filter((p) => p.mode === mode);
}

export function getDefaultPresetForMode(mode: StageMode): StageCommand {
  const preset = STAGE_PRESETS.find((p) => p.mode === mode);
  if (!preset) return FOOTBALL_REAL_MADRID;
  return structuredClone(preset.command);
}

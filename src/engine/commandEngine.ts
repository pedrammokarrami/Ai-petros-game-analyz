import {
  ATTACHMENT_CATALOG,
  calculateWeaponStats,
  getDefaultPresetForMode,
  STAGE_PRESETS,
} from './presets';
import type {
  AttachmentSlot,
  CommandSource,
  StageCommand,
  StageMode,
  StageState,
  ValidationResult,
  WeaponStats,
} from './types';

const VALID_MODES: StageMode[] = ['football', 'basketball', 'weapon', 'map', 'strategy'];

export function createInitialStageState(): StageState {
  const initialCommand = getDefaultPresetForMode('football');
  return {
    activeCommand: initialCommand,
    previousWeaponStats: null,
    weaponStatDeltas: null,
    commandSequence: 1,
    lastUpdatedAt: Date.now(),
    history: [
      {
        id: 'cmd-init-1',
        timestamp: formatTime(new Date()),
        source: 'preset',
        mode: initialCommand.mode,
        title: initialCommand.title,
        summary: 'Initial tactical preset loaded',
        command: initialCommand,
      },
    ],
  };
}

function formatTime(date: Date): string {
  return date.toTimeString().slice(0, 8);
}

export function validateCommand(raw: unknown): ValidationResult {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { ok: false, error: 'Command must be a JSON object with mode, title, subtitle, and payload.' };
  }

  const obj = raw as Record<string, unknown>;
  if (typeof obj.mode !== 'string' || !VALID_MODES.includes(obj.mode as StageMode)) {
    return {
      ok: false,
      error: `Invalid "mode". Expected one of: ${VALID_MODES.join(', ')}.`,
    };
  }

  if (typeof obj.title !== 'string' || obj.title.trim().length === 0) {
    return { ok: false, error: 'Missing required non-empty "title" string.' };
  }

  const subtitle = typeof obj.subtitle === 'string' ? obj.subtitle : '';

  if (!obj.payload || typeof obj.payload !== 'object' || Array.isArray(obj.payload)) {
    return { ok: false, error: 'Missing required "payload" object for the selected mode.' };
  }

  const payload = obj.payload as Record<string, unknown>;

  if (obj.mode === 'football') {
    if (!Array.isArray(payload.players) || payload.players.length === 0) {
      return { ok: false, error: 'Football payload requires a non-empty "players" array.' };
    }
    if (!Array.isArray(payload.vectors)) {
      return { ok: false, error: 'Football payload requires a "vectors" array.' };
    }
  } else if (obj.mode === 'basketball') {
    if (!Array.isArray(payload.players) || payload.players.length === 0) {
      return { ok: false, error: 'Basketball payload requires a non-empty "players" array.' };
    }
    if (!Array.isArray(payload.actions)) {
      return { ok: false, error: 'Basketball payload requires an "actions" array.' };
    }
  } else if (obj.mode === 'weapon') {
    if (!payload.attachments || typeof payload.attachments !== 'object') {
      return { ok: false, error: 'Weapon payload requires an "attachments" map.' };
    }
    if (!payload.stats || typeof payload.stats !== 'object') {
      return { ok: false, error: 'Weapon payload requires a "stats" object.' };
    }
  } else if (obj.mode === 'map') {
    if (!Array.isArray(payload.zones) || !Array.isArray(payload.markers)) {
      return { ok: false, error: 'Map payload requires "zones" and "markers" arrays.' };
    }
    if (!Array.isArray(payload.routes)) {
      return { ok: false, error: 'Map payload requires a "routes" array.' };
    }
  } else if (obj.mode === 'strategy') {
    if (!Array.isArray(payload.units) || payload.units.length === 0) {
      return { ok: false, error: 'Strategy payload requires a non-empty "units" array.' };
    }
    if (!Array.isArray(payload.actions)) {
      return { ok: false, error: 'Strategy payload requires an "actions" array.' };
    }
  }

  return {
    ok: true,
    command: structuredClone({
      mode: obj.mode,
      title: obj.title.trim(),
      subtitle: subtitle.trim(),
      payload: obj.payload,
    }) as StageCommand,
  };
}

export function parseJsonCommand(jsonText: string): ValidationResult {
  const trimmed = jsonText.trim();
  if (!trimmed) {
    return { ok: false, error: 'Command JSON cannot be empty.' };
  }
  try {
    const parsed: unknown = JSON.parse(trimmed);
    return validateCommand(parsed);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Syntax error';
    return { ok: false, error: `Invalid JSON syntax: ${message}` };
  }
}

export function computeWeaponStatDeltas(
  previous: WeaponStats | null,
  current: WeaponStats,
): WeaponStats {
  if (!previous) {
    return { damage: 0, accuracy: 0, fireRate: 0, mobility: 0, control: 0 };
  }
  return {
    damage: current.damage - previous.damage,
    accuracy: current.accuracy - previous.accuracy,
    fireRate: current.fireRate - previous.fireRate,
    mobility: current.mobility - previous.mobility,
    control: current.control - previous.control,
  };
}

export function swapWeaponAttachment(
  currentCommand: StageCommand,
  slot: AttachmentSlot,
  attachmentId: string,
): StageCommand {
  const baseCommand =
    currentCommand.mode === 'weapon'
      ? structuredClone(currentCommand)
      : (getDefaultPresetForMode('weapon') as Extract<StageCommand, { mode: 'weapon' }>);

  const chosen = ATTACHMENT_CATALOG[slot].find((item) => item.id === attachmentId);
  if (!chosen) return baseCommand;

  baseCommand.payload.attachments[slot] = chosen;
  baseCommand.payload.highlightedSlot = slot;
  baseCommand.payload.stats = calculateWeaponStats(
    baseCommand.payload.chassis,
    baseCommand.payload.attachments,
  );
  baseCommand.subtitle = `Equipped ${chosen.name} (${chosen.calloutNote})`;
  return baseCommand;
}

export function cycleWeaponAttachmentSlot(
  currentCommand: StageCommand,
  slot: AttachmentSlot,
): StageCommand {
  const baseCommand =
    currentCommand.mode === 'weapon'
      ? structuredClone(currentCommand)
      : (getDefaultPresetForMode('weapon') as Extract<StageCommand, { mode: 'weapon' }>);

  const options = ATTACHMENT_CATALOG[slot];
  const currentId = baseCommand.payload.attachments[slot]?.id;
  const idx = options.findIndex((item) => item.id === currentId);
  const next = options[(idx + 1) % options.length] ?? options[0];
  return swapWeaponAttachment(baseCommand, slot, next.id);
}

export function applyStageCommand(
  state: StageState,
  command: StageCommand,
  source: CommandSource,
  summary?: string,
): StageState {
  const prevCommand = state.activeCommand;
  let previousWeaponStats: WeaponStats | null = state.previousWeaponStats;
  let weaponStatDeltas: WeaponStats | null = null;

  if (command.mode === 'weapon') {
    const baseline = prevCommand.mode === 'weapon' ? prevCommand.payload.stats : null;
    previousWeaponStats = baseline;
    weaponStatDeltas = computeWeaponStatDeltas(baseline, command.payload.stats);
  } else {
    weaponStatDeltas = null;
  }

  const nextSeq = state.commandSequence + 1;
  const entry = {
    id: `cmd-${nextSeq}-${Date.now()}`,
    timestamp: formatTime(new Date()),
    source,
    mode: command.mode,
    title: command.title,
    summary: summary ?? `${command.mode.toUpperCase()} · ${command.title}`,
    command: structuredClone(command),
  };

  return {
    activeCommand: structuredClone(command),
    previousWeaponStats,
    weaponStatDeltas,
    commandSequence: nextSeq,
    lastUpdatedAt: Date.now(),
    history: [entry, ...state.history].slice(0, 18),
  };
}

/**
 * Deterministic local backend command interpreter.
 * Translates natural-language prompts like "Real Madrid 4-3-3", "Warzone M4A1 Meta",
 * "Mirage A-Site Smoke Execute", and "Dota 2 Top Lane Gank" into structured JSON commands.
 */
export function interpretTextPrompt(
  prompt: string,
  currentState: StageState,
): { command: StageCommand; summary: string } {
  const q = prompt.toLowerCase().trim();

  // Strategy / MOBA / RTS intents
  if (q.includes('dota') || q.includes('roshan') || q.includes('top lane gank') || q.includes('earthshaker') || q.includes('pudge')) {
    const preset = STAGE_PRESETS.find((p) => p.id === 'st-dota')!;
    return { command: structuredClone(preset.command), summary: `Prompt -> ${preset.label}` };
  }
  if (q.includes('league') || q.includes('lol') || q.includes('baron') || q.includes('summoner') || q.includes('lee sin') || q.includes('ahri')) {
    const preset = STAGE_PRESETS.find((p) => p.id === 'st-lol')!;
    return { command: structuredClone(preset.command), summary: `Prompt -> ${preset.label}` };
  }
  if (q.includes('rts') || q.includes('starcraft') || q.includes('siege') || q.includes('age of empires') || q.includes('clash') || q.includes('strategy') || q.includes('moba')) {
    const preset = STAGE_PRESETS.find((p) => p.id === 'st-rts')!;
    return { command: structuredClone(preset.command), summary: `Prompt -> ${preset.label}` };
  }

  // Football formation & club/player intents
  if (q.includes('3-5-2') || q.includes('352') || q.includes('wingback') || q.includes('overload') || q.includes('haaland')) {
    const preset = STAGE_PRESETS.find((p) => p.id === 'fb-352')!;
    return { command: structuredClone(preset.command), summary: `Prompt -> ${preset.label}` };
  }
  if (q.includes('4-4-2') || q.includes('442') || q.includes('counter') || q.includes('low block')) {
    const preset = STAGE_PRESETS.find((p) => p.id === 'fb-442')!;
    return { command: structuredClone(preset.command), summary: `Prompt -> ${preset.label}` };
  }
  if (
    q.includes('real madrid') ||
    q.includes('madrid') ||
    q.includes('mbappe') ||
    q.includes('bellingham') ||
    q.includes('vinicius') ||
    q.includes('4-3-3') ||
    q.includes('433') ||
    q.includes('press') ||
    q.includes('football') ||
    q.includes('pitch')
  ) {
    const preset = STAGE_PRESETS.find((p) => p.id === 'fb-madrid')!;
    return { command: structuredClone(preset.command), summary: `Prompt -> ${preset.label}` };
  }

  // Basketball playbook intents
  if (q.includes('spain') || q.includes('pick and roll') || q.includes('pnr') || q.includes('lob')) {
    const preset = STAGE_PRESETS.find((p) => p.id === 'bb-spain')!;
    return { command: structuredClone(preset.command), summary: `Prompt -> ${preset.label}` };
  }
  if (q.includes('5-out') || q.includes('five out') || q.includes('spacing') || q.includes('corner three') || q.includes('drive')) {
    const preset = STAGE_PRESETS.find((p) => p.id === 'bb-5out')!;
    return { command: structuredClone(preset.command), summary: `Prompt -> ${preset.label}` };
  }
  if (q.includes('horns') || q.includes('basketball') || q.includes('court') || q.includes('screen') || q.includes('nba')) {
    const preset = STAGE_PRESETS.find((p) => p.id === 'bb-horns')!;
    return { command: structuredClone(preset.command), summary: `Prompt -> ${preset.label}` };
  }

  // Tactical Map intents (check Mirage/Smoke Execute before generic weapon/warzone)
  if (q.includes('mirage') || q.includes('a-site') || q.includes('smoke execute') || q.includes('cs2') || q.includes('counter-strike')) {
    const preset = STAGE_PRESETS.find((p) => p.id === 'mp-mirage')!;
    return { command: structuredClone(preset.command), summary: `Prompt -> ${preset.label}` };
  }
  if (q.includes('extract') || q.includes('harbor') || q.includes('chopper') || q.includes('exfil')) {
    const preset = STAGE_PRESETS.find((p) => p.id === 'mp-extract')!;
    return { command: structuredClone(preset.command), summary: `Prompt -> ${preset.label}` };
  }
  if (q.includes('safe zone') || q.includes('rotation') || q.includes('verdansk') || q.includes('flank') || q.includes('map')) {
    const preset = STAGE_PRESETS.find((p) => p.id === 'mp-rotation')!;
    return { command: structuredClone(preset.command), summary: `Prompt -> ${preset.label}` };
  }

  // Weapon attachment swaps & loadouts
  if (q.includes('suppressor') || q.includes('silencer')) {
    return {
      command: swapWeaponAttachment(currentState.activeCommand, 'muzzle', 'suppressor-mono'),
      summary: 'Equipped Monolithic Suppressor',
    };
  }
  if (q.includes('compensator')) {
    return {
      command: swapWeaponAttachment(currentState.activeCommand, 'muzzle', 'comp-ported'),
      summary: 'Equipped Ported Compensator',
    };
  }
  if (q.includes('acog') || q.includes('4x')) {
    return {
      command: swapWeaponAttachment(currentState.activeCommand, 'optic', 'acog-4x'),
      summary: 'Equipped TA31 4x Optical',
    };
  }
  if (q.includes('holo')) {
    return {
      command: swapWeaponAttachment(currentState.activeCommand, 'optic', 'holo-exps3'),
      summary: 'Equipped EXPS3 Holographic',
    };
  }
  if (q.includes('drum')) {
    return {
      command: swapWeaponAttachment(currentState.activeCommand, 'magazine', 'mag-50drum'),
      summary: 'Equipped 50-Rd Compact Drum',
    };
  }
  if (q.includes('skeleton')) {
    return {
      command: swapWeaponAttachment(currentState.activeCommand, 'stock', 'stock-skeleton'),
      summary: 'Equipped Folding Skeleton Stock',
    };
  }
  if (q.includes('sniper') || q.includes('m200') || q.includes('marksman') || q.includes('awp') || q.includes('battlefield')) {
    const preset = STAGE_PRESETS.find((p) => p.id === 'wp-m200')!;
    return { command: structuredClone(preset.command), summary: `Prompt -> ${preset.label}` };
  }
  if (q.includes('smg') || q.includes('vector') || q.includes('vx-9') || q.includes('cqb')) {
    const preset = STAGE_PRESETS.find((p) => p.id === 'wp-vx9')!;
    return { command: structuredClone(preset.command), summary: `Prompt -> ${preset.label}` };
  }
  if (q.includes('warzone') || q.includes('m4') || q.includes('meta') || q.includes('weapon') || q.includes('loadout') || q.includes('gunsmith') || q.includes('valorant')) {
    const preset = STAGE_PRESETS.find((p) => p.id === 'wp-m4a1')!;
    return { command: structuredClone(preset.command), summary: `Prompt -> ${preset.label}` };
  }

  // Fallback: cycle to next preset within current mode while attaching user prompt subtitle
  const sameMode = STAGE_PRESETS.filter((p) => p.mode === currentState.activeCommand.mode);
  const currentIdx = sameMode.findIndex((p) => p.command.title === currentState.activeCommand.title);
  const nextPreset = sameMode[(currentIdx + 1) % sameMode.length] ?? STAGE_PRESETS[0];
  const customized = structuredClone(nextPreset.command);
  if (prompt.trim().length > 2) {
    customized.subtitle = `Command: "${prompt.trim()}"`;
  }
  return { command: customized, summary: `Adapted -> ${customized.title}` };
}

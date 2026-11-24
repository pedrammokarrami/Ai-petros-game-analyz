import {
  interpretTextPrompt,
  parseJsonCommand,
  validateCommand,
} from './commandEngine';
import { STAGE_PRESETS } from './presets';
import type { AttachmentSlot, StageCommand, StageState } from './types';

export interface RenderResult {
  ok: boolean;
  error?: string;
  mode?: StageCommand['mode'];
  title?: string;
}

export type BridgeAction =
  | { kind: 'ignore' }
  | { kind: 'render'; command: StageCommand; summary: string }
  | { kind: 'setPlaying'; playing: boolean }
  | { kind: 'replay' }
  | { kind: 'swapAttachment'; slot: AttachmentSlot; attachmentId: string }
  | { kind: 'error'; error: string };

export interface InitialEmbedConfig {
  command: StageCommand | null;
  transparent: boolean;
  initialPlaying: boolean;
}

const VALID_SLOTS = new Set<AttachmentSlot>([
  'optic',
  'muzzle',
  'barrel',
  'underbarrel',
  'magazine',
  'stock',
]);

const MAX_URL_DATA_LENGTH = 262_144;

function decodeBase64Utf8(input: string): string | null {
  try {
    const normalized = input.replace(/-/g, '+').replace(/_/g, '/').replace(/\s+/g, '');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');

    if (typeof atob === 'function') {
      const binary = atob(padded);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      return new TextDecoder('utf-8').decode(bytes);
    }

    // Node.js fallback for unit testing
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(padded, 'base64').toString('utf-8');
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Decodes either raw URI-encoded JSON or standard/URL-safe Base64 UTF-8 JSON from a `?data=` / `#data=` parameter.
 */
export function decodeUrlStageParam(rawParam: string): unknown | null {
  if (!rawParam || rawParam.length > MAX_URL_DATA_LENGTH) return null;
  const trimmed = rawParam.trim();
  if (!trimmed) return null;

  // 1) Try direct JSON parse (URLSearchParams already URI-decodes values)
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      return JSON.parse(trimmed);
    } catch {
      // Fall through to double-decoded / base64 attempts
    }
  }

  // 2) Try URI decode in case it came from raw hash or double-encoded query string
  try {
    const decodedUri = decodeURIComponent(trimmed);
    if (decodedUri.startsWith('{')) {
      return JSON.parse(decodedUri);
    }
  } catch {
    // Fall through to base64
  }

  // 3) Try Base64 / Base64URL UTF-8 JSON
  const decodedB64 = decodeBase64Utf8(trimmed);
  if (decodedB64 && decodedB64.trim().startsWith('{')) {
    try {
      return JSON.parse(decodedB64);
    } catch {
      return null;
    }
  }

  return null;
}

/**
 * Normalizes any valid JSON string, full StageCommand, flat host command ({ mode, title, subtitle, ...modeFields }),
 * or natural-language prompt envelope ({ prompt }) into a validated StageCommand.
 */
export function normalizeIncomingCommand(
  raw: unknown,
  currentState: StageState,
): { ok: true; command: StageCommand; summary: string } | { ok: false; error: string } {
  if (raw == null) {
    return { ok: false, error: 'Empty command payload.' };
  }

  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) return { ok: false, error: 'Command string cannot be empty.' };
    if (trimmed.startsWith('{')) {
      const parsed = parseJsonCommand(trimmed);
      if (parsed.ok) {
        return { ok: true, command: parsed.command, summary: `API -> ${parsed.command.title}` };
      }
      // If valid JSON object failed strict schema, attempt flat normalization below
      try {
        const obj = JSON.parse(trimmed);
        return normalizeIncomingCommand(obj, currentState);
      } catch {
        return { ok: false, error: parsed.error };
      }
    }
    const { command, summary } = interpretTextPrompt(trimmed, currentState);
    return { ok: true, command, summary };
  }

  if (typeof raw !== 'object' || Array.isArray(raw)) {
    return { ok: false, error: 'Command payload must be a JSON object or JSON string.' };
  }

  const obj = raw as Record<string, unknown>;

  // Unwrap `{ type: "RENDER_STAGE", payload: ... }` or `{ command: ... }` envelopes if passed directly
  if (obj.type === 'RENDER_STAGE' && (obj.payload !== undefined || obj.command !== undefined || obj.prompt !== undefined)) {
    return normalizeIncomingCommand(obj.payload ?? obj.command ?? obj.prompt, currentState);
  }
  if (obj.command && typeof obj.command === 'object') {
    return normalizeIncomingCommand(obj.command, currentState);
  }

  // Natural-language prompt object: `{ prompt: "Dota 2 Top Lane Gank" }`
  if (typeof obj.prompt === 'string' && obj.prompt.trim().length > 0 && !obj.payload) {
    const { command, summary } = interpretTextPrompt(obj.prompt, currentState);
    return { ok: true, command, summary };
  }

  // Preset ID shortcut: `{ preset: "mirage-a-execute" }`
  if (typeof obj.preset === 'string') {
    const found = STAGE_PRESETS.find((p) => p.id === obj.preset);
    if (found) {
      return { ok: true, command: structuredClone(found.command), summary: found.label };
    }
  }

  // Standard StageCommand: `{ mode, title, subtitle, payload }`
  const direct = validateCommand(obj);
  if (direct.ok) {
    return { ok: true, command: direct.command, summary: `API -> ${direct.command.title}` };
  }

  // Flat host payload support: `{ mode, title, subtitle, players, vectors, ... }` -> wrap remaining fields into `payload`
  if (typeof obj.mode === 'string' && typeof obj.title === 'string' && obj.payload === undefined) {
    const { mode, title, subtitle, ...rest } = obj;
    const flatCandidate = {
      mode,
      title,
      subtitle: typeof subtitle === 'string' ? subtitle : '',
      payload: rest,
    };
    const flatResult = validateCommand(flatCandidate);
    if (flatResult.ok) {
      return {
        ok: true,
        command: flatResult.command,
        summary: `API -> ${flatResult.command.title}`,
      };
    }
    return { ok: false, error: flatResult.error };
  }

  return { ok: false, error: direct.error };
}

/**
 * Parses an incoming `window.postMessage` payload cleanly, ignoring unrelated browser/host messages.
 */
export function parsePostMessageEvent(
  data: unknown,
  currentState: StageState,
): BridgeAction {
  let msg: unknown = data;
  if (typeof data === 'string') {
    const trimmed = data.trim();
    if (!trimmed.startsWith('{')) return { kind: 'ignore' };
    try {
      msg = JSON.parse(trimmed);
    } catch {
      return { kind: 'ignore' };
    }
  }

  if (!msg || typeof msg !== 'object' || Array.isArray(msg)) {
    return { kind: 'ignore' };
  }

  const record = msg as Record<string, unknown>;
  const type = typeof record.type === 'string' ? record.type : '';

  if (type === 'RENDER_STAGE') {
    const inner = record.payload ?? record.command ?? record.prompt;
    const normalized = normalizeIncomingCommand(inner, currentState);
    if (!normalized.ok) {
      return { kind: 'error', error: normalized.error };
    }
    return { kind: 'render', command: normalized.command, summary: normalized.summary };
  }

  if (type === 'SET_PLAYING' && typeof record.playing === 'boolean') {
    return { kind: 'setPlaying', playing: record.playing };
  }

  if (type === 'REPLAY_STAGE') {
    return { kind: 'replay' };
  }

  if (
    type === 'SWAP_WEAPON_ATTACHMENT' &&
    typeof record.slot === 'string' &&
    VALID_SLOTS.has(record.slot as AttachmentSlot) &&
    typeof record.attachmentId === 'string'
  ) {
    return {
      kind: 'swapAttachment',
      slot: record.slot as AttachmentSlot,
      attachmentId: record.attachmentId,
    };
  }

  return { kind: 'ignore' };
}

/**
 * Extracts initial stage payload, transparency preference, and playback state from URL query or hash parameters.
 */
export function resolveInitialEmbedConfig(
  search: string,
  hash: string,
  currentState: StageState,
): InitialEmbedConfig {
  const searchParams = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  const hashClean = hash.startsWith('#') ? hash.slice(1) : hash;
  const hashParams = hashClean.includes('=')
    ? new URLSearchParams(hashClean.startsWith('?') ? hashClean.slice(1) : hashClean)
    : new URLSearchParams();

  const getParam = (key: string): string | null => searchParams.get(key) ?? hashParams.get(key);

  const bg = (getParam('bg') ?? '').toLowerCase();
  const transparentFlag = (getParam('transparent') ?? '').toLowerCase();
  const transparent =
    bg === 'transparent' || transparentFlag === '1' || transparentFlag === 'true';

  const pausedFlag = (getParam('paused') ?? '').toLowerCase();
  const autoplayFlag = (getParam('autoplay') ?? '').toLowerCase();
  const initialPlaying = !(
    pausedFlag === '1' ||
    pausedFlag === 'true' ||
    autoplayFlag === '0' ||
    autoplayFlag === 'false'
  );

  // 1) `?data=...` or `#data=...` (URI-encoded or Base64 JSON)
  const rawData = getParam('data');
  if (rawData) {
    const decoded = decodeUrlStageParam(rawData);
    if (decoded) {
      const normalized = normalizeIncomingCommand(decoded, currentState);
      if (normalized.ok) {
        return { command: normalized.command, transparent, initialPlaying };
      }
    }
  }

  // 2) `?preset=...` shortcut
  const presetId = getParam('preset');
  if (presetId) {
    const found = STAGE_PRESETS.find((p) => p.id === presetId);
    if (found) {
      return { command: structuredClone(found.command), transparent, initialPlaying };
    }
  }

  // 3) `?prompt=...` shortcut
  const prompt = getParam('prompt');
  if (prompt && prompt.trim().length > 0) {
    const { command } = interpretTextPrompt(prompt, currentState);
    return { command, transparent, initialPlaying };
  }

  return { command: null, transparent, initialPlaying };
}

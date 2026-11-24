import assert from 'node:assert/strict';
import test from 'node:test';
import { createInitialStageState } from './commandEngine';
import {
  decodeUrlStageParam,
  normalizeIncomingCommand,
  parsePostMessageEvent,
  resolveInitialEmbedConfig,
} from './embedBridge';
import { getDefaultPresetForMode } from './presets';

test('parsePostMessageEvent ingests RENDER_STAGE with nested payload cleanly', () => {
  const state = createInitialStageState();
  const strategyCmd = getDefaultPresetForMode('strategy');

  const action = parsePostMessageEvent(
    { type: 'RENDER_STAGE', payload: strategyCmd },
    state,
  );
  assert.equal(action.kind, 'render');
  if (action.kind === 'render') {
    assert.equal(action.command.mode, 'strategy');
    assert.equal(action.command.title, strategyCmd.title);
  }
});

test('normalizeIncomingCommand supports flat host payloads without nested payload key', () => {
  const state = createInitialStageState();
  const mapCmd = getDefaultPresetForMode('map');
  const flat = {
    mode: mapCmd.mode,
    title: mapCmd.title,
    subtitle: mapCmd.subtitle,
    ...mapCmd.payload,
  };

  const result = normalizeIncomingCommand(flat, state);
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.command.mode, 'map');
    assert.equal(result.command.title, mapCmd.title);
  }
});

test('parsePostMessageEvent ignores unrelated browser/host messages and rejects malformed RENDER_STAGE', () => {
  const state = createInitialStageState();
  assert.deepEqual(parsePostMessageEvent({ source: 'react-devtools', hello: true }, state), {
    kind: 'ignore',
  });
  assert.deepEqual(parsePostMessageEvent('plain-host-string', state), { kind: 'ignore' });

  const bad = parsePostMessageEvent(
    { type: 'RENDER_STAGE', payload: { mode: 'unknown', title: 'Bad' } },
    state,
  );
  assert.equal(bad.kind, 'error');
});

test('decodeUrlStageParam & resolveInitialEmbedConfig decode Base64 UTF-8 and URI-encoded JSON', () => {
  const state = createInitialStageState();
  const weaponCmd = getDefaultPresetForMode('weapon');
  const json = JSON.stringify(weaponCmd);

  // Base64URL with UTF-8 characters (e.g. "Mbappé" or "×")
  const b64 = Buffer.from(json, 'utf-8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');

  const decodedB64 = decodeUrlStageParam(b64);
  assert.ok(decodedB64 && typeof decodedB64 === 'object');

  const cfgFromB64 = resolveInitialEmbedConfig(`?data=${b64}&bg=transparent`, '', state);
  assert.equal(cfgFromB64.transparent, true);
  assert.equal(cfgFromB64.initialPlaying, true);
  assert.equal(cfgFromB64.command?.mode, 'weapon');
  assert.equal(cfgFromB64.command?.title, weaponCmd.title);

  // URI-encoded JSON in hash + paused flag
  const cfgFromHash = resolveInitialEmbedConfig(
    '',
    `#data=${encodeURIComponent(json)}&paused=1`,
    state,
  );
  assert.equal(cfgFromHash.command?.mode, 'weapon');
  assert.equal(cfgFromHash.initialPlaying, false);

  // Empty URL gracefully falls back to null command (default state)
  const emptyCfg = resolveInitialEmbedConfig('', '', state);
  assert.equal(emptyCfg.command, null);
  assert.equal(emptyCfg.transparent, false);
  assert.equal(emptyCfg.initialPlaying, true);
});

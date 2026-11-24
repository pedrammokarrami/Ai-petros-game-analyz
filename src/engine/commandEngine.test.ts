import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyStageCommand,
  computeWeaponStatDeltas,
  createInitialStageState,
  cycleWeaponAttachmentSlot,
  interpretTextPrompt,
  parseJsonCommand,
  swapWeaponAttachment,
  validateCommand,
} from './commandEngine';
import { getDefaultPresetForMode, STAGE_PRESETS } from './presets';
import {
  buildDotaHeroCdnUrl,
  buildFandomWikiImageUrl,
  buildLolChampionCdnUrl,
  buildLolMapCdnUrl,
  buildTheSportsDbUrl,
  buildWikimediaCommonsSearchUrl,
} from './assetResolver';

test('all 15 built-in stage presets across 5 modes validate cleanly', () => {
  assert.equal(STAGE_PRESETS.length, 15);
  for (const preset of STAGE_PRESETS) {
    const result = validateCommand(preset.command);
    assert.equal(result.ok, true, `Preset ${preset.id} should be valid`);
  }
});

test('parseJsonCommand rejects empty, malformed, and schema-invalid inputs including strategy', () => {
  assert.equal(parseJsonCommand('').ok, false);
  assert.equal(parseJsonCommand('{ bad json').ok, false);
  assert.equal(parseJsonCommand(JSON.stringify({ mode: 'tennis', title: 'X', payload: {} })).ok, false);
  assert.equal(parseJsonCommand(JSON.stringify({ mode: 'strategy', title: 'Empty MOBA', payload: { units: [], actions: [] } })).ok, false);
});

test('interpretTextPrompt routes all user-requested real game prompts accurately', () => {
  const state = createInitialStageState();

  const madrid = interpretTextPrompt('Real Madrid 4-3-3', state);
  assert.equal(madrid.command.mode, 'football');
  assert.equal(madrid.command.title, 'Real Madrid 4-3-3');
  assert.ok(madrid.command.payload.players.some((p) => p.name === 'Kylian Mbappe'));

  const warzone = interpretTextPrompt('Warzone M4A1 Meta', state);
  assert.equal(warzone.command.mode, 'weapon');
  assert.equal(warzone.command.title, 'Warzone M4A1 Meta');

  const mirage = interpretTextPrompt('Mirage A-Site Smoke Execute', state);
  assert.equal(mirage.command.mode, 'map');
  assert.equal(mirage.command.title, 'Mirage A-Site Smoke Execute');

  const dota = interpretTextPrompt('Dota 2 Top Lane Gank', state);
  assert.equal(dota.command.mode, 'strategy');
  assert.equal(dota.command.title, 'Dota 2 Top Lane Gank');
  assert.equal(dota.command.payload.game, 'dota2');

  const lol = interpretTextPrompt('League Baron Setup', state);
  assert.equal(lol.command.mode, 'strategy');
  assert.equal(lol.command.payload.game, 'lol');
});

test('weapon attachment swap and slot cycling produce accurate stat deltas', () => {
  const initial = createInitialStageState();
  const baseWeapon = getDefaultPresetForMode('weapon');
  const s1 = applyStageCommand(initial, baseWeapon, 'preset');
  assert.equal(s1.activeCommand.mode, 'weapon');

  const swapped = swapWeaponAttachment(s1.activeCommand, 'optic', 'acog-4x');
  assert.equal(swapped.mode, 'weapon');
  assert.equal(swapped.payload.highlightedSlot, 'optic');
  assert.equal(swapped.payload.attachments.optic.id, 'acog-4x');

  const s2 = applyStageCommand(s1, swapped, 'prompt');
  assert.ok(s2.weaponStatDeltas);
  assert.equal(s2.weaponStatDeltas.accuracy, 5);
  assert.equal(s2.weaponStatDeltas.control, 3);
  assert.equal(s2.weaponStatDeltas.mobility, -4);

  const cycled = cycleWeaponAttachmentSlot(s2.activeCommand, 'muzzle');
  assert.equal(cycled.mode, 'weapon');
  assert.equal(cycled.payload.highlightedSlot, 'muzzle');
  assert.notEqual(cycled.payload.attachments.muzzle.id, 'suppressor-mono');
});

test('assetResolver builds valid zero-key public API URLs', () => {
  assert.ok(buildTheSportsDbUrl('Kylian Mbappe').includes('searchplayers.php?p=Kylian%20Mbappe'));
  assert.ok(buildWikimediaCommonsSearchUrl('M4A1 carbine').includes('origin=*'));
  assert.ok(buildFandomWikiImageUrl('counterstrike', 'Mirage').includes('counterstrike.fandom.com'));
  assert.ok(buildDotaHeroCdnUrl('earthshaker').endsWith('/heroes/earthshaker.png'));
  assert.ok(buildLolChampionCdnUrl('LeeSin').endsWith('/champion/LeeSin.png'));
  assert.ok(buildLolMapCdnUrl().endsWith('/map/map11.png'));
});

test('computeWeaponStatDeltas returns zeroed deltas without baseline', () => {
  const deltas = computeWeaponStatDeltas(null, {
    damage: 70,
    accuracy: 80,
    fireRate: 60,
    mobility: 55,
    control: 72,
  });
  assert.deepEqual(deltas, { damage: 0, accuracy: 0, fireRate: 0, mobility: 0, control: 0 });
});

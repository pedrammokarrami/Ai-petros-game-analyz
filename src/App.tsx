/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { TacticalCanvas } from './canvas/TacticalCanvas';
import { WeaponStatsOverlay } from './components/WeaponStatsOverlay';
import {
  applyStageCommand,
  createInitialStageState,
  cycleWeaponAttachmentSlot,
  swapWeaponAttachment,
} from './engine/commandEngine';
import {
  normalizeIncomingCommand,
  parsePostMessageEvent,
  resolveInitialEmbedConfig,
  type RenderResult,
} from './engine/embedBridge';
import type { AttachmentSlot, StageCommand, StageState } from './engine/types';

export interface TacticalStageProps {
  /** Live JSON command object or string pushed directly from a parent React host app (e.g. AIGAMERIA) */
  commandData?: StageCommand | string | Record<string, unknown> | null;
  /** Render with a transparent canvas backdrop so the stage blends seamlessly over any host container */
  transparent?: boolean;
  /** Optional external playback toggle (defaults to true) */
  isPlaying?: boolean;
  /** Optional callback invoked whenever a command updates the active stage */
  onCommandApplied?: (command: StageCommand) => void;
}

declare global {
  interface Window {
    /** Primary host-app API to push live JSON payloads directly into the stage */
    renderTacticalStage?: (jsonPayload: unknown) => RenderResult;
    /** Backwards-compatible alias */
    dispatchTacticalCommand?: (rawCommand: unknown) => RenderResult;
  }
}

export function TacticalStage({
  commandData,
  transparent: transparentProp,
  isPlaying: isPlayingProp,
  onCommandApplied,
}: TacticalStageProps = {}) {
  const initialConfigRef = useRef<ReturnType<typeof resolveInitialEmbedConfig> | null>(null);
  if (initialConfigRef.current === null) {
    const baseState = createInitialStageState();
    initialConfigRef.current =
      typeof window !== 'undefined'
        ? resolveInitialEmbedConfig(window.location.search, window.location.hash, baseState)
        : { command: null, transparent: false, initialPlaying: true };
  }

  const [stageState, setStageState] = useState<StageState>(() => {
    const base = createInitialStageState();
    const fromUrl = initialConfigRef.current?.command;
    if (fromUrl) {
      return applyStageCommand(base, fromUrl, 'api', `URL -> ${fromUrl.title}`);
    }
    if (commandData) {
      const normalized = normalizeIncomingCommand(commandData, base);
      if (normalized.ok) {
        return applyStageCommand(base, normalized.command, 'api', normalized.summary);
      }
    }
    return base;
  });

  const [internalPlaying, setInternalPlaying] = useState<boolean>(
    () => initialConfigRef.current?.initialPlaying ?? true,
  );
  const [replayNonce, setReplayNonce] = useState(0);

  const stageStateRef = useRef<StageState>(stageState);
  stageStateRef.current = stageState;

  const isPlaying = isPlayingProp ?? internalPlaying;
  const isTransparent = transparentProp ?? initialConfigRef.current?.transparent ?? false;

  // Apply transparent class to root document when embedded with `?bg=transparent` or `transparent={true}`
  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.classList.toggle('embed-transparent', isTransparent);
    return () => {
      document.documentElement.classList.remove('embed-transparent');
    };
  }, [isTransparent]);

  const applyIncomingPayload = useCallback(
    (rawPayload: unknown): RenderResult => {
      const normalized = normalizeIncomingCommand(rawPayload, stageStateRef.current);
      if (!normalized.ok) {
        return { ok: false, error: normalized.error };
      }
      setStageState((prev) =>
        applyStageCommand(prev, normalized.command, 'api', normalized.summary),
      );
      onCommandApplied?.(normalized.command);
      return {
        ok: true,
        mode: normalized.command.mode,
        title: normalized.command.title,
      };
    },
    [onCommandApplied],
  );

  // Sync direct React `commandData` prop updates from a parent app
  const lastPropRef = useRef<unknown>(commandData);
  useEffect(() => {
    if (commandData === undefined || commandData === null) return;
    if (commandData === lastPropRef.current) return;
    lastPropRef.current = commandData;
    applyIncomingPayload(commandData);
  }, [commandData, applyIncomingPayload]);

  // Interactive weapon pin click still cycles equipped attachments live on the stage
  const handleCycleWeaponSlot = useCallback((slot: AttachmentSlot) => {
    setStageState((prev) => {
      const nextCmd = cycleWeaponAttachmentSlot(prev.activeCommand, slot);
      const equippedName =
        nextCmd.mode === 'weapon' ? nextCmd.payload.attachments[slot]?.name ?? slot : slot;
      return applyStageCommand(prev, nextCmd, 'preset', `Equipped ${equippedName}`);
    });
  }, []);

  // Expose global `window.renderTacticalStage(jsonPayload)` + `window.postMessage` iframe bridge
  useEffect(() => {
    window.renderTacticalStage = applyIncomingPayload;
    window.dispatchTacticalCommand = applyIncomingPayload;

    const handleMessage = (event: MessageEvent) => {
      const action = parsePostMessageEvent(event.data, stageStateRef.current);
      if (action.kind === 'ignore') return;

      const reply = (payload: Record<string, unknown>) => {
        try {
          if (event.source && 'postMessage' in event.source) {
            (event.source as Window).postMessage(
              payload,
              event.origin && event.origin !== 'null' ? event.origin : '*',
            );
          }
        } catch {
          // Ignore cross-origin ack restrictions
        }
      };

      if (action.kind === 'error') {
        reply({ type: 'RENDER_STAGE_ACK', ok: false, error: action.error });
        return;
      }

      if (action.kind === 'render') {
        setStageState((prev) =>
          applyStageCommand(prev, action.command, 'api', action.summary),
        );
        onCommandApplied?.(action.command);
        reply({
          type: 'RENDER_STAGE_ACK',
          ok: true,
          mode: action.command.mode,
          title: action.command.title,
        });
      } else if (action.kind === 'setPlaying') {
        setInternalPlaying(action.playing);
      } else if (action.kind === 'replay') {
        setInternalPlaying(true);
        setReplayNonce((n) => n + 1);
      } else if (action.kind === 'swapAttachment') {
        setStageState((prev) => {
          const nextCmd = swapWeaponAttachment(
            prev.activeCommand,
            action.slot,
            action.attachmentId,
          );
          return applyStageCommand(prev, nextCmd, 'api', `Swapped ${action.slot}`);
        });
      }
    };

    window.addEventListener('message', handleMessage);

    // Notify host iframe parent that the tactical stage is mounted and ready for payloads
    try {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'TACTICAL_STAGE_READY' }, '*');
      }
    } catch {
      // Ignore cross-origin parent restrictions
    }

    return () => {
      window.removeEventListener('message', handleMessage);
      delete window.renderTacticalStage;
      delete window.dispatchTacticalCommand;
    };
  }, [applyIncomingPayload, onCommandApplied]);

  const activeCommand = stageState.activeCommand;

  return (
    <main
      aria-label="Unified tactical motion stage"
      className={`${
        isTransparent ? 'bg-transparent' : 'spatial-backdrop'
      } isolate relative h-full w-full overflow-hidden text-slate-100 select-none`}
    >
      {/* Floating Minimalist Stage Title & Subtitle Header */}
      <header className="pointer-events-none absolute top-3.5 left-4 right-4 z-20 flex items-start justify-between gap-4 sm:top-5 sm:left-6 sm:right-6">
        <div
          key={`${activeCommand.mode}-${activeCommand.title}`}
          className="animate-stage-enter max-w-2xl"
        >
          <h1 className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-white [text-wrap:balance] sm:text-2xl">
            {activeCommand.title}
          </h1>
          {activeCommand.subtitle && (
            <p className="mt-0.5 text-xs text-slate-300/90 sm:text-sm line-clamp-1">
              {activeCommand.subtitle}
            </p>
          )}
        </div>
      </header>

      {/* Full-Bleed 60fps HTML5 Motion Stage */}
      <TacticalCanvas
        command={activeCommand}
        isPlaying={isPlaying}
        replayNonce={replayNonce}
        onCycleWeaponSlot={handleCycleWeaponSlot}
      />

      {/* Mode-Specific Bottom Overlay (Weapon Loadout Stat Bars) */}
      {activeCommand.mode === 'weapon' && (
        <div className="pointer-events-none absolute inset-x-3 bottom-3 z-20 sm:inset-x-6 sm:bottom-4">
          <WeaponStatsOverlay
            stats={activeCommand.payload.stats}
            deltas={stageState.weaponStatDeltas}
            accent={activeCommand.payload.blueprintAccent}
          />
        </div>
      )}
    </main>
  );
}

export default TacticalStage;

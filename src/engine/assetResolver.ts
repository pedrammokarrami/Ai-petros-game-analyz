import type { StrategyGameId, WeaponChassisId } from './types';

export interface ResolvedAsset {
  url: string;
  source: string;
  image: HTMLImageElement | null;
  status: 'loading' | 'ready' | 'fallback';
  /** True if the image faces left and should be mirrored horizontally for uniform gunsmith orientation */
  flipX?: boolean;
}

/* ─── Verified Local Studio Fallback Assets (Zero-Broken-Image Guarantee) ─ */
export const STUDIO_WEAPON_ASSETS: Record<
  WeaponChassisId,
  { url: string; flipX: boolean }
> = {
  m4a1: {
    url: '/src/assets/images/weapon_m4a1_studio_1795548947017.jpg',
    flipX: false,
  },
  vx9: {
    url: '/src/assets/images/weapon_vector_studio_1795548949535.jpg',
    flipX: true,
  },
  m200: {
    url: '/src/assets/images/weapon_sniper_studio_1795548950555.jpg',
    flipX: true,
  },
};

export const STUDIO_MAP_ASSETS = {
  mirage: '/src/assets/images/map_mirage_tactical_1795548949780.jpg',
  moba: '/src/assets/images/map_moba_battlefield_1795548949075.jpg',
};

const RIOT_DDRAGON_VERSION = '14.24.1';
const URL_CACHE_STORAGE_KEY = 'tactical-stage-asset-urls-v1';

type Listener = () => void;

const listeners = new Set<Listener>();
const assetCache = new Map<string, ResolvedAsset>();
const inflightRequests = new Map<string, Promise<ResolvedAsset>>();
const imageElementCache = new Map<string, HTMLImageElement>();

let persistedUrlMap: Record<string, { url: string; source: string }> = {};

function loadPersistedUrls(): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = window.localStorage.getItem(URL_CACHE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        persistedUrlMap = parsed;
      }
    }
  } catch {
    // Ignore storage access errors in restricted iframes
  }
}

function persistUrl(key: string, url: string, source: string): void {
  persistedUrlMap[key] = { url, source };
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(URL_CACHE_STORAGE_KEY, JSON.stringify(persistedUrlMap));
  } catch {
    // Ignore storage quota errors
  }
}

loadPersistedUrls();

export function subscribeAssetUpdates(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function notifyAssetUpdate(): void {
  listeners.forEach((fn) => fn());
}

/**
 * Loads an HTMLImageElement cleanly for Canvas2D rendering without failing on hosts that omit CORS headers.
 */
function loadHtmlImage(url: string, timeoutMs = 4500): Promise<HTMLImageElement | null> {
  if (typeof window === 'undefined' || !url) return Promise.resolve(null);
  const existing = imageElementCache.get(url);
  if (existing && existing.complete && existing.naturalWidth > 0) {
    return Promise.resolve(existing);
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = 'async';
    img.referrerPolicy = 'no-referrer';
    let settled = false;

    const timer = window.setTimeout(() => {
      if (!settled) {
        settled = true;
        resolve(null);
      }
    }, timeoutMs);

    img.onload = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      if (img.naturalWidth > 0) {
        imageElementCache.set(url, img);
        resolve(img);
      } else {
        resolve(null);
      }
    };

    img.onerror = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      resolve(null);
    };

    img.src = url;
  });
}

async function fetchJsonWithTimeout<T>(url: string, timeoutMs = 3500): Promise<T | null> {
  if (typeof fetch === 'undefined') return null;
  const controller = new AbortController();
  const timer = globalThis.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  } finally {
    globalThis.clearTimeout(timer);
  }
}

/* ─── Free Zero-Key Public API Query Helpers ───────────────────────────── */

export function buildTheSportsDbUrl(playerName: string): string {
  return `https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?p=${encodeURIComponent(playerName)}`;
}

export function buildWikipediaPageImageUrl(title: string, thumbSize = 320): string {
  return `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&redirects=1&prop=pageimages&piprop=thumbnail&pithumbsize=${thumbSize}&titles=${encodeURIComponent(title)}`;
}

export function buildWikimediaCommonsSearchUrl(query: string, width = 1000): string {
  return `https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&generator=search&gsrnamespace=6&gsrlimit=4&prop=imageinfo&iiprop=url|size&iiurlwidth=${width}&gsrsearch=${encodeURIComponent(query)}`;
}

export function buildFandomWikiImageUrl(
  site: 'callofduty' | 'counterstrike' | 'valorant' | 'dota2',
  title: string,
  thumbSize = 1100,
): string {
  return `https://${site}.fandom.com/api.php?action=query&format=json&origin=*&redirects=1&prop=pageimages&piprop=thumbnail&pithumbsize=${thumbSize}&titles=${encodeURIComponent(title)}`;
}

export function buildDotaHeroCdnUrl(heroKey: string): string {
  return `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${encodeURIComponent(heroKey.toLowerCase())}.png`;
}

export function buildLolChampionCdnUrl(heroKey: string): string {
  return `https://ddragon.leagueoflegends.com/cdn/${RIOT_DDRAGON_VERSION}/img/champion/${encodeURIComponent(heroKey)}.png`;
}

export function buildLolMapCdnUrl(): string {
  return `https://ddragon.leagueoflegends.com/cdn/${RIOT_DDRAGON_VERSION}/img/map/map11.png`;
}

interface MediaWikiPageImageResp {
  query?: {
    pages?: Record<
      string,
      {
        thumbnail?: { source?: string; width?: number; height?: number };
        imageinfo?: Array<{ thumburl?: string; url?: string; width?: number; height?: number }>;
      }
    >;
  };
}

function extractMediaWikiUrl(
  data: MediaWikiPageImageResp | null,
  requireLandscape = false,
): string | null {
  const pages = data?.query?.pages;
  if (!pages) return null;
  for (const page of Object.values(pages)) {
    const thumb = page.thumbnail;
    if (thumb?.source) {
      if (requireLandscape && thumb.width && thumb.height && thumb.width / thumb.height < 1.18) {
        continue;
      }
      return thumb.source;
    }
    const info = page.imageinfo?.[0];
    const infoUrl = info?.thumburl || info?.url;
    if (infoUrl && /\.(png|jpe?g|webp)(\?|$)/i.test(infoUrl)) {
      if (requireLandscape && info?.width && info?.height && info.width / info.height < 1.18) {
        continue;
      }
      return infoUrl;
    }
  }
  return null;
}

/* ─── 1. Football Player Portrait Resolver (TheSportsDB + Wikipedia) ───── */

export function getFootballPlayerPortrait(playerName: string): ResolvedAsset | null {
  const clean = playerName.trim();
  if (!clean) return null;
  const key = `football:${clean.toLowerCase()}`;
  const cached = assetCache.get(key);
  if (cached) return cached;

  if (!inflightRequests.has(key)) {
    const pending: ResolvedAsset = {
      url: '',
      source: 'Resolving',
      image: null,
      status: 'loading',
    };
    assetCache.set(key, pending);

    const task = (async (): Promise<ResolvedAsset> => {
      // Check persisted URL cache first
      const saved = persistedUrlMap[key];
      if (saved) {
        const img = await loadHtmlImage(saved.url, 3200);
        if (img) {
          const ready: ResolvedAsset = { url: saved.url, source: saved.source, image: img, status: 'ready' };
          assetCache.set(key, ready);
          notifyAssetUpdate();
          return ready;
        }
      }

      // 1) Wikipedia MediaWiki API (full CORS via origin=*, automatic redirects)
      const wiki = await fetchJsonWithTimeout<MediaWikiPageImageResp>(
        buildWikipediaPageImageUrl(clean, 240),
      );
      let wikiUrl = extractMediaWikiUrl(wiki, false);

      // 2) Wikipedia generator=search fallback (handles single names like "Rodrygo" or partial queries)
      if (!wikiUrl) {
        const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&generator=search&gsrlimit=1&gsrsearch=${encodeURIComponent(`${clean} footballer`)}&prop=pageimages&piprop=thumbnail&pithumbsize=240`;
        const searchResp = await fetchJsonWithTimeout<MediaWikiPageImageResp>(searchUrl);
        wikiUrl = extractMediaWikiUrl(searchResp, false);
      }

      if (wikiUrl) {
        const img = await loadHtmlImage(wikiUrl);
        if (img) {
          persistUrl(key, wikiUrl, 'Wikimedia');
          const ready: ResolvedAsset = { url: wikiUrl, source: 'Wikimedia', image: img, status: 'ready' };
          assetCache.set(key, ready);
          notifyAssetUpdate();
          return ready;
        }
      }

      const fallback: ResolvedAsset = { url: '', source: 'Tactical Badge', image: null, status: 'fallback' };
      assetCache.set(key, fallback);
      return fallback;
    })();

    inflightRequests.set(key, task);
    task.finally(() => inflightRequests.delete(key));
  }

  return assetCache.get(key) ?? null;
}

/* ─── 2. Photorealistic Weapon Render Resolver (Studio + Wiki API) ─────── */

export function getWeaponRenderAsset(
  chassis: WeaponChassisId,
  wikiQuery?: string,
  wikiSite: 'callofduty' | 'counterstrike' | 'valorant' | 'wikimedia' = 'callofduty',
): ResolvedAsset {
  const key = `weapon:${chassis}:${wikiSite}:${(wikiQuery ?? '').toLowerCase()}`;
  const cached = assetCache.get(key);
  if (cached) return cached;

  const studio = STUDIO_WEAPON_ASSETS[chassis];
  const initial: ResolvedAsset = {
    url: studio.url,
    source: 'Gunsmith Studio',
    image: imageElementCache.get(studio.url) ?? null,
    status: imageElementCache.has(studio.url) ? 'ready' : 'loading',
    flipX: studio.flipX,
  };
  assetCache.set(key, initial);

  if (!inflightRequests.has(key)) {
    const task = (async (): Promise<ResolvedAsset> => {
      // Load local photorealistic studio render immediately so frame 1 is sharp and never blank
      const studioImg = await loadHtmlImage(studio.url, 4000);
      if (studioImg) {
        const studioReady: ResolvedAsset = {
          url: studio.url,
          source: 'Gunsmith Studio',
          image: studioImg,
          status: 'ready',
          flipX: studio.flipX,
        };
        assetCache.set(key, studioReady);
        notifyAssetUpdate();
      }

      // If custom non-default weapon wiki query is provided (e.g. from custom JSON/prompt), try MediaWiki / Wikimedia
      if (wikiQuery && wikiSite !== 'callofduty') {
        const apiUrl =
          wikiSite === 'wikimedia'
            ? buildWikimediaCommonsSearchUrl(wikiQuery, 1200)
            : buildFandomWikiImageUrl(wikiSite, wikiQuery, 1200);
        const resp = await fetchJsonWithTimeout<MediaWikiPageImageResp>(apiUrl);
        const liveUrl = extractMediaWikiUrl(resp, true);
        if (liveUrl) {
          const liveImg = await loadHtmlImage(liveUrl, 4000);
          if (liveImg && liveImg.naturalWidth / liveImg.naturalHeight >= 1.25) {
            const liveReady: ResolvedAsset = {
              url: liveUrl,
              source: wikiSite === 'wikimedia' ? 'Wikimedia Commons' : `${wikiSite} Wiki`,
              image: liveImg,
              status: 'ready',
              flipX: false,
            };
            assetCache.set(key, liveReady);
            notifyAssetUpdate();
            return liveReady;
          }
        }
      }

      return assetCache.get(key) ?? initial;
    })();

    inflightRequests.set(key, task);
    task.finally(() => inflightRequests.delete(key));
  }

  return assetCache.get(key) ?? initial;
}

/* ─── 3. Overhead Tactical Game Map Resolver (Wiki + Studio Fallback) ──── */

export function getTacticalMapAsset(
  mapId: 'mirage' | 'warzone' | 'harbor' = 'mirage',
  wikiQuery?: string,
  wikiSite: 'counterstrike' | 'callofduty' | 'valorant' | 'wikimedia' = 'counterstrike',
): ResolvedAsset {
  const key = `map:${mapId}:${wikiSite}:${(wikiQuery ?? '').toLowerCase()}`;
  const cached = assetCache.get(key);
  if (cached) return cached;

  const fallbackUrl = STUDIO_MAP_ASSETS.mirage;
  const initial: ResolvedAsset = {
    url: fallbackUrl,
    source: 'Tactical Overview',
    image: imageElementCache.get(fallbackUrl) ?? null,
    status: imageElementCache.has(fallbackUrl) ? 'ready' : 'loading',
  };
  assetCache.set(key, initial);

  if (!inflightRequests.has(key)) {
    const task = (async (): Promise<ResolvedAsset> => {
      const localImg = await loadHtmlImage(fallbackUrl, 4000);
      if (localImg) {
        assetCache.set(key, {
          url: fallbackUrl,
          source: 'Tactical Overview',
          image: localImg,
          status: 'ready',
        });
        notifyAssetUpdate();
      }

      if (wikiQuery) {
        const saved = persistedUrlMap[key];
        if (saved) {
          const img = await loadHtmlImage(saved.url, 3000);
          if (img) {
            const ready: ResolvedAsset = { url: saved.url, source: saved.source, image: img, status: 'ready' };
            assetCache.set(key, ready);
            notifyAssetUpdate();
            return ready;
          }
        }

        const apiUrl =
          wikiSite === 'wikimedia'
            ? buildWikimediaCommonsSearchUrl(wikiQuery, 1200)
            : buildFandomWikiImageUrl(wikiSite, wikiQuery, 1200);
        const resp = await fetchJsonWithTimeout<MediaWikiPageImageResp>(apiUrl);
        const liveUrl = extractMediaWikiUrl(resp, false);
        const looksOverhead = liveUrl ? /radar|overview|minimap|layout|topdown|tactical|map/i.test(liveUrl) : false;
        if (liveUrl && looksOverhead) {
          const liveImg = await loadHtmlImage(liveUrl, 4000);
          if (liveImg && liveImg.naturalWidth >= 400) {
            const srcName = wikiSite === 'wikimedia' ? 'Wikimedia Commons' : `${wikiSite} Wiki`;
            persistUrl(key, liveUrl, srcName);
            const liveReady: ResolvedAsset = {
              url: liveUrl,
              source: srcName,
              image: liveImg,
              status: 'ready',
            };
            assetCache.set(key, liveReady);
            notifyAssetUpdate();
            return liveReady;
          }
        }
      }

      return assetCache.get(key) ?? initial;
    })();

    inflightRequests.set(key, task);
    task.finally(() => inflightRequests.delete(key));
  }

  return assetCache.get(key) ?? initial;
}

/* ─── 4. Strategy / MOBA Map & Hero Portrait Resolvers ─────────────────── */

export function getStrategyMapAsset(game: StrategyGameId): ResolvedAsset {
  const key = `strategy-map:${game}`;
  const cached = assetCache.get(key);
  if (cached) return cached;

  const fallbackUrl = STUDIO_MAP_ASSETS.moba;
  const initial: ResolvedAsset = {
    url: fallbackUrl,
    source: 'MOBA Battlefield',
    image: imageElementCache.get(fallbackUrl) ?? null,
    status: imageElementCache.has(fallbackUrl) ? 'ready' : 'loading',
  };
  assetCache.set(key, initial);

  if (!inflightRequests.has(key)) {
    const task = (async (): Promise<ResolvedAsset> => {
      const localImg = await loadHtmlImage(fallbackUrl, 4000);
      if (localImg) {
        assetCache.set(key, {
          url: fallbackUrl,
          source: 'MOBA Battlefield',
          image: localImg,
          status: 'ready',
        });
        notifyAssetUpdate();
      }

      // League of Legends official Summoner's Rift minimap via Riot DataDragon CDN
      if (game === 'lol') {
        const lolMapUrl = buildLolMapCdnUrl();
        const img = await loadHtmlImage(lolMapUrl, 3800);
        if (img) {
          const ready: ResolvedAsset = {
            url: lolMapUrl,
            source: 'Riot DataDragon',
            image: img,
            status: 'ready',
          };
          assetCache.set(key, ready);
          notifyAssetUpdate();
          return ready;
        }
      }

      // Dota 2 live minimap attempt via Dota 2 Fandom MediaWiki API (origin=*)
      if (game === 'dota2') {
        const resp = await fetchJsonWithTimeout<MediaWikiPageImageResp>(
          buildFandomWikiImageUrl('dota2', 'Minimap', 1000),
        );
        const liveUrl = extractMediaWikiUrl(resp, false);
        if (liveUrl) {
          const img = await loadHtmlImage(liveUrl, 3800);
          if (img && img.naturalWidth >= 350) {
            const ready: ResolvedAsset = {
              url: liveUrl,
              source: 'Dota 2 Wiki',
              image: img,
              status: 'ready',
            };
            assetCache.set(key, ready);
            notifyAssetUpdate();
            return ready;
          }
        }
      }

      return assetCache.get(key) ?? initial;
    })();

    inflightRequests.set(key, task);
    task.finally(() => inflightRequests.delete(key));
  }

  return assetCache.get(key) ?? initial;
}

export function getStrategyHeroAsset(
  game: StrategyGameId,
  heroKey: string,
  displayName: string,
): ResolvedAsset | null {
  const cleanKey = heroKey.trim();
  if (!cleanKey) return null;
  const cacheKey = `hero:${game}:${cleanKey.toLowerCase()}`;
  const cached = assetCache.get(cacheKey);
  if (cached) return cached;

  if (!inflightRequests.has(cacheKey)) {
    const initial: ResolvedAsset = {
      url: '',
      source: 'Resolving',
      image: null,
      status: 'loading',
    };
    assetCache.set(cacheKey, initial);

    const task = (async (): Promise<ResolvedAsset> => {
      if (game === 'dota2') {
        const url = buildDotaHeroCdnUrl(cleanKey);
        const img = await loadHtmlImage(url, 3800);
        if (img) {
          const ready: ResolvedAsset = { url, source: 'Steam / OpenDota CDN', image: img, status: 'ready' };
          assetCache.set(cacheKey, ready);
          notifyAssetUpdate();
          return ready;
        }
      } else if (game === 'lol') {
        const url = buildLolChampionCdnUrl(cleanKey);
        const img = await loadHtmlImage(url, 3800);
        if (img) {
          const ready: ResolvedAsset = { url, source: 'Riot DataDragon', image: img, status: 'ready' };
          assetCache.set(cacheKey, ready);
          notifyAssetUpdate();
          return ready;
        }
      } else {
        // RTS / generic strategy unit: try Wikipedia MediaWiki thumbnail
        const resp = await fetchJsonWithTimeout<MediaWikiPageImageResp>(
          buildWikipediaPageImageUrl(displayName, 200),
        );
        const url = extractMediaWikiUrl(resp, false);
        if (url) {
          const img = await loadHtmlImage(url, 3200);
          if (img) {
            const ready: ResolvedAsset = { url, source: 'Wikimedia', image: img, status: 'ready' };
            assetCache.set(cacheKey, ready);
            notifyAssetUpdate();
            return ready;
          }
        }
      }

      const fallback: ResolvedAsset = { url: '', source: 'Tactical Emblem', image: null, status: 'fallback' };
      assetCache.set(cacheKey, fallback);
      return fallback;
    })();

    inflightRequests.set(cacheKey, task);
    task.finally(() => inflightRequests.delete(cacheKey));
  }

  return assetCache.get(cacheKey) ?? null;
}

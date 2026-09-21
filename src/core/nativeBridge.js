// Capacitor plugin resolution.
//
// IMPORTANT: `window.Capacitor.Plugins.X` is NOT auto-populated from the
// native bridge. Since Capacitor 3, `Plugins[name]` is written in exactly one
// place — inside `registerPlugin()` (verified in
// node_modules/@capacitor/core/dist/index.js). Probing `Capacitor.Plugins.X`
// without registering first therefore always yields `undefined`, and every
// native path silently falls back to its web shim.
//
// `isPluginAvailable()` reads the native PluginHeaders, so it stays a genuine
// runtime probe: on the web build it returns false and nothing is registered.

import { Capacitor, registerPlugin } from '@capacitor/core';

const cache = new Map();

export function isNativePlatform() {
  try {
    return Capacitor.isNativePlatform();
  } catch (err) {
    return false;
  }
}

/**
 * Resolve a native plugin, or null when it is not present on this platform.
 * @param {string} name plugin name as declared by @CapacitorPlugin(name = ...)
 */
export function getNativePlugin(name) {
  if (cache.has(name)) return cache.get(name);

  let resolved = null;
  try {
    if (isNativePlatform() && Capacitor.isPluginAvailable(name)) {
      resolved = registerPlugin(name);
    }
  } catch (err) {
    console.debug(`[nativeBridge] ${name} unavailable`, err);
    resolved = null;
  }

  cache.set(name, resolved);
  return resolved;
}

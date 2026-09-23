// Hash router.
//
// Hash routes put every screen change into WebView history, so Android's
// hardware back button leaves a session and returns to the list without any
// extra plugin. Every navigation is also an audio boundary: the router calls
// speechController.reset() before the next view mounts, so nothing started on
// one screen can keep talking or listening on the next.

import { speechController } from '../core/speechController.js';
import { actionBar } from '../ui/actionBar.js';
import { statusStrip } from '../ui/statusStrip.js';

/**
 * routes: [{ pattern: RegExp, view, tab }]
 * A view is { mount(root, params), unmount() }.
 */
export class Router {
  constructor({ root, routes, onRoute }) {
    this.root = root;
    this.routes = routes;
    this.onRoute = onRoute;
    this.current = null;
    this._handle = () => this._render();
  }

  start() {
    window.addEventListener('hashchange', this._handle);
    this._render();
  }

  go(path) {
    const target = `#${path}`;
    if (location.hash === target) this._render();
    else location.hash = target;
  }

  /** Re-mount the current route (e.g. after a language change). */
  refresh() { this._render(); }

  _match() {
    const path = (location.hash || '#/').slice(1) || '/';
    for (const route of this.routes) {
      const m = path.match(route.pattern);
      if (m) return { route, params: m.slice(1).map(decodeURIComponent) };
    }
    return { route: this.routes[0], params: [] };
  }

  _render() {
    const { route, params } = this._match();

    speechController.reset('navigate');
    statusStrip.hide();
    actionBar.setActions(null);

    const prev = this.current && this.current.route.view;
    if (prev && prev.unmount) {
      try { prev.unmount(); } catch (e) { console.error('[router] unmount failed', e); }
    }

    this.root.replaceChildren();
    this.root.scrollTop = 0;
    this.current = { route, params };

    try {
      route.view.mount(this.root, ...params);
    } catch (e) {
      console.error('[router] mount failed', e);
    }

    if (this.onRoute) this.onRoute(route);
  }
}

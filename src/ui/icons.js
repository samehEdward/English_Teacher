// Inline SVG icon set for the bottom action bar and chat controls.
//
// Inline, not an icon font and not <img>: a font is a blocking network
// request and a flash of invisible icons on a cold WebView start, and each
// <img> is a separate request. These are a few hundred bytes each, ship with
// the bundle, and inherit currentColor so the state machine can recolour them
// by changing one CSS custom property.

const S = (body, { stroke = true } = {}) =>
  `<svg viewBox="0 0 24 24" fill="${stroke ? 'none' : 'currentColor'}" ` +
  `stroke="${stroke ? 'currentColor' : 'none'}" stroke-width="2" ` +
  `stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;

export const ICONS = {
  mic: S('<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line>'),

  stop: S('<rect x="6" y="6" width="12" height="12" rx="2"></rect>', { stroke: false }),

  play: S('<polygon points="6 4 20 12 6 20 6 4"></polygon>', { stroke: false }),

  pause: S('<rect x="6" y="5" width="4" height="14" rx="1"></rect><rect x="14" y="5" width="4" height="14" rx="1"></rect>', { stroke: false }),

  replay: S('<polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>'),

  slow: S('<circle cx="12" cy="12" r="9"></circle><polyline points="12 7 12 12 15 14"></polyline>'),

  next: S('<polyline points="9 18 15 12 9 6"></polyline>'),

  prev: S('<polyline points="15 18 9 12 15 6"></polyline>'),

  check: S('<polyline points="20 6 9 17 4 12"></polyline>'),

  hint: S('<circle cx="12" cy="12" r="9"></circle><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line>'),

  book: S('<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>'),

  save: S('<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline>'),

  reset: S('<polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>'),

  keyboard: S('<rect x="2" y="6" width="20" height="12" rx="2"></rect><line x1="6" y1="10" x2="6" y2="10"></line><line x1="10" y1="10" x2="10" y2="10"></line><line x1="14" y1="10" x2="14" y2="10"></line><line x1="18" y1="10" x2="18" y2="10"></line><line x1="8" y1="14" x2="16" y2="14"></line>'),

  send: S('<line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>'),

  settings: S('<circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>'),

  warn: S('<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line>'),

  volume: S('<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>')
};

export function icon(name) {
  return ICONS[name] || '';
}

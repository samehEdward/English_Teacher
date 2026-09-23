// EchoSpeak - bootstrap.
//
// Wires the shell (top bar, tab bar, action bar, status strip, sheet) to the
// router and the views. This file never speaks and never opens the mic: every
// navigation goes through the router, which resets the speech controller.

import '@fontsource/barlow-condensed/latin-600.css';
import '@fontsource/barlow-condensed/latin-700.css';
import '@fontsource/atkinson-hyperlegible/latin-400.css';
import '@fontsource/atkinson-hyperlegible/latin-400-italic.css';
import '@fontsource/atkinson-hyperlegible/latin-700.css';
import '@fontsource/ibm-plex-mono/latin-500.css';
import './styles/tokens.css';
import './styles/base.css';
import './styles/shell.css';
import './styles/views.css';

import { speechController } from './core/speechController.js';
import { actionBar } from './ui/actionBar.js';
import { statusStrip } from './ui/statusStrip.js';
import { sheet } from './ui/sheet.js';
import { icon } from './ui/icons.js';
import { store } from './app/store.js';
import { t } from './app/strings.js';
import { Router } from './app/router.js';
import { createHomeView } from './views/home.js';
import { createSessionView } from './views/session.js';
import { createWordsView } from './views/words.js';
import { createQuizView } from './views/quiz.js';
import { openSettings } from './views/settings.js';

const TAB_ICONS = { practice: 'chat', words: 'book', quiz: 'quiz' };

function applyShellText() {
  const lang = store.settings.lang;
  const s = t(lang);
  document.documentElement.lang = lang;

  document.querySelectorAll('.lang-toggle button').forEach((b) => {
    b.setAttribute('aria-pressed', String(b.dataset.lang === lang));
  });
  document.getElementById('settingsBtn').setAttribute('aria-label', s.settings.title);

  document.querySelectorAll('.tabbar__tab').forEach((tab) => {
    tab.querySelector('.tabbar__label').textContent = s.tabs[tab.dataset.tab];
  });
}

function setLanguage(lang) {
  if (lang === store.settings.lang) return;
  store.setSetting('lang', lang);
  speechController.setLanguage(lang);
  actionBar.setLanguage(lang);
  statusStrip.setLanguage(lang);
  applyShellText();
  router.refresh();
}

function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  // The Capacitor shell serves from its own scheme; no service worker there.
  if (location.protocol !== 'http:' && location.protocol !== 'https:') return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch((err) => {
      console.warn('[app] service worker registration failed', err);
    });
  });
}

// == boot =====================================================================

const lang = store.settings.lang;
speechController.setLanguage(lang);
if (store.settings.voiceId) speechController.setVoiceById(store.settings.voiceId);
// Voices can arrive late on a cold start; re-apply the saved choice once.
const stopVoiceRestore = speechController.onVoicesChanged(() => {
  if (store.settings.voiceId && speechController.setVoiceById(store.settings.voiceId)) stopVoiceRestore();
});

actionBar.init({ lang });
statusStrip.init({ lang });
sheet.init();

document.getElementById('settingsBtn').innerHTML = icon('settings');
document.querySelectorAll('.tabbar__tab').forEach((tab) => {
  tab.querySelector('.tabbar__icon').innerHTML = icon(TAB_ICONS[tab.dataset.tab]);
});
document.querySelectorAll('.lang-toggle button').forEach((b) => {
  b.addEventListener('click', () => setLanguage(b.dataset.lang));
});
document.getElementById('settingsBtn').addEventListener('click', () => {
  speechController.reset('settings');
  openSettings({ onChange: () => router.refresh() });
});
applyShellText();

const go = (path) => router.go(path);

const router = new Router({
  root: document.getElementById('view'),
  routes: [
    { pattern: /^\/?$/, view: createHomeView({ go }), tab: 'practice' },
    { pattern: /^\/s\/(.+)$/, view: createSessionView({ go }), tab: null },
    { pattern: /^\/words$/, view: createWordsView(), tab: 'words' },
    { pattern: /^\/quiz$/, view: createQuizView(), tab: 'quiz' }
  ],
  onRoute: (route) => {
    // A session takes the whole screen: its own header, and the action bar
    // in place of the tab bar.
    document.body.dataset.mode = route.tab ? 'tabs' : 'session';
    document.querySelectorAll('.tabbar__tab').forEach((tab) => {
      if (tab.dataset.tab === route.tab) tab.setAttribute('aria-current', 'page');
      else tab.removeAttribute('aria-current');
    });
    sheet.close();
  }
});

router.start();
registerServiceWorker();

// Debug handle for chrome://inspect on the device.
window.echoSpeakApp = { router, store };

// Settings sheet. Changes apply immediately; there is no save step.

import { h } from '../app/dom.js';
import { t } from '../app/strings.js';
import { store } from '../app/store.js';
import { speechController } from '../core/speechController.js';
import { sheet } from '../ui/sheet.js';

const RATES = { slow: 0.8, normal: 0.95 };

function toggle(label, key, onChange) {
  const id = `set-${key}`;
  return h('label', { class: 'setting setting--toggle', for: id },
    h('span', null, label),
    h('input', {
      id, type: 'checkbox', class: 'switch', checked: store.settings[key],
      onChange: (e) => { store.setSetting(key, e.target.checked); if (onChange) onChange(); }
    })
  );
}

export function openSettings({ onChange }) {
  const lang = store.settings.lang;
  const s = t(lang).settings;

  const rateGroup = h('div', { class: 'segmented', role: 'radiogroup', 'aria-label': s.rate },
    Object.entries(RATES).map(([name, value]) => h('button', {
      type: 'button',
      role: 'radio',
      class: 'segmented__opt',
      'aria-checked': String(Math.abs(store.settings.rate - value) < 0.01),
      onClick: (e) => {
        store.setSetting('rate', value);
        [...rateGroup.children].forEach((b) => b.setAttribute('aria-checked', String(b === e.currentTarget)));
      }
    }, name === 'slow' ? s.rateSlow : s.rateNormal))
  );

  // Web engines list selectable voices; the native Android engine speaks
  // with the device's system voice, which is changed in Android settings.
  const voices = speechController.availableVoices();
  let voiceControl;
  if (voices.length) {
    voiceControl = h('select', {
      class: 'select', 'aria-label': s.voice,
      onChange: (e) => {
        if (speechController.setVoiceById(e.target.value)) store.setSetting('voiceId', e.target.value);
      }
    }, voices.map((v) => h('option', {
      value: v.id, selected: v.id === speechController.selectedVoiceId
    }, `${v.name.replace(/Microsoft |Google |Android /g, '')} (${v.lang})`)));
  } else {
    voiceControl = h('div', { class: 'setting__value' },
      h('span', null, s.voiceSystem),
      speechController.ttsBackend === 'native'
        ? h('button', { type: 'button', class: 'btn btn--quiet', onClick: () => speechController.installVoiceData() }, s.voiceInstall)
        : null
    );
  }

  sheet.open({
    title: s.title,
    closeLabel: s.close,
    onClose: onChange,
    body: [
      toggle(s.arabic, 'showArabic'),
      toggle(s.autoplay, 'autoPlayPartner'),
      h('div', { class: 'setting' }, h('span', null, s.rate), rateGroup),
      h('div', { class: 'setting setting--stack' }, h('span', null, s.voice), voiceControl),
      h('div', { class: 'setting setting--stack' },
        h('span', null, s.speechInput),
        h('span', { class: 'setting__value' }, speechController.sttSupported ? s.speechAvailable : s.speechUnavailable)
      ),
      h('button', { type: 'button', class: 'btn btn--primary btn--block', onClick: () => sheet.close() }, s.close)
    ]
  });
}

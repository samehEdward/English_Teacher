// Minimal DOM builder.
//
// Views build real nodes instead of concatenating HTML strings. The old
// modules interpolated scenario text straight into innerHTML templates, so
// any quote or angle bracket in the data could break markup, and every
// re-render threw away and re-bound all listeners. Text passed here is always
// set as text, never parsed as HTML.

/**
 * h('button', { class: 'btn', onClick: fn, 'aria-label': 'x' }, 'Label', child)
 *
 * props:
 *   class / className   string, or array (falsy entries dropped)
 *   on<Event>            listener, e.g. onClick, onInput, onKeydown
 *   dataset              object -> data-* attributes
 *   html                 trusted markup string (icons only)
 *   anything else        attribute; true => empty attribute, false/null => omitted
 */
export function h(tag, props, ...children) {
  const el = document.createElement(tag);

  if (props) {
    for (const [key, value] of Object.entries(props)) {
      if (value === null || value === undefined || value === false) continue;

      if (key === 'class' || key === 'className') {
        el.className = Array.isArray(value) ? value.filter(Boolean).join(' ') : value;
      } else if (key === 'dataset') {
        Object.assign(el.dataset, value);
      } else if (key === 'html') {
        el.innerHTML = value;
      } else if (key.startsWith('on') && typeof value === 'function') {
        el.addEventListener(key.slice(2).toLowerCase(), value);
      } else if (value === true) {
        el.setAttribute(key, '');
      } else {
        el.setAttribute(key, String(value));
      }
    }
  }

  append(el, children);
  return el;
}

function append(el, children) {
  for (const child of children) {
    if (child === null || child === undefined || child === false) continue;
    if (Array.isArray(child)) append(el, child);
    else if (child instanceof Node) el.appendChild(child);
    else el.appendChild(document.createTextNode(String(child)));
  }
}

/** Replace all children of `el`. */
export function mount(el, ...children) {
  el.replaceChildren();
  append(el, children);
  return el;
}

/** Hardening attributes every text field needs on Android keyboards. */
export const INPUT_HARDENING = {
  spellcheck: 'false',
  autocorrect: 'off',
  autocapitalize: 'none',
  autocomplete: 'off'
};

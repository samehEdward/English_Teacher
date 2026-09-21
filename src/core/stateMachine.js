// Deterministic finite state machine with generation tokens.
//
// The generation token is the whole point. Every transition bumps `generation`.
// Async work captures the generation it started under and checks it before
// touching anything:
//
//   const gen = fsm.generation;
//   recognition.onend = () => { if (fsm.isStale(gen)) return; ... };
//
// A callback from a session the user already cancelled cannot mutate current
// state. This removes the need for `isListening` / `pendingStopEval` style
// booleans, which is where the v1 races lived.

export class StateMachine {
  /**
   * @param {object}   opts
   * @param {string}   opts.initial     starting state
   * @param {object}   opts.transitions map of state -> array of legal next states
   * @param {string}   [opts.name]      label used in warnings
   */
  constructor({ initial, transitions, name = 'fsm' }) {
    if (!transitions[initial]) {
      throw new Error(`[${name}] initial state "${initial}" is not in the transition table`);
    }

    this.name = name;
    this.transitions = transitions;
    this.state = initial;
    this.previous = null;
    this.generation = 0;

    this._listeners = new Set();
    this._enterHooks = new Map();
    this._history = [];
  }

  /** True when `gen` predates the most recent transition. */
  isStale(gen) {
    return gen !== this.generation;
  }

  is(...states) {
    return states.includes(this.state);
  }

  canTransition(next) {
    const allowed = this.transitions[this.state];
    return Array.isArray(allowed) && allowed.includes(next);
  }

  /**
   * Attempt a transition.
   * @returns {number|null} the new generation, or null if the move is illegal.
   */
  transition(next, meta = {}) {
    if (!this.transitions[next]) {
      console.warn(`[${this.name}] unknown target state "${next}"`);
      return null;
    }

    // Re-entering the same state is a no-op, not an error. Modules call
    // reset() defensively and should not have to check first.
    if (next === this.state) return this.generation;

    if (!this.canTransition(next)) {
      console.warn(
        `[${this.name}] illegal transition ${this.state} -> ${next}` +
        (meta.reason ? ` (${meta.reason})` : '')
      );
      return null;
    }

    this.previous = this.state;
    this.state = next;
    this.generation += 1;

    this._history.push({ from: this.previous, to: next, gen: this.generation, at: Date.now() });
    if (this._history.length > 40) this._history.shift();

    const hook = this._enterHooks.get(next);
    if (hook) {
      try {
        hook({ from: this.previous, to: next, generation: this.generation, meta });
      } catch (err) {
        console.error(`[${this.name}] onEnter(${next}) threw`, err);
      }
    }

    this._emit({ from: this.previous, to: next, generation: this.generation, meta });
    return this.generation;
  }

  /**
   * Force a state regardless of the transition table. Reserved for teardown
   * paths (page unload, hard reset) where legality is irrelevant because every
   * in-flight callback is about to be invalidated anyway.
   */
  force(next, meta = {}) {
    this.previous = this.state;
    this.state = next;
    this.generation += 1;

    const hook = this._enterHooks.get(next);
    if (hook) {
      try {
        hook({ from: this.previous, to: next, generation: this.generation, meta, forced: true });
      } catch (err) {
        console.error(`[${this.name}] onEnter(${next}) threw`, err);
      }
    }

    this._emit({ from: this.previous, to: next, generation: this.generation, meta, forced: true });
    return this.generation;
  }

  /** Run `fn` when the machine enters `state`. One hook per state. */
  onEnter(state, fn) {
    this._enterHooks.set(state, fn);
    return this;
  }

  /** Subscribe to every transition. Returns an unsubscribe function. */
  subscribe(fn) {
    this._listeners.add(fn);
    return () => this._listeners.delete(fn);
  }

  /** Recent transitions, for debugging a bad sequence after the fact. */
  history() {
    return this._history.slice();
  }

  _emit(event) {
    this._listeners.forEach((fn) => {
      try {
        fn(event);
      } catch (err) {
        console.error(`[${this.name}] subscriber threw`, err);
      }
    });
  }
}

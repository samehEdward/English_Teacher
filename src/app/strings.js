// Interface copy. German is the default: the trainer's register is formal
// workplace German ("Sie"). One action keeps one name through a flow: the
// button that says "Senden" is the one that produces the feedback.

const STRINGS = {
  de: {
    tabs: { practice: 'Üben', words: 'Wörter', quiz: 'Quiz' },
    domains: { it_support: 'IT-Support', lab_medical: 'Labor' },

    home: {
      title: 'Welche Situation üben Sie heute?',
      done: 'Erledigt',
      steps: (n) => `${n} ${n === 1 ? 'Schritt' : 'Schritte'}`,
      progress: (d, t) => `${d} von ${t} erledigt`
    },

    stamp: { it_support: 'Gelöst', lab_medical: 'Freigegeben' },

    session: {
      back: 'Zur Übersicht',
      step: (i, n) => `Schritt ${i} von ${n}`,
      situation: 'Situation',
      you: 'Sie',
      placeholder: 'Antwort sprechen oder hier tippen …',
      listening: 'Ich höre zu …',
      noSpeech: 'Nichts verstanden. Tippen Sie auf das Mikrofon und sprechen Sie noch einmal.',
      emptyAnswer: 'Sprechen oder tippen Sie zuerst eine Antwort.',
      hintTitle: 'So könnten Sie antworten',
      hintNote: 'Wählen Sie eine Formulierung. Nicht jede ist professionell.',
      summaryTitle: 'Gespräch abgeschlossen',
      summaryBody: 'So haben Ihre Antworten abgeschnitten:',
      again: 'Nochmal üben'
    },

    bar: {
      listen: 'Anhören',
      hint: 'Tipp',
      type: 'Tippen',
      send: 'Senden',
      model: 'Muster',
      retry: 'Nochmal',
      next: 'Weiter',
      finish: 'Fertig'
    },

    verdict: {
      strong: { label: 'Professionell', note: 'Genau so klingt es im Dienst.' },
      ok: { label: 'Auf gutem Weg', note: 'Der Inhalt stimmt. Die Musterantwort ist präziser.' },
      risky: { label: 'Vorsicht', note: 'Ihre Antwort ähnelt einer Formulierung, die im Dienst schlecht ankommt.' },
      own: { label: 'Eigene Formulierung', note: 'Das lässt sich nicht automatisch bewerten. Vergleichen Sie mit der Musterantwort.' }
    },

    coaching: {
      model: 'Professionell formuliert',
      avoid: 'Vermeiden',
      term: 'Fachbegriff',
      nextAction: 'Nächster Schritt im Dienst',
      arabic: 'Erklärung auf Arabisch'
    },

    words: {
      title: 'Fachwortschatz',
      search: 'Begriff suchen',
      empty: (q) => `Kein Begriff enthält „${q}“.`,
      count: (n) => `${n} ${n === 1 ? 'Begriff' : 'Begriffe'}`,
      listen: 'Anhören',
      from: 'Aus'
    },

    quiz: {
      title: 'Welche Antwort ist professionell?',
      of: (i, n) => `Frage ${i} von ${n}`,
      says: (who) => `${who} sagt:`,
      correct: 'Richtig',
      wrong: 'Nicht ganz',
      better: 'Besser',
      next: 'Nächste Frage',
      restart: 'Neue Runde',
      done: (c, n) => `${c} von ${n} richtig`,
      stats: (c, a) => (a ? `Bisher ${c} von ${a} richtig` : 'Noch keine Frage beantwortet')
    },

    settings: {
      title: 'Einstellungen',
      arabic: 'Arabische Erklärungen zeigen',
      autoplay: 'Antwort des Gegenübers automatisch vorlesen',
      rate: 'Sprechtempo',
      rateSlow: 'Langsam',
      rateNormal: 'Normal',
      voice: 'Stimme',
      voiceSystem: 'Systemstimme des Geräts',
      voiceInstall: 'Deutsche Stimme installieren',
      speechInput: 'Spracheingabe',
      speechUnavailable: 'Auf diesem Gerät nicht verfügbar – Antworten können getippt werden.',
      speechAvailable: 'Bereit',
      close: 'Fertig'
    }
  },

  en: {
    tabs: { practice: 'Practice', words: 'Words', quiz: 'Quiz' },
    domains: { it_support: 'IT support', lab_medical: 'Laboratory' },

    home: {
      title: 'Which situation do you want to practise?',
      done: 'Done',
      steps: (n) => `${n} ${n === 1 ? 'step' : 'steps'}`,
      progress: (d, t) => `${d} of ${t} done`
    },

    stamp: { it_support: 'Resolved', lab_medical: 'Released' },

    session: {
      back: 'Back to overview',
      step: (i, n) => `Step ${i} of ${n}`,
      situation: 'Situation',
      you: 'You',
      placeholder: 'Speak your reply or type it here …',
      listening: 'Listening …',
      noSpeech: 'Nothing was caught. Tap the microphone and speak again.',
      emptyAnswer: 'Speak or type a reply first.',
      hintTitle: 'Ways you could reply',
      hintNote: 'Pick a phrasing. Not all of them are professional.',
      summaryTitle: 'Conversation complete',
      summaryBody: 'How your replies landed:',
      again: 'Practise again'
    },

    bar: {
      listen: 'Listen',
      hint: 'Hint',
      type: 'Type',
      send: 'Send',
      model: 'Model',
      retry: 'Retry',
      next: 'Next',
      finish: 'Finish'
    },

    verdict: {
      strong: { label: 'Professional', note: 'That is exactly how it sounds on the job.' },
      ok: { label: 'On the right track', note: 'The content is right. The model reply is more precise.' },
      risky: { label: 'Careful', note: 'Your reply resembles a phrasing that lands badly at work.' },
      own: { label: 'Your own wording', note: 'This cannot be judged automatically. Compare it with the model reply.' }
    },

    coaching: {
      model: 'Professional phrasing',
      avoid: 'Avoid',
      term: 'Key term',
      nextAction: 'Next step on the job',
      arabic: 'Explanation in Arabic'
    },

    words: {
      title: 'Workplace vocabulary',
      search: 'Search terms',
      empty: (q) => `No term contains “${q}”.`,
      count: (n) => `${n} ${n === 1 ? 'term' : 'terms'}`,
      listen: 'Listen',
      from: 'From'
    },

    quiz: {
      title: 'Which reply is professional?',
      of: (i, n) => `Question ${i} of ${n}`,
      says: (who) => `${who} says:`,
      correct: 'Correct',
      wrong: 'Not quite',
      better: 'Better',
      next: 'Next question',
      restart: 'New round',
      done: (c, n) => `${c} of ${n} correct`,
      stats: (c, a) => (a ? `So far ${c} of ${a} correct` : 'No questions answered yet')
    },

    settings: {
      title: 'Settings',
      arabic: 'Show Arabic explanations',
      autoplay: 'Read the other person’s reply aloud automatically',
      rate: 'Speaking speed',
      rateSlow: 'Slow',
      rateNormal: 'Normal',
      voice: 'Voice',
      voiceSystem: 'Device system voice',
      voiceInstall: 'Install voice data',
      speechInput: 'Speech input',
      speechUnavailable: 'Not available on this device – you can type your replies.',
      speechAvailable: 'Ready',
      close: 'Done'
    }
  }
};

export function t(lang) {
  return STRINGS[lang] || STRINGS.de;
}

// Comprehensive local lesson data for EchoSpeak English Studio

export const READING_LESSONS = [
  {
    id: 'read_a1_coffee',
    level: 'A1 - Beginner',
    title: 'The Morning Coffee Ritual',
    category: 'Daily Routine',
    text: 'Every morning, Sarah wakes up at seven o\'clock. She walks to the kitchen and opens the window to feel the fresh air. Then, she brews a warm cup of coffee with a splash of milk. She enjoys sitting quietly on the balcony before starting her busy day.',
    vocabulary: [
      { word: 'morning', ipa: '/ˈmɔːrnɪŋ/', def: 'The early part of the day from sunrise to noon.' },
      { word: 'brews', ipa: '/bruːz/', def: 'Prepares a hot beverage like tea or coffee by soaking in boiling water.' },
      { word: 'quietly', ipa: '/ˈkwaɪətli/', def: 'In a calm, silent, or peaceful manner.' },
      { word: 'balcony', ipa: '/ˈbælkəni/', def: 'A platform enclosed by a wall or balustrade on the outside of a building.' }
    ]
  },
  {
    id: 'read_b1_storytelling',
    level: 'B1 - Intermediate',
    title: 'The Power of Storytelling',
    category: 'Communication',
    text: 'Humans have shared stories around campfires for thousands of years. A captivating story connects people emotionally and breaks down cultural barriers. When you tell a story with passion and vivid details, your listeners remember the message far longer than dry facts alone.',
    vocabulary: [
      { word: 'captivating', ipa: '/ˈkæptɪveɪtɪŋ/', def: 'Capable of attracting and holding interest; charming.' },
      { word: 'barriers', ipa: '/ˈbæriərz/', def: 'Obstacles or boundaries that prevent movement or access.' },
      { word: 'passion', ipa: '/ˈpæʃən/', def: 'A strong and barely controllable emotion or intense enthusiasm.' },
      { word: 'vivid', ipa: '/ˈvɪvɪd/', def: 'Producing powerful feelings or strong, clear images in the mind.' }
    ]
  },
  {
    id: 'read_b2_remote_work',
    level: 'B2 - Upper Intermediate',
    title: 'Navigating Remote Collaboration',
    category: 'Professional & Tech',
    text: 'Remote work has fundamentally reshaped modern workplace dynamics. Clear asynchronous communication requires thoughtful clarity and empathy. When team members articulate their ideas clearly in concise messages, misunderstandings decrease, and productivity flourishes across different time zones.',
    vocabulary: [
      { word: 'fundamentally', ipa: '/ˌfʌndəˈmentəli/', def: 'In central or primary respects; essentially.' },
      { word: 'asynchronous', ipa: '/eɪˈsɪŋkrənəs/', def: 'Not occurring at the same time or coordinated in real-time.' },
      { word: 'articulate', ipa: '/ɑːrˈtɪkjuleɪt/', def: 'Express an idea or feeling fluently and coherently.' },
      { word: 'flourishes', ipa: '/ˈflɜːrɪʃɪz/', def: 'Grows or develops in a healthy or vigorous way.' }
    ]
  },
  {
    id: 'read_c1_ai_future',
    level: 'C1 - Advanced',
    title: 'The Frontier of Artificial Intelligence',
    category: 'Science & Innovation',
    text: 'As machine learning algorithms become increasingly sophisticated, human ingenuity must steer their ethical integration. True intelligence encompasses nuanced contextual comprehension, emotional resonance, and philosophical inquiry—qualities that transcend mere predictive computation.',
    vocabulary: [
      { word: 'sophisticated', ipa: '/səˈfɪstɪkeɪtɪd/', def: 'Highly developed, complex, and refined.' },
      { word: 'ingenuity', ipa: '/ˌɪndʒəˈnuːəti/', def: 'The quality of being clever, original, and inventive.' },
      { word: 'encompasses', ipa: '/ɪnˈkʌmpəsɪz/', def: 'Surrounds or includes something comprehensively.' },
      { word: 'transcend', ipa: '/trænˈsend/', def: 'Be or go beyond the range or limits of something.' }
    ]
  },
  {
    id: 'read_business_pitch',
    level: 'B2 - Business English',
    title: 'Pitching a Sustainable Enterprise',
    category: 'Business English',
    text: 'Distinguished investors, our primary objective is delivering circular packaging solutions without compromising product integrity. By sourcing biodegradable seaweed polymers, we eliminate single-use plastics while achieving a remarkable thirty percent reduction in logistical overhead.',
    vocabulary: [
      { word: 'distinguished', ipa: '/dɪˈstɪŋɡwɪʃt/', def: 'Successful, authoritative, and commanding great respect.' },
      { word: 'objective', ipa: '/əbˈdʒektɪv/', def: 'A goal or purpose toward which an effort is directed.' },
      { word: 'biodegradable', ipa: '/ˌbaɪəʊdɪˈɡreɪdəbəl/', def: 'Capable of being decomposed by bacteria or living organisms.' },
      { word: 'logistical', ipa: '/ləˈdʒɪstɪkəl/', def: 'Relating to or involving complex organization and transport.' }
    ]
  }
];

export const SHADOWING_LESSONS = [
  {
    id: 'shadow_daily_flow',
    title: 'Natural Conversational Cadence',
    difficulty: 'Intermediate',
    description: 'Master contractions, rhythm, and natural English sentence stress.',
    sentences: [
      {
        text: 'I was wondering if you might have a couple of minutes to discuss the new project timeline.',
        phoneticTip: 'Notice how "was wondering if you" blends into one smooth rhythmic stream.'
      },
      {
        text: 'To be completely honest with you, I haven\'t had the opportunity to review the latest draft yet.',
        phoneticTip: 'Drop the heavy "t" in "honest with" and link "had the opportunity" naturally.'
      },
      {
        text: 'Let\'s catch up tomorrow morning over a cup of coffee and figure out our next steps.',
        phoneticTip: 'Stress "catch up", "coffee", and "next steps".'
      },
      {
        text: 'That sounds like a great plan, and I\'ll make sure to send over my initial thoughts tonight.',
        phoneticTip: 'Link "make sure to" smoothly with upward pitch on "plan".'
      }
    ]
  },
  {
    id: 'shadow_confidence_meeting',
    title: 'Executive Presence & Pitching',
    difficulty: 'Advanced',
    description: 'Practice speaking with authority, measured pauses, and steady vocal tone.',
    sentences: [
      {
        text: 'Thank you all for being here today; let\'s dive straight into the key quarterly metrics.',
        phoneticTip: 'Use a short deliberate pause after "today" to command the room.'
      },
      {
        text: 'Our proactive approach allowed us to surpass expectations despite significant market headwinds.',
        phoneticTip: 'Emphasize "proactive", "surpass", and "headwinds" with crisp consonant finishes.'
      },
      {
        text: 'Moving forward, our strategic priority will remain continuous innovation and customer delight.',
        phoneticTip: 'Rise slightly on "innovation" and descend with confidence on "delight".'
      }
    ]
  },
  {
    id: 'shadow_casual_chitchat',
    title: 'Casual Chit-Chat & Linking Words',
    difficulty: 'Beginner - Intermediate',
    description: 'Learn connected speech and reductions (gonna, wanna, kind of).',
    sentences: [
      {
        text: 'What are you planning on doing this upcoming weekend?',
        phoneticTip: '"What are you" often reduces to "Whatcha" or a fast /wətər jʊ/.'
      },
      {
        text: 'I\'m thinking of checking out that new art exhibition downtown with a few close friends.',
        phoneticTip: 'Link "checking out that" into seamless connected speech.'
      },
      {
        text: 'Oh really? I\'ve heard nothing but fantastic reviews about that whole gallery!',
        phoneticTip: 'Express friendly curiosity with higher melodic pitch on "really".'
      }
    ]
  }
];

export const DICTATION_LESSONS = [
  {
    id: 'dict_1',
    level: 'Easy',
    sentence: 'Consistency is the secret to mastering any foreign language.',
    hint: 'A fundamental truth about learning skills through daily habit.'
  },
  {
    id: 'dict_2',
    level: 'Easy',
    sentence: 'Could you please speak a little slower so I can follow along?',
    hint: 'A polite request used frequently in real conversations.'
  },
  {
    id: 'dict_3',
    level: 'Medium',
    sentence: 'The weather forecast predicts heavy thunderstorms throughout the entire afternoon.',
    hint: 'Notice the spelling of "forecast" and "thunderstorms".'
  },
  {
    id: 'dict_4',
    level: 'Medium',
    sentence: 'Effective leadership requires exceptional empathy and decisive problem-solving skills.',
    hint: 'Pay attention to adjectives describing leadership qualities.'
  },
  {
    id: 'dict_5',
    level: 'Hard',
    sentence: 'Although the initial experiment yielded unexpected anomalies, the researchers remained undeterred.',
    hint: 'Listen closely for "yielded", "anomalies", and "undeterred".'
  },
  {
    id: 'dict_6',
    level: 'Hard',
    sentence: 'Sustainable architectural designs harmonize environmental responsibility with breathtaking aesthetic elegance.',
    hint: 'Rich vocabulary describing green building design.'
  }
];

export const ROLEPLAY_SCENARIOS = [
  {
    id: 'scenario_interview',
    title: 'The Job Interview: Strengths & Growth',
    icon: '💼',
    context: 'You are interviewing for a role at an international company. Answer clearly, maintain a friendly professional tone, and articulate your experience.',
    steps: [
      {
        speaker: 'Interviewer (Alex)',
        avatar: '👔',
        aiSpeech: 'Welcome! It is a pleasure to meet you. To kick off our conversation, could you briefly introduce yourself and what inspired you to apply for this position?',
        suggestedResponses: [
          'Thank you for having me. I have spent the last few years developing software, and I was drawn to your company\'s commitment to user experience and innovation.',
          'It is wonderful to meet you. Throughout my career, I have focused on building impactful products and fostering cross-functional collaboration.'
        ],
        targetKeywords: ['thank you', 'experience', 'company', 'position', 'collaboration', 'skills', 'innovative']
      },
      {
        speaker: 'Interviewer (Alex)',
        avatar: '👔',
        aiSpeech: 'That sounds impressive. Can you share an example of a difficult challenge you encountered at work and how you managed to resolve it?',
        suggestedResponses: [
          'Once, our team faced an aggressive deadline with shifting requirements. I organized a prioritization workshop to align stakeholders, and we delivered on schedule.',
          'When an unexpected system bottleneck occurred, I conducted a root cause analysis, communicated transparently with clients, and deployed a permanent fix.'
        ],
        targetKeywords: ['challenge', 'deadline', 'team', 'communicated', 'resolved', 'solution', 'priority']
      },
      {
        speaker: 'Interviewer (Alex)',
        avatar: '👔',
        aiSpeech: 'Fantastic problem-solving mindset! Before we wrap up, do you have any questions for me regarding our team culture or future roadmap?',
        suggestedResponses: [
          'Yes, absolutely! Could you describe what a typical day looks like for someone in this role, and how success is measured?',
          'I would love to learn more about how your team approaches mentorship and professional development opportunities.'
        ],
        targetKeywords: ['yes', 'team', 'culture', 'question', 'success', 'growth', 'mentorship']
      }
    ]
  },
  {
    id: 'scenario_cafe',
    title: 'Ordering at a Specialty Coffee Shop',
    icon: '☕',
    context: 'Order your favorite drink and a snack at a trendy specialty café in London.',
    steps: [
      {
        speaker: 'Barista (Leo)',
        avatar: '☕',
        aiSpeech: 'Good morning! Welcome to Roasters & Beans. What can I get started for you today?',
        suggestedResponses: [
          'Good morning! I would like a medium oat milk cappuccino and an almond croissant, please.',
          'Hi there! Could I get an iced Americano with a splash of vanilla syrup, please?'
        ],
        targetKeywords: ['morning', 'like', 'cappuccino', 'coffee', 'please', 'croissant', 'latte', 'americano']
      },
      {
        speaker: 'Barista (Leo)',
        avatar: '☕',
        aiSpeech: 'Excellent choice! Would you like that drink hot or iced, and will that be for here or to go?',
        suggestedResponses: [
          'I will have it hot, and to go please because I am heading to the office.',
          'For here please, I would like to sit down and read my book.'
        ],
        targetKeywords: ['hot', 'iced', 'here', 'to go', 'please', 'office', 'table']
      },
      {
        speaker: 'Barista (Leo)',
        avatar: '☕',
        aiSpeech: 'All set! That comes to six pounds fifty. Are you paying with card or contactless phone?',
        suggestedResponses: [
          'I will tap with my contactless phone, thank you so much!',
          'Paying by card, please. Could you also provide a receipt?'
        ],
        targetKeywords: ['card', 'contactless', 'phone', 'pay', 'receipt', 'thank you']
      }
    ]
  },
  {
    id: 'scenario_travel',
    title: 'Airport Transit & Hotel Check-in',
    icon: '✈️',
    context: 'Handle arrival at your international travel destination with confidence and clarity.',
    steps: [
      {
        speaker: 'Hotel Receptionist (Elena)',
        avatar: '🏨',
        aiSpeech: 'Welcome to the Grand Horizon Hotel. How may I assist you with your reservation today?',
        suggestedResponses: [
          'Hello, I have a reservation under the name of Smith for three nights.',
          'Good afternoon, I am checking in. Here is my booking confirmation number and passport.'
        ],
        targetKeywords: ['hello', 'reservation', 'checking in', 'booking', 'nights', 'name', 'passport']
      },
      {
        speaker: 'Hotel Receptionist (Elena)',
        avatar: '🏨',
        aiSpeech: 'Thank you! I found your booking right here. Would you prefer a quiet room on a high floor overlooking the city garden?',
        suggestedResponses: [
          'A quiet room on a higher floor would be absolutely wonderful, thank you!',
          'Yes please, I really appreciate a quiet environment to get some rest after my flight.'
        ],
        targetKeywords: ['quiet', 'room', 'high floor', 'wonderful', 'thank you', 'appreciate']
      }
    ]
  }
];

export const PHONETICS_DRILLS = {
  minimalPairs: [
    {
      contrast: '/θ/ (th) vs /s/ (s)',
      tip: 'Place the tip of your tongue gently between your front teeth for /θ/, whereas /s/ keeps the tongue behind teeth.',
      pairs: [
        { wordA: 'think', wordB: 'sink', exampleA: 'I think carefully.', exampleB: 'Wash in the sink.' },
        { wordA: 'thought', wordB: 'sought', exampleA: 'A fleeting thought.', exampleB: 'They sought shelter.' },
        { wordA: 'thick', wordB: 'sick', exampleA: 'A thick wool sweater.', exampleB: 'Feeling a bit sick.' },
        { wordA: 'mouth', wordB: 'mouse', exampleA: 'Open your mouth.', exampleB: 'A quiet little mouse.' }
      ]
    },
    {
      contrast: '/r/ (r) vs /l/ (l)',
      tip: 'For /l/, press your tongue tip firmly against the gum ridge behind upper teeth. For /r/, curl the tongue back without touching the roof.',
      pairs: [
        { wordA: 'light', wordB: 'right', exampleA: 'Turn on the light.', exampleB: 'You are absolutely right.' },
        { wordA: 'lead', wordB: 'read', exampleA: 'Lead the team forward.', exampleB: 'I love to read books.' },
        { wordA: 'collect', wordB: 'correct', exampleA: 'Collect the coins.', exampleB: 'That is the correct answer.' },
        { wordA: 'glow', wordB: 'grow', exampleA: 'A warm evening glow.', exampleB: 'Plants grow toward sunshine.' }
      ]
    },
    {
      contrast: '/v/ (v) vs /w/ (w)',
      tip: 'For /v/, gently rest your upper teeth on your bottom lip and vibrate. For /w/, round your lips in an "O" shape without touching teeth.',
      pairs: [
        { wordA: 'vest', wordB: 'west', exampleA: 'Wear a warm vest.', exampleB: 'Traveling toward the west.' },
        { wordA: 'vine', wordB: 'wine', exampleA: 'A climbing green vine.', exampleB: 'A glass of red wine.' },
        { wordA: 'vet', wordB: 'wet', exampleA: 'Take the dog to the vet.', exampleB: 'The grass is wet with dew.' },
        { wordA: 'vow', wordB: 'wow', exampleA: 'Make a solemn vow.', exampleB: 'Wow, that looks stunning!' }
      ]
    },
    {
      contrast: '/iː/ (long ee) vs /ɪ/ (short i)',
      tip: 'Smile wide with high muscle tension for /iː/ (sheep). Relax your jaw and tongue muscles for /ɪ/ (ship).',
      pairs: [
        { wordA: 'sheep', wordB: 'ship', exampleA: 'Fluffy white sheep.', exampleB: 'A sailing cargo ship.' },
        { wordA: 'seat', wordB: 'sit', exampleA: 'Take a comfortable seat.', exampleB: 'Please sit right here.' },
        { wordA: 'feet', wordB: 'fit', exampleA: 'My feet are tired.', exampleB: 'Those shoes fit perfectly.' },
        { wordA: 'leave', wordB: 'live', exampleA: 'Time to leave now.', exampleB: 'Where do you live?' }
      ]
    }
  ],
  tongueTwisters: [
    {
      id: 'twister_1',
      title: 'Peter Piper\'s Peppers',
      difficulty: 'Medium',
      targetSound: 'Crisp /p/ plosives and breath control',
      text: 'Peter Piper picked a peck of pickled peppers. A peck of pickled peppers Peter Piper picked.'
    },
    {
      id: 'twister_2',
      title: 'Seashells on the Seashore',
      difficulty: 'Hard',
      targetSound: 'Alternating /s/ and /ʃ/ (sh)',
      text: 'She sells seashells by the seashore, and the shells she sells are seashells, I\'m sure.'
    },
    {
      id: 'twister_3',
      title: 'Woodchuck Forestry',
      difficulty: 'Medium',
      targetSound: '/w/ glide and /tʃ/ (ch) sound',
      text: 'How much wood would a woodchuck chuck if a woodchuck could chuck wood?'
    },
    {
      id: 'twister_4',
      title: 'Betty Botter\'s Butter',
      difficulty: 'Expert',
      targetSound: 'Flapped American /t/ and bilabial /b/',
      text: 'Betty Botter bought some butter, but she said the butter\'s bitter. If I put it in my batter, it will make my batter bitter.'
    },
    {
      id: 'twister_5',
      title: 'Red Lorry, Yellow Lorry',
      difficulty: 'Expert',
      targetSound: 'Rapid /r/ and /l/ tongue gymnastics',
      text: 'Red lorry, yellow lorry, red lorry, yellow lorry, red lorry, yellow lorry.'
    }
  ]
};

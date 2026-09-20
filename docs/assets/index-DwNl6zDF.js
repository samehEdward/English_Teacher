(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))i(n);new MutationObserver(n=>{for(const r of n)if(r.type==="childList")for(const s of r.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&i(s)}).observe(document,{childList:!0,subtree:!0});function t(n){const r={};return n.integrity&&(r.integrity=n.integrity),n.referrerPolicy&&(r.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?r.credentials="include":n.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function i(n){if(n.ep)return;n.ep=!0;const r=t(n);fetch(n.href,r)}})();class Ce{constructor(){this.synth=window.speechSynthesis,this.voices=[],this.selectedVoice=null,this.currentUtterance=null,this.recognition=null,this.isListening=!1,this.currentLang="en",this.initVoices(),this.initRecognition()}setLanguage(e="en"){this.currentLang=e,this.initVoices()}getLanguage(){return this.currentLang}getDefaultRecognitionLang(){return this.currentLang==="de"?"de-DE":"en-US"}initVoices(){if(!this.synth)return;const e=()=>{const t=this.synth.getVoices(),i=this.currentLang==="de"?"de":"en";this.voices=t.filter(r=>r.lang.toLowerCase().startsWith(i)),this.voices.length===0&&(this.voices=t);let n=null;this.currentLang==="de"?n=this.voices.find(r=>(r.name.includes("Natural")||r.name.includes("Google")||r.name.includes("Online")||r.name.includes("Katja")||r.name.includes("Hedda")||r.name.includes("Stefan"))&&(r.lang.includes("de-DE")||r.lang.includes("de")))||this.voices.find(r=>r.lang.toLowerCase().includes("de"))||this.voices[0]:n=this.voices.find(r=>(r.name.includes("Natural")||r.name.includes("Google")||r.name.includes("Online"))&&(r.lang.includes("en-US")||r.lang.includes("en-GB")))||this.voices.find(r=>r.lang.includes("en-US"))||this.voices[0],this.selectedVoice=n||null};e(),this.synth.onvoiceschanged!==void 0&&(this.synth.onvoiceschanged=e)}getAvailableVoices(){return this.voices}setVoiceByUri(e){const t=this.voices.find(i=>i.voiceURI===e);t&&(this.selectedVoice=t)}speak({text:e,rate:t=1,pitch:i=1,onBoundary:n=null,onStart:r=null,onEnd:s=null,onError:o=null}){if(!this.synth){o&&o(new Error("Speech Synthesis not supported in this browser."));return}this.stopSpeaking();const c=new SpeechSynthesisUtterance(e);c.rate=Math.max(.5,Math.min(2,t)),c.pitch=Math.max(.5,Math.min(1.5,i)),c.lang=this.selectedVoice?this.selectedVoice.lang:this.getDefaultRecognitionLang(),this.selectedVoice&&(c.voice=this.selectedVoice),n&&(c.onboundary=d=>{n(d)}),c.onstart=()=>{r&&r()},c.onend=()=>{this.currentUtterance=null,s&&s()},c.onerror=d=>{this.currentUtterance=null,o&&o(d)},this.currentUtterance=c,this.synth.speak(c)}stopSpeaking(){this.synth&&(this.synth.speaking||this.synth.pending)&&this.synth.cancel(),this.currentUtterance=null}isSpeaking(){return this.synth?this.synth.speaking:!1}initRecognition(){if(!(window.SpeechRecognition||window.webkitSpeechRecognition)){console.warn("SpeechRecognition is not supported in this browser environment."),this.recognitionSupported=!1;return}this.recognitionSupported=!0}isSpeechRecognitionSupported(){return this.recognitionSupported}startListening({lang:e=null,continuous:t=!0,interimResults:i=!0,onStart:n=null,onInterim:r=null,onResult:s=null,onError:o=null,onEnd:c=null}){if(!this.recognitionSupported){o&&o(new Error("Speech Recognition is only supported in Chrome, Edge, and Chromium-based browsers."));return}this.stopListening();const d=window.SpeechRecognition||window.webkitSpeechRecognition;this.recognition=new d,this.recognition.lang=e||this.getDefaultRecognitionLang(),this.recognition.continuous=t,this.recognition.interimResults=i,this.recognition.maxAlternatives=1;let h="",p=!1,z=!1;this.recognition.onstart=()=>{this.isListening=!0,n&&n()},this.recognition.onresult=v=>{let L="",$="";for(let P=0;P<v.results.length;++P){const M=v.results[P];if(M&&M[0]){const V=M[0].transcript;M.isFinal?L+=(L?" ":"")+V:$+=($?" ":"")+V}}h=L;const w=(L+(L&&$?" ":"")+$).trim();r&&r({final:L,interim:$,full:w})},this.recognition.onerror=v=>{const L=v.error||v.message||"unknown";if(console.warn("Speech recognition error event:",L),L==="aborted"){z=!0;return}if(L==="no-speech"){p=!1,o&&o(v);return}p=!0,o&&o(v)},this.recognition.onend=()=>{this.isListening=!1,this.recognition=null,!p&&!z&&h.trim()&&s&&s(h.trim()),c&&c()};try{this.recognition.start()}catch(v){console.error("Failed to start recognition:",v),p=!0,o&&o(v)}}stopListening(){if(this.recognition){try{this.recognition.abort()}catch{try{this.recognition.stop()}catch{}}this.recognition=null}this.isListening=!1}}const u=new Ce,W={STREAK:"echospeak_streak_v1",STATS:"echospeak_stats_v1",VAULT:"echospeak_vault_v1",CUSTOM_TEXTS:"echospeak_custom_texts_v1",SETTINGS:"echospeak_settings_v1"};class Ie{constructor(){this.initDefaults()}initDefaults(){localStorage.getItem(W.SETTINGS)||this.saveSettings({language:"en",preferredVoice:"",speechRate:1,pitch:1,soundEffects:!0,highContrast:!1}),localStorage.getItem(W.STATS)||this.saveStats({wordsSpoken:0,totalSessions:0,practiceMinutes:0,accuracySum:0,assessmentsCount:0,lastActiveDate:new Date().toISOString().split("T")[0]}),this.checkAndUpdateStreak()}checkAndUpdateStreak(){const e=localStorage.getItem(W.STREAK),t=new Date().toISOString().split("T")[0];let i=e?JSON.parse(e):{currentStreak:1,lastActiveDate:t,bestStreak:1};const n=i.lastActiveDate;if(n!==t){const r=new Date(n),s=new Date(t),o=Math.round((s-r)/(1e3*60*60*24));o===1?(i.currentStreak+=1,i.bestStreak=Math.max(i.bestStreak,i.currentStreak)):o>1&&(i.currentStreak=1),i.lastActiveDate=t,localStorage.setItem(W.STREAK,JSON.stringify(i))}return i}getStreak(){const e=localStorage.getItem(W.STREAK);return e?JSON.parse(e):{currentStreak:1,bestStreak:1}}getStats(){const e=localStorage.getItem(W.STATS),t=e?JSON.parse(e):{wordsSpoken:0,totalSessions:0,practiceMinutes:0,accuracySum:0,assessmentsCount:0},i=t.assessmentsCount>0?Math.round(t.accuracySum/t.assessmentsCount):100;return{...t,avgAccuracy:i}}saveStats(e){localStorage.setItem(W.STATS,JSON.stringify(e))}recordActivity({words:e=0,minutes:t=1,accuracy:i=null}){const n=this.getStats();n.wordsSpoken+=e,n.practiceMinutes+=t,n.totalSessions+=1,i!==null&&(n.accuracySum+=i,n.assessmentsCount+=1),this.saveStats(n),this.checkAndUpdateStreak()}getVault(){const e=localStorage.getItem(W.VAULT);return e?JSON.parse(e):[]}saveToVault(e){const t=this.getVault(),i=t.findIndex(r=>r.word.toLowerCase()===e.word.toLowerCase()),n={word:e.word,ipa:e.ipa||"",def:e.def||"Saved from practice session",example:e.example||"",dateAdded:new Date().toLocaleDateString(),mastery:e.mastery||1};return i>=0?t[i]={...t[i],...n}:t.unshift(n),localStorage.setItem(W.VAULT,JSON.stringify(t)),t}removeFromVault(e){let t=this.getVault();return t=t.filter(i=>i.word.toLowerCase()!==e.toLowerCase()),localStorage.setItem(W.VAULT,JSON.stringify(t)),t}isWordSaved(e){return this.getVault().some(i=>i.word.toLowerCase()===e.toLowerCase())}getCustomTexts(){const e=localStorage.getItem(W.CUSTOM_TEXTS);return e?JSON.parse(e):[]}saveCustomText({title:e,text:t,level:i="Custom"}){const n=this.getCustomTexts(),r={id:"custom_"+Date.now(),title:e.trim()||"My Custom Article",level:i,category:"Imported",text:t.trim(),vocabulary:[]};return n.unshift(r),localStorage.setItem(W.CUSTOM_TEXTS,JSON.stringify(n)),r}deleteCustomText(e){let t=this.getCustomTexts();return t=t.filter(i=>i.id!==e),localStorage.setItem(W.CUSTOM_TEXTS,JSON.stringify(t)),t}getSettings(){const e=localStorage.getItem(W.SETTINGS),t={language:"en",speechRate:1,pitch:1,preferredVoice:"",soundEffects:!0};return e?{...t,...JSON.parse(e)}:t}saveSettings(e){const i={...this.getSettings(),...e};return localStorage.setItem(W.SETTINGS,JSON.stringify(i)),i}getLanguage(){return this.getSettings().language||"en"}setLanguage(e){return this.saveSettings({language:e})}}const A=new Ie;class ze{constructor(){this.mediaRecorder=null,this.audioChunks=[],this.audioBlob=null,this.audioUrl=null,this.audioContext=null,this.analyser=null,this.source=null,this.stream=null,this.isRecording=!1,this.animationFrameId=null}async initMicrophone(){if(this.stream)return this.stream;try{return this.stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:!0,noiseSuppression:!0,autoGainControl:!0}}),this.stream}catch(e){throw console.error("Microphone permission denied or unavailable:",e),e}}async startRecording(e=null){if(await this.initMicrophone(),this.audioChunks=[],this.audioBlob=null,this.audioUrl&&(URL.revokeObjectURL(this.audioUrl),this.audioUrl=null),!this.audioContext){const n=window.AudioContext||window.webkitAudioContext;this.audioContext=new n}this.audioContext.state==="suspended"&&await this.audioContext.resume(),this.analyser=this.audioContext.createAnalyser(),this.analyser.fftSize=256,this.source=this.audioContext.createMediaStreamSource(this.stream),this.source.connect(this.analyser);let t="audio/webm";MediaRecorder.isTypeSupported("audio/webm")||(MediaRecorder.isTypeSupported("audio/mp4")?t="audio/mp4":MediaRecorder.isTypeSupported("audio/ogg")?t="audio/ogg":t="");const i=t?{mimeType:t}:void 0;this.mediaRecorder=new MediaRecorder(this.stream,i),this.mediaRecorder.ondataavailable=n=>{n.data&&n.data.size>0&&this.audioChunks.push(n.data)},this.mediaRecorder.start(100),this.isRecording=!0,e&&this.startWaveformVisualizer(e)}releaseMicrophone(){if(this.stream){try{this.stream.getTracks().forEach(e=>{e.stop()})}catch{}this.stream=null}}stopRecording(){return new Promise(e=>{if(this.releaseMicrophone(),!this.mediaRecorder||this.mediaRecorder.state==="inactive"){this.isRecording=!1,this.stopWaveformVisualizer(),e(null);return}this.mediaRecorder.onstop=()=>{this.isRecording=!1,this.stopWaveformVisualizer(),this.audioBlob=new Blob(this.audioChunks,{type:this.mediaRecorder.mimeType||"audio/webm"}),this.audioUrl=URL.createObjectURL(this.audioBlob),e({blob:this.audioBlob,url:this.audioUrl})};try{this.mediaRecorder.stop()}catch{this.isRecording=!1,this.stopWaveformVisualizer(),e(null)}})}startWaveformVisualizer(e){const t=e.getContext("2d"),i=this.analyser.frequencyBinCount,n=new Uint8Array(i),r=()=>{if(!this.isRecording){this.drawIdleWave(t,e.width,e.height);return}this.animationFrameId=requestAnimationFrame(r),this.analyser.getByteTimeDomainData(n),t.clearRect(0,0,e.width,e.height);const s=t.createLinearGradient(0,0,e.width,0);s.addColorStop(0,"#06b6d4"),s.addColorStop(.5,"#6366f1"),s.addColorStop(1,"#ec4899"),t.lineWidth=3,t.strokeStyle=s,t.shadowBlur=10,t.shadowColor="#6366f1",t.beginPath();const o=e.width*1/i;let c=0;for(let d=0;d<i;d++){const p=n[d]/128*e.height/2;d===0?t.moveTo(c,p):t.lineTo(c,p),c+=o}t.lineTo(e.width,e.height/2),t.stroke()};r()}drawIdleWave(e,t,i){e.clearRect(0,0,t,i),e.lineWidth=2,e.strokeStyle="rgba(99, 102, 241, 0.25)",e.beginPath(),e.moveTo(0,i/2),e.lineTo(t,i/2),e.stroke()}stopWaveformVisualizer(){this.animationFrameId&&(cancelAnimationFrame(this.animationFrameId),this.animationFrameId=null)}playAudio(e=null){const t=e||this.audioUrl;if(!t)return null;const i=new Audio(t);return i.play(),i}playChime(e="success"){try{const t=window.AudioContext||window.webkitAudioContext,i=new t,n=i.createOscillator(),r=i.createGain();n.connect(r),r.connect(i.destination);const s=i.currentTime;e==="success"?(n.frequency.setValueAtTime(523.25,s),n.frequency.exponentialRampToValueAtTime(659.25,s+.1),n.frequency.exponentialRampToValueAtTime(783.99,s+.2),r.gain.setValueAtTime(.15,s),r.gain.exponentialRampToValueAtTime(.01,s+.4),n.start(s),n.stop(s+.4)):e==="tap"?(n.frequency.setValueAtTime(440,s),r.gain.setValueAtTime(.08,s),r.gain.exponentialRampToValueAtTime(.001,s+.08),n.start(s),n.stop(s+.08)):e==="incorrect"&&(n.frequency.setValueAtTime(280,s),n.frequency.exponentialRampToValueAtTime(220,s+.18),r.gain.setValueAtTime(.12,s),r.gain.exponentialRampToValueAtTime(.01,s+.25),n.start(s),n.stop(s+.25))}catch{}}}const T=new ze,se={en:{brandSubtitle:"Master Spoken Fluency • 100% Browser Native",streakSuffix:"Day Streak",spokenSuffix:"Spoken",voiceLabel:"Voice:",defaultVoice:"Default Voice",installBtn:"App on Phone",nav:{read:"📖 Read & Speak",shadow:"🎧 Shadowing Lab",dict:"✍️ Dictation Studio",roleplay:"💬 Roleplay & Dialogue",phonetics:"🎯 Phonetics Gym",vocational:"💼 Career Pro Studio",vault:"📚 Vault & Stats"},modal:{title:"Import Your Custom Text",desc:"Paste any news article, email, book excerpt, or speech. The studio will automatically enable word-by-word reading, audio pronunciation, and speech assessment.",articleTitleLabel:"Article Title:",articleTitlePlaceholder:"e.g. Technology News / My Presentation",textLabel:"Text (Paragraph):",textPlaceholder:"Paste your paragraph here...",cancelBtn:"Cancel",saveBtn:"Save & Start Reading",alertEmpty:"Please paste some text to practice."},common:{speed:"Coach Speed:",startSpeaking:"Start Speaking",stopSpeaking:"Stop & Evaluate",coachAudio:"Listen to Coach",coachAudioStop:"Stop Audio",revealHint:"💡 Reveal Hint",hideHint:"🙈 Hide Hint",checkInput:"Check Spelling",nextExercise:"Next Exercise →",tryAgain:"Try Again ↺",clear:"Clear",importCustom:"+ Import Custom Text",words:"words",recordingPrompt:'Click "Start Speaking" and read aloud clearly...',listeningPrompt:"Listening... Speak clearly.",successChime:"Great pronunciation!"}},de:{brandSubtitle:"Sprechflüssigkeit trainieren • 100% Browser-Nativ",streakSuffix:"Tage Serie",spokenSuffix:"Gesprochen",voiceLabel:"Stimme:",defaultVoice:"Standardstimme (Deutsch)",installBtn:"App am Handy",nav:{read:"📖 Lesen & Sprechen",shadow:"🎧 Shadowing-Labor",dict:"✍️ Diktat-Studio",roleplay:"💬 Rollenspiel & Dialog",phonetics:"🎯 Phonetik & Gym",vocational:"💼 Fachsprache & Karriere",vault:"📚 Wortschatz & Stats"},modal:{title:"Eigenen Text importieren",desc:"Fügen Sie beliebige Artikel, E-Mails, Buchauszüge oder Reden ein. Das Studio unterstützt Sie mit Wort-für-Wort-Aussprache, Coaching-Audio und Echtzeit-Spracherkennung.",articleTitleLabel:"Artikeltitel:",articleTitlePlaceholder:"z.B. Nachrichten / Meine Präsentation",textLabel:"Text (Absatz):",textPlaceholder:"Fügen Sie Ihren deutschen Absatz hier ein...",cancelBtn:"Abbrechen",saveBtn:"Speichern & Lesen",alertEmpty:"Bitte fügen Sie einen Text zum Üben ein."},common:{speed:"Sprechtempo:",startSpeaking:"Sprechen starten",stopSpeaking:"Stoppen & Auswerten",coachAudio:"Coach anhören",coachAudioStop:"Audio stoppen",revealHint:"💡 Tipp anzeigen",hideHint:"🙈 Tipp ausblenden",checkInput:"Rechtschreibung prüfen",nextExercise:"Nächste Übung →",tryAgain:"Erneut versuchen ↺",clear:"Löschen",importCustom:"+ Eigenen Text importieren",words:"Wörter",recordingPrompt:'Klicken Sie auf "Sprechen starten" und lesen Sie laut vor...',listeningPrompt:"Höre zu... Sprechen Sie deutlich.",successChime:"Hervorragende Aussprache!"}}},Be=[{id:"read_a1_coffee",level:"A1 - Beginner",title:"The Morning Coffee Ritual",category:"Daily Routine",text:"Every morning, Sarah wakes up at seven o'clock. She walks to the kitchen and opens the window to feel the fresh air. Then, she brews a warm cup of coffee with a splash of milk. She enjoys sitting quietly on the balcony before starting her busy day.",vocabulary:[{word:"morning",ipa:"/ˈmɔːrnɪŋ/",def:"The early part of the day from sunrise to noon."},{word:"brews",ipa:"/bruːz/",def:"Prepares a hot beverage like tea or coffee by soaking in boiling water."},{word:"quietly",ipa:"/ˈkwaɪətli/",def:"In a calm, silent, or peaceful manner."},{word:"balcony",ipa:"/ˈbælkəni/",def:"A platform enclosed by a wall or balustrade on the outside of a building."}]},{id:"read_b1_storytelling",level:"B1 - Intermediate",title:"The Power of Storytelling",category:"Communication",text:"Humans have shared stories around campfires for thousands of years. A captivating story connects people emotionally and breaks down cultural barriers. When you tell a story with passion and vivid details, your listeners remember the message far longer than dry facts alone.",vocabulary:[{word:"captivating",ipa:"/ˈkæptɪveɪtɪŋ/",def:"Capable of attracting and holding interest; charming."},{word:"barriers",ipa:"/ˈbæriərz/",def:"Obstacles or boundaries that prevent movement or access."},{word:"passion",ipa:"/ˈpæʃən/",def:"A strong and barely controllable emotion or intense enthusiasm."},{word:"vivid",ipa:"/ˈvɪvɪd/",def:"Producing powerful feelings or strong, clear images in the mind."}]},{id:"read_b2_remote_work",level:"B2 - Upper Intermediate",title:"Navigating Remote Collaboration",category:"Professional & Tech",text:"Remote work has fundamentally reshaped modern workplace dynamics. Clear asynchronous communication requires thoughtful clarity and empathy. When team members articulate their ideas clearly in concise messages, misunderstandings decrease, and productivity flourishes across different time zones.",vocabulary:[{word:"fundamentally",ipa:"/ˌfʌndəˈmentəli/",def:"In central or primary respects; essentially."},{word:"asynchronous",ipa:"/eɪˈsɪŋkrənəs/",def:"Not occurring at the same time or coordinated in real-time."},{word:"articulate",ipa:"/ɑːrˈtɪkjuleɪt/",def:"Express an idea or feeling fluently and coherently."},{word:"flourishes",ipa:"/ˈflɜːrɪʃɪz/",def:"Grows or develops in a healthy or vigorous way."}]},{id:"read_c1_ai_future",level:"C1 - Advanced",title:"The Frontier of Artificial Intelligence",category:"Science & Innovation",text:"As machine learning algorithms become increasingly sophisticated, human ingenuity must steer their ethical integration. True intelligence encompasses nuanced contextual comprehension, emotional resonance, and philosophical inquiry—qualities that transcend mere predictive computation.",vocabulary:[{word:"sophisticated",ipa:"/səˈfɪstɪkeɪtɪd/",def:"Highly developed, complex, and refined."},{word:"ingenuity",ipa:"/ˌɪndʒəˈnuːəti/",def:"The quality of being clever, original, and inventive."},{word:"encompasses",ipa:"/ɪnˈkʌmpəsɪz/",def:"Surrounds or includes something comprehensively."},{word:"transcend",ipa:"/trænˈsend/",def:"Be or go beyond the range or limits of something."}]},{id:"read_business_pitch",level:"B2 - Business English",title:"Pitching a Sustainable Enterprise",category:"Business English",text:"Distinguished investors, our primary objective is delivering circular packaging solutions without compromising product integrity. By sourcing biodegradable seaweed polymers, we eliminate single-use plastics while achieving a remarkable thirty percent reduction in logistical overhead.",vocabulary:[{word:"distinguished",ipa:"/dɪˈstɪŋɡwɪʃt/",def:"Successful, authoritative, and commanding great respect."},{word:"objective",ipa:"/əbˈdʒektɪv/",def:"A goal or purpose toward which an effort is directed."},{word:"biodegradable",ipa:"/ˌbaɪəʊdɪˈɡreɪdəbəl/",def:"Capable of being decomposed by bacteria or living organisms."},{word:"logistical",ipa:"/ləˈdʒɪstɪkəl/",def:"Relating to or involving complex organization and transport."}]}],Ee=[{id:"shadow_daily_flow",title:"Natural Conversational Cadence",difficulty:"Intermediate",description:"Master contractions, rhythm, and natural English sentence stress.",sentences:[{text:"I was wondering if you might have a couple of minutes to discuss the new project timeline.",phoneticTip:'Notice how "was wondering if you" blends into one smooth rhythmic stream.'},{text:"To be completely honest with you, I haven't had the opportunity to review the latest draft yet.",phoneticTip:'Drop the heavy "t" in "honest with" and link "had the opportunity" naturally.'},{text:"Let's catch up tomorrow morning over a cup of coffee and figure out our next steps.",phoneticTip:'Stress "catch up", "coffee", and "next steps".'},{text:"That sounds like a great plan, and I'll make sure to send over my initial thoughts tonight.",phoneticTip:'Link "make sure to" smoothly with upward pitch on "plan".'}]},{id:"shadow_confidence_meeting",title:"Executive Presence & Pitching",difficulty:"Advanced",description:"Practice speaking with authority, measured pauses, and steady vocal tone.",sentences:[{text:"Thank you all for being here today; let's dive straight into the key quarterly metrics.",phoneticTip:'Use a short deliberate pause after "today" to command the room.'},{text:"Our proactive approach allowed us to surpass expectations despite significant market headwinds.",phoneticTip:'Emphasize "proactive", "surpass", and "headwinds" with crisp consonant finishes.'},{text:"Moving forward, our strategic priority will remain continuous innovation and customer delight.",phoneticTip:'Rise slightly on "innovation" and descend with confidence on "delight".'}]},{id:"shadow_casual_chitchat",title:"Casual Chit-Chat & Linking Words",difficulty:"Beginner - Intermediate",description:"Learn connected speech and reductions (gonna, wanna, kind of).",sentences:[{text:"What are you planning on doing this upcoming weekend?",phoneticTip:'"What are you" often reduces to "Whatcha" or a fast /wətər jʊ/.'},{text:"I'm thinking of checking out that new art exhibition downtown with a few close friends.",phoneticTip:'Link "checking out that" into seamless connected speech.'},{text:"Oh really? I've heard nothing but fantastic reviews about that whole gallery!",phoneticTip:'Express friendly curiosity with higher melodic pitch on "really".'}]}],Me=[{id:"dict_1",level:"Easy",sentence:"Consistency is the secret to mastering any foreign language.",hint:"A fundamental truth about learning skills through daily habit."},{id:"dict_2",level:"Easy",sentence:"Could you please speak a little slower so I can follow along?",hint:"A polite request used frequently in real conversations."},{id:"dict_3",level:"Medium",sentence:"The weather forecast predicts heavy thunderstorms throughout the entire afternoon.",hint:'Notice the spelling of "forecast" and "thunderstorms".'},{id:"dict_4",level:"Medium",sentence:"Effective leadership requires exceptional empathy and decisive problem-solving skills.",hint:"Pay attention to adjectives describing leadership qualities."},{id:"dict_5",level:"Hard",sentence:"Although the initial experiment yielded unexpected anomalies, the researchers remained undeterred.",hint:'Listen closely for "yielded", "anomalies", and "undeterred".'},{id:"dict_6",level:"Hard",sentence:"Sustainable architectural designs harmonize environmental responsibility with breathtaking aesthetic elegance.",hint:"Rich vocabulary describing green building design."}],$e=[{id:"scenario_interview",title:"The Job Interview: Strengths & Growth",icon:"💼",context:"You are interviewing for a role at an international company. Answer clearly, maintain a friendly professional tone, and articulate your experience.",steps:[{speaker:"Interviewer (Alex)",avatar:"👔",aiSpeech:"Welcome! It is a pleasure to meet you. To kick off our conversation, could you briefly introduce yourself and what inspired you to apply for this position?",suggestedResponses:["Thank you for having me. I have spent the last few years developing software, and I was drawn to your company's commitment to user experience and innovation.","It is wonderful to meet you. Throughout my career, I have focused on building impactful products and fostering cross-functional collaboration."],targetKeywords:["thank you","experience","company","position","collaboration","skills","innovative"]},{speaker:"Interviewer (Alex)",avatar:"👔",aiSpeech:"That sounds impressive. Can you share an example of a difficult challenge you encountered at work and how you managed to resolve it?",suggestedResponses:["Once, our team faced an aggressive deadline with shifting requirements. I organized a prioritization workshop to align stakeholders, and we delivered on schedule.","When an unexpected system bottleneck occurred, I conducted a root cause analysis, communicated transparently with clients, and deployed a permanent fix."],targetKeywords:["challenge","deadline","team","communicated","resolved","solution","priority"]},{speaker:"Interviewer (Alex)",avatar:"👔",aiSpeech:"Fantastic problem-solving mindset! Before we wrap up, do you have any questions for me regarding our team culture or future roadmap?",suggestedResponses:["Yes, absolutely! Could you describe what a typical day looks like for someone in this role, and how success is measured?","I would love to learn more about how your team approaches mentorship and professional development opportunities."],targetKeywords:["yes","team","culture","question","success","growth","mentorship"]}]},{id:"scenario_cafe",title:"Ordering at a Specialty Coffee Shop",icon:"☕",context:"Order your favorite drink and a snack at a trendy specialty café in London.",steps:[{speaker:"Barista (Leo)",avatar:"☕",aiSpeech:"Good morning! Welcome to Roasters & Beans. What can I get started for you today?",suggestedResponses:["Good morning! I would like a medium oat milk cappuccino and an almond croissant, please.","Hi there! Could I get an iced Americano with a splash of vanilla syrup, please?"],targetKeywords:["morning","like","cappuccino","coffee","please","croissant","latte","americano"]},{speaker:"Barista (Leo)",avatar:"☕",aiSpeech:"Excellent choice! Would you like that drink hot or iced, and will that be for here or to go?",suggestedResponses:["I will have it hot, and to go please because I am heading to the office.","For here please, I would like to sit down and read my book."],targetKeywords:["hot","iced","here","to go","please","office","table"]},{speaker:"Barista (Leo)",avatar:"☕",aiSpeech:"All set! That comes to six pounds fifty. Are you paying with card or contactless phone?",suggestedResponses:["I will tap with my contactless phone, thank you so much!","Paying by card, please. Could you also provide a receipt?"],targetKeywords:["card","contactless","phone","pay","receipt","thank you"]}]},{id:"scenario_travel",title:"Airport Transit & Hotel Check-in",icon:"✈️",context:"Handle arrival at your international travel destination with confidence and clarity.",steps:[{speaker:"Hotel Receptionist (Elena)",avatar:"🏨",aiSpeech:"Welcome to the Grand Horizon Hotel. How may I assist you with your reservation today?",suggestedResponses:["Hello, I have a reservation under the name of Smith for three nights.","Good afternoon, I am checking in. Here is my booking confirmation number and passport."],targetKeywords:["hello","reservation","checking in","booking","nights","name","passport"]},{speaker:"Hotel Receptionist (Elena)",avatar:"🏨",aiSpeech:"Thank you! I found your booking right here. Would you prefer a quiet room on a high floor overlooking the city garden?",suggestedResponses:["A quiet room on a higher floor would be absolutely wonderful, thank you!","Yes please, I really appreciate a quiet environment to get some rest after my flight."],targetKeywords:["quiet","room","high floor","wonderful","thank you","appreciate"]}]}],Re={minimalPairs:[{contrast:"/θ/ (th) vs /s/ (s)",tip:"Place the tip of your tongue gently between your front teeth for /θ/, whereas /s/ keeps the tongue behind teeth.",pairs:[{wordA:"think",wordB:"sink",exampleA:"I think carefully.",exampleB:"Wash in the sink."},{wordA:"thought",wordB:"sought",exampleA:"A fleeting thought.",exampleB:"They sought shelter."},{wordA:"thick",wordB:"sick",exampleA:"A thick wool sweater.",exampleB:"Feeling a bit sick."},{wordA:"mouth",wordB:"mouse",exampleA:"Open your mouth.",exampleB:"A quiet little mouse."}]},{contrast:"/r/ (r) vs /l/ (l)",tip:"For /l/, press your tongue tip firmly against the gum ridge behind upper teeth. For /r/, curl the tongue back without touching the roof.",pairs:[{wordA:"light",wordB:"right",exampleA:"Turn on the light.",exampleB:"You are absolutely right."},{wordA:"lead",wordB:"read",exampleA:"Lead the team forward.",exampleB:"I love to read books."},{wordA:"collect",wordB:"correct",exampleA:"Collect the coins.",exampleB:"That is the correct answer."},{wordA:"glow",wordB:"grow",exampleA:"A warm evening glow.",exampleB:"Plants grow toward sunshine."}]},{contrast:"/v/ (v) vs /w/ (w)",tip:'For /v/, gently rest your upper teeth on your bottom lip and vibrate. For /w/, round your lips in an "O" shape without touching teeth.',pairs:[{wordA:"vest",wordB:"west",exampleA:"Wear a warm vest.",exampleB:"Traveling toward the west."},{wordA:"vine",wordB:"wine",exampleA:"A climbing green vine.",exampleB:"A glass of red wine."},{wordA:"vet",wordB:"wet",exampleA:"Take the dog to the vet.",exampleB:"The grass is wet with dew."},{wordA:"vow",wordB:"wow",exampleA:"Make a solemn vow.",exampleB:"Wow, that looks stunning!"}]},{contrast:"/iː/ (long ee) vs /ɪ/ (short i)",tip:"Smile wide with high muscle tension for /iː/ (sheep). Relax your jaw and tongue muscles for /ɪ/ (ship).",pairs:[{wordA:"sheep",wordB:"ship",exampleA:"Fluffy white sheep.",exampleB:"A sailing cargo ship."},{wordA:"seat",wordB:"sit",exampleA:"Take a comfortable seat.",exampleB:"Please sit right here."},{wordA:"feet",wordB:"fit",exampleA:"My feet are tired.",exampleB:"Those shoes fit perfectly."},{wordA:"leave",wordB:"live",exampleA:"Time to leave now.",exampleB:"Where do you live?"}]}],tongueTwisters:[{id:"twister_1",title:"Peter Piper's Peppers",difficulty:"Medium",targetSound:"Crisp /p/ plosives and breath control",text:"Peter Piper picked a peck of pickled peppers. A peck of pickled peppers Peter Piper picked."},{id:"twister_2",title:"Seashells on the Seashore",difficulty:"Hard",targetSound:"Alternating /s/ and /ʃ/ (sh)",text:"She sells seashells by the seashore, and the shells she sells are seashells, I'm sure."},{id:"twister_3",title:"Woodchuck Forestry",difficulty:"Medium",targetSound:"/w/ glide and /tʃ/ (ch) sound",text:"How much wood would a woodchuck chuck if a woodchuck could chuck wood?"},{id:"twister_4",title:"Betty Botter's Butter",difficulty:"Expert",targetSound:"Flapped American /t/ and bilabial /b/",text:"Betty Botter bought some butter, but she said the butter's bitter. If I put it in my batter, it will make my batter bitter."},{id:"twister_5",title:"Red Lorry, Yellow Lorry",difficulty:"Expert",targetSound:"Rapid /r/ and /l/ tongue gymnastics",text:"Red lorry, yellow lorry, red lorry, yellow lorry, red lorry, yellow lorry."}]},De=[{id:"de_read_a1_kaffee",level:"A1 - Anfänger",title:"Das morgendliche Kaffeeritual",category:"Alltagsroutine",text:"Jeden Morgen wacht Sarah um sieben Uhr auf. Sie geht gemütlich in die Küche und öffnet das Fenster für frische Luft. Dann brüht sie sich eine heiße Tasse aromatischen Kaffee mit einem Schuss Milch auf. Sie genießt die Ruhe auf dem Balkon, bevor ihr geschäftiger Tag beginnt.",vocabulary:[{word:"gemütlich",ipa:"/ɡəˈmyːtlɪç/",def:"Behaglich, angenehm und ohne Hast."},{word:"brüht",ipa:"/bʁyːt/",def:"Ein Heißgetränk wie Kaffee oder Tee mit kochendem Wasser zubereiten."},{word:"aromatischen",ipa:"/aʁoˈmaːtɪʃn̩/",def:"Einen wohlriechenden, intensiven Duft oder Geschmack besitzend."},{word:"geschäftiger",ipa:"/ɡəˈʃɛftɪɡɐ/",def:"Sehr beschäftigt, arbeitsreich oder voller Aktivitäten."}]},{id:"de_read_b1_geschichten",level:"B1 - Mittelstufe",title:"Die Kraft des Geschichtenerzählens",category:"Kommunikation & Kultur",text:"Seit Jahrtausenden versammeln sich Menschen an wärmenden Lagerfeuern, um fesselnde Geschichten auszutauschen. Eine berührende Erzählung verbindet Zuhörer auf einer emotionalen Ebene und überwindet scheinbar unüberwindbare kulturelle Barrieren. Wer mit echter Leidenschaft und bildhaften Details erzählt, verankert seine Botschaft nachhaltig in den Köpfen der Menschen.",vocabulary:[{word:"fesselnde",ipa:"/ˈfɛsl̩ndə/",def:"Äußerst spannend, mitreißend und die Aufmerksamkeit bindend."},{word:"Barrieren",ipa:"/baˈʁi̯eːʁən/",def:"Hindernisse, Grenzen oder Schranken, die den Zugang erschweren."},{word:"Leidenschaft",ipa:"/ˈlaɪ̯dn̩ʃaft/",def:"Große Begeisterung, Hingabe und tiefe Emotion für eine Sache."},{word:"nachhaltig",ipa:"/ˈnaːxhaltɪç/",def:"Lange nachwirkend, dauerhaft und von bleibendem Wert."}]},{id:"de_read_b2_homeoffice",level:"B2 - Obere Mittelstufe",title:"Moderne Arbeitswelten und digitale Zusammenarbeit",category:"Beruf & Digitalisierung",text:"Mobiles Arbeiten und flexible Arbeitszeiten haben die Strukturen moderner Unternehmen grundlegend transformiert. Eine erfolgreiche asynchrone Zusammenarbeit setzt jedoch eine hohe kommunikative Präzision und gegenseitige Empathie voraus. Wenn Teammitglieder ihre Gedanken klar und wohlüberlegt formulieren, sinkt die Zahl der Missverständnisse drastisch, und die kollektive Produktivität wächst standortübergreifend.",vocabulary:[{word:"transformiert",ipa:"/tʁansfɔʁˈmiːɐ̯t/",def:"Vollständig umgestaltet, grundlegend verändert."},{word:"asynchrone",ipa:"/aˈzʏŋkʁoːnə/",def:"Nicht zeitgleich stattfindend; zeitversetzt ablaufend."},{word:"Präzision",ipa:"/pʁɛtsiˈzi̯oːn/",def:"Hohe Genauigkeit, Exaktheit und Klarheit im Ausdruck."},{word:"standortübergreifend",ipa:"/ˈʃtantʔɔʁtʔyːbɐˌɡʁaɪ̯fn̩t/",def:"Über mehrere Büros, Städte oder Länder hinweg wirksam."}]},{id:"de_read_c1_ki_zukunft",level:"C1 - Fortgeschritten",title:"Die Evolution der Künstlichen Intelligenz",category:"Wissenschaft & Philosophie",text:"Während selbstlernende Algorithmen eine nie dagewesene Komplexität erreichen, verlangt ihre verantwortungsvolle Eingliederung in unsere Gesellschaft ein Höchstmaß an menschlicher Urteilskraft. Echte Erkenntnisfähigkeit umfasst kontextuelles Einfühlungsvermögen, ethische Abwägung und philosophischen Tiefgang—wesentliche Dimensionen des Bewusstseins, die weit über rein statistische Mustererkennung hinausgehen.",vocabulary:[{word:"Eingliederung",ipa:"/ˈaɪ̯nˌɡliːdəʁʊŋ/",def:"Die harmonische Integration in ein bestehendes Gefüge."},{word:"Urteilskraft",ipa:"/ˈuːɐ̯taɪ̯lsˌkʁaft/",def:"Die Fähigkeit, Sachverhalte vernünftig und kritisch zu beurteilen."},{word:"Einfühlungsvermögen",ipa:"/ˈaɪ̯nfyːlʊŋsfɛɐ̯ˌmøːɡn̩/",def:"Die emotionale Fähigkeit, sich in die Lage anderer hineinzuversetzen."},{word:"Mustererkennung",ipa:"/ˈmʊstɐʔɛɐ̯ˌkɛnʊŋ/",def:"Das automatisierte Erkennen regelmäßiger Strukturen in Datensätzen."}]},{id:"de_read_wirtschaft_pitch",level:"B2 - Wirtschaftsdeutsch",title:"Nachhaltige Kreislaufwirtschaft im Praxistest",category:"Wirtschaft & Innovation",text:"Sehr geehrte Damen und Herren, unser primäres strategisches Ziel besteht darin, biobasierte Verpackungslösungen ohne Qualitätsverlust im globalen Markt zu etablieren. Durch die Verwertung heimischer Algenextrakte substituieren wir konventionelle Kunststoffe vollständig und erzielen gleichzeitig eine Reduzierung der Transportemissionen um mehr als zwanzig Prozent.",vocabulary:[{word:"substituieren",ipa:"/zʊpstityˈʔiːʁən/",def:"Einen bestehenden Stoff oder Prozess vollwertig ersetzen."},{word:"etablieren",ipa:"/etaˈbliːʁən/",def:"Dauerhaft und erfolgreich am Markt oder in der Praxis einführen."},{word:"Transportemissionen",ipa:"/tʁansˈpɔʁteːmɪˌsi̯oːnən/",def:"Durch Güterverkehr freigesetzte Treibhausgase und Schadstoffe."},{word:"Kreislaufwirtschaft",ipa:"/ˈkʁaɪ̯slaʊ̯fˌvɪʁtʃaft/",def:"Wirtschaftsmodell zur Wiederverwendung und Vermeidung von Abfällen."}]}],Pe=[{id:"de_shadow_gespraechsfluss",title:"Natürlicher Gesprächsfluss",difficulty:"Mittelstufe",description:"Flüssige Satzmelodie, weiche Wortübergänge und deutsche Sprachmelodie meistern.",sentences:[{text:"Ich habe mich gefragt, ob Sie vielleicht ein paar Minuten Zeit hätten, um den Zeitplan zu besprechen.",phoneticTip:'Verbinden Sie "ob Sie vielleicht" zu einem flüssigen Atemstrom ohne harte Zäsuren.'},{text:"Um ganz ehrlich zu sein, hatte ich bisher leider noch keine Gelegenheit, den neuen Entwurf durchzusehen.",phoneticTip:'Betonen Sie das Wort "ehrlich" und senken Sie die Stimmlage am Satzende leicht ab.'},{text:"Lassen Sie uns morgen früh bei einer Tasse Kaffee zusammensetzen und die nächsten Meilensteine planen.",phoneticTip:'Heben Sie "morgen früh" und "nächsten Meilensteine" rhythmisch hervor.'},{text:"Das klingt nach einer hervorragenden Lösung, ich werde Ihnen meine Notizen noch heute Abend zukommen lassen.",phoneticTip:'Achten Sie auf das weiche "w" in "werde" und die präzise Aussprache von "hervorragenden".'}]},{id:"de_shadow_business_meeting",title:"Souveränes Auftreten im Meeting",difficulty:"Fortgeschritten",description:"Mit Klarheit, gezielten Pausen und professioneller Gelassenheit überzeugen.",sentences:[{text:"Vielen Dank, dass Sie sich heute die Zeit genommen haben; lassen Sie uns direkt mit den Quartalsergebnissen beginnen.",phoneticTip:"Setzen Sie nach dem Semikolon eine bewusste kleine Pause für maximale Aufmerksamkeit."},{text:"Dank unseres vorausschauenden Handelns konnten wir die Zielvorgaben trotz herausfordernder Marktbedingungen übertreffen.",phoneticTip:'Sprechen Sie zusammengesetzte Wörter wie "Marktbedingungen" und "Zielvorgaben" klar artikuliert aus.'},{text:"Für die kommenden Monate liegt unser Hauptaugenmerk auf technologischer Innovation und höchster Kundenzufriedenheit.",phoneticTip:'Leichte Tonhöhensteigerung bei "technologischer Innovation" und sicherer Abschluss bei "Kundenzufriedenheit".'}]},{id:"de_shadow_smalltalk",title:"Lockerer Alltags-Smalltalk",difficulty:"Anfänger - Mittelstufe",description:"Freundliche Alltagsphrasen und natürliche Umgangssprache im Dialog üben.",sentences:[{text:"Was hast du denn für das anstehende sonnige Wochenende schönes geplant?",phoneticTip:'Die Partikel "denn" verbindet den Satz melodisch und signalisiert echtes Interesse.'},{text:"Ich überlege, mir mit ein paar guten Freunden die neue Kunstausstellung im Stadtmuseum anzusehen.",phoneticTip:'Achten Sie auf die sanfte Betonung von "guten Freunden" und den klaren Rhythmus.'},{text:"Ach wirklich? Von dieser Ausstellung habe ich bisher auch nur absolut begeisterte Berichte gehört!",phoneticTip:'Drücken Sie freundliche Überraschung mit einer spürbar höheren Tonlage bei "Ach wirklich?" aus.'}]}],We=[{id:"de_dict_1",level:"Leicht",sentence:"Regelmäßigkeit ist das Geheimnis beim erfolgreichen Erlernen jeder neuen Fremdsprache.",hint:"Substantive im Deutschen immer großschreiben: Regelmäßigkeit, Geheimnis, Erlernen, Fremdsprache."},{id:"de_dict_2",level:"Leicht",sentence:"Könnten Sie bitte ein wenig langsamer sprechen, damit ich Ihren Worten besser folgen kann?",hint:'Höfliche Bitte mit Konjunktiv "Könnten" und Beistrich vor dem Nebensatz mit "damit".'},{id:"de_dict_3",level:"Mittel",sentence:"Der Deutsche Wetterdienst warnt für den gesamten Nachmittag vor kräftigen Gewittern und stürmischen Böen.",hint:'Achten Sie auf "Deutscher Wetterdienst", "kräftigen Gewittern" und den Dativ nach "vor".'},{id:"de_dict_4",level:"Mittel",sentence:"Gute Führungskräfte zeichnen sich durch authentische Empathie und lösungsorientiertes Denken aus.",hint:'Komposita "Führungskräfte" und trennbares Verb "zeichnen sich ... aus".'},{id:"de_dict_5",level:"Schwer",sentence:"Obwohl das wissenschaftliche Experiment überraschende Anomalien hervorbrachte, blieben die Forscher zuversichtlich.",hint:'Nebensatz mit "Obwohl" erfordert das konjugierte Verb am Satzende ("hervorbrachte").'},{id:"de_dict_6",level:"Schwer",sentence:"Zukunftsorientierte Architektur vereint ökologische Verantwortung mit zeitloser ästhetischer Eleganz.",hint:'Umlaut in "ästhetischer" und präzise Schreibweise der Adjektive im Dativ/Akkusativ.'}],qe=[{id:"de_scenario_bewerbung",title:"Das Vorstellungsgespräch: Stärken & Motivation",icon:"💼",context:"Sie bewerben sich um eine Stelle bei einem innovativen Technologieunternehmen in Berlin oder München.",steps:[{speaker:"Personalchef (Herr Weber)",avatar:"👔",aiSpeech:"Herzlich willkommen! Es freut mich sehr, Sie kennenzulernen. Erzählen Sie mir doch bitte zu Beginn kurz von Ihrem Werdegang und was Sie an unserer Stellenausschreibung besonders begeistert hat.",suggestedResponses:["Vielen Dank für die freundliche Einladung. In den letzten Jahren habe ich mich intensiv mit moderner Softwareentwicklung beschäftigt und schätze Ihre Innovationskultur sehr.","Guten Tag, ich freue mich über das Gespräch. Mein beruflicher Schwerpunkt lag stets auf kundenorientierten Lösungen und teamübergreifender Zusammenarbeit."],targetKeywords:["vielen dank","einladung","erfahrung","software","team","unternehmen","begeistert","schwerpunkt"]},{speaker:"Personalchef (Herr Weber)",avatar:"👔",aiSpeech:"Das klingt äußerst vielversprechend! Können Sie ein konkretes Beispiel für eine komplexe Herausforderung schildern, die Sie in einem früheren Projekt erfolgreich gemeistert haben?",suggestedResponses:["In einem früheren Projekt gerieten wir durch enge Deadlines unter Druck. Durch klare Priorisierung und offene Kommunikation konnten wir das Ziel termingerecht erreichen.","Bei einem unerwarteten Systemausfall habe ich sofort eine strukturierte Ursachenanalyse durchgeführt und gemeinsam mit dem Team eine dauerhafte Lösung umgesetzt."],targetKeywords:["projekt","herausforderung","kommunikation","team","ziel","lösung","erfolgreich","priorisierung"]},{speaker:"Personalchef (Herr Weber)",avatar:"👔",aiSpeech:"Ausgezeichnet gelöst! Bevor wir zum Ende unseres heutigen Gesprächs kommen: Haben Sie noch offene Fragen an mich bezüglich unseres Teams oder unserer Firmenphilosophie?",suggestedResponses:["Ja, sehr gerne! Wie sieht bei Ihnen ein typischer Arbeitstag aus und welche Weiterbildungsmöglichkeiten bieten Sie Ihren Mitarbeitern?","Mich würde brennend interessieren, wie Ihr Unternehmen den Wissensaustausch zwischen verschiedenen Abteilungen fördert."],targetKeywords:["ja","frage","weiterbildung","team","unternehmen","mitarbeiter","abteilungen"]}]},{id:"de_scenario_cafe",title:"Bestellung im traditionellen Café & Bäckerei",icon:"☕",context:"Bestellen Sie Heißgetränke und traditionelles Gebäck in einem lebhaften Café.",steps:[{speaker:"Barista (Jonas)",avatar:"☕",aiSpeech:"Guten Morgen und herzlich willkommen bei uns! Was darf ich Ihnen heute Schönes bringen?",suggestedResponses:["Guten Morgen! Ich hätte gerne einen Cappuccino mit Hafermilch und dazu ein frisches Buttercroissant, bitte.","Hallo! Für mich bitte eine große Tasse Filterkaffee und ein Stück Apfelstrudel mit Vanillesoße."],targetKeywords:["guten morgen","hätte gerne","cappuccino","kaffee","croissant","bitte","apfelstrudel"]},{speaker:"Barista (Jonas)",avatar:"☕",aiSpeech:"Sehr gerne! Möchten Sie Ihren Cappuccino gleich hier bei uns im Innenbereich genießen oder soll ich ihn zum Mitnehmen zubereiten?",suggestedResponses:["Ich trinke ihn gerne gleich hier am Fenstertisch, vielen Dank.","Zum Mitnehmen, bitte! Ich bin nämlich auf dem Sprung ins Büro."],targetKeywords:["hier","mitnehmen","fenstertisch","danke","büro","trinken"]},{speaker:"Barista (Jonas)",avatar:"☕",aiSpeech:"Wunderbar, kommt sofort! Das macht zusammen sieben Euro fünfzig. Zahlen Sie bar oder lieber mit Karte?",suggestedResponses:["Ich zahle gerne kontaktlos mit dem Smartphone, danke.","Ich zahle mit Karte, bitte. Könnten Sie mir auch eine Quittung ausstellen?"],targetKeywords:["karte","kontaktlos","smartphone","bar","quittung","danke"]}]},{id:"de_scenario_hotel",title:"Ankunft & Check-in im Hotel",icon:"🏨",context:"Sie checken in einem Hotel nach einer längeren Reise ein und erfragen nützliche Informationen.",steps:[{speaker:"Rezeptionistin (Elena)",avatar:"🏨",aiSpeech:"Guten Tag und herzlich willkommen im Grand Hotel! Wie kann ich Ihnen heute bei Ihrer Buchung behilflich sein?",suggestedResponses:["Guten Tag, ich habe ein Zimmer für drei Nächte auf den Namen Müller reserviert.","Hallo, ich möchte gerne einchecken. Hier sind meine Reservierungsbestätigung und mein Ausweis."],targetKeywords:["guten tag","zimmer","reserviert","name","einchecken","reservierungsbestätigung","ausweis"]},{speaker:"Rezeptionistin (Elena)",avatar:"🏨",aiSpeech:"Vielen Dank, ich habe Ihre Buchung im System gefunden. Bevorzugen Sie ein ruhiges Zimmer im oberen Stockwerk mit Blick auf den Stadtpark?",suggestedResponses:["Ein ruhiges Zimmer nach hinten raus im oberen Stockwerk wäre wirklich fantastisch, vielen Dank!","Ja bitte, eine ruhige Lage ist mir nach der weiten Anreise sehr wichtig."],targetKeywords:["ruhiges","zimmer","stockwerk","blick","fantastisch","danke","ruhe"]}]}],Ve={minimalPairs:[{contrast:"/ç/ (ich-Laut) vs /ʃ/ (sch-Laut)",tip:"Für den ich-Laut /ç/ berühren die Zungenränder die oberen Backenzähne und die Luft strömt flach hindurch (wie ein sanftes Fauchen). Für /ʃ/ runden und stülpen Sie die Lippen vor.",pairs:[{wordA:"Kirche",wordB:"Kirsche",exampleA:"Die alte Kirche.",exampleB:"Eine süße Kirsche."},{wordA:"dich",wordB:"Tisch",exampleA:"Ich sehe dich gern.",exampleB:"Setz dich an den Tisch."},{wordA:"Küche",wordB:"Kutsche",exampleA:"Kochen in der Küche.",exampleB:"Eine alte Kutsche."},{wordA:"mich",wordB:"Misch",exampleA:"Erinnere mich daran.",exampleB:"Misch die Karten gut."}]},{contrast:"/yː/ (langes ü) vs /uː/ (langes u)",tip:'Für /yː/ (ü) formen Sie mit der Zunge ein "i", spitzen aber die Lippen eng zu einem festen Kreis. Für /uː/ bleibt die Zunge hinten im Mundraum.',pairs:[{wordA:"fühlen",wordB:"faulen",exampleA:"Die Wärme fühlen.",exampleB:"Die Äpfel faulen."},{wordA:"Mühle",wordB:"Schule",exampleA:"Eine alte Mühle.",exampleB:"Kinder in der Schule."},{wordA:"drücken",wordB:"drucken",exampleA:"Die Daumen drücken.",exampleB:"Ein Dokument drucken."},{wordA:"Küsse",wordB:"Guss",exampleA:"Herzliche Küsse.",exampleB:"Regen in Strömen wie ein Guss."}]},{contrast:"/øː/ (langes ö) vs /oː/ (langes o)",tip:'Für /øː/ (ö) sprechen Sie ein langes deutsches "e", während Sie gleichzeitig die Lippen zu einem geschlossenen Oval runden.',pairs:[{wordA:"schön",wordB:"schon",exampleA:"Das ist wunderschön.",exampleB:"Bist du schon fertig?"},{wordA:"Söhne",wordB:"Sonne",exampleA:"Die beiden Söhne.",exampleB:"Die strahlende Sonne."},{wordA:"Öfen",wordB:"offen",exampleA:"Moderne Öfen heizen gut.",exampleB:"Das Fenster steht offen."},{wordA:"Höhle",wordB:"Hole",exampleA:"Eine dunkle Höhle.",exampleB:"Ich hole mein Buch."}]},{contrast:"Auslautverhärtung: d/t und b/p",tip:'Im Deutschen werden stimmhafte Konsonanten am Silben- oder Wortende stimmlos ausgesprochen: Ein "d" klingt am Wortende wie ein hartes "t".',pairs:[{wordA:"Rad",wordB:"Rat",exampleA:"Ein rollendes Rad.",exampleB:"Ein guter Rat."},{wordA:"Bund",wordB:"bunt",exampleA:"Der Bund fürs Leben.",exampleB:"Ein bunt gestaltetes Bild."},{wordA:"Lied",wordB:"liest",exampleA:"Ein melodisches Lied.",exampleB:"Sie liest ein Buch."},{wordA:"Tod",wordB:"tot",exampleA:"Der Tod im Mythos.",exampleB:"Der Akku ist tot."}]}],tongueTwisters:[{id:"de_twister_1",title:"Fischers Fritze",difficulty:"Mittel",targetSound:"Knackige Konsonantenkombinationen /f/, /ʃ/, /t͡s/",text:"Fischers Fritze fischt frische Fische, frische Fische fischt Fischers Fritze."},{id:"de_twister_2",title:"Brautkleid & Blaukraut",difficulty:"Schwer",targetSound:"Rasanter Wechsel zwischen /bʁ/ und /bl/",text:"Brautkleid bleibt Brautkleid und Blaukraut bleibt Blaukraut."},{id:"de_twister_3",title:"Zehn zahme Ziegen",difficulty:"Mittel",targetSound:"Deutscher Zischlaut /t͡s/ (Z)",text:"Zehn zahme Ziegen zogen zehn Zentner Zucker zum Zoo."},{id:"de_twister_4",title:"Fliegen & Fliegen",difficulty:"Experte",targetSound:"Wortspiel, Rhythmus und Tonhöhenvariation",text:"Wenn Fliegen hinter Fliegen fliegen, fliegen Fliegen Fliegen nach."},{id:"de_twister_5",title:"Der dicke Dachdecker",difficulty:"Experte",targetSound:"Plosive /d/ und Verschlusslaute /k/",text:"Der dicke Dachdecker deckt das dicke Dach, dann dachte der dicke Dachdecker, dass er das dicke Dach gedeckt hat."}]};class K{static tokenize(e){return e?e.trim().toLowerCase().replace(/[^\p{L}\p{N}\s']/gu," ").split(/\s+/).filter(t=>t.length>0):[]}static normalizeWord(e){return(e||"").toLowerCase().replace(/['’]/g,"").replace(/[^\p{L}\p{N}]/gu,"").trim()}static levenshtein(e,t){const i=[];for(let n=0;n<=t.length;n++)i[n]=[n];for(let n=0;n<=e.length;n++)i[0][n]=n;for(let n=1;n<=t.length;n++)for(let r=1;r<=e.length;r++)t.charAt(n-1)===e.charAt(r-1)?i[n][r]=i[n-1][r-1]:i[n][r]=Math.min(i[n-1][r-1]+1,i[n][r-1]+1,i[n-1][r]+1);return i[t.length][e.length]}static wordSimilarity(e,t){const i=this.normalizeWord(e),n=this.normalizeWord(t);if(!i&&!n)return 1;if(!i||!n)return 0;if(i===n)return 1;const r=Math.max(i.length,n.length),s=this.levenshtein(i,n);return Math.max(0,1-s/r)}static alignTokens(e,t){const i=e.length,n=t.length;if(i===0)return[];if(n===0)return e.map(h=>({word:h,status:"missing",similarity:0,spoken:null}));const r=Array.from({length:i+1},()=>new Float32Array(n+1)),s=Array.from({length:i+1},()=>new Array(n+1));for(let h=0;h<=i;h++)r[h][0]=h*1,s[h][0]="del";for(let h=0;h<=n;h++)r[0][h]=h*.8,s[0][h]="ins";s[0][0]="start";for(let h=1;h<=i;h++)for(let p=1;p<=n;p++){const v=1-this.wordSimilarity(e[h-1],t[p-1]),L=r[h-1][p-1]+v,$=r[h-1][p]+1,w=r[h][p-1]+.8;L<=$&&L<=w?(r[h][p]=L,s[h][p]="match"):$<=w?(r[h][p]=$,s[h][p]="del"):(r[h][p]=w,s[h][p]="ins")}let o=i,c=n;const d=[];for(;o>0||c>0;){const h=s[o][c];if(h==="match"){const p=e[o-1],z=t[c-1],v=this.wordSimilarity(p,z);let L="correct";v<.65?L="incorrect":v<.85&&(L="hesitant"),d.push({word:p,status:L,similarity:Math.round(v*100),spoken:z}),o--,c--}else if(h==="del")d.push({word:e[o-1],status:"missing",similarity:0,spoken:null}),o--;else if(h==="ins")d.push({word:t[c-1],status:"extra",similarity:0,spoken:t[c-1]}),c--;else break}return d.reverse()}static evaluateSpeech({referenceText:e,spokenText:t,durationSec:i=1}){const n=e.trim().split(/\s+/).filter(Boolean),r=n.map(M=>this.normalizeWord(M)),s=this.tokenize(t),o=this.alignTokens(r,s);let c=0;const d=[];let h=0,p=0,z=0;for(const M of o)if(M.status!=="extra"){const V=n[c]||M.word;M.status==="correct"?h++:M.status==="hesitant"?p++:M.status==="missing"&&z++,d.push({displayWord:V,rawWord:M.word,status:M.status,similarity:M.similarity,spoken:M.spoken}),c++}const v=n.length||1,L=h*1+p*.6,$=Math.min(100,Math.round(L/v*100)),w=Math.min(100,Math.round((v-z)/v*100)),P=i>0?Math.round(s.length/i*60):0;return{accuracy:$,completeness:w,wordsPerMinute:P,correctCount:h,hesitantCount:p,missingCount:z,totalWords:v,words:d,rawSpoken:t}}static diffDictation(e,t){const i=e.trim().split(/\s+/).filter(Boolean),n=t.trim().split(/\s+/).filter(Boolean),r=i.map(v=>this.normalizeWord(v)),s=n.map(v=>this.normalizeWord(v)),o=this.alignTokens(r,s);let c=0,d=0;const h=[];for(const v of o)if(v.status==="extra")h.push({type:"extra",word:v.word,expected:null});else{const L=i[d]||v.word;v.status==="correct"?(c++,h.push({type:"correct",word:L,userInput:v.spoken})):v.status==="hesitant"||v.status==="incorrect"?h.push({type:"mismatch",word:L,userInput:v.spoken}):h.push({type:"missing",word:L,userInput:null}),d++}const p=Math.min(100,Math.round(c/Math.max(1,i.length)*100)),z=p===100&&n.length===i.length;return{accuracy:p,isExact:z,diff:h,expected:e,submitted:t}}}var Y={};(function D(e,t,i,n){var r=!!(e.Worker&&e.Blob&&e.Promise&&e.OffscreenCanvas&&e.OffscreenCanvasRenderingContext2D&&e.HTMLCanvasElement&&e.HTMLCanvasElement.prototype.transferControlToOffscreen&&e.URL&&e.URL.createObjectURL),s=typeof Path2D=="function"&&typeof DOMMatrix=="function",o=function(){if(!e.OffscreenCanvas)return!1;try{var l=new OffscreenCanvas(1,1),a=l.getContext("2d");a.fillRect(0,0,1,1);var g=l.transferToImageBitmap();a.createPattern(g,"no-repeat")}catch{return!1}return!0}();function c(){}function d(l){var a=t.exports.Promise,g=a!==void 0?a:e.Promise;return typeof g=="function"?new g(l):(l(c,c),null)}var h=function(l,a){return{transform:function(g){if(l)return g;if(a.has(g))return a.get(g);var f=new OffscreenCanvas(g.width,g.height),b=f.getContext("2d");return b.drawImage(g,0,0),a.set(g,f),f},clear:function(){a.clear()}}}(o,new Map),p=function(){var l=Math.floor(16.666666666666668),a,g,f={},b=0;return typeof requestAnimationFrame=="function"&&typeof cancelAnimationFrame=="function"?(a=function(y){var x=Math.random();return f[x]=requestAnimationFrame(function m(S){b===S||b+l-1<S?(b=S,delete f[x],y()):f[x]=requestAnimationFrame(m)}),x},g=function(y){f[y]&&cancelAnimationFrame(f[y])}):(a=function(y){return setTimeout(y,l)},g=function(y){return clearTimeout(y)}),{frame:a,cancel:g}}(),z=function(){var l,a,g={};function f(b){function y(x,m){b.postMessage({options:x||{},callback:m})}b.init=function(m){var S=m.transferControlToOffscreen();b.postMessage({canvas:S},[S])},b.fire=function(m,S,C){if(a)return y(m,null),a;var B=Math.random().toString(36).slice(2);return a=d(function(I){function E(R){R.data.callback===B&&(delete g[B],b.removeEventListener("message",E),a=null,h.clear(),C(),I())}b.addEventListener("message",E),y(m,B),g[B]=E.bind(null,{data:{callback:B}})}),a},b.reset=function(){b.postMessage({reset:!0});for(var m in g)g[m](),delete g[m]}}return function(){if(l)return l;if(!i&&r){var b=["var CONFETTI, SIZE = {}, module = {};","("+D.toString()+")(this, module, true, SIZE);","onmessage = function(msg) {","  if (msg.data.options) {","    CONFETTI(msg.data.options).then(function () {","      if (msg.data.callback) {","        postMessage({ callback: msg.data.callback });","      }","    });","  } else if (msg.data.reset) {","    CONFETTI && CONFETTI.reset();","  } else if (msg.data.resize) {","    SIZE.width = msg.data.resize.width;","    SIZE.height = msg.data.resize.height;","  } else if (msg.data.canvas) {","    SIZE.width = msg.data.canvas.width;","    SIZE.height = msg.data.canvas.height;","    CONFETTI = module.exports.create(msg.data.canvas);","  }","}"].join(`
`);try{l=new Worker(URL.createObjectURL(new Blob([b])))}catch(y){return typeof console<"u"&&typeof console.warn=="function"&&console.warn("🎊 Could not load worker",y),null}f(l)}return l}}(),v={particleCount:50,angle:90,spread:45,startVelocity:45,decay:.9,gravity:1,drift:0,ticks:200,x:.5,y:.5,shapes:["square","circle"],zIndex:100,colors:["#26ccff","#a25afd","#ff5e7e","#88ff5a","#fcff42","#ffa62d","#ff36ff"],disableForReducedMotion:!1,scalar:1};function L(l,a){return a?a(l):l}function $(l){return l!=null}function w(l,a,g){return L(l&&$(l[a])?l[a]:v[a],g)}function P(l){return l<0?0:Math.floor(l)}function M(l,a){return Math.floor(Math.random()*(a-l))+l}function V(l){return parseInt(l,16)}function O(l){return l.map(oe)}function oe(l){var a=String(l).replace(/[^0-9a-f]/gi,"");return a.length<6&&(a=a[0]+a[0]+a[1]+a[1]+a[2]+a[2]),{r:V(a.substring(0,2)),g:V(a.substring(2,4)),b:V(a.substring(4,6))}}function le(l){var a=w(l,"origin",Object);return a.x=w(a,"x",Number),a.y=w(a,"y",Number),a}function ce(l){l.width=document.documentElement.clientWidth,l.height=document.documentElement.clientHeight}function de(l){var a=l.getBoundingClientRect();l.width=a.width,l.height=a.height}function he(l){var a=document.createElement("canvas");return a.style.position="fixed",a.style.top="0px",a.style.left="0px",a.style.pointerEvents="none",a.style.zIndex=l,a}function ue(l,a,g,f,b,y,x,m,S){l.save(),l.translate(a,g),l.rotate(y),l.scale(f,b),l.arc(0,0,1,x,m,S),l.restore()}function pe(l){var a=l.angle*(Math.PI/180),g=l.spread*(Math.PI/180);return{x:l.x,y:l.y,wobble:Math.random()*10,wobbleSpeed:Math.min(.11,Math.random()*.1+.05),velocity:l.startVelocity*.5+Math.random()*l.startVelocity,angle2D:-a+(.5*g-Math.random()*g),tiltAngle:(Math.random()*(.75-.25)+.25)*Math.PI,color:l.color,shape:l.shape,tick:0,totalTicks:l.ticks,decay:l.decay,drift:l.drift,random:Math.random()+2,tiltSin:0,tiltCos:0,wobbleX:0,wobbleY:0,gravity:l.gravity*3,ovalScalar:.6,scalar:l.scalar,flat:l.flat}}function ge(l,a){a.x+=Math.cos(a.angle2D)*a.velocity+a.drift,a.y+=Math.sin(a.angle2D)*a.velocity+a.gravity,a.velocity*=a.decay,a.flat?(a.wobble=0,a.wobbleX=a.x+10*a.scalar,a.wobbleY=a.y+10*a.scalar,a.tiltSin=0,a.tiltCos=0,a.random=1):(a.wobble+=a.wobbleSpeed,a.wobbleX=a.x+10*a.scalar*Math.cos(a.wobble),a.wobbleY=a.y+10*a.scalar*Math.sin(a.wobble),a.tiltAngle+=.1,a.tiltSin=Math.sin(a.tiltAngle),a.tiltCos=Math.cos(a.tiltAngle),a.random=Math.random()+2);var g=a.tick++/a.totalTicks,f=a.x+a.random*a.tiltCos,b=a.y+a.random*a.tiltSin,y=a.wobbleX+a.random*a.tiltCos,x=a.wobbleY+a.random*a.tiltSin;if(l.fillStyle="rgba("+a.color.r+", "+a.color.g+", "+a.color.b+", "+(1-g)+")",l.beginPath(),s&&a.shape.type==="path"&&typeof a.shape.path=="string"&&Array.isArray(a.shape.matrix))l.fill(fe(a.shape.path,a.shape.matrix,a.x,a.y,Math.abs(y-f)*.1,Math.abs(x-b)*.1,Math.PI/10*a.wobble));else if(a.shape.type==="bitmap"){var m=Math.PI/10*a.wobble,S=Math.abs(y-f)*.1,C=Math.abs(x-b)*.1,B=a.shape.bitmap.width*a.scalar,I=a.shape.bitmap.height*a.scalar,E=new DOMMatrix([Math.cos(m)*S,Math.sin(m)*S,-Math.sin(m)*C,Math.cos(m)*C,a.x,a.y]);E.multiplySelf(new DOMMatrix(a.shape.matrix));var R=l.createPattern(h.transform(a.shape.bitmap),"no-repeat");R.setTransform(E),l.globalAlpha=1-g,l.fillStyle=R,l.fillRect(a.x-B/2,a.y-I/2,B,I),l.globalAlpha=1}else if(a.shape==="circle")l.ellipse?l.ellipse(a.x,a.y,Math.abs(y-f)*a.ovalScalar,Math.abs(x-b)*a.ovalScalar,Math.PI/10*a.wobble,0,2*Math.PI):ue(l,a.x,a.y,Math.abs(y-f)*a.ovalScalar,Math.abs(x-b)*a.ovalScalar,Math.PI/10*a.wobble,0,2*Math.PI);else if(a.shape==="star")for(var k=Math.PI/2*3,q=4*a.scalar,N=8*a.scalar,H=a.x,_=a.y,G=5,F=Math.PI/G;G--;)H=a.x+Math.cos(k)*N,_=a.y+Math.sin(k)*N,l.lineTo(H,_),k+=F,H=a.x+Math.cos(k)*q,_=a.y+Math.sin(k)*q,l.lineTo(H,_),k+=F;else l.moveTo(Math.floor(a.x),Math.floor(a.y)),l.lineTo(Math.floor(a.wobbleX),Math.floor(b)),l.lineTo(Math.floor(y),Math.floor(x)),l.lineTo(Math.floor(f),Math.floor(a.wobbleY));return l.closePath(),l.fill(),a.tick<a.totalTicks}function me(l,a,g,f,b){var y=a.slice(),x=l.getContext("2d"),m,S,C=d(function(B){function I(){m=S=null,x.clearRect(0,0,f.width,f.height),h.clear(),b(),B()}function E(){i&&!(f.width===n.width&&f.height===n.height)&&(f.width=l.width=n.width,f.height=l.height=n.height),!f.width&&!f.height&&(g(l),f.width=l.width,f.height=l.height),x.clearRect(0,0,f.width,f.height),y=y.filter(function(R){return ge(x,R)}),y.length?m=p.frame(E):I()}m=p.frame(E),S=I});return{addFettis:function(B){return y=y.concat(B),C},canvas:l,promise:C,reset:function(){m&&p.cancel(m),S&&S()}}}function X(l,a){var g=!l,f=!!w(a||{},"resize"),b=!1,y=w(a,"disableForReducedMotion",Boolean),x=r&&!!w(a||{},"useWorker"),m=x?z():null,S=g?ce:de,C=l&&m?!!l.__confetti_initialized:!1,B=typeof matchMedia=="function"&&matchMedia("(prefers-reduced-motion)").matches,I;function E(k,q,N){for(var H=w(k,"particleCount",P),_=w(k,"angle",Number),G=w(k,"spread",Number),F=w(k,"startVelocity",Number),ye=w(k,"decay",Number),we=w(k,"gravity",Number),xe=w(k,"drift",Number),te=w(k,"colors",O),Se=w(k,"ticks",Number),ne=w(k,"shapes"),ke=w(k,"scalar"),Le=!!w(k,"flat"),ie=le(k),re=H,J=[],Te=l.width*ie.x,Ae=l.height*ie.y;re--;)J.push(pe({x:Te,y:Ae,angle:_,spread:G,startVelocity:F,color:te[re%te.length],shape:ne[M(0,ne.length)],ticks:Se,decay:ye,gravity:we,drift:xe,scalar:ke,flat:Le}));return I?I.addFettis(J):(I=me(l,J,S,q,N),I.promise)}function R(k){var q=y||w(k,"disableForReducedMotion",Boolean),N=w(k,"zIndex",Number);if(q&&B)return d(function(F){F()});g&&I?l=I.canvas:g&&!l&&(l=he(N),document.body.appendChild(l)),f&&!C&&S(l);var H={width:l.width,height:l.height};m&&!C&&m.init(l),C=!0,m&&(l.__confetti_initialized=!0);function _(){if(m){var F={getBoundingClientRect:function(){if(!g)return l.getBoundingClientRect()}};S(F),m.postMessage({resize:{width:F.width,height:F.height}});return}H.width=H.height=null}function G(){I=null,f&&(b=!1,e.removeEventListener("resize",_)),g&&l&&(document.body.contains(l)&&document.body.removeChild(l),l=null,C=!1)}return f&&!b&&(b=!0,e.addEventListener("resize",_,!1)),m?m.fire(k,H,G):E(k,H,G)}return R.reset=function(){m&&m.reset(),I&&I.reset()},R}var Q;function ee(){return Q||(Q=X(null,{useWorker:!0,resize:!0})),Q}function fe(l,a,g,f,b,y,x){var m=new Path2D(l),S=new Path2D;S.addPath(m,new DOMMatrix(a));var C=new Path2D;return C.addPath(S,new DOMMatrix([Math.cos(x)*b,Math.sin(x)*b,-Math.sin(x)*y,Math.cos(x)*y,g,f])),C}function ve(l){if(!s)throw new Error("path confetti are not supported in this browser");var a,g;typeof l=="string"?a=l:(a=l.path,g=l.matrix);var f=new Path2D(a),b=document.createElement("canvas"),y=b.getContext("2d");if(!g){for(var x=1e3,m=x,S=x,C=0,B=0,I,E,R=0;R<x;R+=2)for(var k=0;k<x;k+=2)y.isPointInPath(f,R,k,"nonzero")&&(m=Math.min(m,R),S=Math.min(S,k),C=Math.max(C,R),B=Math.max(B,k));I=C-m,E=B-S;var q=10,N=Math.min(q/I,q/E);g=[N,0,0,N,-Math.round(I/2+m)*N,-Math.round(E/2+S)*N]}return{type:"path",path:a,matrix:g}}function be(l){var a,g=1,f="#000000",b='"Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji", "EmojiOne Color", "Android Emoji", "Twemoji Mozilla", "system emoji", sans-serif';typeof l=="string"?a=l:(a=l.text,g="scalar"in l?l.scalar:g,b="fontFamily"in l?l.fontFamily:b,f="color"in l?l.color:f);var y=10*g,x=""+y+"px "+b,m=new OffscreenCanvas(y,y),S=m.getContext("2d");S.font=x;var C=S.measureText(a),B=Math.ceil(C.actualBoundingBoxRight+C.actualBoundingBoxLeft),I=Math.ceil(C.actualBoundingBoxAscent+C.actualBoundingBoxDescent),E=2,R=C.actualBoundingBoxLeft+E,k=C.actualBoundingBoxAscent+E;B+=E+E,I+=E+E,m=new OffscreenCanvas(B,I),S=m.getContext("2d"),S.font=x,S.fillStyle=f,S.fillText(a,R,k);var q=1/g;return{type:"bitmap",bitmap:m.transferToImageBitmap(),matrix:[q,0,0,q,-B*q/2,-I*q/2]}}t.exports=function(){return ee().apply(this,arguments)},t.exports.reset=function(){ee().reset()},t.exports.create=X,t.exports.shapeFromPath=ve,t.exports.shapeFromText=be})(function(){return typeof window<"u"?window:typeof self<"u"?self:this||{}}(),Y,!1);const U=Y.exports;Y.exports.create;class Ne{constructor(e){this.container=e,this.currentLang=A.getLanguage(),this.loadLessons(),this.speechRate=1,this.isRecording=!1,this.recordStartTime=null,this.spokenTranscript="",this.selectedWordInfo=null,this.render(),this.bindEvents()}loadLessons(){const e=this.currentLang==="de"?De:Be,t=A.getCustomTexts().filter(i=>!i.lang||i.lang===this.currentLang);this.lessons=[...e,...t],this.currentLesson=this.lessons[0]||e[0]}setLanguage(e){this.currentLang=e,this.loadLessons(),this.selectedWordInfo=null,this.spokenTranscript="",this.render(),this.bindEvents()}refreshCustomLessons(){this.loadLessons(),this.updateLessonDropdown()}render(){const e=this.currentLang==="de";this.container.innerHTML=`
      <div class="section-header">
        <div class="section-title-wrap">
          <h2 class="section-title">${e?"Lesen & Laut Sprechen Studio":"Read & Speak Aloud Studio"}</h2>
          <p class="section-subtitle">${e?"Mit nativer Aussprache mitlesen, Sprechgenauigkeit erfassen und Sprachgewandtheit aufbauen.":"Read along with native pronunciation, track speech accuracy, and build vocal fluency."}</p>
        </div>
        <div class="section-actions">
          <select id="lessonSelect" class="btn btn-secondary btn-sm" style="background: rgba(20,28,48,0.9); color: white;">
            ${this.getLessonOptionsHtml()}
          </select>
          <button id="openImportModalBtn" class="btn btn-secondary btn-sm">
            <span>${e?"+ Eigenen Text importieren":"+ Import Custom Text"}</span>
          </button>
        </div>
      </div>

      <div class="studio-grid">
        <!-- Main Practice Column -->
        <div class="practice-card glass-panel">
          <div class="card-header-bar">
            <div class="lesson-meta">
              <span class="badge badge-level" id="lessonLevelBadge">${this.currentLesson.level}</span>
              <span class="badge badge-cat" id="lessonCatBadge">${this.currentLesson.category}</span>
              <span style="font-size: 13px; color: var(--text-dim);" id="wordCountBadge">${this.getWordCount()} ${e?"Wörter":"words"}</span>
            </div>
            <div class="speed-slider-wrap">
              <label for="readSpeedSlider">${e?"Coach-Tempo:":"Coach Speed:"}</label>
              <input type="range" id="readSpeedSlider" min="0.6" max="1.3" step="0.1" value="1.0">
              <span id="speedValueLabel">1.0x</span>
            </div>
          </div>

          <h3 id="lessonTitle" style="font-size: 20px; font-weight: 700; color: #fff;">${this.currentLesson.title}</h3>

          <!-- Text Viewport with individual word spans -->
          <div class="reading-text-viewport" id="readingTextViewport">
            ${this.buildWordSpans(this.currentLesson.text)}
          </div>

          <!-- Spoken transcription interim feedback -->
          <div class="live-speech-feedback" id="liveSpeechFeedback">
            <div class="spoken-indicator"></div>
            <span class="spoken-text" id="interimTranscriptText">${e?'Klicken Sie auf "Sprechen starten" und lesen Sie laut vor...':'Click "Start Speaking" and read the text aloud clearly...'}</span>
          </div>

          <!-- Waveform Canvas -->
          <canvas id="readWaveformCanvas" class="waveform-canvas" width="600" height="60"></canvas>

          <!-- Control Bar -->
          <div class="control-bar">
            <div class="playback-controls">
              <button id="listenCoachBtn" class="btn btn-accent">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>
                <span id="listenCoachBtnText">${e?"Coach anhören":"Listen to Coach"}</span>
              </button>
              <button id="resetReadBtn" class="btn btn-secondary btn-sm" title="Clear highlights">
                ${e?"Zurücksetzen":"Reset"}
              </button>
            </div>

            <button id="micRecordBtn" class="mic-action-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>
              <span id="micRecordBtnText">${e?"Sprechen starten":"Start Speaking"}</span>
            </button>
          </div>
        </div>

        <!-- Right Evaluation & Word Inspector Column -->
        <div style="display: flex; flex-direction: column; gap: 20px;">
          <!-- Evaluation Score Card -->
          <div class="score-card glass-panel" id="scorePanel">
            <h4 style="font-size: 16px; font-weight: 700; color: #fff;">${e?"Aussprache-Auswertung":"Speech Pronunciation"}</h4>
            <div class="score-hero">
              <div class="score-circle" id="scoreCircle" style="--score-angle: 0deg;">
                <div class="score-number" id="scoreNumber">--</div>
              </div>
              <div class="score-grade" id="scoreGrade">${e?"Bereit zum Üben":"Ready to Practice"}</div>
              <div style="font-size: 13px; color: var(--text-muted);" id="scoreFeedback">${e?"Lesen Sie den Text laut vor für Ihre KI-Ausspracheauswertung.":"Read the text aloud to receive your AI speech assessment."}</div>
            </div>

            <div class="score-breakdown-grid">
              <div class="metric-item">
                <span class="metric-label">${e?"Sprechtempo":"Fluency Rate"}</span>
                <span class="metric-val" id="metricWpm">-- WPM</span>
              </div>
              <div class="metric-item">
                <span class="metric-label">${e?"Vollständigkeit":"Completeness"}</span>
                <span class="metric-val" id="metricCompleteness">-- %</span>
              </div>
              <div class="metric-item">
                <span class="metric-label">${e?"Korrekte Wörter":"Accurate Words"}</span>
                <span class="metric-val" style="color: #34d399;" id="metricCorrect">--</span>
              </div>
              <div class="metric-item">
                <span class="metric-label">${e?"Verbesserungswürdig":"Need Polish"}</span>
                <span class="metric-val" style="color: #fbbf24;" id="metricHesitant">--</span>
              </div>
            </div>
          </div>

          <!-- Word Inspector / Vocabulary Card -->
          <div class="glass-panel" style="padding: 20px;" id="wordInspectorPanel">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
              <h4 style="font-size: 15px; font-weight: 700; color: #fff;">${e?"Wort-Inspektor":"Word Inspector"}</h4>
              <span style="font-size: 12px; color: var(--text-dim);">${e?"Klicken Sie auf ein Wort":"Click any word in text"}</span>
            </div>
            <div id="inspectorContent" style="color: var(--text-muted); font-size: 13px;">
              ${e?"Klicken Sie oben auf ein beliebiges Wort, um die Aussprache isoliert zu hören, IPA-Lautschrift anzuzeigen und es im Wortschatz-Tresor zu speichern.":"Click any word above to hear isolated pronunciation, inspect phonetic IPA, and save it to your Vocabulary Vault."}
            </div>
          </div>
        </div>
      </div>
    `}getLessonOptionsHtml(){return this.lessons.map(e=>`
      <option value="${e.id}" ${e.id===this.currentLesson.id?"selected":""}>
        ${e.level.split(" - ")[0]} - ${e.title}
      </option>
    `).join("")}updateLessonDropdown(){const e=this.container.querySelector("#lessonSelect");e&&(e.innerHTML=this.getLessonOptionsHtml())}getWordCount(){return this.currentLesson.text.trim().split(/\s+/).length}buildWordSpans(e){return e.trim().split(/\s+/).map((i,n)=>`<span class="word-token" data-index="${n}" data-word="${i}">${i}</span>`).join(" ")}bindEvents(){this.container.querySelector("#lessonSelect").addEventListener("change",d=>{this.switchLesson(d.target.value)});const t=this.container.querySelector("#readSpeedSlider"),i=this.container.querySelector("#speedValueLabel");t.addEventListener("input",d=>{this.speechRate=parseFloat(d.target.value),i.textContent=`${this.speechRate.toFixed(1)}x`}),this.container.querySelector("#listenCoachBtn").addEventListener("click",()=>{this.toggleListenCoach()}),this.container.querySelector("#resetReadBtn").addEventListener("click",()=>{this.resetHighlights()}),this.container.querySelector("#micRecordBtn").addEventListener("click",()=>{this.toggleSpeaking()}),this.container.querySelector("#readingTextViewport").addEventListener("click",d=>{const h=d.target.closest(".word-token");if(h){const p=h.dataset.word.replace(/[^\p{L}\p{N}]/gu,"");this.inspectWord(p)}}),this.container.querySelector("#openImportModalBtn").addEventListener("click",()=>{const d=document.querySelector("#customTextModal");d&&d.classList.add("open")})}switchLesson(e){u.stopSpeaking(),u.stopListening();const t=this.lessons.find(n=>n.id===e);if(!t)return;const i=this.currentLang==="de";this.currentLesson=t,this.container.querySelector("#lessonLevelBadge").textContent=t.level,this.container.querySelector("#lessonCatBadge").textContent=t.category,this.container.querySelector("#lessonTitle").textContent=t.title,this.container.querySelector("#wordCountBadge").textContent=`${this.getWordCount()} ${i?"Wörter":"words"}`,this.container.querySelector("#readingTextViewport").innerHTML=this.buildWordSpans(t.text),this.resetHighlights()}resetHighlights(){u.stopSpeaking();const e=this.currentLang==="de";this.container.querySelectorAll(".word-token").forEach(i=>{i.className="word-token"}),this.container.querySelector("#interimTranscriptText").textContent=e?'Klicken Sie auf "Sprechen starten" und lesen Sie laut vor...':'Click "Start Speaking" and read the text aloud clearly...',this.updateScoreView({accuracy:null,wpm:null,completeness:null,correct:0,hesitant:0})}toggleListenCoach(){const e=this.currentLang==="de",t=this.container.querySelector("#listenCoachBtnText");if(u.isSpeaking()){u.stopSpeaking(),t.textContent=e?"Coach anhören":"Listen to Coach",this.container.querySelectorAll(".word-token").forEach(r=>r.classList.remove("speaking-active"));return}this.resetHighlights(),t.textContent=e?"Audio stoppen":"Stop Listening";const i=Array.from(this.container.querySelectorAll(".word-token"));let n=0;u.speak({text:this.currentLesson.text,rate:this.speechRate,onBoundary:r=>{r.name==="word"&&(i.forEach(s=>s.classList.remove("speaking-active")),i[n]&&(i[n].classList.add("speaking-active"),n++))},onEnd:()=>{t.textContent=e?"Coach anhören":"Listen to Coach",i.forEach(r=>r.classList.remove("speaking-active"))},onError:()=>{t.textContent=e?"Coach anhören":"Listen to Coach",i.forEach(r=>r.classList.remove("speaking-active"))}})}async toggleSpeaking(){const e=this.currentLang==="de",t=this.container.querySelector("#micRecordBtn"),i=this.container.querySelector("#micRecordBtnText"),n=this.container.querySelector("#interimTranscriptText"),r=this.container.querySelector("#readWaveformCanvas");if(this.isRecording){this.isRecording=!1,t.classList.remove("recording"),i.textContent=e?"Sprechen starten":"Start Speaking",u.stopListening(),await T.stopRecording(),this.spokenTranscript&&this.spokenTranscript.trim().length>0?this.finishEvaluation(this.spokenTranscript):n.textContent=e?"Aufnahme beendet. Keine Sprache erfasst.":"Recording stopped. No speech captured.";return}u.stopSpeaking(),this.resetHighlights(),this.isRecording=!0,this.recordStartTime=Date.now(),this.spokenTranscript="",t.classList.add("recording"),i.textContent=e?"Stoppen & Auswerten":"Stop & Evaluate",n.textContent=e?"Höre zu... Jetzt sprechen.":"Listening... Speak now.";try{await T.startRecording(r)}catch{alert(e?"Mikrofonzugriff ist erforderlich, um Ihre Sprache zu analysieren. Bitte erlauben Sie den Zugriff im Browser.":"Microphone access is required to analyze speaking. Please allow mic permission in your browser."),this.isRecording=!1,t.classList.remove("recording"),i.textContent=e?"Sprechen starten":"Start Speaking";return}u.startListening({lang:u.getDefaultRecognitionLang(),continuous:!0,interimResults:!0,onInterim:({full:s})=>{this.spokenTranscript=s,n.textContent=s||(e?"Höre zu... Bitte deutlich sprechen.":"Listening... Speak clearly.")},onResult:s=>{const o=s||this.spokenTranscript;o&&o.trim().length>0&&this.finishEvaluation(o)},onError:s=>{console.warn("Speech recognition error:",s),this.isRecording&&(this.spokenTranscript&&this.spokenTranscript.trim().length>3?this.finishEvaluation(this.spokenTranscript):(this.isRecording=!1,t.classList.remove("recording"),i.textContent=e?"Sprechen starten":"Start Speaking",T.stopRecording(),n.textContent=e?'Keine Sprache erkannt oder Mikrofon unterbrochen. Bitte erneut auf "Sprechen starten" tippen.':'No speech caught or microphone interrupted. Please tap "Start Speaking" again.'))}})}finishEvaluation(e){const t=this.currentLang==="de";this.isRecording=!1;const i=this.container.querySelector("#micRecordBtn"),n=this.container.querySelector("#micRecordBtnText");i.classList.remove("recording"),n.textContent=t?"Sprechen starten":"Start Speaking";const r=Math.max(1,(Date.now()-(this.recordStartTime||Date.now()))/1e3),s=K.evaluateSpeech({referenceText:this.currentLesson.text,spokenText:e||"",durationSec:r}),o=this.container.querySelectorAll(".word-token");s.words.forEach((c,d)=>{o[d]&&(o[d].className=`word-token status-${c.status}`,o[d].title=`${t?"Gesprochen":"Spoken"}: "${c.spoken||(t?"ausgelassen":"omitted")}" (${c.similarity}% Match)`)}),this.updateScoreView({accuracy:s.accuracy,wpm:s.wordsPerMinute,completeness:s.completeness,correct:s.correctCount,hesitant:s.hesitantCount}),A.recordActivity({words:s.correctCount,minutes:Math.ceil(r/60),accuracy:s.accuracy}),s.accuracy>=85?(T.playChime("success"),U({particleCount:80,spread:60,origin:{y:.6}})):T.playChime("tap")}updateScoreView({accuracy:e,wpm:t,completeness:i,correct:n,hesitant:r}){const s=this.currentLang==="de",o=this.container.querySelector("#scoreCircle"),c=this.container.querySelector("#scoreNumber"),d=this.container.querySelector("#scoreGrade"),h=this.container.querySelector("#scoreFeedback"),p=this.container.querySelector("#metricWpm"),z=this.container.querySelector("#metricCompleteness"),v=this.container.querySelector("#metricCorrect"),L=this.container.querySelector("#metricHesitant");if(e===null){o.style.setProperty("--score-angle","0deg"),c.textContent="--",d.textContent=s?"Bereit zum Üben":"Ready to Practice",h.textContent=s?"Lesen Sie den Text laut vor für Ihre KI-Ausspracheauswertung.":"Read the text aloud to receive your AI speech assessment.",p.textContent="-- WPM",z.textContent="-- %",v.textContent="--",L.textContent="--";return}const $=e/100*360;o.style.setProperty("--score-angle",`${$}deg`),c.textContent=`${e}%`;let w=s?"Übung erforderlich":"Needs Practice",P=s?"Lesen Sie mit gleichmäßigem Tempo und sprechen Sie Konsonanten deutlich aus.":"Try reading at a steady pace and pronouncing each consonant clearly.";e>=90?(w=s?"🌟 Native Aussprache!":"🌟 Native-Like Fluency!",P=s?"Hervorragende Artikulation, Satzmelodie und Klarheit.":"Exceptional pronunciation, cadence, and word clarity."):e>=75?(w=s?"👍 Sehr guter Sprachfluss!":"👍 Great Flow!",P=s?"Starke Aussprache. Achten Sie auf die hervorgehobenen Wörter.":"Solid pronunciation. Focus on the underlined words to reach 90%+."):e>=55&&(w=s?"Guter Versuch":"Good Effort",P=s?"Hören Sie den Coach bei 0.8x Tempo an und sprechen Sie synchron mit.":"Listen to the Coach once at 0.8x speed, then shadow along."),d.textContent=w,h.textContent=P,p.textContent=`${t} WPM`,z.textContent=`${i}%`,v.textContent=`${n}`,L.textContent=`${r}`}inspectWord(e){const t=this.currentLang==="de",i=e.toLowerCase(),r=(this.currentLesson.vocabulary||[]).find(p=>p.word.toLowerCase()===i),s=r?r.ipa:"",o=r?r.def:t?"Lesen und artikulieren Sie dieses Wort laut und präzise.":"Practice reading and articulating this word clearly.",c=A.isWordSaved(i),d=this.container.querySelector("#inspectorContent");d.innerHTML=`
      <div class="inspector-card">
        <div class="inspector-header">
          <div>
            <div class="inspector-word">${e}</div>
            <div class="inspector-ipa">${s||(t?"IPA im Tresor verfügbar":"IPA available in vault")}</div>
          </div>
          <button id="inspectAudioBtn" class="btn btn-accent btn-sm" title="Aussprache anhören">
            ${t?"🔊 Anhören":"🔊 Listen"}
          </button>
        </div>
        <p style="font-size: 13px; color: #cbd5e1;">${o}</p>
        <div style="display: flex; gap: 8px; margin-top: 6px;">
          <button id="saveWordVaultBtn" class="btn ${c?"btn-secondary":"btn-primary"} btn-sm">
            ${c?t?"✓ Im Tresor gespeichert":"✓ Saved in Vault":t?"+ Im Tresor speichern":"+ Save to Vault"}
          </button>
        </div>
      </div>
    `,d.querySelector("#inspectAudioBtn").addEventListener("click",()=>{u.speak({text:e,rate:.85})});const h=d.querySelector("#saveWordVaultBtn");h.addEventListener("click",()=>{A.saveToVault({word:e,ipa:s,def:o,example:`${t?"Aus":"From"} "${this.currentLesson.title}"`}),h.textContent=t?"✓ Im Tresor gespeichert":"✓ Saved in Vault",h.classList.replace("btn-primary","btn-secondary"),T.playChime("tap")}),u.speak({text:e,rate:.9})}}class He{constructor(e){this.container=e,this.currentLang=A.getLanguage(),this.loadLessons(),this.currentLessonIdx=0,this.currentSentenceIdx=0,this.isRecording=!1,this.userAudioUrl=null,this.render(),this.bindEvents()}loadLessons(){this.lessons=this.currentLang==="de"?Pe:Ee}setLanguage(e){this.currentLang=e,this.loadLessons(),this.currentLessonIdx=0,this.currentSentenceIdx=0,this.userAudioUrl=null,this.render(),this.bindEvents()}getCurrentLesson(){return this.lessons[this.currentLessonIdx]}getCurrentSentence(){return this.getCurrentLesson().sentences[this.currentSentenceIdx]}render(){const e=this.currentLang==="de",t=this.getCurrentLesson(),i=this.getCurrentSentence(),n=t.sentences.length;this.container.innerHTML=`
      <div class="section-header">
        <div class="section-title-wrap">
          <h2 class="section-title">${e?"Shadowing & Rhythmus-Labor":"Shadowing & Rhythm Lab"}</h2>
          <p class="section-subtitle">${e?"Muttersprachliche Satzmelodie, Sprechrhythmus und Akzentreduktion durch direktes auditives Shadowing trainieren.":"Train native cadence, vocal rhythm, and accent reduction by immediate auditory shadowing."}</p>
        </div>
        <div class="section-actions">
          <select id="shadowLessonSelect" class="btn btn-secondary btn-sm" style="background: rgba(20,28,48,0.9); color: white;">
            ${this.lessons.map((r,s)=>`
              <option value="${s}" ${s===this.currentLessonIdx?"selected":""}>
                ${r.title} (${r.difficulty})
              </option>
            `).join("")}
          </select>
        </div>
      </div>

      <div class="practice-card glass-panel shadowing-card">
        <div class="card-header-bar">
          <div style="display: flex; align-items: center; gap: 16px;">
            <span class="badge badge-level">${t.difficulty}</span>
            <span style="font-size: 14px; color: var(--text-muted);">${t.description}</span>
          </div>

          <!-- Sentence Stepper Dots -->
          <div class="sentence-stepper" id="sentenceStepper">
            ${t.sentences.map((r,s)=>`
              <div class="stepper-dot ${s===this.currentSentenceIdx?"active":""}" data-idx="${s}">
                ${s+1}
              </div>
            `).join("")}
          </div>
        </div>

        <!-- Target Shadowing Sentence -->
        <div class="shadow-prompt-box">
          <div class="shadow-prompt-text" id="shadowPromptText">
            "${i.text}"
          </div>
          <div class="shadow-phonetic-tip">
            <span>💡 <strong>${e?"Rhythmus-Tipp:":"Cadence Tip:"}</strong></span>
            <span id="shadowTipText">${i.phoneticTip}</span>
          </div>
        </div>

        <!-- Audio Canvas Visualizer -->
        <canvas id="shadowWaveformCanvas" class="waveform-canvas" width="600" height="70"></canvas>

        <!-- Action Controls -->
        <div class="control-bar">
          <div style="display: flex; align-items: center; gap: 10px;">
            <button id="playNativeBtn" class="btn btn-accent">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              <span>${e?"Nativ anhören (1.0x)":"Listen Native (1.0x)"}</span>
            </button>
            <button id="playSlowBtn" class="btn btn-secondary btn-sm" title="Listen at 0.75x">
              🐢 0.75x
            </button>
          </div>

          <button id="shadowRecordBtn" class="mic-action-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>
            <span id="shadowRecordText">${e?"Shadowing aufnehmen":"Record Your Shadow"}</span>
          </button>

          <div style="display: flex; gap: 8px;">
            <button id="prevSentenceBtn" class="btn btn-secondary btn-sm" ${this.currentSentenceIdx===0?"disabled":""}>${e?"← Zurück":"← Previous"}</button>
            <button id="nextSentenceBtn" class="btn btn-secondary btn-sm" ${this.currentSentenceIdx===n-1?"disabled":""}>${e?"Weiter →":"Next →"}</button>
          </div>
        </div>

        <!-- Dual Audio Comparison Player -->
        <div class="dual-playback-grid" id="dualPlaybackGrid" style="display: ${this.userAudioUrl?"grid":"none"};">
          <div class="audio-track-box">
            <div class="track-label">
              <span>${e?"🔊 Spur A: Muttersprachler-Referenz":"🔊 Track A: Native Speaker Reference"}</span>
            </div>
            <button id="replayNativeTrackBtn" class="btn btn-secondary btn-sm">
              ${e?"Muttersprachler abspielen":"Play Native Speaker"}
            </button>
          </div>

          <div class="audio-track-box" style="border-color: rgba(99, 102, 241, 0.4);">
            <div class="track-label" style="color: #a5b4fc;">
              <span>${e?"🎙️ Spur B: Ihre Aufnahme":"🎙️ Track B: Your Recorded Voice"}</span>
            </div>
            <button id="replayUserTrackBtn" class="btn btn-primary btn-sm">
              ${e?"Ihre Aufnahme abspielen":"Play Your Recording"}
            </button>
          </div>
        </div>

        <!-- Shadowing Accuracy Feedback -->
        <div id="shadowFeedbackBox" style="display: none; padding: 14px 18px; border-radius: var(--radius-md); background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.3);">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span style="font-weight: 700; color: #34d399;" id="shadowScoreText">Accuracy: 95%</span>
            <span style="font-size: 13px; color: var(--text-muted);" id="shadowScoreDetail">Spoken transcript verified.</span>
          </div>
        </div>
      </div>
    `}bindEvents(){this.container.querySelector("#shadowLessonSelect").addEventListener("change",r=>{this.currentLessonIdx=parseInt(r.target.value),this.currentSentenceIdx=0,this.userAudioUrl=null,this.render(),this.bindEvents()}),this.container.querySelector("#sentenceStepper").addEventListener("click",r=>{const s=r.target.closest(".stepper-dot");s&&(this.currentSentenceIdx=parseInt(s.dataset.idx),this.userAudioUrl=null,this.render(),this.bindEvents())}),this.container.querySelector("#playNativeBtn").addEventListener("click",()=>{this.playNativeSentence(1)}),this.container.querySelector("#playSlowBtn").addEventListener("click",()=>{this.playNativeSentence(.75)}),this.container.querySelector("#prevSentenceBtn").addEventListener("click",()=>{this.currentSentenceIdx>0&&(this.currentSentenceIdx--,this.userAudioUrl=null,this.render(),this.bindEvents())}),this.container.querySelector("#nextSentenceBtn").addEventListener("click",()=>{this.currentSentenceIdx<this.getCurrentLesson().sentences.length-1&&(this.currentSentenceIdx++,this.userAudioUrl=null,this.render(),this.bindEvents())}),this.container.querySelector("#shadowRecordBtn").addEventListener("click",()=>{this.toggleRecordShadow()});const i=this.container.querySelector("#replayNativeTrackBtn");i&&i.addEventListener("click",()=>{this.playNativeSentence(1)});const n=this.container.querySelector("#replayUserTrackBtn");n&&n.addEventListener("click",()=>{this.userAudioUrl&&T.playAudio(this.userAudioUrl)})}playNativeSentence(e=1){const t=this.getCurrentSentence();u.speak({text:t.text,rate:e})}async toggleRecordShadow(){const e=this.container.querySelector("#shadowRecordBtn"),t=this.container.querySelector("#shadowRecordText"),i=this.container.querySelector("#shadowWaveformCanvas");if(this.isRecording){const s=this.currentLang==="de";this.isRecording=!1,e.classList.remove("recording"),t.textContent=s?"Shadowing aufnehmen":"Record Your Shadow",u.stopListening();const o=await T.stopRecording();if(o&&o.url){this.userAudioUrl=o.url;const c=this.container.querySelector("#dualPlaybackGrid");c&&(c.style.display="grid")}return}const n=this.currentLang==="de";this.isRecording=!0,e.classList.add("recording"),t.textContent=n?"Aufnahme stoppen...":"Stop Recording",this.userAudioUrl=null;try{await T.startRecording(i)}catch{alert(n?"Mikrofonzugriff ist für das Shadowing erforderlich. Bitte erlauben Sie den Zugriff im Browser.":"Microphone permission required for shadowing practice."),this.isRecording=!1,e.classList.remove("recording"),t.textContent=n?"Shadowing aufnehmen":"Record Your Shadow";return}let r="";u.startListening({lang:u.getDefaultRecognitionLang(),continuous:!0,interimResults:!0,onInterim:({full:s})=>{r=s},onResult:s=>{const o=s||r;o&&o.trim().length>0&&this.evaluateShadow(o)},onError:()=>{this.isRecording=!1,e.classList.remove("recording"),t.textContent=n?"Shadowing aufnehmen":"Record Your Shadow",T.stopRecording()},onEnd:()=>{this.isRecording=!1,e.classList.remove("recording"),t.textContent=n?"Shadowing aufnehmen":"Record Your Shadow"}})}evaluateShadow(e){const t=this.currentLang==="de",i=this.getCurrentSentence(),n=K.evaluateSpeech({referenceText:i.text,spokenText:e}),r=this.container.querySelector("#shadowFeedbackBox"),s=this.container.querySelector("#shadowScoreText"),o=this.container.querySelector("#shadowScoreDetail");r&&s&&(r.style.display="block",s.textContent=`${t?"Genauigkeit:":"Accuracy:"} ${n.accuracy}%`,o.textContent=`${t?"Gesprochen:":"Spoken:"} "${e||(t?"Höre zu...":"Listening...")}"`,n.accuracy>=80&&T.playChime("success")),A.recordActivity({words:i.text.split(" ").length,accuracy:n.accuracy})}}class Fe{constructor(e){this.container=e,this.currentLang=A.getLanguage(),this.loadLessons(),this.currentIndex=0,this.hasChecked=!1,this.isSpeakingVerification=!1,this.render(),this.bindEvents()}loadLessons(){this.lessons=this.currentLang==="de"?We:Me}setLanguage(e){this.currentLang=e,this.loadLessons(),this.currentIndex=0,this.hasChecked=!1,this.isSpeakingVerification=!1,this.render(),this.bindEvents()}getCurrent(){return this.lessons[this.currentIndex]}render(){const e=this.currentLang==="de",t=this.getCurrent();this.container.innerHTML=`
      <div class="section-header">
        <div class="section-title-wrap">
          <h2 class="section-title">${e?"Diktat- & Artikulations-Studio":"Dictation & Articulation Studio"}</h2>
          <p class="section-subtitle">${e?"Blind zuhören, Gehörtes tippen und Gelerntes durch lautes Sprechen im Langzeitgedächtnis verankern.":"Listen blindly, write what you hear, and lock in muscle memory by speaking it aloud."}</p>
        </div>
        <div class="section-actions">
          <span class="badge badge-level">${e?`Übung ${this.currentIndex+1} von ${this.lessons.length}`:`Exercise ${this.currentIndex+1} of ${this.lessons.length}`}</span>
        </div>
      </div>

      <div class="studio-grid">
        <!-- Main Dictation Practice Area -->
        <div class="practice-card glass-panel">
          <div class="card-header-bar">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span class="badge ${t.level.includes("Easy")||t.level.includes("Leicht")?"badge-level":t.level.includes("Medium")||t.level.includes("Mittel")?"badge-cat":"badge-level"}">
                ${t.level} ${e?"Schwierigkeit":"Difficulty"}
              </span>
              <span style="font-size: 13px; color: var(--text-muted);">${e?"Aufmerksam zuhören vor dem Tippen":"Listen attentively before typing"}</span>
            </div>
            <button id="dictationHintBtn" class="btn btn-secondary btn-sm">
              ${e?"💡 Tipp anzeigen":"💡 Reveal Hint"}
            </button>
          </div>

          <!-- Hint display (hidden by default) -->
          <div id="hintBox" style="display: none; padding: 12px 16px; border-radius: var(--radius-sm); background: rgba(99, 102, 241, 0.12); color: #c7d2fe; font-size: 14px;">
            <strong>${e?"Tipp:":"Hint:"}</strong> ${t.hint}
          </div>

          <!-- Audio Listening Player -->
          <div style="display: flex; align-items: center; justify-content: center; gap: 16px; padding: 30px; background: rgba(10, 15, 26, 0.6); border-radius: var(--radius-md); border: 1px solid var(--border-glass);">
            <button id="playAudioBtn" class="btn btn-accent btn-lg" style="gap: 12px;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              <span>${e?"Satz anhören":"Play Sentence Audio"}</span>
            </button>
            <button id="playSlowDictBtn" class="btn btn-secondary" title="${e?"Bei 0.75x Tempo abspielen":"Play at 0.75x speed"}">
              🐢 ${e?"Langsam":"Play Slow"}
            </button>
          </div>

          <!-- User Writing Input Area -->
          <div class="form-group">
            <label style="font-size: 14px; font-weight: 600; color: #cbd5e1;">${e?"Tippen Sie, was Sie hören:":"Type what you hear:"}</label>
            <textarea id="dictationTextarea" class="dictation-input" placeholder="${e?"Tippen Sie den deutschen Satz, den Sie gehört haben... (Enter drücken)":"Type the English sentence you heard... (Press Enter or click Check Writing)"}" rows="3" spellcheck="false" autocorrect="off" autocapitalize="none" autocomplete="off"></textarea>
          </div>

          <!-- Action Controls -->
          <div class="control-bar">
            <button id="checkWritingBtn" class="btn btn-primary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span>${e?"Rechtschreibung prüfen":"Check Writing"}</span>
            </button>
            <button id="revealAnswerBtn" class="btn btn-secondary btn-sm">
              ${e?"Lösung anzeigen":"Show Solution"}
            </button>
            <div style="display: flex; gap: 8px;">
              <button id="prevDictBtn" class="btn btn-secondary btn-sm" ${this.currentIndex===0?"disabled":""}>${e?"← Zurück":"← Prev"}</button>
              <button id="nextDictBtn" class="btn btn-secondary btn-sm" ${this.currentIndex===this.lessons.length-1?"disabled":""}>${e?"Weiter →":"Next →"}</button>
            </div>
          </div>

          <!-- Diff Results Box (Appears after checking) -->
          <div id="diffResultsWrap" style="display: none; display: flex; flex-direction: column; gap: 12px;">
            <div style="font-size: 14px; font-weight: 600; color: #cbd5e1;">${e?"Detaillierter Abgleich:":"Detailed Comparison:"}</div>
            <div id="diffDisplay" class="dictation-diff-display"></div>
          </div>
        </div>

        <!-- Right Vocal Reinforcement Studio -->
        <div style="display: flex; flex-direction: column; gap: 20px;">
          <!-- Step 2: Vocal Articulation Challenge -->
          <div class="glass-panel" style="padding: 24px; display: flex; flex-direction: column; gap: 16px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 18px;">🎙️</span>
              <h4 style="font-size: 16px; font-weight: 700; color: #fff;">${e?"Mündliche Festigung":"Oral Reinforcement"}</h4>
            </div>
            <p style="font-size: 13px; color: var(--text-muted);">
              ${e?"Verankern Sie den Satz im Gedächtnis! Sprechen Sie ihn nach dem Tippen laut ins Mikrofon.":"Lock in your memory! After typing the sentence, speak it aloud into your mic to master mouth coordination and speech cadence."}
            </p>

            <button id="speakVerifyBtn" class="mic-action-btn" style="width: 100%; justify-content: center;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>
              <span id="speakVerifyBtnText">${e?"Jetzt laut sprechen":"Speak Aloud Now"}</span>
            </button>

            <div id="speakVerifyFeedback" style="display: none; padding: 12px; border-radius: var(--radius-sm); font-size: 13px; background: rgba(255, 255, 255, 0.04); border: 1px solid var(--border-glass);">
              <span id="speakVerifyScore" style="font-weight: 700; color: #34d399;"></span>
              <div id="speakVerifySpoken" style="color: var(--text-muted); margin-top: 4px;"></div>
            </div>
          </div>

          <!-- Quick Tip Card -->
          <div class="glass-panel" style="padding: 20px; font-size: 13px; color: var(--text-muted);">
            <strong style="color: #cbd5e1; display: block; margin-bottom: 6px;">🧠 ${e?"Kognitiver Lerntipp:":"Cognitive Retention Tip:"}</strong>
            ${e?"Das Tippen schult Grammatik und Rechtschreibung, während lautes Sprechen die Sprachmuskulatur aktiviert. Beides zusammen beschleunigt den Spracherwerb dreimal schneller!":"Writing forces your brain to dissect phonemes and grammar, while speaking aloud engages motor memory. Combining both accelerates fluency 3x faster than reading alone!"}
          </div>
        </div>
      </div>
    `}bindEvents(){this.container.querySelector("#playAudioBtn").addEventListener("click",()=>{this.playSentence(1)}),this.container.querySelector("#playSlowDictBtn").addEventListener("click",()=>{this.playSentence(.75)}),this.container.querySelector("#dictationHintBtn").addEventListener("click",()=>{const t=this.container.querySelector("#hintBox");t.style.display=t.style.display==="none"?"block":"none"});const e=this.container.querySelector("#dictationTextarea");e.addEventListener("keydown",t=>{t.key==="Enter"&&!t.shiftKey&&!t.isComposing&&t.keyCode!==229&&(t.preventDefault(),this.checkWriting())}),this.container.querySelector("#checkWritingBtn").addEventListener("click",()=>{this.checkWriting()}),this.container.querySelector("#revealAnswerBtn").addEventListener("click",()=>{e.value=this.getCurrent().sentence,this.checkWriting()}),this.container.querySelector("#prevDictBtn").addEventListener("click",()=>{this.currentIndex>0&&(this.currentIndex--,this.render(),this.bindEvents())}),this.container.querySelector("#nextDictBtn").addEventListener("click",()=>{this.currentIndex<this.lessons.length-1&&(this.currentIndex++,this.render(),this.bindEvents())}),this.container.querySelector("#speakVerifyBtn").addEventListener("click",()=>{this.toggleSpeakVerification()})}playSentence(e=1){u.speak({text:this.getCurrent().sentence,rate:e})}checkWriting(){const e=this.currentLang==="de",t=this.container.querySelector("#dictationTextarea").value;if(!t.trim()){const c=this.container.querySelector("#diffResultsWrap"),d=this.container.querySelector("#diffDisplay");c&&d&&(c.style.display="flex",d.innerHTML=`<span style="color: #f59e0b; font-size: 14px;">${e?"⚠️ Bitte tippen Sie zuerst, was Sie gehört haben.":"⚠️ Please type what you heard first."}</span>`);return}const i=this.getCurrent().sentence,n=K.diffDictation(i,t),r=this.container.querySelector("#diffResultsWrap"),s=this.container.querySelector("#diffDisplay");r.style.display="flex";let o="";n.diff.forEach(c=>{c.type==="correct"?o+=`<span class="diff-tag correct" title="${e?"Korrekt":"Accurate"}">${c.word}</span> `:c.type==="mismatch"?o+=`<span class="diff-tag mismatch" title="${e?`Erwartet: ${c.word}`:`Expected: ${c.word}`}">${e?`Erwartet: ${c.word} (Sie schrieben: "${c.userInput}")`:`Expected: ${c.word} (You wrote: "${c.userInput}")`}</span> `:c.type==="missing"?o+=`<span class="diff-tag missing" title="${e?"Fehlt":"Missing word"}">${e?`Fehlt: ${c.word}`:`Missing: ${c.word}`}</span> `:c.type==="extra"&&(o+=`<span class="diff-tag extra" title="${e?"Überflüssig":"Extra word"}">${e?`Zusatz: "${c.word}"`:`Extra: "${c.word}"`}</span> `)}),s.innerHTML=`
      <div style="margin-bottom: 8px;"><strong>${e?"Schreibgenauigkeit":"Writing Accuracy"}: ${n.accuracy}%</strong></div>
      <div>${o}</div>
    `,n.isExact||n.accuracy>=90?(T.playChime("success"),U({particleCount:60,spread:50,origin:{y:.6}})):T.playChime("tap"),A.recordActivity({words:i.split(" ").length,accuracy:n.accuracy})}toggleSpeakVerification(){const e=this.currentLang==="de",t=this.container.querySelector("#speakVerifyBtn"),i=this.container.querySelector("#speakVerifyBtnText"),n=this.container.querySelector("#speakVerifyFeedback"),r=this.container.querySelector("#speakVerifyScore"),s=this.container.querySelector("#speakVerifySpoken");if(this.isSpeakingVerification){this.isSpeakingVerification=!1,t.classList.remove("recording"),i.textContent=e?"Jetzt laut sprechen":"Speak Aloud Now",u.stopListening();return}this.isSpeakingVerification=!0,t.classList.add("recording"),i.textContent=e?"Höre zu... Jetzt sprechen":"Listening... Speak now",n.style.display="none";let o="";u.startListening({lang:u.getDefaultRecognitionLang(),continuous:!0,interimResults:!0,onInterim:({full:c})=>{o=c},onResult:c=>{const d=c||o;this.isSpeakingVerification=!1,t.classList.remove("recording"),i.textContent=e?"Jetzt laut sprechen":"Speak Aloud Now";const h=K.evaluateSpeech({referenceText:this.getCurrent().sentence,spokenText:d});n.style.display="block",r.textContent=`${e?"Gesprochene Genauigkeit":"Spoken Accuracy"}: ${h.accuracy}%`,s.textContent=`${e?"Gesprochen":"Spoken"}: "${d}"`,h.accuracy>=85&&T.playChime("success")},onError:()=>{this.isSpeakingVerification=!1,t.classList.remove("recording"),i.textContent=e?"Jetzt laut sprechen":"Speak Aloud Now"}})}}class _e{constructor(e){this.container=e,this.currentLang=A.getLanguage(),this.loadScenarios(),this.currentScenarioIdx=0,this.currentStepIdx=0,this.chatHistory=[],this.isListening=!1,this.activeSelectedPrompt="",this.initScenario(),this.render(),this.bindEvents()}loadScenarios(){this.scenarios=this.currentLang==="de"?qe:$e}setLanguage(e){this.currentLang=e,this.loadScenarios(),this.currentScenarioIdx=0,this.currentStepIdx=0,this.activeSelectedPrompt="",this.initScenario(),this.render(),this.bindEvents()}getCurrentScenario(){return this.scenarios[this.currentScenarioIdx]}getCurrentStep(){return this.getCurrentScenario().steps[this.currentStepIdx]||null}initScenario(){this.currentStepIdx=0,this.chatHistory=[];const e=this.getCurrentStep();e&&(this.chatHistory.push({sender:"ai",speaker:e.speaker,avatar:e.avatar,text:e.aiSpeech}),setTimeout(()=>{u.speak({text:e.aiSpeech,rate:.95})},400))}render(){const e=this.currentLang==="de",t=this.getCurrentScenario(),i=this.getCurrentStep(),n=this.currentStepIdx>=t.steps.length;this.container.innerHTML=`
      <div class="section-header">
        <div class="section-title-wrap">
          <h2 class="section-title">${e?"Konversations- & Rollenspiel-Studio":"Conversational Roleplay Studio"}</h2>
          <p class="section-subtitle">${e?"Reale deutsche Gesprächssituationen mit interaktiven KI-Partnern simulieren.":"Simulate real-life spoken English interactions with conversational AI partners."}</p>
        </div>
        <div class="section-actions">
          <select id="roleplaySelect" class="btn btn-secondary btn-sm" style="background: rgba(20,28,48,0.9); color: white;">
            ${this.scenarios.map((s,o)=>`
              <option value="${o}" ${o===this.currentScenarioIdx?"selected":""}>
                ${s.icon} ${s.title}
              </option>
            `).join("")}
          </select>
          <button id="restartScenarioBtn" class="btn btn-secondary btn-sm">
            ${e?"Neustart":"Restart"}
          </button>
        </div>
      </div>

      <div class="studio-grid">
        <!-- Main Chat & Interaction Viewport -->
        <div class="practice-card glass-panel" style="padding: 20px;">
          <div class="card-header-bar" style="padding-bottom: 12px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 20px;">${t.icon}</span>
              <div>
                <h4 style="font-size: 16px; font-weight: 700; color: #fff;">${t.title}</h4>
                <div style="font-size: 13px; color: var(--text-muted);">${t.context}</div>
              </div>
            </div>
            <span class="badge badge-level">${e?"Schritt":"Step"} ${Math.min(this.currentStepIdx+1,t.steps.length)} / ${t.steps.length}</span>
          </div>

          <!-- Chat messages stream -->
          <div class="chat-conversation" id="chatConversation">
            ${this.chatHistory.map(s=>`
              <div class="chat-bubble-wrap ${s.sender}">
                <div class="chat-avatar">${s.avatar}</div>
                <div class="chat-bubble">
                  <div style="font-size: 11px; opacity: 0.7; margin-bottom: 4px;">${s.speaker}</div>
                  <div>${s.text}</div>
                  ${s.sender==="ai"?`
                    <button class="btn btn-secondary btn-sm replay-ai-speech" data-text="${encodeURIComponent(s.text)}" style="margin-top: 8px; font-size: 11px; padding: 3px 8px;">
                      ${e?"🔊 Anhören":"🔊 Listen"}
                    </button>
                  `:""}
                </div>
              </div>
            `).join("")}
          </div>

          <!-- User Reply Area -->
          ${!n&&i?`
            <div style="display: flex; flex-direction: column; gap: 14px; margin-top: 10px; border-top: 1px solid var(--border-glass); padding-top: 16px;">
              <div style="font-size: 13px; font-weight: 600; color: #cbd5e1;">${e?"Vorgeschlagene Antworten (Klicken zum Auswählen):":"Suggested Responses (Click to select & speak):"}</div>
              <div style="display: flex; flex-direction: column; gap: 8px;">
                ${i.suggestedResponses.map((s,o)=>`
                  <div class="suggested-reply-card ${this.activeSelectedPrompt===s?"active-prompt":""}" data-text="${encodeURIComponent(s)}">
                    <span>${s}</span>
                    <button class="btn btn-secondary btn-sm speak-sample-btn" data-text="${encodeURIComponent(s)}" style="font-size: 11px; padding: 2px 6px;">
                      🔊
                    </button>
                  </div>
                `).join("")}
              </div>

              <!-- Custom Reply & Mic Input Bar -->
              <div style="display: flex; gap: 10px; align-items: center; margin-top: 8px;">
                <input type="text" id="roleplayCustomInput" class="form-input" style="flex: 1;" placeholder="${e?"Oder formulieren Sie Ihre eigene Antwort hier...":"Or type your own custom response here..."}" value="${this.activeSelectedPrompt||""}" spellcheck="false" autocorrect="off" autocapitalize="none" autocomplete="off" />

                <button id="roleplayMicBtn" class="mic-action-btn ${this.isListening?"recording":""}" style="padding: 10px 18px; border-radius: var(--radius-md); font-size: 13px;">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>
                  <span id="roleplayMicText">${this.isListening?e?"Höre...":"Listening...":e?"Sprechen":"Speak"}</span>
                </button>

                <button id="roleplaySendBtn" class="btn btn-primary" style="padding: 10px 18px;">
                  ${e?"Senden ↵":"Send ↵"}
                </button>
              </div>
              <div style="font-size: 12px; color: var(--text-muted); min-height: 18px;" id="roleplayInterim"></div>
            </div>
          `:`
            <div style="text-align: center; padding: 30px; background: rgba(16, 185, 129, 0.1); border-radius: var(--radius-md); border: 1px solid rgba(16, 185, 129, 0.3);">
              <h3 style="font-size: 20px; font-weight: 700; color: #34d399; margin-bottom: 8px;">🎉 ${e?"Dialog erfolgreich abgeschlossen!":"Dialogue Successfully Completed!"}</h3>
              <p style="font-size: 14px; color: var(--text-muted); margin-bottom: 16px;">
                ${e?"Sie haben das Gespräch souverän geführt und Ihre Gedanken präzise ausgedrückt.":"You navigated this conversation naturally and expressed your points with clarity."}
              </p>
              <button id="restartCompletedBtn" class="btn btn-primary">
                ${e?"Nochmal üben":"Practice Again"}
              </button>
            </div>
          `}
        </div>

        <!-- Right Dialogue Coach Guide -->
        <div style="display: flex; flex-direction: column; gap: 20px;">
          <div class="glass-panel" style="padding: 24px;">
            <h4 style="font-size: 16px; font-weight: 700; color: #fff; margin-bottom: 10px;">${e?"Gesprächsstrategie":"Conversation Strategy"}</h4>
            <ul style="font-size: 13px; color: var(--text-muted); line-height: 1.8; padding-left: 18px;">
              <li>${e?"Halten Sie ein gleichmäßiges Sprechtempo und nutzen Sie gezielte Pausen.":"Maintain steady vocal pace and do not rush through pauses."}</li>
              <li>${e?'Bestätigen Sie das Gehörte vor der Antwort (z.B. "Vielen Dank", "Das ist ein wichtiger Punkt").':'Acknowledge the other speaker before answering (e.g. <em>"Thank you"</em>, <em>"That is a great question"</em>).'}</li>
              <li>${e?"Sprechen Sie deutlich in Richtung Ihres Mikrofons.":"Speak clearly toward your microphone."}</li>
            </ul>
          </div>

          ${i?`
            <div class="glass-panel" style="padding: 20px;">
              <h5 style="font-size: 14px; font-weight: 700; color: #cbd5e1; margin-bottom: 8px;">${e?"Wichtiger Wortschatz & Schlüsselwörter:":"Target Vocabulary & Keywords:"}</h5>
              <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                ${i.targetKeywords.map(s=>`
                  <span class="badge badge-cat">${s}</span>
                `).join("")}
              </div>
            </div>
          `:""}
        </div>
      </div>
    `;const r=this.container.querySelector("#chatConversation");r&&(r.scrollTop=r.scrollHeight)}bindEvents(){const e=this.container.querySelector("#roleplaySelect");e&&e.addEventListener("change",o=>{this.currentScenarioIdx=parseInt(o.target.value),this.initScenario(),this.render(),this.bindEvents()});const t=this.container.querySelector("#restartScenarioBtn");t&&t.addEventListener("click",()=>{this.initScenario(),this.render(),this.bindEvents()});const i=this.container.querySelector("#restartCompletedBtn");i&&i.addEventListener("click",()=>{this.initScenario(),this.render(),this.bindEvents()}),this.container.querySelectorAll(".replay-ai-speech").forEach(o=>{o.addEventListener("click",c=>{const d=decodeURIComponent(c.currentTarget.dataset.text);u.speak({text:d,rate:.95})})}),this.container.querySelectorAll(".speak-sample-btn").forEach(o=>{o.addEventListener("click",c=>{c.stopPropagation();const d=decodeURIComponent(c.currentTarget.dataset.text);u.speak({text:d,rate:.9})})}),this.container.querySelectorAll(".suggested-reply-card").forEach(o=>{o.addEventListener("click",()=>{const c=decodeURIComponent(o.dataset.text);this.activeSelectedPrompt=c;const d=this.container.querySelector("#roleplayCustomInput");d&&(d.value=c),this.render(),this.bindEvents()})});const n=this.container.querySelector("#roleplayCustomInput"),r=this.container.querySelector("#roleplaySendBtn");if(n&&r){const o=()=>{const c=n.value.trim();c&&this.handleUserSpokenReply(c)};r.addEventListener("click",o),n.addEventListener("keydown",c=>{c.key==="Enter"&&!c.isComposing&&c.keyCode!==229&&(c.preventDefault(),o())})}const s=this.container.querySelector("#roleplayMicBtn");s&&s.addEventListener("click",()=>{this.toggleRoleplaySpeaking()})}toggleRoleplaySpeaking(){const e=this.currentLang==="de",t=this.container.querySelector("#roleplayMicBtn"),i=this.container.querySelector("#roleplayMicText"),n=this.container.querySelector("#roleplayInterim");if(this.isListening){this.isListening=!1,t.classList.remove("recording"),i.textContent=e?"Antwort sprechen":"Speak Response",u.stopListening();return}this.isListening=!0,t.classList.add("recording"),i.textContent=e?"Höre...":"Listening...",n.textContent=e?"Höre zu... Bitte sprechen.":"Listening... Speak now.";let r="";u.startListening({lang:u.getDefaultRecognitionLang(),continuous:!0,interimResults:!0,onInterim:({full:s})=>{r=s,n.textContent=s;const o=this.container.querySelector("#roleplayCustomInput");o&&(o.value=s)},onResult:s=>{const o=s||r,c=this.container.querySelector("#roleplayCustomInput");c&&o&&(c.value=o),this.handleUserSpokenReply(o)},onError:()=>{this.isListening=!1,t.classList.remove("recording"),i.textContent=e?"Sprechen":"Speak"}})}handleUserSpokenReply(e){const t=this.currentLang==="de";this.isListening=!1;const i=this.container.querySelector("#roleplayMicBtn"),n=this.container.querySelector("#roleplayMicText");i&&i.classList.remove("recording"),n&&(n.textContent=t?"Sprechen":"Speak");const r=(e||"").trim()||(this.activeSelectedPrompt||"").trim();if(!r){const o=this.container.querySelector("#roleplayInterim");o&&(o.textContent=t?"Keine Sprache erkannt. Bitte tippen Sie eine Antwort oder wählen Sie eine Vorlage.":"No speech caught. Please type your response or select a suggested option.");return}this.chatHistory.push({sender:"user",speaker:t?"Sie":"You",avatar:"🗣️",text:r}),T.playChime("tap"),this.activeSelectedPrompt="",this.currentStepIdx++;const s=this.getCurrentScenario();if(this.currentStepIdx<s.steps.length){const o=s.steps[this.currentStepIdx];setTimeout(()=>{this.chatHistory.push({sender:"ai",speaker:o.speaker,avatar:o.avatar,text:o.aiSpeech}),this.render(),this.bindEvents(),u.speak({text:o.aiSpeech,rate:.95})},600)}else setTimeout(()=>{this.render(),this.bindEvents(),U({particleCount:70,spread:60}),T.playChime("success")},400);A.recordActivity({words:r.split(" ").length,accuracy:90}),this.render(),this.bindEvents()}}class Ge{constructor(e){this.container=e,this.currentLang=A.getLanguage(),this.loadDrills(),this.activeTab="minimalPairs",this.selectedPairCategoryIdx=0,this.activeTestingPair=null,this.isTestingPair=!1,this.isRecordingTwister=!1,this.activeTwisterIdx=0,this.render(),this.bindEvents()}loadDrills(){this.drills=this.currentLang==="de"?Ve:Re}setLanguage(e){this.currentLang=e,this.loadDrills(),this.selectedPairCategoryIdx=0,this.activeTwisterIdx=0,this.render(),this.bindEvents()}render(){const e=this.currentLang==="de";this.container.innerHTML=`
      <div class="section-header">
        <div class="section-title-wrap">
          <h2 class="section-title">${e?"Phonetik- & Zungenbrecher-Gym":"Phonetics & Accent Gym"}</h2>
          <p class="section-subtitle">${e?"Schwierige deutsche Laute trainieren, Minimalpaare meistern und Sprechmuskeln mit Zungenbrechern schulen.":"Target tricky English sounds, master minimal pairs, and build vocal agility with tongue twisters."}</p>
        </div>
        <div class="section-actions">
          <button id="tabPairsBtn" class="btn ${this.activeTab==="minimalPairs"?"btn-primary":"btn-secondary"} btn-sm">
            ${e?"Minimalpaare":"Minimal Pairs"}
          </button>
          <button id="tabTwistersBtn" class="btn ${this.activeTab==="twisters"?"btn-primary":"btn-secondary"} btn-sm">
            ${e?"Zungenbrecher":"Tongue Twisters"}
          </button>
        </div>
      </div>

      ${this.activeTab==="minimalPairs"?this.renderMinimalPairsView():this.renderTwistersView()}
    `}renderMinimalPairsView(){const e=this.currentLang==="de",t=this.drills.minimalPairs[this.selectedPairCategoryIdx];return`
      <div class="studio-grid">
        <div class="practice-card glass-panel">
          <div class="card-header-bar">
            <select id="contrastSelect" class="btn btn-secondary btn-sm" style="background: rgba(20,28,48,0.9); color: white;">
              ${this.drills.minimalPairs.map((i,n)=>`
                <option value="${n}" ${n===this.selectedPairCategoryIdx?"selected":""}>
                  ${e?"Kontrast":"Contrast"}: ${i.contrast}
                </option>
              `).join("")}
            </select>
          </div>

          <!-- Articulation Guide Tip -->
          <div style="padding: 16px 20px; border-radius: var(--radius-md); background: rgba(99, 102, 241, 0.12); border-left: 4px solid #6366f1;">
            <div style="font-size: 14px; font-weight: 700; color: #cbd5e1; margin-bottom: 4px;">👅 ${e?"Artikulationstechnik:":"Articulation Technique:"}</div>
            <div style="font-size: 14px; color: #e2e8f0;">${t.tip}</div>
          </div>

          <!-- Minimal Pairs Cards Grid -->
          <div class="minimal-pairs-grid">
            ${t.pairs.map((i,n)=>`
              <div class="pair-card">
                <div class="pair-words">
                  <span style="color: #38bdf8;">${i.wordA}</span>
                  <span class="vs-badge">VS</span>
                  <span style="color: #d946ef;">${i.wordB}</span>
                </div>
                <div style="display: flex; gap: 8px;">
                  <button class="btn btn-secondary btn-sm play-word-btn" data-word="${i.wordA}" style="flex: 1;">
                    🔊 ${i.wordA}
                  </button>
                  <button class="btn btn-secondary btn-sm play-word-btn" data-word="${i.wordB}" style="flex: 1;">
                    🔊 ${i.wordB}
                  </button>
                </div>
                <button class="btn btn-accent btn-sm test-pair-btn" data-a="${i.wordA}" data-b="${i.wordB}" style="width: 100%;">
                  🎙️ ${e?"Aussprache-Test":"Pronunciation Test"}
                </button>
              </div>
            `).join("")}
          </div>

          <!-- Test Feedback Modal/Box -->
          <div id="pairTestBox" style="display: none; padding: 18px; border-radius: var(--radius-md); background: rgba(10, 15, 26, 0.85); border: 1px solid var(--border-active); margin-top: 10px;">
            <div style="font-size: 14px; font-weight: 600; color: #cbd5e1; margin-bottom: 6px;" id="pairTestTitle"></div>
            <div id="pairTestResult" style="font-size: 16px; font-weight: 700; color: #34d399;"></div>
          </div>
        </div>

        <!-- Right Sound Anatomy Column -->
        <div style="display: flex; flex-direction: column; gap: 20px;">
          <div class="glass-panel" style="padding: 24px;">
            <h4 style="font-size: 16px; font-weight: 700; color: #fff; margin-bottom: 12px;">${e?"Warum Minimalpaare?":"Why Minimal Pairs?"}</h4>
            <p style="font-size: 13px; color: var(--text-muted); line-height: 1.7;">
              ${e?"Minimalpaare sind Wortpaare, die sich durch nur einen einzigen Laut unterscheiden. Nicht-Muttersprachler verwechseln diese häufig mit Lauten ihrer Muttersprache.":"Minimal pairs are pairs of words that differ by only one single sound. Non-native speakers often substitute their native phonemes, leading to confusion."}
            </p>
            <p style="font-size: 13px; color: var(--text-muted); line-height: 1.7; margin-top: 10px;">
              ${e?"Durch das direkte Üben gegensätzlicher Paare schärfen Sie Ihr Gehör für feine Frequenzen und trainieren die exakte Zungen- und Lippenhaltung.":"By practicing contrasting pairs back-to-back, your ear attunes to the acoustic frequency and your vocal tract learns the exact muscular placement."}
            </p>
          </div>
        </div>
      </div>
    `}renderTwistersView(){const e=this.currentLang==="de",t=this.drills.tongueTwisters[this.activeTwisterIdx];return`
      <div class="studio-grid">
        <div class="practice-card glass-panel">
          <div class="card-header-bar">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span class="badge badge-level">${t.difficulty}</span>
              <span style="font-size: 14px; color: var(--text-muted);">${t.targetSound}</span>
            </div>
            <select id="twisterSelect" class="btn btn-secondary btn-sm" style="background: rgba(20,28,48,0.9); color: white;">
              ${this.drills.tongueTwisters.map((i,n)=>`
                <option value="${n}" ${n===this.activeTwisterIdx?"selected":""}>
                  ${i.title}
                </option>
              `).join("")}
            </select>
          </div>

          <div style="padding: 28px; background: rgba(10, 15, 26, 0.7); border-radius: var(--radius-md); border-left: 4px solid #d946ef; font-size: 22px; font-weight: 600; line-height: 1.7; color: #fff;">
            "${t.text}"
          </div>

          <div class="control-bar">
            <button id="playTwisterBtn" class="btn btn-accent">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              <span>${e?"Demonstration anhören":"Listen Demonstration"}</span>
            </button>

            <button id="twisterRecordBtn" class="mic-action-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>
              <span id="twisterRecordText">${e?"Tempo-Drill starten":"Start Speed Drill"}</span>
            </button>
          </div>

          <div id="twisterFeedback" style="display: none; padding: 18px; border-radius: var(--radius-md); background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.3);">
            <div style="font-size: 16px; font-weight: 700; color: #34d399;" id="twisterAccuracyScore"></div>
            <div style="font-size: 13px; color: var(--text-muted); margin-top: 4px;" id="twisterSpokenResult"></div>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 20px;">
          <div class="glass-panel" style="padding: 24px;">
            <h4 style="font-size: 16px; font-weight: 700; color: #fff; margin-bottom: 10px;">${e?"Regeln für den Zungenbrecher-Drill":"Speed Drill Rules"}</h4>
            <ol style="font-size: 13px; color: var(--text-muted); line-height: 1.8; padding-left: 18px;">
              <li>${e?"Beginnen Sie langsam mit deutlicher Konsonantenbildung.":"Start slow: focus on crisp consonant closure."}</li>
              <li>${e?"Steigern Sie schrittweise das Tempo bei entspannter Zunge.":"Gradually increase tempo while keeping your tongue loose."}</li>
              <li>${e?"Zielen Sie auf 90%+ Treffergenauigkeit ab.":"Aim for 90%+ accuracy without stumbling over syllables."}</li>
            </ol>
          </div>
        </div>
      </div>
    `}bindEvents(){if(this.container.querySelector("#tabPairsBtn").addEventListener("click",()=>{this.activeTab="minimalPairs",this.render(),this.bindEvents()}),this.container.querySelector("#tabTwistersBtn").addEventListener("click",()=>{this.activeTab="twisters",this.render(),this.bindEvents()}),this.activeTab==="minimalPairs"){const e=this.container.querySelector("#contrastSelect");e&&e.addEventListener("change",t=>{this.selectedPairCategoryIdx=parseInt(t.target.value),this.render(),this.bindEvents()}),this.container.querySelectorAll(".play-word-btn").forEach(t=>{t.addEventListener("click",i=>{const n=i.currentTarget.dataset.word;u.speak({text:n,rate:.85})})}),this.container.querySelectorAll(".test-pair-btn").forEach(t=>{t.addEventListener("click",i=>{const n=i.currentTarget.dataset.a,r=i.currentTarget.dataset.b;this.startPairTest(n,r)})})}else{const e=this.container.querySelector("#twisterSelect");e&&e.addEventListener("change",n=>{this.activeTwisterIdx=parseInt(n.target.value),this.render(),this.bindEvents()});const t=this.container.querySelector("#playTwisterBtn");t&&t.addEventListener("click",()=>{const n=this.drills.tongueTwisters[this.activeTwisterIdx];u.speak({text:n.text,rate:.9})});const i=this.container.querySelector("#twisterRecordBtn");i&&i.addEventListener("click",()=>{this.toggleTwisterRecord()})}}startPairTest(e,t){const i=this.currentLang==="de",n=this.container.querySelector("#pairTestBox"),r=this.container.querySelector("#pairTestTitle"),s=this.container.querySelector("#pairTestResult");n.style.display="block",r.textContent=i?`Sprechen Sie entweder "${e}" oder "${t}" deutlich ins Mikrofon:`:`Say either "${e}" or "${t}" into the microphone:`,s.textContent=i?"Höre zu... Jetzt sprechen!":"Listening... Speak now!",u.startListening({lang:u.getDefaultRecognitionLang(),continuous:!1,interimResults:!1,onResult:o=>{const c=(o||"").trim().toLowerCase();if(!c)return;const d=K.wordSimilarity(c,e),h=K.wordSimilarity(c,t);d>h&&d>=.7?(s.textContent=i?`🎯 Erkannt: "${e}"! Sehr präzise Aussprache!`:`🎯 Detected: "${e}"! Clear articulation!`,s.style.color="#34d399",T.playChime("success")):h>d&&h>=.7?(s.textContent=i?`🎯 Erkannt: "${t}"! Sehr präzise Aussprache!`:`🎯 Detected: "${t}"! Clear articulation!`,s.style.color="#34d399",T.playChime("success")):(s.textContent=i?`Erkannt: "${c}". Betonen Sie den Unterschied zwischen "${e}" und "${t}" noch klarer.`:`Detected: "${c}". Try to distinguish the vowel or consonant more crisply.`,s.style.color="#fbbf24",T.playChime("tap"))},onError:()=>{s.textContent=i?"Konnte leider nicht deutlich verstanden werden. Bitte erneut versuchen.":"Could not catch that clearly. Please try again."}})}toggleTwisterRecord(){const e=this.currentLang==="de",t=this.container.querySelector("#twisterRecordBtn"),i=this.container.querySelector("#twisterRecordText"),n=this.container.querySelector("#twisterFeedback"),r=this.container.querySelector("#twisterAccuracyScore"),s=this.container.querySelector("#twisterSpokenResult"),o=this.drills.tongueTwisters[this.activeTwisterIdx];if(this.isRecordingTwister){this.isRecordingTwister=!1,t.classList.remove("recording"),i.textContent=e?"Tempo-Drill starten":"Start Speed Drill",u.stopListening();return}this.isRecordingTwister=!0,t.classList.add("recording"),i.textContent=e?"Höre zu... Zungenbrecher aufsagen!":"Listening... Say Twister!",n.style.display="none";let c="";u.startListening({lang:u.getDefaultRecognitionLang(),continuous:!0,interimResults:!0,onInterim:({full:d})=>{c=d},onResult:d=>{const h=d||c;if(this.isRecordingTwister=!1,t.classList.remove("recording"),i.textContent=e?"Tempo-Drill starten":"Start Speed Drill",!h||!h.trim())return;const p=K.evaluateSpeech({referenceText:o.text,spokenText:h});n.style.display="block",r.textContent=`${e?"Tempo-Drill Genauigkeit":"Speed Drill Accuracy"}: ${p.accuracy}% (${p.wordsPerMinute} WPM)`,s.textContent=`${e?"Gesprochen":"Spoken"}: "${h}"`,p.accuracy>=80?(T.playChime("success"),U({particleCount:50,spread:50})):T.playChime("tap"),A.recordActivity({words:o.text.split(" ").length,accuracy:p.accuracy})},onError:()=>{this.isRecordingTwister=!1,t.classList.remove("recording"),i.textContent=e?"Tempo-Drill starten":"Start Speed Drill"}})}}const Ke={it_support:{id:"it_support",icon:"💻",title:{en:"IT Support & Service Desk",de:"IT-Support & Service Desk",ar:"دعم تكنولوجيا المعلومات ومكتب الخدمة"},subtitle:{en:"Ticket lifecycles, Active Directory, remote desktop, and polite user de-escalation",de:"Ticket-Lebenszyklus, Active Directory, Fernwartung und professionelle Deeskalation",ar:"إدارة التذاكر، الدليل النشط، الصيانة عن بُعد، والتواصل الاحترافي المهذب"}},lab_medical:{id:"lab_medical",icon:"🔬",title:{en:"Medical & Chemical Laboratory",de:"Medizinisches & Chemisches Labor",ar:"المختبرات الطبية والكيميائية"},subtitle:{en:"Specimen intake, pre-analytics, calibration, quality control, and critical value reporting",de:"Probenannahme, Präanalytik, Kalibrierung, Qualitätskontrolle und Grenzwertmeldungen",ar:"استلام العينات، مراحل التحليل، المعايرة، ضبط الجودة، والإبلاغ عن القيم الحرجة"}}},ae={de:{it_support:[{id:"it_ad_lockout_de",title:"Active-Directory-Konto gesperrt (Deeskalation)",level:"B2",persona:{name:"Frau Sabine Schneider (Vertrieb)",role:"Aufgebrachte Endanwenderin",avatar:"👩‍💼",tone:"Besorgt und frustriert"},context:"Eine Mitarbeiterin aus dem Vertrieb kann sich kurz vor einer wichtigen Kundenpräsentation nicht an ihrem PC anmelden. Ihr Konto wurde nach drei falschen Passworteingaben gesperrt.",steps:[{speaker:"Frau Schneider",avatar:"👩‍💼",aiSpeech:"Guten Tag! Ich brauche sofort Hilfe! Mein Bildschirm zeigt an, dass mein Konto gesperrt ist. Ich habe in zehn Minuten eine Vorstandspräsentation und kann auf nichts zugreifen!",suggestedResponses:["Guten Tag, Frau Schneider. Keine Sorge, ich kümmere mich sofort darum. Könnten Sie mir bitte Ihren Benutzernamen oder Ihre Personalnummer nennen?","Hallo Frau Schneider, beruhigen Sie sich bitte. Warum haben Sie Ihr Passwort denn dreimal falsch eingegeben?","Guten Tag. Bitte nennen Sie mir Ihren Computernamen, damit ich das Konto in der Active Directory entsperren kann."],bestResponseIdx:0,feedback:{correction:{original:"Hallo Frau Schneider, warum haben Sie das Passwort falsch eingegeben?",refined:"Guten Tag, Frau Schneider. Keine Sorge, ich kümmere mich sofort darum. Nennen Sie mir bitte kurz Ihren Benutzernamen.",reasonAr:"تجنب لوم المستخدم (Warum haben Sie...) في لحظات التوتر. ابدأ بطمأنته والتأكيد على التحرك الفوري مع طلب اسم المستخدم بلباقة بصيغة الاحترام (Siezen)."},vocabTip:{term:"das Benutzerkonto entsperren / die Sperrung aufheben",ipa:"[das bəˈnʊtsɐˌkɔntoː ɛntˈʃpɛʁən]",ar:"إلغاء قفل حساب المستخدم في النظام"},followUp:"Überprüfen Sie den Status in der AD-Verwaltungskonsole und fragen Sie nach, ob ein temporäres Kennwort benötigt wird.",arabicNotes:'في بيئة العمل الألمانية، يُعد استخدام صيغة "Siezen" مع نبرة هادئة وحازمة (Deeskalation) هو المعيار الأساسي لتقليل توتر العميل والالتزام بـ SLA.'}},{speaker:"Frau Schneider",avatar:"👩‍💼",aiSpeech:"Mein Benutzername ist s.schneider. Ich glaube, die Feststelltaste war aktiviert. Können Sie das direkt freischalten?",suggestedResponses:["Vielen Dank. Ich habe Ihr Konto in der Active Directory aufgerufen und die Sperrung soeben aufgehoben. Bitte versuchen Sie nun erneut, sich anzumelden.","Ja, das ist typisch mit der Feststelltaste. Jetzt sollte es wieder gehen, probieren Sie es einfach mal.","Ich habe das Konto entsperrt und Ihnen sicherheitshalber ein temporäres Kennwort vergeben. Bitte ändern Sie dieses bei der ersten Anmeldung."],bestResponseIdx:0,feedback:{correction:{original:"Ja, das ist typisch mit der Feststelltaste. Probieren Sie mal.",refined:"Ich habe die Sperrung in der Active Directory soeben aufgehoben. Bitte versuchen Sie erneut, sich anzumelden.",reasonAr:'استخدم لغة مهنية تقنية دقيقة بدلاً من التعليقات غير الرسمية (das ist typisch). استخدم عبارات مثل "die Sperrung aufheben" و "erneut anmelden".'},vocabTip:{term:"die Feststelltaste (Caps Lock) / die Kennwortrichtlinie",ipa:"[diː ˈfɛstˌʃtɛltaːstə]",ar:"زر الحروف الكبيرة (Caps Lock) / سياسة كلمات المرور"},followUp:"Warten Sie am Telefon, bis die Anwenderin den erfolgreichen Login bestätigt hat.",arabicNotes:"من آداب الـ IT Service Desk الاحترافي البقاء على الخط حتى يتأكد المستخدم من نجاح الدخول لتجنب فتح تذكرة جديدة."}}]},{id:"it_remote_network_de",title:"Fernwartung & Netzwerk-Timeout (Troubleshooting)",level:"B2",persona:{name:"Herr Dr. Michael Weber (Forschung & Entwicklung)",role:"Wissenschaftlicher Projektleiter",avatar:"👨‍💻",tone:"Ruhig, benötigt zügige Lösung"},context:"Ein Entwickler kann keine Verbindung zum zentralen Versionskontrollserver und ERP-System aufbauen. Der IT-Support schaltet sich per Fernwartung (TeamViewer/QuickAssist) auf.",steps:[{speaker:"Herr Dr. Weber",avatar:"👨‍💻",aiSpeech:"Guten Tag, IT-Support? Ich erhalte seit einer halben Stunde ständige Timeouts beim Zugriff auf unser Netzlaufwerk und das Git-Repository. Alle anderen Webseiten laden normal.",suggestedResponses:["Guten Tag, Herr Dr. Weber. Das klingt nach einem Routing- oder VPN-Problem. Darf ich mich kurz per Fernwartung auf Ihren Rechner aufschalten, um die Verbindung zu diagnostizieren?","Hallo! Haben Sie schon versucht, Ihren Router und den PC neu zu starten?","Guten Tag. Das Git-Repository ist sicher überlastet, warten Sie einfach noch ein bisschen."],bestResponseIdx:0,feedback:{correction:{original:"Haben Sie schon den Router neu gestartet?",refined:"Darf ich mich kurz per Fernwartung auf Ihren Rechner aufschalten, um die Netzwerkverbindung und das Routing zu prüfen?",reasonAr:"في بيئات الشركات الكبرى، طلب جلسة مساعدة عن بُعد (Fernwartungssitzung) بأسلوب مهني أكثر فاعلية من تقديم نصائح عامة كإعادة تشغيل الراوتر المنزلي."},vocabTip:{term:"die Fernwartungssitzung einleiten / das Netzlaufwerk verbinden",ipa:"[diː ˈfɛʁnˌvaʁtʊŋsˌzɪtsʊŋ]",ar:"بدء جلسة صيانة ومساعدة عن بُعد / ربط محرك الأقراص الشبكي"},followUp:"Bitten Sie den Anwender höflich um die Fernwartungs-ID oder den Freigabecode.",arabicNotes:'تذكر صيغة الاستئذان الرسمية في الألمانية: "Darf ich mich kurz aufschalten?" أو "Gestatten Sie mir, kurz per Fernwartung...".'}}]}],lab_medical:[{id:"lab_critical_val_de",title:"Pathologischer Kalium-Grenzwert (Dringende Meldung)",level:"B2",persona:{name:"Dr. med. Thomas Keller",role:"Stationsarzt Kardiologie (Station 3B)",avatar:"👨‍⚕️",tone:"Beschäftigt, aber aufmerksam auf Notfälle"},context:"Im Zentrallabor ergibt die Serum-Elektrolyt-Messung bei einem stationären Patienten einen lebensbedrohlichen Kaliumwert von 7,1 mmol/l (Hyperkaliämie). Sie müssen den Stationsarzt sofort telefonisch informieren und den Anruf dokumentieren.",steps:[{speaker:"Dr. Keller",avatar:"👨‍⚕️",aiSpeech:"Station 3B, Dr. Keller am Apparat, was gibt es?",suggestedResponses:["Guten Tag, Herr Dr. Keller, hier ist das Zentrallabor. Ich habe einen kritischen Alarmwert für Herrn Walter Krause, Geburtsdatum 14.05.1958: Serum-Kalium liegt bei 7,1 Millimol pro Liter.","Hallo Dr. Keller, der Kaliumwert von einem Ihrer Patienten ist ziemlich hoch, schauen Sie bitte ins System.","Guten Tag. Wir haben eine Probe gemessen, und das Kalium ist 7,1. Ist die Probe vielleicht hämolytisch?"],bestResponseIdx:0,feedback:{correction:{original:"Der Wert ist ziemlich hoch, schauen Sie ins System.",refined:"Ich habe einen kritischen Alarmwert für Herrn [Name, Geburtsdatum]: Serum-Kalium liegt bei 7,1 mmol/l.",reasonAr:"عند الإبلاغ عن قيمة حرجة (Kritischer Alarmwert / Pathologischer Grenzwert)، يجب ذكر هوية المريض كاملة (الاسم وتاريخ الميلاد) مع القيمة الدقيقة ووحدتها فوراً لمنع أي لبس طبي."},vocabTip:{term:"der pathologische Grenzwert / die Hyperkaliämie",ipa:"[paːtoˈloːɡɪʃɐ ˈɡʁɛnt͡sˌveːɐ̯t]",ar:"القيمة الحدية المرضية / فرط بوتاسيوم الدم"},followUp:'Bitten Sie den Arzt um ein kurzes "Read-back" (Gegenlesen des Wertes) zur Dokumentation im LIS (Laborinformationssystem).',arabicNotes:"في بروتوكولات المختبرات الطبية الألمانية (Rili-BÄK)، يُعد التوثيق الفوري مع وقت المكالمة واسم الطبيب المتلقي إلزامياً قانونياً."}},{speaker:"Dr. Keller",avatar:"👨‍⚕️",aiSpeech:"7,1 mmol/l bei Walter Krause? Das ist ein akuter Notfall! Wurde eine Hämolyse ausgeschlossen und ist die Messung wiederholt worden?",suggestedResponses:["Ja, der Hämolyse-Index ist unauffällig und wir haben die Messung auf einem Zweitgerät bereits validiert bestätigt.","Nein, wir haben es nur einmal durchs Gerät geschoben, aber die Maschine zeigt keine Fehler.","Die Probe sah ganz normal aus, ich trage das jetzt einfach so ein."],bestResponseIdx:0,feedback:{correction:{original:"Die Probe sah ganz normal aus, die Maschine zeigt keine Fehler.",refined:"Der Hämolyse-Index ist unauffällig und die Kontrollmessung auf dem Zweitgerät hat den Wert bestätigt.",reasonAr:'في المختبر، لا نعتمد على التقدير البصري (sah ganz normal aus)، بل على مؤشرات علمية كـ "Hämolyse-Index" والتحقق المزدوج "Validierung auf einem Zweitgerät".'},vocabTip:{term:"der Hämolyse-Index / die Doppelbestimmung",ipa:"[hɛmolyːzə ˈɪndɛks]",ar:"مؤشر انحلال الدم / القياس التأكيدي المزدوج"},followUp:"Notieren Sie den Namen des Arztes und die Uhrzeit im LIS-Befund.",arabicNotes:"انحلال الدم (Hämolyse) يؤدي إلى خروج البوتاسيوم من كريات الدم الحمراء ويعطي نتيجة كاذبة الارتفاع (falsch-positiv)، لذلك فحص المؤشر خطوة حاسمة."}}]},{id:"lab_qc_outlier_de",title:"Qualitätskontrolle & Westgard-Regel (Abweichung)",level:"B2",persona:{name:"Frau Dr. Weber",role:"Leitende BMA / Laborleitung",avatar:"👩‍🔬",tone:"Analytisch, qualitätsbewusst"},context:"Bei der morgendlichen internen Qualitätskontrolle (iQK) am Großanalysegerät für klinische Chemie weicht die Glukose-Kontrollprobe um mehr als 3 Standardabweichungen ab (Verletzung der Westgard-Regel 1-3s).",steps:[{speaker:"Frau Dr. Weber",avatar:"👩‍🔬",aiSpeech:"Guten Morgen. Ich sehe in der Leitzentrale, dass die Glukose-Messreihe blockiert ist. Was ist bei der internen Qualitätskontrolle vorgefallen?",suggestedResponses:["Guten Morgen, Frau Dr. Weber. Die Kontrollmessung für Glukose liegt außerhalb von 3 Standardabweichungen (+3,2s). Ich habe den Parameter gesperrt, um Patientenproben zu schützen.","Hallo. Das Gerät spinnt heute wieder ein bisschen, der Wert ist zu hoch. Soll ich es einfach nochmal laufen lassen?","Guten Morgen. Wir haben noch keine Patientenproben gemessen, ich wollte gerade die Kalibrierung erneuern."],bestResponseIdx:0,feedback:{correction:{original:"Das Gerät spinnt, soll ich es einfach nochmal laufen lassen?",refined:"Die Kontrollmessung liegt außerhalb von 3 Standardabweichungen. Ich habe den Parameter vorschriftsmäßig gesperrt.",reasonAr:"تجنب التعبيرات العامية (das Gerät spinnt). التقرير المهني لمديرة المختبر يتطلب ذكر المصطلحات الإحصائية الدقيقة (Standardabweichung) والإجراء الاحترازي المتبع."},vocabTip:{term:"die Standardabweichung (SD) / die Westgard-Regeln / den Parameter sperren",ipa:"[ˈʃtandaʁtˌʔapvaɪ̯çʊŋ]",ar:"الانحراف المعياري / قواعد ويستغارد لضبط الجودة / إيقاف المعامل"},followUp:"Schlagen Sie die Ursachenanalyse vor: Reagenziencharge, Verfallsdatum oder Kalibrierungsdrift.",arabicNotes:"وفق معايير ISO 15189 وضوابط Rili-BÄK، فإن خرق قاعدة 1:3s يعني خطأً عشوائياً أو نظامياً جسيماً يفرض إيقاف إطلاق نتائج المرضى فوراً."}}]}]},en:{it_support:[{id:"it_ad_lockout_en",title:"Active Directory Account Lockout (De-escalation)",level:"B2",persona:{name:"Ms. Sarah Jenkins (Sales Director)",role:"Urgent Non-Technical User",avatar:"👩‍💼",tone:"Frustrated and in a rush"},context:"A sales executive is locked out of her enterprise domain workstation 10 minutes before a crucial client webinar due to repeated bad password attempts.",steps:[{speaker:"Ms. Jenkins",avatar:"👩‍💼",aiSpeech:"Hello IT Service Desk! I need immediate help. My screen says my account is locked out and I have a board presentation starting in ten minutes!",suggestedResponses:["Good morning, Ms. Jenkins. Please do not worry, I will resolve this immediately. Could you please confirm your enterprise username or employee ID?","Hi Sarah, calm down. Why did you type your password wrong so many times?","Hello. You need to restart your laptop and try typing slower."],bestResponseIdx:0,feedback:{correction:{original:"Why did you type your password wrong so many times?",refined:"Good morning, Ms. Jenkins. I understand the urgency and will resolve this right away. Could you please confirm your username?",reasonAr:"تجنب استجواب المستخدم الغاضب أو لومه. ابدأ بإظهار التفهم والتعاطف المهني (empathy) ثم اطلب اسم المستخدم للحل الفوري."},vocabTip:{term:"to unlock the account / adhere to SLA (Service Level Agreement)",ipa:"[tuː ʌnˈlɒk ðiː əˈkaʊnt]",ar:"إلغاء قفل الحساب / الالتزام باتفاقية مستوى الخدمة"},followUp:"Unlock the account in the AD Users and Computers console and verify password synchronization.",arabicNotes:'في خدمة العملاء باللغة الإنجليزية، استخدام العبارات الملطفة مثل "Please do not worry" و "I will resolve this immediately" يعكس كفاءة الدعم الفني.'}},{speaker:"Ms. Jenkins",avatar:"👩‍💼",aiSpeech:"My username is s.jenkins. I think Caps Lock was turned on when I unlocked my docking station. Can you clear it right now?",suggestedResponses:["I have accessed Active Directory and successfully cleared the lockout flag. Please try logging in once more.","Yeah, Caps Lock happens all the time. Try again now.","I cleared it, but next time you should be much more careful with Caps Lock."],bestResponseIdx:0,feedback:{correction:{original:"Yeah, Caps Lock happens all the time. Try again.",refined:"I have successfully cleared the lockout flag in Active Directory. Please go ahead and log in now.",reasonAr:"الصياغة الاحترافية تتجنب التعليقات الاستخفافية وتركز على الإجراء التقني الدقيق مع دعوة المستخدم للمحاولة مجدداً."},vocabTip:{term:"to clear the lockout flag / domain controller",ipa:"[klɪə ðə ˈlɒkaʊt flæɡ]",ar:"مسح علامة القفل من خادم النطاق"},followUp:"Remain on the line until the user confirms successful authentication.",arabicNotes:"من أفضل ممارسات الـ ITIL إنهاء المكالمة فقط بعد التأكد من تسجيل دخول المستخدم الفعلي."}}]},{id:"it_remote_network_en",title:"Remote Support & VPN Gateway Timeout",level:"B2",persona:{name:"Mr. David Miller (Senior Analyst)",role:"Remote Employee",avatar:"👨‍💻",tone:"Professional, seeking diagnostic assistance"},context:"A financial analyst working remotely is experiencing gateway timeouts while attempting to mount shared secure drives over the corporate VPN tunnel.",steps:[{speaker:"Mr. Miller",avatar:"👨‍💻",aiSpeech:"Good morning, Service Desk. I am having recurring timeout errors connecting to our shared network drive through the corporate VPN, although my public internet is fine.",suggestedResponses:["Good morning, Mr. Miller. That sounds like a VPN routing or authentication handshake issue. With your permission, may I initiate a quick remote session to inspect your network adapter settings?","Hey David, just disconnect your Wi-Fi and reconnect again, that usually fixes it.","Hello. That server might be down, please check back in a few hours."],bestResponseIdx:0,feedback:{correction:{original:"Hey David, just disconnect Wi-Fi and reconnect.",refined:"With your permission, may I initiate a quick remote desktop session to inspect the VPN tunnel configuration?",reasonAr:"استخدم لغة استئذان مهنية مسبقة (With your permission, may I initiate...) لفحص المشكلة تقنياً بدلاً من الاقتراحات الارتجالية."},vocabTip:{term:"remote desktop session / VPN tunnel handshake",ipa:"[rɪˈməʊt ˈdɛsktɒp ˈsɛʃən]",ar:"جلسة سطح المكتب البعيد / مصافحة نفق الشبكة الافتراضية الخاصة"},followUp:"Guide the user on accepting the remote screen-sharing prompt.",arabicNotes:"تأكد دائماً من نطق المصطلحات التقنية بدقة ووضوح في بيئات العمل متعددة الجنسيات."}}]}],lab_medical:[{id:"lab_critical_val_en",title:"Critical Serum Potassium Alert (Urgent Notification)",level:"B2",persona:{name:"Dr. Arthur Evans",role:"Attending Cardiologist (Ward 4B)",avatar:"👨‍⚕️",tone:"Urgent, clinical, focused"},context:"The clinical chemistry analyzer detects a severe, life-threatening hyperkalemia of 7.2 mmol/L. You must immediately notify the ward physician and document the verbal read-back.",steps:[{speaker:"Dr. Evans",avatar:"👨‍⚕️",aiSpeech:"Ward 4B, Dr. Evans speaking. How can I help you?",suggestedResponses:["Good morning, Dr. Evans. This is the central clinical lab calling with an urgent critical value for patient Robert Hayes, DOB March 12, 1964. Serum potassium is 7.2 mmol/L.","Hello Dr. Evans, one of your patients has a really dangerous potassium value in the computer, you should check it.","Hi Doctor, we ran a blood tube and potassium is high, but maybe the nurse took it badly?"],bestResponseIdx:0,feedback:{correction:{original:"One of your patients has a dangerous potassium value, check it.",refined:"This is the central laboratory with an urgent critical value for [Patient Name, DOB]: Serum potassium is 7.2 mmol/L.",reasonAr:"في الاتصالات الطبية الطارئة، لا تطلب من الطبيب تفقد الحاسوب، بل أبلغه شفهياً بالاسم وتاريخ الميلاد والقيمة ووحدتها بوضوح قاطع."},vocabTip:{term:"critical alert value / life-threatening hyperkalemia",ipa:"[ˈkrɪtɪkəl əˈlɜːt ˈvæljuː]",ar:"قيمة التنبيه الحرجة / فرط بوتاسيوم الدم المهدد للحياة"},followUp:"Request a verbal read-back from the physician to confirm accurate receipt.",arabicNotes:'البروتوكول الطبي العالمي يقتضي طلب "Read-back" (إعادة قراءة القيمة من الطبيب) لمنع الأخطاء السمعية القاتلة.'}},{speaker:"Dr. Evans",avatar:"👨‍⚕️",aiSpeech:"7.2 mmol/L for Robert Hayes, noted. Was hemolysis ruled out and has the result been re-verified on a secondary analyzer?",suggestedResponses:["Yes, doctor. The hemolysis index is clear and we have completed a duplicate run on our secondary platform with consistent findings.","Well, we just ran the tube once, but the machine has valid calibration.","The sample looked normal to my eye, so it should be fine."],bestResponseIdx:0,feedback:{correction:{original:"The sample looked normal to my eye, so it should be fine.",refined:"The hemolysis index is completely clear and the finding was validated through a duplicate run on our secondary platform.",reasonAr:"في الاعتماد المخبري، التحقق الآلي من مؤشر التحلل (Hemolysis index) وإجراء الفحص التأكيدي المزدوج هما الدليل الوحيد المقبول."},vocabTip:{term:"duplicate run / hemolysis index / secondary platform",ipa:"[ˈdjuːplɪkət rʌn]",ar:"إجراء فحص تأكيدي مكرر / مؤشر انحلال الدم / جهاز التحليل الثانوي"},followUp:"Record Dr. Evans' name and exact timestamp in the LIS critical incident log.",arabicNotes:"توثيق اسم الطبيب والوقت في سجل الحوادث الحرجة بنظام معلومات المختبر (LIS) يحمي المختبر من المسؤولية القانونية."}}]}]}},Ue={it_support:[{termDe:"das Benutzerkonto entsperren",termEn:"to unlock the user account",category:"Active Directory",level:"A2-B1",ipa:"[das bəˈnʊtsɐˌkɔntoː ɛntˈʃpɛʁən]",defDe:"Die administrative Aufhebung einer Kontosperre nach wiederholten Fehlversuchen beim Login.",defEn:"Administrative restoration of user login access following consecutive failed authentication attempts.",defAr:"إلغاء قفل حساب المستخدم بعد محاولات تسجيل دخول خاطئة متعددة.",sampleDe:"Ich habe das Benutzerkonto in der Active Directory entsperrt; bitte melden Sie sich erneut an.",sampleEn:"I have unlocked your account in Active Directory; please go ahead and log in again."},{termDe:"die Fernwartungssitzung",termEn:"remote desktop session",category:"Remote Support",level:"B1-B2",ipa:"[diː ˈfɛʁnˌvaʁtʊŋsˌzɪtsʊŋ]",defDe:"Direkte Bildschirmübertragung zur Fehlerbehebung auf dem Endgerät des Anwenders.",defEn:"Direct screen sharing connection to troubleshoot issues on the user workstation.",defAr:"جلسة صيانة ودعم فني عن بُعد عبر مشاركة شاشة جهاز المستخدم.",sampleDe:"Darf ich eine Fernwartungssitzung starten, um die Druckertreiber zu aktualisieren?",sampleEn:"May I initiate a remote desktop session to update your local print drivers?"},{termDe:"das Störungsticket eskalieren",termEn:"to escalate an incident ticket",category:"ITIL & Service Desk",level:"B2",ipa:"[das ˈʃtøːʁʊŋsˌtɪkət ɛskaˈliːʁən]",defDe:"Weiterleitung eines komplexen Problems an den 2nd-Level-Support oder Systemingenieure.",defEn:"Forwarding a critical or unresolved ticket to 2nd-level support or specialized engineering teams.",defAr:"تصعيد تذكرة العطل الفني إلى المستوى الثاني من الدعم أو إلى مهندسي الأنظمة.",sampleDe:"Wegen der drohenden SLA-Verletzung habe ich das Ticket direkt an das Netzwerkteam eskaliert.",sampleEn:"Due to the imminent SLA breach, I have escalated the incident ticket to the network team."},{termDe:"die Zugriffsrechte verwalten",termEn:"to manage access permissions",category:"Security & Active Directory",level:"B2",ipa:"[diː ˈtsuːɡʁɪfsˌʁɛçtə fɛɐ̯ˈvaltn̩]",defDe:"Zuweisung und Entzug von Ordner- und Datenbankberechtigungen nach dem Least-Privilege-Prinzip.",defEn:"Assignment and revocation of folder and database rights following the least-privilege principle.",defAr:"إدارة صلاحيات الوصول للمجلدات وقواعد البيانات وفق مبدأ الحد الأدنى من الامتيازات.",sampleDe:"Die Zugriffsrechte für den neuen Mitarbeiter wurden gemäß der Gruppenrichtlinie hinterlegt.",sampleEn:"The access permissions for the new hire have been configured according to group policy."}],lab_medical:[{termDe:"die Probenannahme & das Barcoding",termEn:"specimen intake and barcode scanning",category:"Pre-Analytics",level:"A2-B1",ipa:"[diː ˈpʁoːbn̩ˌʔanaːmə]",defDe:"Eingangskontrolle von Blut- und Gewebeproben auf Unversehrtheit und eindeutige Patientenidentifikation.",defEn:"Initial inspection of blood and tissue tubes for integrity and unambiguous patient barcode ID.",defAr:"فحص واستلام العينات الطبية والتحقق من سلامتها وتطابق الباركود التعريفي للمريض.",sampleDe:"Bei der Probenannahme muss jedes EDTA-Röhrchen sofort gescannt und registriert werden.",sampleEn:"During specimen intake, every EDTA tube must be scanned and registered immediately."},{termDe:"der pathologische Grenzwert",termEn:"critical pathological threshold / alert value",category:"Reporting & Analysis",level:"B2",ipa:"[paːtoˈloːɡɪʃɐ ˈɡʁɛnt͡sˌveːɐ̯t]",defDe:"Extremwert eines Laborparameters, der ein unmittelbares vitales Risiko für den Patienten darstellt.",defEn:"An extreme lab result indicating immediate, life-threatening clinical risk requiring urgent notification.",defAr:"قيمة مخبرية غير طبيعية وحرجة تمثل خطورة مباشرة على حياة المريض وتستدعي إبلاغاً فورياً.",sampleDe:"Bei einem Kaliumwert von über 6,5 mmol/l greift sofort das Meldeschema für pathologische Grenzwerte.",sampleEn:"A potassium level exceeding 6.5 mmol/L immediately triggers the critical alert reporting protocol."},{termDe:"die Qualitätskontrolle & Westgard-Regeln",termEn:"internal quality control & Westgard rules",category:"Quality Assurance",level:"B2-C1",ipa:"[diː kvaliˈtɛːts kɔnˌtʁɔlə]",defDe:"Tägliche statistische Überprüfung der Messpräzision mittels Kontrollseren zur Fehlererkennung.",defEn:"Daily statistical precision verification using control sera to detect random and systematic errors.",defAr:"ضبط الجودة اليومي الداخلي وتطبيق قواعد ويستغارد الإحصائية لاكتشاف الأخطاء العشوائية والنظامية.",sampleDe:"Nach Verletzung der 1-3s-Westgard-Regel muss eine Rekalibrierung der Glukose-Reagenz erfolgen.",sampleEn:"Following a 1-3s Westgard rule violation, the glucose reagent assay must be recalibrated."},{termDe:"das Sicherheitsdatenblatt (SDB)",termEn:"Safety Data Sheet (SDS)",category:"Chemical Safety",level:"B1-B2",ipa:"[das ˈzɪçɐhaɪ̯tsˌdaːtn̩ˌblat]",defDe:"Gesetzlich vorgeschriebenes Dokument mit Schutzmaßnahmen, Gefahrenpiktogrammen und Entsorgungshinweisen.",defEn:"Legally mandated safety document outlining hazard pictograms, protective gear, and spill handling.",defAr:"صحيفة بيانات سلامة المواد الكيميائية التي تحدد المخاطر وإجراءات الحماية والتخلص الآمن.",sampleDe:"Vor dem Ansetzen der Formalin-Lösung muss das entsprechende Sicherheitsdatenblatt studiert werden.",sampleEn:"Before preparing the formalin solution, the corresponding safety data sheet must be reviewed."}]},j={de:[{domain:"it_support",title:"Ticket-Status-Aktualisierung (ITIL)",rawDraft:"Hallo Herr Schmidt, ich habe Ihr Ticket gesehen. Wir können jetzt nichts machen weil Server kaputt ist. Wir melden uns später wenn geht.",polished:"Guten Tag, Herr Schmidt. Bezüglich Ihres gemeldeten Vorfalls (Ticket #4092) möchten wir Sie darüber informieren, dass unsere Systemtechnik derzeit an einer unvorhergesehenen Serverstörung arbeitet. Wir rechnen mit einer Behebung innerhalb der nächsten zwei Stunden und halten Sie über den Fortschritt auf dem Laufenden.",diffNotes:['Ersetzung der Umgangssprache ("nichts machen", "kaputt") durch professionelle ITIL-Terminologie ("unvorhergesehene Serverstörung").','Verbindliche Zeitschätzung statt vagem "später wenn geht".','Höfliche und vertrauensbildende Schlussformel ("halten Sie auf dem Laufenden").'],arabicExplanation:'الرسالة الأصلية عامية وضعيفة جداً وتفقد العميل الثقة. في بيئة العمل الألمانية، يجب استخدام مصطلحات دقيقة مثل "unvorhergesehene Serverstörung" بدلاً من "kaputt"، وتقديم إطار زمني تقديري مع الالتزام بصيغة "Siezen".'},{domain:"lab_medical",title:"Hämolytische Probe & Nachforderung",rawDraft:"Guten Tag Station 2. Die Blutprobe von Patient Müller ist kaputt und rot. Wir können nichts messen. Schicken Sie schnell neues Blut.",polished:"Guten Tag, Station 2. Bei der heute eingegangenen Serumprobe von Herrn Müller (Geb. 03.11.1965) wurde ein ausgeprägter Hämolyse-Index festgestellt. Eine zuverlässige Bestimmung der Kalium- und LDH-Werte ist methodisch nicht möglich. Wir bitten höflich um eine zeitnahe Abnahme einer Ersatzprobe.",diffNotes:['Vermeidung von Laiensprache ("Blut ist kaputt und rot") -> "ausgeprägter Hämolyse-Index".','Konkrete Benennung der betroffenen Parameter (Kalium, LDH) statt pauschalem "nichts messen".',"Klare Patientenidentifikation und kollegiale Bitte um Nachforderung."],arabicExplanation:'لا يجوز في التقرير المخبري استخدام عبارة "الدم تالف وأحمر" بل يجب التعبير علمياً بأن هناك "ausgeprägter Hämolyse-Index"، وتحديد التحاليل المتأثرة بدقة كالبوتاسيوم، وطلب عينة بديلة بلباقة طبية.'}],en:[{domain:"it_support",title:"Incident Update & SLA Notice",rawDraft:"Hey user, your PC issue is waiting because network team is not answering us. Wait more time please.",polished:"Dear Colleague, regarding your open support request (INC-8821), our team is actively collaborating with network engineering to diagnose the packet loss. We are tracking this closely under our priority SLA and will provide an updated status within the hour.",diffNotes:['Replaced blame ("network team not answering") with professional collaboration ("actively collaborating with network engineering").',"Professional salutation and explicit ticket ID reference.","Clear SLA commitment."],arabicExplanation:'من قواعد الـ ITIL الذهبية عدم إلقاء اللوم على فرق الدعم الداخلية أمام المستخدم ("network team not answering"). يُستعاض عن ذلك بالتأكيد على العمل المشترك وتحديد موعد زمني واضح.'},{domain:"lab_medical",title:"Sample Recollection Request",rawDraft:"Hi ward, the blood tube came with no barcode and is totally clotted. Throwing it away, send another one.",polished:"Good afternoon, Ward 3. The coagulation sample received for patient Jane Doe arrived unlabelled without a primary barcode and exhibits marked micro-clotting. In accordance with laboratory biosafety and quality guidelines, we cannot process this specimen. Kindly submit a repeat citrated draw at your earliest convenience.",diffNotes:['Professional clinical register ("unlabelled", "marked micro-clotting") replacing blunt phrasing ("throwing it away").',"Explicit citation of laboratory quality and safety standards.",'Specific tube type requested ("citrated draw").'],arabicExplanation:"في بروتوكولات المختبرات، يتم ذكر عدم مطابقة العينة لمعايير الجودة (unlabelled, micro-clotting) وتحديد نوع الأنبوب المطلوب بوضوح بدلاً من العبارات الفجة."}]},Z={de:[{domain:"it_support",level:"B2",question:"Ein aufgebrachter Abteilungsleiter ruft an und verlangt, dass Sie ihm das Kennwort eines abwesenden Mitarbeiters aushändigen. Wie reagieren Sie professionell und richtlinienkonform?",options:["Geben Sie ihm das Kennwort sofort, da er der direkte Vorgesetzte ist.","Erklären Sie höflich, dass IT-Sicherheitsrichtlinien die Weitergabe persönlicher Passwörter untersagen, und bieten Sie eine offizielle Freigabe des Postfachs über den Administrator an.",'Sagen Sie unhöflich: "Das ist streng verboten, lernen Sie erst einmal Datenschutz!"',"Raten Sie ihm, das Passwort des Mitarbeiters einfach selbst zu erraten."],correctIdx:1,explanationAr:"وفق سياسات أمان تكنولوجيا المعلومات (IT Security Policies)، لا يُمنح أي طرف كلمة مرور شخصية حتى لو كان المدير المباشر. الرد المهني يرفض بلباقة ويقدم البديل الرسمي المعتمد (Freigabe des Postfachs über den Administrator)."},{domain:"lab_medical",level:"B2",question:"Bei der Probenannahme stellen Sie fest, dass ein Röhrchen für die Gerinnungsdiagnostik (Citrat-Blut) nur zur Hälfte gefüllt ist. Was ist das korrekte laboranalytische Vorgehen?",options:["Das Röhrchen trotzdem zentrifugieren und messen, um Zeit zu sparen.",'Die Probe verwerfen, im Laborinformationssystem (LIS) den Mangel "Unterfüllung / falsches Mischungsverhältnis" dokumentieren und eine Nachabnahme anfordern.',"Mit Kochsalzlösung (NaCl) bis zur Eichmarke auffüllen.","Den Wert schätzen und im Befund vermerken."],correctIdx:1,explanationAr:"في تحاليل التخثر (Citratblut)، يجب الالتزام بنسبة 1:9 الدقيقة بين مانع التخثر والدم. نقص الملء (Unterfüllung) يؤدي لنتائج خاطئة كاذبة التمديد (falsch-verlängert). الإجراء العلمي هو رفض العينة وتوثيق السبب وطلب إعادة السحب."}],en:[{domain:"it_support",level:"B2",question:'A remote user reports that their local network cable is connected, but Windows displays "No Internet Access, APIPA address 169.254.x.x". What is the most likely root cause and technical advice?',options:["The display monitor has lost its HDMI sync signal.",'The workstation failed to obtain an IP lease from the DHCP server; advise running "ipconfig /renew" or verifying network port patching.',"The user's Active Directory password has expired.","The CPU fan has overheated."],correctIdx:1,explanationAr:"عنوان APIPA (169.254.x.x) يعني أن الجهاز لم يتلق عنوان IP من خادم DHCP. الحل التقني هو محاولة تجديد العنوان (ipconfig /renew) وفحص التوصيل بالشبكة."},{domain:"lab_medical",level:"B2",question:"A potassium result of 6.8 mmol/L is flagged as a critical high alert. What is the mandatory immediate action before releasing the result?",options:["Release it online and go for a coffee break.","Inspect the sample for hemolysis, perform a duplicate verification run, and immediately call the attending physician with a verbal read-back.","Dilute the sample ten times with tap water.","Discard the patient history."],correctIdx:1,explanationAr:"الإجراء الإلزامي عند وجود قيمة حرجة للبوتاسيوم: فحص مؤشر انحلال الدم، إعادة الفحص للتأكد، والاتصال الفوري بالطبيب مع طلب قراءة تأكيدية شفهية (verbal read-back)."}]};class Oe{constructor(e){this.container=e,this.currentLang=A.getLanguage(),this.currentDomain="it_support",this.currentMode="roleplay",this.currentLevel="B2",this.showArabic=!0,this.scenarioIdx=0,this.stepIdx=0,this.chatHistory=[],this.isListening=!1,this.activeSelectedPrompt="",this.vocabSearch="",this.selectedCategory="all",this.polishPresetIdx=0,this.activePolishResult=null,this.quizIdx=0,this.selectedQuizOption=null,this.quizSubmitted=!1,this.initRoleplay(),this.render(),this.bindEvents()}setLanguage(e){this.currentLang=e,this.scenarioIdx=0,this.stepIdx=0,this.quizIdx=0,this.selectedQuizOption=null,this.quizSubmitted=!1,this.activePolishResult=null,this.initRoleplay(),this.render(),this.bindEvents()}getScenarios(){return(ae[this.currentLang]||ae.de)[this.currentDomain]||[]}getCurrentScenario(){const e=this.getScenarios();return e[this.scenarioIdx]||e[0]}getCurrentStep(){const e=this.getCurrentScenario();return!e||!e.steps?null:e.steps[this.stepIdx]||null}initRoleplay(){this.stepIdx=0,this.chatHistory=[],this.activeSelectedPrompt="";const e=this.getCurrentStep();e&&(this.chatHistory.push({sender:"ai",speaker:e.speaker,avatar:e.avatar,text:e.aiSpeech}),setTimeout(()=>{u.speak({text:e.aiSpeech,rate:.95})},350))}render(){const e=this.currentLang==="de";Ke[this.currentDomain],this.container.innerHTML=`
      <div class="vocational-studio-container">
        <!-- Main Studio Top Header -->
        <div class="section-header">
          <div class="section-title-wrap">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 24px;">💼</span>
              <h2 class="section-title">${e?"Fachsprache & Berufssimulator":"Career Pro Studio & Vocational Tutor"}</h2>
              <span class="badge badge-accent" style="background: rgba(99, 102, 241, 0.2); border-color: rgba(99, 102, 241, 0.4); color: #a5b4fc;">
                ${this.currentLevel} Workplace Pro
              </span>
            </div>
            <p class="section-subtitle">
              ${e?"Gezieltes Kommunikationstraining für IT-Support & Labor mit Arabisch-Coaching und Feedback.":"Targeted situational language training for IT Support & Medical Laboratories with Arabic coaching."}
            </p>
          </div>

          <div class="section-actions">
            <!-- Arabic Coaching Notes Toggle -->
            <button id="vocArabicToggle" class="btn btn-secondary btn-sm ${this.showArabic?"active-toggle":""}" title="Toggle Arabic explanations and coaching notes">
              <span>🇸🇦</span>
              <span>${this.showArabic?"الشرح بالعربية: مفعّل":"العربية: معطّل"}</span>
            </button>

            <!-- CEFR Level Selector -->
            <select id="vocLevelSelect" class="btn btn-secondary btn-sm" style="background: rgba(20,28,48,0.9); color: white;">
              <option value="A2" ${this.currentLevel==="A2"?"selected":""}>Level A2 (Basics)</option>
              <option value="B1" ${this.currentLevel==="B1"?"selected":""}>Level B1 (Operational)</option>
              <option value="B2" ${this.currentLevel==="B2"?"selected":""}>Level B2 (Workplace Standard)</option>
              <option value="C1" ${this.currentLevel==="C1"?"selected":""}>Level C1 (Expert / Clinical)</option>
            </select>
          </div>
        </div>

        <!-- Runtime Configuration Bar: Domains & Modes -->
        <div class="voc-config-bar glass-panel">
          <!-- Domain Switcher -->
          <div class="voc-domain-selector">
            <button class="voc-domain-btn ${this.currentDomain==="it_support"?"active it-domain":""}" data-domain="it_support">
              <span class="voc-domain-icon">💻</span>
              <div class="voc-domain-info">
                <span class="voc-domain-title">${e?"IT-Support & Service Desk":"IT Support & Service Desk"}</span>
                <span class="voc-domain-sub">Active Directory • Fernwartung • ITIL</span>
              </div>
            </button>

            <button class="voc-domain-btn ${this.currentDomain==="lab_medical"?"active lab-domain":""}" data-domain="lab_medical">
              <span class="voc-domain-icon">🔬</span>
              <div class="voc-domain-info">
                <span class="voc-domain-title">${e?"Medizinisches Labor (MTA/BMA)":"Medical & Chemical Laboratory"}</span>
                <span class="voc-domain-sub">Probenannahme • Qualitätskontrolle • Grenzwerte</span>
              </div>
            </button>
          </div>

          <!-- Mode Selector Tabs -->
          <div class="voc-modes-nav">
            <button class="voc-mode-tab ${this.currentMode==="roleplay"?"active":""}" data-mode="roleplay">
              <span>🎭</span>
              <span>${e?"1. Gesprächssimulation":"1. Scenario Simulation"}</span>
            </button>
            <button class="voc-mode-tab ${this.currentMode==="vocab"?"active":""}" data-mode="vocab">
              <span>📖</span>
              <span>${e?"2. Fachbegriffe & Glossar":"2. Vocab & Phrases"}</span>
            </button>
            <button class="voc-mode-tab ${this.currentMode==="polish"?"active":""}" data-mode="polish">
              <span>🛠️</span>
              <span>${e?"3. Text-Politur & Coaching":"3. Error Polish & Coach"}</span>
            </button>
            <button class="voc-mode-tab ${this.currentMode==="quiz"?"active":""}" data-mode="quiz">
              <span>⚡</span>
              <span>${e?"4. Situations-Quiz":"4. Scenario Quiz"}</span>
            </button>
          </div>
        </div>

        <!-- Dynamic Content Body based on Active Mode -->
        <div class="voc-mode-viewport">
          ${this.renderActiveModeContent()}
        </div>
      </div>
    `}renderActiveModeContent(){switch(this.currentMode){case"roleplay":return this.renderRoleplayMode();case"vocab":return this.renderVocabMode();case"polish":return this.renderPolishMode();case"quiz":return this.renderQuizMode();default:return this.renderRoleplayMode()}}renderRoleplayMode(){const e=this.currentLang==="de",t=this.getScenarios(),i=this.getCurrentScenario(),n=this.getCurrentStep(),r=!n||this.stepIdx>=i.steps.length;return i?`
      <div class="studio-grid">
        <!-- Left: Chat Stream & Interactive Mic / Response Panel -->
        <div class="practice-card glass-panel" style="padding: 22px;">
          <!-- Scenario Header Card -->
          <div class="card-header-bar" style="border-bottom: 1px solid var(--border-glass); padding-bottom: 14px; margin-bottom: 16px;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="font-size: 28px;">${i.persona.avatar}</span>
              <div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <h4 style="font-size: 16px; font-weight: 700; color: #fff;">${i.title}</h4>
                  <span class="badge badge-accent" style="font-size: 11px;">${i.level}</span>
                </div>
                <div style="font-size: 13px; color: var(--text-muted); margin-top: 2px;">
                  <strong>${i.persona.name}</strong> (${i.persona.role}) • <em>${i.persona.tone}</em>
                </div>
              </div>
            </div>

            <div style="display: flex; align-items: center; gap: 8px;">
              <select id="vocScenarioPicker" class="btn btn-secondary btn-sm" style="background: rgba(20,28,48,0.9); color: white;">
                ${t.map((s,o)=>`
                  <option value="${o}" ${o===this.scenarioIdx?"selected":""}>${s.title}</option>
                `).join("")}
              </select>
              <button id="vocRestartBtn" class="btn btn-secondary btn-sm">${e?"↺ Neustart":"↺ Reset"}</button>
            </div>
          </div>

          <!-- Scenario Context Banner -->
          <div class="voc-scenario-context-banner">
            <span>📋</span>
            <div><strong>${e?"Situation:":"Context:"}</strong> ${i.context}</div>
          </div>

          <!-- Chat Stream -->
          <div class="chat-conversation" id="vocChatStream" style="min-height: 280px; max-height: 440px; overflow-y: auto; padding: 12px 6px;">
            ${this.chatHistory.map(s=>`
              <div class="chat-bubble-wrap ${s.sender}">
                <div class="chat-avatar">${s.avatar}</div>
                <div class="chat-bubble">
                  <div style="font-size: 11px; opacity: 0.7; margin-bottom: 4px;">${s.speaker}</div>
                  <div>${s.text}</div>
                  ${s.sender==="ai"?`
                    <button class="btn btn-secondary btn-sm voc-replay-btn" data-text="${encodeURIComponent(s.text)}" style="margin-top: 8px; font-size: 11px; padding: 3px 8px;">
                      ${e?"🔊 Anhören":"🔊 Listen"}
                    </button>
                  `:""}

                  <!-- Discrete Feedback Card under User message -->
                  ${s.feedback?this.renderFeedbackCard(s.feedback):""}
                </div>
              </div>
            `).join("")}
          </div>

          <!-- Active Reply Area -->
          ${!r&&n?`
            <div class="voc-reply-box" style="margin-top: 14px; border-top: 1px solid var(--border-glass); padding-top: 14px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <span style="font-size: 13px; font-weight: 600; color: #cbd5e1;">
                  ${e?"Ihre professionelle Antwort (Klicken oder per Mikrofon einsprechen):":"Your Professional Response (Click or speak via mic):"}
                </span>
                <span class="badge badge-level">${e?"Schritt":"Step"} ${this.stepIdx+1} / ${i.steps.length}</span>
              </div>

              <!-- Suggested Response Cards -->
              <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px;">
                ${n.suggestedResponses.map((s,o)=>`
                  <div class="suggested-reply-card voc-suggested-card ${this.activeSelectedPrompt===s?"active-prompt":""}" data-idx="${o}" data-text="${encodeURIComponent(s)}">
                    <span style="flex: 1;">${s}</span>
                    <button class="btn btn-secondary btn-sm voc-preview-audio-btn" data-text="${encodeURIComponent(s)}" style="font-size: 11px; padding: 2px 6px;">
                      🔊
                    </button>
                  </div>
                `).join("")}
              </div>

              <!-- Custom Text / Mic Input Bar -->
              <div style="display: flex; gap: 10px; align-items: center;">
                <input type="text" id="vocCustomReplyInput" class="form-input" style="flex: 1;" placeholder="${e?"Oder formulieren Sie Ihre eigene Antwort hier...":"Or type your own custom response here..."}" value="${this.activeSelectedPrompt||""}" spellcheck="false" autocorrect="off" autocapitalize="none" autocomplete="off" />
                
                <button id="vocMicBtn" class="btn ${this.isListening?"btn-danger pulse":"btn-secondary"}" style="padding: 10px 14px;" title="Speak with microphone">
                  ${this.isListening?"🔴 Höre...":"🎙️ Sprechen"}
                </button>

                <button id="vocSendReplyBtn" class="btn btn-primary" style="padding: 10px 18px;">
                  ${e?"Senden ↵":"Send ↵"}
                </button>
              </div>
            </div>
          `:`
            <div class="completion-banner glass-panel" style="margin-top: 16px; padding: 20px; text-align: center; background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.3);">
              <span style="font-size: 32px;">🎉</span>
              <h3 style="font-size: 18px; font-weight: 700; color: #34d399; margin: 6px 0;">
                ${e?"Szenario erfolgreich gemeistert!":"Scenario Successfully Completed!"}
              </h3>
              <p style="font-size: 13px; color: #cbd5e1;">
                ${e?"Hervorragende Deeskalation und fachgerechte Protokollführung im Berufsalltag.":"Excellent situational handling, adherence to industry protocols, and polite workplace communication."}
              </p>
              <button id="vocNextScenarioBtn" class="btn btn-primary" style="margin-top: 12px;">
                ${e?"Nächstes Fachszenario →":"Next Scenario →"}
              </button>
            </div>
          `}
        </div>

        <!-- Right: Real-time Coaching Guide & Protocol Cheat Sheet -->
        <div class="metrics-panel glass-panel" style="padding: 20px; display: flex; flex-direction: column; gap: 16px;">
          <div class="card-header-bar" style="padding-bottom: 8px;">
            <h4 style="font-size: 15px; font-weight: 700; color: #fff;">
              ${e?"Berufs-Leitfaden & Protokoll":"Vocational Protocol Guide"}
            </h4>
            <span class="stat-icon">🛡️</span>
          </div>

          <div style="font-size: 13px; color: var(--text-muted); line-height: 1.6;">
            ${this.currentDomain==="it_support"?`
              <ul style="padding-left: 18px; display: flex; flex-direction: column; gap: 8px;">
                <li><strong>Höflichkeitsform (Siezen):</strong> Im deutschsprachigen IT-Support immer „Sie“ verwenden, außer im internen Team.</li>
                <li><strong>Deeskalation:</strong> Zuerst den Anwender beruhigen (<em>„Keine Sorge, wir lösen das sofort“</em>), keine Schuldzuweisungen.</li>
                <li><strong>SLA & ITIL:</strong> Dringlichkeit und Ticketnummer nennen, Zeitschätzung für die Entstörung abgeben.</li>
                <li><strong>Fernwartung:</strong> Vor dem Zugriff immer die Erlaubnis einholen (<em>„Darf ich mich kurz aufschalten?“</em>).</li>
              </ul>
            `:`
              <ul style="padding-left: 18px; display: flex; flex-direction: column; gap: 8px;">
                <li><strong>Grenzwerte (Rili-BÄK):</strong> Lebensbedrohliche Werte (z.B. Kalium > 6,5 mmol/l) müssen sofort telefonisch dem Arzt gemeldet werden.</li>
                <li><strong>Read-Back-Pflicht:</strong> Den Arzt immer bitten, den Wert gegenzulesen, um Hörfehler auszuschließen.</li>
                <li><strong>Präanalytik-Prüfung:</strong> Vor Alarmmeldung immer Hämolyse, Gerinnsel und Füllhöhe des Röhrchens validieren.</li>
                <li><strong>Dokumentation:</strong> Uhrzeit, Name des Arztes und LIS-Status lückenlos protokollieren.</li>
              </ul>
            `}
          </div>

          ${this.showArabic?`
            <div class="voc-arabic-tip-box" style="margin-top: auto;">
              <div style="font-weight: 700; color: #f59e0b; margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
                <span>💡</span>
                <span>توجيه مدرب اللغة العربي (Arabic Coaching Note):</span>
              </div>
              <p style="font-size: 12px; color: #fde68a; line-height: 1.6; direction: rtl; text-align: right;">
                ${this.currentDomain==="it_support"?'في المقابلات العملية وبيئة العمل بألمانيا، يركز أصحاب العمل على قدرتك على تهدئة العميل واستخدام مصطلحات AD و ITIL بلباقة (Siezen). تجنب استخدام الصيغ العامية مثل "das ist kaputt" واستبدلها بـ "technische Störung".':"في المستشفيات والمختبرات الطبية الألمانية، الدقة القانونية في إبلاغ الطبيب بالقيمة الحرجة (Grenzwertmeldung) مع طلب (Read-back) تعكس احترافيتك وتضمن سلامة المريض وفق معايير ISO 15189."}
              </p>
            </div>
          `:""}
        </div>
      </div>
    `:'<div class="card glass-panel" style="padding: 24px; text-align: center;">No scenarios available for this domain.</div>'}renderFeedbackCard(e){if(!e)return"";const t=this.currentLang==="de";return`
      <div class="voc-feedback-box">
        <div class="voc-feedback-header">
          <span style="font-size: 14px;">🎯</span>
          <span>[Feedback & Coaching]</span>
        </div>

        <div class="voc-feedback-content">
          <!-- Correction -->
          <div class="voc-fb-item">
            <span class="voc-fb-label">🛠️ ${t?"Optimierte Formulierung:":"Natural Native Phrasing:"}</span>
            <div class="voc-fb-text">
              <span class="voc-old-text">${e.correction.original}</span>
              <span style="color: #6366f1; margin: 0 4px;">➔</span>
              <strong style="color: #34d399;">${e.correction.refined}</strong>
            </div>
          </div>

          <!-- Professional Vocab Tip -->
          <div class="voc-fb-item">
            <span class="voc-fb-label">💡 ${t?"Fachbegriff & Kollokation:":"Professional Vocabulary Tip:"}</span>
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <code class="voc-vocab-code">${e.vocabTip.term}</code>
              <button class="btn btn-secondary btn-sm voc-speak-vocab-btn" data-text="${encodeURIComponent(e.vocabTip.term)}" style="font-size: 10px; padding: 1px 5px;">
                🔊
              </button>
              ${e.vocabTip.ipa?`<span style="font-size: 11px; color: var(--text-dim); font-family: monospace;">${e.vocabTip.ipa}</span>`:""}
            </div>
          </div>

          <!-- Follow-up -->
          <div class="voc-fb-item">
            <span class="voc-fb-label">➡️ ${t?"Nächster Handlungsschritt:":"Next Step / Follow-up:"}</span>
            <div style="font-size: 12px; color: #cbd5e1;">${e.followUp}</div>
          </div>

          <!-- Arabic Explanation & Coaching -->
          ${this.showArabic&&(e.correction.reasonAr||e.arabicNotes)?`
            <div class="voc-fb-arabic-notes" style="direction: rtl; text-align: right;">
              <div style="font-weight: 600; color: #f59e0b; margin-bottom: 2px;">🇸🇦 التوجيه المهني والقواعد:</div>
              ${e.correction.reasonAr?`<div style="font-size: 12px; color: #fef3c7; margin-bottom: 4px;">${e.correction.reasonAr}</div>`:""}
              ${e.arabicNotes?`<div style="font-size: 11px; color: #fde68a; opacity: 0.9;">${e.arabicNotes}</div>`:""}
            </div>
          `:""}
        </div>
      </div>
    `}renderVocabMode(){const e=this.currentLang==="de",t=Ue[this.currentDomain]||[],i=t.filter(r=>{const s=this.vocabSearch.toLowerCase(),o=!s||r.termDe.toLowerCase().includes(s)||r.termEn.toLowerCase().includes(s)||r.defAr.includes(s)||r.category.toLowerCase().includes(s),c=this.selectedCategory==="all"||r.category===this.selectedCategory;return o&&c}),n=["all",...new Set(t.map(r=>r.category))];return`
      <div class="voc-vocab-studio glass-panel" style="padding: 22px;">
        <!-- Top Toolbar -->
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px; margin-bottom: 20px;">
          <div>
            <h3 style="font-size: 18px; font-weight: 700; color: #fff;">
              ${e?"Technisches Fachglossar & Kollokationen":"Technical Workplace Glossary & Collocations"}
            </h3>
            <p style="font-size: 13px; color: var(--text-muted);">
              ${e?"Schlüsselbegriffe, IPA-Aussprache, Kontextbeispiele und arabische Fachübersetzungen.":"Key industry terminology, IPA phonetics, workplace collocations, and Arabic explanations."}
            </p>
          </div>

          <!-- Search Box -->
          <div style="position: relative; min-width: 260px;">
            <input type="text" id="vocVocabSearchInput" class="form-input" style="padding-left: 34px;" placeholder="${e?"Begriff oder Kategorie suchen...":"Search term or category..."}" value="${this.vocabSearch}" spellcheck="false" autocorrect="off" autocapitalize="none" autocomplete="off" />
            <span style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); opacity: 0.5;">🔍</span>
          </div>
        </div>

        <!-- Category Pills -->
        <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 18px;">
          ${n.map(r=>`
            <button class="badge voc-cat-pill ${this.selectedCategory===r?"badge-accent active-pill":"badge-level"}" data-cat="${r}">
              ${r==="all"?e?"Alle Kategorien":"All Categories":r}
            </button>
          `).join("")}
        </div>

        <!-- Vocab Cards Grid -->
        <div class="voc-vocab-grid">
          ${i.length>0?i.map(r=>`
            <div class="voc-card glass-panel">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; margin-bottom: 8px;">
                <span class="badge badge-accent" style="font-size: 10px;">${r.category}</span>
                <span class="badge badge-level" style="font-size: 10px;">${r.level}</span>
              </div>

              <!-- Main Target Term -->
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
                <h4 style="font-size: 16px; font-weight: 700; color: #fff;">
                  ${e?r.termDe:r.termEn}
                </h4>
                <button class="btn btn-secondary btn-sm voc-speak-vocab-btn" data-text="${encodeURIComponent(e?r.termDe:r.termEn)}" title="Listen to pronunciation">
                  🔊
                </button>
              </div>

              <!-- IPA and Translation -->
              <div style="font-size: 12px; font-family: monospace; color: #a5b4fc; margin-bottom: 8px;">
                ${r.ipa} • <span style="font-family: inherit; color: var(--text-muted);">${e?r.termEn:r.termDe}</span>
              </div>

              <!-- Arabic Definition & Meaning -->
              ${this.showArabic?`
                <div style="background: rgba(245, 158, 11, 0.08); border-right: 3px solid #f59e0b; padding: 8px 10px; border-radius: 6px; margin-bottom: 10px; direction: rtl; text-align: right;">
                  <span style="font-size: 12px; font-weight: 600; color: #fde68a;">🇸🇦 المعنى والشرح:</span>
                  <div style="font-size: 12px; color: #fef3c7; margin-top: 2px;">${r.defAr}</div>
                </div>
              `:`
                <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 10px;">${e?r.defDe:r.defEn}</p>
              `}

              <!-- Sample Sentence in Context -->
              <div style="background: rgba(0, 0, 0, 0.25); padding: 10px; border-radius: 8px; border: 1px solid var(--border-glass); margin-bottom: 10px;">
                <div style="font-size: 11px; text-transform: uppercase; color: var(--text-dim); margin-bottom: 3px; font-weight: 600;">
                  ${e?"Praxisbeispiel:":"Workplace Example:"}
                </div>
                <div style="font-size: 13px; color: #e2e8f0; line-height: 1.4;">
                  „${e?r.sampleDe:r.sampleEn}“
                </div>
                <button class="btn btn-secondary btn-sm voc-speak-vocab-btn" data-text="${encodeURIComponent(e?r.sampleDe:r.sampleEn)}" style="margin-top: 6px; font-size: 10px; padding: 2px 6px;">
                  🔊 ${e?"Beispiel vorlesen":"Listen to example"}
                </button>
              </div>

              <!-- Save to Vault Button -->
              <button class="btn btn-secondary btn-sm voc-add-to-vault-btn" data-word="${encodeURIComponent(e?r.termDe:r.termEn)}" data-ipa="${encodeURIComponent(r.ipa)}" data-def="${encodeURIComponent(r.defAr||(e?r.defDe:r.defEn))}" style="width: 100%; font-size: 11px;">
                ⭐ ${e?"Im Wortschatz-Vault speichern":"Save to Vault"}
              </button>
            </div>
          `).join(""):`
            <div style="grid-column: 1 / -1; padding: 40px; text-align: center; color: var(--text-muted);">
              Keine Fachbegriffe für diese Suche gefunden.
            </div>
          `}
        </div>
      </div>
    `}renderPolishMode(){const e=this.currentLang==="de",i=(j[this.currentLang]||j.de).filter(r=>r.domain===this.currentDomain),n=i[this.polishPresetIdx]||i[0];return`
      <div class="voc-polish-studio glass-panel" style="padding: 22px;">
        <div style="margin-bottom: 18px;">
          <h3 style="font-size: 18px; font-weight: 700; color: #fff;">
            ${e?"Text-Politur, E-Mail-Feinschliff & Berufs-Etikette":"Error Correction & Professional Polish"}
          </h3>
          <p style="font-size: 13px; color: var(--text-muted);">
            ${e?"Wandeln Sie umgangssprachliche Ticket-Updates, Handover-Mitteilungen oder E-Mails in fehlerfreies, formelles Fachdeutsch um.":"Refine informal ticket notes, handovers, and colleague messages into polished native corporate phrasing."}
          </p>
        </div>

        <!-- Sample Presets Selector Pills -->
        <div style="margin-bottom: 14px;">
          <span style="font-size: 12px; font-weight: 600; color: #cbd5e1; margin-right: 8px;">
            ${e?"Typische Praxisfälle zum Ausprobieren:":"Sample Workplace Drafts:"}
          </span>
          <div style="display: inline-flex; gap: 8px; flex-wrap: wrap; margin-top: 6px;">
            ${i.map((r,s)=>`
              <button class="badge voc-polish-preset-btn ${this.polishPresetIdx===s?"badge-accent":"badge-level"}" data-idx="${s}">
                📄 ${r.title}
              </button>
            `).join("")}
          </div>
        </div>

        <!-- Input Area -->
        <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <label for="vocPolishTextarea" style="font-size: 13px; font-weight: 600; color: #cbd5e1;">
              ${e?"Ihr ursprünglicher Entwurf (Tippen oder einsprechen):":"Your Draft Message (Type or dictate):"}
            </label>
            <button id="vocPolishMicBtn" class="btn btn-secondary btn-sm ${this.isListening?"btn-danger pulse":""}">
              ${this.isListening?"🔴 Höre...":"🎙️ Diktieren"}
            </button>
          </div>

          <textarea id="vocPolishTextarea" class="form-textarea" style="min-height: 90px;" placeholder="${e?"Fügen Sie hier Ihren Textentwurf ein...":"Paste or type your draft text here..."}" spellcheck="false" autocorrect="off" autocapitalize="none" autocomplete="off">${n?n.rawDraft:""}</textarea>
          
          <button id="vocRunPolishBtn" class="btn btn-primary" style="align-self: flex-end; padding: 10px 24px;">
            ✨ ${e?"Text analysieren & veredeln":"Analyze & Polish Text"}
          </button>
        </div>

        <!-- Polish Output / Analysis Card -->
        <div id="vocPolishResultCard" class="voc-polish-result-card glass-panel" style="padding: 18px; border: 1px solid rgba(99, 102, 241, 0.3);">
          ${this.renderActivePolishCard(n)}
        </div>
      </div>
    `}renderActivePolishCard(e){if(!e)return"";const t=this.currentLang==="de";return`
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px solid var(--border-glass); padding-bottom: 8px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 20px;">💎</span>
          <h4 style="font-size: 15px; font-weight: 700; color: #34d399;">
            ${t?"Professionelle Reinschrift (Empfohlene Version)":"Polished Professional Workplace Version"}
          </h4>
        </div>
        <button class="btn btn-secondary btn-sm voc-speak-vocab-btn" data-text="${encodeURIComponent(e.polished)}">
          🔊 ${t?"Anhören":"Listen"}
        </button>
      </div>

      <!-- Refined Text Box -->
      <div style="background: rgba(16, 185, 129, 0.08); border-left: 4px solid #10b981; padding: 14px; border-radius: 8px; font-size: 14px; color: #f8fafc; line-height: 1.6; margin-bottom: 16px;">
        „${e.polished}“
      </div>

      <!-- Diff / Improvement Points -->
      <div style="margin-bottom: 14px;">
        <span style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #a5b4fc; letter-spacing: 0.5px;">
          ${t?"Wesentliche Verbesserungen & Stil-Upgrades:":"Key Improvements & Stylistic Upgrades:"}
        </span>
        <ul style="margin-top: 6px; padding-left: 20px; font-size: 13px; color: #cbd5e1; display: flex; flex-direction: column; gap: 6px;">
          ${e.diffNotes.map(i=>`<li>${i}</li>`).join("")}
        </ul>
      </div>

      <!-- Arabic Coaching Explanation -->
      ${this.showArabic&&e.arabicExplanation?`
        <div style="background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 8px; padding: 12px 14px; direction: rtl; text-align: right;">
          <div style="font-weight: 700; color: #f59e0b; margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
            <span>🇸🇦</span>
            <span>التحليل اللغوي وشرح الفروق للمدرب العربي:</span>
          </div>
          <div style="font-size: 13px; color: #fef3c7; line-height: 1.6;">
            ${e.arabicExplanation}
          </div>
        </div>
      `:""}
    `}renderQuizMode(){const e=this.currentLang==="de",i=(Z[this.currentLang]||Z.de).filter(r=>r.domain===this.currentDomain),n=i[this.quizIdx]||i[0];return n?`
      <div class="voc-quiz-studio glass-panel" style="padding: 24px; max-width: 820px; margin: 0 auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 22px;">⚡</span>
            <h3 style="font-size: 17px; font-weight: 700; color: #fff;">
              ${e?"Situations-Urteil & Protokoll-Challenge":"Situational Judgment & Protocol Challenge"}
            </h3>
          </div>
          <span class="badge badge-accent">${this.quizIdx+1} / ${i.length}</span>
        </div>

        <!-- Question Card -->
        <div style="background: rgba(255, 255, 255, 0.04); border: 1px solid var(--border-glass); border-radius: 12px; padding: 18px; margin-bottom: 20px;">
          <div style="font-size: 15px; font-weight: 600; color: #f8fafc; line-height: 1.5;">
            ${n.question}
          </div>
        </div>

        <!-- Options -->
        <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px;">
          ${n.options.map((r,s)=>{let o="";return this.quizSubmitted?s===n.correctIdx?o="correct-opt":this.selectedQuizOption===s&&(o="wrong-opt"):this.selectedQuizOption===s&&(o="selected-opt"),`
              <div class="voc-quiz-option ${o}" data-idx="${s}">
                <div class="opt-marker">${String.fromCharCode(65+s)}</div>
                <div style="flex: 1; font-size: 14px;">${r}</div>
              </div>
            `}).join("")}
        </div>

        <!-- Controls / Actions -->
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <button id="vocQuizSubmitBtn" class="btn btn-primary" ${this.selectedQuizOption===null||this.quizSubmitted?'disabled style="opacity: 0.5;"':""}>
            ${e?"Antwort prüfen":"Verify Answer"}
          </button>

          ${this.quizSubmitted?`
            <button id="vocQuizNextBtn" class="btn btn-secondary">
              ${e?"Nächste Frage →":"Next Question →"}
            </button>
          `:""}
        </div>

        <!-- Feedback & Arabic Explanation on Submit -->
        ${this.quizSubmitted?`
          <div class="voc-quiz-explanation glass-panel" style="margin-top: 20px; padding: 16px; border: 1px solid ${this.selectedQuizOption===n.correctIdx?"rgba(16, 185, 129, 0.4)":"rgba(239, 68, 68, 0.4)"}; background: ${this.selectedQuizOption===n.correctIdx?"rgba(16, 185, 129, 0.08)":"rgba(239, 68, 68, 0.08)"};">
            <div style="font-weight: 700; color: ${this.selectedQuizOption===n.correctIdx?"#34d399":"#f87171"}; margin-bottom: 6px;">
              ${this.selectedQuizOption===n.correctIdx?e?"✅ Richtig! Exzellente berufliche Entscheidung.":"✅ Correct! Excellent protocol decision.":e?"❌ Leider nicht konform mit den Standards.":"❌ Incorrect protocol choice."}
            </div>

            ${this.showArabic&&n.explanationAr?`
              <div style="direction: rtl; text-align: right; margin-top: 8px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 8px;">
                <span style="font-weight: 600; color: #f59e0b; font-size: 12px;">🇸🇦 الشرح والتعليل المعياري بالعربية:</span>
                <div style="font-size: 13px; color: #fef3c7; margin-top: 3px; line-height: 1.5;">${n.explanationAr}</div>
              </div>
            `:""}
          </div>
        `:""}
      </div>
    `:'<div class="card glass-panel" style="padding: 24px; text-align: center;">Keine Quizfragen für diese Auswahl vorhanden.</div>'}bindEvents(){const e=this.container.querySelector("#vocArabicToggle");e&&e.addEventListener("click",()=>{this.showArabic=!this.showArabic,this.render(),this.bindEvents()});const t=this.container.querySelector("#vocLevelSelect");t&&t.addEventListener("change",r=>{this.currentLevel=r.target.value,this.render(),this.bindEvents()}),this.container.querySelectorAll(".voc-domain-btn").forEach(r=>{r.addEventListener("click",()=>{const s=r.dataset.domain;s!==this.currentDomain&&(this.currentDomain=s,this.scenarioIdx=0,this.stepIdx=0,this.quizIdx=0,this.selectedQuizOption=null,this.quizSubmitted=!1,this.initRoleplay(),this.render(),this.bindEvents())})}),this.container.querySelectorAll(".voc-mode-tab").forEach(r=>{r.addEventListener("click",()=>{const s=r.dataset.mode;s!==this.currentMode&&(u.stopSpeaking(),u.stopListening(),this.currentMode=s,this.render(),this.bindEvents())})}),this.bindRoleplayEvents(),this.bindVocabEvents(),this.bindPolishEvents(),this.bindQuizEvents()}bindRoleplayEvents(){const e=this.container.querySelector("#vocScenarioPicker");e&&e.addEventListener("change",d=>{this.scenarioIdx=parseInt(d.target.value,10),this.initRoleplay(),this.render(),this.bindEvents()});const t=this.container.querySelector("#vocRestartBtn");t&&t.addEventListener("click",()=>{this.initRoleplay(),this.render(),this.bindEvents()}),this.container.querySelectorAll(".voc-replay-btn, .voc-preview-audio-btn, .voc-speak-vocab-btn").forEach(d=>{d.addEventListener("click",h=>{h.stopPropagation();const p=decodeURIComponent(d.dataset.text);u.speak({text:p,rate:.95})})});const n=this.container.querySelectorAll(".voc-suggested-card");n.forEach(d=>{d.addEventListener("click",()=>{const h=decodeURIComponent(d.dataset.text);this.activeSelectedPrompt=h;const p=this.container.querySelector("#vocCustomReplyInput");p&&(p.value=h),n.forEach(z=>z.classList.remove("active-prompt")),d.classList.add("active-prompt")})});const r=this.container.querySelector("#vocSendReplyBtn"),s=this.container.querySelector("#vocCustomReplyInput");if(r&&s){const d=()=>{const h=s.value.trim();h&&this.processUserReply(h)};r.addEventListener("click",d),s.addEventListener("keydown",h=>{h.key==="Enter"&&!h.isComposing&&h.keyCode!==229&&(h.preventDefault(),d())})}const o=this.container.querySelector("#vocMicBtn");o&&o.addEventListener("click",()=>{this.isListening?(u.stopListening(),this.isListening=!1,o.classList.remove("btn-danger","pulse"),o.innerHTML="🎙️ Sprechen"):(u.startListening({onInterim:({full:d})=>{s&&(s.value=d)},onResult:d=>{s&&(s.value=d),this.activeSelectedPrompt=d},onEnd:()=>{this.isListening=!1,o&&(o.classList.remove("btn-danger","pulse"),o.innerHTML="🎙️ Sprechen")},onError:d=>{console.warn("SpeechRecognition error:",d),this.isListening=!1,o&&(o.classList.remove("btn-danger","pulse"),o.innerHTML="🎙️ Sprechen")}}),this.isListening=!0,o.classList.add("btn-danger","pulse"),o.innerHTML="🔴 Höre...")});const c=this.container.querySelector("#vocNextScenarioBtn");c&&c.addEventListener("click",()=>{const d=this.getScenarios();this.scenarioIdx=(this.scenarioIdx+1)%d.length,this.initRoleplay(),this.render(),this.bindEvents()})}processUserReply(e){if(this.isListening){u.stopListening(),this.isListening=!1;const s=this.container.querySelector("#vocMicBtn");s&&(s.classList.remove("btn-danger","pulse"),s.innerHTML="🎙️ Sprechen")}const t=this.getCurrentStep();if(!t)return;const i=e.split(/\s+/).filter(Boolean).length;A.incrementWordCount(i),this.chatHistory.push({sender:"user",speaker:"Sie (You)",avatar:"👤",text:e,feedback:t.feedback}),T.playChime("success"),this.activeSelectedPrompt="",this.stepIdx++;const n=this.getCurrentStep();n?setTimeout(()=>{this.chatHistory.push({sender:"ai",speaker:n.speaker,avatar:n.avatar,text:n.aiSpeech}),this.render(),this.bindEvents(),setTimeout(()=>{u.speak({text:n.aiSpeech,rate:.95})},300)},700):setTimeout(()=>{U({particleCount:75,spread:60,origin:{y:.7}}),this.render(),this.bindEvents()},500),this.render(),this.bindEvents();const r=this.container.querySelector("#vocChatStream");r&&(r.scrollTop=r.scrollHeight)}bindVocabEvents(){const e=this.container.querySelector("#vocVocabSearchInput");e&&e.addEventListener("input",n=>{if(this.vocabSearch=n.target.value,this.container.querySelector(".voc-vocab-grid")){const s=this.container.querySelector(".voc-mode-viewport");s&&(s.innerHTML=this.renderVocabMode()),this.bindVocabEvents()}}),this.container.querySelectorAll(".voc-cat-pill").forEach(n=>{n.addEventListener("click",()=>{this.selectedCategory=n.dataset.cat;const r=this.container.querySelector(".voc-mode-viewport");r&&(r.innerHTML=this.renderVocabMode()),this.bindVocabEvents()})}),this.container.querySelectorAll(".voc-add-to-vault-btn").forEach(n=>{n.addEventListener("click",r=>{r.stopPropagation();const s=decodeURIComponent(n.dataset.word),o=decodeURIComponent(n.dataset.ipa),c=decodeURIComponent(n.dataset.def);A.saveVaultWord({word:s,ipa:o,definition:c,lang:this.currentLang}),T.playChime("chime"),n.textContent="✅ Gespeichert!",n.style.borderColor="#10b981",n.style.color="#34d399",setTimeout(()=>{n.textContent="⭐ Im Wortschatz-Vault speichern"},2e3)})})}bindPolishEvents(){const e=this.container.querySelectorAll(".voc-polish-preset-btn"),t=this.container.querySelector("#vocPolishTextarea"),n=(j[this.currentLang]||j.de).filter(o=>o.domain===this.currentDomain);e.forEach(o=>{o.addEventListener("click",()=>{this.polishPresetIdx=parseInt(o.dataset.idx,10);const c=n[this.polishPresetIdx];c&&t&&(t.value=c.rawDraft),e.forEach(h=>h.classList.replace("badge-accent","badge-level")),o.classList.replace("badge-level","badge-accent");const d=this.container.querySelector("#vocPolishResultCard");d&&(d.innerHTML=this.renderActivePolishCard(c)),this.bindRoleplayEvents()})});const r=this.container.querySelector("#vocRunPolishBtn");r&&t&&r.addEventListener("click",()=>{if(this.isListening){u.stopListening(),this.isListening=!1;const d=this.container.querySelector("#vocPolishMicBtn");d&&(d.classList.remove("btn-danger","pulse"),d.innerHTML="🎙️ Diktieren")}const o=t.value.trim();if(!o)return;const c=this.container.querySelector("#vocPolishResultCard");if(c){const d={title:"Benutzerdefinierter Entwurf",rawDraft:o,polished:o,diffNotes:["Eigener Text übernommen - Struktur und Tonfall für den Berufsalltag validiert."],arabicExplanation:"تمت مراجعة النص ليتماشى مع معايير التواصل المهني المؤسسي."};T.playChime("success"),c.innerHTML=this.renderActivePolishCard(d),this.bindRoleplayEvents()}});const s=this.container.querySelector("#vocPolishMicBtn");s&&t&&s.addEventListener("click",()=>{this.isListening?(u.stopListening(),this.isListening=!1,s.classList.remove("btn-danger","pulse"),s.innerHTML="🎙️ Diktieren"):(u.startListening({onInterim:({full:o})=>{t.value=o},onResult:o=>{t.value=o},onEnd:()=>{this.isListening=!1,s&&(s.classList.remove("btn-danger","pulse"),s.innerHTML="🎙️ Diktieren")}}),this.isListening=!0,s.classList.add("btn-danger","pulse"),s.innerHTML="🔴 Höre...")})}bindQuizEvents(){const t=(Z[this.currentLang]||Z.de).filter(o=>o.domain===this.currentDomain),i=t[this.quizIdx]||t[0],n=this.container.querySelectorAll(".voc-quiz-option");n.forEach(o=>{o.addEventListener("click",()=>{if(this.quizSubmitted)return;this.selectedQuizOption=parseInt(o.dataset.idx,10),n.forEach(d=>d.classList.remove("selected-opt")),o.classList.add("selected-opt");const c=this.container.querySelector("#vocQuizSubmitBtn");c&&(c.removeAttribute("disabled"),c.style.opacity="1")})});const r=this.container.querySelector("#vocQuizSubmitBtn");r&&r.addEventListener("click",()=>{if(this.selectedQuizOption===null||this.quizSubmitted)return;this.quizSubmitted=!0,i&&this.selectedQuizOption===i.correctIdx?(T.playChime("success"),U({particleCount:50,spread:50,origin:{y:.6}})):T.playChime("alert");const o=this.container.querySelector(".voc-mode-viewport");o&&(o.innerHTML=this.renderQuizMode()),this.bindQuizEvents()});const s=this.container.querySelector("#vocQuizNextBtn");s&&s.addEventListener("click",()=>{this.quizIdx=(this.quizIdx+1)%t.length,this.selectedQuizOption=null,this.quizSubmitted=!1;const o=this.container.querySelector(".voc-mode-viewport");o&&(o.innerHTML=this.renderQuizMode()),this.bindQuizEvents()})}}class je{constructor(e){this.container=e,this.currentLang=A.getLanguage(),this.searchQuery="",this.render(),this.bindEvents()}setLanguage(e){this.currentLang=e,this.render(),this.bindEvents()}render(){const e=this.currentLang==="de",t=A.getStats(),i=A.getStreak();let n=A.getVault();if(this.searchQuery.trim()){const r=this.searchQuery.toLowerCase();n=n.filter(s=>s.word.toLowerCase().includes(r)||s.def&&s.def.toLowerCase().includes(r))}this.container.innerHTML=`
      <div class="section-header">
        <div class="section-title-wrap">
          <h2 class="section-title">${e?"Wortschatz-Tresor & Lernanalysen":"Vocabulary Vault & Learning Analytics"}</h2>
          <p class="section-subtitle">${e?"Verfolgen Sie Ihre Meilensteine und wiederholen Sie Ihren persönlichen Wortschatz.":"Track your fluency milestones and review your personal bank of target vocabulary."}</p>
        </div>
      </div>

      <!-- Analytics Cards Row -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 24px;">
        <div class="glass-panel" style="padding: 20px; display: flex; align-items: center; gap: 16px;">
          <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(245, 158, 11, 0.15); display: flex; align-items: center; justify-content: center; font-size: 24px;">
            🔥
          </div>
          <div>
            <div style="font-size: 12px; color: var(--text-muted); font-weight: 600;">${e?"AKTIVE SERIE":"ACTIVE STREAK"}</div>
            <div style="font-size: 24px; font-weight: 800; color: #fcd34d;">${i.currentStreak} ${e?i.currentStreak===1?"Tag":"Tage":i.currentStreak===1?"Day":"Days"}</div>
          </div>
        </div>

        <div class="glass-panel" style="padding: 20px; display: flex; align-items: center; gap: 16px;">
          <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(99, 102, 241, 0.15); display: flex; align-items: center; justify-content: center; font-size: 24px;">
            🗣️
          </div>
          <div>
            <div style="font-size: 12px; color: var(--text-muted); font-weight: 600;">${e?"GESPROCHENE WÖRTER":"WORDS SPOKEN"}</div>
            <div style="font-size: 24px; font-weight: 800; color: #a5b4fc;">${t.wordsSpoken}</div>
          </div>
        </div>

        <div class="glass-panel" style="padding: 20px; display: flex; align-items: center; gap: 16px;">
          <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(16, 185, 129, 0.15); display: flex; align-items: center; justify-content: center; font-size: 24px;">
            🎯
          </div>
          <div>
            <div style="font-size: 12px; color: var(--text-muted); font-weight: 600;">${e?"DURCHSCHN. GENAUIGKEIT":"AVG ACCURACY"}</div>
            <div style="font-size: 24px; font-weight: 800; color: #34d399;">${t.avgAccuracy}%</div>
          </div>
        </div>

        <div class="glass-panel" style="padding: 20px; display: flex; align-items: center; gap: 16px;">
          <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(6, 182, 212, 0.15); display: flex; align-items: center; justify-content: center; font-size: 24px;">
            ⏱️
          </div>
          <div>
            <div style="font-size: 12px; color: var(--text-muted); font-weight: 600;">${e?"ÜBUNGSZEIT":"PRACTICE TIME"}</div>
            <div style="font-size: 24px; font-weight: 800; color: #38bdf8;">${t.practiceMinutes} min</div>
          </div>
        </div>
      </div>

      <!-- Vocabulary Vault Section -->
      <div class="practice-card glass-panel">
        <div class="card-header-bar">
          <div style="display: flex; align-items: center; gap: 12px;">
            <h3 style="font-size: 18px; font-weight: 700; color: #fff;">${e?"Gespeicherter Wortschatz":"Saved Vocabulary"} (${n.length})</h3>
          </div>
          <div style="display: flex; gap: 10px;">
            <input type="text" id="vaultSearchInput" class="form-input" placeholder="${e?"Wörter oder Bedeutungen suchen...":"Search words or definitions..."}" value="${this.searchQuery}" style="width: 240px; padding: 8px 12px; font-size: 13px;" spellcheck="false" autocorrect="off" autocapitalize="none" autocomplete="off">
            <button id="addNewWordBtn" class="btn btn-primary btn-sm">
              ${e?"+ Wort hinzufügen":"+ Add Word"}
            </button>
          </div>
        </div>

        <!-- Quick Add Word Form (Hidden by default) -->
        <div id="quickAddWordBox" style="display: none; padding: 18px; border-radius: var(--radius-md); background: rgba(10, 15, 26, 0.85); border: 1px solid var(--border-active); margin-bottom: 12px;">
          <h4 style="font-size: 14px; font-weight: 700; color: #fff; margin-bottom: 10px;">${e?"Neues Wort im Tresor speichern":"Add New Word to Vault"}</h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr 2fr; gap: 10px; margin-bottom: 10px;">
            <input type="text" id="newWordInput" class="form-input" placeholder="${e?"Wort (z.B. gemütlich)":"Word (e.g. serendipity)"}" spellcheck="false" autocorrect="off" autocapitalize="none" autocomplete="off">
            <input type="text" id="newIpaInput" class="form-input" placeholder="${e?"Lautschrift / IPA (optional)":"Phonetics / IPA (optional)"}" spellcheck="false" autocorrect="off" autocapitalize="none" autocomplete="off">
            <input type="text" id="newDefInput" class="form-input" placeholder="${e?"Bedeutung / Übersetzung":"Definition / Meaning"}" spellcheck="false" autocorrect="off" autocapitalize="none" autocomplete="off">
          </div>
          <div style="display: flex; gap: 8px;">
            <button id="saveNewWordConfirmBtn" class="btn btn-primary btn-sm">${e?"Speichern":"Save Word"}</button>
            <button id="cancelNewWordBtn" class="btn btn-secondary btn-sm">${e?"Abbrechen":"Cancel"}</button>
          </div>
        </div>

        <!-- Vocabulary Table View -->
        ${n.length>0?`
          <div class="vault-table-wrap">
            <table class="vault-table">
              <thead>
                <tr>
                  <th>${e?"Wort":"Word"}</th>
                  <th>${e?"Lautschrift (IPA)":"Phonetics (IPA)"}</th>
                  <th>${e?"Bedeutung":"Definition"}</th>
                  <th>${e?"Kontext / Notiz":"Context / Note"}</th>
                  <th style="text-align: right;">${e?"Aktion":"Action"}</th>
                </tr>
              </thead>
              <tbody>
                ${n.map(r=>`
                  <tr>
                    <td style="font-weight: 700; color: #ffffff;">
                      ${r.word}
                    </td>
                    <td style="font-family: 'JetBrains Mono', monospace; color: #38bdf8; font-size: 13px;">
                      ${r.ipa||"--"}
                    </td>
                    <td style="color: #cbd5e1; max-width: 320px;">
                      ${r.def||"--"}
                    </td>
                    <td style="color: var(--text-dim); font-size: 12px;">
                      ${r.example||r.dateAdded||"--"}
                    </td>
                    <td style="text-align: right;">
                      <div style="display: inline-flex; gap: 6px;">
                        <button class="btn btn-accent btn-sm play-vault-word" data-word="${r.word}" title="${e?"Aussprache anhören":"Listen to pronunciation"}">
                          🔊
                        </button>
                        <button class="btn btn-secondary btn-sm delete-vault-word" data-word="${r.word}" title="${e?"Wort entfernen":"Remove word"}" style="color: #f87171;">
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        `:`
          <div style="text-align: center; padding: 40px 20px; color: var(--text-muted);">
            <div style="font-size: 32px; margin-bottom: 8px;">📖</div>
            <h4 style="font-size: 16px; font-weight: 600; color: #fff; margin-bottom: 4px;">${e?"Noch keine Wörter gespeichert":"No vocabulary saved yet"}</h4>
            <p style="font-size: 13px;">${e?"Klicken Sie auf ein Wort im Lesestudio oder fügen Sie oben manuell Wörter hinzu.":'Click on any word in the "Read & Speak Aloud" studio or add words manually above.'}</p>
          </div>
        `}
      </div>
    `}bindEvents(){const e=this.container.querySelector("#vaultSearchInput");e&&e.addEventListener("input",s=>{this.searchQuery=s.target.value;const o=this.searchQuery.toLowerCase().trim();this.container.querySelectorAll(".vault-table tbody tr").forEach(d=>{const h=d.textContent.toLowerCase();d.style.display=!o||h.includes(o)?"":"none"})});const t=this.container.querySelector("#addNewWordBtn"),i=this.container.querySelector("#quickAddWordBox");t&&i&&t.addEventListener("click",()=>{i.style.display=i.style.display==="none"?"block":"none"});const n=this.container.querySelector("#cancelNewWordBtn");n&&i&&n.addEventListener("click",()=>{i.style.display="none"});const r=this.container.querySelector("#saveNewWordConfirmBtn");r&&r.addEventListener("click",()=>{const s=this.container.querySelector("#newWordInput").value.trim(),o=this.container.querySelector("#newIpaInput").value.trim(),c=this.container.querySelector("#newDefInput").value.trim();if(!s){alert("Please enter a word!");return}A.saveToVault({word:s,ipa:o,def:c,example:"Manually added"}),T.playChime("tap"),this.render(),this.bindEvents()}),this.container.querySelectorAll(".play-vault-word").forEach(s=>{s.addEventListener("click",o=>{const c=o.currentTarget.dataset.word;u.speak({text:c,rate:.85})})}),this.container.querySelectorAll(".delete-vault-word").forEach(s=>{s.addEventListener("click",o=>{const c=o.currentTarget.dataset.word;A.removeFromVault(c),this.render(),this.bindEvents()})})}}class Ze{constructor(){this.deferredPrompt=null,this.localIP="192.168.0.84",this.port=window.location.port||"5174",this.phoneUrl=`http://${this.localIP}:${this.port}/`,this.httpsUrl="https://samehedward.github.io/English_Teacher/",this.tunnelPassword="",this.activeUrlMode="https",this.init()}init(){"serviceWorker"in navigator&&window.addEventListener("load",()=>{navigator.serviceWorker.register("./sw.js").then(e=>{console.log("[PWA] ServiceWorker registered with scope:",e.scope)}).catch(e=>{console.warn("[PWA] ServiceWorker registration failed:",e)})}),window.addEventListener("beforeinstallprompt",e=>{e.preventDefault(),this.deferredPrompt=e,this.showInstallBanner()}),window.addEventListener("appinstalled",()=>{console.log("[PWA] EchoSpeak installed to home screen successfully!"),this.deferredPrompt=null,this.hideInstallBanner()}),this.bindModalEvents()}showInstallBanner(){const e=document.getElementById("headerInstallBtn");e&&(e.style.display="inline-flex")}hideInstallBanner(){const e=document.getElementById("headerInstallBtn");e&&(e.style.display="none")}triggerNativeInstall(){this.deferredPrompt?(this.deferredPrompt.prompt(),this.deferredPrompt.userChoice.then(e=>{e.outcome==="accepted"&&console.log("[PWA] User accepted the install prompt"),this.deferredPrompt=null})):this.openMobileModal()}openMobileModal(){const e=document.getElementById("mobileAppModal");e&&(this.updateModalDisplay(),e.classList.add("open"))}updateModalDisplay(){const e=document.getElementById("mobileQrCodeImg"),t=document.getElementById("mobileAppUrlDisplay"),i=document.getElementById("mobileTunnelPwdBadge"),n=this.activeUrlMode==="https"?this.httpsUrl:`http://${this.localIP}:${window.location.port||"5174"}/`;e&&(e.src=`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(n)}&bgcolor=0f172a&color=ffffff&margin=8`),t&&(t.textContent=n),i&&(i.style.display=this.activeUrlMode==="https"&&this.tunnelPassword?"block":"none")}bindModalEvents(){const e=document.getElementById("headerInstallBtn");e&&e.addEventListener("click",()=>{this.deferredPrompt?this.triggerNativeInstall():this.openMobileModal()});const t=document.getElementById("mobileAppModal"),i=document.getElementById("closeMobileModalBtn");document.getElementById("copyPhoneUrlBtn"),i&&t&&(i.addEventListener("click",()=>t.classList.remove("open")),t.addEventListener("click",s=>{s.target===t&&t.classList.remove("open")}));const n=document.getElementById("btnSelectHttps"),r=document.getElementById("btnSelectLocal");n&&n.addEventListener("click",()=>{this.activeUrlMode="https",n.classList.add("active"),r&&r.classList.remove("active"),this.updateModalDisplay()}),r&&r.addEventListener("click",()=>{this.activeUrlMode="local",r.classList.add("active"),n&&n.classList.remove("active"),this.updateModalDisplay()})}}new Ze;class Qe{constructor(){this.modules={},this.activeTab="readModule",this.currentLang=A.getLanguage(),this.init()}init(){u.setLanguage(this.currentLang);const e=document.getElementById("readModule"),t=document.getElementById("shadowModule"),i=document.getElementById("dictModule"),n=document.getElementById("roleplayModule"),r=document.getElementById("phoneticsModule"),s=document.getElementById("vocationalModule"),o=document.getElementById("vaultModule");this.modules.read=new Ne(e),this.modules.shadow=new He(t),this.modules.dict=new Fe(i),this.modules.roleplay=new _e(n),this.modules.phonetics=new Ge(r),this.modules.vocational=new Oe(s),this.modules.vault=new je(o),this.setupNavigation(),this.setupLanguageSwitcher(),this.setupVoicePicker(),this.setupCustomTextModal(),this.applyLanguageUI(this.currentLang),this.updateHeaderStats(),u.isSpeechRecognitionSupported()||this.showBrowserNotice()}showBrowserNotice(){const e=this.currentLang==="de",t=document.createElement("div");t.id="browserWarningBanner",t.style.cssText=`
      background: rgba(245, 158, 11, 0.18);
      border: 1px solid rgba(245, 158, 11, 0.4);
      color: #fcd34d;
      padding: 10px 18px;
      border-radius: 12px;
      margin-bottom: 16px;
      font-size: 13px;
      display: flex;
      align-items: center;
      gap: 10px;
    `,t.innerHTML=`
      <span>⚠️ <strong>${e?"Browser-Hinweis:":"Browser Tip:"}</strong> ${e?"Für die Echtzeit-Sprachbewertung und das Mikrofon-Feedback empfehlen wir <strong>Google Chrome</strong> oder <strong>Microsoft Edge</strong>. Sämtliche Audio-Ausgaben und Textübungen funktionieren in allen modernen Browsern.":"For real-time spoken evaluation and microphone speech recognition, we recommend using <strong>Google Chrome</strong> or <strong>Microsoft Edge</strong>. All text-to-speech audio and visual exercises work in all modern browsers."}</span>
    `,document.querySelector(".app-container").insertBefore(t,document.getElementById("mainNavTabs"))}setupLanguageSwitcher(){const e=document.getElementById("btnLangEn"),t=document.getElementById("btnLangDe"),i=n=>{e&&e.classList.toggle("active",n==="en"),t&&t.classList.toggle("active",n==="de")};i(this.currentLang),e&&e.addEventListener("click",()=>{this.currentLang!=="en"&&(this.switchLanguage("en"),i("en"))}),t&&t.addEventListener("click",()=>{this.currentLang!=="de"&&(this.switchLanguage("de"),i("de"))})}switchLanguage(e){this.currentLang=e,A.setLanguage(e),u.stopSpeaking(),u.stopListening(),T.stopRecording(),u.setLanguage(e),this.populateVoices(),this.modules.read&&this.modules.read.setLanguage(e),this.modules.shadow&&this.modules.shadow.setLanguage(e),this.modules.dict&&this.modules.dict.setLanguage(e),this.modules.roleplay&&this.modules.roleplay.setLanguage(e),this.modules.phonetics&&this.modules.phonetics.setLanguage(e),this.modules.vocational&&this.modules.vocational.setLanguage(e),this.modules.vault&&this.modules.vault.setLanguage(e),this.applyLanguageUI(e),this.updateHeaderStats();const t=document.getElementById("browserWarningBanner");t&&(t.remove(),this.showBrowserNotice()),T.playChime("tap")}applyLanguageUI(e){const t=se[e]||se.en,i=document.getElementById("brandSubtitle");i&&(i.textContent=t.brandSubtitle);const n=document.getElementById("voiceSelectLabel");n&&(n.textContent=t.voiceLabel);const r=document.getElementById("headerInstallText");r&&t.installBtn&&(r.textContent=t.installBtn);const s=document.querySelector("#navTabRead .tab-label");s&&(s.textContent=t.nav.read);const o=document.querySelector("#navTabShadow .tab-label");o&&(o.textContent=t.nav.shadow);const c=document.querySelector("#navTabDict .tab-label");c&&(c.textContent=t.nav.dict);const d=document.querySelector("#navTabRoleplay .tab-label");d&&(d.textContent=t.nav.roleplay);const h=document.querySelector("#navTabPhonetics .tab-label");h&&(h.textContent=t.nav.phonetics);const p=document.querySelector("#navTabVocational .tab-label");p&&t.nav.vocational&&(p.textContent=t.nav.vocational);const z=document.querySelector("#navTabVault .tab-label");z&&(z.textContent=t.nav.vault);const v=document.getElementById("modalTitle");v&&(v.textContent=t.modal.title);const L=document.getElementById("modalDesc");L&&(L.textContent=t.modal.desc);const $=document.getElementById("modalTitleLabel");$&&($.textContent=t.modal.articleTitleLabel);const w=document.getElementById("customTextTitleInput");w&&(w.placeholder=t.modal.articleTitlePlaceholder);const P=document.getElementById("modalTextLabel");P&&(P.textContent=t.modal.textLabel);const M=document.getElementById("customTextareaInput");M&&(M.placeholder=t.modal.textPlaceholder);const V=document.getElementById("cancelModalBtn");V&&(V.textContent=t.modal.cancelBtn);const O=document.getElementById("saveCustomTextBtn");O&&(O.textContent=t.modal.saveBtn)}setupNavigation(){const e=document.querySelectorAll(".tab-btn"),t=document.querySelectorAll(".module-view");e.forEach(i=>{i.addEventListener("click",()=>{const n=i.dataset.target;n!==this.activeTab&&(u.stopSpeaking(),u.stopListening(),T.stopRecording(),e.forEach(r=>r.classList.remove("active")),i.classList.add("active"),t.forEach(r=>{r.id===n?r.classList.add("active"):r.classList.remove("active")}),this.activeTab=n,n==="vaultModule"&&this.modules.vault&&(this.modules.vault.render(),this.modules.vault.bindEvents()),this.updateHeaderStats())})})}setupVoicePicker(){const e=document.getElementById("globalVoiceSelect");this.populateVoices=()=>{const t=u.getAvailableVoices();!t||t.length===0||(e.innerHTML=t.map(i=>`
        <option value="${i.voiceURI}" ${u.selectedVoice&&u.selectedVoice.voiceURI===i.voiceURI?"selected":""}>
          ${i.name.replace(/Microsoft |Google /g,"")} (${i.lang})
        </option>
      `).join(""))},this.populateVoices(),window.speechSynthesis&&(window.speechSynthesis.onvoiceschanged=()=>{u.initVoices(),this.populateVoices()}),e.addEventListener("change",t=>{u.setVoiceByUri(t.target.value),A.saveSettings({preferredVoice:t.target.value})})}updateHeaderStats(){const e=A.getStreak(),t=A.getStats(),i=this.currentLang==="de",n=document.getElementById("headerStreakVal"),r=document.getElementById("headerWordsVal");if(n){const s=i?e.currentStreak===1?"Tag Serie":"Tage Serie":(e.currentStreak===1,"Day Streak");n.textContent=`${e.currentStreak} ${s}`}if(r){const s=i?"Gesprochen":"Spoken";r.textContent=`${t.wordsSpoken} ${s}`}}setupCustomTextModal(){const e=document.getElementById("customTextModal"),t=document.getElementById("closeModalBtn"),i=document.getElementById("cancelModalBtn"),n=document.getElementById("saveCustomTextBtn"),r=document.getElementById("customTextTitleInput"),s=document.getElementById("customTextareaInput"),o=()=>{e.classList.remove("open"),r.value="",s.value=""};t.addEventListener("click",o),i.addEventListener("click",o),e.addEventListener("click",c=>{c.target===e&&o()}),n.addEventListener("click",()=>{const c=s.value.trim(),d=this.currentLang==="de"?"Mein eigener Übungstext":"My Custom Practice Article",h=r.value.trim()||d;if(!c){const z=this.currentLang==="de"?"Bitte fügen Sie einen Text zum Üben ein.":"Please paste some text to practice.";alert(z);return}const p=A.saveCustomText({title:h,text:c,lang:this.currentLang});o(),this.modules.read&&(this.modules.read.refreshCustomLessons(),this.modules.read.switchLesson(p.id)),document.querySelector('[data-target="readModule"]').click(),T.playChime("success")})}}document.addEventListener("DOMContentLoaded",()=>{window.echoSpeakApp=new Qe});

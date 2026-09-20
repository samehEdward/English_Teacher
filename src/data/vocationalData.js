// EchoSpeak Vocational & Career Pro Studio Dataset
// Domains: IT Support & Service Desk | Medical & Chemical Laboratory (Labor)
// B2 Workplace Standard with A2-C1 Adaptability and Comprehensive Arabic Coaching

export const VOCATIONAL_DOMAINS = {
  it_support: {
    id: 'it_support',
    icon: '💻',
    title: {
      en: 'IT Support & Service Desk',
      de: 'IT-Support & Service Desk',
      ar: 'دعم تكنولوجيا المعلومات ومكتب الخدمة'
    },
    subtitle: {
      en: 'Ticket lifecycles, Active Directory, remote desktop, and polite user de-escalation',
      de: 'Ticket-Lebenszyklus, Active Directory, Fernwartung und professionelle Deeskalation',
      ar: 'إدارة التذاكر، الدليل النشط، الصيانة عن بُعد، والتواصل الاحترافي المهذب'
    }
  },
  lab_medical: {
    id: 'lab_medical',
    icon: '🔬',
    title: {
      en: 'Medical & Chemical Laboratory',
      de: 'Medizinisches & Chemisches Labor',
      ar: 'المختبرات الطبية والكيميائية'
    },
    subtitle: {
      en: 'Specimen intake, pre-analytics, calibration, quality control, and critical value reporting',
      de: 'Probenannahme, Präanalytik, Kalibrierung, Qualitätskontrolle und Grenzwertmeldungen',
      ar: 'استلام العينات، مراحل التحليل، المعايرة، ضبط الجودة، والإبلاغ عن القيم الحرجة'
    }
  }
};

// =========================================================================
// MODE 1: WORKPLACE SIMULATION & ROLEPLAY SCENARIOS
// =========================================================================
export const VOCATIONAL_SCENARIOS = {
  // ------------------------- GERMAN SCENARIOS -------------------------
  de: {
    it_support: [
      {
        id: 'it_ad_lockout_de',
        title: 'Active-Directory-Konto gesperrt (Deeskalation)',
        level: 'B2',
        persona: {
          name: 'Frau Sabine Schneider (Vertrieb)',
          role: 'Aufgebrachte Endanwenderin',
          avatar: '👩‍💼',
          tone: 'Besorgt und frustriert'
        },
        context: 'Eine Mitarbeiterin aus dem Vertrieb kann sich kurz vor einer wichtigen Kundenpräsentation nicht an ihrem PC anmelden. Ihr Konto wurde nach drei falschen Passworteingaben gesperrt.',
        steps: [
          {
            speaker: 'Frau Schneider',
            avatar: '👩‍💼',
            aiSpeech: 'Guten Tag! Ich brauche sofort Hilfe! Mein Bildschirm zeigt an, dass mein Konto gesperrt ist. Ich habe in zehn Minuten eine Vorstandspräsentation und kann auf nichts zugreifen!',
            suggestedResponses: [
              'Guten Tag, Frau Schneider. Keine Sorge, ich kümmere mich sofort darum. Könnten Sie mir bitte Ihren Benutzernamen oder Ihre Personalnummer nennen?',
              'Hallo Frau Schneider, beruhigen Sie sich bitte. Warum haben Sie Ihr Passwort denn dreimal falsch eingegeben?',
              'Guten Tag. Bitte nennen Sie mir Ihren Computernamen, damit ich das Konto in der Active Directory entsperren kann.'
            ],
            bestResponseIdx: 0,
            feedback: {
              correction: {
                original: 'Hallo Frau Schneider, warum haben Sie das Passwort falsch eingegeben?',
                refined: 'Guten Tag, Frau Schneider. Keine Sorge, ich kümmere mich sofort darum. Nennen Sie mir bitte kurz Ihren Benutzernamen.',
                reasonAr: 'تجنب لوم المستخدم (Warum haben Sie...) في لحظات التوتر. ابدأ بطمأنته والتأكيد على التحرك الفوري مع طلب اسم المستخدم بلباقة بصيغة الاحترام (Siezen).'
              },
              vocabTip: {
                term: 'das Benutzerkonto entsperren / die Sperrung aufheben',
                ipa: '[das bəˈnʊtsɐˌkɔntoː ɛntˈʃpɛʁən]',
                ar: 'إلغاء قفل حساب المستخدم في النظام'
              },
              followUp: 'Überprüfen Sie den Status in der AD-Verwaltungskonsole und fragen Sie nach, ob ein temporäres Kennwort benötigt wird.',
              arabicNotes: 'في بيئة العمل الألمانية، يُعد استخدام صيغة "Siezen" مع نبرة هادئة وحازمة (Deeskalation) هو المعيار الأساسي لتقليل توتر العميل والالتزام بـ SLA.'
            }
          },
          {
            speaker: 'Frau Schneider',
            avatar: '👩‍💼',
            aiSpeech: 'Mein Benutzername ist s.schneider. Ich glaube, die Feststelltaste war aktiviert. Können Sie das direkt freischalten?',
            suggestedResponses: [
              'Vielen Dank. Ich habe Ihr Konto in der Active Directory aufgerufen und die Sperrung soeben aufgehoben. Bitte versuchen Sie nun erneut, sich anzumelden.',
              'Ja, das ist typisch mit der Feststelltaste. Jetzt sollte es wieder gehen, probieren Sie es einfach mal.',
              'Ich habe das Konto entsperrt und Ihnen sicherheitshalber ein temporäres Kennwort vergeben. Bitte ändern Sie dieses bei der ersten Anmeldung.'
            ],
            bestResponseIdx: 0,
            feedback: {
              correction: {
                original: 'Ja, das ist typisch mit der Feststelltaste. Probieren Sie mal.',
                refined: 'Ich habe die Sperrung in der Active Directory soeben aufgehoben. Bitte versuchen Sie erneut, sich anzumelden.',
                reasonAr: 'استخدم لغة مهنية تقنية دقيقة بدلاً من التعليقات غير الرسمية (das ist typisch). استخدم عبارات مثل "die Sperrung aufheben" و "erneut anmelden".'
              },
              vocabTip: {
                term: 'die Feststelltaste (Caps Lock) / die Kennwortrichtlinie',
                ipa: '[diː ˈfɛstˌʃtɛltaːstə]',
                ar: 'زر الحروف الكبيرة (Caps Lock) / سياسة كلمات المرور'
              },
              followUp: 'Warten Sie am Telefon, bis die Anwenderin den erfolgreichen Login bestätigt hat.',
              arabicNotes: 'من آداب الـ IT Service Desk الاحترافي البقاء على الخط حتى يتأكد المستخدم من نجاح الدخول لتجنب فتح تذكرة جديدة.'
            }
          }
        ]
      },
      {
        id: 'it_remote_network_de',
        title: 'Fernwartung & Netzwerk-Timeout (Troubleshooting)',
        level: 'B2',
        persona: {
          name: 'Herr Dr. Michael Weber (Forschung & Entwicklung)',
          role: 'Wissenschaftlicher Projektleiter',
          avatar: '👨‍💻',
          tone: 'Ruhig, benötigt zügige Lösung'
        },
        context: 'Ein Entwickler kann keine Verbindung zum zentralen Versionskontrollserver und ERP-System aufbauen. Der IT-Support schaltet sich per Fernwartung (TeamViewer/QuickAssist) auf.',
        steps: [
          {
            speaker: 'Herr Dr. Weber',
            avatar: '👨‍💻',
            aiSpeech: 'Guten Tag, IT-Support? Ich erhalte seit einer halben Stunde ständige Timeouts beim Zugriff auf unser Netzlaufwerk und das Git-Repository. Alle anderen Webseiten laden normal.',
            suggestedResponses: [
              'Guten Tag, Herr Dr. Weber. Das klingt nach einem Routing- oder VPN-Problem. Darf ich mich kurz per Fernwartung auf Ihren Rechner aufschalten, um die Verbindung zu diagnostizieren?',
              'Hallo! Haben Sie schon versucht, Ihren Router und den PC neu zu starten?',
              'Guten Tag. Das Git-Repository ist sicher überlastet, warten Sie einfach noch ein bisschen.'
            ],
            bestResponseIdx: 0,
            feedback: {
              correction: {
                original: 'Haben Sie schon den Router neu gestartet?',
                refined: 'Darf ich mich kurz per Fernwartung auf Ihren Rechner aufschalten, um die Netzwerkverbindung und das Routing zu prüfen?',
                reasonAr: 'في بيئات الشركات الكبرى، طلب جلسة مساعدة عن بُعد (Fernwartungssitzung) بأسلوب مهني أكثر فاعلية من تقديم نصائح عامة كإعادة تشغيل الراوتر المنزلي.'
              },
              vocabTip: {
                term: 'die Fernwartungssitzung einleiten / das Netzlaufwerk verbinden',
                ipa: '[diː ˈfɛʁnˌvaʁtʊŋsˌzɪtsʊŋ]',
                ar: 'بدء جلسة صيانة ومساعدة عن بُعد / ربط محرك الأقراص الشبكي'
              },
              followUp: 'Bitten Sie den Anwender höflich um die Fernwartungs-ID oder den Freigabecode.',
              arabicNotes: 'تذكر صيغة الاستئذان الرسمية في الألمانية: "Darf ich mich kurz aufschalten?" أو "Gestatten Sie mir, kurz per Fernwartung...".'
            }
          }
        ]
      }
    ],
    lab_medical: [
      {
        id: 'lab_critical_val_de',
        title: 'Pathologischer Kalium-Grenzwert (Dringende Meldung)',
        level: 'B2',
        persona: {
          name: 'Dr. med. Thomas Keller',
          role: 'Stationsarzt Kardiologie (Station 3B)',
          avatar: '👨‍⚕️',
          tone: 'Beschäftigt, aber aufmerksam auf Notfälle'
        },
        context: 'Im Zentrallabor ergibt die Serum-Elektrolyt-Messung bei einem stationären Patienten einen lebensbedrohlichen Kaliumwert von 7,1 mmol/l (Hyperkaliämie). Sie müssen den Stationsarzt sofort telefonisch informieren und den Anruf dokumentieren.',
        steps: [
          {
            speaker: 'Dr. Keller',
            avatar: '👨‍⚕️',
            aiSpeech: 'Station 3B, Dr. Keller am Apparat, was gibt es?',
            suggestedResponses: [
              'Guten Tag, Herr Dr. Keller, hier ist das Zentrallabor. Ich habe einen kritischen Alarmwert für Herrn Walter Krause, Geburtsdatum 14.05.1958: Serum-Kalium liegt bei 7,1 Millimol pro Liter.',
              'Hallo Dr. Keller, der Kaliumwert von einem Ihrer Patienten ist ziemlich hoch, schauen Sie bitte ins System.',
              'Guten Tag. Wir haben eine Probe gemessen, und das Kalium ist 7,1. Ist die Probe vielleicht hämolytisch?'
            ],
            bestResponseIdx: 0,
            feedback: {
              correction: {
                original: 'Der Wert ist ziemlich hoch, schauen Sie ins System.',
                refined: 'Ich habe einen kritischen Alarmwert für Herrn [Name, Geburtsdatum]: Serum-Kalium liegt bei 7,1 mmol/l.',
                reasonAr: 'عند الإبلاغ عن قيمة حرجة (Kritischer Alarmwert / Pathologischer Grenzwert)، يجب ذكر هوية المريض كاملة (الاسم وتاريخ الميلاد) مع القيمة الدقيقة ووحدتها فوراً لمنع أي لبس طبي.'
              },
              vocabTip: {
                term: 'der pathologische Grenzwert / die Hyperkaliämie',
                ipa: '[paːtoˈloːɡɪʃɐ ˈɡʁɛnt͡sˌveːɐ̯t]',
                ar: 'القيمة الحدية المرضية / فرط بوتاسيوم الدم'
              },
              followUp: 'Bitten Sie den Arzt um ein kurzes "Read-back" (Gegenlesen des Wertes) zur Dokumentation im LIS (Laborinformationssystem).',
              arabicNotes: 'في بروتوكولات المختبرات الطبية الألمانية (Rili-BÄK)، يُعد التوثيق الفوري مع وقت المكالمة واسم الطبيب المتلقي إلزامياً قانونياً.'
            }
          },
          {
            speaker: 'Dr. Keller',
            avatar: '👨‍⚕️',
            aiSpeech: '7,1 mmol/l bei Walter Krause? Das ist ein akuter Notfall! Wurde eine Hämolyse ausgeschlossen und ist die Messung wiederholt worden?',
            suggestedResponses: [
              'Ja, der Hämolyse-Index ist unauffällig und wir haben die Messung auf einem Zweitgerät bereits validiert bestätigt.',
              'Nein, wir haben es nur einmal durchs Gerät geschoben, aber die Maschine zeigt keine Fehler.',
              'Die Probe sah ganz normal aus, ich trage das jetzt einfach so ein.'
            ],
            bestResponseIdx: 0,
            feedback: {
              correction: {
                original: 'Die Probe sah ganz normal aus, die Maschine zeigt keine Fehler.',
                refined: 'Der Hämolyse-Index ist unauffällig und die Kontrollmessung auf dem Zweitgerät hat den Wert bestätigt.',
                reasonAr: 'في المختبر، لا نعتمد على التقدير البصري (sah ganz normal aus)، بل على مؤشرات علمية كـ "Hämolyse-Index" والتحقق المزدوج "Validierung auf einem Zweitgerät".'
              },
              vocabTip: {
                term: 'der Hämolyse-Index / die Doppelbestimmung',
                ipa: '[hɛmolyːzə ˈɪndɛks]',
                ar: 'مؤشر انحلال الدم / القياس التأكيدي المزدوج'
              },
              followUp: 'Notieren Sie den Namen des Arztes und die Uhrzeit im LIS-Befund.',
              arabicNotes: 'انحلال الدم (Hämolyse) يؤدي إلى خروج البوتاسيوم من كريات الدم الحمراء ويعطي نتيجة كاذبة الارتفاع (falsch-positiv)، لذلك فحص المؤشر خطوة حاسمة.'
            }
          }
        ]
      },
      {
        id: 'lab_qc_outlier_de',
        title: 'Qualitätskontrolle & Westgard-Regel (Abweichung)',
        level: 'B2',
        persona: {
          name: 'Frau Dr. Weber',
          role: 'Leitende BMA / Laborleitung',
          avatar: '👩‍🔬',
          tone: 'Analytisch, qualitätsbewusst'
        },
        context: 'Bei der morgendlichen internen Qualitätskontrolle (iQK) am Großanalysegerät für klinische Chemie weicht die Glukose-Kontrollprobe um mehr als 3 Standardabweichungen ab (Verletzung der Westgard-Regel 1-3s).',
        steps: [
          {
            speaker: 'Frau Dr. Weber',
            avatar: '👩‍🔬',
            aiSpeech: 'Guten Morgen. Ich sehe in der Leitzentrale, dass die Glukose-Messreihe blockiert ist. Was ist bei der internen Qualitätskontrolle vorgefallen?',
            suggestedResponses: [
              'Guten Morgen, Frau Dr. Weber. Die Kontrollmessung für Glukose liegt außerhalb von 3 Standardabweichungen (+3,2s). Ich habe den Parameter gesperrt, um Patientenproben zu schützen.',
              'Hallo. Das Gerät spinnt heute wieder ein bisschen, der Wert ist zu hoch. Soll ich es einfach nochmal laufen lassen?',
              'Guten Morgen. Wir haben noch keine Patientenproben gemessen, ich wollte gerade die Kalibrierung erneuern.'
            ],
            bestResponseIdx: 0,
            feedback: {
              correction: {
                original: 'Das Gerät spinnt, soll ich es einfach nochmal laufen lassen?',
                refined: 'Die Kontrollmessung liegt außerhalb von 3 Standardabweichungen. Ich habe den Parameter vorschriftsmäßig gesperrt.',
                reasonAr: 'تجنب التعبيرات العامية (das Gerät spinnt). التقرير المهني لمديرة المختبر يتطلب ذكر المصطلحات الإحصائية الدقيقة (Standardabweichung) والإجراء الاحترازي المتبع.'
              },
              vocabTip: {
                term: 'die Standardabweichung (SD) / die Westgard-Regeln / den Parameter sperren',
                ipa: '[ˈʃtandaʁtˌʔapvaɪ̯çʊŋ]',
                ar: 'الانحراف المعياري / قواعد ويستغارد لضبط الجودة / إيقاف المعامل'
              },
              followUp: 'Schlagen Sie die Ursachenanalyse vor: Reagenziencharge, Verfallsdatum oder Kalibrierungsdrift.',
              arabicNotes: 'وفق معايير ISO 15189 وضوابط Rili-BÄK، فإن خرق قاعدة 1:3s يعني خطأً عشوائياً أو نظامياً جسيماً يفرض إيقاف إطلاق نتائج المرضى فوراً.'
            }
          }
        ]
      }
    ]
  },

  // ------------------------- ENGLISH SCENARIOS -------------------------
  en: {
    it_support: [
      {
        id: 'it_ad_lockout_en',
        title: 'Active Directory Account Lockout (De-escalation)',
        level: 'B2',
        persona: {
          name: 'Ms. Sarah Jenkins (Sales Director)',
          role: 'Urgent Non-Technical User',
          avatar: '👩‍💼',
          tone: 'Frustrated and in a rush'
        },
        context: 'A sales executive is locked out of her enterprise domain workstation 10 minutes before a crucial client webinar due to repeated bad password attempts.',
        steps: [
          {
            speaker: 'Ms. Jenkins',
            avatar: '👩‍💼',
            aiSpeech: 'Hello IT Service Desk! I need immediate help. My screen says my account is locked out and I have a board presentation starting in ten minutes!',
            suggestedResponses: [
              'Good morning, Ms. Jenkins. Please do not worry, I will resolve this immediately. Could you please confirm your enterprise username or employee ID?',
              'Hi Sarah, calm down. Why did you type your password wrong so many times?',
              'Hello. You need to restart your laptop and try typing slower.'
            ],
            bestResponseIdx: 0,
            feedback: {
              correction: {
                original: 'Why did you type your password wrong so many times?',
                refined: 'Good morning, Ms. Jenkins. I understand the urgency and will resolve this right away. Could you please confirm your username?',
                reasonAr: 'تجنب استجواب المستخدم الغاضب أو لومه. ابدأ بإظهار التفهم والتعاطف المهني (empathy) ثم اطلب اسم المستخدم للحل الفوري.'
              },
              vocabTip: {
                term: 'to unlock the account / adhere to SLA (Service Level Agreement)',
                ipa: '[tuː ʌnˈlɒk ðiː əˈkaʊnt]',
                ar: 'إلغاء قفل الحساب / الالتزام باتفاقية مستوى الخدمة'
              },
              followUp: 'Unlock the account in the AD Users and Computers console and verify password synchronization.',
              arabicNotes: 'في خدمة العملاء باللغة الإنجليزية، استخدام العبارات الملطفة مثل "Please do not worry" و "I will resolve this immediately" يعكس كفاءة الدعم الفني.'
            }
          },
          {
            speaker: 'Ms. Jenkins',
            avatar: '👩‍💼',
            aiSpeech: 'My username is s.jenkins. I think Caps Lock was turned on when I unlocked my docking station. Can you clear it right now?',
            suggestedResponses: [
              'I have accessed Active Directory and successfully cleared the lockout flag. Please try logging in once more.',
              'Yeah, Caps Lock happens all the time. Try again now.',
              'I cleared it, but next time you should be much more careful with Caps Lock.'
            ],
            bestResponseIdx: 0,
            feedback: {
              correction: {
                original: 'Yeah, Caps Lock happens all the time. Try again.',
                refined: 'I have successfully cleared the lockout flag in Active Directory. Please go ahead and log in now.',
                reasonAr: 'الصياغة الاحترافية تتجنب التعليقات الاستخفافية وتركز على الإجراء التقني الدقيق مع دعوة المستخدم للمحاولة مجدداً.'
              },
              vocabTip: {
                term: 'to clear the lockout flag / domain controller',
                ipa: '[klɪə ðə ˈlɒkaʊt flæɡ]',
                ar: 'مسح علامة القفل من خادم النطاق'
              },
              followUp: 'Remain on the line until the user confirms successful authentication.',
              arabicNotes: 'من أفضل ممارسات الـ ITIL إنهاء المكالمة فقط بعد التأكد من تسجيل دخول المستخدم الفعلي.'
            }
          }
        ]
      },
      {
        id: 'it_remote_network_en',
        title: 'Remote Support & VPN Gateway Timeout',
        level: 'B2',
        persona: {
          name: 'Mr. David Miller (Senior Analyst)',
          role: 'Remote Employee',
          avatar: '👨‍💻',
          tone: 'Professional, seeking diagnostic assistance'
        },
        context: 'A financial analyst working remotely is experiencing gateway timeouts while attempting to mount shared secure drives over the corporate VPN tunnel.',
        steps: [
          {
            speaker: 'Mr. Miller',
            avatar: '👨‍💻',
            aiSpeech: 'Good morning, Service Desk. I am having recurring timeout errors connecting to our shared network drive through the corporate VPN, although my public internet is fine.',
            suggestedResponses: [
              'Good morning, Mr. Miller. That sounds like a VPN routing or authentication handshake issue. With your permission, may I initiate a quick remote session to inspect your network adapter settings?',
              'Hey David, just disconnect your Wi-Fi and reconnect again, that usually fixes it.',
              'Hello. That server might be down, please check back in a few hours.'
            ],
            bestResponseIdx: 0,
            feedback: {
              correction: {
                original: 'Hey David, just disconnect Wi-Fi and reconnect.',
                refined: 'With your permission, may I initiate a quick remote desktop session to inspect the VPN tunnel configuration?',
                reasonAr: 'استخدم لغة استئذان مهنية مسبقة (With your permission, may I initiate...) لفحص المشكلة تقنياً بدلاً من الاقتراحات الارتجالية.'
              },
              vocabTip: {
                term: 'remote desktop session / VPN tunnel handshake',
                ipa: '[rɪˈməʊt ˈdɛsktɒp ˈsɛʃən]',
                ar: 'جلسة سطح المكتب البعيد / مصافحة نفق الشبكة الافتراضية الخاصة'
              },
              followUp: 'Guide the user on accepting the remote screen-sharing prompt.',
              arabicNotes: 'تأكد دائماً من نطق المصطلحات التقنية بدقة ووضوح في بيئات العمل متعددة الجنسيات.'
            }
          }
        ]
      }
    ],
    lab_medical: [
      {
        id: 'lab_critical_val_en',
        title: 'Critical Serum Potassium Alert (Urgent Notification)',
        level: 'B2',
        persona: {
          name: 'Dr. Arthur Evans',
          role: 'Attending Cardiologist (Ward 4B)',
          avatar: '👨‍⚕️',
          tone: 'Urgent, clinical, focused'
        },
        context: 'The clinical chemistry analyzer detects a severe, life-threatening hyperkalemia of 7.2 mmol/L. You must immediately notify the ward physician and document the verbal read-back.',
        steps: [
          {
            speaker: 'Dr. Evans',
            avatar: '👨‍⚕️',
            aiSpeech: 'Ward 4B, Dr. Evans speaking. How can I help you?',
            suggestedResponses: [
              'Good morning, Dr. Evans. This is the central clinical lab calling with an urgent critical value for patient Robert Hayes, DOB March 12, 1964. Serum potassium is 7.2 mmol/L.',
              'Hello Dr. Evans, one of your patients has a really dangerous potassium value in the computer, you should check it.',
              'Hi Doctor, we ran a blood tube and potassium is high, but maybe the nurse took it badly?'
            ],
            bestResponseIdx: 0,
            feedback: {
              correction: {
                original: 'One of your patients has a dangerous potassium value, check it.',
                refined: 'This is the central laboratory with an urgent critical value for [Patient Name, DOB]: Serum potassium is 7.2 mmol/L.',
                reasonAr: 'في الاتصالات الطبية الطارئة، لا تطلب من الطبيب تفقد الحاسوب، بل أبلغه شفهياً بالاسم وتاريخ الميلاد والقيمة ووحدتها بوضوح قاطع.'
              },
              vocabTip: {
                term: 'critical alert value / life-threatening hyperkalemia',
                ipa: '[ˈkrɪtɪkəl əˈlɜːt ˈvæljuː]',
                ar: 'قيمة التنبيه الحرجة / فرط بوتاسيوم الدم المهدد للحياة'
              },
              followUp: 'Request a verbal read-back from the physician to confirm accurate receipt.',
              arabicNotes: 'البروتوكول الطبي العالمي يقتضي طلب "Read-back" (إعادة قراءة القيمة من الطبيب) لمنع الأخطاء السمعية القاتلة.'
            }
          },
          {
            speaker: 'Dr. Evans',
            avatar: '👨‍⚕️',
            aiSpeech: '7.2 mmol/L for Robert Hayes, noted. Was hemolysis ruled out and has the result been re-verified on a secondary analyzer?',
            suggestedResponses: [
              'Yes, doctor. The hemolysis index is clear and we have completed a duplicate run on our secondary platform with consistent findings.',
              'Well, we just ran the tube once, but the machine has valid calibration.',
              'The sample looked normal to my eye, so it should be fine.'
            ],
            bestResponseIdx: 0,
            feedback: {
              correction: {
                original: 'The sample looked normal to my eye, so it should be fine.',
                refined: 'The hemolysis index is completely clear and the finding was validated through a duplicate run on our secondary platform.',
                reasonAr: 'في الاعتماد المخبري، التحقق الآلي من مؤشر التحلل (Hemolysis index) وإجراء الفحص التأكيدي المزدوج هما الدليل الوحيد المقبول.'
              },
              vocabTip: {
                term: 'duplicate run / hemolysis index / secondary platform',
                ipa: '[ˈdjuːplɪkət rʌn]',
                ar: 'إجراء فحص تأكيدي مكرر / مؤشر انحلال الدم / جهاز التحليل الثانوي'
              },
              followUp: 'Record Dr. Evans\' name and exact timestamp in the LIS critical incident log.',
              arabicNotes: 'توثيق اسم الطبيب والوقت في سجل الحوادث الحرجة بنظام معلومات المختبر (LIS) يحمي المختبر من المسؤولية القانونية.'
            }
          }
        ]
      }
    ]
  }
};

// =========================================================================
// MODE 2: VOCABULARY & PHRASE BUILDER (TECHNICAL GLOSSARY)
// =========================================================================
export const VOCATIONAL_GLOSSARY = {
  it_support: [
    {
      termDe: 'das Benutzerkonto entsperren',
      termEn: 'to unlock the user account',
      category: 'Active Directory',
      level: 'A2-B1',
      ipa: '[das bəˈnʊtsɐˌkɔntoː ɛntˈʃpɛʁən]',
      defDe: 'Die administrative Aufhebung einer Kontosperre nach wiederholten Fehlversuchen beim Login.',
      defEn: 'Administrative restoration of user login access following consecutive failed authentication attempts.',
      defAr: 'إلغاء قفل حساب المستخدم بعد محاولات تسجيل دخول خاطئة متعددة.',
      sampleDe: 'Ich habe das Benutzerkonto in der Active Directory entsperrt; bitte melden Sie sich erneut an.',
      sampleEn: 'I have unlocked your account in Active Directory; please go ahead and log in again.'
    },
    {
      termDe: 'die Fernwartungssitzung',
      termEn: 'remote desktop session',
      category: 'Remote Support',
      level: 'B1-B2',
      ipa: '[diː ˈfɛʁnˌvaʁtʊŋsˌzɪtsʊŋ]',
      defDe: 'Direkte Bildschirmübertragung zur Fehlerbehebung auf dem Endgerät des Anwenders.',
      defEn: 'Direct screen sharing connection to troubleshoot issues on the user workstation.',
      defAr: 'جلسة صيانة ودعم فني عن بُعد عبر مشاركة شاشة جهاز المستخدم.',
      sampleDe: 'Darf ich eine Fernwartungssitzung starten, um die Druckertreiber zu aktualisieren?',
      sampleEn: 'May I initiate a remote desktop session to update your local print drivers?'
    },
    {
      termDe: 'das Störungsticket eskalieren',
      termEn: 'to escalate an incident ticket',
      category: 'ITIL & Service Desk',
      level: 'B2',
      ipa: '[das ˈʃtøːʁʊŋsˌtɪkət ɛskaˈliːʁən]',
      defDe: 'Weiterleitung eines komplexen Problems an den 2nd-Level-Support oder Systemingenieure.',
      defEn: 'Forwarding a critical or unresolved ticket to 2nd-level support or specialized engineering teams.',
      defAr: 'تصعيد تذكرة العطل الفني إلى المستوى الثاني من الدعم أو إلى مهندسي الأنظمة.',
      sampleDe: 'Wegen der drohenden SLA-Verletzung habe ich das Ticket direkt an das Netzwerkteam eskaliert.',
      sampleEn: 'Due to the imminent SLA breach, I have escalated the incident ticket to the network team.'
    },
    {
      termDe: 'die Zugriffsrechte verwalten',
      termEn: 'to manage access permissions',
      category: 'Security & Active Directory',
      level: 'B2',
      ipa: '[diː ˈtsuːɡʁɪfsˌʁɛçtə fɛɐ̯ˈvaltn̩]',
      defDe: 'Zuweisung und Entzug von Ordner- und Datenbankberechtigungen nach dem Least-Privilege-Prinzip.',
      defEn: 'Assignment and revocation of folder and database rights following the least-privilege principle.',
      defAr: 'إدارة صلاحيات الوصول للمجلدات وقواعد البيانات وفق مبدأ الحد الأدنى من الامتيازات.',
      sampleDe: 'Die Zugriffsrechte für den neuen Mitarbeiter wurden gemäß der Gruppenrichtlinie hinterlegt.',
      sampleEn: 'The access permissions for the new hire have been configured according to group policy.'
    }
  ],
  lab_medical: [
    {
      termDe: 'die Probenannahme & das Barcoding',
      termEn: 'specimen intake and barcode scanning',
      category: 'Pre-Analytics',
      level: 'A2-B1',
      ipa: '[diː ˈpʁoːbn̩ˌʔanaːmə]',
      defDe: 'Eingangskontrolle von Blut- und Gewebeproben auf Unversehrtheit und eindeutige Patientenidentifikation.',
      defEn: 'Initial inspection of blood and tissue tubes for integrity and unambiguous patient barcode ID.',
      defAr: 'فحص واستلام العينات الطبية والتحقق من سلامتها وتطابق الباركود التعريفي للمريض.',
      sampleDe: 'Bei der Probenannahme muss jedes EDTA-Röhrchen sofort gescannt und registriert werden.',
      sampleEn: 'During specimen intake, every EDTA tube must be scanned and registered immediately.'
    },
    {
      termDe: 'der pathologische Grenzwert',
      termEn: 'critical pathological threshold / alert value',
      category: 'Reporting & Analysis',
      level: 'B2',
      ipa: '[paːtoˈloːɡɪʃɐ ˈɡʁɛnt͡sˌveːɐ̯t]',
      defDe: 'Extremwert eines Laborparameters, der ein unmittelbares vitales Risiko für den Patienten darstellt.',
      defEn: 'An extreme lab result indicating immediate, life-threatening clinical risk requiring urgent notification.',
      defAr: 'قيمة مخبرية غير طبيعية وحرجة تمثل خطورة مباشرة على حياة المريض وتستدعي إبلاغاً فورياً.',
      sampleDe: 'Bei einem Kaliumwert von über 6,5 mmol/l greift sofort das Meldeschema für pathologische Grenzwerte.',
      sampleEn: 'A potassium level exceeding 6.5 mmol/L immediately triggers the critical alert reporting protocol.'
    },
    {
      termDe: 'die Qualitätskontrolle & Westgard-Regeln',
      termEn: 'internal quality control & Westgard rules',
      category: 'Quality Assurance',
      level: 'B2-C1',
      ipa: '[diː kvaliˈtɛːts kɔnˌtʁɔlə]',
      defDe: 'Tägliche statistische Überprüfung der Messpräzision mittels Kontrollseren zur Fehlererkennung.',
      defEn: 'Daily statistical precision verification using control sera to detect random and systematic errors.',
      defAr: 'ضبط الجودة اليومي الداخلي وتطبيق قواعد ويستغارد الإحصائية لاكتشاف الأخطاء العشوائية والنظامية.',
      sampleDe: 'Nach Verletzung der 1-3s-Westgard-Regel muss eine Rekalibrierung der Glukose-Reagenz erfolgen.',
      sampleEn: 'Following a 1-3s Westgard rule violation, the glucose reagent assay must be recalibrated.'
    },
    {
      termDe: 'das Sicherheitsdatenblatt (SDB)',
      termEn: 'Safety Data Sheet (SDS)',
      category: 'Chemical Safety',
      level: 'B1-B2',
      ipa: '[das ˈzɪçɐhaɪ̯tsˌdaːtn̩ˌblat]',
      defDe: 'Gesetzlich vorgeschriebenes Dokument mit Schutzmaßnahmen, Gefahrenpiktogrammen und Entsorgungshinweisen.',
      defEn: 'Legally mandated safety document outlining hazard pictograms, protective gear, and spill handling.',
      defAr: 'صحيفة بيانات سلامة المواد الكيميائية التي تحدد المخاطر وإجراءات الحماية والتخلص الآمن.',
      sampleDe: 'Vor dem Ansetzen der Formalin-Lösung muss das entsprechende Sicherheitsdatenblatt studiert werden.',
      sampleEn: 'Before preparing the formalin solution, the corresponding safety data sheet must be reviewed.'
    }
  ]
};

// =========================================================================
// MODE 3: ERROR CORRECTION & POLISH PRESETS
// =========================================================================
export const VOCATIONAL_POLISH_PRESETS = {
  de: [
    {
      domain: 'it_support',
      title: 'Ticket-Status-Aktualisierung (ITIL)',
      rawDraft: 'Hallo Herr Schmidt, ich habe Ihr Ticket gesehen. Wir können jetzt nichts machen weil Server kaputt ist. Wir melden uns später wenn geht.',
      polished: 'Guten Tag, Herr Schmidt. Bezüglich Ihres gemeldeten Vorfalls (Ticket #4092) möchten wir Sie darüber informieren, dass unsere Systemtechnik derzeit an einer unvorhergesehenen Serverstörung arbeitet. Wir rechnen mit einer Behebung innerhalb der nächsten zwei Stunden und halten Sie über den Fortschritt auf dem Laufenden.',
      diffNotes: [
        'Ersetzung der Umgangssprache ("nichts machen", "kaputt") durch professionelle ITIL-Terminologie ("unvorhergesehene Serverstörung").',
        'Verbindliche Zeitschätzung statt vagem "später wenn geht".',
        'Höfliche und vertrauensbildende Schlussformel ("halten Sie auf dem Laufenden").'
      ],
      arabicExplanation: 'الرسالة الأصلية عامية وضعيفة جداً وتفقد العميل الثقة. في بيئة العمل الألمانية، يجب استخدام مصطلحات دقيقة مثل "unvorhergesehene Serverstörung" بدلاً من "kaputt"، وتقديم إطار زمني تقديري مع الالتزام بصيغة "Siezen".'
    },
    {
      domain: 'lab_medical',
      title: 'Hämolytische Probe & Nachforderung',
      rawDraft: 'Guten Tag Station 2. Die Blutprobe von Patient Müller ist kaputt und rot. Wir können nichts messen. Schicken Sie schnell neues Blut.',
      polished: 'Guten Tag, Station 2. Bei der heute eingegangenen Serumprobe von Herrn Müller (Geb. 03.11.1965) wurde ein ausgeprägter Hämolyse-Index festgestellt. Eine zuverlässige Bestimmung der Kalium- und LDH-Werte ist methodisch nicht möglich. Wir bitten höflich um eine zeitnahe Abnahme einer Ersatzprobe.',
      diffNotes: [
        'Vermeidung von Laiensprache ("Blut ist kaputt und rot") -> "ausgeprägter Hämolyse-Index".',
        'Konkrete Benennung der betroffenen Parameter (Kalium, LDH) statt pauschalem "nichts messen".',
        'Klare Patientenidentifikation und kollegiale Bitte um Nachforderung.'
      ],
      arabicExplanation: 'لا يجوز في التقرير المخبري استخدام عبارة "الدم تالف وأحمر" بل يجب التعبير علمياً بأن هناك "ausgeprägter Hämolyse-Index"، وتحديد التحاليل المتأثرة بدقة كالبوتاسيوم، وطلب عينة بديلة بلباقة طبية.'
    }
  ],
  en: [
    {
      domain: 'it_support',
      title: 'Incident Update & SLA Notice',
      rawDraft: 'Hey user, your PC issue is waiting because network team is not answering us. Wait more time please.',
      polished: 'Dear Colleague, regarding your open support request (INC-8821), our team is actively collaborating with network engineering to diagnose the packet loss. We are tracking this closely under our priority SLA and will provide an updated status within the hour.',
      diffNotes: [
        'Replaced blame ("network team not answering") with professional collaboration ("actively collaborating with network engineering").',
        'Professional salutation and explicit ticket ID reference.',
        'Clear SLA commitment.'
      ],
      arabicExplanation: 'من قواعد الـ ITIL الذهبية عدم إلقاء اللوم على فرق الدعم الداخلية أمام المستخدم ("network team not answering"). يُستعاض عن ذلك بالتأكيد على العمل المشترك وتحديد موعد زمني واضح.'
    },
    {
      domain: 'lab_medical',
      title: 'Sample Recollection Request',
      rawDraft: 'Hi ward, the blood tube came with no barcode and is totally clotted. Throwing it away, send another one.',
      polished: 'Good afternoon, Ward 3. The coagulation sample received for patient Jane Doe arrived unlabelled without a primary barcode and exhibits marked micro-clotting. In accordance with laboratory biosafety and quality guidelines, we cannot process this specimen. Kindly submit a repeat citrated draw at your earliest convenience.',
      diffNotes: [
        'Professional clinical register ("unlabelled", "marked micro-clotting") replacing blunt phrasing ("throwing it away").',
        'Explicit citation of laboratory quality and safety standards.',
        'Specific tube type requested ("citrated draw").'
      ],
      arabicExplanation: 'في بروتوكولات المختبرات، يتم ذكر عدم مطابقة العينة لمعايير الجودة (unlabelled, micro-clotting) وتحديد نوع الأنبوب المطلوب بوضوح بدلاً من العبارات الفجة.'
    }
  ]
};

// =========================================================================
// MODE 4: QUICK QUIZ & FLASHCARD CHALLENGE
// =========================================================================
export const VOCATIONAL_QUIZZES = {
  de: [
    {
      domain: 'it_support',
      level: 'B2',
      question: 'Ein aufgebrachter Abteilungsleiter ruft an und verlangt, dass Sie ihm das Kennwort eines abwesenden Mitarbeiters aushändigen. Wie reagieren Sie professionell und richtlinienkonform?',
      options: [
        'Geben Sie ihm das Kennwort sofort, da er der direkte Vorgesetzte ist.',
        'Erklären Sie höflich, dass IT-Sicherheitsrichtlinien die Weitergabe persönlicher Passwörter untersagen, und bieten Sie eine offizielle Freigabe des Postfachs über den Administrator an.',
        'Sagen Sie unhöflich: "Das ist streng verboten, lernen Sie erst einmal Datenschutz!"',
        'Raten Sie ihm, das Passwort des Mitarbeiters einfach selbst zu erraten.'
      ],
      correctIdx: 1,
      explanationAr: 'وفق سياسات أمان تكنولوجيا المعلومات (IT Security Policies)، لا يُمنح أي طرف كلمة مرور شخصية حتى لو كان المدير المباشر. الرد المهني يرفض بلباقة ويقدم البديل الرسمي المعتمد (Freigabe des Postfachs über den Administrator).'
    },
    {
      domain: 'lab_medical',
      level: 'B2',
      question: 'Bei der Probenannahme stellen Sie fest, dass ein Röhrchen für die Gerinnungsdiagnostik (Citrat-Blut) nur zur Hälfte gefüllt ist. Was ist das korrekte laboranalytische Vorgehen?',
      options: [
        'Das Röhrchen trotzdem zentrifugieren und messen, um Zeit zu sparen.',
        'Die Probe verwerfen, im Laborinformationssystem (LIS) den Mangel "Unterfüllung / falsches Mischungsverhältnis" dokumentieren und eine Nachabnahme anfordern.',
        'Mit Kochsalzlösung (NaCl) bis zur Eichmarke auffüllen.',
        'Den Wert schätzen und im Befund vermerken.'
      ],
      correctIdx: 1,
      explanationAr: 'في تحاليل التخثر (Citratblut)، يجب الالتزام بنسبة 1:9 الدقيقة بين مانع التخثر والدم. نقص الملء (Unterfüllung) يؤدي لنتائج خاطئة كاذبة التمديد (falsch-verlängert). الإجراء العلمي هو رفض العينة وتوثيق السبب وطلب إعادة السحب.'
    }
  ],
  en: [
    {
      domain: 'it_support',
      level: 'B2',
      question: 'A remote user reports that their local network cable is connected, but Windows displays "No Internet Access, APIPA address 169.254.x.x". What is the most likely root cause and technical advice?',
      options: [
        'The display monitor has lost its HDMI sync signal.',
        'The workstation failed to obtain an IP lease from the DHCP server; advise running "ipconfig /renew" or verifying network port patching.',
        'The user\'s Active Directory password has expired.',
        'The CPU fan has overheated.'
      ],
      correctIdx: 1,
      explanationAr: 'عنوان APIPA (169.254.x.x) يعني أن الجهاز لم يتلق عنوان IP من خادم DHCP. الحل التقني هو محاولة تجديد العنوان (ipconfig /renew) وفحص التوصيل بالشبكة.'
    },
    {
      domain: 'lab_medical',
      level: 'B2',
      question: 'A potassium result of 6.8 mmol/L is flagged as a critical high alert. What is the mandatory immediate action before releasing the result?',
      options: [
        'Release it online and go for a coffee break.',
        'Inspect the sample for hemolysis, perform a duplicate verification run, and immediately call the attending physician with a verbal read-back.',
        'Dilute the sample ten times with tap water.',
        'Discard the patient history.'
      ],
      correctIdx: 1,
      explanationAr: 'الإجراء الإلزامي عند وجود قيمة حرجة للبوتاسيوم: فحص مؤشر انحلال الدم، إعادة الفحص للتأكد، والاتصال الفوري بالطبيب مع طلب قراءة تأكيدية شفهية (verbal read-back).'
    }
  ]
};

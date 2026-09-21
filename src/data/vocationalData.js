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
          },
          {
            speaker: 'Herr Dr. Weber',
            avatar: '👨‍💻',
            aiSpeech: 'Die Fernwartung läuft, Sie sollten meinen Bildschirm sehen. Ich verstehe allerdings von Netzwerken wenig — können Sie mir sagen, was Sie da gerade prüfen?',
            suggestedResponses: [
              'Sehr gerne. Ich sehe mir gerade die Routing-Tabelle an, also die Liste, welcher Datenverkehr durch den VPN-Tunnel geleitet wird. Und tatsächlich: Ihr internes Firmennetz wird derzeit nicht über den Tunnel geroutet. Deshalb funktioniert das öffentliche Internet, während interne Server nicht erreichbar sind.',
              'Ich prüfe gerade die Routing-Tabelle auf fehlerhafte Einträge im Split-Tunneling-Profil und verifiziere die Metrik der Schnittstellen.',
              'Das ist ziemlich kompliziert, das würde jetzt zu weit führen. Lassen Sie mich einfach kurz machen.'
            ],
            bestResponseIdx: 0,
            feedback: {
              correction: {
                original: 'Ich verifiziere die Metrik der Schnittstellen im Split-Tunneling-Profil.',
                refined: 'Ich sehe mir an, welcher Datenverkehr durch den VPN-Tunnel geleitet wird — Ihr internes Firmennetz läuft gerade nicht darüber.',
                reasonAr: 'المستخدم صرّح بأنه لا يفهم الشبكات. إغراقه بالمصطلحات (Metrik, Split-Tunneling) ليس دليل كفاءة بل فشل في التواصل. اشرح بلغة بسيطة، واربط الشرح بالعَرَض الذي وصفه بنفسه.'
              },
              vocabTip: {
                term: 'die Routing-Tabelle / der VPN-Tunnel / das interne Firmennetz',
                ipa: '[diː ˈruːtɪŋˌtabɛlə]',
                ar: 'جدول التوجيه / نفق الشبكة الافتراضية / الشبكة الداخلية للشركة'
              },
              followUp: 'Erklären Sie den Befund in einem Satz und kündigen Sie den nächsten Schritt an, bevor Sie etwas ändern.',
              arabicNotes: 'قاعدة ذهبية في الدعم الفني الألماني: اشرح ما تفعله قبل أن تفعله على جهاز المستخدم (Ich kündige an, was ich tue)، فهذا يبني الثقة ويمنع القلق.'
            }
          },
          {
            speaker: 'Herr Dr. Weber',
            avatar: '👨‍💻',
            aiSpeech: 'Jetzt verstehe ich das. Das Netzlaufwerk ist wieder da, vielen Dank. Eine Kollegin aus meinem Team hatte heute früh übrigens genau dasselbe Problem.',
            suggestedResponses: [
              'Danke für den Hinweis, das ist sehr wichtig. Dann handelt es sich vermutlich nicht um einen Einzelfall, sondern um ein fehlerhaftes VPN-Profil nach dem Update von gestern. Ich lege einen Problem-Datensatz an, informiere das Netzwerkteam und wir spielen das korrigierte Profil zentral aus.',
              'Gut zu wissen. Sagen Sie Ihrer Kollegin bitte, sie soll sich auch beim Service Desk melden, dann schauen wir uns das einzeln an.',
              'Das kann Zufall sein. Ich schließe Ihr Ticket erst einmal, bei Ihnen läuft ja jetzt alles.'
            ],
            bestResponseIdx: 0,
            feedback: {
              correction: {
                original: 'Das kann Zufall sein, ich schließe Ihr Ticket erst einmal.',
                refined: 'Dann handelt es sich vermutlich nicht um einen Einzelfall. Ich lege einen Problem-Datensatz an und informiere das Netzwerkteam.',
                reasonAr: 'بلاغان متطابقان في اليوم نفسه مؤشر على مشكلة جذرية (Problem) وليس حادثتين منفصلتين. إغلاق التذكرة لأن هذا المستخدم تحديداً يعمل الآن يترك بقية الفريق يعاني.'
              },
              vocabTip: {
                term: 'der Einzelfall / der Problem-Datensatz / das Profil zentral ausspielen',
                ipa: '[ˈaɪ̯nt͡sl̩ˌfal]',
                ar: 'حالة فردية / سجل المشكلة الجذرية / نشر الملف مركزياً'
              },
              followUp: 'Dokumentieren Sie die Verknüpfung beider Meldungen und bieten Sie an, die Kollegin aktiv zu kontaktieren.',
              arabicNotes: 'في إطار ITIL يُفرَّق بين Incident (حادثة فردية) وProblem (سبب جذري يولّد حوادث متعددة)؛ استخدام المصطلح الصحيح أمام مستخدم تقني يدل على احترافية.'
            }
          }
        ]
      },
      {
        id: 'it_epic_chart_de',
        title: 'EPIC: Patientenakte nach Rechteänderung gesperrt (Intensivstation)',
        level: 'B2',
        persona: {
          name: 'Frau Anja Brandt (Fachpflege Intensiv)',
          role: 'Pflegekraft im Schichtwechsel',
          avatar: '👩‍⚕️',
          tone: 'Angespannt, unter Zeitdruck bei der Übergabe'
        },
        context: 'Eine Intensivpflegekraft kann in EPIC (Hyperspace) die Akte eines beatmeten Patienten nicht mehr öffnen. Sie erhält die Meldung „Kein Zugriff auf diese Behandlungseinheit". Die Schichtübergabe läuft bereits, die Vitalwerte müssen dokumentiert werden.',
        steps: [
          {
            speaker: 'Frau Brandt',
            avatar: '👩‍⚕️',
            aiSpeech: 'Guten Tag, Intensivstation 2. Ich komme in EPIC nicht mehr in die Akte von meinem Beatmungspatienten. Es kommt nur „Kein Zugriff auf diese Behandlungseinheit". Ich muss aber jetzt die Übergabe dokumentieren!',
            suggestedResponses: [
              'Guten Tag, Frau Brandt. Ich kümmere mich sofort darum. Nennen Sie mir bitte Ihr EPIC-Benutzerkürzel und die Fallnummer des Patienten, dann prüfe ich umgehend Ihr Berechtigungsprofil.',
              'Hallo, da müssen Sie ein Ticket aufmachen, dann schaut sich das jemand in den nächsten Stunden an.',
              'Guten Tag. Haben Sie es schon mal mit Abmelden und wieder Anmelden probiert? Meistens hilft das schon.'
            ],
            bestResponseIdx: 0,
            feedback: {
              correction: {
                original: 'Da müssen Sie ein Ticket aufmachen, dann schaut sich das jemand an.',
                refined: 'Ich kümmere mich sofort darum. Nennen Sie mir bitte Ihr EPIC-Benutzerkürzel und die Fallnummer, dann prüfe ich Ihr Berechtigungsprofil.',
                reasonAr: 'في بيئة المستشفى، إحالة الممرضة إلى فتح تذكرة أثناء تسليم وردية العناية المركزة تأخير غير مقبول. ابدأ بتأكيد التحرك الفوري (Ich kümmere mich sofort darum) ثم اطلب البيانات المحددة التي تمكّنك من الفحص.'
              },
              vocabTip: {
                term: 'das Berechtigungsprofil / die Behandlungseinheit / die Fallnummer',
                ipa: '[bəˈʁɛçtɪɡʊŋsproˌfiːl]',
                ar: 'ملف الصلاحيات / وحدة العلاج (القسم) / رقم الحالة'
              },
              followUp: 'Prüfen Sie im EPIC-Administrationsbereich, ob der Anwenderin die richtige Behandlungseinheit (Kontext Intensivstation 2) zugeordnet ist.',
              arabicNotes: 'نظام EPIC يربط الصلاحية بوحدة علاجية محددة (Behandlungseinheit)، لذلك قد يكون للمستخدم حساب سليم لكن بدون ربط بالقسم الصحيح بعد نقل الوردية.'
            }
          },
          {
            speaker: 'Frau Brandt',
            avatar: '👩‍⚕️',
            aiSpeech: 'Mein Kürzel ist a.brandt, die Fallnummer lautet 4471902. Gestern ging das noch problemlos. Ich wurde diese Woche von der Station 4 auf die Intensiv 2 versetzt.',
            suggestedResponses: [
              'Vielen Dank, das erklärt es. Ihr Profil ist noch der Station 4 zugeordnet. Ich hinterlege jetzt die Intensivstation 2 als Behandlungseinheit. Bitte melden Sie sich einmal komplett von Hyperspace ab und wieder an.',
              'Okay, dann hat die Personalabteilung das wohl vergessen. Da kann ich leider nichts machen, das müssen die ändern.',
              'Ich gebe Ihnen einfach Vollzugriff auf alle Stationen, dann haben wir das Problem nicht mehr.'
            ],
            bestResponseIdx: 0,
            feedback: {
              correction: {
                original: 'Ich gebe Ihnen einfach Vollzugriff auf alle Stationen.',
                refined: 'Ich hinterlege die Intensivstation 2 als zusätzliche Behandlungseinheit in Ihrem Profil.',
                reasonAr: 'منح صلاحية كاملة (Vollzugriff) لحل سريع خرق لمبدأ الحد الأدنى من الصلاحيات ولحماية بيانات المرضى. امنح فقط الوحدة العلاجية المطلوبة، واشرح للمستخدم الخطوة التالية (إعادة تسجيل الدخول).'
              },
              vocabTip: {
                term: 'die Versetzung / das Profil hinterlegen / sich neu anmelden',
                ipa: '[ˈpʁoːfiːl hɪntɐˌleːɡn̩]',
                ar: 'النقل بين الأقسام / حفظ الملف الشخصي / إعادة تسجيل الدخول'
              },
              followUp: 'Bitten Sie die Anwenderin, den Zugriff zu bestätigen, und dokumentieren Sie die Profiländerung im Ticket.',
              arabicNotes: 'في الألمانية المهنية يُفضّل تفسير السبب للمستخدم بإيجاز (das erklärt es) لأنه يبني الثقة ويقلل تكرار البلاغ.'
            }
          },
          {
            speaker: 'Frau Brandt',
            avatar: '👩‍⚕️',
            aiSpeech: 'Einen Moment... ja, jetzt ist die Akte da. Aber was mache ich, wenn EPIC während der Nachtschicht komplett ausfällt? Dann stehe ich wieder ohne Dokumentation da.',
            suggestedResponses: [
              'Für diesen Fall gibt es das Ausfallkonzept: Über den BCA-Arbeitsplatz haben Sie lesenden Zugriff auf die letzten Patientendaten, und die Dokumentation erfolgt übergangsweise auf den Papierformularen der Station.',
              'Das kommt eigentlich nie vor, machen Sie sich darüber mal keine Gedanken.',
              'Dann rufen Sie einfach wieder hier an und wir schauen dann weiter.'
            ],
            bestResponseIdx: 0,
            feedback: {
              correction: {
                original: 'Das kommt eigentlich nie vor, machen Sie sich keine Gedanken.',
                refined: 'Für diesen Fall greift das Ausfallkonzept: lesender Zugriff über den BCA-Arbeitsplatz und Papierdokumentation als Rückfallebene.',
                reasonAr: 'لا تُهوّن من قلق مشروع يتعلق بسلامة التوثيق. اذكر خطة الطوارئ المعتمدة (Ausfallkonzept) وسمِّ البديل العملي بوضوح، فهذا ما يطمئن الطاقم فعلياً.'
              },
              vocabTip: {
                term: 'das Ausfallkonzept / die Rückfallebene / der Notfallarbeitsplatz (BCA)',
                ipa: '[ˈaʊ̯sfalkɔnˌtsɛpt]',
                ar: 'خطة التعطل / المستوى الاحتياطي / محطة العمل الطارئة'
              },
              followUp: 'Verweisen Sie auf die Kurzanleitung zum Ausfallkonzept im Intranet und bieten Sie eine Einweisung für das Team an.',
              arabicNotes: 'في المستشفيات الألمانية، خطة التعطل (Ausfallkonzept) إلزامية قانونياً، ومعرفة الدعم الفني بها جزء أساسي من الكفاءة المهنية.'
            }
          }
        ]
      },
      {
        id: 'it_citrix_session_de',
        title: 'Citrix: Veröffentlichte Anwendung startet nicht (Ghost-Sitzung)',
        level: 'B2',
        persona: {
          name: 'Herr Dr. Jonas Riedel (Oberarzt Radiologie)',
          role: 'Anwender im Homeoffice-Befunddienst',
          avatar: '👨‍⚕️',
          tone: 'Sachlich, aber ungeduldig'
        },
        context: 'Ein Oberarzt möchte aus dem Homeoffice über Citrix Workspace auf das Befundungssystem zugreifen. Die veröffentlichte Anwendung bleibt beim Start hängen; im Hintergrund existiert noch eine nicht sauber getrennte Sitzung vom Vortag (Ghost-Sitzung).',
        steps: [
          {
            speaker: 'Dr. Riedel',
            avatar: '👨‍⚕️',
            aiSpeech: 'Riedel, Radiologie. Ich sitze im Homeoffice und komme über Citrix nicht ins Befundungssystem. Das Fenster erscheint kurz und verschwindet dann wieder. Ich habe heute Nachmittag noch zwölf Befunde offen.',
            suggestedResponses: [
              'Guten Tag, Herr Dr. Riedel. Das klingt nach einer nicht korrekt getrennten Sitzung. Darf ich Ihre aktiven Citrix-Sitzungen prüfen? Ich benötige dafür nur Ihr Anmeldekürzel.',
              'Guten Tag. Haben Sie schon versucht, den Rechner komplett neu zu starten? Das löst so etwas meistens.',
              'Da ist wahrscheinlich Ihr Internet zu Hause zu langsam. Prüfen Sie bitte zuerst Ihre WLAN-Verbindung.'
            ],
            bestResponseIdx: 0,
            feedback: {
              correction: {
                original: 'Da ist wahrscheinlich Ihr Internet zu Hause zu langsam.',
                refined: 'Das klingt nach einer nicht korrekt getrennten Sitzung. Darf ich Ihre aktiven Citrix-Sitzungen prüfen?',
                reasonAr: 'تجنّب إلقاء اللوم على بيئة المستخدم (إنترنت المنزل) قبل الفحص، فهو يبدو تهرباً من المسؤولية. اطرح فرضية تقنية محددة واطلب الإذن بالفحص بصيغة مهذبة (Darf ich...?).'
              },
              vocabTip: {
                term: 'die veröffentlichte Anwendung / die getrennte Sitzung / das Anmeldekürzel',
                ipa: '[fɛɐ̯ˈʔœfn̩tlɪçtə ˈanvɛndʊŋ]',
                ar: 'التطبيق المنشور / الجلسة المفصولة / اسم المستخدم المختصر'
              },
              followUp: 'Öffnen Sie die Citrix-Verwaltungskonsole und filtern Sie die Sitzungen nach dem Benutzernamen.',
              arabicNotes: 'صيغة الاستئذان (Darf ich...?) قبل الدخول إلى حساب المستخدم معيار أساسي في الدعم الفني الألماني ويحمي خصوصية المستخدم.'
            }
          },
          {
            speaker: 'Dr. Riedel',
            avatar: '👨‍⚕️',
            aiSpeech: 'Mein Kürzel ist j.riedel. Ich war gestern Abend noch kurz drin, habe aber einfach den Laptop zugeklappt, weil ich zum Dienst musste.',
            suggestedResponses: [
              'Vielen Dank. Ich sehe hier tatsächlich eine seit gestern getrennte Sitzung auf einem Terminalserver. Ich beende diese jetzt kontrolliert, damit eine saubere neue Sitzung aufgebaut werden kann.',
              'Das dürfen Sie so nicht machen, Sie müssen sich immer richtig abmelden. Ich beende das jetzt mal.',
              'Ich starte einfach den Server neu, dann sind alle Sitzungen weg und es funktioniert wieder.'
            ],
            bestResponseIdx: 0,
            feedback: {
              correction: {
                original: 'Ich starte einfach den Server neu, dann sind alle Sitzungen weg.',
                refined: 'Ich beende Ihre getrennte Sitzung kontrolliert, damit eine saubere neue Sitzung aufgebaut werden kann.',
                reasonAr: 'إعادة تشغيل الخادم إجراء يضرّ بكل المستخدمين الآخرين على نفس الخادم. الحل الصحيح إنهاء جلسة المستخدم المعنيّ فقط بشكل مضبوط (kontrolliert beenden).'
              },
              vocabTip: {
                term: 'der Terminalserver / die Sitzung kontrolliert beenden / das Abmelden erzwingen',
                ipa: '[ˈzɪtsʊŋ kɔntʁoˈliːɐ̯t bəˈʔɛndn̩]',
                ar: 'الخادم الطرفي / إنهاء الجلسة بشكل مضبوط / فرض تسجيل الخروج'
              },
              followUp: 'Weisen Sie freundlich darauf hin, dass ein bewusstes Abmelden künftig solche Sitzungsreste vermeidet.',
              arabicNotes: 'لاحظ الفرق: "Das dürfen Sie so nicht machen" نبرة توبيخية غير مناسبة لطبيب أول؛ الأفضل نصيحة لطيفة بعد حل المشكلة.'
            }
          },
          {
            speaker: 'Dr. Riedel',
            avatar: '👨‍⚕️',
            aiSpeech: 'Jetzt startet die Anwendung wieder. Allerdings ist die Darstellung sehr langsam, wenn ich die CT-Bilder durchscrolle. Liegt das auch an Citrix?',
            suggestedResponses: [
              'Für die Befundung großer Bildserien ist die normale Citrix-Sitzung nicht optimiert. Ich richte Ihnen den dedizierten Befundungs-Client mit erhöhter Grafikleistung ein und melde mich anschließend bei Ihnen.',
              'Ja, Citrix ist halt immer etwas langsam, damit müssen Sie leider leben.',
              'Das kann alles Mögliche sein. Schreiben Sie das bitte in ein neues Ticket, dann sehen wir weiter.'
            ],
            bestResponseIdx: 0,
            feedback: {
              correction: {
                original: 'Citrix ist halt immer etwas langsam, damit müssen Sie leider leben.',
                refined: 'Für große Bildserien richte ich Ihnen den dedizierten Befundungs-Client mit erhöhter Grafikleistung ein.',
                reasonAr: 'لا تُنهِ المكالمة بقبول العجز (damit müssen Sie leben). قدّم حلاً بديلاً ملموساً والتزم بالمتابعة، فهذا جوهر الخدمة الاحترافية.'
              },
              vocabTip: {
                term: 'die Bildserie / die Grafikleistung / der dedizierte Client',
                ipa: '[ˈɡʁaːfɪkˌlaɪ̯stʊŋ]',
                ar: 'سلسلة الصور الطبية / أداء الرسوميات / العميل المخصص'
              },
              followUp: 'Dokumentieren Sie die Performance-Anforderung und stimmen Sie die Umsetzung mit dem Client-Management ab.',
              arabicNotes: 'الالتزام بالمتابعة (ich melde mich anschließend bei Ihnen) عنصر أساسي في اتفاقيات مستوى الخدمة ويجب أن يُقال صراحةً.'
            }
          }
        ]
      },
      {
        id: 'it_patient_risk_de',
        title: 'Patientengefährdung: Medikamenten-Modul im OP ausgefallen (Prio 1)',
        level: 'C1',
        persona: {
          name: 'Herr Dr. Markus Lehmann (Leitender Anästhesist)',
          role: 'Melder einer akuten Störung im OP-Bereich',
          avatar: '🧑‍⚕️',
          tone: 'Sehr bestimmt, akuter Handlungsdruck'
        },
        context: 'Im OP-Trakt lässt sich das Modul zur Medikamentenverordnung nicht mehr aufrufen. Zwei Eingriffe laufen bereits, ein dritter ist angesetzt. Ohne das Modul sind Dosierungen und Allergien nicht einsehbar — es besteht unmittelbare Patientengefährdung. Der Anruf muss sofort als Prio-1-Störung eskaliert werden.',
        steps: [
          {
            speaker: 'Dr. Lehmann',
            avatar: '🧑‍⚕️',
            aiSpeech: 'Lehmann, Anästhesie, OP-Trakt West. Wir haben hier ein ernstes Problem: Das Medikamenten-Modul lädt nicht mehr. Ich sehe bei laufender Narkose weder Dosierungen noch Allergien. Das ist eine Patientengefährdung!',
            suggestedResponses: [
              'Herr Dr. Lehmann, ich stufe das hiermit als Prio-1-Störung mit Patientengefährdung ein und alarmiere sofort die Rufbereitschaft. Bleiben Sie bitte in der Leitung, während ich die Eskalation auslöse.',
              'Verstanden, das klingt dringend. Ich lege Ihnen ein Ticket mit hoher Priorität an, jemand meldet sich dann schnellstmöglich bei Ihnen.',
              'Guten Tag. Können Sie bitte zuerst prüfen, ob es nur an Ihrem Rechner liegt oder auch an den anderen Arbeitsplätzen?'
            ],
            bestResponseIdx: 0,
            feedback: {
              correction: {
                original: 'Ich lege Ihnen ein Ticket mit hoher Priorität an, jemand meldet sich schnellstmöglich.',
                refined: 'Ich stufe das als Prio-1-Störung mit Patientengefährdung ein und alarmiere sofort die Rufbereitschaft.',
                reasonAr: 'كلمة Patientengefährdung مصطلح تصنيفي مُلزِم: بمجرد ذكرها يجب تجاوز المسار العادي للتذاكر والانتقال فوراً إلى التصعيد وإنذار فريق الطوارئ. صياغة "jemand meldet sich" غامضة وغير مقبولة هنا.'
              },
              vocabTip: {
                term: 'die Patientengefährdung / die Prio-1-Störung / die Rufbereitschaft alarmieren',
                ipa: '[patsiˈɛntn̩ɡəˌfɛːɐ̯dʊŋ]',
                ar: 'تعريض المريض للخطر / عطل من الأولوية القصوى / إنذار فريق الاستدعاء'
              },
              followUp: 'Lösen Sie parallel zur Meldung die technische Eskalation aus und halten Sie die Leitung offen.',
              arabicNotes: 'في المستشفيات الألمانية، تصنيف Prio 1 يفرض زمن استجابة مُحدّداً في اتفاقية مستوى الخدمة، ويُلزم الدعم بإبلاغ فريق الاستدعاء دون انتظار موافقة إضافية.'
            }
          },
          {
            speaker: 'Dr. Lehmann',
            avatar: '🧑‍⚕️',
            aiSpeech: 'Gut. Was mache ich in der Zwischenzeit? Ich kann die Narkose nicht unterbrechen und brauche jetzt die Allergiedaten des Patienten.',
            suggestedResponses: [
              'Bitte wechseln Sie auf den Notfallarbeitsplatz im OP-Leitstand: Dort steht der lesende Notfallzugriff auf die Medikations- und Allergiedaten zur Verfügung. Ich bleibe in der Leitung, bis Sie die Daten vor sich haben.',
              'Fragen Sie bitte auf der Station nach, ob dort jemand die Daten vorlesen kann.',
              'Warten Sie bitte kurz, die Kollegen aus der Fachabteilung melden sich sicher gleich bei Ihnen.'
            ],
            bestResponseIdx: 0,
            feedback: {
              correction: {
                original: 'Warten Sie kurz, die Kollegen melden sich sicher gleich.',
                refined: 'Bitte wechseln Sie auf den Notfallarbeitsplatz: Dort steht der lesende Notfallzugriff auf die Allergiedaten zur Verfügung.',
                reasonAr: 'أثناء خطر فعلي على المريض، الانتظار ليس حلاً. قدّم مساراً بديلاً فورياً وقابلاً للتنفيذ (Notfallarbeitsplatz)، وابقَ على الخط حتى يتأكد الطبيب من حصوله على البيانات.'
              },
              vocabTip: {
                term: 'der Notfallzugriff / der OP-Leitstand / die Medikationsdaten',
                ipa: '[ˈnoːtfalˌt͡suːɡʁɪf]',
                ar: 'وصول الطوارئ / غرفة التحكم بالعمليات / بيانات الأدوية'
              },
              followUp: 'Begleiten Sie den Anwender Schritt für Schritt, bis der Notfallzugriff nachweislich funktioniert.',
              arabicNotes: 'البقاء على الخط (Ich bleibe in der Leitung) ليس مجاملة بل إجراء سلامة: يضمن عدم انقطاع المسار البديل قبل التأكد من نجاحه.'
            }
          },
          {
            speaker: 'Dr. Lehmann',
            avatar: '🧑‍⚕️',
            aiSpeech: 'Der Notfallzugriff funktioniert, ich habe die Allergien. Ich gehe davon aus, dass das nachher sauber aufgearbeitet wird — so etwas darf im OP nicht passieren.',
            suggestedResponses: [
              'Selbstverständlich. Der Vorfall wird als Prio-1-Störung mit Patientengefährdung vollständig dokumentiert und geht in die Nachbereitung mit Ursachenanalyse. Sie erhalten eine schriftliche Rückmeldung zum Ergebnis.',
              'Ja, ich schreibe das ins Ticket, dann ist es erledigt.',
              'Da müssten Sie sich bitte an die Klinikleitung wenden, dafür sind wir nicht zuständig.'
            ],
            bestResponseIdx: 0,
            feedback: {
              correction: {
                original: 'Ja, ich schreibe das ins Ticket, dann ist es erledigt.',
                refined: 'Der Vorfall wird vollständig dokumentiert und geht in die Nachbereitung mit Ursachenanalyse; Sie erhalten eine schriftliche Rückmeldung.',
                reasonAr: 'حادثة تعريض مريض للخطر لا تُغلق بتدوين ملاحظة. الصياغة المهنية تذكر ثلاثة عناصر: التوثيق الكامل، وتحليل السبب الجذري، والتغذية الراجعة المكتوبة للمُبلِّغ.'
              },
              vocabTip: {
                term: 'die Nachbereitung / die Ursachenanalyse / die Dokumentationspflicht',
                ipa: '[ˈuːɐ̯zaxn̩ʔanaˌlyːzə]',
                ar: 'المعالجة اللاحقة / تحليل السبب الجذري / واجب التوثيق'
              },
              followUp: 'Erstellen Sie den Störungsbericht und melden Sie den Vorfall an das klinische Risikomanagement (CIRS).',
              arabicNotes: 'نظام CIRS لإدارة المخاطر السريرية إلزامي في المستشفيات الألمانية؛ ذكرُه صراحةً يُظهر إلماماً بالإطار التنظيمي ويطمئن الطبيب المُبلِّغ.'
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
          },
          {
            speaker: 'Frau Dr. Weber',
            avatar: '👩‍🔬',
            aiSpeech: 'Gut, dass Sie gesperrt haben. Welche Ursachen haben Sie bereits eingegrenzt, bevor wir über eine Freigabe sprechen?',
            suggestedResponses: [
              'Ich habe Charge, Verfallsdatum und Lagerung des Kontrollmaterials geprüft und die Messung mit einer frisch angesetzten Kontrolle wiederholt — die Abweichung bleibt bestehen. Die Reagenziencharge wurde gestern gewechselt, deshalb vermute ich dort die Ursache und nicht im Kontrollmaterial.',
              'Ich habe es einfach nochmal gemessen, beim zweiten Mal war der Wert besser. Wahrscheinlich war es ein Ausreißer.',
              'Ich wollte zuerst neu kalibrieren, dann hätte sich das vermutlich von selbst erledigt.'
            ],
            bestResponseIdx: 0,
            feedback: {
              correction: {
                original: 'Beim zweiten Mal war der Wert besser, wahrscheinlich war es ein Ausreißer.',
                refined: 'Kontrollmaterial geprüft und mit frischer Kontrolle wiederholt — die Abweichung bleibt. Die Reagenziencharge wurde gestern gewechselt.',
                reasonAr: 'إعادة القياس حتى تظهر نتيجة مقبولة ("testing into compliance") مخالفة جسيمة لضبط الجودة. المطلوب تضييق السبب بشكل منهجي: مادة الضبط، ثم الكاشف، ثم المعايرة — وذكر التغيير الذي سبق الانحراف.'
              },
              vocabTip: {
                term: 'das Kontrollmaterial / die Abweichung eingrenzen / die Reagenziencharge',
                ipa: '[kɔnˈtʁɔlmateˌʁi̯aːl]',
                ar: 'مادة الضبط / تضييق نطاق الانحراف / دفعة الكاشف'
              },
              followUp: 'Dokumentieren Sie jede geprüfte Ursache mit Ergebnis, auch die ausgeschlossenen.',
              arabicNotes: 'توثيق الأسباب المستبعدة لا يقل أهمية عن السبب المؤكد، لأنه يثبت للمدقق أن التحليل كان منهجياً وليس تخميناً.'
            }
          },
          {
            speaker: 'Frau Dr. Weber',
            avatar: '👩‍🔬',
            aiSpeech: 'Einverstanden, das klingt schlüssig. Wir setzen die Vorcharge wieder ein. Und was ist mit den Patientenproben, die seit der letzten gültigen Kontrolle gelaufen sind?',
            suggestedResponses: [
              'Die müssen retrospektiv bewertet werden. Ich ermittle alle Glukose-Ergebnisse seit der letzten gültigen Qualitätskontrolle, halte sie zurück und messe sie nach erfolgreicher Kontrolle erneut. Bereits übermittelte Befunde melden wir der Station aktiv als korrigierte Befunde.',
              'Die sind zum Glück schon rausgegangen, da können wir jetzt ohnehin nichts mehr machen.',
              'Ich würde sagen, wir lassen die durch — die Abweichung war ja nur bei der Kontrolle, nicht bei den Patienten.'
            ],
            bestResponseIdx: 0,
            feedback: {
              correction: {
                original: 'Wir lassen die durch, die Abweichung war ja nur bei der Kontrolle.',
                refined: 'Alle Ergebnisse seit der letzten gültigen Kontrolle werden zurückgehalten, erneut gemessen und bereits übermittelte Befunde aktiv korrigiert.',
                reasonAr: 'هذه هي النتيجة الجوهرية لخرق قاعدة ويستغارد: كل نتائج المرضى منذ آخر ضبط جودة صالح تقع في نطاق مشكوك فيه. عبارة "الانحراف كان في الضبط فقط" خطأ مفاهيمي خطير.'
              },
              vocabTip: {
                term: 'retrospektiv bewerten / Befunde zurückhalten / der korrigierte Befund',
                ipa: '[ʁetʁospɛkˈtiːf bəˈveːɐ̯tn̩]',
                ar: 'التقييم بأثر رجعي / حجز النتائج / التقرير المصحَّح'
              },
              followUp: 'Legen Sie den Zeitraum seit der letzten gültigen Kontrolle fest und stimmen Sie die Nachmeldung mit der Laborleitung ab.',
              arabicNotes: 'مصطلح "korrigierter Befund" مُلزِم قانونياً: إرسال تصحيح فعّال للقسم الطالب واجب، ولا يكفي تعديل النتيجة بصمت في النظام.'
            }
          }
        ]
      },
      {
        id: 'lab_centrifuge_de',
        title: 'Zentrifuge: Unwucht & falsches Protokoll (Präanalytik)',
        level: 'B2',
        persona: {
          name: 'Frau Melanie Hoffmann (Auszubildende MTLA, 2. Lehrjahr)',
          role: 'Auszubildende in der Probenannahme',
          avatar: '👩‍🔬',
          tone: 'Unsicher, sichtlich erschrocken'
        },
        context: 'Eine Auszubildende hat die Tischzentrifuge einseitig beladen. Das Gerät hat während des Laufs stark vibriert und sich mit Fehlermeldung abgeschaltet. Zusätzlich wurden Citrat-Röhrchen für die Gerinnungsdiagnostik mit dem Standardprogramm für Serum zentrifugiert. Sie müssen die Auszubildende fachlich anleiten, ohne sie bloßzustellen.',
        steps: [
          {
            speaker: 'Frau Hoffmann',
            avatar: '👩‍🔬',
            aiSpeech: 'Entschuldigung, die Zentrifuge hat ganz laut gerattert und sich dann einfach ausgeschaltet. Ich wollte gerade den Deckel aufmachen und nachsehen. Habe ich etwas kaputt gemacht?',
            suggestedResponses: [
              'Bitte öffnen Sie den Deckel noch nicht — erst wenn der Rotor vollständig steht. Das Rattern deutet auf eine Unwucht hin. Wir schauen gemeinsam nach, wie die Röhrchen eingesetzt wurden.',
              'Das ist nicht so schlimm, machen Sie ruhig auf und stellen Sie die Röhrchen einfach neu rein.',
              'Sie hätten wirklich aufpassen müssen. Solche Fehler dürfen in einem Labor nicht passieren.'
            ],
            bestResponseIdx: 0,
            feedback: {
              correction: {
                original: 'Das ist nicht so schlimm, machen Sie ruhig auf.',
                refined: 'Bitte öffnen Sie den Deckel erst, wenn der Rotor vollständig steht. Das Rattern deutet auf eine Unwucht hin.',
                reasonAr: 'السلامة أولاً: فتح غطاء الطاردة قبل توقف الدوار تماماً خطر إصابة حقيقي. ابدأ بالتعليمة الوقائية الفورية بصيغة مهذبة (Bitte öffnen Sie... noch nicht) ثم اشرح السبب التقني.'
              },
              vocabTip: {
                term: 'die Unwucht / der Rotor / symmetrisch beladen',
                ipa: '[diː ˈʊnvʊxt]',
                ar: 'اختلال التوازن / الدوار / التحميل المتماثل'
              },
              followUp: 'Erklären Sie das Prinzip: gleich schwere Röhrchen immer paarweise gegenüberliegend einsetzen, notfalls mit einem Ausgleichsröhrchen.',
              arabicNotes: 'في الألمانية المهنية، توجيه المتدرب يبدأ بالفعل الوقائي ثم التعليل، مع استخدام صيغة "wir" (wir schauen gemeinsam nach) لتقليل الإحراج والحفاظ على الثقة.'
            }
          },
          {
            speaker: 'Frau Hoffmann',
            avatar: '👩‍🔬',
            aiSpeech: 'Der Rotor steht jetzt. Ich hatte vier Röhrchen nur auf einer Seite eingesetzt. Und ich habe die blauen Citrat-Röhrchen mit dem normalen Serum-Programm laufen lassen — ist das ein Problem?',
            suggestedResponses: [
              'Ja, das ist leider relevant. Gerinnungsproben brauchen ein eigenes Protokoll, in der Regel 1500 g für 10 Minuten. Mit dem Serum-Programm ist das plättchenarme Plasma nicht sicher gewährleistet, deshalb müssen wir eine Neuabnahme veranlassen.',
              'Nein, das macht nichts, Hauptsache die Röhrchen waren überhaupt in der Zentrifuge.',
              'Lassen Sie die Proben einfach nochmal mit dem richtigen Programm laufen, dann passt das schon.'
            ],
            bestResponseIdx: 0,
            feedback: {
              correction: {
                original: 'Lassen Sie die Proben einfach nochmal mit dem richtigen Programm laufen.',
                refined: 'Mit dem Serum-Programm ist das plättchenarme Plasma nicht sicher gewährleistet; wir müssen eine Neuabnahme veranlassen.',
                reasonAr: 'إعادة الطرد المركزي لا تُصلح عينة تخثر عولجت ببروتوكول خاطئ، لأن تفعيل الصفائح يكون قد حدث بالفعل. المصطلح الحاسم هو "Neuabnahme" أي سحب عينة جديدة.'
              },
              vocabTip: {
                term: 'das plättchenarme Plasma / die Neuabnahme / die Relativzentrifugalbeschleunigung (RZB)',
                ipa: '[ˈplɛtçn̩ˌʔaːʁmə ˈplasma]',
                ar: 'البلازما فقيرة الصفائح / إعادة سحب العينة / تسارع الطرد المركزي النسبي'
              },
              followUp: 'Informieren Sie die entnehmende Station über die notwendige Neuabnahme und begründen Sie sie präanalytisch.',
              arabicNotes: 'في الألمانية المخبرية تُذكر سرعة الطرد بوحدة g (RZB) وليس بعدد اللفات فقط، لأن قطر الدوار يختلف بين الأجهزة.'
            }
          },
          {
            speaker: 'Frau Hoffmann',
            avatar: '👩‍🔬',
            aiSpeech: 'Das ist mir sehr unangenehm. Muss ich das irgendwo melden, oder bleibt das unter uns?',
            suggestedResponses: [
              'Das gehört dokumentiert, und das ist völlig normal: Wir erfassen den Vorfall im Gerätebuch, lassen den Rotor vor der nächsten Nutzung prüfen und halten die Neuabnahme in der Präanalytik-Dokumentation fest. Fehler zu melden ist Teil der Qualitätssicherung, nicht ein Vorwurf.',
              'Nein, das bleibt unter uns, sonst gibt es nur unnötigen Ärger mit der Laborleitung.',
              'Melden müssen Sie das selbst, ich bin dafür nicht zuständig.'
            ],
            bestResponseIdx: 0,
            feedback: {
              correction: {
                original: 'Das bleibt unter uns, sonst gibt es nur Ärger.',
                refined: 'Wir erfassen den Vorfall im Gerätebuch und halten die Neuabnahme in der Präanalytik-Dokumentation fest.',
                reasonAr: 'إخفاء الحادثة مخالفة لنظام الجودة. الصياغة المهنية تطمئن المتدرب بأن التوثيق إجراء روتيني وليس عقوبة (Teil der Qualitätssicherung, nicht ein Vorwurf).'
              },
              vocabTip: {
                term: 'das Gerätebuch / die Qualitätssicherung / die Präanalytik',
                ipa: '[ɡəˈʁɛːtəˌbuːx]',
                ar: 'سجل الجهاز / ضمان الجودة / مرحلة ما قبل التحليل'
              },
              followUp: 'Tragen Sie den Vorfall im Gerätebuch ein und melden Sie die Rotorprüfung an die Gerätebetreuung.',
              arabicNotes: 'ثقافة الإبلاغ عن الأخطاء (Fehlerkultur) ركن أساسي في معايير ISO 15189؛ التعبير عنها بوضوح يطمئن الزميل الأقل خبرة.'
            }
          }
        ]
      },
      {
        id: 'lab_hygiene_de',
        title: 'Hygiene: PSA-Verstoß & Probenverschüttung (Schutzstufe 2)',
        level: 'B2',
        persona: {
          name: 'Herr Tobias Frank (Praktikant aus der Verwaltung)',
          role: 'Fachfremder Besucher im Laborbereich',
          avatar: '🧑‍💼',
          tone: 'Freundlich, aber ahnungslos'
        },
        context: 'Ein Praktikant aus der Verwaltung betritt ohne Kittel und Handschuhe den Laborbereich der Schutzstufe 2, um eine Unterschrift einzuholen. Dabei stößt er ein Röhrchen mit potenziell infektiösem Material um. Sie müssen ihn freundlich, aber konsequent aus dem Bereich führen und die Flächendesinfektion korrekt durchführen.',
        steps: [
          {
            speaker: 'Herr Frank',
            avatar: '🧑‍💼',
            aiSpeech: 'Hallo! Entschuldigen Sie die Störung — ich bräuchte nur kurz eine Unterschrift von Ihnen für die Materialbestellung. Ist das schnell möglich?',
            suggestedResponses: [
              'Guten Tag, Herr Frank. Ich unterschreibe Ihnen das gerne, aber bitte treten Sie kurz zurück in den Flur: Dieser Bereich ist Schutzstufe 2 und darf nur mit persönlicher Schutzausrüstung betreten werden. Ich komme sofort zu Ihnen heraus.',
              'Klar, kommen Sie einfach rein, das dauert ja nur eine Sekunde.',
              'Sie dürfen hier nicht rein! Haben Sie das Schild an der Tür nicht gelesen?'
            ],
            bestResponseIdx: 0,
            feedback: {
              correction: {
                original: 'Sie dürfen hier nicht rein! Haben Sie das Schild nicht gelesen?',
                refined: 'Bitte treten Sie kurz zurück in den Flur: Dieser Bereich ist Schutzstufe 2 und erfordert persönliche Schutzausrüstung. Ich komme sofort heraus.',
                reasonAr: 'الحزم لا يعني الفظاظة. اجمع بين ثلاثة عناصر: طلب مهذب بالخروج، سبب موضوعي (Schutzstufe 2)، وحلّ بديل فوري (Ich komme zu Ihnen heraus) حتى لا يشعر الزائر بالرفض.'
              },
              vocabTip: {
                term: 'die persönliche Schutzausrüstung (PSA) / die Schutzstufe 2 / der Zutritt',
                ipa: '[pɛɐ̯ˈzøːnlɪçə ˈʃʊt͡sʔaʊ̯sˌʁʏstʊŋ]',
                ar: 'معدات الوقاية الشخصية / مستوى الأمان الحيوي 2 / الدخول'
              },
              followUp: 'Bieten Sie an, die Unterschrift außerhalb des Laborbereichs zu leisten, und weisen Sie freundlich auf die Zutrittsregelung hin.',
              arabicNotes: 'صيغة "Bitte treten Sie kurz zurück" أمر مهذب باستخدام Bitte + Sie، وهي الصيغة المعيارية لفرض قاعدة سلامة دون إهانة المخاطب.'
            }
          },
          {
            speaker: 'Herr Frank',
            avatar: '🧑‍💼',
            aiSpeech: 'Oh nein, entschuldigen Sie! Ich bin gerade gegen das Gestell gekommen, da ist ein Röhrchen umgefallen und ausgelaufen. Soll ich das schnell mit einem Papiertuch aufwischen?',
            suggestedResponses: [
              'Bitte fassen Sie nichts an und verlassen Sie den Bereich. Ich übernehme das mit Schutzausrüstung: Die Fläche wird zuerst mit saugfähigem Material abgedeckt, dann mit Flächendesinfektionsmittel getränkt und die Einwirkzeit abgewartet.',
              'Ja, nehmen Sie ruhig ein Papiertuch, aber waschen Sie sich danach gründlich die Hände.',
              'Lassen Sie es einfach liegen, das trocknet von selbst und wir machen das später.'
            ],
            bestResponseIdx: 0,
            feedback: {
              correction: {
                original: 'Nehmen Sie ruhig ein Papiertuch und waschen Sie sich danach die Hände.',
                refined: 'Bitte fassen Sie nichts an. Ich übernehme das mit Schutzausrüstung: abdecken, mit Flächendesinfektionsmittel tränken, Einwirkzeit abwarten.',
                reasonAr: 'مسح المادة المعدية بمنديل ينشرها ويعرّض الشخص للخطر. البروتوكول الصحيح ثلاث خطوات مرتبة: التغطية، ثم التشريب بالمطهر، ثم انتظار زمن التأثير (Einwirkzeit).'
              },
              vocabTip: {
                term: 'das Flächendesinfektionsmittel / die Einwirkzeit / saugfähiges Material',
                ipa: '[ˈaɪ̯nvɪʁkˌt͡saɪ̯t]',
                ar: 'مطهر الأسطح / زمن التأثير / مادة ماصة'
              },
              followUp: 'Entsorgen Sie das kontaminierte Material im infektiösen Abfall und dokumentieren Sie den Vorfall.',
              arabicNotes: 'مصطلح Einwirkzeit جوهري: المطهر لا يعمل فوراً، بل يحتاج زمناً محدداً من الشركة المصنّعة، وتجاهله خطأ شائع.'
            }
          },
          {
            speaker: 'Herr Frank',
            avatar: '🧑‍💼',
            aiSpeech: 'Ich habe das Gestell vorhin kurz angefasst. Reicht es, wenn ich mir gleich die Hände wasche?',
            suggestedResponses: [
              'In diesem Fall ist eine hygienische Händedesinfektion erforderlich, nicht nur Waschen: Nehmen Sie das Desinfektionsmittel aus dem Spender am Ausgang, verreiben Sie es vollständig und beachten Sie die Einwirkzeit von dreißig Sekunden.',
              'Ja, Händewaschen mit Seife reicht in so einem Fall völlig aus.',
              'Machen Sie sich keine Sorgen, das war bestimmt nichts Ansteckendes.'
            ],
            bestResponseIdx: 0,
            feedback: {
              correction: {
                original: 'Händewaschen mit Seife reicht völlig aus.',
                refined: 'Hier ist eine hygienische Händedesinfektion erforderlich: vollständig verreiben und die Einwirkzeit von dreißig Sekunden beachten.',
                reasonAr: 'فرق جوهري: Händewaschen (غسل) يزيل الأوساخ، أما Händedesinfektion (تطهير) فيقتل الممرضات. بعد تماس محتمل مع مادة معدية، التطهير هو الإجراء الصحيح.'
              },
              vocabTip: {
                term: 'die hygienische Händedesinfektion / der Spender / verreiben',
                ipa: '[hyˈɡieːnɪʃə ˈhɛndədɛsʔɪnfɛkˌt͡si̯oːn]',
                ar: 'التطهير الصحي لليدين / الموزع / الفرك حتى الامتصاص'
              },
              followUp: 'Verweisen Sie auf die fünf Indikationen der Händehygiene und den Hygieneplan am Eingang.',
              arabicNotes: 'معيار منظمة الصحة العالمية "الخمس لحظات لنظافة اليدين" (die fünf Momente der Händehygiene) معتمد في خطط النظافة الألمانية.'
            }
          }
        ]
      },
      {
        id: 'lab_calibration_de',
        title: 'Kalibrierung: Fehlgeschlagene Kalibrierkurve nach Chargenwechsel',
        level: 'C1',
        persona: {
          name: 'Herr Stefan Bauer (Applikationsspezialist, Gerätehersteller)',
          role: 'Externer Servicetechniker am Telefon',
          avatar: '👨‍🔧',
          tone: 'Strukturiert, stellt gezielte Rückfragen'
        },
        context: 'Nach dem Wechsel auf eine neue Reagenzcharge schlägt die Kalibrierung des Parameters ALT am klinisch-chemischen Analysegerät wiederholt fehl (Fehlercode CAL-317). Der Parameter ist gesperrt, Patientenproben stauen sich. Sie rufen die Hotline des Herstellers an und müssen den Sachverhalt präzise und strukturiert schildern.',
        steps: [
          {
            speaker: 'Herr Bauer',
            avatar: '👨‍🔧',
            aiSpeech: 'Bauer, technischer Support. Sie haben ein Problem mit einer Kalibrierung gemeldet — schildern Sie mir bitte kurz, was genau passiert.',
            suggestedResponses: [
              'Guten Tag, Herr Bauer. Bei uns schlägt seit heute Morgen die Kalibrierung für den Parameter ALT fehl, Fehlercode CAL-317. Ausgelöst wurde es durch den Wechsel auf die neue Reagenzcharge; der Parameter ist derzeit gesperrt.',
              'Guten Tag. Unser Gerät macht Probleme mit der Kalibrierung, es geht einfach nicht durch. Können Sie da mal draufschauen?',
              'Hallo, wir haben hier einen Fehler und brauchen dringend jemanden vor Ort, sonst kommen wir nicht weiter.'
            ],
            bestResponseIdx: 0,
            feedback: {
              correction: {
                original: 'Unser Gerät macht Probleme mit der Kalibrierung, es geht einfach nicht durch.',
                refined: 'Die Kalibrierung für den Parameter ALT schlägt fehl, Fehlercode CAL-317, ausgelöst durch den Wechsel auf die neue Reagenzcharge.',
                reasonAr: 'عند الاتصال بالدعم الفني للشركة المصنّعة، اذكر أربعة عناصر في جملة واحدة: المَعلَم المتأثر، رمز الخطأ، الحدث المُطلِق، والحالة الراهنة. الوصف الغامض يطيل المكالمة ويؤخر الحل.'
              },
              vocabTip: {
                term: 'die Kalibrierung schlägt fehl / die Reagenzcharge / der Parameter ist gesperrt',
                ipa: '[kaliˈbʁiːʁʊŋ ʃlɛːkt feːl]',
                ar: 'فشل المعايرة / دفعة الكاشف / المَعلَم موقوف'
              },
              followUp: 'Halten Sie Gerätetyp, Seriennummer und die Chargennummer des Reagenzes für die Rückfragen bereit.',
              arabicNotes: 'في المكالمات التقنية الألمانية يُتوقع منك تقديم المعلومات بترتيب منطقي دون أن تُسأل، فهذا مؤشر على الكفاءة المهنية.'
            }
          },
          {
            speaker: 'Herr Bauer',
            avatar: '👨‍🔧',
            aiSpeech: 'Verstanden. Was haben Sie bereits geprüft? Und wie verhält sich die Kalibrierkurve — sehen Sie eine Drift oder liegt der Blank-Wert außerhalb?',
            suggestedResponses: [
              'Wir haben Verfallsdatum und Lagerung der Kalibratoren kontrolliert, die Chargendaten neu eingelesen und die Kalibrierung zweimal wiederholt. Der Blank-Wert liegt deutlich über der Toleranzgrenze, die Kurve zeigt zusätzlich eine Drift im oberen Messbereich.',
              'Wir haben es ein paar Mal probiert, aber es ging nicht. Genauer habe ich nicht nachgesehen.',
              'Ich glaube, die Kalibratoren sind noch in Ordnung, aber sicher bin ich mir nicht.'
            ],
            bestResponseIdx: 0,
            feedback: {
              correction: {
                original: 'Wir haben es ein paar Mal probiert, aber es ging nicht.',
                refined: 'Verfallsdatum und Lagerung geprüft, Chargendaten neu eingelesen, zweimal wiederholt; der Blank-Wert liegt über der Toleranzgrenze.',
                reasonAr: 'عدّد ما فحصته بالفعل بصيغة قائمة موجزة. هذا يمنع الفني من تكرار أسئلة بديهية ويُظهر أنك أجريت التشخيص الأولي بشكل منهجي.'
              },
              vocabTip: {
                term: 'die Kalibrierkurve / der Blank-Wert / die Toleranzgrenze / die Drift',
                ipa: '[kaliˈbʁiːɐ̯ˌkʊʁvə]',
                ar: 'منحنى المعايرة / قيمة الفراغ / حد التسامح / الانحراف التدريجي'
              },
              followUp: 'Bieten Sie an, das Kalibrierprotokoll und die Kurve als Ausdruck oder Export zu übermitteln.',
              arabicNotes: 'المصطلح Drift يصف انزياحاً تدريجياً في القياس مع الزمن، ويُميَّز عن الخطأ العشوائي المفاجئ؛ التفريق بينهما مهم في التشخيص.'
            }
          },
          {
            speaker: 'Herr Bauer',
            avatar: '👨‍🔧',
            aiSpeech: 'Das klingt nach einem Problem mit der Reagenzcharge selbst. Ich würde mich per Fernzugriff aufschalten und parallel eine Ersatzcharge veranlassen. Passt Ihnen das?',
            suggestedResponses: [
              'Sehr gerne. Ich benötige dafür bitte eine Ticketnummer und ein verbindliches Zeitfenster. Zur Einordnung: Der Parameter ist seit heute Morgen gesperrt, und wir müssen ab Mittag auf Fremdvergabe ausweichen.',
              'Ja, machen Sie einfach, wir warten dann so lange.',
              'Können Sie das nicht sofort machen? Wir haben hier wirklich keine Zeit für so etwas.'
            ],
            bestResponseIdx: 0,
            feedback: {
              correction: {
                original: 'Ja, machen Sie einfach, wir warten dann so lange.',
                refined: 'Ich benötige eine Ticketnummer und ein verbindliches Zeitfenster. Der Parameter ist gesperrt, ab Mittag müssen wir auf Fremdvergabe ausweichen.',
                reasonAr: 'اختم المكالمة بثلاثة عناصر: رقم التذكرة للتتبّع، نافذة زمنية مُلزِمة، وبيان الأثر التشغيلي. ذكر التحويل الخارجي (Fremdvergabe) يوضّح إلحاح الحالة دون رفع الصوت.'
              },
              vocabTip: {
                term: 'der Fernzugriff / das Zeitfenster / die Fremdvergabe',
                ipa: '[ˈfɛʁnt͡suːɡʁɪf]',
                ar: 'الوصول عن بُعد / النافذة الزمنية / التحويل إلى مختبر خارجي'
              },
              followUp: 'Dokumentieren Sie Ticketnummer, Gesprächspartner und Uhrzeit im Gerätebuch.',
              arabicNotes: 'طلب Ticketnummer وZeitfenster صراحةً ممارسة معيارية في التعامل مع موردي الأجهزة، وتحمي المختبر عند التدقيق.'
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
          },
          {
            speaker: 'Mr. Miller',
            avatar: '👨‍💻',
            aiSpeech: 'The remote session is up, you should be seeing my screen. I do not know much about networking though — could you tell me what you are actually looking at?',
            suggestedResponses: [
              'Of course. I am looking at the routing table, which is the list of what traffic goes through the VPN tunnel. And there it is: your internal company network is not currently being routed through the tunnel. That is why public websites work while the internal servers time out.',
              'I am checking the routing table for faulty entries in the split-tunnelling profile and verifying the interface metrics.',
              'It is fairly technical, it would take too long to explain. Let me just get on with it.'
            ],
            bestResponseIdx: 0,
            feedback: {
              correction: {
                original: 'I am verifying the interface metrics in the split-tunnelling profile.',
                refined: 'I am looking at what traffic goes through the VPN tunnel — your internal company network is not going through it right now.',
                reasonAr: 'المستخدم صرّح بأنه لا يفهم الشبكات. إغراقه بالمصطلحات ليس دليل كفاءة بل فشل في التواصل. اشرح بلغة بسيطة، واربط الشرح بالعَرَض الذي وصفه بنفسه.'
              },
              vocabTip: {
                term: 'routing table / VPN tunnel / internal company network',
                ipa: '[ˈruːtɪŋ ˈteɪbl̩]',
                ar: 'جدول التوجيه / نفق الشبكة الافتراضية / الشبكة الداخلية للشركة'
              },
              followUp: 'State the finding in one sentence and announce the next step before changing anything.',
              arabicNotes: 'قاعدة ذهبية في الدعم الفني: اشرح ما ستفعله قبل أن تفعله على جهاز المستخدم، فهذا يبني الثقة ويمنع القلق.'
            }
          },
          {
            speaker: 'Mr. Miller',
            avatar: '👨‍💻',
            aiSpeech: 'That makes sense now. The shared drive is back, thank you. By the way, a colleague on my team had exactly the same problem first thing this morning.',
            suggestedResponses: [
              'Thank you for mentioning that, it matters. It suggests this is not an isolated case but a faulty VPN profile from yesterday’s update. I will raise a problem record, notify the network team, and we will push the corrected profile centrally.',
              'Good to know. Please ask your colleague to contact the Service Desk as well and we will look at hers separately.',
              'That could be a coincidence. I will close your ticket for now since everything is working on your side.'
            ],
            bestResponseIdx: 0,
            feedback: {
              correction: {
                original: 'That could be a coincidence, I will close your ticket for now.',
                refined: 'It suggests this is not an isolated case. I will raise a problem record and notify the network team.',
                reasonAr: 'بلاغان متطابقان في اليوم نفسه مؤشر على مشكلة جذرية وليس حادثتين منفصلتين. إغلاق التذكرة لأن هذا المستخدم تحديداً يعمل الآن يترك بقية الفريق يعاني.'
              },
              vocabTip: {
                term: 'isolated case / problem record / to push a profile centrally',
                ipa: '[ˈaɪsəleɪtɪd keɪs]',
                ar: 'حالة فردية / سجل المشكلة الجذرية / نشر الملف مركزياً'
              },
              followUp: 'Document the link between both reports and offer to contact the colleague proactively.',
              arabicNotes: 'في إطار ITIL يُفرَّق بين Incident (حادثة فردية) وProblem (سبب جذري يولّد حوادث متعددة)؛ استخدام المصطلح الصحيح أمام مستخدم تقني يدل على احترافية.'
            }
          }
        ]
      },
      {
        id: 'it_epic_chart_en',
        title: 'EPIC: Patient Chart Locked After Role Change (ICU)',
        level: 'B2',
        persona: {
          name: 'Ms. Anna Brandt (ICU Nurse)',
          role: 'Nurse mid shift-handover',
          avatar: '👩‍⚕️',
          tone: 'Tense, under time pressure'
        },
        context: 'An intensive care nurse can no longer open the chart of a ventilated patient in EPIC (Hyperspace). She receives "No access to this treatment unit". The shift handover is already under way and vital signs must be documented.',
        steps: [
          {
            speaker: 'Ms. Brandt',
            avatar: '👩‍⚕️',
            aiSpeech: 'Hello, ICU 2 here. I cannot get into my ventilated patient\'s chart in EPIC any more. All I get is "No access to this treatment unit". I need to document the handover right now!',
            suggestedResponses: [
              'Good morning, Ms. Brandt. I will take care of this straight away. Could you give me your EPIC login ID and the patient\'s encounter number so I can check your security profile?',
              'Hello, you will need to raise a ticket and someone will look at it within the next few hours.',
              'Good morning. Have you tried logging out and back in again? That usually fixes it.'
            ],
            bestResponseIdx: 0,
            feedback: {
              correction: {
                original: 'You will need to raise a ticket and someone will look at it.',
                refined: 'I will take care of this straight away. Could you give me your EPIC login ID and the encounter number so I can check your security profile?',
                reasonAr: 'في بيئة المستشفى، إحالة الممرضة إلى فتح تذكرة أثناء تسليم وردية العناية المركزة تأخير غير مقبول. أكّد التحرك الفوري ثم اطلب البيانات المحددة التي تمكّنك من الفحص.'
              },
              vocabTip: {
                term: 'security profile / treatment unit / encounter number',
                ipa: '[sɪˈkjʊərɪti ˈprəʊfaɪl]',
                ar: 'ملف الصلاحيات / وحدة العلاج (القسم) / رقم الحالة'
              },
              followUp: 'Check in EPIC administration whether the correct treatment unit context (ICU 2) is assigned to the user.',
              arabicNotes: 'نظام EPIC يربط الصلاحية بوحدة علاجية محددة، لذلك قد يكون الحساب سليماً لكن بدون ربط بالقسم الصحيح بعد نقل الوردية.'
            }
          },
          {
            speaker: 'Ms. Brandt',
            avatar: '👩‍⚕️',
            aiSpeech: 'My ID is a.brandt and the encounter number is 4471902. It worked fine yesterday. I was transferred from Ward 4 to ICU 2 this week.',
            suggestedResponses: [
              'Thank you, that explains it. Your profile is still mapped to Ward 4. I am adding ICU 2 as a treatment unit now. Please log out of Hyperspace completely and log back in.',
              'Right, HR must have forgotten to update that. Unfortunately there is nothing I can do, they have to change it.',
              'I will just give you full access to every ward, then the problem goes away for good.'
            ],
            bestResponseIdx: 0,
            feedback: {
              correction: {
                original: 'I will just give you full access to every ward.',
                refined: 'I am adding ICU 2 as an additional treatment unit on your profile.',
                reasonAr: 'منح صلاحية كاملة لحل سريع خرق لمبدأ الحد الأدنى من الصلاحيات ولحماية بيانات المرضى. امنح فقط الوحدة المطلوبة واشرح الخطوة التالية.'
              },
              vocabTip: {
                term: 'internal transfer / to update the profile / to log back in',
                ipa: '[ˈʌpdeɪt ðə ˈprəʊfaɪl]',
                ar: 'النقل بين الأقسام / تحديث الملف الشخصي / إعادة تسجيل الدخول'
              },
              followUp: 'Ask the user to confirm access, then document the profile change in the ticket.',
              arabicNotes: 'شرح السبب بإيجاز (that explains it) يبني ثقة المستخدم ويقلل تكرار البلاغ.'
            }
          },
          {
            speaker: 'Ms. Brandt',
            avatar: '👩‍⚕️',
            aiSpeech: 'One moment... yes, the chart is there now. But what do I do if EPIC goes down completely during the night shift? I would be left with no documentation again.',
            suggestedResponses: [
              'That is covered by our downtime procedure: the BCA workstation gives you read-only access to the most recent patient data, and documentation switches to the ward\'s paper forms in the meantime.',
              'That basically never happens, so I would not worry about it.',
              'Just call us again and we will see what we can do at that point.'
            ],
            bestResponseIdx: 0,
            feedback: {
              correction: {
                original: 'That basically never happens, so I would not worry about it.',
                refined: 'That is covered by our downtime procedure: read-only access via the BCA workstation, with paper forms as the fallback.',
                reasonAr: 'لا تُهوّن من قلق مشروع يتعلق بسلامة التوثيق. اذكر خطة الطوارئ المعتمدة وسمِّ البديل العملي بوضوح.'
              },
              vocabTip: {
                term: 'downtime procedure / fallback level / business continuity access (BCA)',
                ipa: '[ˈdaʊntaɪm prəˈsiːdʒə]',
                ar: 'إجراء التعطل / المستوى الاحتياطي / وصول استمرارية العمل'
              },
              followUp: 'Point the user to the downtime quick guide on the intranet and offer a briefing for the team.',
              arabicNotes: 'خطة التعطل إلزامية قانونياً في المستشفيات، ومعرفة الدعم الفني بها جزء أساسي من الكفاءة المهنية.'
            }
          }
        ]
      },
      {
        id: 'it_citrix_session_en',
        title: 'Citrix: Published Application Will Not Launch (Ghost Session)',
        level: 'B2',
        persona: {
          name: 'Dr. Jonas Riedel (Consultant Radiologist)',
          role: 'Home-office reporting user',
          avatar: '👨‍⚕️',
          tone: 'Matter-of-fact but impatient'
        },
        context: 'A consultant radiologist wants to reach the reporting system from home through Citrix Workspace. The published application hangs on launch; a disconnected session from the previous day is still active in the background (a ghost session).',
        steps: [
          {
            speaker: 'Dr. Riedel',
            avatar: '👨‍⚕️',
            aiSpeech: 'Riedel here, Radiology. I am working from home and I cannot get into the reporting system through Citrix. The window flashes up and then disappears. I still have twelve reports to sign off this afternoon.',
            suggestedResponses: [
              'Good afternoon, Dr. Riedel. That sounds like a session that was not disconnected cleanly. May I check your active Citrix sessions? I only need your login ID.',
              'Good afternoon. Have you tried restarting your machine completely? That usually clears it.',
              'Your home internet is probably too slow. Please check your Wi-Fi connection first.'
            ],
            bestResponseIdx: 0,
            feedback: {
              correction: {
                original: 'Your home internet is probably too slow.',
                refined: 'That sounds like a session that was not disconnected cleanly. May I check your active Citrix sessions?',
                reasonAr: 'تجنّب إلقاء اللوم على بيئة المستخدم قبل الفحص، فهو يبدو تهرباً من المسؤولية. اطرح فرضية تقنية محددة واطلب الإذن بالفحص بصيغة مهذبة.'
              },
              vocabTip: {
                term: 'published application / disconnected session / login ID',
                ipa: '[ˈpʌblɪʃt ˌæplɪˈkeɪʃn̩]',
                ar: 'التطبيق المنشور / الجلسة المفصولة / معرّف الدخول'
              },
              followUp: 'Open the Citrix management console and filter sessions by username.',
              arabicNotes: 'طلب الإذن (May I...?) قبل الدخول إلى حساب المستخدم معيار أساسي في الدعم الفني ويحمي الخصوصية.'
            }
          },
          {
            speaker: 'Dr. Riedel',
            avatar: '👨‍⚕️',
            aiSpeech: 'My ID is j.riedel. I was briefly logged in last night but I just closed the laptop lid because I was called in for a shift.',
            suggestedResponses: [
              'Thank you. I can see a session still disconnected on a terminal server since yesterday. I will log it off in a controlled way so a clean new session can be established.',
              'You really should not do that, you have to log off properly every time. I will kill it now.',
              'I will just reboot the server, that clears every session and it will work again.'
            ],
            bestResponseIdx: 0,
            feedback: {
              correction: {
                original: 'I will just reboot the server, that clears every session.',
                refined: 'I will log your disconnected session off in a controlled way so a clean new session can be established.',
                reasonAr: 'إعادة تشغيل الخادم تضرّ بكل المستخدمين الآخرين عليه. الحل الصحيح إنهاء جلسة المستخدم المعنيّ فقط بشكل مضبوط.'
              },
              vocabTip: {
                term: 'terminal server / to log off a session / to force a logoff',
                ipa: '[ˈtɜːmɪnl̩ ˈsɜːvə]',
                ar: 'الخادم الطرفي / إنهاء الجلسة / فرض تسجيل الخروج'
              },
              followUp: 'Mention politely that a deliberate log-off avoids leftover sessions in future.',
              arabicNotes: 'لاحظ الفرق: "You really should not do that" نبرة توبيخية غير مناسبة لطبيب استشاري؛ الأفضل نصيحة لطيفة بعد حل المشكلة.'
            }
          },
          {
            speaker: 'Dr. Riedel',
            avatar: '👨‍⚕️',
            aiSpeech: 'The application is starting now. Scrolling through the CT series is very sluggish, though. Is that Citrix as well?',
            suggestedResponses: [
              'A standard Citrix session is not optimised for large image series. I will set you up with the dedicated reporting client, which has higher graphics throughput, and come back to you once it is ready.',
              'Yes, Citrix is always a bit slow, I am afraid you will have to live with that.',
              'That could be anything. Please raise a separate ticket for it and we will take it from there.'
            ],
            bestResponseIdx: 0,
            feedback: {
              correction: {
                original: 'Citrix is always a bit slow, you will have to live with that.',
                refined: 'I will set you up with the dedicated reporting client, which has higher graphics throughput.',
                reasonAr: 'لا تُنهِ المكالمة بقبول العجز. قدّم حلاً بديلاً ملموساً والتزم بالمتابعة، فهذا جوهر الخدمة الاحترافية.'
              },
              vocabTip: {
                term: 'image series / graphics throughput / dedicated client',
                ipa: '[ˈɡræfɪks ˈθruːpʊt]',
                ar: 'سلسلة الصور الطبية / أداء الرسوميات / العميل المخصص'
              },
              followUp: 'Record the performance requirement and align the rollout with client management.',
              arabicNotes: 'الالتزام الصريح بالمتابعة (I will come back to you) عنصر أساسي في اتفاقيات مستوى الخدمة.'
            }
          }
        ]
      },
      {
        id: 'it_patient_risk_en',
        title: 'Patient Safety Incident: Medication Module Down in Theatre (P1)',
        level: 'C1',
        persona: {
          name: 'Dr. Mark Lehmann (Lead Anaesthetist)',
          role: 'Reporting an acute failure in the operating theatre',
          avatar: '🧑‍⚕️',
          tone: 'Very firm, acute urgency'
        },
        context: 'In the operating theatre complex the medication prescribing module can no longer be opened. Two procedures are already under way and a third is scheduled. Without the module, dosages and allergies are not visible — patients are at immediate risk. The call must be escalated as a P1 incident straight away.',
        steps: [
          {
            speaker: 'Dr. Lehmann',
            avatar: '🧑‍⚕️',
            aiSpeech: 'Lehmann, Anaesthetics, West Theatres. We have a serious problem: the medication module will not load. I am mid-anaesthesia and I can see neither dosages nor allergies. This is putting patients at risk!',
            suggestedResponses: [
              'Dr. Lehmann, I am classifying this as a P1 incident with patient safety impact and alerting the on-call team immediately. Please stay on the line while I trigger the escalation.',
              'Understood, that sounds urgent. I will raise a high-priority ticket and someone will get back to you as soon as possible.',
              'Good afternoon. Could you first check whether it is only your workstation or the other terminals as well?'
            ],
            bestResponseIdx: 0,
            feedback: {
              correction: {
                original: 'I will raise a high-priority ticket and someone will get back to you.',
                refined: 'I am classifying this as a P1 incident with patient safety impact and alerting the on-call team immediately.',
                reasonAr: 'عبارة "patient safety impact" مصطلح تصنيفي مُلزِم: بمجرد ذكرها يجب تجاوز المسار العادي للتذاكر والانتقال فوراً إلى التصعيد. صياغة "someone will get back to you" غامضة وغير مقبولة هنا.'
              },
              vocabTip: {
                term: 'patient safety impact / P1 incident / to alert the on-call team',
                ipa: '[ˈpeɪʃnt ˈseɪfti ˈɪmpækt]',
                ar: 'تعريض المريض للخطر / عطل من الأولوية القصوى / إنذار فريق الاستدعاء'
              },
              followUp: 'Trigger the technical escalation in parallel with the report and keep the line open.',
              arabicNotes: 'تصنيف P1 يفرض زمن استجابة مُحدّداً في اتفاقية مستوى الخدمة، ويُلزم الدعم بإبلاغ فريق الاستدعاء دون انتظار موافقة إضافية.'
            }
          },
          {
            speaker: 'Dr. Lehmann',
            avatar: '🧑‍⚕️',
            aiSpeech: 'Good. What do I do in the meantime? I cannot interrupt the anaesthesia and I need this patient\'s allergy data now.',
            suggestedResponses: [
              'Please switch to the emergency workstation in the theatre control room: it provides read-only emergency access to medication and allergy data. I will stay on the line until you have the data in front of you.',
              'Please ask on the ward whether someone there can read the data out to you.',
              'Please hold for a moment, the specialist team will almost certainly contact you shortly.'
            ],
            bestResponseIdx: 0,
            feedback: {
              correction: {
                original: 'Please hold, the specialist team will contact you shortly.',
                refined: 'Please switch to the emergency workstation: it provides read-only emergency access to the allergy data.',
                reasonAr: 'أثناء خطر فعلي على المريض، الانتظار ليس حلاً. قدّم مساراً بديلاً فورياً وقابلاً للتنفيذ، وابقَ على الخط حتى يتأكد الطبيب من حصوله على البيانات.'
              },
              vocabTip: {
                term: 'emergency access / theatre control room / medication data',
                ipa: '[ɪˈmɜːdʒənsi ˈækses]',
                ar: 'وصول الطوارئ / غرفة التحكم بالعمليات / بيانات الأدوية'
              },
              followUp: 'Walk the user through it step by step until emergency access is demonstrably working.',
              arabicNotes: 'البقاء على الخط ليس مجاملة بل إجراء سلامة: يضمن عدم انقطاع المسار البديل قبل التأكد من نجاحه.'
            }
          },
          {
            speaker: 'Dr. Lehmann',
            avatar: '🧑‍⚕️',
            aiSpeech: 'Emergency access is working, I have the allergies. I trust this will be properly reviewed afterwards — something like this must not happen in theatre.',
            suggestedResponses: [
              'Absolutely. The incident will be fully documented as a P1 with patient safety impact and will go through post-incident review with a root cause analysis. You will receive written feedback on the outcome.',
              'Yes, I will note it in the ticket and then it is closed.',
              'You would need to take that up with hospital management, it is outside our remit.'
            ],
            bestResponseIdx: 0,
            feedback: {
              correction: {
                original: 'I will note it in the ticket and then it is closed.',
                refined: 'The incident will be fully documented and go through post-incident review with a root cause analysis; you will receive written feedback.',
                reasonAr: 'حادثة تعريض مريض للخطر لا تُغلق بتدوين ملاحظة. الصياغة المهنية تذكر ثلاثة عناصر: التوثيق الكامل، وتحليل السبب الجذري، والتغذية الراجعة المكتوبة للمُبلِّغ.'
              },
              vocabTip: {
                term: 'post-incident review / root cause analysis / duty to document',
                ipa: '[ruːt kɔːz əˈnæləsɪs]',
                ar: 'المراجعة اللاحقة للحادثة / تحليل السبب الجذري / واجب التوثيق'
              },
              followUp: 'Write the incident report and notify clinical risk management (CIRS).',
              arabicNotes: 'نظام CIRS لإدارة المخاطر السريرية معتمد في المستشفيات؛ ذكرُه صراحةً يُظهر إلماماً بالإطار التنظيمي ويطمئن الطبيب المُبلِّغ.'
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
      },
      {
        id: 'lab_qc_outlier_en',
        title: 'Quality Control & Westgard Rule Violation (Outlier)',
        level: 'B2',
        persona: {
          name: 'Dr. Weber',
          role: 'Senior Biomedical Scientist / Laboratory Manager',
          avatar: '👩‍🔬',
          tone: 'Analytical, quality-focused'
        },
        context: 'During the morning internal quality control run on the main clinical chemistry analyser, the glucose control sample deviates by more than 3 standard deviations, violating Westgard rule 1-3s.',
        steps: [
          {
            speaker: 'Dr. Weber',
            avatar: '👩‍🔬',
            aiSpeech: 'Good morning. I can see from the control room that the glucose assay is blocked. What happened during the internal quality control?',
            suggestedResponses: [
              'Good morning, Dr. Weber. The glucose control measurement falls outside 3 standard deviations (+3.2s). I have locked the parameter to protect patient samples.',
              'Morning. The analyser is playing up again today, the value is too high. Shall I just run it once more?',
              'Good morning. We have not measured any patient samples yet, I was just about to run a fresh calibration.'
            ],
            bestResponseIdx: 0,
            feedback: {
              correction: {
                original: 'The analyser is playing up, shall I just run it once more?',
                refined: 'The control measurement falls outside 3 standard deviations. I have locked the parameter in line with the SOP.',
                reasonAr: 'تجنب التعبيرات العامية (the analyser is playing up). التقرير المهني لمديرة المختبر يتطلب ذكر المصطلحات الإحصائية الدقيقة (standard deviation) والإجراء الاحترازي المتبع.'
              },
              vocabTip: {
                term: 'standard deviation (SD) / Westgard rules / to lock the parameter',
                ipa: '[ˈstændəd ˌdiːviˈeɪʃn̩]',
                ar: 'الانحراف المعياري / قواعد ويستغارد لضبط الجودة / إيقاف المعامل'
              },
              followUp: 'Propose the root cause analysis: reagent lot, expiry date, or calibration drift.',
              arabicNotes: 'وفق معايير ISO 15189، فإن خرق قاعدة 1:3s يعني خطأً عشوائياً أو نظامياً جسيماً يفرض إيقاف إطلاق نتائج المرضى فوراً.'
            }
          },
          {
            speaker: 'Dr. Weber',
            avatar: '👩‍🔬',
            aiSpeech: 'Good that you locked it. Which causes have you already narrowed down before we talk about releasing anything?',
            suggestedResponses: [
              'I checked the lot, expiry date and storage of the control material and repeated the run with a freshly reconstituted control — the deviation persists. The reagent lot was changed yesterday, so I suspect the cause there rather than in the control material.',
              'I just measured it again and the second value was better. It was probably an outlier.',
              'I was going to recalibrate first, that would most likely have sorted it out by itself.'
            ],
            bestResponseIdx: 0,
            feedback: {
              correction: {
                original: 'The second value was better, it was probably an outlier.',
                refined: 'Control material checked and repeated with a fresh control — the deviation persists. The reagent lot was changed yesterday.',
                reasonAr: 'إعادة القياس حتى تظهر نتيجة مقبولة ("testing into compliance") مخالفة جسيمة لضبط الجودة. المطلوب تضييق السبب بشكل منهجي: مادة الضبط، ثم الكاشف، ثم المعايرة — وذكر التغيير الذي سبق الانحراف.'
              },
              vocabTip: {
                term: 'control material / to narrow down the deviation / reagent lot',
                ipa: '[kənˈtrəʊl məˈtɪəriəl]',
                ar: 'مادة الضبط / تضييق نطاق الانحراف / دفعة الكاشف'
              },
              followUp: 'Document every cause you checked together with its result, including the ones you ruled out.',
              arabicNotes: 'توثيق الأسباب المستبعدة لا يقل أهمية عن السبب المؤكد، لأنه يثبت للمدقق أن التحليل كان منهجياً وليس تخميناً.'
            }
          },
          {
            speaker: 'Dr. Weber',
            avatar: '👩‍🔬',
            aiSpeech: 'Agreed, that is a sound conclusion. We will revert to the previous lot. And what about the patient samples that have run since the last valid control?',
            suggestedResponses: [
              'Those have to be assessed retrospectively. I will identify every glucose result since the last valid quality control, hold them back, and re-measure them once the control passes. For any reports already transmitted, we will actively issue corrected reports to the ward.',
              'Fortunately those have already gone out, so there is nothing we can do about them now.',
              'I would say we let those through — the deviation was only in the control, not in the patient samples.'
            ],
            bestResponseIdx: 0,
            feedback: {
              correction: {
                original: 'We let those through, the deviation was only in the control.',
                refined: 'Every result since the last valid control is held back, re-measured, and any report already transmitted is actively corrected.',
                reasonAr: 'هذه هي النتيجة الجوهرية لخرق قاعدة ويستغارد: كل نتائج المرضى منذ آخر ضبط جودة صالح تقع في نطاق مشكوك فيه. عبارة "الانحراف كان في الضبط فقط" خطأ مفاهيمي خطير.'
              },
              vocabTip: {
                term: 'to assess retrospectively / to hold back reports / corrected report',
                ipa: '[əˈses ˌretrəʊˈspektɪvli]',
                ar: 'التقييم بأثر رجعي / حجز النتائج / التقرير المصحَّح'
              },
              followUp: 'Define the window since the last valid control and agree the re-notification with the laboratory manager.',
              arabicNotes: 'إصدار "corrected report" واجب مُلزِم: إبلاغ القسم الطالب فعلياً ضروري، ولا يكفي تعديل النتيجة بصمت في النظام.'
            }
          }
        ]
      },
      {
        id: 'lab_centrifuge_en',
        title: 'Centrifuge: Imbalance and Wrong Protocol (Pre-analytics)',
        level: 'B2',
        persona: {
          name: 'Melanie Hoffmann (Trainee Biomedical Scientist, year 2)',
          role: 'Trainee in specimen reception',
          avatar: '👩‍🔬',
          tone: 'Unsure, visibly startled'
        },
        context: 'A trainee has loaded the bench centrifuge on one side only. The unit vibrated heavily during the run and shut down with an error. On top of that, citrate tubes for coagulation testing were spun using the standard serum programme. You have to coach the trainee accurately without humiliating her.',
        steps: [
          {
            speaker: 'Melanie',
            avatar: '👩‍🔬',
            aiSpeech: 'Sorry to bother you — the centrifuge rattled really loudly and then just switched itself off. I was about to open the lid and have a look. Have I broken something?',
            suggestedResponses: [
              'Please do not open the lid yet — only once the rotor has come to a complete stop. That rattling points to an imbalance. Let us look together at how the tubes were loaded.',
              'It is not a big deal, go ahead and open it and just put the tubes back in.',
              'You really should have been paying attention. Mistakes like that cannot happen in a laboratory.'
            ],
            bestResponseIdx: 0,
            feedback: {
              correction: {
                original: 'It is not a big deal, go ahead and open it.',
                refined: 'Please do not open the lid until the rotor has come to a complete stop. That rattling points to an imbalance.',
                reasonAr: 'السلامة أولاً: فتح غطاء الطاردة قبل توقف الدوار تماماً خطر إصابة حقيقي. ابدأ بالتعليمة الوقائية الفورية بصيغة مهذبة ثم اشرح السبب التقني.'
              },
              vocabTip: {
                term: 'imbalance / rotor / to load symmetrically',
                ipa: '[ɪmˈbæləns]',
                ar: 'اختلال التوازن / الدوار / التحميل المتماثل'
              },
              followUp: 'Explain the principle: tubes of equal weight always go in opposite positions, using a balance tube if needed.',
              arabicNotes: 'توجيه المتدرب يبدأ بالفعل الوقائي ثم التعليل، مع استخدام صيغة الجمع (Let us look together) لتقليل الإحراج والحفاظ على الثقة.'
            }
          },
          {
            speaker: 'Melanie',
            avatar: '👩‍🔬',
            aiSpeech: 'The rotor has stopped now. I had put four tubes on one side only. And I ran the blue citrate tubes on the normal serum programme — is that a problem?',
            suggestedResponses: [
              'Yes, unfortunately that matters. Coagulation samples need their own protocol, typically 1500 g for 10 minutes. The serum programme does not reliably produce platelet-poor plasma, so we have to request a fresh draw.',
              'No, that does not matter, the main thing is that the tubes went through the centrifuge at all.',
              'Just run the samples again on the correct programme and it will be fine.'
            ],
            bestResponseIdx: 0,
            feedback: {
              correction: {
                original: 'Just run the samples again on the correct programme.',
                refined: 'The serum programme does not reliably produce platelet-poor plasma, so we have to request a fresh draw.',
                reasonAr: 'إعادة الطرد المركزي لا تُصلح عينة تخثر عولجت ببروتوكول خاطئ، لأن تفعيل الصفائح يكون قد حدث بالفعل. المطلوب سحب عينة جديدة (fresh draw).'
              },
              vocabTip: {
                term: 'platelet-poor plasma / fresh draw / relative centrifugal force (RCF)',
                ipa: '[ˈpleɪtlət pʊə ˈplæzmə]',
                ar: 'البلازما فقيرة الصفائح / إعادة سحب العينة / قوة الطرد المركزي النسبية'
              },
              followUp: 'Inform the requesting ward about the necessary fresh draw and justify it on pre-analytical grounds.',
              arabicNotes: 'تُذكر سرعة الطرد بوحدة g (RCF) وليس بعدد اللفات فقط، لأن قطر الدوار يختلف بين الأجهزة.'
            }
          },
          {
            speaker: 'Melanie',
            avatar: '👩‍🔬',
            aiSpeech: 'This is really embarrassing. Do I have to report it anywhere, or can it stay between us?',
            suggestedResponses: [
              'It does need documenting, and that is completely normal: we log the incident in the equipment record, have the rotor checked before the next run, and note the fresh draw in the pre-analytics documentation. Reporting errors is part of quality assurance, not an accusation.',
              'No, it can stay between us, otherwise there will just be unnecessary trouble with the lab manager.',
              'You will have to report that yourself, it is not my responsibility.'
            ],
            bestResponseIdx: 0,
            feedback: {
              correction: {
                original: 'It can stay between us, otherwise there will just be trouble.',
                refined: 'We log the incident in the equipment record and note the fresh draw in the pre-analytics documentation.',
                reasonAr: 'إخفاء الحادثة مخالفة لنظام الجودة. الصياغة المهنية تطمئن المتدرب بأن التوثيق إجراء روتيني وليس عقوبة.'
              },
              vocabTip: {
                term: 'equipment record / quality assurance / pre-analytics',
                ipa: '[ɪˈkwɪpmənt ˈrekɔːd]',
                ar: 'سجل الجهاز / ضمان الجودة / مرحلة ما قبل التحليل'
              },
              followUp: 'Enter the incident in the equipment record and flag the rotor check to equipment management.',
              arabicNotes: 'ثقافة الإبلاغ عن الأخطاء ركن أساسي في معايير ISO 15189؛ التعبير عنها بوضوح يطمئن الزميل الأقل خبرة.'
            }
          }
        ]
      },
      {
        id: 'lab_hygiene_en',
        title: 'Hygiene: PPE Breach and Sample Spill (Containment Level 2)',
        level: 'B2',
        persona: {
          name: 'Tobias Frank (Administration intern)',
          role: 'Non-technical visitor in the laboratory area',
          avatar: '🧑‍💼',
          tone: 'Friendly but unaware'
        },
        context: 'An intern from administration walks into the containment level 2 laboratory area without a lab coat or gloves to collect a signature, and knocks over a tube of potentially infectious material. You have to move him out of the area politely but firmly, then carry out surface disinfection correctly.',
        steps: [
          {
            speaker: 'Tobias',
            avatar: '🧑‍💼',
            aiSpeech: 'Hi! Sorry to interrupt — I just need a quick signature from you for the supplies order. Can we do that now?',
            suggestedResponses: [
              'Good morning, Tobias. I am happy to sign that, but could you please step back into the corridor: this area is containment level 2 and may only be entered with personal protective equipment. I will come straight out to you.',
              'Sure, just come on in, it will only take a second.',
              'You are not allowed in here! Did you not read the sign on the door?'
            ],
            bestResponseIdx: 0,
            feedback: {
              correction: {
                original: 'You are not allowed in here! Did you not read the sign?',
                refined: 'Could you please step back into the corridor: this area is containment level 2 and requires personal protective equipment. I will come straight out.',
                reasonAr: 'الحزم لا يعني الفظاظة. اجمع بين ثلاثة عناصر: طلب مهذب بالخروج، سبب موضوعي، وحلّ بديل فوري حتى لا يشعر الزائر بالرفض.'
              },
              vocabTip: {
                term: 'personal protective equipment (PPE) / containment level 2 / access',
                ipa: '[kənˈteɪnmənt ˈlevl̩]',
                ar: 'معدات الوقاية الشخصية / مستوى الأمان الحيوي 2 / الدخول'
              },
              followUp: 'Offer to sign outside the laboratory area and point out the access rules in a friendly way.',
              arabicNotes: 'صيغة "Could you please step back" أمر مهذب بصيغة السؤال، وهي المعيار في فرض قاعدة سلامة دون إهانة المخاطب.'
            }
          },
          {
            speaker: 'Tobias',
            avatar: '🧑‍💼',
            aiSpeech: 'Oh no, I am so sorry! I just knocked against the rack and a tube has fallen over and leaked. Should I quickly wipe it up with a paper towel?',
            suggestedResponses: [
              'Please do not touch anything and leave the area. I will deal with it wearing protective equipment: the spill is first covered with absorbent material, then soaked with surface disinfectant, and we wait for the full contact time.',
              'Yes, go ahead with a paper towel, but wash your hands thoroughly afterwards.',
              'Just leave it, it will dry by itself and we can deal with it later.'
            ],
            bestResponseIdx: 0,
            feedback: {
              correction: {
                original: 'Go ahead with a paper towel and wash your hands afterwards.',
                refined: 'Please do not touch anything. I will deal with it in PPE: cover, soak with surface disinfectant, wait for the contact time.',
                reasonAr: 'مسح المادة المعدية بمنديل ينشرها ويعرّض الشخص للخطر. البروتوكول الصحيح ثلاث خطوات مرتبة: التغطية، ثم التشريب بالمطهر، ثم انتظار زمن التأثير.'
              },
              vocabTip: {
                term: 'surface disinfectant / contact time / absorbent material',
                ipa: '[ˈkɒntækt taɪm]',
                ar: 'مطهر الأسطح / زمن التأثير / مادة ماصة'
              },
              followUp: 'Dispose of the contaminated material as infectious waste and document the incident.',
              arabicNotes: 'مصطلح contact time جوهري: المطهر لا يعمل فوراً بل يحتاج زمناً محدداً من الشركة المصنّعة، وتجاهله خطأ شائع.'
            }
          },
          {
            speaker: 'Tobias',
            avatar: '🧑‍💼',
            aiSpeech: 'I did touch the rack a moment ago. Is it enough if I go and wash my hands?',
            suggestedResponses: [
              'In this case hand disinfection is required, not just washing: take the product from the dispenser by the exit, rub it in completely and observe the thirty-second contact time.',
              'Yes, washing with soap is perfectly sufficient in a case like this.',
              'Do not worry about it, I am sure it was nothing infectious.'
            ],
            bestResponseIdx: 0,
            feedback: {
              correction: {
                original: 'Washing with soap is perfectly sufficient.',
                refined: 'Hand disinfection is required here: rub it in completely and observe the thirty-second contact time.',
                reasonAr: 'فرق جوهري: الغسل يزيل الأوساخ، أما التطهير فيقتل الممرضات. بعد تماس محتمل مع مادة معدية، التطهير هو الإجراء الصحيح.'
              },
              vocabTip: {
                term: 'hand disinfection / dispenser / to rub in',
                ipa: '[hænd ˌdɪsɪnˈfekʃn̩]',
                ar: 'التطهير الصحي لليدين / الموزع / الفرك حتى الامتصاص'
              },
              followUp: 'Refer to the five moments of hand hygiene and the hygiene plan at the entrance.',
              arabicNotes: 'معيار منظمة الصحة العالمية "الخمس لحظات لنظافة اليدين" معتمد في خطط النظافة المخبرية.'
            }
          }
        ]
      },
      {
        id: 'lab_calibration_en',
        title: 'Calibration: Failed Curve After a Reagent Lot Change',
        level: 'C1',
        persona: {
          name: 'Stefan Bauer (Application Specialist, instrument manufacturer)',
          role: 'External service engineer on the phone',
          avatar: '👨‍🔧',
          tone: 'Structured, asks targeted follow-up questions'
        },
        context: 'After switching to a new reagent lot, calibration of the ALT parameter on the clinical chemistry analyser fails repeatedly (error code CAL-317). The parameter is locked and patient samples are backing up. You call the manufacturer hotline and must describe the situation precisely and in a structured way.',
        steps: [
          {
            speaker: 'Mr. Bauer',
            avatar: '👨‍🔧',
            aiSpeech: 'Bauer, technical support. You have reported a calibration problem — please give me a brief description of what exactly is happening.',
            suggestedResponses: [
              'Good morning, Mr. Bauer. Since this morning, calibration of the ALT parameter has been failing with error code CAL-317. It started after we switched to the new reagent lot, and the parameter is currently locked.',
              'Good morning. Our analyser is playing up with the calibration, it just will not go through. Could you take a look?',
              'Hello, we have an error here and we urgently need someone on site, otherwise we are stuck.'
            ],
            bestResponseIdx: 0,
            feedback: {
              correction: {
                original: 'Our analyser is playing up with the calibration, it just will not go through.',
                refined: 'Calibration of the ALT parameter fails with error code CAL-317, starting after the switch to the new reagent lot.',
                reasonAr: 'عند الاتصال بالدعم الفني، اذكر أربعة عناصر في جملة واحدة: المَعلَم المتأثر، رمز الخطأ، الحدث المُطلِق، والحالة الراهنة. الوصف الغامض يطيل المكالمة ويؤخر الحل.'
              },
              vocabTip: {
                term: 'calibration fails / reagent lot / the parameter is locked',
                ipa: '[ˌkælɪˈbreɪʃn̩ feɪlz]',
                ar: 'فشل المعايرة / دفعة الكاشف / المَعلَم موقوف'
              },
              followUp: 'Have the instrument model, serial number and reagent lot number ready for follow-up questions.',
              arabicNotes: 'في المكالمات التقنية يُتوقع منك تقديم المعلومات بترتيب منطقي دون أن تُسأل، فهذا مؤشر على الكفاءة المهنية.'
            }
          },
          {
            speaker: 'Mr. Bauer',
            avatar: '👨‍🔧',
            aiSpeech: 'Understood. What have you already checked? And how is the calibration curve behaving — do you see drift, or is the blank value out of range?',
            suggestedResponses: [
              'We checked the expiry date and storage of the calibrators, re-entered the lot data and repeated the calibration twice. The blank value is clearly above the tolerance limit, and the curve also shows drift in the upper measuring range.',
              'We tried it a few times but it did not work. I have not looked into it in more detail.',
              'I think the calibrators are still fine, but I am not completely sure.'
            ],
            bestResponseIdx: 0,
            feedback: {
              correction: {
                original: 'We tried it a few times but it did not work.',
                refined: 'Expiry and storage checked, lot data re-entered, repeated twice; the blank value is above the tolerance limit.',
                reasonAr: 'عدّد ما فحصته بالفعل بصيغة قائمة موجزة. هذا يمنع الفني من تكرار أسئلة بديهية ويُظهر أنك أجريت التشخيص الأولي بشكل منهجي.'
              },
              vocabTip: {
                term: 'calibration curve / blank value / tolerance limit / drift',
                ipa: '[ˌkælɪˈbreɪʃn̩ kɜːv]',
                ar: 'منحنى المعايرة / قيمة الفراغ / حد التسامح / الانحراف التدريجي'
              },
              followUp: 'Offer to send the calibration log and the curve as a printout or export.',
              arabicNotes: 'المصطلح drift يصف انزياحاً تدريجياً في القياس مع الزمن، ويُميَّز عن الخطأ العشوائي المفاجئ؛ التفريق بينهما مهم في التشخيص.'
            }
          },
          {
            speaker: 'Mr. Bauer',
            avatar: '👨‍🔧',
            aiSpeech: 'That sounds like a problem with the reagent lot itself. I would connect remotely and arrange a replacement lot in parallel. Does that work for you?',
            suggestedResponses: [
              'That would be very helpful. I will need a ticket number and a firm time window, please. For context: the parameter has been locked since this morning and from midday we will have to send samples out to a referral laboratory.',
              'Yes, just go ahead, we will wait until then.',
              'Can you not do it right now? We really do not have time for this.'
            ],
            bestResponseIdx: 0,
            feedback: {
              correction: {
                original: 'Just go ahead, we will wait until then.',
                refined: 'I will need a ticket number and a firm time window. The parameter has been locked since this morning and from midday we must refer samples out.',
                reasonAr: 'اختم المكالمة بثلاثة عناصر: رقم التذكرة للتتبّع، نافذة زمنية مُلزِمة، وبيان الأثر التشغيلي. ذكر التحويل الخارجي يوضّح إلحاح الحالة دون رفع الصوت.'
              },
              vocabTip: {
                term: 'remote access / time window / referral laboratory (send-out)',
                ipa: '[rɪˈməʊt ˈækses]',
                ar: 'الوصول عن بُعد / النافذة الزمنية / التحويل إلى مختبر خارجي'
              },
              followUp: 'Document the ticket number, the contact person and the time in the equipment record.',
              arabicNotes: 'طلب رقم التذكرة والنافذة الزمنية صراحةً ممارسة معيارية في التعامل مع موردي الأجهزة، وتحمي المختبر عند التدقيق.'
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

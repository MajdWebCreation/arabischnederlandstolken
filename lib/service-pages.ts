import type { Locale } from "@/lib/site";

const servicePages = {
  nl: {
    sworn: {
      metaTitle: "Beëdigd tolk Arabisch ↔ Nederlands | Officiële context",
      metaDescription:
        "Beëdigd Arabisch-Nederlands tolk voor officiële, juridische en procedurele contexten waarin verificatie en formele inzet belangrijk zijn.",
      hero: {
        eyebrow: "Officiële inzet",
        title: "Beëdigd tolk Arabisch ↔ Nederlands voor contexten waarin verificatie telt.",
        intro:
          "Deze pagina is bedoeld voor opdrachtgevers die niet alleen een Arabisch-Nederlandse tolk zoeken, maar expliciet willen beoordelen of beëdigde of formeel verifieerbare inzet noodzakelijk is. De inhoud helpt bij het onderscheiden van gewone inzet en inzet waarbij registratie, bevoegdheid of procedurele eisen zwaarder wegen.",
        highlights: [
          "Geschikt voor juridische en andere officiële contexten.",
          "Gericht op verificatie, bevoegdheid en zorgvuldige intake.",
          "Beschikbaar via beëdigde tolken die in een nationaal register zijn ingeschreven.",
        ],
      },
      answerFirst: {
        eyebrow: "Direct antwoord",
        title: "Wanneer vraagt u specifiek om een beëdigd tolk?",
        description:
          "Niet elk gesprek vraagt om dezelfde formele status. Daarom begint deze pagina bij de kernvraag.",
        body:
          "Een beëdigd tolk is vooral relevant wanneer de procedure of de betrokken instantie formele eisen stelt aan de inzet van de tolk, of wanneer verificatie van bevoegdheid expliciet onderdeel van de opdracht moet zijn. In zulke contexten is het verstandig om de gewenste status vooraf te benoemen en controleerbaar te maken.",
      },
      signals: [
        {
          title: "Juridische procedures",
          description:
            "Bij zaken met formele procescontext of officiële dossierwerking kan beëdigde inzet gevraagd of verwacht worden.",
        },
        {
          title: "Officiële instanties",
          description:
            "Sommige overheids- of procedurecontexten vragen om een expliciet toetsbare tolkstatus in plaats van algemene inzetbaarheid.",
        },
        {
          title: "Verifieerbare opdrachtformulering",
          description:
            "Bij beëdigde inzet hoort dat opdrachtgever en tolkstatus vóór bevestiging duidelijk worden afgestemd.",
        },
      ],
      verification: {
        eyebrow: "Hoe verificatie werkt",
        title: "Bij formele inzet wordt de vereiste status vooraf gecontroleerd.",
        description:
          "Voor formele inzet moet duidelijk zijn welke verificatie relevant is voor de opdracht.",
        items: [
          "Controle op of de opdracht beëdigde inzet vereist.",
          "Afstemming op formele context, procedure of instantie.",
          "Controle van registerinschrijving waar de opdracht dat vereist.",
          "Heldere scheiding tussen algemene tolkdienst en formeel verifieerbare inzet.",
        ],
      },
      contexts: {
        eyebrow: "Toepassingscontexten",
        title: "Contexten waarin beëdigde inzet vaker aan de orde is",
        description:
          "De uiteindelijke noodzaak hangt af van de opdracht, maar deze categorieën komen het vaakst in beeld.",
        items: [
          {
            title: "Advocaat en dossierbespreking",
            description:
              "Voor trajecten waarbij formele taaloverdracht en dossierzorgvuldigheid zwaar wegen.",
          },
          {
            title: "Rechtbank en procescontext",
            description:
              "Voor contexten waarin de procedure striktere eisen stelt aan rol en status van de tolk.",
          },
          {
            title: "Officiële verklaringen of formele besprekingen",
            description:
              "Wanneer het gesprek onderdeel is van een formeel besluitvormings- of verificatieproces.",
          },
        ],
      },
      steps: [
        {
          title: "Geef aan dat beëdigde inzet gewenst of vereist is",
          description:
            "Vermeld bij de aanvraag expliciet dat het om beëdigde of formeel verifieerbare inzet gaat.",
        },
        {
          title: "Geef procedure en instantie door",
          description:
            "De context bepaalt welke controle nodig is en hoe de inzet moet worden afgestemd.",
        },
        {
          title: "Ontvang een terugkoppeling op geschiktheid en vervolgstap",
          description:
            "U krijgt een reactie die is afgestemd op haalbaarheid, vereiste kwalificatie en beschikbaarheid.",
        },
      ],
      cta: {
        eyebrow: "Officiële aanvraag",
        title: "Moet de tolkstatus expliciet verifieerbaar zijn voor uw afspraak?",
        description:
          "Gebruik de contactroute voor formele of juridische afspraken en vermeld direct dat beëdigde inzet relevant is.",
      },
    },
    urgent: {
      metaTitle: "Spoedtolk Arabisch ↔ Nederlands | Snelle inzet",
      metaDescription:
        "Spoedtolk Arabisch-Nederlands voor urgente gesprekken in zorg, gemeente, recht en migratie. Gericht op snelle intake en realistische inzet.",
      hero: {
        eyebrow: "Snelle inzet",
        title: "Spoedtolk Arabisch ↔ Nederlands voor gesprekken die niet kunnen wachten.",
        intro:
          "Deze route is bedoeld voor tijdkritische situaties waarin snel duidelijk moet worden of Arabisch-Nederlandse tolkondersteuning haalbaar is. De pagina vermijdt loze spoedbeloftes en focust op wat opdrachtgevers direct moeten aanleveren om snelle inzet mogelijk te maken.",
        highlights: [
          "Gericht op snelle intake en realistische terugkoppeling.",
          "Geschikt voor telefonisch, video en in sommige gevallen snelle fysieke inzet.",
          "Soms mogelijk op dezelfde dag of op korte termijn, afhankelijk van beschikbaarheid.",
        ],
      },
      answerFirst: {
        eyebrow: "Direct antwoord",
        title: "Wanneer is een spoedtolk de juiste route?",
        description:
          "Niet elk snel verzoek is automatisch een spoedaanvraag. Deze pagina helpt dat verschil uitleggen.",
        body:
          "Een spoedtolk is relevant wanneer de afspraak of het gesprek op zeer korte termijn plaatsvindt en taalondersteuning cruciaal is voor begrip, besluitvorming of procedureverloop. In zulke gevallen helpt een compacte, duidelijke intake om snel vast te stellen wat haalbaar is.",
      },
      signals: [
        {
          title: "Korte doorlooptijd",
          description:
            "De afspraak vindt dezelfde dag of binnen zeer korte termijn plaats.",
        },
        {
          title: "Procedure of zorgmoment kan niet wachten",
          description:
            "De inhoud van het gesprek maakt uitstel onwenselijk of praktisch onmogelijk.",
        },
        {
          title: "Snelheid én zorgvuldigheid moeten samengaan",
          description:
            "Ook bij spoed blijven context, haalbaarheid en professionele grenzen belangrijk.",
        },
      ],
      verification: {
        eyebrow: "Wat helpt bij spoed",
        title: "Een goede spoedaanvraag is compact, precies en controleerbaar.",
        description:
          "Hoe concreter de aanvraag, hoe sneller op haalbaarheid kan worden teruggekoppeld.",
        items: [
          "Exacte tijd van het gesprek of de afspraak.",
          "Gesprekstype: telefonisch, video of locatie.",
          "Korte uitleg van de urgentie en sectorcontext.",
          "Vermelding of formele verificatie of beëdigde status nodig is.",
        ],
      },
      contexts: {
        eyebrow: "Spoedcontexten",
        title: "Veelvoorkomende situaties voor spoedinzet",
        description:
          "Deze route is vooral nuttig in situaties waarin snelle taalondersteuning directe gevolgen heeft voor begrip of voortgang.",
        items: [
          {
            title: "Zorg en acute afstemming",
            description:
              "Voor tijdkritische zorggesprekken, medische updates of spoedoverleg waarin snel begrip nodig is.",
          },
          {
            title: "Gemeente of proceduregesprek op korte termijn",
            description:
              "Voor afspraken die onverwacht naar voren zijn gehaald of moeilijk te verplaatsen zijn.",
          },
          {
            title: "Juridische of migratiecontext",
            description:
              "Voor gesprekken met korte voorbereidingstijd waarin correcte taaloverdracht essentieel blijft.",
          },
        ],
      },
      steps: [
        {
          title: "Dien een spoedaanvraag in met exacte tijd",
          description:
            "Bij spoed telt elke onduidelijkheid. Geef dus direct aan wanneer het gesprek plaatsvindt.",
        },
        {
          title: "Vermeld vorm, urgentie en context",
          description:
            "Telefonisch, video of locatie, plus een korte uitleg van de situatie, versnellen de beoordeling.",
        },
        {
          title: "Ontvang snelle terugkoppeling op haalbaarheid",
          description:
            "De reactie is gericht op realistische inzet en niet op onhoudbare beloften.",
        },
      ],
      cta: {
        eyebrow: "Spoedroute",
        title: "Heeft u snel een Arabisch-Nederlandse tolk nodig?",
        description:
          "Mail uw spoedaanvraag en vermeld direct de exacte tijd, context en gewenste inzetvorm.",
      },
    },
  },
  ar: {
    sworn: {
      metaTitle: "مترجم محلّف عربي ↔ هولندي | سياق رسمي",
      metaDescription:
        "مترجم شفهي عربي هولندي محلّف أو قابل للتحقق الرسمي في السياقات القانونية والرسمية والإجرائية.",
      hero: {
        eyebrow: "استخدام رسمي",
        title: "مترجم محلّف عربي ↔ هولندي للسياقات التي تتطلب تحققاً واضحاً.",
        intro:
          "هذه الصفحة مخصصة للجهات التي لا تبحث فقط عن مترجم عربي هولندي، بل تريد أيضاً تقييم ما إذا كانت الصفة المحلّفة أو القابلة للتحقق الرسمي مطلوبة فعلاً. وهي تساعد على التمييز بين الخدمة العامة والسياقات التي تتطلب تحققاً مهنياً أو إجرائياً أدق.",
        highlights: [
          "مناسبة للسياقات القانونية والرسمية.",
          "تركّز على التحقق والصفة المهنية والمواءمة مع الإجراء.",
          "متاحة عبر مترجمين محلّفين مسجلين في سجل وطني.",
        ],
      },
      answerFirst: {
        eyebrow: "إجابة مباشرة",
        title: "متى تحتاجون إلى مترجم محلّف تحديداً؟",
        description:
          "ليست كل محادثة بحاجة إلى الصفة نفسها، لذلك تبدأ الصفحة من هذا السؤال.",
        body:
          "يصبح المترجم المحلّف ذا أهمية عندما تفرض الجهة أو الإجراء متطلبات رسمية على وضع المترجم، أو عندما يجب أن تكون الصفة المهنية قابلة للتحقق بشكل صريح ضمن المهمة.",
      },
      signals: [
        {
          title: "إجراءات قانونية",
          description:
            "في المسارات القانونية أو المرتبطة بالملفات الرسمية قد تكون الصفة المحلّفة مطلوبة أو مفضلة.",
        },
        {
          title: "جهات رسمية",
          description:
            "بعض الجهات أو الإجراءات تتطلب مترجماً يمكن التحقق من وضعه المهني بشكل أوضح.",
        },
        {
          title: "تنسيق يمكن التحقق منه",
          description:
            "في مثل هذه الحالات يجب الاتفاق مسبقاً على الوضع المطلوب وطريقة التحقق منه.",
        },
      ],
      verification: {
        eyebrow: "كيف يعمل التحقق",
        title: "يتم التحقق مسبقاً من الصفة المطلوبة للمهام الرسمية.",
        description:
          "في الاستخدام الرسمي يجب أن يكون واضحاً ما نوع التحقق المرتبط بالمهمة.",
        items: [
          "تحديد ما إذا كانت الصفة المحلّفة مطلوبة فعلاً.",
          "ربط الطلب بالإجراء أو الجهة الرسمية المعنية.",
          "التحقق من التسجيل عندما تتطلب المهمة ذلك.",
          "الفصل الواضح بين الخدمة العامة والاستخدام القابل للتحقق الرسمي.",
        ],
      },
      contexts: {
        eyebrow: "سياقات الاستخدام",
        title: "سياقات يظهر فيها طلب المترجم المحلّف بشكل أكبر",
        description:
          "تعتمد الضرورة النهائية على الجهة والملف، لكن هذه الفئات تظهر فيها الحاجة أكثر من غيرها.",
        items: [
          {
            title: "المحاماة ومناقشة الملفات",
            description:
              "عندما تكون دقة اللغة والملف الرسميين ذوي أهمية عالية.",
          },
          {
            title: "المحكمة والسياق الإجرائي",
            description:
              "في الحالات التي تفرض فيها الإجراءات دوراً أو وضعاً أكثر رسمية للمترجم.",
          },
          {
            title: "المحادثات أو التصريحات الرسمية",
            description:
              "عندما يكون الاجتماع جزءاً من عملية تحقق أو قرار رسمي.",
          },
        ],
      },
      steps: [
        {
          title: "اذكروا أن الصفة المحلّفة مطلوبة أو مرغوبة",
          description:
            "من المهم توضيح ذلك منذ الرسالة الأولى حتى تكون المراجعة صحيحة.",
        },
        {
          title: "أرسلوا الإجراء أو الجهة المعنية",
          description:
            "السياق هو ما يحدد شكل التحقق المطلوب.",
        },
        {
          title: "احصلوا على متابعة حول الملاءمة والخطوة التالية",
          description:
            "ستصلكم متابعة مبنية على الواقع الإجرائي لا على وعود عامة.",
        },
      ],
      cta: {
        eyebrow: "طلب رسمي",
        title: "هل تحتاجون إلى مترجم يمكن التحقق من وضعه المهني لموعد رسمي؟",
        description:
          "استخدموا مسار التواصل الرسمي واذكروا من البداية أن الصفة المحلّفة أو الرسمية جزء من الطلب.",
      },
    },
    urgent: {
      metaTitle: "مترجم طوارئ عربي ↔ هولندي | تنسيق سريع",
      metaDescription:
        "مترجم طوارئ عربي هولندي للحالات العاجلة في الرعاية والبلديات والسياقات القانونية والهجرية مع استقبال سريع وواقعي.",
      hero: {
        eyebrow: "تنسيق سريع",
        title: "مترجم طوارئ عربي ↔ هولندي للمحادثات التي لا تحتمل التأجيل.",
        intro:
          "هذه الصفحة مخصصة للحالات التي يجب فيها معرفة إمكانية توفير ترجمة شفوية عربية هولندية خلال وقت قصير. وهي تتجنب الوعود غير الواقعية وتركز على ما يجب إرساله فوراً لتسريع التقييم.",
        highlights: [
          "مبنية على استقبال سريع ورد مهني واقعي.",
          "مناسبة للهاتف والفيديو وبعض المواعيد الحضورية السريعة.",
          "قد تتاح في اليوم نفسه أو خلال وقت قصير بحسب التوافر.",
        ],
      },
      answerFirst: {
        eyebrow: "إجابة مباشرة",
        title: "متى يكون مسار الطوارئ هو الأنسب؟",
        description:
          "ليس كل طلب سريع طلبَ طوارئ فعلياً، لذلك تبدأ الصفحة بهذا التوضيح.",
        body:
          "يكون مسار الطوارئ مناسباً عندما يكون الاجتماع على وشك الانعقاد خلال وقت قصير جداً، ويكون وجود الترجمة الشفهية ضرورياً للفهم أو القرار أو سير الإجراء.",
      },
      signals: [
        {
          title: "مهلة زمنية قصيرة",
          description:
            "الموعد في نفس اليوم أو خلال وقت قصير جداً.",
        },
        {
          title: "لا يمكن تأجيل الاجتماع بسهولة",
          description:
            "تأجيل الموعد غير عملي أو غير مناسب نظراً لطبيعة الحالة.",
        },
        {
          title: "الحاجة إلى السرعة لا تلغي الدقة",
          description:
            "حتى في الطوارئ تبقى الملاءمة والسياق وحدود الإمكانات عناصر أساسية.",
        },
      ],
      verification: {
        eyebrow: "ما الذي يساعد في الطوارئ",
        title: "الطلب العاجل الجيد يكون قصيراً لكنه دقيق وقابل للفحص.",
        description:
          "كلما كانت التفاصيل أوضح، كان من الممكن الرد أسرع على مدى الإمكانية.",
        items: [
          "الوقت الدقيق للاجتماع.",
          "شكل الجلسة: هاتف أو فيديو أو حضور.",
          "وصف مختصر للسبب والسياق.",
          "بيان ما إذا كانت هناك حاجة إلى تحقق رسمي أو صفة محلّفة.",
        ],
      },
      contexts: {
        eyebrow: "سياقات الطوارئ",
        title: "حالات يتكرر فيها طلب الترجمة الشفهية العاجلة",
        description:
          "يكون هذا المسار مفيداً عندما تؤثر السرعة مباشرة على الفهم أو سير الإجراء.",
        items: [
          {
            title: "الرعاية الصحية",
            description:
              "في التحديثات الطبية أو التنسيق العاجل أو أي محادثة صحية لا تحتمل التأجيل.",
          },
          {
            title: "البلدية أو الموعد الإجرائي القريب",
            description:
              "عندما يتقدم الموعد فجأة أو يصبح من الصعب إعادة ترتيبه.",
          },
          {
            title: "السياق القانوني أو الهجري",
            description:
              "في الحالات التي يكون فيها الوقت قصيراً لكن نقل المعنى بدقة ما يزال أساسياً.",
          },
        ],
      },
      steps: [
        {
          title: "أرسلوا طلب الطوارئ مع الوقت المحدد",
          description:
            "في الحالات العاجلة يجب توضيح الموعد بدقة من أول رسالة.",
        },
        {
          title: "اذكروا شكل الجلسة والسبب والسياق",
          description:
            "الهاتف أو الفيديو أو الحضور، مع سبب الاستعجال، كلها عناصر تسرع التقييم.",
        },
        {
          title: "استلموا رداً سريعاً حول الإمكانية",
          description:
            "الهدف هو رد مهني واقعي مبني على ما يمكن تنفيذه فعلاً.",
        },
      ],
      cta: {
        eyebrow: "مسار الطوارئ",
        title: "هل تحتاجون بسرعة إلى مترجم عربي هولندي؟",
        description:
          "استخدموا مسار الطوارئ أو طلب الاتصال، واذكروا الوقت الدقيق والسياق ونوع الجلسة المطلوبة.",
      },
    },
  },
} as const;

export function getPhaseTwoServiceContent(locale: Locale) {
  return servicePages[locale];
}

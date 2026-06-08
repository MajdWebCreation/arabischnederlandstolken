import type { Locale } from "@/lib/site";

export type TeamCapability = {
  id: string;
  title: Record<Locale, string>;
  overview: Record<Locale, string>;
  contexts: Record<Locale, string[]>;
  modes: Record<Locale, string[]>;
  safeguards: Record<Locale, string[]>;
};

export const teamCapabilities: TeamCapability[] = [
  {
    id: "legal-healthcare",
    title: {
      nl: "Juridische en zorggesprekken",
      ar: "المحادثات القانونية والطبية",
    },
    overview: {
      nl: "Tolkondersteuning voor gesprekken waarin nauwkeurigheid, neutraliteit en zorgvuldige omgang met gevoelige informatie belangrijk zijn.",
      ar: "دعم للحوارات التي تتطلب دقة وحياداً وتعاملاً مهنياً مع المعلومات الحساسة.",
    },
    contexts: {
      nl: ["Advocatuur en rechtbank", "Huisarts, ziekenhuis en GGZ", "Dossier- en intakegesprekken"],
      ar: ["المحاماة والمحاكم", "الطبيب والمستشفى والصحة النفسية", "مناقشة الملفات والاستقبال"],
    },
    modes: {
      nl: ["Telefonisch", "Via video", "Op locatie, na afstemming"],
      ar: ["هاتفياً", "عبر الفيديو", "حضورياً بعد التنسيق"],
    },
    safeguards: {
      nl: ["Neutrale taaloverdracht", "Context vooraf afstemmen", "Terughoudend omgaan met gevoelige gegevens"],
      ar: ["نقل محايد للمعنى", "تنسيق السياق مسبقاً", "التعامل الحذر مع البيانات الحساسة"],
    },
  },
  {
    id: "government-migration",
    title: {
      nl: "Gemeente, overheid en migratie",
      ar: "البلديات والجهات الرسمية والهجرة",
    },
    overview: {
      nl: "Ondersteuning bij bestuurlijke en procedurele gesprekken waarbij duidelijke uitleg en consistente terminologie nodig zijn.",
      ar: "دعم للمحادثات الإدارية والإجرائية التي تحتاج إلى شرح واضح ومصطلحات متسقة.",
    },
    contexts: {
      nl: ["Gemeente en sociaal domein", "IND en migratie", "Formele intake en vervolgafspraken"],
      ar: ["البلديات والمجال الاجتماعي", "الهجرة وIND", "الاستقبال والمتابعة الرسمية"],
    },
    modes: {
      nl: ["Telefonisch", "Via video", "Op locatie, na afstemming"],
      ar: ["هاتفياً", "عبر الفيديو", "حضورياً بعد التنسيق"],
    },
    safeguards: {
      nl: ["Rol van de tolk vooraf verduidelijken", "Procedure en terminologie afstemmen", "Vereiste kwalificatie vooraf controleren"],
      ar: ["توضيح دور المترجم مسبقاً", "تنسيق الإجراء والمصطلحات", "التحقق من التأهيل المطلوب"],
    },
  },
  {
    id: "urgent-formal",
    title: {
      nl: "Spoed en formele inzet",
      ar: "الطوارئ والمهام الرسمية",
    },
    overview: {
      nl: "Voor tijdkritische of formele afspraken wordt vooraf beoordeeld welke beschikbaarheid, inzetvorm en kwalificatie nodig zijn.",
      ar: "في المواعيد العاجلة أو الرسمية يتم مسبقاً تقييم التوافر وشكل الجلسة والتأهيل المطلوب.",
    },
    contexts: {
      nl: ["Dezelfde dag of op korte termijn", "Beëdigde inzet wanneer vereist", "Juridische of officiële afspraken"],
      ar: ["في اليوم نفسه أو خلال وقت قصير", "مترجم محلّف عند الحاجة", "مواعيد قانونية أو رسمية"],
    },
    modes: {
      nl: ["Telefonisch waar passend", "Video bij korte termijn", "Fysiek als context en planning dat toelaten"],
      ar: ["هاتفياً عند الملاءمة", "عبر الفيديو للوقت القصير", "حضورياً إذا سمح السياق والجدول"],
    },
    safeguards: {
      nl: ["Geen beschikbaarheidsgarantie vooraf", "Exacte tijd en context nodig", "Registerinschrijving controleren bij formele inzet"],
      ar: ["لا يوجد ضمان مسبق للتوافر", "يلزم تحديد الوقت والسياق", "التحقق من التسجيل في المهام الرسمية"],
    },
  },
];

const teamPageContent = {
  nl: {
    metaTitle: "Collectief en werkwijze | Arabisch ↔ Nederlands tolken",
    metaDescription:
      "Lees hoe het Arabisch-Nederlandse tolkencollectief opdrachten afstemt op context, inzetvorm, beschikbaarheid en vereiste kwalificatie.",
    hero: {
      eyebrow: "Collectief en werkwijze",
      title: "Arabisch-Nederlandse tolken voor uiteenlopende professionele gesprekken.",
      intro:
        "Het collectief brengt aanvragen in kaart op basis van taalrichting, gesprekstype, gewenste inzetvorm, beschikbaarheid en eventuele formele eisen. Binnen het collectief zijn ook beëdigde tolken beschikbaar die in een nationaal register zijn ingeschreven.",
      highlights: [
        "Inzet voor zorg, overheid, recht en migratie.",
        "Telefonisch, via video of op locatie, afhankelijk van de opdracht.",
        "Beëdigde en urgente inzet wordt per aanvraag afgestemd.",
      ],
    },
    sections: {
      overview: {
        eyebrow: "Passende inzet",
        title: "Niet iedere opdracht vraagt om dezelfde ervaring of formele status.",
        description:
          "Daarom wordt vooraf gekeken naar de inhoud van het gesprek, de setting, de gewenste vorm en de vraag of een beëdigde of geregistreerde tolk nodig is.",
      },
      verification: {
        eyebrow: "Vooraf afstemmen",
        title: "Welke punten worden vóór bevestiging beoordeeld?",
        description:
          "De beschikbare informatie wordt gebruikt om een passende en haalbare inzet te beoordelen.",
        items: [
          "Taalrichting en relevante terminologie",
          "Sector en gevoeligheid van het gesprek",
          "Telefonische, video- of fysieke inzet",
          "Beëdigde of geregistreerde status wanneer vereist",
          "Datum, tijd, duur en actuele beschikbaarheid",
        ],
      },
      expertise: {
        eyebrow: "Expertisegebieden",
        title: "Het collectief ondersteunt verschillende professionele contexten.",
        description:
          "De onderstaande gebieden beschrijven de typen opdrachten die kunnen worden afgestemd. Een concrete match blijft afhankelijk van beschikbaarheid en vereiste kwalificatie.",
      },
      assignment: {
        eyebrow: "Van aanvraag naar inzet",
        title: "Een gerichte aanvraag maakt een zorgvuldige match mogelijk.",
        description:
          "Stuur alleen de gegevens die nodig zijn om de opdracht te beoordelen. Gevoelige dossierinformatie kan later via een passend kanaal worden afgestemd.",
      },
    },
  },
  ar: {
    metaTitle: "المجموعة وطريقة العمل | مترجمون عرب وهولنديون",
    metaDescription:
      "تعرفوا على كيفية تنسيق مجموعة المترجمين الشفهيين للمهام بحسب السياق وشكل الجلسة والتوافر والتأهيل المطلوب.",
    hero: {
      eyebrow: "المجموعة وطريقة العمل",
      title: "مترجمون شفهيون بالعربية والهولندية لمحادثات مهنية متنوعة.",
      intro:
        "يتم تقييم الطلب بحسب اتجاه اللغة ونوع المحادثة وشكل الجلسة والتوافر وأي متطلبات رسمية. تضم المجموعة أيضاً مترجمين محلّفين مسجلين في سجل وطني.",
      highlights: [
        "للرعاية والجهات الرسمية والقانون والهجرة.",
        "هاتفياً أو عبر الفيديو أو حضورياً بحسب المهمة.",
        "يتم تنسيق المهام المحلّفة والعاجلة لكل طلب على حدة.",
      ],
    },
    sections: {
      overview: {
        eyebrow: "المهمة المناسبة",
        title: "ليست كل مهمة بحاجة إلى الخبرة أو الصفة الرسمية نفسها.",
        description:
          "لذلك يتم مسبقاً تقييم مضمون المحادثة وشكلها وما إذا كانت هناك حاجة إلى مترجم محلّف أو مسجل.",
      },
      verification: {
        eyebrow: "التنسيق المسبق",
        title: "ما النقاط التي تُراجع قبل تأكيد المهمة؟",
        description:
          "تُستخدم المعلومات المتاحة لتقييم مدى الملاءمة والإمكانية بشكل مهني.",
        items: [
          "اتجاه اللغة والمصطلحات ذات الصلة",
          "القطاع وحساسية المحادثة",
          "الهاتف أو الفيديو أو الحضور",
          "الصفة المحلّفة أو المسجلة عند الحاجة",
          "التاريخ والوقت والمدة والتوافر الفعلي",
        ],
      },
      expertise: {
        eyebrow: "مجالات الخبرة",
        title: "تدعم المجموعة سياقات مهنية متنوعة.",
        description:
          "توضح المجالات التالية أنواع المهام الممكنة. تبقى الملاءمة النهائية مرتبطة بالتوافر والتأهيل المطلوب.",
      },
      assignment: {
        eyebrow: "من الطلب إلى المهمة",
        title: "الطلب الدقيق يساعد على اختيار المترجم المناسب.",
        description:
          "أرسلوا فقط المعلومات الضرورية لتقييم المهمة. يمكن تنسيق بيانات الملفات الحساسة لاحقاً عبر قناة مناسبة.",
      },
    },
  },
} as const;

export function getTeamPageContent(locale: Locale) {
  return teamPageContent[locale];
}

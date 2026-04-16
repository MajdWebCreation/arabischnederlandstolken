import type { Locale } from "@/lib/site";

export type TeamProfile = {
  slug: string;
  name: string;
  title: Record<Locale, string>;
  overview: Record<Locale, string>;
  languages: Record<Locale, string[]>;
  specializations: Record<Locale, string[]>;
  serviceAreas: Record<Locale, string[]>;
  quality: Record<Locale, string[]>;
  swornStatus: Record<Locale, string>;
  verification: {
    wbtvStatus: Record<Locale, string>;
    rbtvStatus: Record<Locale, string>;
    confidentiality: Record<Locale, string>;
    qualityLevel: Record<Locale, string>;
  };
};

export const teamProfiles: TeamProfile[] = [
  {
    slug: "arabisch-nederlands-juridisch-zorg",
    name: "Profiel Arabisch-Nederlands Juridisch/Zorg",
    title: {
      nl: "Arabisch ↔ Nederlands tolk voor juridische en zorgcontext",
      ar: "مترجم شفهي عربي ↔ هولندي للسياقات القانونية والطبية",
    },
    overview: {
      nl: "Profiel ingericht voor gesprekken waarbij juridische nauwkeurigheid, zorgvuldige uitleg en vertrouwelijke omgang met informatie samenkomen.",
      ar: "ملف مهني مهيأ للمحادثات التي تتطلب دقة قانونية وشرحاً واضحاً وتعاملًا سرياً مع المعلومات.",
    },
    languages: {
      nl: ["Arabisch", "Nederlands"],
      ar: ["العربية", "الهولندية"],
    },
    specializations: {
      nl: ["Advocatuur", "Rechtbankcontext", "Zorg en intakegesprekken"],
      ar: ["المحاماة", "سياق المحاكم", "الرعاية الصحية وجلسات الاستقبال"],
    },
    serviceAreas: {
      nl: ["Telefonisch", "Video", "Op locatie in Nederland"],
      ar: ["هاتفياً", "عبر الفيديو", "حضورياً داخل هولندا"],
    },
    quality: {
      nl: [
        "Neutrale overdracht van inhoud",
        "Voorbereid op vertrouwelijke dossiers",
        "Geschikt voor high-stakes gesprekken",
      ],
      ar: [
        "نقل محايد للمحتوى",
        "جاهزية للتعامل مع ملفات حساسة",
        "مناسب للمحادثات عالية الأهمية",
      ],
    },
    swornStatus: {
      nl: "Beëdigde of formeel verifieerbare inzet bespreekbaar per opdracht",
      ar: "تُراجع الصفة المحلّفة أو القابلة للتحقق الرسمي حسب طبيعة المهمة",
    },
    verification: {
      wbtvStatus: {
        nl: "Wbtv-verificatieveld voorbereid",
        ar: "حقل التحقق من Wbtv مُعدّ",
      },
      rbtvStatus: {
        nl: "Rbtv-/registerstatus voorbereid",
        ar: "حالة السجل أو Rbtv مُعدة",
      },
      confidentiality: {
        nl: "Geheimhouding en professionele omgang expliciet meegenomen",
        ar: "السرية والتعامل المهني عنصران أساسيان في هذا الملف",
      },
      qualityLevel: {
        nl: "Kwaliteits- en contextcheck per opdracht",
        ar: "تقييم الجودة والسياق يتم لكل مهمة على حدة",
      },
    },
  },
  {
    slug: "arabisch-nederlands-gemeente-migratie",
    name: "Profiel Arabisch-Nederlands Gemeente/Migratie",
    title: {
      nl: "Arabisch ↔ Nederlands tolk voor gemeente, IND en migratie",
      ar: "مترجم شفهي عربي ↔ هولندي للبلديات والهجرة وIND",
    },
    overview: {
      nl: "Profiel voor gesprekken met bestuurlijke of procedurele impact, waarbij duidelijke uitleg, rust en consistentie van belang zijn.",
      ar: "ملف مخصص للمحادثات الإدارية أو الإجرائية التي تحتاج إلى شرح واضح وهدوء واتساق في نقل المعنى.",
    },
    languages: {
      nl: ["Arabisch", "Nederlands"],
      ar: ["العربية", "الهولندية"],
    },
    specializations: {
      nl: ["Gemeentezaken", "IND en migratie", "Maatschappelijke begeleiding"],
      ar: ["شؤون البلديات", "الهجرة وIND", "المرافقة المجتمعية"],
    },
    serviceAreas: {
      nl: ["Telefonisch", "Video", "Afspraak op locatie"],
      ar: ["هاتفياً", "عبر الفيديو", "موعد حضوري"],
    },
    quality: {
      nl: [
        "Heldere uitleg in procedurecontext",
        "Geschikt voor formele intake en vervolgafspraken",
        "Controle op context en rol van de tolk vooraf",
      ],
      ar: [
        "شرح واضح في السياقات الإجرائية",
        "مناسب لجلسات الاستقبال والمتابعة الرسمية",
        "مراجعة الدور والسياق قبل بدء المهمة",
      ],
    },
    swornStatus: {
      nl: "Formele of beëdigde inzet kan per procedure worden afgestemd",
      ar: "يمكن تنسيق الحاجة إلى مترجم محلّف أو رسمي بحسب الإجراء",
    },
    verification: {
      wbtvStatus: {
        nl: "Verificatieveld voor officiële inzet voorbereid",
        ar: "حقل التحقق للاستخدام الرسمي مُعدّ",
      },
      rbtvStatus: {
        nl: "Registerstatus als controlepunt voorbereid",
        ar: "حالة السجل مهيأة كنقطة تحقق",
      },
      confidentiality: {
        nl: "Zorgvuldige omgang met cliënt- en dossierinformatie",
        ar: "تعامل حذر مع معلومات العميل أو الملف",
      },
      qualityLevel: {
        nl: "Afstemming op procedure, terminologie en context",
        ar: "مواءمة مع الإجراء والمصطلحات والسياق",
      },
    },
  },
  {
    slug: "arabisch-nederlands-spoed-telefonisch",
    name: "Profiel Arabisch-Nederlands Spoed/Telefonisch",
    title: {
      nl: "Arabisch ↔ Nederlands tolk voor spoed en telefonische inzet",
      ar: "مترجم شفهي عربي ↔ هولندي للطوارئ والاستخدام الهاتفي",
    },
    overview: {
      nl: "Profiel dat laat zien hoe snelheid, bereikbaarheid en zorgvuldigheid samenkomen bij urgente of tijdkritische gesprekken.",
      ar: "ملف يوضح كيف يمكن الجمع بين السرعة والتوافر والعناية المهنية في الحالات العاجلة أو الحساسة زمنياً.",
    },
    languages: {
      nl: ["Arabisch", "Nederlands"],
      ar: ["العربية", "الهولندية"],
    },
    specializations: {
      nl: ["Spoedoverleg", "Telefonische triage", "Korte proceduregesprekken"],
      ar: ["التنسيق العاجل", "الفرز أو المتابعة الهاتفية", "المحادثات الإجرائية القصيرة"],
    },
    serviceAreas: {
      nl: ["Telefonisch", "Video bij korte termijn", "Snel inzetbare afspraken"],
      ar: ["هاتفياً", "عبر الفيديو عند الحاجة السريعة", "مواعيد قابلة للتنسيق السريع"],
    },
    quality: {
      nl: [
        "Snelheid zonder onduidelijke beloftes",
        "Duidelijke intake voor urgente context",
        "Professionele afbakening van wat haalbaar is",
      ],
      ar: [
        "سرعة دون وعود غير واقعية",
        "استقبال واضح للطلبات العاجلة",
        "تحديد مهني لما هو ممكن فعلاً",
      ],
    },
    swornStatus: {
      nl: "Spoedinzet en beëdigde inzet worden apart tegen de context afgezet",
      ar: "تُقيّم الحاجة إلى الطوارئ والصفة المحلّفة كلٌّ بحسب السياق",
    },
    verification: {
      wbtvStatus: {
        nl: "Verificatiepunt voor formele spoedcontext voorbereid",
        ar: "نقطة التحقق للسياقات العاجلة الرسمية مُعدة",
      },
      rbtvStatus: {
        nl: "Registercontrole kan deel uitmaken van de intake",
        ar: "يمكن أن تكون مراجعة السجل جزءاً من الاستقبال الأولي",
      },
      confidentiality: {
        nl: "Geheimhouding blijft relevant, ook bij tijdsdruk",
        ar: "السرية تبقى أساسية حتى في حالات ضغط الوقت",
      },
      qualityLevel: {
        nl: "Geschiktheidscheck vóór bevestiging van urgente inzet",
        ar: "فحص الملاءمة قبل تأكيد أي مهمة عاجلة",
      },
    },
  },
];

const teamPageContent = {
  nl: {
    metaTitle: "Team en verificatie | Arabisch ↔ Nederlands tolkencollectief",
    metaDescription:
      "Teamoverzicht en verificatiearchitectuur voor Arabisch-Nederlandse tolken met specialisaties, inzetgebieden en voorbereidbare registratiestatus.",
    hero: {
      eyebrow: "Team en verificatie",
      title: "Een teamstructuur die uitlegbaar, controleerbaar en schaalbaar is.",
      intro:
        "Deze pagina laat zien hoe het collectief de trust-laag opbouwt: niet als losse claim, maar als profielarchitectuur met taalrichting, specialisaties, inzetgebieden, verificatievelden en professionele kwaliteitsnotities.",
      highlights: [
        "Teamopzet voorbereid op individuele profielpagina’s.",
        "Verificatievelden voor Wbtv/Rbtv en formele inzetcontext.",
        "Geschreven voor opdrachtgevers die bewijs en geschiktheid willen toetsen.",
      ],
    },
    sections: {
      overview: {
        eyebrow: "Waarom deze pagina bestaat",
        title: "High-trust dienstverlening vraagt om zichtbare profielstructuur.",
        description:
          "Niet elke opdrachtgever wil alleen weten dát er een tolk beschikbaar is. In formele contexten wil men ook kunnen beoordelen of de inzet passend, controleerbaar en professioneel georganiseerd is.",
      },
      verification: {
        eyebrow: "Verificatie-architectuur",
        title: "Wat deze teamlaag zichtbaar maakt",
        description:
          "De huidige teamkaarten zijn bewust opgezet als groeibasis voor latere profielpagina’s en sectorspecifieke matches.",
        items: [
          "Naam en duidelijke taalrichting",
          "Specialisaties en inzetgebieden",
          "Aparte velden voor beëdigd/gecertificeerd of formeel verifieerbare inzet",
          "Voorbereide controlepunten voor Wbtv/Rbtv-context",
          "Kwaliteit, geheimhouding en geschiktheidsnotities per profiel",
        ],
      },
      growth: {
        eyebrow: "Voor latere groei",
        title: "Deze architectuur is klaar voor individuele profielpagina’s en sectorspecifieke landingspagina’s.",
        description:
          "De datastructuur is zo opgezet dat later profiel-URL’s, locaties, sectorspecialisaties en expliciete verificatiedetails kunnen worden toegevoegd zonder de teamlaag te vervangen.",
      },
    },
  },
  ar: {
    metaTitle: "الفريق والتحقق | مجموعة الترجمة الشفهية العربية الهولندية",
    metaDescription:
      "عرض الفريق وبنية التحقق لخدمات الترجمة الشفهية العربية الهولندية مع التخصصات ومجالات الاستخدام وحقول التحقق المهني.",
    hero: {
      eyebrow: "الفريق والتحقق",
      title: "بنية فريق قابلة للشرح والتحقق والتوسع.",
      intro:
        "توضح هذه الصفحة كيف تُبنى طبقة الثقة داخل الموقع: عبر ملفات مهنية واضحة تشمل اتجاه اللغة والتخصصات ومجالات الاستخدام وحقول التحقق والملاحظات المرتبطة بالجودة والمهنية.",
      highlights: [
        "الهيكل مهيأ للتوسع إلى صفحات ملفات فردية لاحقاً.",
        "حقول تحقق للسياقات الرسمية وWbtv/Rbtv.",
        "موجّه للجهات التي تريد فهماً أوضح لملاءمة المترجم المهني.",
      ],
    },
    sections: {
      overview: {
        eyebrow: "لماذا هذه الصفحة",
        title: "الخدمات عالية الثقة تحتاج إلى بنية ملفات مهنية ظاهرة.",
        description:
          "في السياقات الرسمية لا يكفي معرفة أن مترجماً ما متاح، بل يجب أن تكون الملاءمة المهنية وقابلية التحقق مفهومة بشكل واضح.",
      },
      verification: {
        eyebrow: "بنية التحقق",
        title: "ما الذي تكشفه هذه الطبقة من الفريق",
        description:
          "تم إعداد البطاقات الحالية كأساس قابل للنمو نحو ملفات فردية وتخصيصات قطاعية أكثر تفصيلاً.",
        items: [
          "الاسم واتجاه اللغة بشكل واضح",
          "التخصصات ومجالات الاستخدام",
          "حقول مستقلة للصفة المحلّفة أو القابلة للتحقق الرسمي",
          "نقاط تحقق مهيأة لسياقات Wbtv/Rbtv",
          "ملاحظات حول الجودة والسرية والملاءمة المهنية",
        ],
      },
      growth: {
        eyebrow: "جاهز للتوسع",
        title: "هذه البنية جاهزة لاحقاً لصفحات ملفات فردية وصفحات قطاعية ومحلية.",
        description:
          "تم تصميم البيانات بحيث يمكن إضافة عناوين ملفات ومناطق وتخصصات وتفاصيل تحقق لاحقاً دون إعادة بناء القسم كله.",
      },
    },
  },
} as const;

export function getTeamPageContent(locale: Locale) {
  return teamPageContent[locale];
}

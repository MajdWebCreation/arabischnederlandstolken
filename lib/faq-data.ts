import type { Locale } from "@/lib/site";

export type FaqItem = {
  question: string;
  answer: string;
  category: string;
};

const faqData = {
  nl: {
    metaTitle: "FAQ | Arabisch ↔ Nederlands tolkencollectief",
    metaDescription:
      "Veelgestelde vragen over aanvragen, spoed, beëdigde tolken, telefonische inzet, kosten, beschikbaarheid en professionele werkwijze.",
    hero: {
      eyebrow: "Veelgestelde vragen",
      title: "Heldere antwoorden voor opdrachtgevers die snel én zorgvuldig een tolk willen aanvragen.",
      intro:
        "Deze FAQ is opgezet voor citeerbare duidelijkheid. De antwoorden zijn compact, concreet en geschreven voor situaties waarin betrouwbaarheid, snelheid en formele context een rol spelen.",
      highlights: [
        "Antwoorden op aanvragen, spoed en inzetvormen.",
        "Duidelijke uitleg over beëdiging, verificatie en vertrouwelijkheid.",
        "Geschreven voor gemeente, zorg, advocatuur, rechtbank en IND-context.",
      ],
    },
    categories: [
      {
        title: "Aanvragen en beschikbaarheid",
        description:
          "Praktische vragen over planning, bereikbaarheid en informatie die nodig is voor een aanvraag.",
      },
      {
        title: "Spoed en inzetvorm",
        description:
          "Antwoorden over telefonische inzet, video, spoedaanvragen en formele afspraken.",
      },
      {
        title: "Verificatie en professionaliteit",
        description:
          "Toelichting op beëdiging, registratie, geheimhouding en kwaliteitsborging.",
      },
    ],
    items: [
      {
        category: "Aanvragen en beschikbaarheid",
        question: "Hoe vraag ik een Arabisch ↔ Nederlands tolk aan?",
        answer:
          "Stuur een aanvraag met datum, tijd, verwachte duur, sectorcontext en gewenste inzetvorm. Daarmee kan snel worden beoordeeld welke tolkvorm passend is en welke vervolgstap nodig is.",
      },
      {
        category: "Aanvragen en beschikbaarheid",
        question: "Wat moet ik meesturen bij een eerste aanvraag?",
        answer:
          "Minimaal nodig zijn datum, tijd, duur, contactvorm, locatie of onlinevorm en een korte omschrijving van de context, zoals gemeente, zorg, advocaat, rechtbank of IND.",
      },
      {
        category: "Aanvragen en beschikbaarheid",
        question: "Kan een opdrachtgever ook namens een cliënt of instelling een aanvraag doen?",
        answer:
          "Ja. Gemeenten, zorginstellingen, advocatenkantoren, begeleiders en andere professionals kunnen namens een cliënt of dossier een aanvraag doen, zolang de context duidelijk wordt meegegeven.",
      },
      {
        category: "Spoed en inzetvorm",
        question: "Is een spoedtolk Arabisch ↔ Nederlands mogelijk?",
        answer:
          "Ja, soms kan inzet dezelfde dag of op korte termijn mogelijk zijn. Stuur de exacte tijd, context en gewenste inzetvorm mee, zodat de beschikbaarheid direct kan worden beoordeeld.",
      },
      {
        category: "Spoed en inzetvorm",
        question: "Kan de tolk ook telefonisch of via video worden ingezet?",
        answer:
          "Ja. Telefonische en video-inzet zijn geschikt voor veel intake-, overleg- en proceduregesprekken. Bij formele of gevoelige afspraken kan inzet op locatie passender zijn.",
      },
      {
        category: "Spoed en inzetvorm",
        question: "Wanneer is een beëdigd tolk nodig?",
        answer:
          "Dat hangt af van de formele context en de eisen van de instantie of procedure. Bij juridische, officiële of dossierkritische situaties kan beëdigde inzet gewenst of vereist zijn.",
      },
      {
        category: "Verificatie en professionaliteit",
        question: "Hoe kan ik registratie of bevoegdheid controleren?",
        answer:
          "Binnen het collectief zijn beëdigde tolken beschikbaar die in een nationaal register zijn ingeschreven. Bij een formele opdracht wordt vooraf afgestemd welke status of kwalificatie vereist is.",
      },
      {
        category: "Verificatie en professionaliteit",
        question: "Wordt rekening gehouden met geheimhouding en professionele neutraliteit?",
        answer:
          "Ja. Gevoelige gesprekken vragen om zorgvuldige omgang met informatie, neutrale overdracht en duidelijke professionele grenzen. Deel bij een eerste e-mail alleen de informatie die nodig is om de opdracht te beoordelen.",
      },
      {
        category: "Verificatie en professionaliteit",
        question: "Is de dienst geschikt voor gemeente, zorg, advocaat, rechtbank en IND?",
        answer:
          "Ja. De website en de dienstpagina’s zijn juist opgezet rond die contexten, omdat daar taalondersteuning vaak direct invloed heeft op begrip, besluitvorming en dossierverloop.",
      },
      {
        category: "Verificatie en professionaliteit",
        question: "Staan kosten en beschikbaarheid vast op de website?",
        answer:
          "Nee, niet als generieke claim. Beschikbaarheid en inzet hangen af van datum, context, vorm en eventuele formele eisen. Daardoor is een concrete intake betrouwbaarder dan een losse vaste belofte.",
      },
    ],
  },
  ar: {
    metaTitle: "الأسئلة الشائعة | مجموعة الترجمة الشفهية العربية الهولندية",
    metaDescription:
      "إجابات واضحة حول الطلب والطوارئ والمترجم المحلّف والاستخدام الهاتفي والتحقق والسرية والتوافر.",
    hero: {
      eyebrow: "الأسئلة الشائعة",
      title: "إجابات مباشرة للجهات التي تريد إرسال طلب بسرعة لكن مع وضوح وثقة.",
      intro:
        "تم إعداد هذه الصفحة بصياغة مباشرة وقابلة للاقتباس. الإجابات قصيرة ومهنية وتناسب السياقات الرسمية والطبية والقانونية والهجرية.",
      highlights: [
        "تغطي الطلب والطوارئ وأشكال تقديم الخدمة.",
        "تشرح التحقق والتسجيل والسرية المهنية.",
        "مناسبة لسياقات البلدية والرعاية والمحاماة والمحاكم والهجرة.",
      ],
    },
    categories: [
      {
        title: "الطلب والتوافر",
        description: "أسئلة عملية حول بدء الطلب وما المعلومات المطلوبة أولاً.",
      },
      {
        title: "الطوارئ وشكل الجلسة",
        description: "إجابات حول الاستعجال والهاتف والفيديو والاجتماعات الرسمية.",
      },
      {
        title: "التحقق والمهنية",
        description: "توضيح حول المترجم المحلّف والسرية والجودة والسياقات الرسمية.",
      },
    ],
    items: [
      {
        category: "الطلب والتوافر",
        question: "كيف يمكن طلب مترجم شفهي عربي ↔ هولندي؟",
        answer:
          "أرسلوا تاريخ الاجتماع ووقته ومدته والسياق العام وطريقة الترجمة المطلوبة. بهذه المعلومات يمكن تقييم الطلب بسرعة وتحديد الخطوة التالية بوضوح.",
      },
      {
        category: "الطلب والتوافر",
        question: "ما الذي يجب إرساله في أول طلب؟",
        answer:
          "يُفضّل إرسال التاريخ والوقت والمدة ونوع الجلسة والمكان أو طريقة الاتصال مع وصف مختصر للسياق، مثل بلدية أو رعاية صحية أو محامٍ أو محكمة أو هجرة.",
      },
      {
        category: "الطلب والتوافر",
        question: "هل يمكن لجهة أو مهني أن يطلب الخدمة نيابة عن عميل؟",
        answer:
          "نعم. يمكن للبلديات أو المؤسسات الصحية أو المحامين أو المرافقين أو غيرهم تقديم الطلب نيابة عن عميل أو ملف محدد، بشرط توضيح السياق.",
      },
      {
        category: "الطوارئ وشكل الجلسة",
        question: "هل يمكن طلب مترجم طوارئ عربي ↔ هولندي؟",
        answer:
          "نعم، قد تتاح المهمة في اليوم نفسه أو خلال وقت قصير. أرسلوا الوقت الدقيق والسياق وشكل الجلسة المطلوب حتى يمكن تقييم التوافر مباشرة.",
      },
      {
        category: "الطوارئ وشكل الجلسة",
        question: "هل يمكن تقديم الخدمة هاتفياً أو عبر الفيديو؟",
        answer:
          "نعم. الهاتف والفيديو مناسبان لكثير من الاجتماعات التمهيدية أو الإجرائية، لكن بعض الحالات الرسمية أو الحساسة قد تتطلب حضوراً مباشراً.",
      },
      {
        category: "الطوارئ وشكل الجلسة",
        question: "متى تكون الحاجة إلى مترجم محلّف؟",
        answer:
          "ذلك يعتمد على متطلبات الجهة أو الإجراء. في السياقات القانونية أو الرسمية أو عالية الحساسية قد تكون الصفة المحلّفة مطلوبة أو مفضلة.",
      },
      {
        category: "التحقق والمهنية",
        question: "كيف يمكن التحقق من التسجيل أو الصفة المهنية؟",
        answer:
          "تضم المجموعة مترجمين محلّفين مسجلين في سجل وطني. في المهام الرسمية يتم الاتفاق مسبقاً على الصفة أو التأهيل المطلوب.",
      },
      {
        category: "التحقق والمهنية",
        question: "هل تؤخذ السرية والحياد المهني في الاعتبار؟",
        answer:
          "نعم. المحادثات الحساسة تتطلب تعاملاً مهنياً منضبطاً مع المعلومات ونقلاً محايداً وواضحاً للمعنى بين الطرفين.",
      },
      {
        category: "التحقق والمهنية",
        question: "هل الخدمة مناسبة للبلديات والرعاية الصحية والمحامين والمحاكم وIND؟",
        answer:
          "نعم. تم بناء الموقع ومحتواه تحديداً حول هذه السياقات لأن الحاجة فيها تكون غالباً رسمية أو حساسة أو مؤثرة على القرار والإجراء.",
      },
      {
        category: "التحقق والمهنية",
        question: "هل الأسعار والتوافر ثابتان على الموقع؟",
        answer:
          "لا على شكل ادعاء عام. التوافر وشكل الخدمة يعتمدان على التوقيت والسياق ومتطلبات الجهة، لذلك تبقى المعاينة الأولية الدقيقة أكثر مهنية من وعود عامة.",
      },
    ],
  },
} as const;

export function getFaqContent(locale: Locale) {
  return faqData[locale];
}

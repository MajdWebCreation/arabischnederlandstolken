import { organizationName, type Locale } from "@/lib/site";

const siteContent = {
  nl: {
    brand: {
      name: organizationName,
      tag: "Arabisch ↔ Nederlands",
    },
    navigation: {
      home: "Home",
      services: "Diensten",
      contact: "Contact",
    },
    actions: {
      bookNow: "Boek een tolkgesprek",
      viewServices: "Bekijk diensten",
      viewMainService: "Bekijk Arabisch ↔ Nederlands tolk",
    },
    footer: {
      title: "Professionele tolkondersteuning voor gesprekken die duidelijkheid vereisen.",
      description:
        "Fase 1 van de website is ingericht op vertrouwen, directe boekbaarheid, meertaligheid en semantische duidelijkheid voor zoekmachines en AI-systemen.",
      navigationTitle: "Navigatie",
      contactTitle: "Contact",
      contactNote: "Boekingen, terugbelverzoeken en intake via e-mail.",
      complianceNote:
        "Structuur voorbereid op verificatie van registratie, Wbtv- en Rbtv-context.",
    },
    home: {
      metaTitle:
        "Arabisch ↔ Nederlands tolk voor zorg, gemeente, recht en migratie",
      metaDescription:
        "Arabisch-Nederlands tolkencollectief voor professionele tolkdiensten in Nederland. Inzetbaar voor zorg, gemeente, advocatuur, rechtbank en IND.",
      eyebrow: "Professioneel Arabisch-Nederlands tolkencollectief",
      title:
        "Arabisch ↔ Nederlands tolken voor gesprekken waar duidelijkheid en vertrouwen tellen.",
      intro:
        "Heeft u een Arabisch-Nederlandse tolk nodig voor zorg, gemeente, advocatuur, rechtbank of migratie? Het collectief organiseert tolkondersteuning voor telefonische, video- en fysieke afspraken, met focus op heldere communicatie, verifieerbare kwaliteit en professionele omgang met vertrouwelijke informatie.",
      highlights: [
        "Inzetbaar voor gemeente, zorg, advocaat, rechtbank en IND-context.",
        "Telefonisch, via video of op locatie inzetbaar per afspraak.",
        "Voorbereid op verificatie van registratie, sectorervaring en geheimhouding.",
      ],
      proofPoints: [
        {
          kicker: "Boeken + bewijs",
          title: "Niet alleen beschikbaar, maar ook uitlegbaar en verifieerbaar.",
          description:
            "De site is opgezet rond boekbaarheid, bewijsblokken en heldere context. Dat maakt het makkelijker voor opdrachtgevers om snel te handelen en voor zoekmachines om de dienst goed te begrijpen.",
        },
        {
          kicker: "High trust",
          title: "Professionele inzet voor gesprekken met impact.",
          description:
            "De positionering is gericht op formele en gevoelige contexten waarin taal, vertrouwen en neutraliteit essentieel zijn: medische afspraken, gemeenteprocessen, juridische trajecten en migratiegesprekken.",
        },
        {
          kicker: "Meertalig",
          title: "NL en AR zijn vanaf de architectuur meegenomen.",
          description:
            "De route-opzet, metadata, canonicals en contentstructuur zijn vanaf fase 1 ingericht voor meertalige groei, inclusief voorbereiding op RTL voor Arabische pagina’s.",
        },
      ],
      answerFirst: {
        eyebrow: "Direct antwoord",
        title: "Wat doet dit collectief precies?",
        description:
          "De homepage beantwoordt eerst de kernvraag, voordat de bezoeker verder navigeert.",
        body:
          "Het collectief levert Arabisch ↔ Nederlands tolkdiensten voor gesprekken waarbij één partij Arabisch spreekt en de andere Nederlands. De inzet is bedoeld voor gesprekken die juridisch, medisch, administratief of persoonlijk belangrijk zijn. Daardoor staat niet alleen taalondersteuning centraal, maar ook betrouwbaarheid, voorbereiding en passende inzetvorm.",
      },
      sectors: [
        {
          title: "Gemeente en overheid",
          description:
            "Ondersteuning bij gesprekken over voorzieningen, aanvragen, sociale dienst, jeugd, participatie en overige gemeentelijke trajecten.",
        },
        {
          title: "Zorg en welzijn",
          description:
            "Tolkondersteuning voor huisarts, specialist, GGZ, ziekenhuis, wijkzorg en overige zorgcontacten waarin goede afstemming cruciaal is.",
        },
        {
          title: "Advocatuur en rechtbank",
          description:
            "Geschikt voor intakegesprekken, dossierbespreking, cliëntcommunicatie en juridische contexten waar interpretatie zorgvuldig moet verlopen.",
        },
        {
          title: "IND en migratie",
          description:
            "Inzetbaar voor gesprekken rondom verblijf, procedures, begeleiding en andere migratie- en integratiegerelateerde trajecten.",
        },
      ],
      bookingPanel: {
        eyebrow: "Direct boeken",
        title: "Wat hebben wij nodig om een passende tolk in te plannen?",
        description:
          "Een goede intake versnelt de inzet en helpt om de juiste tolkvorm te kiezen.",
        items: [
          "Datum, tijd en duur van het gesprek.",
          "Gesprekstype: telefonisch, video of op locatie.",
          "Korte context: zorg, gemeente, advocaat, rechtbank of IND.",
          "Eventuele wensen rond verificatie, geheimhouding of sectorervaring.",
        ],
      },
      serviceOverview: {
        eyebrow: "Fase 1 diensten",
        title: "Gebouwd voor uitbreiding, gestart met de kern.",
        description:
          "De informatiearchitectuur ondersteunt meteen verdere groei naar extra diensten en kennispagina’s.",
        cards: [
          {
            title: "Arabisch ↔ Nederlands tolk",
            description:
              "De belangrijkste dienstpagina voor directe boekaanvragen, contextuitleg, bewijsblokken en toepassingsgebieden.",
            href: "diensten/arabisch-nederlands-tolk",
            cta: "Bekijk dienst",
          },
          {
            title: "Beëdigd tolk",
            description:
              "Voorbereid als vervolgroute voor situaties waarin formele registratie, juridische context of aanvullende verificatie centraal staat.",
            status: "Voorbereid",
          },
          {
            title: "Spoedtolk",
            description:
              "Voorbereid als aparte insteek voor urgente aanvragen, bereikbaarheid buiten standaard planning en tijdkritische gesprekken.",
            status: "Voorbereid",
          },
          {
            title: "Kennisbank en FAQ",
            description:
              "Voorbereid als semantische groeilaag voor zoekvragen, AI-citeerbaarheid, antwoordpagina’s en interne linkstructuur.",
            status: "Voorbereid",
          },
        ],
      },
      process: {
        eyebrow: "Hoe boeken werkt",
        title: "Een duidelijke aanvraagroute verlaagt drempels en vergroot vertrouwen.",
        description:
          "De intake wordt in fase 1 bewust eenvoudig en professioneel gehouden.",
        steps: [
          {
            title: "Stuur de aanvraag in",
            description:
              "Geef datum, type gesprek, locatie of onlinevorm en een korte context mee zodat de inzet snel beoordeeld kan worden.",
          },
          {
            title: "Wij toetsen de inzet",
            description:
              "De aanvraag wordt afgestemd op taalrichting, gesprekstype, gewenste tolkvorm en de mate waarin verificatie of sectorervaring nodig is.",
          },
          {
            title: "U ontvangt een passende terugkoppeling",
            description:
              "De reactie is gericht op helderheid: wat mogelijk is, welke vorm passend is en welke vervolgstap nodig is om de boeking af te ronden.",
          },
        ],
      },
      faqPreview: {
        eyebrow: "Voorbereid op antwoordpagina’s",
        title: "Veelgestelde vragen worden vanaf de basis meegenomen.",
        description:
          "Deze thema’s keren later terug als aparte FAQ- en kennisbankpagina’s.",
        items: [
          {
            question: "Kan een Arabisch-Nederlandse tolk ook telefonisch worden ingezet?",
            answer:
              "Ja. De architectuur en copy houden expliciet rekening met telefonische inzet, video-inzet en fysieke afspraken, zodat bezoekers en zoekmachines direct begrijpen welke vormen mogelijk zijn.",
          },
          {
            question: "Is de dienst geschikt voor gemeente, zorg en juridische gesprekken?",
            answer:
              "Ja. Sectorcontexten zijn bewust onderdeel van de contentstructuur gemaakt om zowel vertrouwen als relevantie voor zoekvragen te vergroten.",
          },
          {
            question: "Wordt verificatie van registratie of Wbtv-context meegenomen?",
            answer:
              "Ja. De site bereidt expliciet voor op verificatie, zodat toekomstige uitbreiding naar beëdigde en formeel gereguleerde inzet logisch aansluit.",
          },
          {
            question: "Is de website al voorbereid op Arabische bezoekers?",
            answer:
              "Ja. Er is een afzonderlijke /ar-structuur met RTL-voorbereiding en Arabische contentbasis, zodat de meertalige uitbouw niet achteraf hoeft te worden ingepast.",
          },
        ],
      },
      cta: {
        eyebrow: "Direct vervolg",
        title: "Een tolkgesprek plannen of eerst de hoofdroute bekijken?",
        description:
          "De kernflow van de website is bewust eenvoudig: oriëntatie, bewijs, toepassingscontext en directe contactactie.",
      },
    },
    services: {
      metaTitle: "Diensten | Arabisch ↔ Nederlands tolkencollectief",
      metaDescription:
        "Overzicht van Arabisch-Nederlandse tolkdiensten voor overheid, zorg, advocatuur, rechtbank en migratie in Nederland.",
      eyebrow: "Dienstenoverzicht",
      title:
        "Tolkdiensten voor formele en gevoelige gesprekken in Nederland.",
      intro:
        "De dienstenarchitectuur is opgezet rond concrete zoekintenties en gebruikssituaties. De huidige fase focust op de belangrijkste dienstpagina, terwijl de structuur al klaarstaat voor beëdigde inzet, spoed, locaties, FAQ en kennisbankcontent.",
      highlights: [
        "Dienststructuur ingericht voor groei zonder herbouw.",
        "Logische interne links tussen homepage, diensten en contact.",
        "Sterke basis voor SEO, canonicals, hreflang en structured data.",
      ],
      liveServices: {
        eyebrow: "Nu beschikbaar",
        title: "Actieve routes in fase 1",
        description:
          "De eerste release concentreert zich op de hoofdvraag en de meest waarschijnlijke conversieroute.",
        cards: [
          {
            title: "Arabisch ↔ Nederlands tolk",
            description:
              "Hoofddienst voor boekingen, bewijsblokken, toepassingsgebieden, contactflow en voorbereidende FAQ-structuur.",
            href: "diensten/arabisch-nederlands-tolk",
            cta: "Open dienstpagina",
          },
          {
            title: "Contact en aanvraag",
            description:
              "Praktische route voor boekingen, terugbelverzoeken, WhatsApp-terugkoppeling en intake-informatie in één semantisch duidelijke contactpagina.",
            href: "contact",
            cta: "Open contactpagina",
          },
        ],
      },
      verification: {
        eyebrow: "Vertrouwen en bewijs",
        title: "Waarom deze opzet geschikt is voor high-trust dienstverlening",
        description:
          "De structuur laat niet alleen zien wat de dienst is, maar ook waarom deze geloofwaardig is.",
        items: [
          {
            title: "Verifieerbaarheid voorbereid",
            description:
              "De copy en structuur reserveren expliciet ruimte voor registraties, Wbtv/Rbtv-verwijzingen en toekomstig toetsbare profielinformatie.",
          },
          {
            title: "Context boven marketingtaal",
            description:
              "Elke pagina benoemt concrete gebruikssituaties zoals gemeente, zorg, advocaat, rechtbank en IND, zodat relevantie direct zichtbaar is.",
          },
          {
            title: "Answer-first semantiek",
            description:
              "H1’s, introblokken en sectiekoppen beantwoorden eerst de kernvraag van de bezoeker. Dat helpt voor mens, Google en AI-systemen.",
          },
        ],
      },
      future: {
        eyebrow: "Voorbereide groeilaag",
        title: "Routes die logisch als volgende uitbreiding kunnen landen",
        description:
          "De codebase en navigatiestructuur zijn al voorbereid op deze inhoudelijke verbreding.",
        cards: [
          {
            title: "Beëdigd tolk",
            description:
              "Aparte route voor formele registratiesituaties en juridische of officiële context waarin specifieke kwalificaties centraal staan.",
            status: "Route voorbereid",
          },
          {
            title: "Spoedtolk",
            description:
              "Aparte route voor urgente aanvragen, snelle triage en beschikbaarheidscommunicatie.",
            status: "Route voorbereid",
          },
          {
            title: "Team en verificatie",
            description:
              "Groeipagina’s voor profieluitleg, collectiefopzet en controleerbare achtergrondinformatie.",
            status: "Route voorbereid",
          },
          {
            title: "Locaties",
            description:
              "Toekomstige lokale landingspagina’s voor steden, regio’s en sectorcontexten.",
            status: "Route voorbereid",
          },
          {
            title: "FAQ",
            description:
              "Specifieke antwoordpagina’s voor veelgestelde vragen en zoekintenties met hoge semantische waarde.",
            status: "Route voorbereid",
          },
          {
            title: "Kennisbank",
            description:
              "Contentlaag voor uitleg over inzetvormen, voorbereiding, procedure-context en AI-citeerbare antwoorden.",
            status: "Route voorbereid",
          },
        ],
      },
      cta: {
        eyebrow: "Volgende stap",
        title: "Bekijk de hoofdroute of plan direct een aanvraag.",
        description:
          "Voor fase 1 is de conversiestroom bewust compact gehouden: diensten begrijpen, hoofdroute openen en direct contact opnemen.",
      },
    },
    mainService: {
      metaTitle: "Arabisch ↔ Nederlands tolk boeken in Nederland",
      metaDescription:
        "Arabisch-Nederlandse tolk voor zorg, gemeente, advocatuur, rechtbank en migratie. Telefonisch, via video of op locatie inzetbaar.",
      eyebrow: "Belangrijkste dienst",
      title: "Arabisch ↔ Nederlands tolk voor gesprekken met juridische, medische of bestuurlijke impact.",
      intro:
        "Deze dienst is bedoeld voor gesprekken waarin Arabisch en Nederlands direct en zorgvuldig moeten worden overgebracht. De route is opgezet voor opdrachtgevers die snel willen boeken, maar óók willen zien waarom de inzet professioneel, passend en verifieerbaar is.",
      highlights: [
        "Voor formele, gevoelige en impactvolle gesprekken.",
        "Geschikt voor telefonisch, video en fysieke inzet.",
        "Gebouwd rond boekbaarheid, context en bewijs.",
      ],
      answerFirst: {
        eyebrow: "Direct antwoord",
        title: "Wanneer kiest u voor een Arabisch ↔ Nederlands tolk?",
        description:
          "De dienstpagina opent met de kernvraag die een opdrachtgever doorgaans heeft.",
        body:
          "U kiest deze dienst wanneer een gesprek inhoudelijk belangrijk genoeg is om misverstanden te voorkomen en beide talen volledig tot hun recht moeten komen. Denk aan gesprekken over gezondheid, rechten, verblijf, procedures, begeleiding of overheidszaken. Daarom combineert deze pagina praktische boekinformatie met duidelijke uitleg over betrouwbaarheid en inzetbaarheid.",
      },
      modes: [
        {
          title: "Telefonisch",
          description:
            "Geschikt voor intake, overleg, doorvragen en situaties waarin snelheid en bereikbaarheid belangrijker zijn dan fysieke aanwezigheid.",
        },
        {
          title: "Video",
          description:
            "Handig wanneer partijen elkaar visueel moeten zien, maar locatie niet praktisch of noodzakelijk is.",
        },
        {
          title: "Op locatie",
          description:
            "Passend bij gesprekken met hoge gevoeligheid, meerdere deelnemers of formele setting waarbij aanwezigheid helpt.",
        },
        {
          title: "Voorbereid op spoed",
          description:
            "De inhoud en structuur benoemen spoed en bereikbaarheid al, zodat een toekomstige spoedroute logisch aansluit.",
        },
      ],
      proof: {
        eyebrow: "Bewijs en professionaliteit",
        title: "Wat opdrachtgevers op deze route meteen moeten kunnen toetsen",
        items: [
          "Duidelijke inzetcontext in plaats van vage marketingtaal.",
          "Ruimte voor verificatie van registratie of Wbtv-context.",
          "Aandacht voor geheimhouding, neutraliteit en professionele communicatie.",
          "Heldere keuze tussen telefonisch, video of op locatie.",
        ],
      },
      contexts: {
        eyebrow: "Toepassingsgebieden",
        title: "Gebouwd voor sectoren waarin taalgebruik direct gevolgen kan hebben.",
        description:
          "Door sectorcontext expliciet te maken, sluit de pagina beter aan op zoekintenties én opdrachtgeversvragen.",
        items: [
          {
            title: "Gemeente en sociaal domein",
            description:
              "Gesprekken over aanvraagprocedures, voorzieningen, begeleiding, jeugd, participatie en andere officiële trajecten.",
          },
          {
            title: "Zorg en medische communicatie",
            description:
              "Van huisarts en specialist tot GGZ en ziekenhuis: inzet voor gesprekken waarin nuance, begrip en vertrouwen belangrijk zijn.",
          },
          {
            title: "Advocaat en rechtbank",
            description:
              "Ondersteuning bij juridische voorbereiding, dossierbespreking, cliëntcontact en gesprekssituaties waarin correcte interpretatie essentieel is.",
          },
          {
            title: "IND en migratie",
            description:
              "Tolkondersteuning bij procedures, begeleidingsgesprekken en trajecten waarin terminologie, context en zorgvuldigheid belangrijk zijn.",
          },
        ],
      },
      booking: {
        eyebrow: "Hoe aanvragen werkt",
        title: "Van eerste aanvraag naar passende inzet in drie duidelijke stappen.",
        description:
          "De pagina ondersteunt snelle conversie zonder in te leveren op inhoudelijke duidelijkheid.",
        steps: [
          {
            title: "Geef context en inzetvorm door",
            description:
              "Stuur datum, tijd, sectorcontext en voorkeur voor telefonisch, video of locatie mee. Dat versnelt de beoordeling.",
          },
          {
            title: "Verificatie en geschiktheid worden meegewogen",
            description:
              "De inzet wordt afgestemd op de aard van het gesprek en op de vraag of extra verificatie of formele context meespeelt.",
          },
          {
            title: "U ontvangt een heldere terugkoppeling",
            description:
              "De respons richt zich op wat mogelijk is, welke inzetvorm passend is en welke vervolgstap nodig is voor bevestiging.",
          },
        ],
      },
      faq: {
        eyebrow: "Voorbereidende FAQ",
        title: "Vragen die deze route al direct beantwoordt",
        description:
          "Deze antwoorden helpen bezoekers, maar bouwen ook aan semantische duidelijkheid en toekomstige knowledge-content.",
        items: [
          {
            question: "Kan deze tolkdienst ook worden ingezet voor gesprekken met een gemeente of advocaat?",
            answer:
              "Ja. De dienst is expliciet ingericht voor gemeente, zorg, advocatuur, rechtbank en migratiecontexten waarin duidelijke en correcte interpretatie belangrijk is.",
          },
          {
            question: "Is telefonische of video-inzet mogelijk?",
            answer:
              "Ja. De pagina benoemt alle drie de hoofdvormen: telefonisch, via video en op locatie. Zo is de bezoeker niet afhankelijk van losse navraag om de basis te begrijpen.",
          },
          {
            question: "Wordt geheimhouding en professionele omgang meegenomen?",
            answer:
              "Ja. Vertrouwen, neutraliteit en zorgvuldige omgang met gevoelige inhoud zijn bewust als bewijsblok in de route opgenomen.",
          },
          {
            question: "Kan deze route later worden uitgebreid naar beëdigde of spoedinzet?",
            answer:
              "Ja. De URL-architectuur en contentopzet zijn daar al op voorbereid, zodat de site zonder structuurbreuk kan doorgroeien.",
          },
        ],
      },
      cta: {
        eyebrow: "Direct boeken",
        title: "Wilt u deze dienst inzetten voor een concreet gesprek?",
        description:
          "Gebruik de contactroute voor een directe aanvraag, terugbelverzoek of verdere afstemming over inzetvorm, context en verificatie.",
      },
    },
    contact: {
      metaTitle: "Contact | Arabisch ↔ Nederlands tolk aanvragen",
      metaDescription:
        "Neem contact op voor een Arabisch-Nederlandse tolk. Boek een gesprek, vraag een terugbelverzoek aan of stuur uw intake direct door.",
      eyebrow: "Contact en boeking",
      title: "Een Arabisch ↔ Nederlands tolk aanvragen met duidelijke intake en heldere opvolging.",
      intro:
        "De contactpagina is opgezet als praktische conversieroute. In plaats van losse contactgegevens zonder context, krijgt de bezoeker hier duidelijke manieren om een aanvraag te starten, een terugbelverzoek te doen of WhatsApp-terugkoppeling te vragen.",
      highlights: [
        "Gericht op boekbaarheid zonder onnodige frictie.",
        "Duidelijke intake voor zorg, gemeente, recht en migratie.",
        "Voorbereid op spoed, verificatie en sectorcontext.",
      ],
      primaryAction: "Stuur een directe aanvraag",
      secondaryAction: "Vraag een terugbelverzoek aan",
      directSubject: "Aanvraag Arabisch-Nederlands tolk",
      callbackSubject: "Terugbelverzoek Arabisch-Nederlands tolk",
      whatsAppSubject: "Verzoek WhatsApp-terugkoppeling tolkdienst",
      methods: {
        eyebrow: "Contactopties",
        title: "Kies de snelste route die past bij uw situatie.",
        description:
          "De CTA’s zijn geordend op concrete intentie, niet op losse contactkanalen.",
        items: [
          {
            kicker: "Boeking",
            title: "Direct een tolk aanvragen",
            description:
              "Voor concrete gesprekken met bekende datum, tijd en context. Gebruik dit wanneer u direct wilt plannen.",
            subject: "Aanvraag Arabisch-Nederlands tolk",
          },
          {
            kicker: "Terugbellen",
            title: "Vraag een terugbelverzoek aan",
            description:
              "Handig als u eerst kort wilt afstemmen over geschiktheid, inzetvorm of de gevoeligheid van het gesprek.",
            subject: "Terugbelverzoek Arabisch-Nederlands tolk",
          },
          {
            kicker: "WhatsApp",
            title: "Vraag een WhatsApp-terugkoppeling aan",
            description:
              "Geschikt voor snelle eerste afstemming wanneer u liever eerst kort schriftelijk contact heeft.",
            subject: "Verzoek WhatsApp-terugkoppeling tolkdienst",
          },
        ],
      },
      intake: {
        eyebrow: "Wat meesturen",
        title: "Welke informatie helpt om snel de juiste inzet te bepalen?",
        description:
          "Hoe duidelijker de intake, hoe sneller de terugkoppeling en hoe kleiner de kans op misverstanden.",
        items: [
          "Datum, tijd en verwachte duur van het gesprek.",
          "Gesprekscontext: gemeente, zorg, advocaat, rechtbank, IND of anders.",
          "Voorkeur voor telefonisch, video of op locatie.",
          "Eventuele spoed of gewenste reactietermijn.",
          "Bijzondere vereisten rond registratie, verificatie of vertrouwelijkheid.",
        ],
      },
      response: {
        eyebrow: "Wat u terugkrijgt",
        title: "De opvolging is ingericht op duidelijkheid en vertrouwen.",
        description:
          "De contactflow maakt meteen duidelijk wat de vervolgstap wordt.",
        items: [
          {
            title: "Passende inzetvorm",
            description:
              "U hoort of telefonisch, video of fysieke inzet het meest passend is voor het type gesprek.",
          },
          {
            title: "Contextuele beoordeling",
            description:
              "De aanvraag wordt gelezen vanuit sector, gevoeligheid en gewenste mate van verificatie.",
          },
          {
            title: "Heldere vervolgstap",
            description:
              "Geen onduidelijke tussenstappen, maar een concrete reactie die richting geeft aan planning of nadere afstemming.",
          },
          {
            title: "Ruimte voor spoed",
            description:
              "De inhoud van de contactpagina houdt expliciet rekening met situaties waarin snelheid een rol speelt.",
          },
        ],
      },
      sectors: {
        eyebrow: "Voor wie",
        title: "Deze contactroute is geschikt voor verschillende opdrachtgevers en contexten.",
        description:
          "Niet alleen eindgebruikers, maar ook instellingen en professionals kunnen via dezelfde duidelijke intake starten.",
        items: [
          {
            title: "Gemeente",
            description:
              "Voor gesprekken binnen sociaal domein, aanvragen, voorzieningen en andere formele gemeentelijke trajecten.",
          },
          {
            title: "Zorg",
            description:
              "Voor huisarts, specialist, GGZ, ziekenhuis en andere zorginstellingen waar heldere taaloverdracht nodig is.",
          },
          {
            title: "Advocaat / rechtbank",
            description:
              "Voor juridische voorbereiding, cliëntcontact of andere gesprekken waar zorgvuldigheid belangrijk is.",
          },
          {
            title: "IND / migratie",
            description:
              "Voor trajecten rond verblijf, procedure, begeleiding en andere migratiegerelateerde contactmomenten.",
          },
        ],
      },
      cta: {
        eyebrow: "Klaar om te starten",
        title: "Gebruik de contactroute die past bij uw aanvraag.",
        description:
          "De fase-1 site is gericht op directe actie: aanvragen, teruggebeld worden of een WhatsApp-terugkoppeling laten starten.",
      },
    },
  },
  ar: {
    brand: {
      name: "مجموعة الترجمة الشفهية العربية الهولندية",
      tag: "العربية ↔ الهولندية",
    },
    navigation: {
      home: "الرئيسية",
      services: "الخدمات",
      contact: "التواصل",
    },
    actions: {
      bookNow: "احجز مترجماً شفهياً",
      viewServices: "اعرض الخدمات",
      viewMainService: "خدمة العربية ↔ الهولندية",
    },
    footer: {
      title: "دعم ترجمة شفهية مهني للمحادثات التي تحتاج إلى وضوح وثقة.",
      description:
        "المرحلة الأولى من الموقع مبنية على الثقة وسهولة الحجز والبنية متعددة اللغات مع وضوح دلالي مناسب لمحركات البحث وأنظمة الذكاء الاصطناعي.",
      navigationTitle: "التنقل",
      contactTitle: "التواصل",
      contactNote: "طلبات الحجز وطلبات الاتصال والمتابعة تتم عبر البريد الإلكتروني.",
      complianceNote:
        "تم إعداد البنية لاستيعاب التحقق من التسجيل والسياقات المرتبطة بـ Wbtv وRbtv.",
    },
    home: {
      metaTitle: "مترجم شفهي عربي ↔ هولندي للجهات الرسمية والرعاية والقانون",
      metaDescription:
        "خدمات ترجمة شفهية عربية هولندية في هولندا لقطاعات البلدية والرعاية الصحية والمحاماة والمحاكم والهجرة.",
      eyebrow: "مجموعة ترجمة شفهية عربية هولندية",
      title: "مترجمون شفهيون بالعربية والهولندية للمحادثات التي تتطلب دقة وثقة مهنية.",
      intro:
        "إذا كنتم بحاجة إلى مترجم شفهي عربي هولندي لاجتماع مع بلدية أو جهة رعاية أو محامٍ أو محكمة أو جهة هجرة، فهذه المنصة مهيأة لتوضيح الخدمة بسرعة وإظهار عناصر الثقة والتحقق وإتاحة التواصل المباشر للحجز.",
      highlights: [
        "مناسبة للسياقات البلدية والطبية والقانونية وسياقات الهجرة في هولندا.",
        "مهيأة لاستخدام هاتفي أو عبر الفيديو أو حضورياً حسب الحاجة.",
        "الهيكل يعرض بوضوح عناصر التحقق والسرية والاحترافية.",
      ],
      proofPoints: [
        {
          kicker: "الحجز + الإثبات",
          title: "الموقع لا يعرض الخدمة فقط، بل يشرح لماذا يمكن الوثوق بها.",
          description:
            "تم بناء الصفحات حول سهولة الحجز ووضوح السياق وعناصر الإثبات حتى يفهم الزائر ومحركات البحث طبيعة الخدمة بسرعة.",
        },
        {
          kicker: "ثقة مؤسسية",
          title: "مناسب لسياقات رسمية وحساسة.",
          description:
            "الاتجاه العام للموقع هادئ ورسمي وحديث ليتناسب مع البلديات والرعاية الصحية والمحامين والمحاكم والجهات الرسمية.",
        },
        {
          kicker: "متعدد اللغات",
          title: "المسار العربي مهيأ من البداية لاتجاه RTL.",
          description:
            "تم إعداد البنية التقنية والمحتوى العربي بشكل جاد حتى لا تكون إضافة العربية لاحقاً مجرد حل ترقيعي.",
        },
      ],
      answerFirst: {
        eyebrow: "إجابة مباشرة",
        title: "ما الذي تقدمه هذه المجموعة؟",
        description:
          "الصفحة الرئيسية تجيب مباشرة على السؤال الأساسي قبل أي تفاصيل أخرى.",
        body:
          "تقدم المجموعة خدمة الترجمة الشفهية بين العربية والهولندية للمحادثات التي يكون فيها الوضوح والحياد والدقة أموراً أساسية. ويشمل ذلك المحادثات المتعلقة بالرعاية الصحية والبلديات والمحامين والمحاكم والهجرة وغيرها من السياقات الرسمية أو الحساسة.",
      },
      sectors: [
        {
          title: "البلديات والجهات الحكومية",
          description:
            "للاجتماعات المتعلقة بالطلبات والإجراءات والخدمات الاجتماعية والتواصل الرسمي مع الجهات المحلية.",
        },
        {
          title: "الرعاية الصحية",
          description:
            "لدعم المحادثات مع الطبيب أو المستشفى أو الدعم النفسي أو غيرها من البيئات الطبية التي تتطلب دقة وفهماً كاملاً.",
        },
        {
          title: "المحاماة والمحاكم",
          description:
            "للاجتماعات القانونية وشرح الملفات والتواصل مع العميل في سياقات تحتاج إلى عناية خاصة في نقل المعنى.",
        },
        {
          title: "الهجرة وIND",
          description:
            "للسياقات المرتبطة بالإقامة والإجراءات الرسمية والمرافقة والتواصل المرتبط بالهجرة والاندماج.",
        },
      ],
      bookingPanel: {
        eyebrow: "بدء الحجز",
        title: "ما المعلومات التي تساعد على اختيار المترجم المناسب؟",
        description:
          "كلما كانت المعلومات الأولية أوضح، كانت المتابعة أسرع وأكثر دقة.",
        items: [
          "تاريخ ووقت ومدة الاجتماع.",
          "نوع الجلسة: هاتفي أو فيديو أو حضوري.",
          "السياق العام: بلدية أو رعاية أو محامٍ أو محكمة أو هجرة.",
          "أي متطلبات خاصة تتعلق بالتحقق أو السرية أو الخبرة القطاعية.",
        ],
      },
      serviceOverview: {
        eyebrow: "الخدمات في المرحلة الأولى",
        title: "الهيكل جاهز للتوسع، لكنه يبدأ بالخدمة الأساسية الأكثر أهمية.",
        description:
          "تم إعداد المعمارية لاستيعاب صفحات إضافية لاحقاً دون إعادة بناء الموقع من جديد.",
        cards: [
          {
            title: "مترجم شفهي عربي ↔ هولندي",
            description:
              "الصفحة الأساسية للحجز وتوضيح السياقات وعناصر الثقة وروابط التحويل الرئيسية.",
            href: "diensten/arabisch-nederlands-tolk",
            cta: "عرض الخدمة",
          },
          {
            title: "مترجم محلّف",
            description:
              "تم تجهيز البنية لاستقبال صفحة مستقلة لاحقاً للحالات التي تتطلب اعتماداً أو تحققاً رسمياً إضافياً.",
            status: "مُعدّ",
          },
          {
            title: "مترجم طوارئ",
            description:
              "تم تجهيز الموقع لمسار مستقل لاحقاً للطلبات العاجلة ولحالات الاستجابة السريعة.",
            status: "مُعدّ",
          },
          {
            title: "الأسئلة الشائعة والمعرفة",
            description:
              "تم إعداد البنية الدلالية لتوسيع الإجابات والصفحات المرجعية التي تسهّل الظهور في البحث والاقتباس عبر أنظمة الذكاء الاصطناعي.",
            status: "مُعدّ",
          },
        ],
      },
      process: {
        eyebrow: "كيف يتم الحجز",
        title: "مسار واضح يقلل التردد ويزيد الثقة.",
        description:
          "المرحلة الأولى تعتمد تدفقاً بسيطاً ومهنياً من الاستفسار إلى المتابعة.",
        steps: [
          {
            title: "أرسل الطلب",
            description:
              "أرسل التاريخ والوقت ونوع الجلسة والسياق العام حتى يمكن تقييم الطلب بسرعة.",
          },
          {
            title: "نراجع مدى ملاءمة الخدمة",
            description:
              "يتم النظر في اتجاه اللغة وطبيعة الاجتماع والحاجة إلى حضور أو فيديو أو هاتف ومستوى التحقق المطلوب.",
          },
          {
            title: "تصلك متابعة واضحة",
            description:
              "الرد يوضح ما هو ممكن وما هي الخطوة التالية المطلوبة لتأكيد الحجز أو استكمال التنسيق.",
          },
        ],
      },
      faqPreview: {
        eyebrow: "إعداد للأسئلة المتكررة",
        title: "تم تضمين الأسئلة الأساسية منذ البداية.",
        description:
          "هذه المحاور مهيأة لتتحول لاحقاً إلى صفحات FAQ ومقالات معرفة مستقلة.",
        items: [
          {
            question: "هل يمكن استخدام المترجم هاتفياً أو عبر الفيديو؟",
            answer:
              "نعم. تم ذكر أشكال الاستخدام الأساسية بوضوح حتى يفهم الزائر ومحركات البحث إمكانيات الخدمة مباشرة.",
          },
          {
            question: "هل الخدمة مناسبة للبلديات والرعاية الصحية والمحامين؟",
            answer:
              "نعم. تم إدراج هذه القطاعات بشكل صريح في بنية الصفحات لأنها تمثل حالات استخدام واقعية ومهمة.",
          },
          {
            question: "هل أُخذ جانب التحقق والتسجيل المهني في الاعتبار؟",
            answer:
              "نعم. تم إعداد المحتوى ليستوعب لاحقاً التحقق من التسجيل والسياقات المرتبطة بـ Wbtv/Rbtv.",
          },
          {
            question: "هل المسار العربي جاد أم مجرد ترجمة شكلية؟",
            answer:
              "المسار العربي بُني مع إعداد جاد لـ RTL ومحتوى أساسي مهني حتى يكون التوسع مستقبلاً منطقياً ومتسقاً.",
          },
        ],
      },
      cta: {
        eyebrow: "الخطوة التالية",
        title: "يمكنكم الآن الانتقال إلى الخدمة الأساسية أو بدء التواصل مباشرة.",
        description:
          "التدفق الأساسي للموقع واضح: فهم الخدمة، رؤية عناصر الثقة، ثم اتخاذ إجراء مباشر.",
      },
    },
    services: {
      metaTitle: "الخدمات | مجموعة الترجمة الشفهية العربية الهولندية",
      metaDescription:
        "صفحة خدمات الترجمة الشفهية العربية الهولندية في هولندا مع إعداد مهني للتوسع لاحقاً.",
      eyebrow: "صفحة الخدمات",
      title: "خدمات ترجمة شفهية مناسبة للسياقات الرسمية والحساسة.",
      intro:
        "تم بناء صفحة الخدمات على أساس نية البحث والاستخدام الفعلي، مع تركيز المرحلة الأولى على الخدمة الأساسية ومسار التواصل، مع جاهزية كاملة للتوسع لاحقاً نحو صفحات أكثر تخصصاً.",
      highlights: [
        "هيكل قابل للتوسع دون إعادة تنظيم كبيرة.",
        "روابط داخلية واضحة بين الصفحة الرئيسية والخدمات والتواصل.",
        "إعداد مناسب للكانونيكال وhreflang والبيانات المنظمة.",
      ],
      liveServices: {
        eyebrow: "المتاح الآن",
        title: "المسارات النشطة في المرحلة الأولى",
        description:
          "النسخة الأولى تركز على أكثر المسارات قابلية للتحويل إلى طلب فعلي.",
        cards: [
          {
            title: "مترجم شفهي عربي ↔ هولندي",
            description:
              "صفحة الخدمة الأساسية التي تجمع بين الشرح العملي والسياق والثقة ومسار الحجز المباشر.",
            href: "diensten/arabisch-nederlands-tolk",
            cta: "افتح صفحة الخدمة",
          },
          {
            title: "التواصل وبدء الطلب",
            description:
              "صفحة عملية لبدء الحجز أو طلب اتصال أو طلب متابعة عبر واتساب ضمن بنية واضحة ومهنية.",
            href: "contact",
            cta: "افتح صفحة التواصل",
          },
        ],
      },
      verification: {
        eyebrow: "الثقة والإثبات",
        title: "لماذا تبدو هذه البنية موثوقة من البداية",
        description:
          "الموقع لا يقول فقط ما الخدمة، بل يوضح أيضاً لماذا تبدو مناسبة وقابلة للتصديق.",
        items: [
          {
            title: "جاهزية للتحقق",
            description:
              "تم إعداد النصوص والبنية لاستقبال معلومات تسجيل أو اعتماد أو تحقق مهني بشكل منظم لاحقاً.",
          },
          {
            title: "سياق واقعي بدل الكلام التسويقي",
            description:
              "كل صفحة تربط الخدمة مباشرة بقطاعات حقيقية مثل البلدية والرعاية والمحامين والمحاكم والهجرة.",
          },
          {
            title: "بنية answer-first",
            description:
              "العناوين والافتتاحيات والأقسام تجيب أولاً على السؤال الأساسي للزائر، ما يدعم الفهم البشري والظهور الدلالي.",
          },
        ],
      },
      future: {
        eyebrow: "طبقة التوسع",
        title: "مسارات منطقية يمكن إضافتها لاحقاً دون تغيير البنية الأساسية",
        description:
          "تم إعداد الكود والتنقل والمحتوى ليستوعب هذه الصفحات مستقبلاً بشكل طبيعي.",
        cards: [
          {
            title: "مترجم محلّف",
            description:
              "صفحة مستقلة للحالات التي تتطلب اعتماداً أو تحققاً مهنياً أو قانونياً إضافياً.",
            status: "المسار مُعدّ",
          },
          {
            title: "مترجم طوارئ",
            description:
              "صفحة للطلبات العاجلة ومسارات الاستجابة السريعة.",
            status: "المسار مُعدّ",
          },
          {
            title: "الفريق والتحقق",
            description:
              "صفحات مستقبلية لتوضيح بنية المجموعة والخبرات والعناصر القابلة للتحقق.",
            status: "المسار مُعدّ",
          },
          {
            title: "المناطق",
            description:
              "صفحات مستقبلية للمدن والمناطق والسياقات المحلية.",
            status: "المسار مُعدّ",
          },
          {
            title: "الأسئلة الشائعة",
            description:
              "صفحات إجابات مركزة على أسئلة البحث ذات القيمة الدلالية العالية.",
            status: "المسار مُعدّ",
          },
          {
            title: "قاعدة المعرفة",
            description:
              "طبقة محتوى تشرح الاستخدام والتحضير والسياقات الإجرائية بطريقة قابلة للاقتباس.",
            status: "المسار مُعدّ",
          },
        ],
      },
      cta: {
        eyebrow: "الخطوة التالية",
        title: "انتقلوا إلى الخدمة الأساسية أو ابدؤوا الطلب مباشرة.",
        description:
          "النسخة الأولى تحافظ على مسار تحويل واضح ومهني دون تشتيت.",
      },
    },
    mainService: {
      metaTitle: "حجز مترجم شفهي عربي ↔ هولندي في هولندا",
      metaDescription:
        "خدمة مترجم شفهي عربي هولندي للاجتماعات الطبية والرسمية والقانونية والهجرية، هاتفياً أو عبر الفيديو أو حضورياً.",
      eyebrow: "الخدمة الأساسية",
      title: "مترجم شفهي عربي ↔ هولندي للمحادثات ذات الأثر القانوني أو الطبي أو الإداري.",
      intro:
        "هذه الصفحة مخصصة للحالات التي يجب فيها نقل المعنى بين العربية والهولندية بدقة وحياد ووضوح. لذلك تجمع الصفحة بين الشرح العملي وإشارات الثقة وإمكانية بدء الطلب بشكل مباشر.",
      highlights: [
        "مناسبة للمحادثات الحساسة والرسمية.",
        "مهيأة للهاتف والفيديو والحضور المباشر.",
        "بنية الصفحة تربط الحجز بالإثبات والسياق.",
      ],
      answerFirst: {
        eyebrow: "إجابة مباشرة",
        title: "متى تحتاجون إلى مترجم شفهي عربي ↔ هولندي؟",
        description:
          "تبدأ الصفحة من السؤال الأكثر واقعية لدى الجهة الطالبة.",
        body:
          "تحتاجون إلى هذه الخدمة عندما يكون مضمون المحادثة مهماً بما يكفي لتفادي الالتباس ويجب أن تكون اللغتان ممثلتين بدقة كاملة. وهذا يشمل المحادثات المتعلقة بالصحة والحقوق والإجراءات الرسمية والإقامة والتوجيه الشخصي وغيرها من السياقات الحساسة.",
      },
      modes: [
        {
          title: "هاتفياً",
          description:
            "مناسب عندما تكون السرعة أو سهولة الوصول أكثر أهمية من الحضور المادي.",
        },
        {
          title: "عبر الفيديو",
          description:
            "مفيد عندما يلزم وجود تواصل بصري بين الأطراف دون الحاجة إلى حضور فعلي.",
        },
        {
          title: "حضورياً",
          description:
            "مناسب للمحادثات الرسمية أو الحساسة أو متعددة الأطراف التي تستفيد من الحضور المباشر.",
        },
        {
          title: "جاهزية للطوارئ",
          description:
            "تم إدراج عنصر السرعة والطوارئ في البنية ليكون التوسع إلى صفحة مستقلة لاحقاً أمراً منطقياً.",
        },
      ],
      proof: {
        eyebrow: "عناصر الثقة",
        title: "ما الذي يجب أن يتمكن الزائر من التحقق منه مباشرة؟",
        items: [
          "وضوح الاستخدامات الفعلية للخدمة.",
          "إتاحة المساحة للتحقق من التسجيل والاعتماد لاحقاً.",
          "تأكيد السرية والحياد والسلوك المهني.",
          "وضوح أشكال التقديم: هاتف أو فيديو أو حضور مباشر.",
        ],
      },
      contexts: {
        eyebrow: "مجالات الاستخدام",
        title: "الخدمة مهيأة لسياقات قد يؤدي فيها سوء الفهم إلى آثار مباشرة.",
        description:
          "ربط الصفحة بسياقات عملية محددة يزيد الثقة والملاءمة الدلالية.",
        items: [
          {
            title: "البلدية والخدمات الاجتماعية",
            description:
              "للاجتماعات الرسمية المتعلقة بالطلبات والإجراءات والخدمات الاجتماعية والمتابعة الإدارية.",
          },
          {
            title: "الرعاية الصحية",
            description:
              "لدعم المحادثات بين المريض ومقدمي الرعاية في البيئات الطبية والنفسية والعلاجية.",
          },
          {
            title: "المحاماة والمحاكم",
            description:
              "لشرح الملفات والتحضير القانوني والتواصل مع العميل في سياقات تتطلب دقة عالية.",
          },
          {
            title: "الهجرة وIND",
            description:
              "لإجراءات الإقامة والمتابعة والهجرة وكل ما يتطلب نقلاً واضحاً للمعنى بين الطرفين.",
          },
        ],
      },
      booking: {
        eyebrow: "كيف يبدأ الطلب",
        title: "من الطلب الأول إلى الترتيب المناسب في ثلاث خطوات واضحة.",
        description:
          "المسار مصمم ليكون عملياً وسهل الفهم منذ الزيارة الأولى.",
        steps: [
          {
            title: "إرسال السياق والشكل المطلوب",
            description:
              "أرسلوا التاريخ والوقت والسياق ونوع الجلسة المطلوب حتى يمكن تقييم الطلب بشكل سريع.",
          },
          {
            title: "مراجعة الملاءمة والتحقق",
            description:
              "يتم النظر في طبيعة الاجتماع ومستوى الحساسية والحاجة إلى تحقق أو خبرة نوعية.",
          },
          {
            title: "متابعة واضحة",
            description:
              "تصلكم متابعة توضّح ما هو ممكن وما الخطوة التالية اللازمة لتأكيد الحجز.",
          },
        ],
      },
      faq: {
        eyebrow: "أسئلة أساسية",
        title: "أسئلة تجيب عنها الصفحة منذ الآن",
        description:
          "هذه الإجابات تبني الثقة وتؤسس لصفحات أسئلة ومعرفة أكثر تفصيلاً لاحقاً.",
        items: [
          {
            question: "هل يمكن استخدام هذه الخدمة للبلدية أو للرعاية الصحية أو للمحامي؟",
            answer:
              "نعم. الصفحة مبنية عمداً حول هذه السياقات لأنها تمثل الاستخدامات الأكثر واقعية وأهمية.",
          },
          {
            question: "هل الخدمة متاحة عبر الهاتف أو الفيديو؟",
            answer:
              "نعم. تم توضيح الأشكال الرئيسية الثلاثة للخدمة بوضوح: الهاتف والفيديو والحضور المباشر.",
          },
          {
            question: "هل أُخذ جانب السرية والمهنية في الاعتبار؟",
            answer:
              "نعم. عناصر الثقة في الصفحة تؤكد على الحياد والسرية والتعامل المهني مع المحتوى الحساس.",
          },
          {
            question: "هل يمكن لاحقاً توسيع الصفحة إلى خدمات محلّفة أو عاجلة؟",
            answer:
              "نعم. بنية العناوين والمسارات والمحتوى معدّة للتوسع دون كسر البنية الحالية.",
          },
        ],
      },
      cta: {
        eyebrow: "ابدأ الآن",
        title: "إذا كان لديكم اجتماع محدد، فابدؤوا الطلب عبر صفحة التواصل.",
        description:
          "تم إعداد مسار التواصل ليخدم الحجز المباشر أو طلب الاتصال أو طلب متابعة عبر واتساب.",
      },
    },
    contact: {
      metaTitle: "التواصل | طلب مترجم شفهي عربي ↔ هولندي",
      metaDescription:
        "ابدأ طلب مترجم شفهي عربي هولندي أو اطلب اتصالاً أو متابعة عبر واتساب من خلال صفحة تواصل واضحة ومهنية.",
      eyebrow: "التواصل والحجز",
      title: "بدء طلب مترجم شفهي عربي ↔ هولندي بطريقة واضحة ومنظمة.",
      intro:
        "تم تصميم صفحة التواصل كمسار عملي للحجز. فهي لا تعرض معلومات تواصل مبعثرة، بل تنظم نية الزائر: طلب مباشر، طلب اتصال، أو طلب متابعة عبر واتساب.",
      highlights: [
        "مبنية على نية واضحة للتحويل إلى طلب فعلي.",
        "مناسبة لسياقات البلدية والرعاية والقانون والهجرة.",
        "جاهزة لاستيعاب الاستعجال والتحقق والخصوصية.",
      ],
      primaryAction: "أرسل طلباً مباشراً",
      secondaryAction: "اطلب اتصالاً",
      directSubject: "طلب مترجم عربي هولندي",
      callbackSubject: "طلب اتصال بخصوص مترجم عربي هولندي",
      whatsAppSubject: "طلب متابعة عبر واتساب لخدمة الترجمة الشفهية",
      methods: {
        eyebrow: "خيارات التواصل",
        title: "اختر الطريقة الأنسب حسب حاجتكم الحالية.",
        description:
          "تم ترتيب الخيارات حسب نية الاستخدام الفعلية بدلاً من عرض وسائل التواصل بشكل عشوائي.",
        items: [
          {
            kicker: "حجز",
            title: "طلب مباشر",
            description:
              "مناسب عندما تكون تفاصيل الاجتماع معروفة وتريدون بدء التخطيط مباشرة.",
            subject: "طلب مترجم عربي هولندي",
          },
          {
            kicker: "اتصال",
            title: "طلب اتصال هاتفي",
            description:
              "مفيد إذا احتجتم أولاً إلى تنسيق قصير حول ملاءمة الخدمة أو شكل الترجمة الشفهية المناسب.",
            subject: "طلب اتصال بخصوص مترجم عربي هولندي",
          },
          {
            kicker: "واتساب",
            title: "طلب متابعة عبر واتساب",
            description:
              "مناسب كبداية مكتوبة سريعة قبل الانتقال إلى تنسيق أوسع أو طلب كامل.",
            subject: "طلب متابعة عبر واتساب لخدمة الترجمة الشفهية",
          },
        ],
      },
      intake: {
        eyebrow: "ما الذي يُفضّل إرساله",
        title: "ما المعلومات التي تساعد على المتابعة السريعة؟",
        description:
          "كلما كانت الرسالة الأولى أوضح، كان الرد أدق وأسرع.",
        items: [
          "تاريخ ووقت ومدة الاجتماع.",
          "السياق: بلدية أو رعاية صحية أو محامٍ أو محكمة أو هجرة أو غير ذلك.",
          "الطريقة المطلوبة: هاتف أو فيديو أو حضور مباشر.",
          "ما إذا كان الطلب عاجلاً أو يحتاج استجابة سريعة.",
          "أي متطلبات تتعلق بالتحقق أو السرية أو حساسية الموضوع.",
        ],
      },
      response: {
        eyebrow: "شكل المتابعة",
        title: "الرد مصمم ليكون واضحاً ومطمئناً.",
        description:
          "لا تترك الصفحة الزائر أمام تواصل غامض، بل تهيئ ما الذي سيحصل بعد الإرسال.",
        items: [
          {
            title: "تحديد الشكل المناسب",
            description:
              "سيتم توضيح ما إذا كان الهاتف أو الفيديو أو الحضور هو الخيار الأنسب.",
          },
          {
            title: "تقييم السياق",
            description:
              "يُنظر في طبيعة الاجتماع ودرجة الحساسية وما إذا كان هناك جانب تحقق أو تسجيل مهني مطلوب.",
          },
          {
            title: "خطوة تالية واضحة",
            description:
              "بدلاً من رد مبهم، يكون الهدف هو توضيح ما المطلوب بعد ذلك لتأكيد الطلب أو استكمال التنسيق.",
          },
          {
            title: "مساحة للطوارئ",
            description:
              "تم بناء الصفحة على افتراض أن بعض الطلبات تحتاج سرعة أو أولوية في المتابعة.",
          },
        ],
      },
      sectors: {
        eyebrow: "لمن هذه الصفحة",
        title: "هذه الصفحة مناسبة لأطراف مختلفة تطلب الخدمة.",
        description:
          "سواء كنتم أفراداً أو جهات أو مهنيين، فإن مسار البدء موحد وواضح.",
        items: [
          {
            title: "البلديات",
            description:
              "للاجتماعات الرسمية والخدمات الاجتماعية والإجراءات الإدارية.",
          },
          {
            title: "الرعاية الصحية",
            description:
              "للمستشفيات والأطباء والجهات الطبية والنفسية وسياقات العلاج والمتابعة.",
          },
          {
            title: "المحاماة / المحاكم",
            description:
              "للتواصل القانوني والتحضير للملفات والاجتماعات ذات الحساسية العالية.",
          },
          {
            title: "الهجرة / IND",
            description:
              "للسياقات المرتبطة بالإقامة والهجرة والمتابعة الرسمية.",
          },
        ],
      },
      cta: {
        eyebrow: "ابدأ الآن",
        title: "اختاروا طريقة التواصل المناسبة وابدؤوا الطلب.",
        description:
          "تم بناء النسخة الأولى لتدعم الحجز المباشر وطلب الاتصال وطلب المتابعة عبر واتساب ضمن مسار واحد واضح.",
      },
    },
  },
} as const;

export function getSiteContent(locale: Locale) {
  return siteContent[locale];
}

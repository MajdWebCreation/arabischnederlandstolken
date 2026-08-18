import { organizationName, type Locale } from "@/lib/site";

const siteContent = {
  nl: {
    brand: {
      name: organizationName,
      tag: "Arabisch-Nederlands",
    },
    navigation: {
      home: "Home",
      services: "Diensten",
      contact: "Contact",
    },
    actions: {
      bookNow: "Stuur een tolkaanvraag",
      viewServices: "Bekijk diensten",
      viewMainService: "Bekijk Arabisch-Nederlandse tolk",
    },
    footer: {
      title: "Professionele tolkondersteuning voor gesprekken die duidelijkheid vereisen.",
      description:
        "Het Arabisch-Nederlandse tolkencollectief ondersteunt gesprekken in zorg, overheid, recht en migratie. Gebruik het contactformulier om beschikbaarheid en de passende inzet af te stemmen.",
      navigationTitle: "Navigatie",
      contactTitle: "Contact",
      contactNote: "Aanvragen kunnen via het contactformulier worden ingediend.",
      complianceNote:
        "Voor formele opdrachten stemmen we vooraf af welke kwalificatie of registerinschrijving vereist is.",
    },
    privacy: {
      metaTitle:
        "Privacyverklaring | Arabisch Nederlands Tolkencollectief",
      metaDescription:
        "Lees welke persoonsgegevens deze website via het contactformulier verwerkt, waarvoor ze worden gebruikt en welke dienstverleners daarbij betrokken zijn.",
      eyebrow: "Privacy en persoonsgegevens",
      title: "Privacyverklaring",
      intro:
        "Deze verklaring legt in begrijpelijke taal uit welke gegevens via deze website worden verwerkt en wat daarmee gebeurt. Het is een praktische beschrijving van de huidige werkwijze, geen formeel juridisch advies.",
      overviewTitle: "In het kort",
      overviewItems: [
        "Gegevens worden gebruikt om uw tolkaanvraag te beoordelen en contact met u op te nemen.",
        "De website bewaart aanvragen niet in een eigen database.",
        "Formuliergegevens worden per e-mail verwerkt via Resend; de website wordt gehost door Vercel.",
        "Een niet-verzonden concept kan tijdelijk in sessionStorage van uw eigen browser worden bewaard.",
      ],
      navigationLabel: "Onderwerpen in deze verklaring",
      contactCta: "Neem contact op over privacy",
      sections: [
        {
          id: "gegevens",
          title: "Welke gegevens wij ontvangen",
          body: [
            "Via het contactformulier kunnen wij uw naam, e-mailadres, telefoonnummer indien ingevuld, organisatie indien ingevuld, aanvraagtype, context, taalrichting, inzetvorm, gewenste datum of tijd en uw bericht ontvangen.",
            "Wij ontvangen alleen de gegevens die u zelf invult en verstuurt. Er is geen gebruikersaccount en via deze website vindt geen betaling plaats.",
          ],
          items: [],
          showContact: false,
        },
        {
          id: "gebruik",
          title: "Waarvoor wij gegevens gebruiken",
          body: [
            "Wij gebruiken de gegevens om uw aanvraag te beoordelen, te bepalen welke vervolginformatie nodig is en contact met u op te nemen over een mogelijke tolkinzet.",
            "Het verborgen honeypotveld in het formulier wordt gebruikt om geautomatiseerde spam te beperken. Het is niet bedoeld om aanvullende persoonsgegevens van bezoekers te verzamelen.",
          ],
          items: [],
          showContact: false,
        },
        {
          id: "formulier-email",
          title: "Contactformulier en e-mail",
          body: [
            "Na verzending wordt de aanvraag via Resend naar het zakelijke ontvangadres gestuurd. De website slaat de aanvraag niet daarnaast op in een eigen database.",
            "E-mailberichten kunnen wel worden bewaard in de zakelijke mailbox en binnen de systemen van de betrokken e-maildienst, voor zover dat nodig is voor behandeling van de aanvraag en de normale werking van e-mail.",
          ],
          items: [],
          showContact: false,
        },
        {
          id: "bevestiging",
          title: "Automatische ontvangstbevestiging",
          body: [
            "Na succesvolle verzending van de aanvraag ontvangt u op het opgegeven e-mailadres een sobere automatische ontvangstbevestiging.",
            "Deze bevestiging bevat niet uw volledige aanvraag, berichtinhoud, telefoonnummer, organisatie, datum of andere inhoudelijke details uit het formulier.",
          ],
          items: [],
          showContact: false,
        },
        {
          id: "gevoelige-gegevens",
          title: "Geen onnodige gevoelige gegevens",
          body: [
            "Stuur via het formulier of per e-mail geen medische dossiers, BSN’s, processtukken of andere gevoelige documenten mee, tenzij daar later uitdrukkelijk en via een passende werkwijze om wordt gevraagd.",
            "Beschrijf in de eerste aanvraag alleen wat nodig is om de tolkvraag en de gewenste inzet te kunnen beoordelen.",
          ],
          items: [],
          showContact: false,
        },
        {
          id: "concepten",
          title: "Tijdelijke formulierconcepten",
          body: [
            "Tijdens het invullen kan een concept tijdelijk in sessionStorage van uw browser worden bewaard. Dit helpt voorkomen dat ingevoerde tekst bij een herlaadactie direct verloren gaat.",
            "Deze conceptgegevens blijven in uw eigen browseromgeving, worden na een succesvolle verzending verwijderd en verdwijnen normaal gesproken wanneer de betreffende browsersessie wordt afgesloten.",
          ],
          items: [],
          showContact: false,
        },
        {
          id: "bewaartermijn",
          title: "Bewaartermijn",
          body: [
            "Wij bewaren persoonsgegevens niet langer dan redelijkerwijs nodig is voor de behandeling en opvolging van de aanvraag, de eventuele uitvoering van een opdracht en toepasselijke administratieve of wettelijke verplichtingen.",
            "De precieze termijn kan afhangen van de aard van de aanvraag en van de vraag of daaruit een opdracht of verdere correspondentie ontstaat.",
          ],
          items: [],
          showContact: false,
        },
        {
          id: "dienstverleners",
          title: "Delen met dienstverleners",
          body: [
            "Vercel verzorgt de hosting van de website en Resend verwerkt de verzending van formuliermails en ontvangstbevestigingen. Deze dienstverleners verwerken technische gegevens en, waar nodig voor e-mailbezorging, de inhoud en adresgegevens van berichten.",
            "Andere verstrekking kan plaatsvinden wanneer dit nodig is om uw aanvraag uit te voeren of wanneer een wettelijke verplichting dit vereist.",
          ],
          items: [],
          showContact: false,
        },
        {
          id: "beveiliging",
          title: "Beveiliging",
          body: [
            "Wij nemen redelijke technische en organisatorische maatregelen om persoonsgegevens te beschermen. Geen website of e-mailsysteem kan echter absolute beveiliging garanderen.",
            "De waarschuwing om geen onnodige gevoelige gegevens te versturen is daarom een belangrijk onderdeel van een zorgvuldige intake.",
          ],
          items: [],
          showContact: false,
        },
        {
          id: "rechten",
          title: "Uw rechten",
          body: [
            "Afhankelijk van de toepasselijke privacywetgeving kunt u vragen om inzage, correctie of verwijdering van uw persoonsgegevens. Ook kunt u in bepaalde gevallen vragen om beperking van de verwerking of bezwaar maken.",
            "Een verzoek kan worden beperkt wanneer gegevens nog nodig zijn voor een wettelijke verplichting, een lopende aanvraag of de vaststelling, uitoefening of onderbouwing van rechten.",
          ],
          items: [],
          showContact: false,
        },
        {
          id: "contact",
          title: "Contact over privacy",
          body: [
            "Heeft u een vraag over uw gegevens of wilt u een privacyverzoek doen? Gebruik dan het contactformulier en vermeld dat uw bericht over privacy gaat. U kunt ook schrijven naar het zakelijke e-mailadres dat hieronder staat.",
          ],
          items: [],
          showContact: true,
        },
        {
          id: "wijzigingen",
          title: "Wijzigingen",
          body: [
            "Deze privacyverklaring kan worden aangepast wanneer de website, de gebruikte dienstverleners of de werkwijze veranderen. De actuele versie staat steeds op deze pagina.",
          ],
          items: [],
          showContact: false,
        },
      ],
    },
    terms: {
      metaTitle:
        "Algemene voorwaarden | Arabisch Nederlands Tolken",
      metaDescription:
        "Lees de algemene voorwaarden van Arabisch Nederlands Tolken voor het aanvragen en afnemen van tolkdiensten, inclusief betaling, annulering en het herroepingsrecht voor consumenten.",
      eyebrow: "Algemene voorwaarden",
      title: "Algemene voorwaarden",
      intro:
        "Deze voorwaarden zijn geschreven in begrijpelijke taal en leggen uit hoe een tolkopdracht via Arabisch Nederlands Tolken tot stand komt, wat u van ons mag verwachten en wat wij van u nodig hebben. Ze gelden voor iedere opdracht die via ons wordt aangevraagd of uitgevoerd.",
      versionLabel: "Versie 2026-08",
      lastUpdatedLabel: "Laatst bijgewerkt: 18 augustus 2026",
      overviewTitle: "In het kort",
      overviewItems: [
        "Arabisch Nederlands Tolken is uw contractpartij; wij schakelen voor de uitvoering een zelfstandige, professionele tolk in.",
        "Particuliere klanten betalen doorgaans vooraf; voor zakelijke klanten kan een betalingstermijn na de opdracht worden afgesproken.",
        "Valt de toegewezen tolk onverwacht uit, dan zoeken wij eerst naar een vervangende tolk die aan dezelfde eisen voldoet; lukt dat niet, dan krijgt u het betaalde bedrag voor de niet-geleverde dienst terug.",
        "Consumenten hebben in beginsel 14 dagen bedenktijd om een op afstand gesloten overeenkomst kosteloos te herroepen.",
      ],
      navigationLabel: "Artikelen in deze voorwaarden",
      contactCta: "Neem contact met ons op",
      sections: [
        {
          id: "definities",
          title: "1. Definities",
          body: [
            "In deze algemene voorwaarden wordt verstaan onder: Arabisch Nederlands Tolken (ook “wij”, “ons” of “ANT”): de opdrachtnemer die tolkdiensten organiseert en de contractpartij van de klant is.",
            "Klant: de natuurlijke persoon of rechtspersoon die een tolkopdracht aanvraagt of laat uitvoeren via Arabisch Nederlands Tolken.",
            "Consument: een klant die de overeenkomst aangaat voor doeleinden buiten zijn bedrijfs- of beroepsactiviteit.",
            "Tolk: de zelfstandige, professionele tolk die door Arabisch Nederlands Tolken wordt ingeschakeld om de daadwerkelijke tolkdienst te verrichten.",
            "Opdracht: de specifieke tolkopdracht zoals tussen klant en Arabisch Nederlands Tolken overeengekomen, inclusief datum, tijd, taalcombinatie, inzetvorm en eventuele bijzondere vereisten.",
            "Rbtv: het Register beëdigde tolken en vertalers, het officiële register voor beëdigde tolken en vertalers in Nederland.",
            "Overeenkomst: de overeenkomst tussen klant en Arabisch Nederlands Tolken met betrekking tot het verzorgen van een of meer tolkdiensten.",
            "Website: arabischnederlandstolken.nl.",
          ],
          showContact: false,
        },
        {
          id: "toepasselijkheid",
          title: "2. Toepasselijkheid",
          body: [
            "Deze algemene voorwaarden zijn van toepassing op iedere aanvraag, offerte en overeenkomst tussen Arabisch Nederlands Tolken en een klant met betrekking tot tolkdiensten, tenzij schriftelijk anders is overeengekomen.",
            "Afwijkingen van deze voorwaarden gelden alleen wanneer deze uitdrukkelijk en schriftelijk tussen partijen zijn afgesproken, bijvoorbeeld in een offerte, opdrachtbevestiging of e-mailwisseling.",
            "Eigen inkoop- of andere algemene voorwaarden van de klant worden uitdrukkelijk van de hand gewezen, tenzij Arabisch Nederlands Tolken deze schriftelijk heeft aanvaard.",
            "Mocht een bepaling uit deze voorwaarden nietig of vernietigbaar blijken, dan blijven de overige bepalingen onverminderd van kracht. Partijen spannen zich in om een vervangende bepaling af te spreken die zo dicht mogelijk aansluit bij de strekking van de oorspronkelijke bepaling.",
          ],
          showContact: false,
        },
        {
          id: "totstandkoming",
          title: "3. Totstandkoming van de overeenkomst",
          body: [
            "Een overeenkomst komt pas tot stand nadat Arabisch Nederlands Tolken de opdracht schriftelijk heeft bevestigd, bijvoorbeeld per e-mail, of nadat wij met medeweten van de klant zijn begonnen met de uitvoering van de opdracht.",
            "Een aanvraag via het contactformulier op de website is een aanvraag tot het verkrijgen van een tolk, en dus nog geen bindende overeenkomst. Wij beoordelen de aanvraag, stemmen beschikbaarheid en eventuele aanvullende gegevens af, en bevestigen daarna de opdracht.",
            "Arabisch Nederlands Tolken kan een aanvraag afwijzen of aanvullende informatie vragen, bijvoorbeeld wanneer geen geschikte tolk beschikbaar is voor de gevraagde taalcombinatie, datum of vereiste kwalificatie.",
          ],
          showContact: false,
        },
        {
          id: "aanvragen-bevestiging",
          title: "4. Aanvragen en bevestiging van opdrachten",
          body: [
            "De klant verstrekt bij de aanvraag juiste en volledige informatie over onder meer datum, tijd, locatie of inzetvorm (telefonisch, video of op locatie), de gewenste taalcombinatie, de context van het gesprek en of een beëdigde tolk vereist is.",
            "Voor zover redelijkerwijs mogelijk bevestigt Arabisch Nederlands Tolken voorafgaand aan de uitvoering de relevante details van de opdracht, zoals datum en tijd, inzetvorm, verwachte duur en het geldende tarief, inclusief eventuele reiskosten.",
            "Bij spoedaanvragen kan de bevestiging vanwege de beperkte tijd kort voor of zelfs tijdens het regelen van de opdracht volgen. Wij informeren de klant in dat geval zo snel mogelijk over de relevante details.",
          ],
          showContact: false,
        },
        {
          id: "inzet-tolken-derden",
          title: "5. Inzet van tolken / derden",
          body: [
            "Arabisch Nederlands Tolken is en blijft de contractpartij van de klant voor de overeenkomst. Voor de daadwerkelijke uitvoering van een opdracht schakelen wij een zelfstandige, professionele tolk in, die als externe partij voor de opdracht wordt ingezet.",
            "Het inschakelen van een externe tolk ontslaat Arabisch Nederlands Tolken niet van haar verplichtingen jegens de klant uit hoofde van de overeenkomst.",
            "Wij selecteren een tolk op basis van de voor de opdracht opgegeven vereisten, zoals taalcombinatie, de eis van beëdiging of Rbtv-registratie, relevante specialisatie en beschikbaarheid.",
          ],
          showContact: false,
        },
        {
          id: "beedigde-tolken-rbtv",
          title: "6. Beëdigde tolken en Rbtv-informatie",
          body: [
            "Wanneer een opdracht een beëdigde tolk vereist, zetten wij een tolk in die aangeeft in het Rbtv geregistreerd te staan voor de betreffende taalcombinatie, op basis van de gegevens die bij ons bekend zijn en/of van openbaar beschikbare registerinformatie.",
            "Op verzoek kan aan de klant de naam en het Rbtv-registratienummer van de ingezette tolk worden verstrekt, zodat de klant dit zelfstandig kan verifiëren in het officiële register.",
            "Arabisch Nederlands Tolken verifieert de registratiestatus niet bij elke afzonderlijke opdracht opnieuw anders dan aan de hand van de bij ons bekende gegevens en/of het openbare register. Mocht een klant bij eigen verificatie een afwijking constateren, dan wordt de klant verzocht dit direct aan ons te melden.",
            "Arabisch Nederlands Tolken presenteert zichzelf, haar eigenaar of medewerkers niet als persoonlijk beëdigd tolk. De daadwerkelijke tolkdienst wordt verricht door de voor de opdracht ingezette, zelfstandige tolk.",
          ],
          showContact: false,
        },
        {
          id: "tarieven-bijkomende-kosten",
          title: "7. Tarieven en bijkomende kosten",
          body: [
            "Het voor een opdracht geldende tarief wordt voorafgaand aan de uitvoering in een offerte, opdrachtbevestiging of anderszins schriftelijk aan de klant kenbaar gemaakt.",
            "Tenzij anders vermeld, zijn alle tarieven exclusief btw.",
            "Bijkomende kosten, zoals reiskosten en kosten voor uitloop boven de gereserveerde duur, worden afzonderlijk in rekening gebracht conform de artikelen 8 en 9.",
          ],
          showContact: false,
        },
        {
          id: "reistijd-reiskosten",
          title: "8. Reistijd en reiskosten",
          body: [
            "Voor opdrachten op locatie kunnen reiskosten en, indien dit voor de opdracht is afgesproken, reistijd in rekening worden gebracht, tegen het tarief dat voor die specifieke opdracht is gecommuniceerd in de offerte of opdrachtbevestiging.",
            "Kosten voor bijvoorbeeld parkeren, openbaar vervoer of andere aan de locatie gebonden kosten worden alleen in rekening gebracht wanneer dit voor de betreffende opdracht is afgesproken of gecommuniceerd.",
            "Er geldt geen vast, voor alle opdrachten identiek reistarief; het toepasselijke bedrag hangt af van de specifieke opdracht en wordt vooraf kenbaar gemaakt.",
          ],
          showContact: false,
        },
        {
          id: "gereserveerde-duur-uitloop",
          title: "9. Gereserveerde duur en uitloop",
          body: [
            "Voor een opdracht wordt een verwachte duur gereserveerd, zoals gecommuniceerd of overeengekomen bij de bevestiging van de opdracht.",
            "Duurt de opdracht langer dan de gereserveerde duur, dan kan de extra tijd in rekening worden gebracht tegen het uurtarief voor uitloop dat in de offerte, opdrachtbevestiging of andere schriftelijke afspraak voor die opdracht is vermeld.",
            "De klant, of de contactpersoon ter plaatse, wordt gevraagd Arabisch Nederlands Tolken of de tolk zo mogelijk tijdig te laten weten wanneer verwacht wordt dat de gereserveerde duur zal worden overschreden.",
          ],
          showContact: false,
        },
        {
          id: "betaling",
          title: "10. Betaling",
          body: [
            "Facturen dienen te worden voldaan binnen de betalingstermijn die op de factuur of in de (schriftelijke) opdrachtbevestiging is vermeld.",
            "De artikelen 11 en 12 hieronder beschrijven de gebruikelijke betaalafspraken voor particuliere respectievelijk zakelijke klanten. In een individuele, schriftelijk vastgelegde afspraak kan hiervan worden afgeweken.",
          ],
          showContact: false,
        },
        {
          id: "betaling-particulier",
          title: "11. Betalingsvoorwaarden particuliere klanten",
          body: [
            "Voor particuliere klanten geldt in beginsel dat betaling plaatsvindt voordat de tolkopdracht wordt uitgevoerd, tenzij schriftelijk anders is overeengekomen.",
            "De uiterste betaaldatum wordt vermeld in de opdrachtbevestiging en/of op de factuur.",
            "Arabisch Nederlands Tolken kan de uitvoering van de opdracht afhankelijk stellen van tijdige betaling. Bij het uitblijven van tijdige betaling kunnen wij de opdracht uitstellen of annuleren; wij informeren de klant hierover zo mogelijk voorafgaand aan een dergelijke stap.",
          ],
          showContact: false,
        },
        {
          id: "betaling-zakelijk",
          title: "12. Betalingsvoorwaarden zakelijke klanten",
          body: [
            "Voor zakelijke klanten kan, indien dit is afgesproken, na levering van de dienst worden gefactureerd. Dit is geen automatisch recht van iedere zakelijke klant, maar wordt per klant of opdracht afgesproken.",
            "De op de factuur of in de schriftelijke opdrachtbevestiging vermelde betalingstermijn is van toepassing. Is voor een specifieke opdracht geen afwijkende termijn overeengekomen, dan geldt de standaardtermijn zoals op de factuur vermeld.",
            "Arabisch Nederlands Tolken kan, ook bij zakelijke klanten, voor specifieke opdrachten vooruitbetaling of een aanbetaling vragen, indien dit voor die opdracht is afgesproken.",
          ],
          showContact: false,
        },
        {
          id: "annulering-klant",
          title: "13. Annulering door de klant",
          body: [
            "De klant kan een bevestigde opdracht schriftelijk annuleren, bijvoorbeeld per e-mail, voorafgaand aan de afgesproken datum en tijd.",
            "Voor zover in verband met een late annulering annuleringskosten in rekening worden gebracht, hangt de hoogte daarvan af van hoe kort voor de opdracht wordt geannuleerd. De toepasselijke staffel of het toepasselijke percentage wordt in de offerte of opdrachtbevestiging van de betreffende opdracht vermeld, omdat dit per opdracht en per tolk kan verschillen.",
            "Dit artikel betreft de contractuele annulering van een opdracht. Voor het wettelijke herroepingsrecht van consumenten bij overeenkomsten op afstand, zie artikel 17.",
          ],
          showContact: false,
        },
        {
          id: "annulering-uitval-tolk",
          title: "14. Annulering of uitval van een tolk",
          body: [
            "Wanneer de voor een opdracht ingezette tolk onverwacht niet beschikbaar blijkt, bijvoorbeeld door ziekte of een noodsituatie, zoekt Arabisch Nederlands Tolken voor zover redelijkerwijs mogelijk naar een geschikte vervangende tolk.",
            "Vereist de opdracht een beëdigde tolk, dan voldoet ook de vervangende tolk aan die eis.",
            "Kan redelijkerwijs geen geschikte vervanger op tijd worden geregeld en kan de afgesproken dienst daardoor niet worden geleverd, dan worden reeds betaalde bedragen voor het niet-geleverde deel van de dienst aan de klant terugbetaald.",
            "Wij informeren de klant zo snel mogelijk wanneer zich een dergelijke situatie voordoet.",
          ],
          showContact: false,
        },
        {
          id: "vervangende-tolk",
          title: "15. Vervangende tolk",
          body: [
            "Wanneer Arabisch Nederlands Tolken conform artikel 14 een vervangende tolk inzet, gelden voor die vervangende tolk dezelfde voor de opdracht overeengekomen eisen als voor de oorspronkelijk ingezette tolk, waaronder de taalcombinatie, de eventuele eis van beëdiging of Rbtv-registratie en relevante specialisatie.",
            "De klant wordt, voor zover redelijkerwijs mogelijk, voorafgaand aan de opdracht geïnformeerd over de inzet van een vervangende tolk.",
          ],
          showContact: false,
        },
        {
          id: "niet-leveren-dienst",
          title: "16. Niet kunnen leveren van de dienst",
          body: [
            "Kan Arabisch Nederlands Tolken de overeengekomen dienst om welke reden dan ook niet leveren, bijvoorbeeld omdat geen geschikte of beschikbare tolk kan worden gevonden en ook geen vervanging als bedoeld in de artikelen 14 en 15 mogelijk blijkt, dan informeren wij de klant hierover zo snel mogelijk.",
            "Reeds betaalde bedragen voor de niet-geleverde dienst worden aan de klant terugbetaald.",
            "Onverminderd het bepaalde in artikel 21 (Aansprakelijkheid) is Arabisch Nederlands Tolken niet gehouden tot vergoeding van verdere schade die voortvloeit uit het niet kunnen leveren van de dienst.",
          ],
          showContact: false,
        },
        {
          id: "herroepingsrecht",
          title: "17. Herroepingsrecht voor consumenten",
          body: [
            "Dit artikel geldt uitsluitend voor klanten die als consument handelen, dat wil zeggen voor doeleinden buiten hun bedrijfs- of beroepsactiviteit, en die de overeenkomst op afstand zijn aangegaan, bijvoorbeeld via de website, telefonisch of per e-mail.",
            "Een consument heeft in beginsel het recht om de overeenkomst binnen 14 dagen na het sluiten daarvan, zonder opgave van redenen, kosteloos te herroepen.",
            "Om het herroepingsrecht uit te oefenen, volstaat een duidelijke schriftelijke verklaring aan Arabisch Nederlands Tolken, bijvoorbeeld per e-mail, waaruit blijkt dat de consument de overeenkomst herroept. Een tijdige verzending van deze verklaring binnen de bedenktijd is voldoende om aan de termijn te voldoen.",
            "De gevolgen van herroeping wanneer de dienstverlening al is gestart binnen de bedenktijd, zijn beschreven in artikel 18.",
            "Voor zover de wet dit toelaat en de daarvoor geldende voorwaarden zijn vervuld, kan het herroepingsrecht in bepaalde gevallen niet (meer) van toepassing zijn, met name wanneer de dienst volledig is uitgevoerd binnen de bedenktijd en aan de voorwaarden van artikel 18 is voldaan.",
          ],
          showContact: false,
        },
        {
          id: "start-dienstverlening-bedenktijd",
          title: "18. Start van dienstverlening binnen de bedenktijd",
          body: [
            "Interpretatieopdrachten vinden vaak plaats rond een concrete afspraak, zitting of ander moment op korte termijn, en kunnen daardoor al beginnen voordat de wettelijke bedenktijd van 14 dagen is verstreken.",
            "Wanneer een consument uitdrukkelijk verzoekt of ermee instemt dat de uitvoering van de dienst al binnen de bedenktijd start, en de consument vervolgens toch gebruikmaakt van het herroepingsrecht, kan de consument een bedrag verschuldigd zijn dat evenredig is aan het deel van de dienst dat op het moment van herroeping al is geleverd, berekend over de totaal overeengekomen prijs, voor zover dit wettelijk is toegestaan.",
            "Is de dienst volledig uitgevoerd binnen de bedenktijd, dan vervalt het herroepingsrecht alleen wanneer de uitvoering is gestart met voorafgaande uitdrukkelijke instemming van de consument, en de consument daarbij heeft erkend dat hij zijn herroepingsrecht verliest zodra de dienst volledig is uitgevoerd.",
            "Arabisch Nederlands Tolken vraagt deze uitdrukkelijke instemming en erkenning waar praktisch mogelijk voorafgaand aan een opdracht die binnen de bedenktijd start. Zolang deze instemming niet op een controleerbare manier is vastgelegd, gaan wij er niet van uit dat het herroepingsrecht om deze reden is vervallen.",
          ],
          showContact: false,
        },
        {
          id: "verplichtingen-klant",
          title: "19. Verplichtingen van de klant",
          body: [
            "De klant verstrekt juiste en volledige informatie die nodig is voor het uitvoeren van de opdracht, en meldt wijzigingen in datum, tijd of locatie zo spoedig mogelijk.",
            "Bij opdrachten op locatie zorgt de klant voor toegang tot de afgesproken locatie; bij telefonische of video-opdrachten zorgt de klant voor een bruikbare telefoon- of videoverbinding.",
            "De klant verstrekt relevante praktische informatie voor de uitvoering van de opdracht, zoals een contactpersoon ter plaatse indien van toepassing.",
            "De klant meldt Arabisch Nederlands Tolken zo spoedig mogelijk wanneer een zitting, afspraak of ander onderliggend moment waarvoor de tolk is ingepland, wordt geannuleerd of verzet.",
          ],
          showContact: false,
        },
        {
          id: "vertrouwelijkheid-privacy",
          title: "20. Vertrouwelijkheid en privacy",
          body: [
            "Van tolken wordt verwacht dat zij een opdracht professioneel en vertrouwelijk uitvoeren en, voor zover van toepassing, gebonden zijn aan relevante beroepsverplichtingen, zoals die voor in het Rbtv geregistreerde tolken gelden.",
            "Arabisch Nederlands Tolken kan absolute vertrouwelijkheid niet garanderen verder dan wat wettelijk en beroepsmatig van haar en de ingezette tolken kan worden verlangd.",
            "Voor de manier waarop Arabisch Nederlands Tolken zelf persoonsgegevens verwerkt, verwijzen wij naar onze privacyverklaring.",
          ],
          showContact: false,
        },
        {
          id: "aansprakelijkheid",
          title: "21. Aansprakelijkheid",
          body: [
            "Arabisch Nederlands Tolken is aansprakelijk voor schade die het rechtstreekse gevolg is van een toerekenbare tekortkoming in de uitvoering van de overeenkomst, voor zover die tekortkoming aan haar kan worden toegerekend en er een aantoonbaar oorzakelijk verband bestaat tussen de tekortkoming en de gestelde schade.",
            "Aansprakelijkheid voor indirecte schade, waaronder gevolgschade, gederfde winst, gemiste besparingen of schade door bedrijfsstagnatie, is uitgesloten, tenzij sprake is van opzet of bewuste roekeloosheid van Arabisch Nederlands Tolken.",
            "Niets in deze voorwaarden beperkt de aansprakelijkheid van Arabisch Nederlands Tolken voor schade als gevolg van opzet of bewuste roekeloosheid, voor schade door dood of letsel, of in andere gevallen waarin de wet een beperking of uitsluiting van aansprakelijkheid niet toestaat. Voor consumenten worden geen verdergaande beperkingen gehanteerd dan wettelijk is toegestaan.",
            "Deze bepaling laat wettelijke rechten van consumenten die niet bij overeenkomst kunnen worden uitgesloten of beperkt, onverlet.",
          ],
          showContact: false,
        },
        {
          id: "overmacht",
          title: "22. Overmacht",
          body: [
            "In geval van overmacht, waaronder in ieder geval wordt verstaan omstandigheden die de uitvoering van de opdracht redelijkerwijs onmogelijk maken en die niet aan Arabisch Nederlands Tolken kunnen worden toegerekend, is Arabisch Nederlands Tolken niet gehouden tot nakoming van de overeenkomst gedurende de periode dat de overmacht voortduurt.",
            "Duurt de overmachtsituatie langer dan redelijk kan worden verwacht, dan hebben beide partijen het recht de overeenkomst voor het niet-uitgevoerde deel te ontbinden, zonder dat een van beide partijen daardoor schadeplichtig wordt jegens de andere partij.",
            "Voor het reeds niet-geleverde deel van de dienst worden vooruitbetaalde bedragen aan de klant terugbetaald.",
          ],
          showContact: false,
        },
        {
          id: "klachten",
          title: "23. Klachten",
          body: [
            "Heeft de klant een klacht over de dienstverlening of de uitvoering van een opdracht, dan verzoeken wij de klant dit zo spoedig mogelijk, en voorzien van een duidelijke omschrijving, aan Arabisch Nederlands Tolken kenbaar te maken via de contactgegevens op de website.",
            "Wij streven ernaar klachten zorgvuldig te onderzoeken en binnen een redelijke termijn te reageren.",
            "Arabisch Nederlands Tolken is niet aangesloten bij een externe geschillencommissie. Komen klant en Arabisch Nederlands Tolken er onderling niet uit, dan geldt het bepaalde in artikel 25.",
          ],
          showContact: true,
        },
        {
          id: "wijziging-voorwaarden",
          title: "24. Wijziging van de voorwaarden",
          body: [
            "Arabisch Nederlands Tolken kan deze algemene voorwaarden van tijd tot tijd wijzigen. Gewijzigde voorwaarden gelden voor overeenkomsten die worden gesloten vanaf de datum waarop de gewijzigde versie op de website is gepubliceerd.",
            "Op een overeenkomst die vóór een wijziging tot stand is gekomen, blijven de voorwaarden van toepassing zoals die golden op het moment van totstandkoming van die overeenkomst, tenzij dwingend recht anders voorschrijft of partijen schriftelijk iets anders afspreken.",
            "Elke versie van deze voorwaarden is voorzien van een versie-aanduiding en een datum van laatste wijziging, zoals bovenaan deze pagina vermeld.",
          ],
          showContact: false,
        },
        {
          id: "toepasselijk-recht-geschillen",
          title: "25. Toepasselijk recht en geschillen",
          body: [
            "Op deze algemene voorwaarden en op iedere overeenkomst tussen Arabisch Nederlands Tolken en een klant is Nederlands recht van toepassing.",
            "Geschillen worden zo mogelijk in onderling overleg opgelost. Kan een geschil niet in onderling overleg worden opgelost, dan is de bevoegde Nederlandse rechter bevoegd hiervan kennis te nemen, met inachtneming van de wettelijke regels die de bevoegde rechter voor consumenten beschermen.",
          ],
          showContact: false,
        },
        {
          id: "contactgegevens",
          title: "26. Contactgegevens",
          body: [
            "Arabisch Nederlands Tolken",
            "Patrijzenweg 1, 1121 EX Landsmeer, Nederland",
            "KVK-nummer: 96175354",
            "Btw-identificatienummer: NL005193483B19",
            "Website: arabischnederlandstolken.nl",
          ],
          showContact: true,
        },
      ],
    },
    home: {
      metaTitle:
        "Arabisch-Nederlandse tolk voor zorg, gemeente, recht en migratie",
      metaDescription:
        "Arabisch-Nederlands tolkencollectief voor professionele tolkdiensten in Nederland. Inzetbaar voor zorg, gemeente, advocatuur, rechtbank en IND.",
      eyebrow: "Professioneel Arabisch-Nederlands tolkencollectief",
      title:
        "Arabisch-Nederlandse tolken voor gesprekken waar duidelijkheid en vertrouwen tellen.",
      intro:
        "Heeft u een Arabisch-Nederlandse tolk nodig voor zorg, gemeente, advocatuur, rechtbank of migratie? Het collectief organiseert tolkondersteuning voor telefonische, video- en fysieke afspraken, met focus op heldere communicatie, verifieerbare kwaliteit en professionele omgang met vertrouwelijke informatie.",
      highlights: [
        "Inzetbaar voor gemeente, zorg, advocaat, rechtbank en IND-context.",
        "Telefonisch, via video of op locatie inzetbaar per afspraak.",
        "Beschikbaarheid, context en vereiste kwalificatie worden vooraf afgestemd.",
      ],
      proofPoints: [
        {
          kicker: "Duidelijke aanvraag",
          title: "Vooraf helderheid over context, inzetvorm en beschikbaarheid.",
          description:
            "Stuur datum, tijd, duur en gesprekstype mee. Zo kan het collectief gericht beoordelen welke inzet passend en beschikbaar is.",
        },
        {
          kicker: "Professionele context",
          title: "Professionele inzet voor gesprekken met impact.",
          description:
            "De positionering is gericht op formele en gevoelige contexten waarin taal, vertrouwen en neutraliteit essentieel zijn: medische afspraken, gemeenteprocessen, juridische trajecten en migratiegesprekken.",
        },
        {
          kicker: "Meertalig",
          title: "Informatie beschikbaar in het Nederlands en Arabisch.",
          description:
            "Bezoekers kunnen de belangrijkste informatie en aanvraagroutes in beide talen bekijken.",
        },
      ],
      answerFirst: {
        eyebrow: "Direct antwoord",
        title: "Wat doet dit collectief precies?",
        description:
          "De homepage beantwoordt eerst de kernvraag, voordat de bezoeker verder navigeert.",
        body:
          "Het collectief levert Arabisch-Nederlandse tolkdiensten voor gesprekken waarbij één partij Arabisch spreekt en de andere Nederlands. De inzet is bedoeld voor gesprekken die juridisch, medisch, administratief of persoonlijk belangrijk zijn. Daardoor staat niet alleen taalondersteuning centraal, maar ook betrouwbaarheid, voorbereiding en passende inzetvorm.",
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
        eyebrow: "Aanvraag voorbereiden",
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
        eyebrow: "Tolkdiensten",
        title: "Kies de dienst die past bij uw gesprek.",
        description:
          "Het collectief ondersteunt algemene, formele en tijdkritische gesprekken, afhankelijk van beschikbaarheid en de vereiste kwalificatie.",
        cards: [
          {
            title: "Arabisch-Nederlandse tolk",
            description:
              "Voor telefonische, video- en fysieke gesprekken in onder meer zorg, overheid, recht en migratie.",
            href: "diensten/arabisch-nederlands-tolk",
            cta: "Bekijk dienst",
          },
        ],
      },
      process: {
        eyebrow: "Hoe aanvragen werkt",
        title: "Een duidelijke aanvraag helpt om snel de juiste inzet te beoordelen.",
        description:
          "De eerste afstemming verloopt via het contactformulier en richt zich op de praktische en inhoudelijke eisen van het gesprek.",
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
              "De reactie geeft aan wat mogelijk is, welke vorm passend is en welke vervolgstap nodig is om de aanvraag af te ronden.",
          },
        ],
      },
      faqPreview: {
        eyebrow: "Veelgestelde vragen",
        title: "Praktische antwoorden over inzet, kwalificatie en beschikbaarheid.",
        description:
          "Bekijk de belangrijkste aandachtspunten voordat u een aanvraag verstuurt.",
        items: [
          {
            question: "Kan een Arabisch-Nederlandse tolk ook telefonisch worden ingezet?",
            answer:
              "Ja. Telefonische inzet, video en afspraken op locatie zijn mogelijk, afhankelijk van de context en beschikbaarheid.",
          },
          {
            question: "Is de dienst geschikt voor gemeente, zorg en juridische gesprekken?",
            answer:
              "Ja. Sectorcontexten zijn bewust onderdeel van de contentstructuur gemaakt om zowel vertrouwen als relevantie voor zoekvragen te vergroten.",
          },
          {
            question: "Wordt verificatie van registratie of Wbtv-context meegenomen?",
            answer:
              "Ja. Voor formele opdrachten wordt vooraf afgestemd welke kwalificatie of registerinschrijving nodig is.",
          },
          {
            question: "Is informatie ook in het Arabisch beschikbaar?",
            answer:
              "Ja. De belangrijkste informatie over diensten, aanvraag en werkwijze is ook in het Arabisch beschikbaar.",
          },
        ],
      },
      cta: {
        eyebrow: "Direct vervolg",
        title: "Een tolkaanvraag sturen of eerst de diensten bekijken?",
        description:
          "Gebruik het contactformulier om datum, tijd, inzetvorm en korte context door te geven.",
      },
    },
    services: {
      metaTitle: "Diensten | Arabisch-Nederlands tolkencollectief",
      metaDescription:
        "Overzicht van Arabisch-Nederlandse tolkdiensten voor overheid, zorg, advocatuur, rechtbank en migratie in Nederland.",
      eyebrow: "Dienstenoverzicht",
      title:
        "Tolkdiensten voor formele en gevoelige gesprekken in Nederland.",
      intro:
        "Het collectief biedt Arabisch-Nederlandse tolkondersteuning voor uiteenlopende gesprekken. Beëdigde en tijdkritische inzet is mogelijk wanneer de vereiste kwalificatie en beschikbaarheid aansluiten op de opdracht.",
      highlights: [
        "Telefonisch, via video of op locatie, afhankelijk van de opdracht.",
        "Beëdigde tolken zijn beschikbaar voor opdrachten waar formele kwalificatie vereist is.",
        "Voor spoed kan inzet soms dezelfde dag of op korte termijn mogelijk zijn.",
      ],
      liveServices: {
        eyebrow: "Beschikbare diensten",
        title: "Tolkdiensten voor verschillende situaties",
        description:
          "Bekijk de algemene dienst of ga direct naar de aanvraagroute. Beschikbaarheid wordt altijd per opdracht bevestigd.",
        cards: [
          {
            title: "Arabisch-Nederlandse tolk",
            description:
              "Algemene tolkdienst voor gesprekken in zorg, overheid, recht, migratie en andere professionele contexten.",
            href: "diensten/arabisch-nederlands-tolk",
            cta: "Open dienstpagina",
          },
          {
            title: "Contact en aanvraag",
            description:
              "Gebruik het contactformulier om datum, tijd, inzetvorm en korte context door te geven.",
            href: "contact",
            cta: "Open contactpagina",
          },
        ],
      },
      verification: {
        eyebrow: "Zorgvuldige afstemming",
        title: "Wat vooraf wordt afgestemd bij een professionele tolkaanvraag",
        description:
          "Een passende inzet hangt af van de inhoud, setting, gewenste vorm en eventuele formele eisen.",
        items: [
          {
            title: "Kwalificatie bij formele inzet",
            description:
              "Wanneer een beëdigde of geregistreerde tolk nodig is, wordt dat vóór bevestiging bij de aanvraag betrokken.",
          },
          {
            title: "Context boven marketingtaal",
            description:
              "Elke pagina benoemt concrete gebruikssituaties zoals gemeente, zorg, advocaat, rechtbank en IND, zodat relevantie direct zichtbaar is.",
          },
          {
            title: "Heldere intake",
            description:
              "Datum, tijd, duur, sector en inzetvorm maken het mogelijk om beschikbaarheid en geschiktheid gericht te beoordelen.",
          },
        ],
      },
      future: {
        eyebrow: "Inzetvormen en context",
        title: "Welke vorm van tolkondersteuning past bij uw gesprek?",
        description:
          "De juiste keuze hangt af van urgentie, gevoeligheid, locatie en eventuele formele eisen.",
        cards: [
          {
            title: "Telefonisch of via video",
            description:
              "Praktisch voor intake, overleg en gesprekken waarbij deelnemers op afstand aansluiten.",
            status: "Inzetvorm",
          },
          {
            title: "Op locatie",
            description:
              "Geschikt voor gevoelige, formele of meerpartijenafspraken waarbij fysieke aanwezigheid wenselijk is.",
            status: "Inzetvorm",
          },
          {
            title: "Beëdigde inzet",
            description:
              "Voor opdrachten waar een beëdigde en in een nationaal register ingeschreven tolk vereist is.",
            status: "Formele context",
          },
          {
            title: "Spoed en korte termijn",
            description:
              "Inzet op dezelfde dag of binnenkort kan soms mogelijk zijn. Gebruik het contactformulier om beschikbaarheid te laten beoordelen.",
            status: "Afhankelijk van beschikbaarheid",
          },
          {
            title: "Zorg en overheid",
            description:
              "Voor gesprekken met gemeenten, zorgverleners en andere publieke of maatschappelijke organisaties.",
            status: "Sectorcontext",
          },
          {
            title: "Juridisch en migratie",
            description:
              "Voor gesprekken met advocaten, rechtbanken, IND en andere dossier- of proceduregebonden situaties.",
            status: "Sectorcontext",
          },
        ],
      },
      cta: {
        eyebrow: "Volgende stap",
        title: "Bekijk de hoofddienst of stuur direct een aanvraag.",
        description:
          "Vermeld in het contactformulier datum, tijd, context, gewenste inzetvorm en eventuele formele eisen.",
      },
    },
    mainService: {
      metaTitle: "Arabisch-Nederlandse tolk aanvragen in Nederland",
      metaDescription:
        "Arabisch-Nederlandse tolk voor zorg, gemeente, advocatuur, rechtbank en migratie. Telefonisch, via video of op locatie inzetbaar.",
      eyebrow: "Belangrijkste dienst",
      title: "Arabisch-Nederlandse tolk voor gesprekken met juridische, medische of bestuurlijke impact.",
      intro:
        "Deze dienst is bedoeld voor gesprekken waarin Arabisch en Nederlands direct en zorgvuldig moeten worden overgebracht. Stuur een aanvraag met de praktische gegevens van het gesprek, zodat beschikbaarheid, inzetvorm en eventuele formele eisen kunnen worden afgestemd.",
      highlights: [
        "Voor formele, gevoelige en impactvolle gesprekken.",
        "Geschikt voor telefonisch, video en fysieke inzet.",
        "Afstemming op beschikbaarheid, context en vereiste kwalificatie.",
      ],
      answerFirst: {
        eyebrow: "Direct antwoord",
        title: "Wanneer kiest u voor een Arabisch-Nederlandse tolk?",
        description:
          "De passende inzet hangt af van het gesprek, de gewenste vorm en eventuele formele eisen.",
        body:
          "U kiest deze dienst wanneer een gesprek inhoudelijk belangrijk genoeg is om misverstanden te voorkomen en beide talen volledig tot hun recht moeten komen. Denk aan gesprekken over gezondheid, rechten, verblijf, procedures, begeleiding of overheidszaken. Beschikbaarheid en de passende tolkvorm worden vooraf per aanvraag afgestemd.",
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
            title: "Spoed en korte termijn",
            description:
              "Inzet op dezelfde dag of binnenkort kan soms mogelijk zijn. Stuur de exacte tijd en context mee voor een haalbaarheidscheck.",
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
        eyebrow: "Veelgestelde vragen",
        title: "Vragen die deze route al direct beantwoordt",
        description:
          "Deze antwoorden geven vooraf duidelijkheid over inzetvorm, vertrouwelijkheid en formele opdrachten.",
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
            question: "Zijn beëdigde of urgente tolkaanvragen mogelijk?",
            answer:
              "Ja. Beëdigde tolken zijn beschikbaar voor formele opdrachten. Bij spoed kan inzet soms dezelfde dag of op korte termijn mogelijk zijn, afhankelijk van beschikbaarheid.",
          },
        ],
      },
      cta: {
        eyebrow: "Aanvraag sturen",
        title: "Wilt u deze dienst inzetten voor een concreet gesprek?",
        description:
          "Gebruik het contactformulier om datum, tijd, inzetvorm, context en eventuele formele eisen door te geven.",
      },
    },
    contact: {
      metaTitle: "Contact | Arabisch-Nederlandse tolk aanvragen",
      metaDescription:
        "Vraag een Arabisch-Nederlandse tolk aan via het contactformulier of per e-mail en geef datum, inzetvorm en context door.",
      eyebrow: "Contact en aanvraag",
      title: "Een Arabisch-Nederlandse tolk aanvragen met duidelijke intake en heldere opvolging.",
      intro:
        "Gebruik het aanvraagformulier of stuur een e-mail met datum, tijd, duur, inzetvorm en een korte omschrijving van de context. Daarmee kan het collectief beschikbaarheid en de passende kwalificatie gericht beoordelen.",
      highlights: [
        "Een duidelijk formulier met e-mail als zichtbare fallback.",
        "Duidelijke intake voor zorg, gemeente, recht en migratie.",
        "Ook voor beëdigde of urgente inzet, afhankelijk van beschikbaarheid.",
      ],
      primaryAction: "Vul het aanvraagformulier in",
      secondaryAction: "Vraag beschikbaarheid aan",
      directSubject: "Aanvraag Arabisch-Nederlands tolk",
      callbackSubject: "Vraag over Arabisch-Nederlandse tolkdienst",
      followUpSubject: "Vraag over Arabisch-Nederlandse tolkdienst",
      form: {
        eyebrow: "Aanvraagformulier",
        title: "Stuur de praktische gegevens van uw tolkaanvraag.",
        description:
          "Vul de bekende gegevens in. Een spoedkeuze geeft alleen aan dat snelheid belangrijk is en is geen garantie op beschikbaarheid.",
        requiredNote:
          "Naam, e-mail, soort aanvraag, context, taalrichting en bericht zijn verplicht.",
        optionalLabel: "(optioneel)",
        fields: {
          name: {
            label: "Naam",
            placeholder: "Uw naam",
          },
          email: {
            label: "E-mailadres",
            placeholder: "naam@organisatie.nl",
          },
          phone: {
            label: "Telefoonnummer",
            placeholder: "+31 6 12345678",
          },
          organization: {
            label: "Organisatie",
            placeholder: "Naam van uw organisatie",
          },
          requestType: {
            label: "Soort aanvraag",
            placeholder: "Kies het soort aanvraag",
            options: [
              { value: "regular", label: "Reguliere tolkaanvraag" },
              { value: "urgent", label: "Spoed aangeven" },
              { value: "sworn", label: "Beëdigde tolk gevraagd" },
              { value: "availability", label: "Beschikbaarheid navragen" },
              { value: "other", label: "Andere vraag" },
            ],
          },
          context: {
            label: "Context",
            placeholder: "Kies de context",
            options: [
              { value: "healthcare", label: "Zorg" },
              { value: "municipality", label: "Gemeente" },
              { value: "legal", label: "Juridisch" },
              { value: "migration", label: "Migratie / IND" },
              { value: "business", label: "Zakelijk" },
              { value: "other", label: "Anders" },
            ],
          },
          languageDirection: {
            label: "Taalrichting",
            placeholder: "Kies de taalrichting",
            options: [
              { value: "ar_to_nl", label: "Arabisch naar Nederlands" },
              { value: "nl_to_ar", label: "Nederlands naar Arabisch" },
              {
                value: "both_or_unknown",
                label: "Beide richtingen / nog onbekend",
              },
            ],
          },
          deliveryMode: {
            label: "Inzetvorm",
            placeholder: "Kies indien bekend",
            options: [
              { value: "phone", label: "Telefonisch" },
              { value: "video", label: "Video" },
              { value: "on_location", label: "Op locatie" },
              { value: "unknown", label: "Nog onbekend" },
            ],
          },
          desiredDateTime: {
            label: "Gewenste datum en tijd",
            placeholder: "Bijvoorbeeld 18 juni 2026 om 14:00",
          },
          message: {
            label: "Bericht",
            placeholder:
              "Omschrijf kort het gesprek, de verwachte duur en eventuele relevante vereisten.",
          },
        },
        submitLabel: "Verstuur aanvraag",
        submittingLabel: "Aanvraag wordt verstuurd…",
        fallbackText: "Werkt het formulier niet?",
        fallbackLabel: "Stuur uw aanvraag per e-mail.",
        privacyText:
          "Stuur geen medische dossiers, BSN’s, processtukken of andere onnodige gevoelige gegevens mee. Wij gebruiken uw gegevens alleen om uw aanvraag te beoordelen en contact met u op te nemen. Uw ingevulde gegevens blijven tijdelijk in deze browsertab bewaard zolang het formulier niet is verzonden.",
        privacyLinkLabel:
          "Lees hoe wij met uw gegevens omgaan in onze privacyverklaring.",
        termsText:
          "Op de opdracht die mogelijk uit uw aanvraag volgt, zijn onze algemene voorwaarden van toepassing.",
        termsLinkLabel: "Bekijk onze algemene voorwaarden.",
        messages: {
          success:
            "Dank u. Uw aanvraag is verzonden en wordt beoordeeld.",
          invalidSubmission:
            "Controleer de gemarkeerde velden en probeer het opnieuw.",
          generalError:
            "Verzenden is nu niet gelukt. Gebruik de e-maillink hieronder om uw aanvraag te versturen.",
        },
        validation: {
          nameRequired: "Vul uw naam in.",
          nameTooLong: "Uw naam mag maximaal 120 tekens bevatten.",
          emailRequired: "Vul uw e-mailadres in.",
          emailInvalid: "Vul een geldig e-mailadres in.",
          emailTooLong: "Het e-mailadres is te lang.",
          phoneTooLong:
            "Het telefoonnummer mag maximaal 40 tekens bevatten.",
          organizationTooLong:
            "De organisatienaam mag maximaal 160 tekens bevatten.",
          invalidOption: "Kies een geldige optie.",
          desiredDateTimeTooLong:
            "De gewenste datum en tijd mogen maximaal 120 tekens bevatten.",
          messageRequired: "Vul een bericht in.",
          messageTooShort: "Uw bericht moet minimaal 10 tekens bevatten.",
          messageTooLong: "Uw bericht mag maximaal 3000 tekens bevatten.",
        },
      },
      methods: {
        eyebrow: "Contactopties",
        title: "Welke aanvraag past bij uw situatie?",
        description:
          "Kies de route die het beste past. Elke optie brengt u naar hetzelfde contactformulier.",
        items: [
          {
            kicker: "Aanvraag",
            title: "Een tolkaanvraag starten",
            description:
              "Voor concrete gesprekken met bekende datum, tijd en context. Beschikbaarheid en planning worden daarna afgestemd.",
            subject: "Aanvraag Arabisch-Nederlands tolk",
          },
          {
            kicker: "Afstemming",
            title: "Beschrijf uw situatie",
            description:
              "Handig als u eerst wilt afstemmen over geschiktheid, inzetvorm of de gevoeligheid van het gesprek.",
            subject: "Vraag over Arabisch-Nederlandse tolkdienst",
          },
          {
            kicker: "Beschikbaarheid",
            title: "Vraag beschikbaarheid aan",
            description:
              "Stuur de datum, tijd en gewenste inzetvorm om te laten beoordelen wat mogelijk is.",
            subject: "Beschikbaarheidsvraag Arabisch-Nederlandse tolk",
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
        title: "Stuur uw aanvraag via het contactformulier.",
        description:
          "Vermeld datum, tijd, duur, context, inzetvorm en eventuele vereiste kwalificatie voor een gerichte reactie.",
      },
    },
  },
  ar: {
    brand: {
      name: "مجموعة الترجمة الشفهية العربية الهولندية",
      tag: "العربية والهولندية",
    },
    navigation: {
      home: "الرئيسية",
      services: "الخدمات",
      contact: "التواصل",
    },
    actions: {
      bookNow: "أرسل طلب مترجم شفهي",
      viewServices: "اعرض الخدمات",
      viewMainService: "خدمة الترجمة العربية الهولندية",
    },
    footer: {
      title: "دعم ترجمة شفهية مهني للمحادثات التي تحتاج إلى وضوح وثقة.",
      description:
        "تدعم مجموعة المترجمين الشفهيين المحادثات العربية الهولندية في مجالات الرعاية والجهات الرسمية والقانون والهجرة. استخدموا نموذج التواصل لتقييم التوافر والشكل المناسب.",
      navigationTitle: "التنقل",
      contactTitle: "التواصل",
      contactNote: "يمكن إرسال الطلبات عبر نموذج التواصل.",
      complianceNote:
        "في المهام الرسمية ننسق مسبقاً نوع التأهيل أو التسجيل المطلوب.",
    },
    privacy: {
      metaTitle:
        "بيان الخصوصية | مجموعة الترجمة الشفهية العربية الهولندية",
      metaDescription:
        "اطلعوا على البيانات الشخصية التي يعالجها الموقع عبر نموذج التواصل، وأغراض استخدامها، ومقدمي الخدمات المشاركين في المعالجة.",
      eyebrow: "الخصوصية والبيانات الشخصية",
      title: "بيان الخصوصية",
      intro:
        "يوضح هذا البيان بلغة مبسطة البيانات التي يعالجها هذا الموقع وكيفية التعامل معها. وهو وصف عملي لطريقة العمل الحالية، وليس استشارة قانونية رسمية.",
      overviewTitle: "الخلاصة",
      overviewItems: [
        "تُستخدم البيانات لتقييم طلب الترجمة الشفهية والتواصل معكم.",
        "لا يحفظ الموقع الطلبات في قاعدة بيانات خاصة به.",
        "تُرسل بيانات النموذج عبر البريد الإلكتروني بواسطة Resend، ويستضيف Vercel الموقع.",
        "قد تُحفظ مسودة غير مرسلة مؤقتاً في sessionStorage داخل متصفحكم.",
      ],
      navigationLabel: "موضوعات هذا البيان",
      contactCta: "تواصلوا معنا بشأن الخصوصية",
      sections: [
        {
          id: "gegevens",
          title: "البيانات التي نستلمها",
          body: [
            "قد نستلم عبر نموذج التواصل الاسم وعنوان البريد الإلكتروني ورقم الهاتف عند إدخاله واسم الجهة عند إدخاله ونوع الطلب والسياق واتجاه اللغة وطريقة تقديم الخدمة والتاريخ أو الوقت المطلوب والرسالة.",
            "نستلم فقط البيانات التي تدخلونها وترسلونها بأنفسكم. لا توجد حسابات مستخدمين ولا تتم أي مدفوعات عبر هذا الموقع.",
          ],
          items: [],
          showContact: false,
        },
        {
          id: "gebruik",
          title: "أغراض استخدام البيانات",
          body: [
            "نستخدم البيانات لتقييم الطلب وتحديد المعلومات الإضافية اللازمة والتواصل معكم بشأن إمكانية توفير خدمة الترجمة الشفهية.",
            "يُستخدم حقل honeypot المخفي في النموذج للحد من الرسائل الآلية المزعجة، وليس لجمع بيانات شخصية إضافية من الزوار.",
          ],
          items: [],
          showContact: false,
        },
        {
          id: "formulier-email",
          title: "نموذج التواصل والبريد الإلكتروني",
          body: [
            "بعد الإرسال يُنقل الطلب بواسطة Resend إلى عنوان البريد الإلكتروني التجاري. ولا يحفظ الموقع نسخة إضافية من الطلب في قاعدة بيانات خاصة به.",
            "قد تبقى رسائل البريد الإلكتروني محفوظة في صندوق البريد التجاري وفي أنظمة خدمة البريد المعنية بالقدر اللازم لمعالجة الطلب وتشغيل خدمة البريد بصورة اعتيادية.",
          ],
          items: [],
          showContact: false,
        },
        {
          id: "bevestiging",
          title: "تأكيد الاستلام التلقائي",
          body: [
            "بعد إرسال الطلب بنجاح، يصلكم على عنوان البريد الإلكتروني المدخل تأكيد استلام تلقائي ومختصر.",
            "لا يتضمن هذا التأكيد الطلب كاملاً ولا نص الرسالة أو رقم الهاتف أو اسم الجهة أو التاريخ أو أي تفاصيل موضوعية أخرى من النموذج.",
          ],
          items: [],
          showContact: false,
        },
        {
          id: "gevoelige-gegevens",
          title: "تجنب البيانات الحساسة غير الضرورية",
          body: [
            "يرجى عدم إرسال ملفات طبية أو أرقام BSN أو مستندات قضائية أو وثائق حساسة أخرى عبر النموذج أو البريد الإلكتروني، إلا إذا طُلب ذلك لاحقاً بصورة صريحة وبطريقة مناسبة.",
            "اكتفوا في الطلب الأول بالمعلومات اللازمة لتقييم الحاجة إلى الترجمة الشفهية وطريقة تقديم الخدمة المطلوبة.",
          ],
          items: [],
          showContact: false,
        },
        {
          id: "concepten",
          title: "مسودات النموذج المؤقتة",
          body: [
            "قد تُحفظ مسودة مؤقتاً أثناء تعبئة النموذج في sessionStorage داخل متصفحكم، وذلك للمساعدة في منع فقدان النص المدخل عند إعادة تحميل الصفحة.",
            "تبقى هذه المسودة في بيئة متصفحكم، وتُحذف بعد الإرسال الناجح، وتختفي عادةً عند انتهاء جلسة التصفح المعنية.",
          ],
          items: [],
          showContact: false,
        },
        {
          id: "bewaartermijn",
          title: "مدة الاحتفاظ",
          body: [
            "لا نحتفظ بالبيانات الشخصية مدة أطول مما يلزم بصورة معقولة لمعالجة الطلب ومتابعته وتنفيذ أي مهمة لاحقة والوفاء بالالتزامات الإدارية أو القانونية المطبقة.",
            "قد تختلف المدة الدقيقة بحسب طبيعة الطلب وما إذا نتجت عنه مهمة أو مراسلات إضافية.",
          ],
          items: [],
          showContact: false,
        },
        {
          id: "dienstverleners",
          title: "مشاركة البيانات مع مقدمي الخدمات",
          body: [
            "يتولى Vercel استضافة الموقع، بينما يعالج Resend إرسال رسائل النموذج وتأكيدات الاستلام. وقد يعالج هذان المزودان بيانات تقنية، وعند الحاجة لتسليم البريد، محتوى الرسائل وعناوينها.",
            "وقد تتم مشاركة أخرى عندما تكون ضرورية لتنفيذ الطلب أو للوفاء بالتزام قانوني.",
          ],
          items: [],
          showContact: false,
        },
        {
          id: "beveiliging",
          title: "الأمان",
          body: [
            "نتخذ تدابير تقنية وتنظيمية معقولة لحماية البيانات الشخصية، لكن لا يمكن لأي موقع أو نظام بريد إلكتروني أن يضمن أماناً مطلقاً.",
            "لذلك يشكل التنبيه بعدم إرسال بيانات حساسة غير ضرورية جزءاً مهماً من التعامل الحذر مع الطلب.",
          ],
          items: [],
          showContact: false,
        },
        {
          id: "rechten",
          title: "حقوقكم",
          body: [
            "بحسب قوانين الخصوصية المطبقة، يمكنكم طلب الاطلاع على بياناتكم الشخصية أو تصحيحها أو حذفها. وفي بعض الحالات يمكنكم طلب تقييد المعالجة أو الاعتراض عليها.",
            "قد يكون الطلب محدوداً إذا ظلت البيانات لازمة لالتزام قانوني أو طلب جارٍ أو لإثبات حقوق أو ممارستها أو الدفاع عنها.",
          ],
          items: [],
          showContact: false,
        },
        {
          id: "contact",
          title: "التواصل بشأن الخصوصية",
          body: [
            "إذا كان لديكم سؤال عن بياناتكم أو رغبتم في تقديم طلب متعلق بالخصوصية، فاستخدموا نموذج التواصل واذكروا أن الرسالة تتعلق بالخصوصية. ويمكنكم أيضاً الكتابة إلى عنوان البريد الإلكتروني التجاري المبين أدناه.",
          ],
          items: [],
          showContact: true,
        },
        {
          id: "wijzigingen",
          title: "التعديلات",
          body: [
            "قد نعدل بيان الخصوصية عندما يتغير الموقع أو مقدمو الخدمات أو طريقة العمل. وتبقى النسخة الحالية متاحة دائماً على هذه الصفحة.",
          ],
          items: [],
          showContact: false,
        },
      ],
    },
    home: {
      metaTitle: "مترجم شفهي عربي هولندي للجهات الرسمية والرعاية والقانون",
      metaDescription:
        "خدمات ترجمة شفهية عربية هولندية في هولندا لقطاعات البلدية والرعاية الصحية والمحاماة والمحاكم والهجرة.",
      eyebrow: "مجموعة ترجمة شفهية عربية هولندية",
      title: "مترجمون شفهيون بالعربية والهولندية للمحادثات التي تتطلب دقة وثقة مهنية.",
      intro:
        "إذا كنتم بحاجة إلى مترجم شفهي عربي هولندي لاجتماع مع بلدية أو جهة رعاية أو محامٍ أو محكمة أو جهة هجرة، فاستخدموا نموذج التواصل لإرسال تفاصيل الموعد وتقييم التوافر والشكل المناسب للمهمة.",
      highlights: [
        "مناسبة للسياقات البلدية والطبية والقانونية وسياقات الهجرة في هولندا.",
        "يمكن تقديمها هاتفياً أو عبر الفيديو أو حضورياً بحسب المهمة.",
        "يتم تنسيق التوافر والسياق والتأهيل المطلوب قبل تأكيد المهمة.",
      ],
      proofPoints: [
        {
          kicker: "طلب واضح",
          title: "وضوح مسبق حول السياق وشكل الجلسة والتوافر.",
          description:
            "أرسلوا التاريخ والوقت والمدة ونوع الجلسة حتى يمكن تقييم المترجم المناسب ومدى التوافر.",
        },
        {
          kicker: "ثقة مؤسسية",
          title: "مناسب لسياقات رسمية وحساسة.",
          description:
            "الاتجاه العام للموقع هادئ ورسمي وحديث ليتناسب مع البلديات والرعاية الصحية والمحامين والمحاكم والجهات الرسمية.",
        },
        {
          kicker: "متعدد اللغات",
          title: "المعلومات الأساسية متاحة بالعربية والهولندية.",
          description:
            "يمكن للزائر الاطلاع على الخدمات وطريقة الطلب والمعلومات الأساسية بكلتا اللغتين.",
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
        eyebrow: "إعداد الطلب",
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
        eyebrow: "خدمات الترجمة الشفهية",
        title: "اختاروا الخدمة التي تناسب طبيعة المحادثة.",
        description:
          "تتوفر خدمات عامة ورسمية وعاجلة بحسب التوافر والتأهيل المطلوب للمهمة.",
        cards: [
          {
            title: "مترجم شفهي عربي هولندي",
            description:
              "للمحادثات الهاتفية والمرئية والحضورية في الرعاية والجهات الرسمية والقانون والهجرة.",
            href: "diensten/arabisch-nederlands-tolk",
            cta: "عرض الخدمة",
          },
        ],
      },
      process: {
        eyebrow: "كيف يبدأ الطلب",
        title: "الطلب الواضح يساعد على تقييم المهمة بسرعة.",
        description:
          "يبدأ التنسيق عبر نموذج التواصل ويركز على المتطلبات العملية والمهنية للمحادثة.",
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
              "الرد يوضح ما هو ممكن وما هي الخطوة التالية المطلوبة لتأكيد الطلب أو استكمال التنسيق.",
          },
        ],
      },
      faqPreview: {
        eyebrow: "الأسئلة الشائعة",
        title: "إجابات عملية حول شكل الخدمة والتأهيل والتوافر.",
        description:
          "راجعوا أهم النقاط قبل إرسال الطلب.",
        items: [
          {
            question: "هل يمكن استخدام المترجم هاتفياً أو عبر الفيديو؟",
            answer:
              "نعم. الهاتف والفيديو والحضور المباشر ممكنة بحسب السياق والتوافر.",
          },
          {
            question: "هل الخدمة مناسبة للبلديات والرعاية الصحية والمحامين؟",
            answer:
              "نعم. هذه من السياقات المهنية التي يمكن للمجموعة دعمها بحسب التوافر والتأهيل المطلوب.",
          },
          {
            question: "هل أُخذ جانب التحقق والتسجيل المهني في الاعتبار؟",
            answer:
              "نعم. في المهام الرسمية يتم الاتفاق مسبقاً على التأهيل أو التسجيل المطلوب.",
          },
          {
            question: "هل المعلومات متاحة باللغة العربية؟",
            answer:
              "نعم. المعلومات الأساسية حول الخدمات وطريقة الطلب والعمل متاحة باللغة العربية.",
          },
        ],
      },
      cta: {
        eyebrow: "الخطوة التالية",
        title: "يمكنكم الاطلاع على الخدمة أو إرسال طلب عبر نموذج التواصل.",
        description:
          "أدخلوا التاريخ والوقت وشكل الجلسة والسياق المختصر لتقييم التوافر.",
      },
    },
    services: {
      metaTitle: "الخدمات | مجموعة الترجمة الشفهية العربية الهولندية",
      metaDescription:
        "خدمات ترجمة شفهية عربية هولندية في هولندا للمحادثات العامة والرسمية والعاجلة بحسب التوافر والتأهيل.",
      eyebrow: "صفحة الخدمات",
      title: "خدمات ترجمة شفهية مناسبة للسياقات الرسمية والحساسة.",
      intro:
        "تقدم المجموعة ترجمة شفهية عربية هولندية لمحادثات مختلفة. يمكن طلب مترجم محلّف أو مهمة عاجلة عندما يتوافق التأهيل المطلوب والتوافر مع طبيعة المهمة.",
      highlights: [
        "هاتفياً أو عبر الفيديو أو حضورياً بحسب المهمة.",
        "يتوفر مترجمون محلّفون مسجلون لمهام تتطلب صفة رسمية.",
        "قد تتاح المهام العاجلة في اليوم نفسه أو خلال وقت قصير.",
      ],
      liveServices: {
        eyebrow: "الخدمات المتاحة",
        title: "خدمات ترجمة شفهية لمواقف مختلفة",
        description:
          "اطلعوا على الخدمة العامة أو انتقلوا مباشرة إلى إرسال الطلب. يتم تأكيد التوافر لكل مهمة على حدة.",
        cards: [
          {
            title: "مترجم شفهي عربي هولندي",
            description:
              "خدمة عامة لمحادثات الرعاية والجهات الرسمية والقانون والهجرة وغيرها من السياقات المهنية.",
            href: "diensten/arabisch-nederlands-tolk",
            cta: "افتح صفحة الخدمة",
          },
          {
            title: "التواصل وبدء الطلب",
            description:
              "استخدموا نموذج التواصل لإرسال التاريخ والوقت وشكل الجلسة والسياق المختصر.",
            href: "contact",
            cta: "افتح صفحة التواصل",
          },
        ],
      },
      verification: {
        eyebrow: "تنسيق مهني",
        title: "ما الذي يتم الاتفاق عليه قبل تأكيد المهمة؟",
        description:
          "تعتمد الملاءمة على مضمون اللقاء وشكله والتأهيل الرسمي المطلوب إن وجد.",
        items: [
          {
            title: "التأهيل في المهام الرسمية",
            description:
              "عندما تكون هناك حاجة إلى مترجم محلّف أو مسجل، يؤخذ ذلك في الاعتبار قبل التأكيد.",
          },
          {
            title: "سياق واقعي بدل الكلام التسويقي",
            description:
              "كل صفحة تربط الخدمة مباشرة بقطاعات حقيقية مثل البلدية والرعاية والمحامين والمحاكم والهجرة.",
          },
          {
            title: "استقبال واضح للطلب",
            description:
              "التاريخ والوقت والمدة والقطاع وشكل الجلسة تساعد على تقييم التوافر والملاءمة.",
          },
        ],
      },
      future: {
        eyebrow: "أشكال الخدمة والسياق",
        title: "ما شكل الترجمة الشفهية الأنسب لمحادثتكم؟",
        description:
          "يعتمد الاختيار على الاستعجال وحساسية الموضوع والمكان والمتطلبات الرسمية.",
        cards: [
          {
            title: "هاتفياً أو عبر الفيديو",
            description:
              "مناسب للاستقبال الأولي والاجتماعات والمحادثات التي يشارك فيها الأطراف عن بُعد.",
            status: "شكل الخدمة",
          },
          {
            title: "حضورياً",
            description:
              "مناسب للمواعيد الحساسة أو الرسمية أو متعددة الأطراف التي تستفيد من الحضور المباشر.",
            status: "شكل الخدمة",
          },
          {
            title: "مترجم محلّف",
            description:
              "للمهام التي تتطلب مترجماً محلّفاً ومسجلاً في سجل وطني.",
            status: "سياق رسمي",
          },
          {
            title: "الطوارئ والوقت القصير",
            description:
              "قد تتاح المهمة في اليوم نفسه أو خلال وقت قريب. أرسلوا التفاصيل فوراً لتقييم التوافر.",
            status: "بحسب التوافر",
          },
          {
            title: "الرعاية والجهات الرسمية",
            description:
              "للمحادثات مع البلديات ومقدمي الرعاية والجهات العامة أو المجتمعية.",
            status: "سياق مهني",
          },
          {
            title: "القانون والهجرة",
            description:
              "للمحادثات مع المحامين والمحاكم وIND وغيرها من الإجراءات والملفات.",
            status: "سياق مهني",
          },
        ],
      },
      cta: {
        eyebrow: "الخطوة التالية",
        title: "اطلعوا على الخدمة الأساسية أو أرسلوا الطلب مباشرة.",
        description:
          "اذكروا في نموذج التواصل التاريخ والوقت والسياق وشكل الجلسة وأي متطلبات رسمية.",
      },
    },
    mainService: {
      metaTitle: "طلب مترجم شفهي عربي هولندي في هولندا",
      metaDescription:
        "خدمة مترجم شفهي عربي هولندي للاجتماعات الطبية والرسمية والقانونية والهجرية، هاتفياً أو عبر الفيديو أو حضورياً.",
      eyebrow: "الخدمة الأساسية",
      title: "مترجم شفهي عربي هولندي للمحادثات ذات الأثر القانوني أو الطبي أو الإداري.",
      intro:
        "هذه الخدمة مخصصة للحالات التي يجب فيها نقل المعنى بين العربية والهولندية بدقة وحياد ووضوح. أرسلوا تفاصيل الاجتماع لتنسيق التوافر وشكل الجلسة وأي متطلبات رسمية.",
      highlights: [
        "مناسبة للمحادثات الحساسة والرسمية.",
        "متاحة هاتفياً أو عبر الفيديو أو حضورياً بحسب المهمة.",
        "يتم تنسيق التوافر والسياق والتأهيل المطلوب مسبقاً.",
      ],
      answerFirst: {
        eyebrow: "إجابة مباشرة",
        title: "متى تحتاجون إلى مترجم شفهي عربي هولندي؟",
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
          title: "الطوارئ والوقت القصير",
          description:
            "قد تتاح المهمة في اليوم نفسه أو خلال وقت قصير. أرسلوا الوقت والسياق بدقة لتقييم الإمكانية.",
        },
      ],
      proof: {
        eyebrow: "عناصر الثقة",
        title: "ما الذي يجب أن يتمكن الزائر من التحقق منه مباشرة؟",
        items: [
          "وضوح الاستخدامات الفعلية للخدمة.",
          "تنسيق التسجيل أو الصفة المهنية المطلوبة في المهام الرسمية.",
          "تأكيد السرية والحياد والسلوك المهني.",
          "وضوح أشكال التقديم: هاتف أو فيديو أو حضور مباشر.",
        ],
      },
      contexts: {
        eyebrow: "مجالات الاستخدام",
        title: "الخدمة مناسبة لسياقات قد يؤدي فيها سوء الفهم إلى آثار مباشرة.",
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
              "تصلكم متابعة توضّح ما هو ممكن وما الخطوة التالية اللازمة لتأكيد الطلب.",
          },
        ],
      },
      faq: {
        eyebrow: "أسئلة أساسية",
        title: "أسئلة تجيب عنها الصفحة منذ الآن",
        description:
          "توضح هذه الإجابات شكل الخدمة والسرية والمهام الرسمية أو العاجلة.",
        items: [
          {
            question: "هل يمكن استخدام هذه الخدمة للبلدية أو للرعاية الصحية أو للمحامي؟",
            answer:
              "نعم. هذه من السياقات المهنية التي يمكن للمجموعة دعمها بحسب التوافر والتأهيل المطلوب.",
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
            question: "هل يمكن طلب مترجم محلّف أو خدمة عاجلة؟",
            answer:
              "نعم. يتوفر مترجمون محلّفون للمهام الرسمية، وقد تتاح المهمة العاجلة في اليوم نفسه أو خلال وقت قصير بحسب التوافر.",
          },
        ],
      },
      cta: {
        eyebrow: "ابدأ الآن",
        title: "إذا كان لديكم اجتماع محدد، فابدؤوا الطلب عبر صفحة التواصل.",
        description:
          "استخدموا نموذج التواصل لإرسال التاريخ والوقت وشكل الجلسة والسياق وأي متطلبات رسمية.",
      },
    },
    contact: {
      metaTitle: "التواصل | طلب مترجم شفهي عربي هولندي",
      metaDescription:
        "أرسلوا طلب مترجم شفهي عربي هولندي عبر نموذج التواصل أو البريد مع التاريخ وشكل الجلسة والسياق.",
      eyebrow: "التواصل والطلب",
      title: "بدء طلب مترجم شفهي عربي هولندي بطريقة واضحة ومنظمة.",
      intro:
        "استخدموا نموذج الطلب أو البريد الإلكتروني لإرسال التاريخ والوقت والمدة وشكل الجلسة ووصف مختصر للسياق. تساعد هذه المعلومات على تقييم التوافر والتأهيل المناسب.",
      highlights: [
        "نموذج واضح مع إبقاء البريد الإلكتروني كخيار بديل.",
        "مناسبة لسياقات البلدية والرعاية والقانون والهجرة.",
        "مناسبة أيضاً للمهام المحلّفة أو العاجلة بحسب التوافر.",
      ],
      primaryAction: "املأ نموذج الطلب",
      secondaryAction: "استفسروا عن التوافر",
      directSubject: "طلب مترجم عربي هولندي",
      callbackSubject: "استفسار عن خدمة الترجمة الشفهية العربية الهولندية",
      followUpSubject: "استفسار عن خدمة الترجمة الشفهية العربية الهولندية",
      form: {
        eyebrow: "نموذج الطلب",
        title: "أرسلوا المعلومات العملية المتعلقة بطلب الترجمة الشفهية.",
        description:
          "أدخلوا المعلومات المتوفرة. اختيار الطلب العاجل يعني فقط أن السرعة مهمة، ولا يضمن التوافر.",
        requiredNote:
          "الاسم والبريد الإلكتروني ونوع الطلب والسياق واتجاه اللغة والرسالة حقول إلزامية.",
        optionalLabel: "(اختياري)",
        fields: {
          name: {
            label: "الاسم",
            placeholder: "الاسم الكامل",
          },
          email: {
            label: "البريد الإلكتروني",
            placeholder: "name@example.com",
          },
          phone: {
            label: "رقم الهاتف",
            placeholder: "+31 6 12345678",
          },
          organization: {
            label: "الجهة أو المؤسسة",
            placeholder: "اسم الجهة",
          },
          requestType: {
            label: "نوع الطلب",
            placeholder: "اختاروا نوع الطلب",
            options: [
              { value: "regular", label: "طلب ترجمة شفهية عادي" },
              { value: "urgent", label: "الإشارة إلى أن الطلب عاجل" },
              { value: "sworn", label: "طلب مترجم شفهي محلّف" },
              { value: "availability", label: "الاستفسار عن التوافر" },
              { value: "other", label: "طلب آخر" },
            ],
          },
          context: {
            label: "السياق",
            placeholder: "اختاروا السياق",
            options: [
              { value: "healthcare", label: "الرعاية الصحية" },
              { value: "municipality", label: "البلدية" },
              { value: "legal", label: "قانوني" },
              { value: "migration", label: "الهجرة / IND" },
              { value: "business", label: "عمل أو شركة" },
              { value: "other", label: "سياق آخر" },
            ],
          },
          languageDirection: {
            label: "اتجاه اللغة",
            placeholder: "اختاروا اتجاه اللغة",
            options: [
              { value: "ar_to_nl", label: "من العربية إلى الهولندية" },
              { value: "nl_to_ar", label: "من الهولندية إلى العربية" },
              {
                value: "both_or_unknown",
                label: "الاتجاهان أو غير محدد بعد",
              },
            ],
          },
          deliveryMode: {
            label: "طريقة تقديم الخدمة",
            placeholder: "اختاروا إذا كانت معروفة",
            options: [
              { value: "phone", label: "عبر الهاتف" },
              { value: "video", label: "عبر الفيديو" },
              { value: "on_location", label: "حضورياً في الموقع" },
              { value: "unknown", label: "غير محددة بعد" },
            ],
          },
          desiredDateTime: {
            label: "التاريخ والوقت المطلوبان",
            placeholder: "مثال: 18 يونيو 2026، الساعة 14:00",
          },
          message: {
            label: "الرسالة",
            placeholder:
              "اذكروا بإيجاز طبيعة الاجتماع ومدته المتوقعة وأي متطلبات مهمة.",
          },
        },
        submitLabel: "إرسال الطلب",
        submittingLabel: "جارٍ إرسال الطلب…",
        fallbackText: "إذا لم يعمل النموذج،",
        fallbackLabel: "أرسلوا الطلب عبر البريد الإلكتروني.",
        privacyText:
          "يرجى عدم إرسال ملفات طبية أو أرقام BSN أو مستندات قضائية أو أي بيانات حساسة غير ضرورية. نستخدم بياناتكم فقط لتقييم الطلب والتواصل معكم. تُحفظ البيانات التي أدخلتموها مؤقتاً في علامة تبويب المتصفح هذه ما دام النموذج لم يُرسل.",
        privacyLinkLabel:
          "اقرؤوا في بيان الخصوصية كيف نتعامل مع بياناتكم.",
        termsText:
          "تسري على المهمة التي قد تنتج عن طلبكم شروطنا وأحكامنا العامة (متوفرة باللغة الهولندية).",
        termsLinkLabel: "اطّلعوا على الشروط والأحكام العامة.",
        messages: {
          success: "شكراً لكم. تم إرسال الطلب وسيجري تقييمه.",
          invalidSubmission:
            "يرجى مراجعة الحقول المحددة والمحاولة مرة أخرى.",
          generalError:
            "تعذر إرسال النموذج حالياً. استخدموا رابط البريد الإلكتروني أدناه لإرسال الطلب.",
        },
        validation: {
          nameRequired: "يرجى إدخال الاسم.",
          nameTooLong: "يجب ألا يتجاوز الاسم 120 حرفاً.",
          emailRequired: "يرجى إدخال البريد الإلكتروني.",
          emailInvalid: "يرجى إدخال بريد إلكتروني صحيح.",
          emailTooLong: "عنوان البريد الإلكتروني طويل جداً.",
          phoneTooLong: "يجب ألا يتجاوز رقم الهاتف 40 حرفاً.",
          organizationTooLong:
            "يجب ألا يتجاوز اسم الجهة 160 حرفاً.",
          invalidOption: "يرجى اختيار قيمة صحيحة.",
          desiredDateTimeTooLong:
            "يجب ألا يتجاوز التاريخ والوقت 120 حرفاً.",
          messageRequired: "يرجى كتابة رسالة.",
          messageTooShort: "يجب أن تتكون الرسالة من 10 أحرف على الأقل.",
          messageTooLong: "يجب ألا تتجاوز الرسالة 3000 حرف.",
        },
      },
      methods: {
        eyebrow: "خيارات التواصل",
        title: "ما نوع الطلب المناسب لحالتكم؟",
        description:
          "اختاروا المسار الأنسب. جميع الخيارات تنقلكم إلى نموذج التواصل نفسه.",
        items: [
          {
            kicker: "طلب",
            title: "بدء طلب ترجمة شفهية",
            description:
              "مناسب عندما تكون تفاصيل الاجتماع معروفة. يتم تنسيق التوافر والتخطيط بعد ذلك.",
            subject: "طلب مترجم عربي هولندي",
          },
          {
            kicker: "تنسيق",
            title: "اشرحوا حالتكم",
            description:
              "مفيد إذا احتجتم أولاً إلى تنسيق حول ملاءمة الخدمة أو شكل الترجمة الشفهية المناسب.",
            subject: "استفسار عن خدمة الترجمة الشفهية العربية الهولندية",
          },
          {
            kicker: "التوافر",
            title: "استفسروا عن التوافر",
            description:
              "أرسلوا التاريخ والوقت وشكل الجلسة لتقييم ما هو ممكن.",
            subject: "استفسار عن توافر مترجم شفهي عربي هولندي",
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
        title: "أرسلوا الطلب عبر نموذج التواصل.",
        description:
          "اذكروا التاريخ والوقت والمدة والسياق وشكل الجلسة وأي تأهيل مطلوب للحصول على متابعة دقيقة.",
      },
    },
  },
} as const;

// Generic rather than `(locale: Locale)`: lets callers that have already
// narrowed locale to a literal (e.g. after an `if (locale !== "nl")
// notFound()` guard) get a correspondingly narrowed return type - needed
// for content.terms, which only the "nl" branch of siteContent has. Every
// existing call site passing a plain `Locale` variable infers L = Locale
// and gets the exact same union return type as before.
export function getSiteContent<L extends Locale>(locale: L): (typeof siteContent)[L] {
  return siteContent[locale];
}

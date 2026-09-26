const sources = {
  gdpr: ['GDPR — Regulation (EU) 2016/679', 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32016R0679'],
  privacy: ['EU: Data protection and online privacy', 'https://europa.eu/youreurope/citizens/consumers/internet-telecoms/data-protection-online-privacy/index_en.htm'],
  cookies: ['EU: Online privacy and cookies', 'https://europa.eu/youreurope/business/growing/digitalising/online-privacy/index_en.htm'],
  cookieOpinion: ['Article 29 Working Party: Opinion 04/2012 on cookie consent exemption', 'https://ec.europa.eu/justice/article-29/documentation/opinion-recommendation/files/2012/wp194_en.pdf'],
  business: ['2001. évi CVIII. törvény, 4. §', 'https://njt.jog.gov.hu/jogszabaly/2001-108-00-00'],
  civil: ['2013. évi V. törvény, 2:48. §', 'https://njt.jog.gov.hu/jogszabaly/2013-5-00-00'],
  consumer: ['45/2014. (II. 26.) Korm. rendelet', 'https://njt.jog.gov.hu/jogszabaly/2014-45-20-22'],
  complaints: ['1997. évi CLV. törvény, 17/A. §', 'https://njt.jog.gov.hu/jogszabaly/1997-155-00-00'],
  board: ['Budapesti Békéltető Testület — elérhetőségek', 'https://bekeltet.bkik.hu/elerhetosegek'],
  retention: ['European Commission — GDPR principles', 'https://commission.europa.eu/law/law-topic/data-protection/information-business-and-organisations/principles-gdpr_en'],
  naih: ['NAIH — contact / complaints', 'https://www.naih.hu/ugyfelszolgalat-kapcsolat'],
  wcag: ['W3C: Web Content Accessibility Guidelines 2.2', 'https://www.w3.org/TR/WCAG22/'],
  accessibility: ['EU: Accessibility of products and services', 'https://eur-lex.europa.eu/legal-content/EN/ALL/?uri=legissum:4403933'],
}

export const legalContent = {
  en: {
    privacy: {
      title: 'Privacy policy',
      sections: [
        ['What this website processes', 'This portfolio has no checkout, advertising pixels, analytics code or embedded social feeds. Public photographs and approved reviews are loaded from the website and its gallery service. Servers receive standard connection data such as IP address, requested URL and browser information necessary for technical operation and security.'],
        ['Contact enquiries', 'Enquiries sent via the contact form or email (such as name, email address and message text) are processed solely to respond to your request and discuss photography services. Please do not send sensitive personal information or third-party documents unless needed.', 'Enquiries about a booking are handled to take steps at your request before entering into a contract (Article 6(1)(b)). Other correspondence is handled for our legitimate interest in responding to enquiries (Article 6(1)(f)). We do not send unsolicited marketing. Enquiries that do not lead to a booking are retained for up to six months after the final correspondence.'],
        ['Reviews and publication', 'Submitting a review sends its text, chosen display name, optional event/location and publication permission to our PocketBase service at Hetzner in Germany. It is submitted as hidden for administrator review. An unticked permission box asks specifically to publish those supplied details. You may use a first name or nickname; event/location is optional. Review publication is separate from booking a service and is based on consent (Article 6(1)(a)). No email address is requested in this form. Rejected reviews are deleted within 30 days of the moderation decision. Reviews are manually checked before publication.', 'Ask info@prismvisuals.hu to withdraw publication permission, identifying the review without sending unnecessary identity documents. Withdrawal does not make earlier lawful use unlawful. We remove the public review upon withdrawal.'],
        ['Client photographs and portfolios', 'Private client galleries require a gallery password. An optional name and PIN profile stores selected favourites; it can only be accessed after gallery sign-in. Photography, editing and agreed delivery for a contracting client rely on the service contract. Other people in photographs are handled in accordance with applicable image rights and data protection standards.', 'Portfolio or social-media publication is a separate purpose. Public use and private delivery are handled distinctly; children require particular care and appropriate representative permission. Delivery does not create a right to keep photographs indefinitely.'],
        ['Recipients, safeguards and retention', 'Data is only shared with service providers necessary to answer enquiries, host the website and gallery, perform the agreed service, or meet statutory legal duties. No sale of visitor data, advertising profiles or automated decisions are implemented in this website.', 'Full client galleries and their backups are retained for one year after delivery, then deleted. Selected portfolio references may be retained with documented permission where agreed. Accounting and statutory records follow applicable legal obligations.'],
        ['Your choices and rights', 'Contact info@prismvisuals.hu to request access, correction, deletion, restriction, portability where applicable, or to object to processing based on legitimate interests. Requests are normally answered within one month; any lawful extension must be explained. Consent can be withdrawn at any time. You may complain to the Hungarian data protection authority (NAIH) or seek a judicial remedy. NAIH’s official contact page is linked below.'],
      ],
      sources: [sources.gdpr, sources.privacy, sources.civil, sources.naih, sources.retention],
    },
    terms: {
      title: 'Website terms & service information',
      sections: [
        ['Using the website', 'Prism Visuals presents photography and videography work. Browsing or sending an enquiry does not itself make a booking or take a payment. A service requires a separate agreement covering scope, price including applicable taxes, dates, delivery, usage rights and cancellation. These website terms do not replace that agreement.'],
        ['Quotes, cancellations and refunds', 'There is no online purchase or payment facility here, so there is no website checkout refund process. Contact info@prismvisuals.hu about an existing booking. Any refund depends on the separate agreement and mandatory consumer law; no blanket “non-refundable” rule is imposed here.', 'A contract concluded by email or telephone can still be a distance contract. Where statutory withdrawal rules apply, a consumer generally has 14 days from concluding a service contract. Starting work early and loss of withdrawal rights require the applicable express requests, acknowledgements and confirmation. Exceptions must be assessed for the actual service; a custom photograph or a wedding date does not automatically remove all rights. Mandatory consumer rights remain unaffected.'],
        ['Photographs and permitted use', 'The photographer retains copyright except where agreed otherwise or required by law. Client use follows the agreed licence. Website display does not grant a general licence for commercial copying, resale or redistribution; statutory exceptions remain available. Access to a private delivery link does not itself grant permission to publish other people’s images.'],
        ['Enquiries, reviews and links', 'Do not send unlawful material or disclose another person’s private details in a review. Reviews are manually moderated and should describe your own experience. External social links take you to services with their own privacy terms; no social feed is embedded here.'],
        ['Complaints and disputes', 'Send a complaint to info@prismvisuals.hu and describe the service and requested resolution. Complaints may also be sent to the registered address in Business details. Written consumer complaints are answered within 30 days; complaint records and responses are kept for three years under Hungarian consumer-protection law. The Budapest Conciliation Board can be contacted at 1016 Budapest, Krisztina krt. 99.; postal address: 1253 Budapest, Pf. 10.; email: bekelteto.testulet@bkik.hu. The consumer’s place of residence can determine the competent board. This page does not restrict access to a court, a consumer authority or a competent conciliation body. No obsolete EU online-dispute-resolution platform link is used.'],
      ],
      sources: [sources.consumer, sources.business, sources.civil, sources.complaints, sources.board],
    },
    cookies: {
      title: 'Cookie and browser-storage policy',
      sections: [
        ['Current website configuration', 'This website contains no analytics cookies, marketing cookies, tracking pixels or third-party tracking embeds. Fonts are served locally and no third-party feeds are embedded.', 'No optional cookie-consent banner is included because no optional tracking is enabled. Consent must be obtained before introducing analytics, advertising or other non-essential storage or access.'],
        ['Storage used for requested functions', 'language: session storage, set only when you select a language, to retain that choice within the tab session. pocketbase_auth: session storage for an administrator’s requested sign-in; cleared by logout or the end of the tab session. Administrative gallery cover choices use session keys beginning gallery_cover_. These are not advertising identifiers.', 'Client-gallery sign-in uses session storage keys beginning prism_gallery_session_ (up to 8 hours of access), and optional favourites profiles use prism_guest_ keys. These stay within the tab session; gallery logout clears the current credentials. Short-lived file tokens are kept in memory.'],
        ['Control and duration', 'Session storage normally ends with the tab session; browser restore features may restore it. Log out of an administrator session, especially on a shared device. You can clear or block website storage through your browser settings; sign-in or language persistence may then stop working. The website itself does not set tracking cookies or persistent tracking identifiers.'],
      ],
      sources: [sources.cookies, sources.cookieOpinion],
    },
    business: {
      title: 'Business details / legal notice',
      sections: [
        ['Business status', 'Prism Visuals is the official photography and videography portfolio and brand of Iszak Gábor Adrián E.V (sole trader), based in Budapest, Hungary.'],
        ['Bookings and enquiries', 'Photography and videography services are provided upon individual agreement. You can request a tailored quote via our contact form or by email at info@prismvisuals.hu. Direct online payments or automated checkout bookings are not conducted on this website.'],
      ],
      sources: [sources.business],
    },
    accessibility: {
      title: 'Accessibility information',
      sections: [
        ['Using this website', 'Keyboard users can skip the navigation, see focus indicators, open galleries and close dialogs with Escape. The language switch updates the page language. Form fields have labels, and feedback is announced. Motion preferences are respected and the homepage slideshow has a pause control.'],
        ['Ongoing work', 'WCAG 2.2 AA is our design target. Dynamic gallery image descriptions rely on provided alt texts. We continuously work to maintain and improve accessibility across devices and assistive technologies.'],
        ['Report a barrier', 'Email info@prismvisuals.hu with the page and the difficulty you encountered. You can request information or arrange an enquiry by email if a website interaction is inaccessible. Please send only details needed to understand the problem.'],
      ],
      sources: [sources.wcag, sources.accessibility],
    },
  },
  hu: {
    privacy: {
      title: 'Adatkezelési tájékoztató',
      sections: [
        ['A weboldalon kezelt adatok', 'A portfólióoldalon nincs fizetési felület, analitikai kód, hirdetési képpont vagy beágyazott közösségi hírfolyam. A nyilvános fényképek és jóváhagyott értékelések az oldalról és a galériaszolgáltatásból töltődnek be. A kiszolgálók a biztonságos technikai működéshez és kapcsolathoz szükséges adatokat (például IP-cím, kért URL, böngészőadatok) kezelik.'],
        ['Kapcsolatfelvétel', 'A kapcsolatfelvételi űrlapon vagy e-mailben megadott adatokat (név, e-mail-cím, üzenet szövege) kizárólag a megkeresés megválaszolása és a fotózási szolgáltatás egyeztetése céljából kezeljük. Ne adj meg okmányadatot, különleges adatot vagy harmadik fél személyes adatait, ha nem szükséges.', 'A szolgáltatás iránti érdeklődés kezelése a kérésedre történő szerződéskötés előtti lépésekhez szükséges (GDPR 6. cikk (1) b)); egyéb megkereséseknél a válaszadáshoz fűződő jogos érdek a jogalap (GDPR 6. cikk (1) f)). Kéretlen marketingcélú megkereséseket nem küldünk. A megrendeléshez nem vezető érdeklődéseket az utolsó kapcsolatfelvételt követő legfeljebb hat hónapig őrizzük meg.'],
        ['Értékelések közzététele', 'Beküldéskor az értékelés, a választott név, a nem kötelező esemény/helyszín és a közzétételi engedély a németországi Hetznernél tárolt PocketBase rendszerünkbe kerül. Az értékelés rejtetten vár adminisztrátori ellenőrzésre. Egy alapból üres jelölőnégyzet külön engedélyt kér a megadott adatok közzétételére. Keresztnév vagy becenév is használható; az esemény és helyszín megadása nem kötelező. A közzététel hozzájáruláson alapul (GDPR 6. cikk (1) a)), és nem feltétele a szolgáltatás igénybevételének. Az űrlap nem kér e-mail-címet. Az elutasított értékeléseket 30 napon belül töröljük. Az értékeléseket a weboldalon való megjelenés előtt adminisztrátori ellenőrzésnek vetjük alá.', 'A közzétételi engedély az info@prismvisuals.hu címen vonható vissza, az értékelés azonosításával. A visszavonás a korábbi jogszerű kezelést nem érinti. A nyilvános értékelést visszavonáskor eltávolítjuk.'],
        ['Ügyfélképek és portfólió', 'A privát ügyfélgalériához galériajelszó szükséges. A választható név és PIN profil a kedvencek mentésére szolgál; csak a galériába történő belépés után érhető el. A szerződő ügyfél részére szükséges fotózás, szerkesztés és vállalt átadás a szerződés teljesítésén alapul. A képeken szereplő más személyekre vonatkozóan a képmásjogokat és az adatkezelés megfelelő jogalapját az érvényes szabályok szerint rendezzük.', 'A portfólióban vagy közösségi oldalon történő közzététel külön cél. A nyilvános felhasználást és a magáncélú átadást külön kezeljük; gyermekeknél különös körültekintés és megfelelő képviselői engedély szükséges. Az átadás nem teszi jogszerűvé a korlátlan megőrzést.'],
        ['Címzettek és megőrzés', 'Adatot csak a megkeresés, a vállalt szolgáltatás, a weboldal és galéria működtetése vagy jogi kötelezettség teljesítéséhez szükséges személyek és szolgáltatók kaphatnak. Az oldal nem valósít meg adatértékesítést, hirdetési profilalkotást vagy automatizált döntéshozatalt.', 'A teljes ügyfélgalériát és biztonsági másolatait az átadástól számított egy évig őrizzük meg, ezt követően töröljük őket. A portfólióképek megőrzéséhez szükség esetén külön hozzájárulás szükséges. A számviteli és más kötelező iratokra saját törvényi megőrzési szabályaik vonatkoznak.'],
        ['Érintetti jogok', 'Az info@prismvisuals.hu címen hozzáférést, helyesbítést, törlést, korlátozást és – feltételei fennállásakor – adathordozhatóságot kérhetsz; jogos érdeken alapuló kezelés ellen tiltakozhatsz. A válaszadás főszabály szerint egy hónapon belül történik; jogszerű hosszabbítás esetén indokolást adunk. Hozzájárulásodat bármikor visszavonhatod. Panaszt tehetsz a NAIH-nál, vagy bírósághoz fordulhatsz. A NAIH hivatalos elérhetősége lent található.'],
      ],
      sources: [sources.gdpr, sources.privacy, sources.civil, sources.naih, sources.retention],
    },
    terms: {
      title: 'Felhasználási feltételek és szolgáltatási tájékoztató',
      sections: [
        ['A weboldal használata', 'A Prism Visuals fotós és videós munkákat mutat be. Az oldal böngészése vagy megkeresés küldése önmagában nem foglalás és nem jár fizetéssel. A szolgáltatáshoz külön megállapodás szükséges a feladatról, adókat is tartalmazó díjról, időpontokról, átadásról, felhasználási jogokról és lemondásról. E weboldalfeltételek ezt nem helyettesítik.'],
        ['Árajánlat, lemondás, visszatérítés', 'Az oldalon nincs online vásárlás vagy fizetés, ezért webes pénztári visszatérítési folyamat sincs. Meglévő foglalásoddal kapcsolatban az info@prismvisuals.hu címen érdeklődhetsz. A visszatérítést az egyedi megállapodás és a kötelező fogyasztóvédelmi szabályok határozzák meg; itt nem írunk elő általános „nem visszatérítendő” szabályt.', 'E-mailben vagy telefonon kötött szerződés is lehet távollévők közötti szerződés. Ha az elállási szabályok alkalmazandók, szolgáltatásnál főszabály szerint a szerződéskötéstől számított 14 nap áll rendelkezésre. A korai teljesítéshez és az elállási jog elvesztéséhez a jogszabály szerinti kifejezett kérés, tudomásulvétel és visszaigazolás szükséges. A kivételeket az adott szolgáltatásra kell megvizsgálni; az egyedi fénykép vagy az esküvő időpontja önmagában nem szüntet meg minden jogot. A kötelező fogyasztói jogokat e tájékoztató nem korlátozza.'],
        ['Fényképek és felhasználás', 'Eltérő megállapodás vagy jogszabály hiányában a szerzői jogok a fotóst illetik. Az ügyfél felhasználási lehetőségeit a megállapodás rendezi. A webes megjelenítés nem ad általános engedélyt kereskedelmi másolásra, továbbértékesítésre vagy terjesztésre; a törvényi kivételek érvényesülnek. Egy privát átadási link nem jelent önmagában engedélyt mások képmásának közzétételére.'],
        ['Megkeresések, értékelések és külső linkek', 'Ne küldj jogellenes tartalmat, és értékelésben ne közöld mások magánadatait. Az értékelés saját tapasztalatról szóljon; megjelenés előtt kézi ellenőrzés történik. A közösségi linkek külön adatkezelési feltételekkel működő szolgáltatásokra vezetnek; az oldal nem ágyaz be közösségi hírfolyamot.'],
        ['Panaszkezelés', 'Panaszodat az info@prismvisuals.hu címre küldheted, a szolgáltatás és az igényelt megoldás leírásával. Panasz az Impresszumban megadott székhelyre is küldhető. Az írásbeli fogyasztói panaszt 30 napon belül megválaszoljuk; a panaszt és a választ három évig őrizzük a fogyasztóvédelmi törvény szerint. Budapesti Békéltető Testület: 1016 Budapest, Krisztina krt. 99.; levelezési cím: 1253 Budapest, Pf. 10.; e-mail: bekelteto.testulet@bkik.hu. Az illetékességet a fogyasztó lakóhelye is meghatározhatja. Ez az oldal nem korlátozza a bírósághoz, fogyasztóvédelmi hatósághoz vagy békéltető testülethez fordulást. Megszűnt uniós online vitarendezési platformra nem hivatkozunk.'],
      ],
      sources: [sources.consumer, sources.business, sources.civil, sources.complaints, sources.board],
    },
    cookies: {
      title: 'Süti- és böngészőtárhely-tájékoztató',
      sections: [
        ['Az oldal jelenlegi működése', 'A weboldalon nem működik külső analitikai kód, marketingcélú süti, követő képpont vagy külső beágyazott tartalom. A betűtípusokat a saját kiszolgálónkról szolgáljuk ki.', 'Mivel a weboldal nem használ statisztikai vagy marketingcélú nyomkövetést, külön süti-hozzájárulási sáv megjelenítése nem szükséges. Amennyiben a jövőben ilyen funkció kerülne bevezetésre, ahhoz előzetes hozzájárulást fogunk kérni.'],
        ['Kért funkciókhoz használt tárhely', 'language: munkamenet-tárhely, csak nyelvválasztáskor mentve, hogy a választás a böngészőlap munkamenetében megmaradjon. pocketbase_auth: az adminisztrátor kért bejelentkezésének munkamenet-tárhelye, kijelentkezéskor vagy a lap munkamenetének végén törlődik. Az adminisztrátori borítóképválasztás gallery_cover_ kezdetű munkamenetkulcsot használ. Ezek nem hirdetési azonosítók.', 'Az ügyfélgaléria belépése prism_gallery_session_ kezdetű munkamenetkulcsot használ, legfeljebb 8 órás hozzáféréssel. A választható kedvencprofil prism_guest_ kezdetű kulcsot használ. Ezek a böngészőlap munkamenetéhez kötöttek; a galériából kijelentkezés törli az aktuális belépési adatokat. A rövid élettartamú fájltoken csak memóriában marad.'],
        ['Beállítások és időtartam', 'A munkamenet-tárhely rendszerint a lap munkamenetével megszűnik; a böngésző visszaállítási funkciója visszaállíthatja. Közös eszközön különösen fontos az adminisztrátori kijelentkezés. A böngészőben a tárhely törölhető vagy letiltható; emiatt a belépés vagy a nyelvválasztás megjegyzése nem feltétlenül működik. A weboldal nem állít be marketing vagy követési célú sütiket.'],
      ],
      sources: [sources.cookies, sources.cookieOpinion],
    },
    business: {
      title: 'Impresszum',
      sections: [
        ['Vállalkozási adatok', 'A Prism Visuals Iszak Gábor Adrián egyéni vállalkozó fotográfiai és videográfiai szolgáltatásainak weboldala és márkaneve.'],
        ['Megrendelés és egyeztetés', 'A fotózási és videós szolgáltatások egyedi megállapodás alapján érhetők el. Írásos ajánlatért vagy kérdés esetén vedd fel velünk a kapcsolatot a kapcsolatfelvételi űrlapon vagy az info@prismvisuals.hu címen. Az oldalon közvetlen webshop jellegű vásárlás vagy automatikus fizetés nem történik.'],
      ],
      sources: [sources.business],
    },
    accessibility: {
      title: 'Akadálymentességi tájékoztató',
      sections: [
        ['Az oldal használata', 'Billentyűzettel átugorható a navigáció, látható a fókusz, megnyithatók a galériák, és Escape-pel bezárhatók a párbeszédablakok. A nyelvváltás az oldal nyelvi jelölését is módosítja. Az űrlapokhoz címkék és felolvasott visszajelzések tartoznak. A csökkentett mozgás beállítást figyelembe vesszük, a főoldali diavetítés szüneteltethető.'],
        ['Folyamatban lévő munka', 'A WCAG 2.2 AA szabvány irányelveit tekintjük irányadónak. A képleírások a feltöltött leírásokhoz igazodnak. Folyamatosan törekszünk az oldal akadálymentes használhatóságának fenntartására és a különböző segítőtechnológiákkal való kompatibilitás biztosítására.'],
        ['Akadály jelzése', 'Az info@prismvisuals.hu címen jelezheted az érintett oldalt és a tapasztalt nehézséget. Ha valamely művelet nem hozzáférhető, e-mailben is kérhetsz információt vagy egyeztetést. Csak a probléma megértéséhez szükséges adatokat küldd el.'],
      ],
      sources: [sources.wcag, sources.accessibility],
    },
  },
}

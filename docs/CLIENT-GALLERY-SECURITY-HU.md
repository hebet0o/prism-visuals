# Ügyfélgaléria: ellenőrzés és javítás

## Új helyi csomag – 2026-09-26

Elkészült a `pocketbase/` szerverkiegészítés, az admin jelszóbeállítása és a biztonságos ügyféloldal. Telepítési leírás: `pocketbase/README-HU.md`. A szerverkiegészítés 2026-09-26-án települt az éles Hetzner PocketBase-re; az éles health végpont HTTP 200, `no-store` választ ad. A böngészőben megnyitott `api.prismvisuals.hu` az éles példány; a fejlesztői integrációs teszt külön Windows localhost PocketBase-t és mesterséges rekordokat használt.

Valódi PocketBase 0.23.4 alatt sikeres integrációs teszt: jogosulatlan jelszóírás tiltása, galériák/képek elkülönítése, védett fájlok, no-store válasz, vendégprofil/kedvencek, CORS, jelszóváltás utáni azonnali visszavonás, kijelentkezés, lejárat, próbálkozási korlátok és a natív auth-végpontok zárolása. A teszt forrása: `scripts/test-gallery-backend.mjs`.

A galériajelszavak és PIN-ek natív bcrypt mezőben vannak, az ügyfél 8 órás galériaspecifikus belépést kap. A régi `passwordHash` és `guest_users` adatokból nem történik automatikus belépés vagy profilátvétel. Minden privát galériához új jelszó kell; a kedvencprofilokat újra létre kell hozni. A régi adatokat ez a csomag nem törli.

Az éves kép-/mentéstörlést a tulajdonos külön scriptje végzi, ennek elkészítése nem része ennek a feladatnak. A telepítő által készített helyi biztonsági másolatot is be kell vonni a megőrzési rendbe. A következő történeti szakaszok a csomag előtti éles állapotot dokumentálják.

## Korábbi éles javítások

Ellenőrzés dátuma: 2026-09-26. Állapot: a névtelen hozzáférés hibájának sürgős javítása élesben megtörtént. A privát ügyfélgaléria még nem kapcsolható vissza: új ügyfélhitelesítés, törlés és mentési ellenőrzés szükséges.

## Éles javítás a superuser-belépés után

PocketBase verzió: **0.23.4**, Hetzner szerveren, Cloudflare proxy mögött.

- `galleries`: az eredetileg üres öt API-szabály helyett csak a látható rekordok olvashatók nyilvánosan; a rejtett rekordok és az írás csak a meglévő adminfióknak vagy superusernek érhető el. A `passwordHash` mező `Hidden` lett; a nyilvános API-válaszban már nincs benne. A régi jelszavak nem használhatók új ügyfélhitelesítés alapjaként.
- `pictures`: nyilvános olvasás csak akkor, ha **a kép és a szülőgaléria is látható**. Egyéb olvasás és minden írás csak a meglévő adminnak vagy superusernek. Az `image` fájlmező `Protected = true`, mentés után visszaellenőrizve.
- `guest_users`: mind az öt API-szabály zárolva (`null`, superusers only). A régi vendég/PIN folyamat továbbra is leállítva.
- `users`: a nyilvános fióklétrehozás letiltva (`createRule = null`). A meglévő saját-rekord szabályok és bejelentkezés változatlanok; a Manage rule már eleve zárolt volt.

Az adminfeltétel jelenleg egy explicit engedélylista, nem minden bejelentkezett felhasználó:

```text
@request.auth.id = "dzuvc18aamn9mno" && @request.auth.collectionName = "users"
```

Galéria list/view: `isVisible = true || (<adminfeltétel>)`.
Kép list/view: `(isVisible = true && gallery.isVisible = true) || (<adminfeltétel>)`.
Mindkettő create/update/delete: `<adminfeltétel>`.
A superuser a PocketBase működése szerint megkerüli ezeket a szabályokat.

### Cloudflare

A PocketBase fájlvédelmének bekapcsolása után egy korábban elérhető kép a Cloudflare cache-ből még HTTP 200 választ adott (`CF-Cache-Status: HIT`); ugyanaz új query paraméterrel már 404-et adott. Ezért szükség volt a CDN javítására is.

- Aktív Cache Rule: **Bypass cache for PocketBase API**; feltétel `(http.host eq "api.prismvisuals.hu")`, cache eligibility: bypass, Browser TTL: bypass.
- Sikeres hostname-alapú purge: kizárólag `api.prismvisuals.hu`. A Cloudflare a sikeres purge-kérést visszaigazolta.
- Aktív Cache Response Rule: **No-store PocketBase API responses**; ugyanazon host válaszaihoz `no-store` direktívát ad, nem csak Cloudflare számára. Ez a HEAD válaszokban is igazolt. A régi `max-age` direktíva a nyilvános fájlnál megmaradt, de a `no-store` megtiltja a tárolást.
- A már mások böngészőjében vagy letöltéseiben meglévő másolatokat ez nem törli visszamenőleg.
- Az API-host nyilvános képei is megkerülik a CDN cache-t. Ez tudatos ideiglenes kompromisszum; a külön nyilvános portfóliótár később külön cache-elhető. A fő weboldal hostjának cache-beállításai nem változtak.

### Javítás utáni ellenőrzések

- `node scripts/check-gallery-access.mjs`: mind a hat csak olvasó ellenőrzés sikeres. A rejtett galériák/képek listái üresek, a vendéglista 403, a nyilvános galéria elérhető jelszómező nélkül.
- Két korábban ismert privát képreferencia (rejtett kép, illetve rejtett galéria képe), eredeti és `thumb=200x200` URL: **404**, `CF-Cache-Status: DYNAMIC`, `Cache-Control: no-store`.
- Nyilvános kép eredeti és thumbnail URL: **200**, `DYNAMIC`, `no-store` direktíva.
- Képtartalmat a névtelen fájltesztekben nem töltöttem le; HEAD kéréseket használtam. Nem történt éles tesztrekord-létrehozás vagy törlés.
- A hitelesített normál admin teljes képfeltöltési/képbetöltési útvonala és a jövőbeli ügyfelek közötti izoláció még nincs végponttól végpontig tesztelve. Utóbbihoz az új ügyfélhitelesítés is hiányzik.

### Helyi frontend-javítások (még nem telepítve)

- Az admin a védett képekhez külön, rövid élettartamú PocketBase fájltokent kér, percenként frissíti, és hibát jelez a tokenkérés sikertelenségekor. A token nem kerül tartós tárhelyre.
- Megszűnt a régi nyers galériajelszó bekérése/küldése az adminban. A régi, nem bekötött ügyféloldal továbbra sem aktivált.
- Az adminútvonal és belépés UI-ja a szerveroldali adminengedélylistát követi. A biztonsági határ továbbra is a szerver.
- `npm run build` és `git diff --check` sikeres; az adminazonosítás ellenőrizve helyes azonosítóval, más felhasználóval, más gyűjteménnyel és üres rekorddal.
- A frontend telepítéséig a régi webes admin rejtett képei nem feltétlenül jelennek meg, mert még nem küld fájltokent. A PocketBase superuser felülete továbbra is használható.

### Mentési állapot és hátralévő munka

A PocketBase Backups oldalon egy 2026-04-26-i, kb. 994 KB-os mentés látható. Az **Enable auto backups** és a **Store backups in S3 storage** kapcsoló ki van kapcsolva. Ez nem zárja ki a Hetzner vagy más külső rendszer mentéseit; azokat SSH-val/üzemeltetői konfigurációval kell feltárni. Meglévő mentést nem töröltem vagy állítottam vissza.

Az éves törlést, mentési rotációt, origin/proxy beállításokat, az új ügyfélhitelesítést és a frontend telepítését még el kell végezni. A hozzáférési naplók és a korábbi kitettség felülvizsgálata, valamint a képmásengedélyek ellenőrzése is hátravan. A figyelmeztetés ezért egyelőre indokolt.

Az alábbi részek az eredeti, javítás előtti auditot és a teljes újranyitási feltételeket dokumentálják.

## Igazolt élő eredmények

A `https://api.prismvisuals.hu` API-t hitelesítés nélkül, kizárólag olvasási kérésekkel ellenőriztem. A rekordlistáknál egyetlen rekordot kértem, kezdetben csak az `id` mezővel; személynevet, jelszót, PIN-t vagy vendégtokent nem kértem le.

| Kérés | Eredmény |
| --- | --- |
| `galleries`, `isVisible = false` | HTTP 200, 1 találat, 1 rekord visszaadva |
| `pictures`, `isVisible = false` | HTTP 200, 1100 találat, 1 rekord visszaadva |
| `guest_users` | HTTP 200, 8 találat, 1 rekord visszaadva |
| `users` | HTTP 200, 0 találat; ez önmagában nem igazolja a jogosultságok helyességét |
| Egy rejtett képrekord eredeti fájlja, token nélküli HEAD | HTTP 200, `image/jpeg` |
| Ugyanez `thumb=200x200` paraméterrel, token nélküli HEAD | HTTP 200, `image/jpeg` |

A fájlteszthez egy rejtett rekord fájlnevét és technikai azonosítóit kértem le. Ezeket nem mentettem ebbe a jelentésbe. Képtartalmat nem töltöttem le. A HEAD eredménye a kiválasztott URL hitelesítés nélküli kiszolgálását jelzi, nem minden kép teljes körű vizsgálatát. Az ellenőrzés nem állapítja meg, hogy korábban ki fért hozzá az adatokhoz, illetve hogy minden rejtett kép bizalmas ügyfélkép-e.

## A kódban talált okok

- `src/App.jsx`: az ügyfélgaléria útvonala jelenleg csak a leállítási oldalt jeleníti meg. Ez nem tiltja le az API-t és a fájlokat.
- `src/pages/GalleryPage.jsx`: a régi, jelenleg nem bekötött folyamat a böngészőben hasonlítja össze a beírt jelszót a rekord `passwordHash` mezőjével.
- `src/pages/AdminDashboard.jsx`: a beírt galériajelszót változtatás nélkül küldi a `passwordHash` mezőbe. A mező elnevezése nem jelent jelszóhash-elést. Az esetleges szerveroldali feldolgozás nincs ebben a repóban.
- `src/hooks/useVisibleGalleries.js`: a nyilvános oldal szűrése csak azt határozza meg, mit kér a felület. A támadó más kérést küldhet.
- `src/components/ProtectedRoute.jsx`: érvényes bejelentkezést néz, külön adminszerepkört nem. A tényleges írási jogot szerveroldalon kell korlátozni.
- Nincs verziózott PocketBase-séma, szerverhook, törlési ütemezés vagy mentéskonfiguráció a repóban.

## Első lépés: szerveroldali lezárás

Ehhez PocketBase-superuser vagy szerverüzemeltetői hozzáférés szükséges. A weboldal saját `/admin` felülete nem feltétlenül ad ilyen hozzáférést.

1. Azonosítsuk a PocketBase verzióját, a tényleges API-szabályokat és fájltárolást. Mentsük a séma/beállítások állapotát és őrizzük meg a releváns hozzáférési naplókat; ne készítsünk indokolatlan új másolatot az ügyfélképekről.
2. Sürgős ideiglenes lezárásként a privát adatokat tartalmazó `galleries`, `pictures`, `guest_users` gyűjtemények listázási, megtekintési és írási szabályai zárolhatók (PocketBase: `null`, csak superuser). Az üres szabály nem zárolás: nyilvános hozzáférést jelent. Ez a közös gyűjteményekre épülő nyilvános portfóliót és a normál adminfiókot is érintheti.
3. A privát képfájlmezőt `Protected` állapotba kell tenni, szigorú `viewRule` mellett. A rekordok zárolása önmagában nem zárja le az alapból nyilvános fájlokat. Ellenőrizni kell az alternatív tárhely-URL-eket, thumbnailöket, proxy/CDN cache-t is.
4. A lezárást újra kell mérni kijelentkezett kérésekkel, különösen a már ismert eredeti és bélyegkép-URL-eken. A szerverbeállítás puszta elmentése még nem sikeres ellenőrzés.
5. Át kell nézni a naplókat és az érintett adatokat. A tulajdonos adatvédelmi szakemberrel értékelje, történt-e bejelentendő adatvédelmi incidens. A nyilvános elérés ténye nem bizonyít korábbi letöltést, de nem is szabad pusztán felületi hibaként kezelni.

## Tartós javítás és újranyitás

- A jóváhagyott nyilvános portfóliómásolatok és a privát teljes galériák elkülönítése.
- Szerver által ellenőrzött ügyfélazonosítás és galériánkénti jogosultság; olvasható közös jelszó/PIN helyett hitelesítési rendszer. A kliens ne tudjon saját magának jogosultságot vagy adminszerepet kiosztani.
- Védett privát fájlok, megfelelő megtekintési szabályok, rövid élettartamú fájltokenek, visszavonható jogosultság, lejárat, belépési próbálkozások korlátozása. A felület ehhez igazított belépése és képbetöltése.
- Az adminszerepkör szerveroldali ellenőrzése minden módosításnál; vendég csak a saját megengedett műveleteit végezhesse.
- Átadási és lejárati dátum galériánként. Az egy év a jelenlegi tájékoztatóban vállalt idő, nem általános jogszabályi határidő.
- Szerveroldali ütemezett törlés, naplózott siker/hiba, hibajelzés és ismétlés. Eredetik, bélyegképek, kapcsolódó vendégadatok, saját cache-ek és mentések kezelése. Visszaállítás ne hozza vissza a már lejárt képeket. A mentési megoldást az üzemeltetővel kell egyeztetni; egy frontend-időzítő nem elegendő.
- Külön nyilvántartás a kiválasztott portfólióképek közzétételi engedélyéről: képek, érintettek, csatornák (weboldal/Instagram/Facebook), dátum, bizonyíték, visszavonás. Ez nem helyettesíthető egy adminban bepipált, bizonyíték nélküli jelölővel.

## Kötelező elfogadási próbák tesztadatokkal

1. Kijelentkezett látogató nem listázhat privát rekordot, nem olvashat vendégadatot és nem tölthet le ismert privát fájl-URL-t vagy thumbnailt.
2. A ügyfél nem fér hozzá B ügyfél galériájához vagy fájljaihoz, akkor sem, ha ismeri az azonosítókat.
3. Lejárt/visszavont hozzáféréssel a szerver megtagadja az új kéréseket.
4. Nem admin felhasználó nem módosíthat jogosultságot, láthatóságot vagy mások rekordjait.
5. Egy lejárt tesztgaléria ténylegesen törlődik; hiba újrapróbálható és észlelhető; a mentés-visszaállítás sem teszi újra elérhetővé.
6. A jóváhagyott nyilvános portfólió továbbra is működik, privát fájlok vagy belépési adatok kiszivárgása nélkül.

## A folytatáshoz szükséges adatok

- Hol fut a PocketBase, melyik verzióval, és hogyan telepíthető szerveroldali módosítás?
- Sémaexport az érintett gyűjteményekről, API-szabályokkal (beleértve `guest_users`). Nem rekordexport és nem jelszó/token.
- Fájltárolás, CDN/proxy és mentések helye, megőrzése, visszaállítási folyamata; hozzáférési naplók elérhetősége.
- Melyik felhasználó admin, kik kaphatnak ügyfél/vendég hozzáférést, mi a kívánt belépési folyamat?
- A meglévő galériák tényleges átadási dátumai és a nyilvános képek engedélyei.

Az első audit csak olvasási műveletekből állt. A későbbi éles beállításváltozásokat és a még hátralévő munkát a dokumentum eleje rögzíti. Ügyfélrekordot vagy képfájlt nem töröltem.

## Források

- [PocketBase: fájlok és Protected mezők](https://pocketbase.io/docs/files-handling/)
- [PocketBase: API-szabályok](https://pocketbase.io/docs/api-rules-and-filters/)
- [Európai Bizottság: GDPR-alapelvek, tárolás korlátozása](https://commission.europa.eu/law/law-topic/data-protection/information-business-and-organisations/principles-gdpr_en)
- [Ptk. 2:48. §: képmás és hangfelvétel](https://njt.jog.gov.hu/jogszabaly/2013-5-00-00)

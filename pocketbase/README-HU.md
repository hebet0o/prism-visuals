# Galériabelépés telepítése

Az éles PocketBase a Hetzneren, az `api.prismvisuals.hu` címen fut. A helyi tesztpéldány ettől teljesen különálló. A csomag 2026-09-26-án települt az éles szerverre; ez a leírás az újratelepítéshez és a helyreállításhoz marad a repóban.

## Mit változtat?

- A meglévő galériák és képek megmaradnak. A galériajelszót az adminfelületen lehet beállítani és módosítani, a szerver a PocketBase natív bcrypt jelszómezőjében tárolja. A régi `passwordHash` mező tartalmát nem használja belépésre, és nem adja vissza az API.
- Galériánként elkülönített, 8 órás ügyfélbelépés; védett képekhez 2 perces fájltoken. Jelszóváltás azonnal érvényteleníti a korábbi belépéseket és fájltokeneket. A már letöltött képeket természetesen nem lehet visszavonni.
- Név + PIN alapú kedvencek az új `prism_gallery_guests` gyűjteményben. Ez a galériajelszó UTÁNI, opcionális profil; önmagában nem ad privát képhez hozzáférést. A régi vendégprofilok zárva maradnak: első alkalommal új profilt kell létrehozni, a régi kedvencek nem kerülnek automatikusan át.
- A meglévő normál admin: `users/dzuvc18aamn9mno`. Más `users` rekord nem kap adminjogot. A PocketBase superuser továbbra is hozzáfér.
- A nyilvános galéria nyilvános képei továbbra is jelszó nélkül láthatók. A privát ügyfél a saját galériájának minden képét látja, azok portfólió-láthatósági jelölésétől függetlenül.
- A frontend az ügyfél- és adminbelépést elkülöníti. Belépési adatok csak a böngészőlap munkamenettárában vannak, fájltoken csak memóriában.
- Brute-force korlát: galériánként 30, tényleges hálózati peer-enként 120 belépési kérés / 15 perc; vendégprofilonként 10, galériánként 60 profilbelépés / 15 perc. Caddy mögött a peer-korlát megosztott. Nagy rendezvény előtt ezt a várható terheléshez kell méretezni; a hamisított X-Forwarded-For nem kerüli meg.
- Óránként csak lejárt belépési és próbálkozásszámláló rekordokat takarít. **Galériát, képet, vendégprofilt vagy mentést nem töröl automatikusan. Az éves képtörlést a saját scripted kezeli.**

## Telepítés

Előfeltétel: PocketBase **0.23.4**, `pocketbase.service`, `/opt/pocketbase`, root szolgáltatás, alapértelmezett `pb_data`, `pb_hooks`, `pb_migrations`. A telepítő eltérő útvonal vagy verzió esetén leáll; ilyenkor a hibaüzenetet küldd vissza. Nem módosítja a Caddyt, a systemd beállítást, a tűzfalat vagy a Cloudflare-t.

1. **Windows PowerShellben**, nem az SSH-n belül (a `SZERVER_IP` helyére a korábban ellenőrzött IP):

   ```powershell
   scp -i "$env:USERPROFILE\.ssh\prism_hetzner" "C:\git\prism-visuals\artifacts\prism-gallery-backend.tar.gz" root@SZERVER_IP:/root/
   ```

2. **A szerver SSH termináljában**:

   ```bash
   mkdir -p /root/prism-gallery-release
   tar -xzf /root/prism-gallery-backend.tar.gz -C /root/prism-gallery-release
   bash /root/prism-gallery-release/install.sh
   ```

   A telepítő ellenőrzi a fájlokat és a szabad tárhelyet, rövid időre leállítja a PocketBase-t, teljes helyi `pb_data` mentést készít, majd telepít és újraindít. Sok kép esetén a mentés tovább tarthat. Nem töröl meglévő fájlokat. A végén `Installed. Backup: ...` üzenetnek kell megjelennie.

3. Külső ellenőrzés:

   ```bash
   curl -fsS https://api.prismvisuals.hu/api/prism/health
   ```

   Elvárt: `{"version":1}`. Ez csak telepítési állapotjelzés; a hozzáférési próbákat is végre kell hajtani.

4. Ezután következhet a frontend GitHub push és a Vercel telepítés. **Ez a munkapéldány még nincs pusholva.** Az új adminban: Galériák → megfelelő galéria → **Galériajelszó beállítása / módosítása**. Legalább 12 karakter, legfeljebb 72 UTF-8 bájt; nem a régi jelszót kell visszaírni. A régi jelszavak biztonságát a korábbi nyilvános hozzáférés miatt nem feltételezzük.

5. A galériakártyán látható `/gallery/REKORD_ID` linket add az ügyfélnek. A régi slug-link is működik, ha pontosan egy galériához tartozik. Azonos slugú galériáknál használd az ID-linket.

## Éles ellenőrzés telepítés után

- Normál weboldal-adminnal rejtett galériák és képek megtekintése, új tesztkép feltöltése.
- Privát böngészőablak: jó jelszóval képek, nagyítás, egy kép és ZIP letöltése; hibás jelszóval nincs hozzáférés.
- Név/PIN profil létrehozása, kedvenc mentése, visszalépés ugyanabba a profilba.
- Adminból jelszócsere; a régi böngészőablak legközelebbi kérése és a korábbi privát kép-URL nem fér hozzá. Az új jelszó működik.
- Másik galéria rejtett képei továbbra sem hozzáférhetők. A nyilvános portfólió működik.
- Cloudflare: API-host cache bypass + no-store maradjon aktív. Ne állítsd vissza a régi nyilvános PB-szabályokat.

## Azonnali visszaállítás hiba esetén

A telepítő kiírja a mentés pontos útvonalát. Ha a telepítés elakadt, ne futtasd újra vakon. Ha még nem érkeztek új feltöltések/módosítások, ezt a konkrét mentési útvonallal futtasd:

```bash
bash /root/prism-gallery-release/rollback.sh /opt/pocketbase/prism-backup-KIIRT_IDOBELYEG
```

A visszaállítás az egész adatbázist a telepítés előtti állapotra teszi. Az azóta keletkezett adatokat külön `data-after-install` könyvtárba félreteszi, de azok az oldalon nem lesznek elérhetők, amíg nem egyeztetjük őket. A frontend új belépése ilyen visszaállítás után nem működik; a privát hozzáférés zárva marad. Hiányos mentés esetén a rollback megtagadja a futást; ha a másolás alatt állt le a telepítő, és még nem kezdődött el a migráció, az eredeti adatbázis változatlan, a szolgáltatás újraindítható.

Ne használd a `migrate down/up` párost rutin visszaállításra: a down szándékosan csak a hozzáférést zárja le, az új profiladatokat nem törli. Az admin által létrehozott teljes biztonsági mentés is képeket tartalmaz; ennek megőrzését/törlését a saját üzemeltetési scriptedbe vedd fel.

## Ellenőrzés fejlesztéskor

```powershell
node scripts/test-gallery-backend.mjs C:\UTVONAL\pocketbase.exe
npm run build
```

A teszt kizárólag friss, ideiglenes könyvtárat és localhost címet használ, soha nem az éles adatokat. Ellenőrzi az adminjogosultságot, privát képek és galériák elkülönítését, tokeneket, jelszócserét, kijelentkezést, lejáratot, vendégkedvenceket és belépési korlátokat. A telepítő shell-szintaxisa ellenőrizhető; a Hetzner systemd/mentési lépéseit csak az éles telepítés igazolja.

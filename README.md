# Activity Tracker 
Tvoj osebni pomočnik za bolj organiziran dan.
Aplikacija za beleženje, urejanje in brisanje aktivnosti, ki samodejno odstrani pretekle aktivnosti in poudari tiste, ki so v naslednjih 48 urah.

# Zahteve
- Node.js (vsaj verzija 16)
- Npm 
- Sodobni brskalnik (Chrome, Firefox, Edge, Safari)

# Namestitev
- Kloniraj repozitorij (git clone <URL_REPOZITORIJA> in cd <IME_MAPE>)
- Namesti odvisnosti (npm install ali yarn install)
- Zagon aplikacije (npm start ali yarn start)

Aplikacija se bo odprla na http://localhost:3000 v tvojem brskalniku.

# Uporaba
- Klikni + Dodaj za ustvarjanje nove aktivnosti.
- Vnesi ime aktivnosti (obvezno), opis, datum (obvezno v sedanjosti ali prihodnosti), trajanje (obvezno pozitivno) in kategorijo.
- Aktivnosti lahko urejaš ali izbrišeš s klikom na gumbe na kartici.
- Aktivnosti, ki so danes ali v naslednjih 48 urah, so obarvane rdeče.
- Pretekle aktivnosti se samodejno odstranijo vsak dan ob polnoči.
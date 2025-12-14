OPIS TESTOV

TEST CreateZapis() 

Ta test preverja, ali je mogoče dodati nov zapis v aplikacijo. Test vključuje dva scenarija:

**Pozitivni scenarij**: Dodajanje zapisa z veljavnimi podatki (ime, opis, napredek).

**Negativni scenarij**: Dodajanje zapisa, ko je ime zapisa prazno, kar mora aplikacija zavrniti.

Zakaj je pomemben:

Zagotavlja, da osnovna funkcionalnost dodajanja zapisov deluje in da sistem pravilno validira vhodne podatke, kar preprečuje shranjevanje nepopolnih ali napačnih zapisov.

TEST filterZapis()

Ta test preverja, ali REST endpoint za filtriranje zapisov pravilno vrača rezultate glede na podane iskalne kriterije. Test vključuje dva scenarija:

**Pozitivni scenarij** (FilterZapis_Found): Filtriranje zapisov po imenu, ki obstaja v sistemu. Preveri, da backend: vrne uspešen odgovor (200 OK), vrne vsaj en zapis in da se ime vrnjenega zapisa ujema z iskanim kriterijem.

**Negativni scenarij** (FilterZapis_NotFound): Filtriranje zapisov po imenu, ki ne obstaja v sistemu. Preveri, da backend: vrne uspešen odgovor (200 OK), vrne prazno listo, brez napak ali nepravilnih podatkov.

Zakaj je pomemben:

Zagotavlja pravilno delovanje funkcionalnosti filtriranja, ki jo uporablja frontend in preverja, da aplikacija pravilno obravnava primere, ko ni zadetkov, in se ne sesuje ali vrne napačnega statusa.

TEST updateProgress()

Ta test preverja, ali je mogoče posodobiti napredek obstoječega zapisa. Test vključuje dva scenarija:

**Pozitivni scenarij**: Posodobitev napredka za obstoječi zapis – preveri, da se vrednost dejansko spremeni.

**Negativni scenarij**: Poskus posodobitve napredka neobstoječega zapisa – preveri, da aplikacija vrne ustrezno napako (npr. 404 Not Found).

Zakaj je pomemben:

Preverja robustnost backend-a, da se obravnavajo napake in da uporabnik ne more spreminjati zapisov, ki ne obstajajo.

TEST deleteZapis()

Ta test preverja, ali je mogoče izbrisati obstoječi zapis v aplikaciji. Test vključuje dva scenarija:

**Pozitivni scenarij**: Brisanje obstoječega zapisa z veljavnim ID-jem – preveri, da je zapis dejansko izbrisan iz baze.

**Negativni scenarij**: Poskus brisanja neobstoječega zapisa (ID, ki ne obstaja v bazi) – preveri, da aplikacija ne vrne napake in da zapis ostane neizbrisan, ker zapis ne obstaja.

Zakaj je pomemben:

Preverja, da sistem omogoča pravilno brisanje zapisov in da ob neobstoječih zapisih deluje brez napak. Zagotavlja, da uporabnik ne more izbrisati zapisa, ki ne obstaja, ter da sistem omogoča robustno obvladovanje napak, kar preprečuje neželeno vedenje aplikacije.


TEST updateZapis()

Ta test preverja, ali je mogoče uspešno posodobiti obstoječi zapis v aplikaciji.

**Pozitivni scenarij**:
Posodobitev zapisa za obstoječi ID. Test preveri, da se vrednosti polj zapis in opis v bazi dejansko spremenijo na nove vrednosti, medtem ko ostali podatki (npr. napredek) ostanejo nespremenjeni.

**Negativni scenarij**:
Poskus posodobitve zapisa z ID-jem, ki ne obstaja v bazi. Test preveri, da aplikacija ob takem poskusu pravilno obravnava napako in ne spremeni nobenih podatkov.

Zakaj je pomemben:

Test zagotavlja, da aplikacija omogoča urejanje obstoječih zapisov in da se spremembe pravilno shranijo v bazo. Hkrati preverja robustnost sistema, saj preprečuje posodabljanje zapisov, ki ne obstajajo, kar zmanjšuje možnost napak in nekonsistentnih podatkov.

TEST getZapis()

Ta test preverja delovanje REST endpointa, ki vrača seznam vseh zapisov v sistemu.

**Pozitivni scenarij**:
V bazi obstajajo zapisi. Test preveri, da metoda vrne seznam zapisov, da seznam ni prazen ter da število vrnjenih zapisov ustreza številu zapisov, shranjenih v bazi.

**Negativni scenarij**:
V bazi ni nobenega zapisa. Test preveri, da metoda vrne prazen seznam in da se aplikacija pri tem ne sesuje ali vrne napačnih podatkov.

Zakaj je pomemben:

Test zagotavlja, da aplikacija pravilno vrača podatke za prikaz na frontendu ter da zna pravilno obravnavati tudi primere, ko v sistemu ni podatkov.

ANALIZA USPEŠNOSTI TESTOV

Pri prvem testu je negativni scenarij "padel", saj aplikacija sprva ni validirala praznega imena. To smo popravili tako, da smo V entiteti Zapis je dodali @NotBlank na polje zapis, s tem preverjamo, da vrednost ni prazna oziroma null. S te se preprečuje shranjevanje zapisov brez imena, kar pomaga pri tem, da so podatki v bazi vedno smiselni in popolni.

Pri drugem testu, nismo rabili ničesar popravljati, saj sta se oba scenarija uspešno izvedla.

Pri tretjem testu, nismo rabili ničesar popravljati, saj sta se oba scenarija uspešno izvedla.

Pri četrtem testu, nismo rabili ničesar popravljati, saj sta se oba scenarija uspešno izvedla.

Pri petem testu sta se oba scenarija uspešno izvedla.

Pri šestem testu sta se pravtako oba scenarija uspešno izvedla.
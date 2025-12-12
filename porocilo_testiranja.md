OPIS TESTOV

TEST CreateZapis()
Ta test preverja, ali je mogoče dodati nov zapis v aplikacijo. Test vključuje dva scenarija:
**Pozitivni scenarij**: Dodajanje zapisa z veljavnimi podatki (ime, opis, napredek).
**Negativni scenarij**: Dodajanje zapisa, ko je ime zapisa prazno, kar mora aplikacija zavrniti.

Zakaj je pomemben:
Zagotavlja, da osnovna funkcionalnost dodajanja zapisov deluje in da sistem pravilno validira vhodne podatke, kar preprečuje shranjevanje nepopolnih ali napačnih zapisov.

TEST updateProgress()
Ta test preverja, ali je mogoče posodobiti napredek obstoječega zapisa. Test vključuje dva scenarija:
**Pozitivni scenarij**: Posodobitev napredka za obstoječi zapis – preveri, da se vrednost dejansko spremeni.
**Negativni scenarij**: Poskus posodobitve napredka neobstoječega zapisa – preveri, da aplikacija vrne ustrezno napako (npr. 404 Not Found).

Zakaj je pomemben:
Preverja robustnost backend-a, da se obravnavajo napake in da uporabnik ne more spreminjati zapisov, ki ne obstajajo.


ANALIZA USPEŠNOSTI TESTOV

Pri prvem testu je negativni scenarij "padel", saj aplikacija sprva ni validirala praznega imena. To smo popravili tako, da smo V entiteti Zapis je dodali @NotBlank na polje zapis, s tem preverjamo, da vrednost ni prazna oziroma null. S te se preprečuje shranjevanje zapisov brez imena, kar pomaga pri tem, da so podatki v bazi vedno smiselni in popolni.

Pri drugem testu, nismo rabili ničesar popravljati, saj sta se oba scenarija uspešno izvedla.

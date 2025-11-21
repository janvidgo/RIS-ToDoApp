ToDoApp

Vizija
ToDoApp je sodobna aplikacija za upravljanje opravil, zasnovana je z namenom, da uporabnikom olajša organizacijo vsakodnevnih zadolžitev. Aplikacija omogoča hitro dodajanje opravil, urejanje njihovih podatkov ter brisanje. Za boljšo preglednost vsebuje filtriranje po imenu opravila ter po minimalnem ali maksimalnem napredku, kar uporabniku omogoča, da najde hitro želene informacije. Poseben poudarek je namenjen vizualni predstavitvi napredka: barvna lestvica (rdeča – rumena – zelena) intuitivno prikaže, kako daleč je opravilo izvedeno. Tako uporabnik že na prvi pogled vidi stanje posameznega opravila. Aplikacija ponuja tudi možnost ponastavitve vseh filtrov, pri čemer se ponovno prikaže celoten seznam opravil. ToDoApp združuje preprostost in preglednost, ki uporabniku omogoča, da enostavno spremlja in upravlja svoja opravila.

Struktura projekta
```
ToDoApp/
├── Backend/
│   ├── .idea/  
│   ├── todo_app/  
│   ├── .mvn/wrapper/ 
│   │   └── maven-wrapper.properties
│   ├── src/              
│   │   ├── main/
│   │   ├── java/si/um/feri/ris/todo_app/
│   │   │   ├── repository/
│   │   │   ├── restController/ 
│   │   │   ├── vao/
│   │   │   └── TodoAppApplication.java
│   │   │
│   │   └── resources/
│   │       └── application.properties
│   │
│   └── test/java/si/um/feri/ris/todo_app/
│       └── TodoAppApplicationTests.java
│   ├── pom.xml  
│   ├── mvnw, mvnw.cmd
│   ├── .gitignore           
│   └── .gitattributes
│
├── Frontend/ 
│   ├── css/
│   │   └── style.css 
│   ├── js/
│   │   └── notes.js 
│   ├── notes.html 
│   ├── server.js
│   ├── package.json
│   ├── package-lock.json
│   └── .gitignore
│
├── TO_DO mysql.sql 
└── README.md
```

Orodja, ogrodja, knjižnice in različice
- Java JDK 21
- Maven 4.0.0
- Spring Boot Maven Plugin
- Maven Complier Plugin
- Spring Boot 3.5.6
- Spring Boot Starter Web 3.5.6
- Spring Boot Starter Data JPA 3.5.6
- MySQL Connector/J 
- Lombok
- Spring Boot Starter Test

Okolje za razvoj
- IDE: IntelliJ IDEA / Eclipse / VS Code z Java podporo
- Baza: MySQL 8.x 
- Strežnik: Vgrajen Spring Boot Tomcat strežnik
- Port aplikacije:	 8080 
- Frontend: HTML, CSS, JavaScript (Fetch API + SweetAlert2 + Bootstrap 5)

Standardi kodiranja
- Paketi: zapisani z malimi črkami
- Razredi: PascalCase
- Metode in spremenljivke: camelCase
- Konstante: velike tiskane črke (npr. MAX_PROGRESS)
- Zamiki: štirje presledki
- Komentarji: uporaba JavaDoc 
- API poti: snake-case GET /zapis, PUT /zapis/{id}, DELETE /zapis/{id}
- Arhitektura: MVC (Controller → Service → Repository → Model)


NAVODILA ZA NAMEŠČANJE IN ZAGON APLIKACIJE

Za zagon naše To-do aplikacije moramo najprej imeti na računalniku nameščeno razvijalno okolje. Zaradi tega, ker je aplikacija napisana v programskem jeziku Java (21) je priporočljivo imeti razvijalno okolje IntelliJ IDEA verzija 2023.3 ali novejše. Če bo uporabnik uporabljal katero drugo razvijalno okolje, ki nima vgrajenega Maven-a, si mora naložiti še slednjega. Ko imamo razvijalno okolje nameščeno, potrebujemo Java Development Kit (JDK) 21.

Ker aplikacija uporablja MySQL driver je potrebno namestiti MySQL Server, ustvariti bazo, uporabnika in geslo: GesloZaEkipo123, saj je tako nastavljeno v application.properties datoteki. Za delo s podatkovno bazo mora imeti nameščeno tudi orodje, npr. MySQL Workbench – priporočena verzija za MySQL Workbench je 8.0.

Ker frontend uporablja Node.js in Express za zagon lokalnega strežnika, mora uporabnik namestiti: Node.js (namestitev samodejno vključuje program npm) in nato v mapi frontenda izvesti ukaz: **npm install**. S tem se ustvari mapa node_modules in namesti Express ter ostale potrebne knjižnice. Ko so knjižnice nameščene, frontend zažene z: **npm start**. Aplikacija se nato odpre na naslovu: http://localhost:3123/notes.html.

NAVODILA ZA RAZVIJALCE

DELO Z GIT REPOZITORIJEM
-Pred začetkom dela vedno pridobi najnovejšo verzijo kode:
       git pull origin main
-Po končanem delu dodaj in potrdi spremembe:
       git add .
       git commit -m "Kratek opis spremembe"
-Nato spremembe objavi na repozitorij:
       git push origin main
-Uporabljaj kratka in jasna sporočila, ki opisujejo, kaj si naredil:
       ✅ Dodana funkcionalnost za urejanje nalog
       ✅ Popravljena napaka pri validaciji vnosa
       ❌ popravek ali test


PRAVILA ZA PRISPEVANJE
-Po končanem delu preveri, da se projekt uspešno prevede
-Preveri, da aplikacija deluje brez napak in da spremembe ne povzročajo težav v drugih delih sistema
-Testiraj osnovne funkcionalnosti aplikacije (dodajanje, urejanje, brisanje nalog) in preveri, da delujejo pravilno
-Ne briši ali spreminjaj kode drugih članov brez dogovora
-Če spremeniš strukturo projekta ali datotek, o tem obvesti ekipo.

SLOG IN STANDARD KODE
Backend (Java, Maven)
-Uporabljaj Java 21 in sledi standardnim Java konvencijam (camelCase za metode in spremenljivke, PascalCase za razrede)
-Logiko razdeli po slojih: restController, vao, repository
-Vse naj bo v paketu si.um.feri.ris.todo_app
Frontend(Node.js)
-Poskrbi, da so vsi zahtevki na backend jasno definirani in testirani
-Uporabljaj Bootstrap 5.3.0
-Imena id-jev in class-ov naj bodo v camelCase

BESEDNJAK

| Ime                  | Opis                                                                 |
|----------------------|----------------------------------------------------------------------|
| **Naloga**           | Element v seznamu, ki predstavlja posamezno obveznost ali aktivnost, ki jo želi uporabnik opraviti. |
| **Ime naloge**       | Naslov naloge, ki na kratko opisuje, za kaj gre.                     |
| **Opis naloge**      | Dodatno besedilo informacij o nalogi; uporabnik lahko zapiše podrobnosti ali opombe. |
| **Dodaj**            | Gumb, s katerim uporabnik ustvari novo nalogo in jo doda v seznam.   |
| **To-do list**       | Glavni del aplikacije, kjer so izpisane vse dodane naloge. Prikazuje ime, minimalni napredek, maksimalni napredek, gumb za filtriranje in gumb ponastavi. |
| **Napredek**         | Odstotek, ki prikazuje, kako daleč je uporabnik z izvedbo naloge.    |
| **Minimalni napredek** | Spodnja vrednost, ko želimo filtrirati naloge po odstotku opravljenosti. |
| **Maksimalni napredek** | Zgornja vrednost, ko želimo filtrirati naloge po odstotku opravljenosti. |
| **Uredi**            | Gumb, ki omogoča spreminjanje: imena naloge, opisa, napredka.        |
| **Uredi zapis**      | Pojavno okno, kjer lahko uporabnik spremeni ime naloge ali opis naloge. |
| **Uredi napredek**   | Pojavno okno, kjer lahko uporabnik nastavi odstotek napredka z drsnikom. |
| **Izbriši**          | Gumb za trajno odstranitev naloge iz seznama.                        |
| **Shrani**           | Gumb, ki potrdi spremembe pri urejanju.                              |
| **Prekliči**         | Gumb, ki zapre okno za urejanje brez shranjevanja sprememb.          |
| **Filtriraj**        | Razdelek, ki omogoča iskanje nalog glede na: ime, minimalni napredek, maksimalni napredek. |
| **Ponastavi**        | Gumb, ki izbriše filtre in ponovno prikaže vse naloge.               |


DIAGRAM POTEKA UPORABE

<img width="668" height="691" alt="DPU_ris drawio (2)" src="https://github.com/user-attachments/assets/1976499a-8ff2-4647-9fb8-17bfe36dccd4" />




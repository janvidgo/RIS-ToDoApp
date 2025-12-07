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

PODROBEN OPIS VSEH PRIMEROV UPORABE

<img width="641" height="395" alt="id1" src="https://github.com/user-attachments/assets/9e2af5f9-ad40-4c21-b0b5-f6ae5fde1d4b" />


<img width="653" height="394" alt="Screenshot 2025-11-23 at 19 35 49" src="https://github.com/user-attachments/assets/8be65407-adf1-4fc3-ae33-b7457fdae83e" />


<img width="649" height="322" alt="Screenshot 2025-11-23 at 19 35 53" src="https://github.com/user-attachments/assets/37962798-86d5-4c33-8ab9-4754d70faa4a" />


<img width="637" height="368" alt="id4" src="https://github.com/user-attachments/assets/0acd41d4-363a-4950-bb0a-83d5deb271b2" />


<img width="647" height="283" alt="Screenshot 2025-11-23 at 19 35 10" src="https://github.com/user-attachments/assets/f82efbd0-a6ba-4397-9c95-ed6983129e41" />


<img width="655" height="291" alt="Screenshot 2025-11-23 at 19 35 14" src="https://github.com/user-attachments/assets/c00bdc48-b171-4af5-aa1c-248af594fab4" />


<img width="656" height="294" alt="Screenshot 2025-11-23 at 19 35 44" src="https://github.com/user-attachments/assets/714f8fe7-fca7-4f6e-bce1-c7805a6cb254" />


<img width="642" height="363" alt="id8" src="https://github.com/user-attachments/assets/e806bcd0-687f-4015-858d-ab9ec9c52788" />


<img width="658" height="401" alt="Screenshot 2025-11-23 at 19 35 56" src="https://github.com/user-attachments/assets/c7ef718f-f267-4a9f-bef9-8ab99e7bfa30" />


<img width="638" height="406" alt="id9" src="https://github.com/user-attachments/assets/9b46d937-2c71-4fe1-ae81-0853f365be67" />


<img width="644" height="303" alt="id11" src="https://github.com/user-attachments/assets/371eecdd-259d-424a-9536-fd3cd86d1ad4" />


<img width="639" height="444" alt="Screenshot 2025-11-23 204953" src="https://github.com/user-attachments/assets/3dd7c21b-c2d6-427d-822b-a5ac964f5e92" />


RAZREDNI DIAGRAM

<img width="622" height="589" alt="razredni_diagram_ris drawio (1)" src="https://github.com/user-attachments/assets/7b6ee5cf-2ad9-4c71-a346-100dbc3f2efc" />

RAZLAGA RAZREDNEGA DIAGRAMA

1. Razred Admin

Vloga:
Predstavlja skrbnika sistema, ki ima višje pravice kot običajni uporabnik.
Upravljalni razred, namenjen administraciji uporabnikov.

Namen:
Omogoča dodajanje novih uporabnikov.
Omogoča urejanje in brisanje obstoječih uporabnikov.

Ključne metode:
dodajUporabnika(): Ustvari novega uporabnika in ga zapiše v sistem.
izbrisiUporabnika(): Odstrani izbranega uporabnika.
urediUporabnika(): Posodobi podatke o uporabniku.


2. Razred Uporabnik

Vloga:
Predstavlja običajnega uporabnika aplikacije.
Uporabnik lahko ustvarja, ureja in briše svoja opravila.

Namen:
Omogoča upravljanje s svojimi opravili.
Shrani njegove osnovne podatke (e-mail, geslo, uporabniško ime).

Ključne metode:
ustvariOpravilo(): Uporabnik ustvari novo opravilo.
urediOpravilo(): Uporabnik spremeni lastnosti izbranega opravila.
izbrisiOpravilo(opravilo): Uporabnik odstrani opravilo iz svojega seznama.


3. Razred Opravilo

Vloga:
Predstavlja posamezno nalogo, ki jo uporabnik želi izvesti.
Povezana je z enim opomnikom (lahko ga ima ali pa ne).

Namen:
Hrani podatke o nalogi: ime, opis, napredek, rok izvedbe.
Omogoča sledenje napredku in dodajanje opomnikov.

Ključne metode:
posodobiNapredek(napredek): Nastavi nov napredek opravila (npr. 40%, 50%...).
ustvariOpomnik(opomnik): Poveže opravilo z opomnikom.


4. Razred Opomnik

Vloga:
Predstavlja opomnik za posamezno opravilo.
Lahko vsebuje opombo in datum, ko naj uporabnik prejme opomnik.

Namen:
Omogoča uporabniku, da se spomni na svoje naloge.
Povezan je 1–1 z enim opravilom (lahko tudi 0, pomeni da opravilo nima opomnika).

Ključne lastnosti (ni metod):
datum: Kdaj opomniti uporabnika.
opomba: Kratek opis ali opomba.


5. Razred TaskRepository

Vloga:
Služi kot podatkovni sloj (ang. Repository).
Zadolžen je za iskanje in branje opravil iz baze podatkov ali pomnilnika.

Namen:
Ločuje logiko iskanja podatkov od uporabniškega in poslovnega dela aplikacije.
Omogoča organizirano pridobivanje opravil.

Ključne metode:
findByName(): Poišče opravila glede na ime.
findByProgress(): Poišče opravila z določenim napredkom.
findByNameAndProgress(): Naprednejše filtriranje.
getAll(): Vrne seznam vseh opravil.


6. Razred ReportService

Vloga:
Zadolžen za ustvarjanje poročil in izvoz podatkov.
Pripada poslovni logiki, ki dela z gotovimi seznami opravil.

Namen:
Uporabniku ali administratorju omogoča pregled nad opravili.
Pretvarja podatke v uporabne formate (PDF, CSV).

Ključne metode:
generirajTedenskiPregled(): Ustvari tedensko poročilo (statistiko, povzetke).
izvozCSV(seznamOpravil): Izvozi opravila v CSV datoteko.
izvozPDF(seznamOpravil): Ustvari PDF poročilo opravil.


Nova funkcionalnost 

Kot dodatno funkcionalnost smo implementirali izvoz opravil v pdf in csv datoteko. Nova funkcionalnost deluje tako, da uporabnik klikne na gumb “Izvozi vidne naloge” nato se mu odpre modalno okno, kjer lahko izbere ali bo izvozil v pdf ali v csv datoteko. Po kliku na “PDF” se prenese uporabniku na računalniku PDF datoteka naloge.pdf. Po kliku “CSV” pa se prenese uporabniku na računalnik CSV datoteka naloge.csv. 



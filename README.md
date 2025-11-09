ToDoApp
Aplikacija ToDoApp je razvita s pomočjo Spring Boot, MySQL in JavaScript. Opravila lahko dodajamo na seznam, tako da vnesemo ime, opis in nastavimo napredek. Podatke posameznega opravila lahko urejamo lahko pa tudi celo opravilo izbrišemo. Aplikacija pa nam omogoča tudi, da filtriramo po posameznem imenu opravila ali minimalnem oz. maksimalnem napredku.  Za boljšo vizualno predstavitev napredka opravila, je prikazana barvna lestvica opravila. Ta vsebuje tri stopnje: rdeča, rumena in zelena. V kolikor ne želimo prikaza filtriranih opravil, lahko kliknemo na gumb, ki nam ponastavi filtre in prikaže vse zapise. 

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

Navodila za nameščanje in zagon aplikacije


Za zagon naše To-do aplikacije moramo najprej imeti na računalniku nameščeno razvijalno okolje. Zaradi tega, ker je aplikacija napisana v programskem jeziku Java (21) je priporočljivo imeti razvijalno okolje IntelliJ IDEA verzija 2023.3 ali novejše. Če bo uporabnik uporabljal katero drugo razvijalno okolje, ki nima vgrajenega Maven-a, si mora naložiti še slednjega. Ko imamo razvijalno okolje nameščeno, potrebujemo Java Development Kit (JDK) 21.
 
Ker aplikacija uporablja MySQL driver je potrebno namestiti MySQL Server, ustvariti bazo, uporabnika in geslo: GesloZaEkipo123, saj je tako nastavljeno v application.properties datoteki. Za delo s podatkovno bazo mora imeti nameščeno tudi orodje, npr. MySQL Workbench.
 
Ker frontend uporablja Node.js in Express za zagon lokalnega strežnika, mora uporabnik namestiti: Node.js (namestitev samodejno vključuje program npm) in nato v mapi frontenda izvesti ukaz: npm install.  S tem se ustvari mapa node_modules in namesti Express ter ostale potrebne knjižnice. Ko so knjižnice nameščene, frontend zažene z: npm start. Aplikacija se nato odpre na naslovu: http://localhost:3123/notes.html.

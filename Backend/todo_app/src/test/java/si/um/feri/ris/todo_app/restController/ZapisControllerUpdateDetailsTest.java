package si.um.feri.ris.todo_app.restController;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import si.um.feri.ris.todo_app.repository.SlikeRepository;
import si.um.feri.ris.todo_app.repository.ZapisRepository;
import si.um.feri.ris.todo_app.vao.Zapis;

import java.util.Date;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional  // vsaka metoda se izvede v transakciji in se na koncu rollback-a
public class ZapisControllerUpdateDetailsTest {  // poimenoval sem ga po novi metodi

    @Autowired
    private ZapisRepository zapisRepository;

    @Autowired
    private zapisController zapisController;  // controller ima zdaj updateDetails

    @Autowired
    private SlikeRepository slikeRepository;

    private Zapis testZapis;

    @BeforeEach
    public void setup() {
        // Počistimo bazo pred vsakim testom
        slikeRepository.deleteAll();
        zapisRepository.deleteAll();

        testZapis = new Zapis();
        testZapis.setZapis("Stari naslov naloge");
        testZapis.setOpis("To je star opis");
        testZapis.setSituacija(30);
        testZapis.setDatum(null);  // brez roka na začetku

        testZapis = zapisRepository.save(testZapis);  // pomembno: po save() dobiš ID
    }

    /**
     * Pozitivni test: uspešna posodobitev imena, opisa in roka
     */
    @Test
    public void testUpdateDetails_Positive() {
        // Pripravimo podatke za posodobitev
        Zapis update = new Zapis();
        update.setZapis("Nov naslov naloge");
        update.setOpis("To je popolnoma nov opis");
        update.setDatum(new Date());  // dodamo tudi rok (trenutni datum)

        // Pokličemo novo metodo v controllerju
        zapisController.updateDetails(testZapis.getZapisID(), update);

        // Preverimo, če se je v bazi res posodobilo
        Zapis updated = zapisRepository.findById(testZapis.getZapisID())
                .orElseThrow(() -> new RuntimeException("Zapis ni bil najden po posodobitvi"));

        assertEquals("Nov naslov naloge", updated.getZapis());
        assertEquals("To je popolnoma nov opis", updated.getOpis());
        assertNotNull(updated.getDatum(), "Rok bi moral biti nastavljen");
        assertEquals(30, updated.getSituacija(), "Napredek se ne sme spremeniti pri tem endpointu");
    }

    /**
     * Pozitivni test 2: posodobitev brez roka (datum = null)
     */
    @Test
    public void testUpdateDetails_WithoutDueDate() {
        Zapis update = new Zapis();
        update.setZapis("Brez roka naslov");
        update.setOpis("Opis brez datuma");
        update.setDatum(null);

        zapisController.updateDetails(testZapis.getZapisID(), update);

        Zapis updated = zapisRepository.findById(testZapis.getZapisID()).orElseThrow();

        assertEquals("Brez roka naslov", updated.getZapis());
        assertEquals("Opis brez datuma", updated.getOpis());
        assertNull(updated.getDatum(), "Rok mora biti null");
    }

    /**
     * Negativni test: poskus posodobitve neobstoječega zapisa
     */
    @Test
    public void testUpdateDetails_NonExistent() {
        Zapis update = new Zapis();
        update.setZapis("Neki");
        update.setOpis("Neki opis");

        // Pričakujemo ResponseStatusException z NOT_FOUND (404)
        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> {
            zapisController.updateDetails(999999, update);
        });

        assertEquals(404, exception.getStatusCode().value());
        assertTrue(exception.getReason().contains("ne obstaja") || exception.getReason().contains("NOT_FOUND"));
    }

    @AfterEach
    void cleanup() {
        // @Transactional že poskrbi za rollback, ampak za vsak primer
        slikeRepository.deleteAll();
        zapisRepository.deleteAll();
    }
}
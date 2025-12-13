package si.um.feri.ris.todo_app.restController;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import si.um.feri.ris.todo_app.repository.ZapisRepository;
import si.um.feri.ris.todo_app.vao.Zapis;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional  // Poskrbi, da se po testu vse spremembe v bazi povrnejo
public class ZapisControllerUpdateProgressTest {

    @Autowired
    private ZapisRepository zapisRepository;

    @Autowired
    private zapisController zapisController;

    private Zapis testZapis;

    @BeforeEach
    public void setup() {
        // Priprava testnega zapisa
        zapisRepository.deleteAll();

        testZapis = new Zapis();
        testZapis.setZapisID(15);
        testZapis.setZapis("Začetni zapis");
        testZapis.setOpis("Opis začetnega zapisa");
        testZapis.setSituacija(10); // začetni napredek
        zapisRepository.save(testZapis);
    }

    /**
     * Pozitivni scenarij: Preverja, ali je updateProgress uspešen za obstoječi zapis.
     */
    @Test
    public void testUpdateProgress_Positive() {
        Zapis update = new Zapis();
        update.setSituacija(90); // nova vrednost

        // Klic metode za update
        zapisController.updateProgress(testZapis.getZapisID(), update);

        // Preverjanje, da se je situacija dejansko spremenila
        Zapis updatedZapis = zapisRepository.findById(testZapis.getZapisID()).orElseThrow();
        assertEquals(90, updatedZapis.getSituacija(), "Situacija mora biti posodobljena na 90");
    }

    /**
     * Negativni scenarij: Preverja, da se vrže napaka ob poskusu updateProgress za neobstoječi zapis.
     */
    @Test
    public void testUpdateProgress_NonExistent() {
        Zapis update = new Zapis();
        update.setSituacija(50);

        // Poskus posodobitve z neobstoječim ID-jem mora vrniti ResponseStatusException
        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> {
            zapisController.updateProgress(999, update);
        });

        assertEquals("404 NOT_FOUND \"Zapis not found\"", exception.getMessage(),
                "Pri neobstoječem zapisu mora biti vržen 404 Not Found");
    }
}

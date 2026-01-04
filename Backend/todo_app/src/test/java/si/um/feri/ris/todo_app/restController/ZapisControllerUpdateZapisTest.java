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

import java.util.NoSuchElementException;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
public class ZapisControllerUpdateZapisTest {

    @Autowired
    private ZapisRepository zapisRepository;

    @Autowired
    private zapisController zapisController;

    @Autowired
    private SlikeRepository slikeRepository;

    private Zapis testZapis;

    @BeforeEach
    public void setup() {
        slikeRepository.deleteAll();
        zapisRepository.deleteAll();

        testZapis = new Zapis();
        testZapis.setZapis("Stari zapis");
        testZapis.setOpis("Star opis");
        testZapis.setSituacija(10);

        zapisRepository.save(testZapis);
    }

    /**
     * Pozitivni scenarij: uspešna posodobitev zapisa in opisa
     */
    @Test
    public void testUpdateZapis_Positive() {
        Zapis update = new Zapis();
        update.setZapis("Nov zapis");
        update.setOpis("Nov opis");

        zapisController.updateZapis(testZapis.getZapisID(), update);

        Zapis updated = zapisRepository.findById(testZapis.getZapisID()).orElseThrow();

        assertEquals("Nov zapis", updated.getZapis());
        assertEquals("Nov opis", updated.getOpis());
        assertEquals(10, updated.getSituacija(), "Situacija se ne sme spremeniti");
    }

    /**
     * Negativni scenarij: update neobstoječega zapisa
     */
    @Test
    public void testUpdateZapis_NonExistent() {
        Zapis update = new Zapis();
        update.setZapis("Test");
        update.setOpis("Test opis");

        assertThrows(NoSuchElementException.class, () -> {
            zapisController.updateZapis(999, update);
        });
    }

    @AfterEach
    void cleanup() {
        slikeRepository.deleteAll();
        zapisRepository.deleteAll();
    }

}

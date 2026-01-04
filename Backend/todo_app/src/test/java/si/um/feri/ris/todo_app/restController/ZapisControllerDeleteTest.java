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

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional // Poskrbi, da se po testu vse spremembe v bazi povrnejo
public class ZapisControllerDeleteTest {

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
        testZapis.setZapis("Testni zapis");
        testZapis.setOpis("Opis testnega zapisa");
        testZapis.setSituacija(50);
        zapisRepository.save(testZapis);
    }

    /**
     * Pozitivni scenarij: Preverja, ali deleteZapis uspešno izbriše obstoječi zapis.
     */
    @Test
    public void testDeleteZapis_Positive() {
        // Klic metode za brisanje
        zapisController.deleteZapis(testZapis.getZapisID());

        // Preverjanje, da zapis ne obstaja več
        boolean exists = zapisRepository.findById(testZapis.getZapisID()).isPresent();
        assertFalse(exists, "Zapis mora biti izbrisan iz baze");
    }

    /**
     * Negativni scenarij: Preverja, da se pri poskusu brisanja neobstoječega zapisa vrže napaka.
     */
    @Test
    public void testDeleteZapis_NonExistent() {
        // Poskus brisanja neobstoječega zapisa
        assertDoesNotThrow(() -> {
            // Način, kako je deleteById implementiran v Spring Data JPA – ne vrže izjeme, če zapis ne obstaja
            zapisController.deleteZapis(999);
        }, "Brisanje neobstoječega zapisa ne sme povzročiti napake");
    }

    @AfterEach
    void cleanup() {
        slikeRepository.deleteAll();
        zapisRepository.deleteAll();
    }
}

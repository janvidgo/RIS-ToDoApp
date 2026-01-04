package si.um.feri.ris.todo_app.restController;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import si.um.feri.ris.todo_app.repository.SlikeRepository;
import si.um.feri.ris.todo_app.repository.ZapisRepository;
import si.um.feri.ris.todo_app.vao.Zapis;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
public class ZapisControllerGetZapisTest {

    @Autowired
    private ZapisRepository zapisRepository;

    @Autowired
    private zapisController zapisController;

    @Autowired
    private SlikeRepository slikeRepository;

    @BeforeEach
    public void setup() {
        slikeRepository.deleteAll();
        zapisRepository.deleteAll();

        Zapis z1 = new Zapis();
        z1.setZapis("Prvi zapis");
        z1.setOpis("Opis prvega");
        z1.setSituacija(20);

        Zapis z2 = new Zapis();
        z2.setZapis("Drugi zapis");
        z2.setOpis("Opis drugega");
        z2.setSituacija(50);

        zapisRepository.save(z1);
        zapisRepository.save(z2);
    }

    /**
     * Pozitivni scenarij: vrne vse zapise
     */
    @Test
    public void testGetZapis_ReturnsAll() {
        List<Zapis> result = zapisController.getZapis();

        assertNotNull(result, "Seznam ne sme biti null");
        assertEquals(2, result.size(), "Vrnjena morata biti 2 zapisa");

        assertEquals("Prvi zapis", result.get(0).getZapis());
        assertEquals("Drugi zapis", result.get(1).getZapis());
    }

    /**
     * Robni primer: prazna baza
     */
    @Test
    public void testGetZapis_EmptyList() {
        zapisRepository.deleteAll();

        List<Zapis> result = zapisController.getZapis();

        assertNotNull(result);
        assertTrue(result.isEmpty(), "Seznam mora biti prazen");
    }

    @AfterEach
    void cleanup() {
        slikeRepository.deleteAll();
        zapisRepository.deleteAll();
    }
}


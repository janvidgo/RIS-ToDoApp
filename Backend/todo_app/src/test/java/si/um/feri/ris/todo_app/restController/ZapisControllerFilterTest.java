package si.um.feri.ris.todo_app.restController;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import si.um.feri.ris.todo_app.repository.SlikeRepository;
import si.um.feri.ris.todo_app.repository.ZapisRepository;
import si.um.feri.ris.todo_app.vao.Zapis;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class ZapisControllerFilterTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private ZapisRepository zapisRepository;

    @Autowired
    private SlikeRepository slikeRepository;

    @Test
    public void testFilterZapis_Found() {
        slikeRepository.deleteAll();
        zapisRepository.deleteAll();

        // Najprej dodamo testni zapis
        Zapis zapis = new Zapis();
        zapis.setZapis("FilterTest");
        zapis.setOpis("Opis filter testa");
        zapis.setSituacija(30);
        restTemplate.postForEntity("/zapis", zapis, Zapis.class);

        // Kličemo filter po imenu
        String url = "/zapis/filter?zapis=FilterTest";
        ResponseEntity<Zapis[]> response = restTemplate.getForEntity(url, Zapis[].class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotEmpty();
        assertThat(response.getBody()[0].getZapis()).isEqualTo("FilterTest");
    }

    @Test
    public void testFilterZapis_NotFound() {
        // Kličemo filter z imenom, ki ne obstaja
        String url = "/zapis/filter?zapis=NeObstaja";
        ResponseEntity<Zapis[]> response = restTemplate.getForEntity(url, Zapis[].class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEmpty(); // pričakujemo prazno listo
    }

    @AfterEach
    void cleanup() {
        slikeRepository.deleteAll();
        zapisRepository.deleteAll();
    }
    
}

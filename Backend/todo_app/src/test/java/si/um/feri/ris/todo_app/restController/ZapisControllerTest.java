package si.um.feri.ris.todo_app.restController;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
//import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import si.um.feri.ris.todo_app.vao.Zapis;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class ZapisControllerTest {

    @Autowired
    private TestRestTemplate restTemplate; // Springov REST klient za testiranje

    @Test
public void testCreateZapis() {
    Zapis validZapis = new Zapis();
        validZapis.setZapis("Test naloga");
        validZapis.setOpis("Opis test naloge");
        validZapis.setSituacija(20);

        ResponseEntity<Zapis> validResponse = restTemplate.postForEntity("/zapis", validZapis, Zapis.class);

        // Preverimo, da je zapis uspešno dodan
        assertThat(validResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(validResponse.getBody()).isNotNull();
        assertThat(validResponse.getBody().getZapis()).isEqualTo("Test naloga");

        // ---------- NEGATIVNI SCENARIJ ----------
        Zapis invalidZapis = new Zapis();
        invalidZapis.setZapis(""); // prazno ime
        invalidZapis.setOpis("Opis test naloge");
        invalidZapis.setSituacija(20);

        ResponseEntity<String> invalidResponse = restTemplate.postForEntity("/zapis", invalidZapis, String.class);

        // Preverimo, da backend zavrne zahtevek z 400 Bad Request
        assertThat(invalidResponse.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }
    
}

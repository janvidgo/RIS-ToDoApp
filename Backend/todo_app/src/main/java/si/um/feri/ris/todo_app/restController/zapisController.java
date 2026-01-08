package si.um.feri.ris.todo_app.restController;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import org.springframework.web.server.ResponseStatusException;
import si.um.feri.ris.todo_app.repository.ZapisRepository;
import si.um.feri.ris.todo_app.vao.Zapis;

import java.util.List;

@CrossOrigin(origins = "http://localhost:3123")
@RestController
@RequestMapping("/zapis")
public class zapisController {

    @Autowired
    private ZapisRepository zapisRepository;

    // Vrne vse zapise
    @GetMapping
    public List<Zapis> getZapis() {
        return zapisRepository.findAll();
    }

    // Ustvari novo nalogo (z imenom, opisom, napredkom = 0, in rokom)
    @PostMapping
    public ResponseEntity<Zapis> createZapis(@Valid @RequestBody Zapis zapis) {
        Zapis saved = zapisRepository.save(zapis);
        return ResponseEntity.ok(saved);
    }

    // Izbriše nalogo
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteZapis(@PathVariable("id") int id) {
        if (!zapisRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Zapis ne obstaja");
        }
        zapisRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    // Posodobi samo napredek (situacija)
    @PutMapping("/{id}")
    public ResponseEntity<Zapis> updateProgress(@PathVariable("id") int id, @RequestBody Zapis posodobljenZapis) {
        Zapis zapis = zapisRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Zapis ne obstaja"));

        zapis.setSituacija(posodobljenZapis.getSituacija());
        Zapis saved = zapisRepository.save(zapis);

        return ResponseEntity.ok(saved);
    }

    // NOVO: Posodobi ime, opis IN rok (datum) – vse naenkrat
    @PutMapping("/details/{id}")
    public ResponseEntity<Zapis> updateDetails(@PathVariable("id") int id, @RequestBody Zapis posodobljen) {
        Zapis zapis = zapisRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Zapis ne obstaja"));

        zapis.setZapis(posodobljen.getZapis());
        zapis.setOpis(posodobljen.getOpis());
        zapis.setDatum(posodobljen.getDatum());  // <-- TU SHRANIMO ROK!

        Zapis saved = zapisRepository.save(zapis);
        return ResponseEntity.ok(saved);
    }

    // Filter (ostaja enak)
    @GetMapping("/filter")
    public List<Zapis> filter(
            @RequestParam(required = false) String zapis,
            @RequestParam(required = false) Integer min,
            @RequestParam(required = false) Integer max) {

        if (zapis != null && (max == null || min == null)) {
            return zapisRepository.findByZapisContainingIgnoreCase(zapis);
        }
        if (zapis == null && max != null && min != null) {
            return zapisRepository.findBySituacijaBetween(min, max);
        }
        if (zapis != null && max != null && min != null) {
            return zapisRepository.findByZapisContainingIgnoreCaseAndSituacijaBetween(zapis, min, max);
        }
        return zapisRepository.findAll();
    }
}
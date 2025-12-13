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

    @GetMapping
    public List<Zapis> getZapis() {
        return zapisRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<Zapis> createZapis(@Valid @RequestBody Zapis zapis) {
        Zapis saved = zapisRepository.save(zapis);
    return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public void deleteZapis(@PathVariable("id") int id) {
        zapisRepository.deleteById(id);
    }

    @PutMapping("/{id}")
    public void updateProgress(@PathVariable("id") int id, @RequestBody Zapis posodobljenZapis) {

        Zapis zapis = zapisRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Zapis not found"));

        zapis.setSituacija(posodobljenZapis.getSituacija());

        zapisRepository.save(zapis);
    }

    @PutMapping("/ime/{id}")
    public void updateZapis(@PathVariable("id") int id, @RequestBody Zapis zapis) {
        Zapis zapis1 = zapisRepository.findById(id).get();

        zapis1.setZapis(zapis.getZapis());
        zapis1.setOpis(zapis.getOpis());
        zapisRepository.save(zapis1);
    }

    @GetMapping("/filter")
    public List<Zapis> filter(@RequestParam(required = false) String zapis, @RequestParam(required = false) Integer min, @RequestParam(required = false) Integer max) {

        if (zapis != null && max == null && min == null) {
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

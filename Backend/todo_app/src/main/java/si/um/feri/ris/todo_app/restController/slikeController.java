package si.um.feri.ris.todo_app.restController;

import java.util.Base64;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import si.um.feri.ris.todo_app.repository.SlikeRepository;
import si.um.feri.ris.todo_app.repository.ZapisRepository;
import si.um.feri.ris.todo_app.vao.Slike;
import si.um.feri.ris.todo_app.vao.Zapis;

@CrossOrigin(origins = "http://localhost:3123")
@RestController
@RequestMapping("/slike")
public class slikeController {

    @Autowired
    private SlikeRepository slikeRepository;

    @Autowired
    private ZapisRepository zapisRepository;

    @PostMapping
    public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file,
                                     @RequestParam("zapisID") int zapisID) {
    try {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("Datoteka je prazna");
        }

        Zapis zapis = zapisRepository.findById(zapisID)
                .orElseThrow(() -> new RuntimeException("Zapis z ID " + zapisID + " ne obstaja"));

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return ResponseEntity.badRequest().body("Datoteka ni veljavna slika");
        }

        // Bolj varno branje bajtov
        byte[] bytes = file.getBytes();
        String base64 = "data:" + contentType + ";base64," +
                Base64.getEncoder().encodeToString(bytes);

        Slike sl = new Slike();
        sl.setSlika(base64);
        sl.setZapis(zapis);
        slikeRepository.save(sl);

        return ResponseEntity.ok().build();

    } catch (Exception e) {
        e.printStackTrace();  // Pomembno za diagnostiko!
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Napaka pri shranjevanju slike: " + e.getMessage());
    }
}

    @GetMapping("/naloga/{zapisID}")
    public List<Slike> getImages(@PathVariable int zapisID) {
        return slikeRepository.findByZapis_ZapisID(zapisID);
    }
}


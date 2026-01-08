package si.um.feri.ris.todo_app.vao;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "Slike")
public class Slike {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "SlikeID")
    private int slikeID;

    @Column(name = "Slika", columnDefinition = "LONGTEXT")
    private String slika;

    @ManyToOne
    @JoinColumn(name = "ZapisTK")
    @JsonIgnore
    private Zapis zapis;

    // Konstruktor
    public Slike() {}

    // GETTERJI in SETTERJI
    public int getSlikeID() {
        return slikeID;
    }

    public void setSlikeID(int slikeID) {
        this.slikeID = slikeID;
    }

    public String getSlika() {
        return slika;
    }

    public void setSlika(String slika) {
        this.slika = slika;
    }

    public Zapis getZapis() {
        return zapis;
    }

    public void setZapis(Zapis zapis) {
        this.zapis = zapis;
    }

    // DTO
    public record SlikeDTO(int slikeID, String slika) {}
}
package si.um.feri.ris.todo_app.vao;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Data
@Entity
@Table(name = "Slike")
public class Slike {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "SlikeID")
    private int slikeID;

    @Column(name = "Slika")
    private String slika;

    @ManyToOne
    @JoinColumn(name = "ZapisTK")
    @JsonIgnore
    private Zapis zapis;

    public Slike() {}

    public void setSlika(String slika) {
        this.slika = slika;
    }

    public void setZapis(Zapis zapis) {
        this.zapis = zapis;
    }

    public int getSlikeID() {
        return slikeID;
    }

    public String getSlika() {
        return slika;
    }

    public record SlikeDTO(int slikeID, String slika) {}
}


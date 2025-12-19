package si.um.feri.ris.todo_app.vao;

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
    private Zapis zapis;

    public Slike() {}
}


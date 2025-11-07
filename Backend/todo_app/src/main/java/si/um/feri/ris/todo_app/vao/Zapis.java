package si.um.feri.ris.todo_app.vao;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Data
@Entity
@Table(name = "Zapis")
public class Zapis {

    @Id
    @Column(name = "zapisID")
    private int zapisID;

    @Column(name = "zapis")
    private String zapis;

    @Column(name="opis")
    private String opis;

    @Column(name = "progress")
    private int situacija;

    public Zapis() {}

    public int getSituacija() {
        return situacija;
    }

    public void setSituacija(int situacija) {
        this.situacija = situacija;
    }

    public String getZapis() {
        return zapis;
    }

    public int getZapisID() {
        return zapisID;
    }

    public void setZapis(String zapis) {
        this.zapis = zapis;
    }

    public String getOpis() {
        return opis;
    }

    public void setOpis(String opis) {
        this.opis = opis;
    }
}

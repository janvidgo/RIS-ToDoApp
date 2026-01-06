package si.um.feri.ris.todo_app.vao;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import jakarta.validation.constraints.NotBlank;

import java.util.Date;

@Getter
@Setter
@Data
@Entity
@Table(name = "Zapis")
public class Zapis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "zapisID")
    private int zapisID;

    @Column(name = "zapis")
    @NotBlank(message = "Ime zapisa ne sme biti prazno")
    private String zapis;

    @Column(name="opis")
    private String opis;

    @Column(name = "progress")
    //@JsonProperty("progress")
    private int situacija;

    @Column(name = "rokNaloge")
    private Date datum;

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

    public void setZapisID(int zapisID) {
        this.zapisID = zapisID;
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

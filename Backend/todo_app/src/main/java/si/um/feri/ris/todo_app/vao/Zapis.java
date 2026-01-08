package si.um.feri.ris.todo_app.vao;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

import java.util.Date;
import java.util.List;

@Entity
@Table(name = "Zapis")
public class Zapis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ZapisID")
    private int zapisID;

    @Column(name = "Zapis")
    @NotBlank(message = "Ime zapisa ne sme biti prazno")
    private String zapis;

    @Column(name = "Opis")
    private String opis;

    @Column(name = "Progress")
    private int situacija;

    @Column(name = "RokNaloge")
    private Date datum;

    @OneToMany(mappedBy = "zapis", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties("zapis")
    private List<Slike> slike;

    // Konstruktor
    public Zapis() {}

    // GETTERJI in SETTERJI (ročno!)
    public int getZapisID() {
        return zapisID;
    }

    public void setZapisID(int zapisID) {
        this.zapisID = zapisID;
    }

    public String getZapis() {
        return zapis;
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

    public int getSituacija() {
        return situacija;
    }

    public void setSituacija(int situacija) {
        this.situacija = situacija;
    }

    public Date getDatum() {
        return datum;
    }

    public void setDatum(Date datum) {
        this.datum = datum;
    }

    public List<Slike> getSlike() {
        return slike;
    }

    public void setSlike(List<Slike> slike) {
        this.slike = slike;
    }
}
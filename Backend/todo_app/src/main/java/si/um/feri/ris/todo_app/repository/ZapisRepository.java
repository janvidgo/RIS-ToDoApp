package si.um.feri.ris.todo_app.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import si.um.feri.ris.todo_app.vao.Zapis;

import java.util.List;

public interface ZapisRepository extends JpaRepository<Zapis, Integer> {

    List<Zapis> findBySituacijaBetween(int min, int max);

    List<Zapis> findByZapisContainingIgnoreCase(String zapis);

    List<Zapis> findByZapisContainingIgnoreCaseAndSituacijaBetween(String zapis, int min, int max);
}

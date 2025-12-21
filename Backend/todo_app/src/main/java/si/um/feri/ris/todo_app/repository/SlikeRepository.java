package si.um.feri.ris.todo_app.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import si.um.feri.ris.todo_app.vao.Slike;
import si.um.feri.ris.todo_app.vao.Zapis;

import java.util.List;

public interface SlikeRepository extends JpaRepository<Slike, Integer>{

    List<Slike> findByZapis_ZapisID(int zapisID);
}

/*package si.um.feri.ris.todo_app.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import si.um.feri.ris.todo_app.vao.Slike;
import si.um.feri.ris.todo_app.vao.Zapis;

import java.util.List;

public interface SlikeRepository extends JpaRepository<Slike, Integer>{

    List<Slike> findByZapis_ZapisID(int zapisID);  
}*/

package si.um.feri.ris.todo_app.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import si.um.feri.ris.todo_app.vao.Slike;

import java.util.List;

public interface SlikeRepository extends JpaRepository<Slike, Integer> {
    
    // Uporabi JPQL query namesto metode z imenom
    @Query("SELECT s FROM Slike s WHERE s.zapis.zapisID = :zapisID")
    List<Slike> findByZapisID(@Param("zapisID") int zapisID);
}
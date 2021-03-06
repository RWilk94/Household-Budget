package rwilk.hb.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import rwilk.hb.model.Category;

public interface CategoryRepository extends JpaRepository<Category, Long> {

  List<Category> findAllByUserIsNull();

  Optional<Category> findById(Long id);

  List<Category> findAllByUser_Username(String username);

  List<Category> findAllByModule_IdAndUser_Username(Long moduleId, String username);

  @Query(nativeQuery = true,
      value = "SELECT c.* "
          + "FROM categories c left join users u on (u.id = c.id_user) "
          + "WHERE u.username = :username and c.id_module = :id")
  List<Category> findAllByUser_UsernameAndModule(
      @Param("username") String username, @Param("id") long id);

}

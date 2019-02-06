package rwilk.hb.service;

import java.util.Calendar;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import rwilk.hb.model.Category;
import rwilk.hb.model.CategorySpending;
import rwilk.hb.model.Module;
import rwilk.hb.model.ModuleVO;
import rwilk.hb.model.User;
import rwilk.hb.repository.CategoryRepository;
import rwilk.hb.repository.ModuleRepository;
import rwilk.hb.repository.PlannedSpendRepository;
import rwilk.hb.repository.SpendingRepository;
import rwilk.hb.repository.UserRepository;
import rwilk.hb.util.Utils;

@Service
public class CategoryServiceImpl implements CategoryService {

  @Autowired
  private CategoryRepository categoryRepository;

  @Autowired
  private UserRepository userRepository;

  @Autowired
  private ModuleRepository moduleRepository;
  @Autowired
  private PlannedSpendRepository plannedSpendRepository;
  @Autowired
  private SpendingRepository spendingRepository;

  @Override
  public List<Category> getUserCategories(String username) {
    return categoryRepository.findAllByUserIsNullOrUser_Username(username);
  }

  @Override
  public Category addCategory(Category category) {
    Optional<User> userOptional = userRepository.findByUsername(category.getUser().getUsername());
    Optional<Module> moduleOptional = moduleRepository.findByName(category.getModule().getName());
    if (userOptional.isPresent() && moduleOptional.isPresent()) {
      category.setUser(userOptional.get());
      category.setModule(moduleOptional.get());
      return categoryRepository.save(category);
    }
    return null;
  }

  @Override
  public Category updateCategory(Category category) {
    Optional<Category> categoryOptional = categoryRepository.findById(category.getId());
    Optional<User> userOptional = userRepository.findByUsername(category.getUser().getUsername());
    Optional<Module> moduleOptional = moduleRepository.findByName(category.getModule().getName());
    if (categoryOptional.isPresent() && userOptional.isPresent() && moduleOptional.isPresent()) {
      categoryOptional.get().setModule(moduleOptional.get());
      categoryOptional.get().setUser(userOptional.get());
      categoryOptional.get().setName(category.getName());
      return categoryRepository.save(categoryOptional.get());
    }
    return null;
  }

  @Override
  public void deleteCategory(Long id) {
    Optional<Category> categoryOptional = categoryRepository.findById(id);
    categoryOptional.ifPresent(category -> categoryRepository.delete(category));
  }

  @Override
  public List<ModuleVO> getCategories(String username, Calendar period, String type, long moduleId) {
    Optional<Module> moduleOptional = moduleRepository.findById(moduleId);
    if (!moduleOptional.isPresent()) throw new IllegalArgumentException();
    List<Category> categories = categoryRepository.findAllByUserIsNullOrUser_UsernameAndModule(username, moduleOptional.get().getId());
    Calendar firstDay;
    Calendar lastDay;
    if (type.equals("month")) {
      firstDay = Utils.setFirstDayOfMonth(period);
      lastDay = Utils.setLastDayOfMonth(period);
    } else {
      firstDay = Utils.setFirstDayOfYear(period);
      lastDay = Utils.setLastDayOfYear(period);
    }
    List<CategorySpending> actualSpending = Utils.mapToCategorySpending(
        spendingRepository.findAllByDateIsBetweenAndUser_UsernameAndGroupByCategory(firstDay, lastDay, username));
    List<CategorySpending> plannedSpending = Utils.mapToCategorySpending(
        plannedSpendRepository.findAllByDateIsBetweenAndUser_UsernameAndGroupByCategory(firstDay, lastDay, username));

    return categories.stream().map(category ->
        ModuleVO.builder()
            .id(category.getId())
            .name(category.getName())
            .actualSpending(actualSpending.stream()
                .filter(actual -> actual.getName().equals(category.getName()))
                .findFirst()
                .orElse(CategorySpending.builder().sum(0.0).build())
                .getSum())
            .plannedSpending(plannedSpending.stream()
                .filter(planned -> planned.getName().equals(category.getName()))
                .findFirst()
                .orElse(CategorySpending.builder().sum(0.0).build())
                .getSum())
            .build()
    ).collect(Collectors.toList());
  }
}

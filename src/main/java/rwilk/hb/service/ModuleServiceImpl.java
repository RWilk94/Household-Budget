package rwilk.hb.service;

import java.util.Calendar;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import rwilk.hb.model.CategorySpending;
import rwilk.hb.model.Module;
import rwilk.hb.model.ModuleVO;
import rwilk.hb.repository.ModuleRepository;
import rwilk.hb.repository.PlannedSpendRepository;
import rwilk.hb.repository.SpendingRepository;
import rwilk.hb.util.Utils;

@Service
public class ModuleServiceImpl implements ModuleService {

  private final ModuleRepository moduleRepository;
  private final PlannedSpendRepository plannedSpendRepository;
  private final SpendingRepository spendingRepository;

  @Autowired
  public ModuleServiceImpl(ModuleRepository moduleRepository, PlannedSpendRepository plannedSpendRepository,
      SpendingRepository spendingRepository) {
    this.moduleRepository = moduleRepository;
    this.plannedSpendRepository = plannedSpendRepository;
    this.spendingRepository = spendingRepository;
  }

  @Override
  public List<Module> getModules() {
    return moduleRepository.findAll();
  }

  @Override
  public List<ModuleVO> getModuleVOsByYear(String username, Integer year) {
    List<Module> modules = this.getModules();
    Calendar firstDay = Utils.setFirstDayOfYear(year);
    Calendar lastDay = Utils.setLastDayOfYear(year);
    List<CategorySpending> actualSpending = Utils.mapToCategorySpending(
                spendingRepository.findAllByDateIsBetweenAndUser_UsernameAndGroupByModule(firstDay, lastDay, username));
    List<CategorySpending> plannedSpending = Utils.mapToCategorySpending(
            plannedSpendRepository.findAllByDateIsBetweenAndUser_UsernameAndGroupByModule(year, 1, 12, username));
    return modules.stream().map(module ->
        ModuleVO.builder()
            .id(module.getId())
            .name(module.getName())
            .actualSpending(actualSpending.stream()
                .filter(actual -> actual.getName().equals(module.getName()))
                .findFirst()
                .orElse(CategorySpending.builder().sum(0.0).build())
                .getSum())
            .plannedSpending(plannedSpending.stream()
                .filter(planned -> planned.getName().equals(module.getName()))
                .findFirst()
                .orElse(CategorySpending.builder().sum(0.0).build())
                .getSum())
            .build()
    ).collect(Collectors.toList());
  }

  @Override
  public List<ModuleVO> getModuleVOsByMonth(String username, Integer year, Integer month) {
    List<Module> modules = this.getModules();
    Calendar firstDay = Utils.setFirstDayOfMonth(year, month);
    Calendar lastDay = Utils.setLastDayOfMonth(year, month);
    List<CategorySpending> actualSpending = Utils.mapToCategorySpending(
        spendingRepository.findAllByDateIsBetweenAndUser_UsernameAndGroupByModule(firstDay, lastDay, username));
    List<CategorySpending> plannedSpending = Utils.mapToCategorySpending(
        plannedSpendRepository.findAllByDateIsBetweenAndUser_UsernameAndGroupByModule(year, month, month, username));
    return modules.stream().map(module ->
        ModuleVO.builder()
            .id(module.getId())
            .name(module.getName())
            .actualSpending(actualSpending.stream()
                .filter(actual -> actual.getName().equals(module.getName()))
                .findFirst()
                .orElse(CategorySpending.builder().sum(0.0).build())
                .getSum())
            .plannedSpending(plannedSpending.stream()
                .filter(planned -> planned.getName().equals(module.getName()))
                .findFirst()
                .orElse(CategorySpending.builder().sum(0.0).build())
                .getSum())
            .build()
    ).collect(Collectors.toList());
  }

}

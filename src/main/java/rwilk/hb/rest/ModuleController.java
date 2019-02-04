package rwilk.hb.rest;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import rwilk.hb.model.Module;
import rwilk.hb.model.ModuleVO;
import rwilk.hb.service.ModuleService;

@RestController
@RequestMapping("/api/modules")
public class ModuleController {

  @Autowired
  private ModuleService moduleService;

  @RequestMapping(value = "/", method = RequestMethod.GET)
  public List<Module> getModules() {
    return moduleService.getModules();
  }

  @RequestMapping(value = "/{user}/", method = RequestMethod.POST)
  public List<ModuleVO> getModules(@PathVariable String user, @RequestBody ModuleVO moduleVO) {
    return moduleService.getModules(user, moduleVO.getDate());
  }
}

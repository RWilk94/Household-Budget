import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {CategoryService} from '../../services/category.service';
import {MatDialog, MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import {Category} from '../../models/category';
import {Module} from '../../models/module';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {CategoryElement} from './category-element';
import {ModuleService} from '../../services/module.service';
import {CookieService} from 'ngx-cookie-service';
import {Toast, ToasterService} from 'angular2-toaster';
import {ToastBuilder} from '../../../shared/utils/toast-builder';
import {User} from '../../../shared/models/user';
import {DialogConfirmDeleteComponent} from '../dialog-confirm-delete/dialog-confirm-delete.component';
import {NavigationMenuService} from '../../../shared/services/navigation-menu.service';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css']
})
export class CategoryComponent implements OnInit, AfterViewInit {

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  form: FormGroup;

  categories: Category[] = [];
  modules: Module[] = [];
  category: Category = new Category();
  insertedRows = 0;

  columns = ['position', 'name', 'module', 'options'];
  width = [{width: 7.5}, {width: 55}, {width: 22.5}, {width: 15}];

  dataSource = new MatTableDataSource<CategoryElement>(this.convertCategoriesIntoCategoryElements());

  constructor(private categoryService: CategoryService, private moduleService: ModuleService, private formBuilder: FormBuilder,
              private cookie: CookieService, private toasterService: ToasterService, private dialog: MatDialog,
              private navigationMenu: NavigationMenuService) {
    navigationMenu.activeMenuItem('Kategorie');
  }

  ngOnInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.moduleService.getModules().subscribe(modules => this.modules = modules, error => console.log(error));

    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'module': {
          return item.module.name;
        }
        default: {
          return item[property];
        }
      }
    };

    this.form = this.formBuilder.group({
      name: new FormControl(this.category.name),
      module: new FormControl(this.category.module)
    });
    this.refresh();
  }

  ngAfterViewInit() {
    this.dataSource.filterPredicate =
      (category: CategoryElement, filter: string) =>
        category.name.toLowerCase().includes(filter.toLowerCase())
        || category.module.name.toString().toLowerCase().includes(filter.toLowerCase());
  }

  enableElementEditMode(element: CategoryElement) {
    element.isEditing = true;
  }

  cancelElementEditMode(element: CategoryElement) {
    const originalRow = this.categories[element.position - 1];
    this.dataSource.data[element.position - 1].name = originalRow.name;
    this.dataSource.data[element.position - 1].module = originalRow.module;
    element.isEditing = false;
  }

  cancelNewElementEditMode(element: CategoryElement) {
    this.insertedRows -= 1;
    const dataSource: CategoryElement[] = [];
    this.dataSource.data.forEach(category => {
      if (element.position !== category.position) {
        dataSource.push(category);
      }
    });
    this.dataSource.data = dataSource;
  }

  updateExistingElement(element: CategoryElement) {
    if (this.validateCategoryElement(element)) {
      const category = this.categories[element.position - 1];
      category.name = element.name;
      category.module = element.module;
      category.user = new User();
      category.user.username = this.cookie.get('username');
      this.categoryService.updateCategory(category).subscribe(updatedCategory => {
        this.displayToast(ToastBuilder.successUpdateItem());
        element.isEditing = false;
      }, error => console.log(error));
    }
  }

  insertElement(element: CategoryElement) {
    if (this.validateCategoryElement(element)) {
      const category = new Category();
      category.name = element.name;
      category.module = element.module;
      category.user = new User();
      category.user.username = this.cookie.get('username');
      this.categoryService.addCategory(category).subscribe(data => {
        this.displayToast(ToastBuilder.successInsertItem());
        this.categories[element.position - 1] = data;
        element.isNew = false;
        element.isEditing = false;
        this.insertedRows -= 1;
        this.refresh();
      }, error => console.log(error));
    }
  }

  showDeleteDialog(element: CategoryElement): void {
    const dialogRef = this.dialog.open(DialogConfirmDeleteComponent, {
      width: '250px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined && result === true) {
        this.deleteElement(element);
      }
    });
  }

  deleteElement(element: CategoryElement) {
    const category = this.categories[element.position - 1];
    this.categoryService.deleteCategory(category).subscribe(data => {
      this.displayToast(ToastBuilder.successDeleteItem());
      this.refresh();
    }, error => console.log(error));
  }

  updateElementNameOnBlur(name: any, element) {
    this.dataSource.data[element.position - 1].name = name;
  }

  createRowInTable() {
    if (this.insertedRows === 0) {
      this.insertedRows += 1;
      const element: CategoryElement = new CategoryElement();
      element.position = this.dataSource.data.length + 1;
      element.isEditing = true;
      element.isNew = true;
      element.name = '';
      element.module = new Module();
      element.module.name = '';

      const dataSource = this.dataSource.data;
      dataSource.push(element);
      this.dataSource.data = dataSource;
      this.dataSource.paginator.lastPage();
    } else {
      this.displayToast(ToastBuilder.warningTemplateForRecordAlreadyAdded());
    }
  }

  private refresh() {
    this.categoryService.getCategories(this.cookie.get('username')).subscribe(categories => {
      this.insertedRows = 0;
      this.categories = categories;
      this.dataSource.data = this.convertCategoriesIntoCategoryElements();
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
    }, error => console.log(error));
  }

  private convertCategoriesIntoCategoryElements() {
    const categoryElements: CategoryElement[] = [];
    for (let i = 0; i < this.categories.length; i++) {
      const element: CategoryElement = new CategoryElement();
      element.position = i + 1;
      element.name = this.categories[i].name;
      element.module = this.categories[i].module;
      element.isCustom = !(this.categories[i].user === null || this.categories[i].user === undefined);
      categoryElements.push(element);
    }
    return categoryElements;
  }

  private validateCategoryElement(element: CategoryElement): boolean {
    if (element.name === null || element.name === undefined || element.name.length === 0) {
      this.displayToast(ToastBuilder.errorEmptyName());
      return false;
    } else if (element.name.length < 1 || element.name.length > 255) {
      this.displayToast(ToastBuilder.errorIncorrectName());
      return false;
    } else if (element.module === null || element.module === undefined || element.module.name === '') {
      this.displayToast(ToastBuilder.errorEmptyModule());
      return false;
    }
    return true;
  }

  private displayToast(toast: Toast): void {
    this.toasterService.pop(toast);
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  compareModules(m1: Module, m2: Module): boolean {
    if (m1 !== undefined && m2 !== undefined) {
      return m1.name === m2.name && m2.id === m2.id;
    }
  }
}

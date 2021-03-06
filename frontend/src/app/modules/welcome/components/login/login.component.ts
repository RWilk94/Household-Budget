import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';

import {User} from '../../../shared/models/user';
import {RegistrationService} from '../../../shared/services/registration.service';
import {CookieService} from 'ngx-cookie-service';
import {Router} from '@angular/router';
import {HttpErrorResponse} from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  private token = {'token': ''};
  loginForm: FormGroup;
  user: User;
  alert: Alert;

  constructor(private formBuilder: FormBuilder, private registrationService: RegistrationService, private cookie: CookieService,
              private router: Router) {
    this.user = new User();
  }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      username: new FormControl(this.user.username, [
        Validators.required
      ]),
      password: new FormControl(this.user.password, [
        Validators.required
      ])
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.user.username = this.loginForm.get('username').value;
      this.user.password = this.loginForm.get('password').value;

      this.registrationService.login(this.user).subscribe(data => {
          this.token = JSON.parse(JSON.stringify(data));
          this.cookie.set('username', this.user.username);
          this.cookie.set('token', this.token.token);
          this.router.navigate(['/dashboard']);
        },
        error => this.handleError(error)
      );
    }
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 401) {
      this.alert = {
        type: 'danger',
        message: 'Wrong username or password.',
      };
    }
  }

  closeAlert() {
    this.alert = undefined;
  }
}

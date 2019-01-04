import {Component, OnInit} from '@angular/core';
import {SpendingService} from "../../services/spending.service";
import {Chart} from 'chart.js';
import {CookieService} from "ngx-cookie-service";
import {MonthSpending} from "../../models/month-spending";
import {CategorySpending} from "../../models/category-spending";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  currentMonthSpending: number = 0;
  lastMonthSpending: number = 0;

  chart: any;
  currentMonthCategoryChart: any;
  lastMonthCategoryChart: any;


  constructor(private spendingService: SpendingService, private cookieService: CookieService) {
  }

  ngOnInit() {
    this.spendingService.getLastYearSpending(this.cookieService.get('username')).subscribe(data => {
      if (data.length > 0) {
        this.generateSummaryOfSpendingChart(data);
      }
    }, error => console.log(error));

    this.spendingService.getCurrentMonthSpendingByCategory(this.cookieService.get('username')).subscribe(data => {
      this.setCurrentMonthSpending(data);
      this.generateSpendingByCategoryChart(this.currentMonthCategoryChart, 'currentMonthCategoryChart', data);
    });

    this.spendingService.getLastMonthSpendingByCategory(this.cookieService.get('username')).subscribe(data => {
      this.setLastMonthSpending(data);
      this.generateSpendingByCategoryChart(this.lastMonthCategoryChart, 'lastMonthCategoryChart', data);
    });
  }

  generateSummaryOfSpendingChart(data: MonthSpending[]) {
    let dataArray = [];
    let labels: string[] = [];
    data.forEach(monthSpend => {
      dataArray.push(Math.round(monthSpend.sum * 100) / 100);
      labels.push(monthSpend.month + '/' + monthSpend.year);
    });
    this.chart = new Chart('chart', {
      type: 'bar',
      data: {
        datasets: [{
          data: dataArray,
          backgroundColor: 'green'
        }],
        labels: labels
      },
      options: {
        responsible: true,
        legend: {
          display: false
        },
        scales: {
          yAxes: [{
            ticks: {
              min: 0
            }
          }]
        }
      }
    });
  }

  generateSpendingByCategoryChart(chart: any, name: string, spending: CategorySpending[]) {
    let dataArray = [];
    let labels: string[] = [];
    spending.forEach(categorySpend => {
      dataArray.push(categorySpend.sum);
      labels.push(categorySpend.name);
    });
    let colors = ['red', 'green', 'blue', 'yellow'];

    chart = new Chart(name, {
      type: 'pie',
      data: {
        datasets: [{
          data: dataArray,
          backgroundColor: colors
        }],
        labels: labels
      },
      options: {
        responsible: true,
        legend: {
          display: false
        }
      }
    });
  }

  private setCurrentMonthSpending(categorySpending: CategorySpending[]) {
    categorySpending.forEach(category => this.currentMonthSpending += category.sum);
  }

  private setLastMonthSpending(categorySpending: CategorySpending[]) {
    categorySpending.forEach(category => this.lastMonthSpending += category.sum);
  }

}

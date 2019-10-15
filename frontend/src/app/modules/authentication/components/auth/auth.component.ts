import { Component, OnInit } from '@angular/core';
import Constants from '../../../../config/constants.json';
import url from '../../../../config/api-url.config.json'
import { LoggerService } from 'src/app/modules/core/services/logger/logger.service.js';

@Component({
  selector: 'vtx-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {
  constants = Constants;
  constructor() { }

  ngOnInit() {
  }

}

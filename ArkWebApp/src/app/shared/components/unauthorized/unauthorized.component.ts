import { Component, OnInit } from '@angular/core';
import { AccessService } from 'src/app/core/services/Auth/access.service';

@Component({
  selector: 'app-unauthorized',
  templateUrl: './unauthorized.component.html',
  styleUrls: ['./unauthorized.component.scss']
})
export class UnauthorizedComponent implements OnInit {

  constructor(
    public accessSvc: AccessService
  ) { }

  ngOnInit(): void {
  }

}

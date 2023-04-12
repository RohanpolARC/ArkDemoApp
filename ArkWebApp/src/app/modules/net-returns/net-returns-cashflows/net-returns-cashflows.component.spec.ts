import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NetReturnsCashflowsComponent } from './net-returns-cashflows.component';

describe('NetReturnsCashflowsComponent', () => {
  let component: NetReturnsCashflowsComponent;
  let fixture: ComponentFixture<NetReturnsCashflowsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NetReturnsCashflowsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NetReturnsCashflowsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

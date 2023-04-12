import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NetReturnsSummaryComponent } from './net-returns-summary.component';

describe('NetReturnsSummaryComponent', () => {
  let component: NetReturnsSummaryComponent;
  let fixture: ComponentFixture<NetReturnsSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NetReturnsSummaryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NetReturnsSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

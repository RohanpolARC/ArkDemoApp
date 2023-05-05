import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SsrsReportPopupComponent } from './ssrs-report-popup.component';

describe('SsrsReportPopupComponent', () => {
  let component: SsrsReportPopupComponent;
  let fixture: ComponentFixture<SsrsReportPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SsrsReportPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SsrsReportPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

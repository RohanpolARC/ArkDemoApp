import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DefaultDetailedViewPopupComponent } from './default-detailed-view-popup.component';

describe('DefaultDetailedViewPopupComponent', () => {
  let component: DefaultDetailedViewPopupComponent;
  let fixture: ComponentFixture<DefaultDetailedViewPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DefaultDetailedViewPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DefaultDetailedViewPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

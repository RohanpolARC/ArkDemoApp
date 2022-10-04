import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IrrCalculationFilterComponent } from './irr-calculation-filter.component';

describe('IrrCalculationFilterComponent', () => {
  let component: IrrCalculationFilterComponent;
  let fixture: ComponentFixture<IrrCalculationFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IrrCalculationFilterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IrrCalculationFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagementFeeFilterComponent } from './management-fee-filter.component';

describe('ManagementFeeFilterComponent', () => {
  let component: ManagementFeeFilterComponent;
  let fixture: ComponentFixture<ManagementFeeFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManagementFeeFilterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManagementFeeFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

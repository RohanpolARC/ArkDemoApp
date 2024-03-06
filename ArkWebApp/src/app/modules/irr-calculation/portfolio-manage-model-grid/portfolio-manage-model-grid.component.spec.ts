import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortfolioManageModelGridComponent } from './portfolio-manage-model-grid.component';

describe('PortfolioManageModelGridComponent', () => {
  let component: PortfolioManageModelGridComponent;
  let fixture: ComponentFixture<PortfolioManageModelGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PortfolioManageModelGridComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PortfolioManageModelGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

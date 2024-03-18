import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortfolioManageModelComponent } from './portfolio-manage-model.component';

describe('PortfolioManageModelComponent', () => {
  let component: PortfolioManageModelComponent;
  let fixture: ComponentFixture<PortfolioManageModelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PortfolioManageModelComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PortfolioManageModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractsHistoryComponent } from './contracts-history.component';

describe('ContractsHistoryComponent', () => {
  let component: ContractsHistoryComponent;
  let fixture: ComponentFixture<ContractsHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContractsHistoryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContractsHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

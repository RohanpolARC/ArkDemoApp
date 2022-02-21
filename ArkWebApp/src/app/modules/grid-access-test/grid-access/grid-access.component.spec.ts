import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GridAccessComponent } from './grid-access.component';

describe('GridAccessComponent', () => {
  let component: GridAccessComponent;
  let fixture: ComponentFixture<GridAccessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GridAccessComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GridAccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

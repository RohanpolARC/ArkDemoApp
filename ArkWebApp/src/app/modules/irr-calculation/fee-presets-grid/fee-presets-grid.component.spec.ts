import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeePresetsGridComponent } from './fee-presets-grid.component';

describe('FeePresetsGridComponent', () => {
  let component: FeePresetsGridComponent;
  let fixture: ComponentFixture<FeePresetsGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FeePresetsGridComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FeePresetsGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

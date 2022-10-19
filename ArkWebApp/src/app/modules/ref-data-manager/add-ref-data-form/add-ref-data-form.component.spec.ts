import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddRefDataFormComponent } from './add-ref-data-form.component';

describe('AddRefDataFormComponent', () => {
  let component: AddRefDataFormComponent;
  let fixture: ComponentFixture<AddRefDataFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddRefDataFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddRefDataFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NetReturnsFilterComponent } from './net-returns-filter.component';

describe('NetReturnsFilterComponent', () => {
  let component: NetReturnsFilterComponent;
  let fixture: ComponentFixture<NetReturnsFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NetReturnsFilterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NetReturnsFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

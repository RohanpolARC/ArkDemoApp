import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WSOMarkDetailComponent } from './wsomark-detail.component';

describe('WSOMarkDetailComponent', () => {
  let component: WSOMarkDetailComponent;
  let fixture: ComponentFixture<WSOMarkDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WSOMarkDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WSOMarkDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

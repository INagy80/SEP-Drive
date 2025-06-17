import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FahrtAngeboteComponent } from './fahrt-angebote.component';

describe('FahrtAngeboteComponent', () => {
  let component: FahrtAngeboteComponent;
  let fixture: ComponentFixture<FahrtAngeboteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FahrtAngeboteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FahrtAngeboteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FahranfragenComponent } from './fahranfragen.component';

describe('FahranfragenComponent', () => {
  let component: FahranfragenComponent;
  let fixture: ComponentFixture<FahranfragenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FahranfragenComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FahranfragenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

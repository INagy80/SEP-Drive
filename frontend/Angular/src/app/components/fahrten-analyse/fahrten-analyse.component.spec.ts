import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FahrtenAnalyseComponent } from './fahrten-analyse.component';

describe('FahrtenAnalyseComponent', () => {
  let component: FahrtenAnalyseComponent;
  let fixture: ComponentFixture<FahrtenAnalyseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FahrtenAnalyseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FahrtenAnalyseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

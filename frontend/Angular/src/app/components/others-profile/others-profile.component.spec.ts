import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OthersProfileComponent } from './others-profile.component';

describe('OthersProfileComponent', () => {
  let component: OthersProfileComponent;
  let fixture: ComponentFixture<OthersProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OthersProfileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OthersProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileNutzerComponent } from './profile-nutzer.component';

describe('ProfileNutzerComponent', () => {
  let component: ProfileNutzerComponent;
  let fixture: ComponentFixture<ProfileNutzerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileNutzerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileNutzerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

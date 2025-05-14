import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileEditeComponent } from './profile-edite.component';

describe('ProfileEditeComponent', () => {
  let component: ProfileEditeComponent;
  let fixture: ComponentFixture<ProfileEditeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileEditeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileEditeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

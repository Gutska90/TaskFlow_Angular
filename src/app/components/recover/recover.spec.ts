import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Recover } from './recover';

describe('Recover', () => {
  let component: Recover;
  let fixture: ComponentFixture<Recover>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Recover]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Recover);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

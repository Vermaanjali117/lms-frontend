import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstructordashboardComponent } from './instructordashboard.component';

describe('InstructordashboardComponent', () => {
  let component: InstructordashboardComponent;
  let fixture: ComponentFixture<InstructordashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InstructordashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InstructordashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

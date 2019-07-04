import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AskforreccoPage } from './askforrecco.page';

describe('AskforreccoPage', () => {
  let component: AskforreccoPage;
  let fixture: ComponentFixture<AskforreccoPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AskforreccoPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AskforreccoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

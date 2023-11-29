import { Component, Output, Input, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-some-component',
  templateUrl: './some-component.component.html',
  styleUrls: ['./some-component.component.css'],
})
export class SomeComponentComponent {
  @Input() someInput = 'foo';
  @Output() someOutput = new EventEmitter<string>();
}

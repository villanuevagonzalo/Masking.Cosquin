import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: '#app_container',
  imports: [RouterOutlet],
  templateUrl: './template.html'
})
export class App {
  protected title = 'Masking.Cosquin';
}

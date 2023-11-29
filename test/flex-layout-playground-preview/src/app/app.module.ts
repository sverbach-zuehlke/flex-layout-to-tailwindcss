import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { FlexLayoutModule, FlexModule } from '@angular/flex-layout';
import { CommonModule } from '@angular/common';
import { SomeComponentComponent } from './some-component/some-component.component';

@NgModule({
  declarations: [AppComponent, SomeComponentComponent],
  imports: [BrowserModule, FlexModule, FlexLayoutModule, CommonModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}

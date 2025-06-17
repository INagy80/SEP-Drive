// auto-focus-next.directive.ts
import {
  Directive,
  ElementRef,
  HostListener,
  Input
} from '@angular/core';

@Directive({
  selector: '[appAutoFocusNext]'
})
export class AutoFocusNextDirective {
  // allow nextInput to be either an HTMLElement or a string (empty)
  @Input('appAutoFocusNext') nextInput?: HTMLElement | string;
  @Input()                 prevInput?: HTMLElement;

  constructor(private el: ElementRef<HTMLInputElement>) {}

  @HostListener('input')
  onInput() {
    const input = this.el.nativeElement;
    // only focus if nextInput really is an element
    if (
      input.value.length >= (input.maxLength || 1) &&
      this.nextInput instanceof HTMLElement
    ) {
      this.nextInput.focus();
    }
  }

  @HostListener('keydown.backspace')
  onBackspace() {
    const input = this.el.nativeElement;
    if (!input.value && this.prevInput) {
      this.prevInput.focus();
    }
  }


  @HostListener('keydown.enter', ['$event'])
  onEnter(event: KeyboardEvent) {
    event.preventDefault();

    // Try HTML5 form.requestSubmit() if available
    const form: HTMLFormElement | null = (this.el.nativeElement as any).form;
    if (form) {
      if (typeof form.requestSubmit === 'function') {
        form.requestSubmit();
      } else {
        form.submit();
      }
    }
  }

}

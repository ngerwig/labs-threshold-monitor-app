import {
  Directive,
  ElementRef,
  HostListener,
  Renderer,
  Renderer2
} from '@angular/core';

@Directive({
  selector: '[vtxAccessibilityArrow]'
})
export class AccessibilityArrowDirective {

  constructor( private element: ElementRef,
    private renderer: Renderer,
    private renderer2:Renderer2,) { }

    @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    const key = event.keyCode;
    const hostEl = this.element.nativeElement;
    switch (key) {
      case 38:
        this.onArrowLeftUp(event, hostEl);
        break;
      case 40:
        this.onArrowRightDown(event,hostEl);
        break;
      case 37:
        this.onArrowLeftUp(event, hostEl);
        break;
      case 39:
        this.onArrowRightDown(event, hostEl);
        break;
    }
  }

  onArrowLeftUp(event, hostEl) {
    const triggerClick =
      hostEl.className.includes('tabs__tab-list-item');
    hostEl.tabIndex = -1;
    this.renderer2.removeClass(hostEl, 'focus');
    if (hostEl.previousElementSibling) {
      hostEl.previousElementSibling.tabIndex = 0;
      this.focus(hostEl.previousElementSibling);
      event.preventDefault();
      if (triggerClick) {
        this.click(hostEl.previousElementSibling);
      }
    } else {
      hostEl.parentNode.lastElementChild.tabIndex = 0;
      this.focus(hostEl.parentNode.lastElementChild);
      event.preventDefault();
      if (triggerClick) {
        this.click(hostEl.parentNode.lastElementChild);
      }
    }
  }

  onArrowRightDown(event, hostEl) {
    const triggerClick =
    hostEl.className.includes('tabs__tab-list-item');
    hostEl.tabIndex = -1;
    this.renderer2.removeClass(hostEl, 'focus');
    if (hostEl.nextElementSibling) {
      hostEl.nextElementSibling.tabIndex = 0;
      this.focus(hostEl.nextElementSibling);
      event.preventDefault();
      if (triggerClick) {
        this.click(hostEl.nextElementSibling);
      }
    } else {
      hostEl.parentNode.firstElementChild.tabIndex = 0;
      this.focus(hostEl.parentNode.firstElementChild);
      event.preventDefault();
      if (triggerClick) {
        this.click(hostEl.parentNode.firstElementChild);
      }
    }

  }

  focus(el) {
    this.renderer2.addClass(el, 'focus');
    this.renderer.invokeElementMethod(el, 'focus', []);
  }

  click(el) {
    this.renderer.invokeElementMethod(el, 'click', []);
  }
}
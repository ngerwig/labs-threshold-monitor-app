import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import { Key } from '../../keyboard-util/key';

@Directive({
  selector: '[vtxTableAccessiblity]'
})
export class TableAccessiblityDirective {
  @Input() menuContainer: HTMLElement;
  _menuItem: any
  _activeTable: any;

  constructor(private element: ElementRef) {
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    const key = event.which;
    const hostEl = this.element.nativeElement;
    this._activeTable = hostEl.tBodies[0]; //get first tbody element of table
    switch (key) {
      case Key.Alt && Key.F10:
        this._setFocusToMenu();
        break;
      case Key.Home:
        this._setFocusToFirstChild(event);
        break;
      case Key.End:
        this._setFocusToLastChild(event);
        break;
      case Key.ArrowDown:
        this._setFocusToNextChild(event);
        break;
      case Key.ArrowUp:
        this._setFocusToPrevioustChild(event);
    }
  }

/**
* // TODO: menu _setFocusToMenu
* Set focus to table menu button by using the combination of key (Alt+F10)
*/
  private _setFocusToMenu() {
    this._menuItem = this._getMenuItem(this.menuContainer);
    this._menuItem[0].focus();
  }

/**
* // TODO: menu _getMenuItem
* Get the length of not disabled menu from the menu container
* @param data: menu container Element
*/

  private _getMenuItem(data) {
    const menuItem = [].slice.call(data.children);
    if (menuItem == null) {
      return [];
    }
    return menuItem.filter(item => !item.disabled).map(item => item);
  }

/**
* // TODO: tr _setFocusToFirstChild
* Set Focus to first tr of tbody by pressing Home Key
* @param event: event 
*/
  private _setFocusToFirstChild(event) {
    const tr = this._getTableTR(this._activeTable);
    if (event.srcElement !== tr[0]) {
      tr[0].focus();
    }
  }

/**
* // TODO: tr _setFocusToLastChild
* Set Focus to last tr of tbody by pressing End Key
* @param event: event 
*/
  private _setFocusToLastChild(event) {
    const tr = this._getTableTR(this._activeTable);
    if (event.srcElement !== tr[tr.length - 1]) {
      tr[tr.length - 1].focus();
    }
  }

/**
* // TODO: tr _getTableTR
* Get all visible tr of tbody 
* @param data: active table tbody element
*/
  private _getTableTR(data) {
    const tableTR = [].slice.call(data.rows);
    if (tableTR == null) {
      return [];
    }
    return tableTR.filter(item => this._isVisible(item)).map(item => item);
  }

/**
* // TODO: tr _setFocusToNextChild
* Set Focus to next tr of current tr by pressing down arrow key
* @param event: event 
*/
  private _setFocusToNextChild(event) {
    const totalTR = this._getTableTR(this._activeTable)
    const currenttr = this._getNextSiblingTR(event, totalTR);
    if (currenttr && event.srcElement !== totalTR[totalTR.length - 1]) {
      event.srcElement.nextSibling.focus();
    }    
  }

/**
* // TODO: tr _getNextSiblingTR
* get next visible sibling of tr
* @param event: event 
* @param tr: active tbody tr
*/
  private _getNextSiblingTR(event, tr) {
    const data = event.srcElement;
    if (data == null || event.srcElement === tr[tr.length - 1]) {
      return false;
    }
    return this._isVisible(data.nextSibling);
  }

/**
* // TODO: tr _setFocusToPrevioustChild
* Set Focus to previous tr of current tr by pressing up arrow key
* @param event: event 
*/

  private _setFocusToPrevioustChild(event) {
    const totalTR = this._getTableTR(this._activeTable)
    const currenttr = this._getPreviousSiblingTR(event, totalTR);
    if (currenttr && event.srcElement !== totalTR[0]) {
      event.srcElement.previousSibling.focus();
    }
  }

/**
* // TODO: tr _getPreviousSiblingTR
* get previous visible sibling of tr
* @param event: event 
* @param tr: active tbody tr
*/

  private _getPreviousSiblingTR(event, tr) {
    const data = event.srcElement;
    if (data == null || event.srcElement === tr[0]) {
      return false;
    }
    return this._isVisible(data.previousSibling);
  }

/**
* // TODO: tr _isVisible
* check the tr is visible or not
* @param el: Element 
*/

  private _isVisible(el) {
    return el.offsetWidth > 0 && el.offsetHeight > 0;
  }
}

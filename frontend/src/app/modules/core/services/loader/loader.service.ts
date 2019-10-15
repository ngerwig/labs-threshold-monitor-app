import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  private loaderCount = 0;
  constructor() { }
  isLoading = new Subject<boolean>();
    show() {
      this.loaderCount++;
        document.body.classList.add("overflow__hidden");
        this.isLoading.next(true);
    }
    hide() {
        this.loaderCount--;
        if(this.loaderCount==0){
          document.body.classList.remove("overflow__hidden")
          this.isLoading.next(false);
        }
    }
}

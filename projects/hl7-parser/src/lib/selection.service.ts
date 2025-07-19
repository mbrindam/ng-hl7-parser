import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SelectionService {
  private selectionSource = new ReplaySubject<any>(1);
  selection$ = this.selectionSource.asObservable();

  updateSelection(selection: any) {
    this.selectionSource.next(selection);
  }
}

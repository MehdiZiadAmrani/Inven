import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, ReplaySubject, of, catchError } from 'rxjs';
import { API_BASE_URL } from '../config/environment';

export interface ComputerItem {
  computerId: number;
  brand: string;
  model: string;
}

export interface MonitorItem {
  monitorId: number;
  brand: string;
  model: string;
}

export interface MouseItem {
  mouseId: number;
  brand: string;
  model: string;
}

export interface KeyboardItem {
  keyboardId: number;
  brand: string;
  model: string;
}

@Injectable({
  providedIn: 'root'
})
export class ComponentService {
  private readonly http = inject(HttpClient);

  private computersSubject = new ReplaySubject<ComputerItem[]>(1);
  private monitorsSubject = new ReplaySubject<MonitorItem[]>(1);
  private miceSubject = new ReplaySubject<MouseItem[]>(1);
  private keyboardsSubject = new ReplaySubject<KeyboardItem[]>(1);

  private loaded = false;

  computers$ = this.computersSubject.asObservable();
  monitors$ = this.monitorsSubject.asObservable();
  mice$ = this.miceSubject.asObservable();
  keyboards$ = this.keyboardsSubject.asObservable();

  constructor() {
    this.loadAll();
  }

  private loadAll(): void {
    if (this.loaded) return;
    this.loaded = true;

    this.http.get<ComputerItem[]>(`${API_BASE_URL}/computers/in-stock`).pipe(
      catchError(() => of([]))
    ).subscribe(data => this.computersSubject.next(data));

    this.http.get<MonitorItem[]>(`${API_BASE_URL}/monitors/in-stock`).pipe(
      catchError(() => of([]))
    ).subscribe(data => this.monitorsSubject.next(data));

    this.http.get<MouseItem[]>(`${API_BASE_URL}/mice/in-stock`).pipe(
      catchError(() => of([]))
    ).subscribe(data => this.miceSubject.next(data));

    this.http.get<KeyboardItem[]>(`${API_BASE_URL}/keyboards/in-stock`).pipe(
      catchError(() => of([]))
    ).subscribe(data => this.keyboardsSubject.next(data));
  }

  getComputers(): Observable<ComputerItem[]> {
    return this.computers$;
  }

  getMonitors(): Observable<MonitorItem[]> {
    return this.monitors$;
  }

  getMice(): Observable<MouseItem[]> {
    return this.mice$;
  }

  getKeyboards(): Observable<KeyboardItem[]> {
    return this.keyboards$;
  }
}

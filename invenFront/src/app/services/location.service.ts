import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/environment';

export interface LocationDTO {
  locationId: number;
  name: string;
  type: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${API_BASE_URL}/locations`;

  getLocations(): Observable<LocationDTO[]> {
    return this.http.get<LocationDTO[]>(this.API_URL);
  }

  getLocation(id: number): Observable<LocationDTO> {
    return this.http.get<LocationDTO>(`${this.API_URL}/${id}`);
  }

  createLocation(data: { name: string; type: string; description: string }): Observable<LocationDTO> {
    return this.http.post<LocationDTO>(this.API_URL, data);
  }

  updateLocation(id: number, data: { name: string; type: string; description: string }): Observable<LocationDTO> {
    return this.http.put<LocationDTO>(`${this.API_URL}/${id}`, data);
  }

  toggleLocationStatus(id: number, status: string): Observable<LocationDTO> {
    return this.http.patch<LocationDTO>(`${this.API_URL}/${id}/status`, null, { params: { status } });
  }
}

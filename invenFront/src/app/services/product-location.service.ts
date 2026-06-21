import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/environment';

export interface ProductLocationDTO {
  locationId?: number;
  productId: number;
  locationName: string;
  locationType: string;
  assignedTo?: string;
  movedAt?: string;
  movedBy?: string;
  notes?: string;
  isCurrent?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ProductLocationService {
  private http = inject(HttpClient);
  private baseUrl = `${API_BASE_URL}/products`;

  getLocationHistory(productId: number): Observable<ProductLocationDTO[]> {
    return this.http.get<ProductLocationDTO[]>(`${this.baseUrl}/${productId}/locations`);
  }

  getCurrentLocation(productId: number): Observable<ProductLocationDTO> {
    return this.http.get<ProductLocationDTO>(`${this.baseUrl}/${productId}/locations/current`);
  }

  recordMove(productId: number, dto: ProductLocationDTO): Observable<ProductLocationDTO> {
    return this.http.post<ProductLocationDTO>(`${this.baseUrl}/${productId}/locations`, dto);
  }

  deleteLocation(productId: number, locationId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${productId}/locations/${locationId}`);
  }
}

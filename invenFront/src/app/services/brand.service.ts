import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/environment';

export interface BrandDTO {
  brandId: number;
  name: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class BrandService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${API_BASE_URL}/brands`;

  getBrands(): Observable<BrandDTO[]> {
    return this.http.get<BrandDTO[]>(this.API_URL);
  }

  getBrand(id: number): Observable<BrandDTO> {
    return this.http.get<BrandDTO>(`${this.API_URL}/${id}`);
  }

  createBrand(data: { name: string; description: string }): Observable<BrandDTO> {
    return this.http.post<BrandDTO>(this.API_URL, data);
  }

  updateBrand(id: number, data: { name: string; description: string }): Observable<BrandDTO> {
    return this.http.put<BrandDTO>(`${this.API_URL}/${id}`, data);
  }

  toggleBrandStatus(id: number, status: string): Observable<BrandDTO> {
    return this.http.patch<BrandDTO>(`${this.API_URL}/${id}/status`, null, { params: { status } });
  }
}

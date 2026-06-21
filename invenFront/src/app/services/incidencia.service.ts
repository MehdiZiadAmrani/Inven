import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/environment';

export interface IncidenciaDTO {
  incidenciaId: number;
  title: string;
  description: string;
  priority: string;
  status: string;
  productId: number;
  productName: string;
  createdAt: string;
  updatedAt: string;
}

export interface IncidenciaFilters {
  status?: string;
  priority?: string;
  productId?: number;
}

export interface IncidenciaCreateDTO {
  title: string;
  description?: string;
  priority: string;
  productId: number;
}

export interface IncidenciaUpdateDTO {
  title?: string;
  description?: string;
  priority?: string;
}

@Injectable({
  providedIn: 'root'
})
export class IncidenciaService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${API_BASE_URL}/incidencias`;

  getIncidencias(filters?: IncidenciaFilters): Observable<IncidenciaDTO[]> {
    let params = new HttpParams();
    if (filters?.status) {
      params = params.set('status', filters.status);
    }
    if (filters?.priority) {
      params = params.set('priority', filters.priority);
    }
    if (filters?.productId != null) {
      params = params.set('productId', filters.productId.toString());
    }
    return this.http.get<IncidenciaDTO[]>(this.API_URL, { params });
  }

  getIncidencia(id: number): Observable<IncidenciaDTO> {
    return this.http.get<IncidenciaDTO>(`${this.API_URL}/${id}`);
  }

  createIncidencia(data: IncidenciaCreateDTO): Observable<IncidenciaDTO> {
    return this.http.post<IncidenciaDTO>(this.API_URL, data);
  }

  updateIncidencia(id: number, data: IncidenciaUpdateDTO): Observable<IncidenciaDTO> {
    return this.http.put<IncidenciaDTO>(`${this.API_URL}/${id}`, data);
  }

  transitionStatus(id: number, status: string): Observable<IncidenciaDTO> {
    return this.http.patch<IncidenciaDTO>(`${this.API_URL}/${id}/status`, null, { params: { status } });
  }
}

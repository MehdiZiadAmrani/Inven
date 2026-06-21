import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/environment';

export interface ItemTypeDTO {
  itemTypeId: number;
  name: string;
  status: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class ItemTypeService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${API_BASE_URL}/item-types`;

  getAll(): Observable<ItemTypeDTO[]> {
    return this.http.get<ItemTypeDTO[]>(this.API_URL);
  }

  getById(id: number): Observable<ItemTypeDTO> {
    return this.http.get<ItemTypeDTO>(`${this.API_URL}/${id}`);
  }

  create(itemType: { name: string }): Observable<ItemTypeDTO> {
    return this.http.post<ItemTypeDTO>(this.API_URL, itemType);
  }

  update(id: number, itemType: { name: string }): Observable<ItemTypeDTO> {
    return this.http.put<ItemTypeDTO>(`${this.API_URL}/${id}`, itemType);
  }

  updateStatus(id: number, status: string): Observable<ItemTypeDTO> {
    return this.http.patch<ItemTypeDTO>(`${this.API_URL}/${id}/status`, null, { params: { status } });
  }
}

import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/environment';

export interface ProductDTO {
  productId: number;
  bundleName: string;
  typeId: number | null;
  monitorId: number | null;
  monitorModel: string | null;
  mouseId: number | null;
  mouseModel: string | null;
  keyboardId: number | null;
  keyboardModel: string | null;
  computerId: number | null;
  computerModel: string | null;
  status: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${API_BASE_URL}/products`;

  getAllProducts(): Observable<ProductDTO[]> {
    return this.http.get<ProductDTO[]>(this.API_URL);
  }

  getProductById(id: number): Observable<ProductDTO> {
    return this.http.get<ProductDTO>(`${this.API_URL}/${id}`);
  }

  searchProducts(query: string): Observable<ProductDTO[]> {
    return this.http.get<ProductDTO[]>(`${this.API_URL}/search`, { params: { query } });
  }

  getProductsByStatus(status: string): Observable<ProductDTO[]> {
    return this.http.get<ProductDTO[]>(`${this.API_URL}/status/${status}`);
  }

  createProduct(product: Partial<ProductDTO>): Observable<ProductDTO> {
    return this.http.post<ProductDTO>(this.API_URL, product);
  }

  updateProduct(id: number, product: Partial<ProductDTO>): Observable<ProductDTO> {
    return this.http.put<ProductDTO>(`${this.API_URL}/${id}`, product);
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  updateStatus(id: number, status: string): Observable<ProductDTO> {
    return this.http.patch<ProductDTO>(`${this.API_URL}/${id}/status`, null, { params: { status } });
  }
}

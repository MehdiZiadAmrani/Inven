import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/environment';

export type ItemType = 'computer' | 'monitor' | 'keyboard' | 'mouse';

export interface ComputerDTO {
  computerId: number;
  brand: string;
  model: string;
  type?: string;
  cpu: string;
  ramGb: number;
  storageGb: number;
  storageType?: string;
  os?: string;
  supplierId?: number;
  supplierName?: string;
  typeId?: number;
  typeName?: string;
  stockQuantity?: number;
  unitPrice?: number;
  serialNumber?: string;
  inventoryCode?: string;
  registeredAt?: string;
  deactivatedAt?: string;
  status: string;
}

export interface MonitorDTO {
  monitorId: number;
  brand: string;
  model: string;
  screenSizeIn: number;
  resolution: string;
  panelType?: string;
  refreshRateHz?: number;
  supplierId?: number;
  supplierName?: string;
  typeId?: number;
  typeName?: string;
  stockQuantity?: number;
  unitPrice?: number;
  serialNumber?: string;
  inventoryCode?: string;
  registeredAt?: string;
  deactivatedAt?: string;
  status: string;
}

export interface KeyboardDTO {
  keyboardId: number;
  brand: string;
  model: string;
  switchType?: string;
  layout: string;
  wireless: boolean;
  supplierId?: number;
  supplierName?: string;
  typeId?: number;
  typeName?: string;
  stockQuantity?: number;
  unitPrice?: number;
  serialNumber?: string;
  inventoryCode?: string;
  registeredAt?: string;
  deactivatedAt?: string;
  status: string;
}

export interface MouseDTO {
  mouseId: number;
  brand: string;
  model: string;
  dpiMax: number;
  connectionType: string;
  wireless: boolean;
  supplierId?: number;
  supplierName?: string;
  typeId?: number;
  typeName?: string;
  stockQuantity?: number;
  unitPrice?: number;
  serialNumber?: string;
  inventoryCode?: string;
  registeredAt?: string;
  deactivatedAt?: string;
  status: string;
}

export type ItemDTO = ComputerDTO | MonitorDTO | KeyboardDTO | MouseDTO;

export interface InventoryMovementDTO {
  movementId: number;
  itemType: string;
  itemId: number;
  movementType: string;
  quantity: number;
  movementDate: string;
  notes: string;
}

export type ItemCreateDTO = { brand: string; model: string };

export type ItemUpdateDTO = {
  brand?: string;
  model?: string;
  cpu?: string;
  ramGb?: number;
  storageGb?: number;
  storageType?: string;
  os?: string;
  screenSizeIn?: number;
  resolution?: string;
  panelType?: string;
  refreshRateHz?: number;
  layout?: string;
  switchType?: string;
  wireless?: boolean;
  dpiMax?: number;
  connectionType?: string;
  serialNumber?: string;
  inventoryCode?: string;
  supplierId?: number;
  stockQuantity?: number;
  unitPrice?: number;
  status?: string;
};

const ENDPOINTS: Record<ItemType, string> = {
  computer: 'computers',
  monitor: 'monitors',
  keyboard: 'keyboards',
  mouse: 'mice'
};

@Injectable({
  providedIn: 'root'
})
export class ItemService {
  private readonly http = inject(HttpClient);

  private getUrl(type: ItemType): string {
    return `${API_BASE_URL}/${ENDPOINTS[type]}`;
  }

  getAll(type: ItemType): Observable<ItemDTO[]> {
    return this.http.get<ItemDTO[]>(this.getUrl(type));
  }

  getById(type: ItemType, id: number): Observable<ItemDTO> {
    return this.http.get<ItemDTO>(`${this.getUrl(type)}/${id}`);
  }

  create(type: ItemType, data: ItemCreateDTO): Observable<ItemDTO> {
    return this.http.post<ItemDTO>(this.getUrl(type), data);
  }

  update(type: ItemType, id: number, data: ItemUpdateDTO): Observable<ItemDTO> {
    return this.http.put<ItemDTO>(`${this.getUrl(type)}/${id}`, data);
  }

  updateStatus(type: ItemType, id: number, status: string): Observable<ItemDTO> {
    return this.http.patch<ItemDTO>(`${this.getUrl(type)}/${id}/status`, { status });
  }

  getMovements(type: ItemType, id: number): Observable<InventoryMovementDTO[]> {
    return this.http.get<InventoryMovementDTO[]>(`${API_BASE_URL}/inventory-movements/item/${type}/${id}`);
  }
}

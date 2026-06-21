export enum ProductStatus {
  AVAILABLE = 'available',
  ASSIGNED = 'assigned',
  MAINTENANCE = 'maintenance',
  DISABLED = 'disabled'
}

export const PRODUCT_STATUS_LABELS: Record<string, string> = {
  available: 'Available',
  assigned: 'Assigned',
  maintenance: 'Maintenance',
  disabled: 'Disabled'
};

export enum LocationType {
  OFFICE = 'office',
  SERVER_ROOM = 'server_room',
  REPAIR = 'repair',
  WAREHOUSE = 'warehouse',
  OTHER = 'other'
}

export const LOCATION_TYPE = {
  CLASSROOM: 'classroom',
  LAB: 'lab',
  OFFICE: 'office',
  WAREHOUSE: 'warehouse'
} as const;

export const LOCATION_TYPE_LABELS: Record<string, string> = {
  classroom: '🏫 Classroom',
  lab: '🔬 Lab',
  office: '🏢 Office',
  server_room: '🖥️ Server Room',
  repair: '🔧 Repair',
  warehouse: '📦 Warehouse',
  other: '📍 Other'
};

export enum IncidenciaStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed'
}

export const INCIDENCIA_STATUS_LABELS: Record<string, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed'
};

export enum IncidenciaPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export const INCIDENCIA_PRIORITY_LABELS: Record<string, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical'
};

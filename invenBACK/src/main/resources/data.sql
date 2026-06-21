-- Seed admin and user accounts with BCrypt-hashed passwords
-- Admin credentials: admin / password123 (BCrypt hash)
-- User credentials: user / password123 (BCrypt hash)

INSERT INTO users (username, email, password_hash, full_name, role, is_active, created_at, updated_at) VALUES
(
  'admin',
  'admin@inven.local',
  '$2b$10$MnbWxYszPc2sH10fZpBy/.nUpjX82VaoiyvMwPa112p2C2XKwdzv2',
  'Admin User',
  'ADMIN',
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
),
(
  'user',
  'user@inven.local',
  '$2b$10$05EfIXATh/fVj/8G9evMcuH/7HNnnUejuIdoBl/LcMQNqOysD05yq',
  'Regular User',
  'USER',
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = EXCLUDED.role;

-- Item Types
INSERT INTO item_types (name, status) VALUES
('Laptop', 'active'),
('Desktop', 'active'),
('Mini-PC', 'active'),
('Monitor', 'active'),
('Keyboard', 'active'),
('Mouse', 'active')
ON CONFLICT DO NOTHING;

-- Brands
INSERT INTO brands (name, description, status) VALUES
('Dell', 'Dell Technologies - enterprise hardware', 'active'),
('HP', 'Hewlett-Packard - computing and printing', 'active'),
('Lenovo', 'Lenovo Group - ThinkPad and ThinkCentre', 'active'),
('Logitech', 'Logitech International - peripherals', 'active'),
('Microsoft', 'Microsoft Corporation - Surface and accessories', 'active'),
('Apple', 'Apple Inc. - MacBooks and accessories', 'active'),
('Samsung', 'Samsung Electronics - displays and storage', 'active'),
('Asus', 'ASUS Tek - Republic of Gamers and ZenBooks', 'active'),
('Acer', 'Acer Inc. - Nitro and Aspire series', 'active'),
('MSI', 'MSI - gaming and creator hardware', 'active')
ON CONFLICT DO NOTHING;

-- Suppliers
INSERT INTO suppliers (name, contact_email, phone, country) VALUES
('Dell Technologies', 'sales@dell.com', '+1-800-289-3355', 'USA'),
('Logitech Europe', 'b2b@logitech.com', '+41-21-863-5111', 'Switzerland'),
('LG Electronics', 'business@lge.com', '+82-2-3777-1114', 'South Korea'),
('Lenovo France', 'commercial@lenovo.fr', '+33-1-70-61-71-81', 'France'),
('Keychron', 'support@keychron.com', '+1-626-399-0005', 'USA'),
('Samsung Business', 'b2b@samsung.com', '+82-2-2255-0114', 'South Korea'),
('ASUS ROG', 'support@asus.com', '+1-510-739-3777', 'Taiwan'),
('Corsair', 'business@corsair.com', '+1-888-222-4346', 'USA')
ON CONFLICT (contact_email) DO NOTHING;

-- Monitors
INSERT INTO monitors (brand, model, screen_size_in, resolution, panel_type, refresh_rate_hz, supplier_id, stock_quantity, unit_price) VALUES
('Dell', 'U2722D', 27.0, '2560x1440', 'IPS', 60, 1, 15, 499.99),
('LG', '27UK850-W', 27.0, '3840x2160', 'IPS', 60, 3, 8, 599.00),
('Samsung', 'Odyssey G5 27"', 27.0, '2560x1440', 'VA', 144, 6, 12, 349.99),
('Dell', 'P2422H', 24.0, '1920x1080', 'IPS', 60, 1, 20, 249.99),
('LG', '34WN80C-B', 34.0, '3440x1440', 'IPS', 75, 3, 5, 749.00),
('ASUS', 'VP28UQG', 28.0, '3840x2160', 'TN', 60, 7, 10, 399.99),
('BenQ', 'GW2480', 24.0, '1920x1080', 'IPS', 60, 2, 25, 179.99),
('Dell', 'S2722DGM', 27.0, '2560x1440', 'VA', 165, 1, 7, 449.99);

-- Mice
INSERT INTO mice (brand, model, connection_type, dpi_max, wireless, supplier_id, stock_quantity, unit_price) VALUES
('Logitech', 'MX Master 3', 'Bluetooth', 4000, true, 2, 25, 99.99),
('Logitech', 'M720 Triathlon', 'Bluetooth', 1600, true, 2, 18, 69.99),
('Logitech', 'M185', 'USB 2.4GHz', 1000, false, 2, 40, 19.99),
('Dell', 'MS5120W', 'Bluetooth', 1600, true, 1, 15, 39.99),
('Logitech', 'G502 X Plus', 'USB 2.4GHz', 25600, true, 2, 7, 149.99),
('Corsair', 'M65 RGB Elite', 'USB', 18000, false, 8, 12, 79.99),
('Razer', 'DeathAdder V3', 'USB/Wireless', 30000, true, 8, 9, 69.99),
('SteelSeries', 'Rival 5', 'USB', 18000, false, 8, 14, 49.99);

-- Keyboards
INSERT INTO keyboards (brand, model, switch_type, layout, wireless, supplier_id, stock_quantity, unit_price) VALUES
('Logitech', 'MX Keys', 'Scissor', 'AZERTY', true, 2, 20, 109.99),
('Logitech', 'K380', 'Membrane', 'AZERTY', true, 2, 30, 44.99),
('Keychron', 'K2 Pro', 'Mechanical', 'AZERTY', true, 5, 10, 99.00),
('Dell', 'KB600', 'Membrane', 'QWERTY', false, 1, 25, 39.99),
('Keychron', 'Q1 Pro', 'Mechanical', 'QWERTY', true, 5, 8, 179.00),
('Corsair', 'K70 RGB', 'Mechanical', 'QWERTY', false, 8, 11, 199.99),
('Razer', 'BlackWidow V4', 'Mechanical', 'QWERTY', true, 8, 6, 179.99),
('SteelSeries', 'Apex Pro', 'Mechanical', 'QWERTY', false, 8, 9, 229.99);

-- Computers
INSERT INTO computers (brand, model, type, cpu, ram_gb, storage_gb, storage_type, os, supplier_id, stock_quantity, unit_price) VALUES
('Lenovo', 'ThinkPad X1 Carbon G11', 'Laptop', 'Intel Core i7-1365U', 16, 512, 'NVMe', 'Windows 11 Pro', 4, 10, 1799.00),
('Dell', 'OptiPlex 7010', 'Desktop', 'Intel Core i5-13500', 16, 512, 'SSD', 'Windows 11 Pro', 1, 8, 1099.00),
('Lenovo', 'ThinkCentre M90q', 'Mini-PC', 'Intel Core i7-13700T', 32, 1024, 'NVMe', 'Windows 11 Pro', 4, 5, 1399.00),
('Dell', 'Latitude 5540', 'Laptop', 'Intel Core i5-1335U', 16, 512, 'NVMe', 'Windows 11 Pro', 1, 12, 1299.00),
('Lenovo', 'IdeaPad Flex 5', 'Laptop', 'AMD Ryzen 5 7530U', 16, 512, 'NVMe', 'Windows 11 Home', 4, 6, 749.00),
('Apple', 'MacBook Pro 14"', 'Laptop', 'Apple M3 Max', 18, 512, 'SSD', 'macOS Monterey', 3, 4, 2499.00),
('Dell', 'Precision 5680', 'Laptop', 'Intel Core i9-13900H', 64, 2048, 'NVMe', 'Windows 11 Pro', 1, 2, 3299.00),
('HP', 'EliteDesk 800 G9', 'Desktop', 'Intel Core i5-13500', 16, 512, 'SSD', 'Windows 11 Pro', 2, 6, 899.00);

-- Migrate computer type strings to item_type FK
UPDATE computers SET item_type_id = (SELECT item_type_id FROM item_types WHERE name = 'Laptop') WHERE type = 'Laptop';
UPDATE computers SET item_type_id = (SELECT item_type_id FROM item_types WHERE name = 'Desktop') WHERE type = 'Desktop';
UPDATE computers SET item_type_id = (SELECT item_type_id FROM item_types WHERE name = 'Mini-PC') WHERE type = 'Mini-PC';

-- Locations
INSERT INTO locations (name, type, description, status) VALUES
('Aula 1', 'classroom', 'Aula principal primer piso', 'active'),
('Aula 2', 'classroom', 'Aula secundaria primer piso', 'active'),
('Laboratorio Informática', 'lab', 'Laboratorio con equipos informáticos', 'active'),
('Biblioteca', 'classroom', 'Biblioteca escolar', 'active'),
('Sala de Profes', 'office', 'Sala de reuniones del profesorado', 'active'),
('Almacén', 'warehouse', 'Almacén general de equipamiento', 'active'),
('Oficina Administración', 'office', 'Oficina del equipo administrativo', 'active'),
('Despacho Dirección', 'office', 'Despacho del director', 'active')
ON CONFLICT DO NOTHING;

-- Products (bundles)
INSERT INTO products (bundle_name, monitor_id, mouse_id, keyboard_id, computer_id, status) VALUES
('Developer Workstation - Premium', 1, 1, 3, 1, 'available'),
('Designer Workstation - UltraWide', 5, 5, 5, 3, 'available'),
('Standard Office Pack - Budget', 4, 3, 1, 4, 'assigned'),
('Manager Laptop Bundle - Full', 1, 2, 1, 1, 'assigned'),
('Basic Office Desktop - Entry', 4, 4, 4, 2, 'available'),
('Ultrawide Creative Setup - Pro', 5, 1, 5, 3, 'maintenance'),
('Budget Starter Kit - Student', 7, 4, 2, 5, 'available'),
('Gaming Workstation - High-End', 3, 7, 7, 7, 'available'),
('Development PowerStation - Expert', 2, 5, 8, 7, 'maintenance'),
('Corporate Desktop Bundle', 4, 8, 4, 8, 'available')
ON CONFLICT DO NOTHING;

-- Incidencias
INSERT INTO incidencias (title, description, priority, status, previous_product_status, product_id, created_at, updated_at) VALUES
('Monitor parpadea en Developer Workstation', 'El monitor Dell U2722D presenta parpadeos intermitentes al trabajar con VS Code.', 'medium', 'in_progress', 'available', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Teclado Keychron no conecta', 'El teclado Keychron Q1 Pro del Designer Workstation no se empareja por Bluetooth tras actualización de firmware.', 'high', 'open', null, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Ratón Logitech doble clic', 'El MX Master 3 del Manager Laptop Bundle hace doble clic involuntario. Ya fue reemplazado.', 'low', 'resolved', 'assigned', 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

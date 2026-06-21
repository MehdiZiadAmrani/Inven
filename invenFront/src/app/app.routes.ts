import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { ItemListComponent } from './components/item-list/item-list.component';
import { ItemDetailComponent } from './components/item-detail/item-detail.component';
import { ItemCreateComponent } from './components/item-create/item-create.component';
import { ItemTypeManagementComponent } from './components/item-type-management/item-type-management.component';
import { LocationManagementComponent } from './components/location-management/location-management.component';
import { BrandManagementComponent } from './components/brand-management/brand-management.component';
import { IncidenciaListComponent } from './components/incidencia-list/incidencia-list.component';
import { IncidenciaDetailComponent } from './components/incidencia-detail/incidencia-detail.component';
import { authGuard, adminGuard } from './services/auth.guard';
import { MainLayoutComponent } from './components/main-layout/main-layout.component';
import { HomeComponent } from './components/home/home.component';

export const routes: Routes = [
  { path: '', component: MainLayoutComponent, canActivate: [authGuard], children: [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'home', component: HomeComponent },
    { path: 'computers', component: ItemListComponent, data: { itemType: 'computer' } },
    { path: 'computers/create', component: ItemCreateComponent, data: { itemType: 'computer' }, canActivate: [adminGuard] },
    { path: 'computers/:id', component: ItemDetailComponent, data: { itemType: 'computer' } },
    { path: 'monitors', component: ItemListComponent, data: { itemType: 'monitor' } },
    { path: 'monitors/create', component: ItemCreateComponent, data: { itemType: 'monitor' }, canActivate: [adminGuard] },
    { path: 'monitors/:id', component: ItemDetailComponent, data: { itemType: 'monitor' } },
    { path: 'keyboards', component: ItemListComponent, data: { itemType: 'keyboard' } },
    { path: 'keyboards/create', component: ItemCreateComponent, data: { itemType: 'keyboard' }, canActivate: [adminGuard] },
    { path: 'keyboards/:id', component: ItemDetailComponent, data: { itemType: 'keyboard' } },
    { path: 'mice', component: ItemListComponent, data: { itemType: 'mouse' } },
    { path: 'mice/create', component: ItemCreateComponent, data: { itemType: 'mouse' }, canActivate: [adminGuard] },
    { path: 'mice/:id', component: ItemDetailComponent, data: { itemType: 'mouse' } },
    { path: 'incidencias', component: IncidenciaListComponent },
    { path: 'incidencias/:id', component: IncidenciaDetailComponent },
    { path: 'admin/item-types', component: ItemTypeManagementComponent, canActivate: [adminGuard] },
    { path: 'admin/locations', component: LocationManagementComponent, canActivate: [adminGuard] },
    { path: 'admin/brands', component: BrandManagementComponent, canActivate: [adminGuard] },
  ]},
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: '**', redirectTo: '/home' }
];

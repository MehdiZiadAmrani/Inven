import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // '' just redirects to /home, no rendering needed
  { path: '', renderMode: RenderMode.Client },
  { path: 'home', renderMode: RenderMode.Client },

  { path: 'login', renderMode: RenderMode.Prerender },
  { path: 'register', renderMode: RenderMode.Prerender },

  // These have authGuard — can't prerender (no auth context on server)
  { path: 'computers', renderMode: RenderMode.Client },
  { path: 'computers/:id', renderMode: RenderMode.Client },
  { path: 'monitors', renderMode: RenderMode.Client },
  { path: 'monitors/:id', renderMode: RenderMode.Client },
  { path: 'keyboards', renderMode: RenderMode.Client },
  { path: 'keyboards/:id', renderMode: RenderMode.Client },
  { path: 'mice', renderMode: RenderMode.Client },
  { path: 'mice/:id', renderMode: RenderMode.Client },
  { path: 'incidencias', renderMode: RenderMode.Client },
  { path: 'incidencias/:id', renderMode: RenderMode.Client },
  { path: 'admin/item-types', renderMode: RenderMode.Client },
  { path: 'admin/locations', renderMode: RenderMode.Client },
  { path: 'admin/brands', renderMode: RenderMode.Client },
  // '**' redirects to /home, no rendering needed
  { path: '**', renderMode: RenderMode.Client }
];
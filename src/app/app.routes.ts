import { Routes } from '@angular/router';

export const routes: Routes = [
  // Esta rota é a rota PAI que contém as abas
  {
    path: 'tabs',
    // lazy loading do componente 'TabsPage'
    loadComponent: () => import('./tabs/tabs.page').then(m => m.TabsPage),
    children: [
      // Rotas filhas que definem o conteúdo de cada aba
      {
        path: 'tab1',
        loadComponent: () => import('./tab1/tab1.page').then(m => m.Tab1Page)
      },
      {
        path: 'tab2',
        loadComponent: () => import('./tab2/tab2.page').then(m => m.Tab2Page)
      },
      // ... adicione outras abas, se houver
      
      // Rota de Redirecionamento 1: Quando a URL for apenas '/tabs', vai para 'tab1'
      {
        path: '',
        redirectTo: '/tabs/tab1',
        pathMatch: 'full',
      },
    ],
  },
  
  // Rota de Redirecionamento 2: Quando a URL estiver VAZIA ('/'), vai para '/tabs/tab1'
  // ESTA É A ROTA CRÍTICA QUE RESOLVE A TELA EM BRANCO INICIAL
  {
    path: '',
    redirectTo: '/tabs/tab1',
    pathMatch: 'full',
  },
];

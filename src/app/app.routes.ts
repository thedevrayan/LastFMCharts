import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'tabs',
    // Carrega o componente que contém a barra de abas (<ion-tabs>)
    loadComponent: () => import('./tabs/tabs.page').then((m) => m.TabsPage),
    children: [
      // ------------------------------------------
      // ROTAS FILHAS (DENTRO DAS ABAS)
      // ------------------------------------------
      {
        path: 'tab1',
        loadComponent: () => import('./tab1/tab1.page').then((m) => m.Tab1Page),
      },
      {
        path: 'tab2',
        loadComponent: () => import('./tab2/tab2.page').then((m) => m.Tab2Page),
      },
      {
        path: 'tab3', 
        // Note: Em projetos Ionic/Angular, o caminho é frequentemente assim:
        loadComponent: () => import('./tab3/tab3.page').then((m) => m.Tab3Page),
      },
      
      // Redirecionamento 1: Redireciona de /tabs/ (sem nada depois) para /tabs/tab1
      {
        path: '',
        redirectTo: '/tabs/tab1',
        pathMatch: 'full',
      },
    ],
  },
  
  // ------------------------------------------
  // ROTA PRINCIPAL (FORA DAS ABAS)
  // ------------------------------------------
  {
    path: '',
    redirectTo: '/tabs/tab1',
    pathMatch: 'full',
  },
];
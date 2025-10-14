import { Routes } from '@angular/router';
import { Viewer } from '../Pages/Viewer/Viewer';
import { Home } from '../Pages/Home/Home';

export const routes: Routes = [
    {
        path: '',
        component: Home
    },
    
    {
        path: 'viewer',
        component: Viewer
    }
];

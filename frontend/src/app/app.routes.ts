import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { BreweryComponent } from './brewery/brewery.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'breweries', component: BreweryComponent }
];

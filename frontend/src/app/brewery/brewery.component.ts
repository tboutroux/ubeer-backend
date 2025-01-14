import { Component, OnInit } from '@angular/core';
import { BreweryService } from '../services/brewery.service';
import { NavbarComponent } from "../navbar/navbar.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-brewery',
  standalone: true,
  imports: [NavbarComponent, CommonModule],
  templateUrl: './brewery.component.html',
  styleUrls: ['./brewery.component.scss']
})
export class BreweryComponent implements OnInit {
  breweries: any[] = []; // Stocke les brasseries reçues

  constructor(private breweryService: BreweryService) {}

  ngOnInit(): void {
    // Écoute des données via le WebSocket
    this.breweryService.getBreweries().subscribe((data) => {
      console.log('Get breweries')
      this.breweries = data;
    });

    // Demande explicite des brasseries
    this.breweryService.fetchBreweries();
  }
}

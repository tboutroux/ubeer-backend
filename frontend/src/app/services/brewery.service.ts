import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BreweryService {
  private socket: Socket;

  constructor() {
    // Corrigez l'URL du serveur Socket.IO (doit correspondre au port de votre backend)
    this.socket = io('http://localhost:3100'); // Port correct
  }

  // Méthode pour écouter les brasseries via le socket
  getBreweries(): Observable<any[]> {
    return new Observable((subscriber) => {
      // Écoute de l'événement "breweries"
      this.socket.on('breweries', (data) => {
        subscriber.next(data); // Envoie des données au composant
      });

      // Nettoyage : désabonnement pour éviter des fuites mémoire
      return () => {
        this.socket.off('breweries');
      };
    });
  }

  // Méthode pour demander des brasseries explicitement
  fetchBreweries(): void {
    this.socket.emit('getBreweries'); // Émission d'une requête au serveur
  }
}

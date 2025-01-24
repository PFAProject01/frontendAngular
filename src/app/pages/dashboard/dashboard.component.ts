import { Component, ViewChild, ElementRef,ChangeDetectorRef  } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  @ViewChild('videoElement', { static: false }) videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement', { static: false }) canvasElement!: ElementRef<HTMLCanvasElement>;
  @ViewChild('extractedDataSection', { static: false }) extractedDataSection!: ElementRef;


  stream: MediaStream | null = null;
  status: string = 'Camera is inactive';
  extractedData: any ;
  prenomfr: string = '';
  nomfr: string = '';
  prenomar: string = '';
  nomar: string = '';
  cin: string = '';
  datenai: string = '';
  lieunaisfr: string = '';
  lieunaisar: string = '';
  validite: string = '';
  numero: string = '';

  apiUrl: string = 'http://localhost:8000/api/code/extract_text_from_regionOLD/'; // URL de l'API

  constructor(private http: HttpClient,private cdr: ChangeDetectorRef) {}

  /**
   * Ouvre le modal et démarre la caméra
   */
  openScannerModal() {
    this.startCamera();
  }

  /**
   * Démarre la caméra
   */
  startCamera() {
    if (this.stream) {
      this.status = 'Camera is already active.';
      return;
    }

    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        this.stream = stream;
        this.videoElement.nativeElement.srcObject = stream;
        this.status = 'Camera is active.';
      })
      .catch((error) => {
        console.error('Erreur lors de l’accès à la caméra:', error);
        this.status = 'Erreur: Impossible d’accéder à la caméra. Vérifiez les permissions.';
      });
  }

  /**
   * Capture une image à partir du flux vidéo
   */
  captureImage() {
    if (!this.stream) {
      this.status = 'Erreur: La caméra n’est pas active.';
      return;
    }

    try {
      const video = this.videoElement.nativeElement;
      const canvas = this.canvasElement.nativeElement;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
          if (blob) {
            this.sendImage(blob); // Envoie l'image capturée à l'API
          }
        }, 'image/jpeg'); // Format de l'image
      }
    } catch (error) {
      console.error('Erreur lors de la capture d’image:', error);
      this.status = 'Erreur lors de la capture d’image.';
    }
  }




  processImage(response: any) {
    this.prenomfr = response.extracted_data.prenom || '';  // Assurez-vous que la donnée n'est pas null ou undefined
    this.nomfr = response.extracted_data.nom || '';
    this.prenomar = response.extracted_data.prenomAr || '';
    this.nomar = response.extracted_data.nomAr || '';
    this.datenai = response.extracted_data.date_naissance || '';
    this.lieunaisfr = response.extracted_data.lieu_naissance || '';
    this.lieunaisar = response.extracted_data.lieu_naissanceAr || '';
    this.validite = response.extracted_data.date_validite || '';
    this.numero = response.extracted_data.num_carte || '';
  
    this.cdr.markForCheck();  // Forcer la mise à jour du DOM
  }
  

  /**
   * Envoie l'image capturée à l'API pour traitement
   */
  sendImage(imageBlob: Blob) {
    const formData = new FormData();
    formData.append('image', imageBlob, 'captured-image.jpg');

    this.http.post(this.apiUrl, formData).subscribe({
      next: (response: any) => {
        console.log('Image envoyée avec succès:', response);
        this.processImage(response); // Appel de la mise à jour de la section extraites données
        console.log('prenomfr:', this.prenomfr);
        console.log('nomfr:', this.nomfr);

      },
      error: (error) => {
        console.error('Erreur lors de l’envoi de l’image:', error);
        this.status = 'Erreur lors de l’analyse de l’image.';
        this.extractedData = null;
      
      },
    });
  }

  /**
   * Ferme le modal et arrête la caméra
   */
  closeModal() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
      this.status = 'Camera is inactive.';
    }
    
  }
  scaner() {
    this.captureImage(); // Capture l'image
    this.cdr.detectChanges();

  }

}

import { Component, OnInit } from "@angular/core";
import {  ElementRef, ViewChild } from '@angular/core';
import { NgbModal, NgbModalConfig } from "@ng-bootstrap/ng-bootstrap";
import {Subject, Observable} from 'rxjs';
import {WebcamImage, WebcamInitError, WebcamUtil} from 'ngx-webcam';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"],
  providers: [NgbModalConfig, NgbModal],
})
export class DashboardComponent  {
  @ViewChild('videoElement', { static: false }) videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement', { static: false }) canvasElement!: ElementRef<HTMLCanvasElement>;
  stream: MediaStream | null = null;
  status: string = 'Camera is inactive';
  extractedLines: string[];  // Store the extracted lines here

  constructor(private http: HttpClient) {}

  // Démarrer la caméra
  startCamera() {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        this.stream = stream;
        this.videoElement.nativeElement.srcObject = stream;
        this.status = 'Camera is active';
      })
      .catch((error) => {
        console.error('Error accessing the camera:', error);
        this.status = 'Failed to access the camera. Please check permissions.';
      });
  }

  // Capturer une image
  captureImage() {
    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;

    // Définir la taille du canvas en fonction de la vidéo
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Dessiner la vidéo sur le canvas
    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convertir le contenu du canvas en Blob (image)
      canvas.toBlob((blob) => {
        if (blob) {
          this.sendImage(blob); // Envoyer l'image capturée
        }
      }, 'image/jpeg'); // Format de l'image
    }
  }

  // Arrêter la caméra
  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
      this.status = 'Camera is stopped';
    }
  }

  // Envoyer l'image capturée à une API
  sendImage(imageBlob: Blob) {
    const formData = new FormData();
    formData.append('image', imageBlob, 'captured-image.jpg');

    const apiUrl = 'http://localhost:8000/api/code/visionAPIig/';

    this.http.post(apiUrl, formData).subscribe({
      next: (response: any) => {
        console.log('Image uploaded successfully:', response);
        console.log('Texte extrait:', response.text);
        console.log('Lignes extraites:', response.extracted_lines);

        this.status = 'Image uploaded successfully';

        if (Array.isArray(response.extracted_lines)) {
          this.extractedLines = response.extracted_lines;  // Mise à jour des lignes extraites
        } else {
          this.extractedLines = [];  // Si aucune ligne, on vide la variable
        }
        console.log(this.extractedLines);  // Vérifiez dans la console
      },
      error: (error) => {
        console.error('Error uploading image:', error);
        this.status = 'Error uploading image';
        this.extractedLines = [];
      },
    });
  }

  
  
}

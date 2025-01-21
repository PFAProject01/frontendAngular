import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
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
  @ViewChild('infoModal', { static: false }) infoModal!: NgbModalRef; // Ajout de l'@ViewChild du modal

  stream: MediaStream | null = null;
  status: string = 'Camera is inactive';
  extractedData: any = null;
  modalRef: NgbModalRef | null = null;

  constructor(private http: HttpClient, private modalService: NgbModal, private cdr: ChangeDetectorRef) {}

  // Start the camera
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

  // Capture image
  captureImage() {
    try {
      const video = this.videoElement.nativeElement;
      const canvas = this.canvasElement.nativeElement;

      if (!this.stream) {
        throw new Error('Camera is not active');
      }

      // Set canvas size based on video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame on canvas
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert canvas content to Blob (image)
        canvas.toBlob((blob) => {
          if (blob) {
            this.sendImage(blob); // Send captured image
          }
        }, 'image/jpeg'); // Image format
      }
    } catch (error) {
      console.error('Error during capture image:', error);
      this.status = 'Error capturing image';
    }
  }

  // Stop the camera
  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
      this.status = 'Camera is stopped';
      this.modalService.dismissAll(); // Dismiss all open modals
      this.cdr.detectChanges();  // Force UI refresh
    }
  }

  // Send captured image to API
  sendImage(imageBlob: Blob) {
    const formData = new FormData();
    formData.append('image', imageBlob, 'captured-image.jpg');

    const apiUrl = 'http://localhost:8000/api/code/extract_text_from_region/';

    this.http.post(apiUrl, formData).subscribe({
      next: (response: any) => {
        console.log('Image uploaded successfully:', response);
        this.extractedData = response.extracted_data;
        this.status = 'Image uploaded successfully';
        
      },
      error: (error) => {
        console.error('Error uploading image:', error);
        this.status = 'Error uploading image';
        this.extractedData = null;
      },
    });
  }

  // Open the modal
  openModal() {
    if (this.infoModal && !this.modalRef) {
      this.modalRef = this.modalService.open(this.infoModal, { size: 'lg', centered: true });
      this.cdr.detectChanges();  // Update UI
    }
  }
}

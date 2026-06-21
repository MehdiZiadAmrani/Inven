import { Component, Output, EventEmitter, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Html5Qrcode } from 'html5-qrcode';
import { ProductDTO } from '../../../services/product.service';

@Component({
  selector: 'app-qr-scanner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="scanner-section">
      <h2>QR Code Scanner</h2>
      <p class="scanner-info">Use your device camera to scan a product QR code</p>
      <div class="scanner-toggle">
        <button class="btn-scanner" [class.active]="isScanning" (click)="onToggle()">
          {{ isScanning ? 'Close Scanner' : 'Open Scanner' }}
        </button>
      </div>
      <div *ngIf="isScanning" class="scanner-container">
        <div id="reader" #qrReader></div>
        <p *ngIf="errorMessage" class="error">{{ errorMessage }}</p>
      </div>
    </div>
  `,
  styles: [`
    .scanner-section { background:var(--bg-surface); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:25px; box-shadow:var(--shadow-card); margin-top:30px; }
    h2 { margin-top:0; color:var(--primary); border-bottom:2px solid var(--border-color); padding-bottom:10px; font-size:20px; font-weight:600; }
    .scanner-info { color:var(--text-muted); font-size:13px; margin-bottom:15px; }
    .btn-scanner { background:var(--primary); color:var(--text-on-primary); border:none; padding:12px 24px; border-radius:var(--radius-sm); font-weight:600; cursor:pointer; font-size:14px; }
    .btn-scanner.active { background:var(--btn-delete); color:white; }
    .scanner-container { margin:20px 0; background:#000; border-radius:var(--radius-md); overflow:hidden; }
    #reader { width:100%; }
    .error { color:var(--status-unavailable); margin-top:10px; }
  `]
})
export class QrScannerComponent implements OnDestroy {
  @ViewChild('qrReader') qrReaderElement: ElementRef | null = null;

  @Output() scanned = new EventEmitter<string>();

  isScanning = false;
  errorMessage = '';

  private html5QrCode: Html5Qrcode | null = null;

  onToggle(): void {
    this.isScanning = !this.isScanning;
    this.errorMessage = '';
    if (this.isScanning) {
      setTimeout(() => this.startScanner(), 100);
    } else {
      this.stopScanner();
    }
  }

  private startScanner(): void {
    this.html5QrCode = new Html5Qrcode('reader');
    this.html5QrCode.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      (decodedText) => {
        this.scanned.emit(decodedText);
        this.isScanning = false;
        this.stopScanner();
      },
      () => { /* suppress frame errors */ }
    ).catch(err => {
      this.errorMessage = 'Failed to start camera. ' + err;
    });
  }

  private stopScanner(): void {
    if (this.html5QrCode) {
      this.html5QrCode.stop().then(() => {
        this.html5QrCode = null;
      }).catch(() => { /* scanner already stopped */ });
    }
  }

  ngOnDestroy(): void {
    this.stopScanner();
  }
}

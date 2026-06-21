import { Injectable } from '@angular/core';
import QRCode from 'qrcode';

@Injectable({
  providedIn: 'root'
})
export class QrCodeService {
  
  generateQRCode(data: string, options?: any): Promise<string> {
    return new Promise((resolve, reject) => {
      const qrOptions = {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        width: 300,
        margin: 1,
        ...options
      };
      QRCode.toDataURL(data, qrOptions, (err: any, url: string) => {
        if (err) {
          reject(err);
        } else {
          resolve(url);
        }
      });
    });
  }

  generateQRCodeCanvas(data: string, canvas: HTMLCanvasElement): Promise<void> {
    return QRCode.toCanvas(canvas, data, {
      errorCorrectionLevel: 'H',
      width: 300,
      margin: 1
    });
  }
}

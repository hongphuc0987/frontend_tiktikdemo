// src/app/components/upload-video/upload-video.component.ts
import { Component, inject } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzUploadModule, NzUploadFile } from 'ng-zorro-antd/upload';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { environment } from '../../../environment/environment';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-upload-video',
  standalone: true,
  imports: [ng add ng-zorro-antd
    CommonModule,
    FormsModule,
    NzUploadModule,
    NzInputModule,
    NzButtonModule,
    NzProgressModule,
    NzIconModule
  ],
  templateUrl: './upload-video.component.html',
  styleUrls: ['./upload-video.component.css']
})
export class UploadVideoComponent {
  private http = inject(HttpClient);
  private msg = inject(NzMessageService);
  private auth = inject(AuthService);

  videoFile: File | null = null;
  thumbnailFile: File | null = null;
  description = '';
  uploading = false;
  progress = 0;
  videoPreviewUrl = '';
  thumbnailPreviewUrl = '';

  beforeUploadVideo = (file: NzUploadFile): boolean => {
    const isVideo = file.type?.startsWith('video/');
    const isLt100M = file.size! / 1024 / 1024 < 100;

    if (!isVideo) {
      this.msg.error('Chỉ chấp nhận file video!');
      return false;
    }
    if (!isLt100M) {
      this.msg.error('Video phải nhỏ hơn 100MB!');
      return false;
    }

    this.videoFile = file as unknown as File;
    this.createPreview(this.videoFile, 'video');
    return false; // Ngăn upload tự động
  };

  beforeUploadThumbnail = (file: NzUploadFile): boolean => {
    const isImage = file.type?.startsWith('image/');
    const isLt5M = file.size! / 1024 / 1024 < 5;

    if (!isImage) {
      this.msg.error('Chỉ chấp nhận ảnh JPG/PNG!');
      return false;
    }
    if (!isLt5M) {
      this.msg.error('Ảnh phải nhỏ hơn 5MB!');
      return false;
    }

    this.thumbnailFile = file as unknown as File;
    this.createPreview(this.thumbnailFile, 'thumbnail');
    return false;
  };

  createPreview(file: File, type: 'video' | 'thumbnail') {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      if (type === 'video') {
        this.videoPreviewUrl = e.target.result;
      } else {
        this.thumbnailPreviewUrl = e.target.result;
      }
    };
    reader.readAsDataURL(file);
  }

  upload() {
    if (!this.videoFile || !this.thumbnailFile) {
      this.msg.warning('Vui lòng chọn video và ảnh thumbnail!');
      return;
    }

    this.uploading = true;
    this.progress = 0;

    const formData = new FormData();
    formData.append('video', this.videoFile);
    formData.append('thumbnail', this.thumbnailFile);
    if (this.description) {
      formData.append('description', this.description);
    }

    this.http.post(`${environment.apiUrl}/upload`, formData, {
      reportProgress: true,
      observe: 'events',
      withCredentials: true
    }).subscribe({
      next: (event: any) => {
        if (event.type === HttpEventType.UploadProgress) {
          this.progress = Math.round(100 * event.loaded / event.total!);
        } else if (event.type === HttpEventType.Response) {
          this.msg.success('Upload video thành công!');
          this.resetForm();
        }
      },
      error: (err) => {
        this.msg.error(err.error?.message || 'Upload thất bại!');
        this.uploading = false;
      }
    });
  }

  resetForm() {
    this.videoFile = null;
    this.thumbnailFile = null;
    this.description = '';
    this.videoPreviewUrl = '';
    this.thumbnailPreviewUrl = '';
    this.uploading = false;
    this.progress = 0;
  }
}
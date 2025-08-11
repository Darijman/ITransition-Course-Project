import { Inject, Injectable } from '@nestjs/common';
import { UploadApiResponse, v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import { Express } from 'express';

@Injectable()
export class CloudinaryService {
  constructor(@Inject('CLOUDINARY') private readonly cloudinaryClient: typeof cloudinary) {}

  async uploadImage(file: Express.Multer.File): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream({ folder: 'avatars' }, (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error('No result returned from Cloudinary upload'));
        resolve(result);
      });

      Readable.from(file.buffer).pipe(uploadStream);
    });
  }

  async deleteImage(publicId: string) {
    await this.cloudinaryClient.uploader.destroy(publicId);
  }
}

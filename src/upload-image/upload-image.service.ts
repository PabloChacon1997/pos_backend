import { Injectable } from '@nestjs/common';
import 'multer';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';

import { CloudinaryResponse } from './upload-image.response';

@Injectable()
export class UploadImageService {
  uploadFile(file: Express.Multer.File): Promise<CloudinaryResponse> {
    return new Promise<CloudinaryResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        (error, result) => {
          if (error)
            return reject(
              new Error(`Error uploading file to Cloudinary: ${error.message}`),
            );
          if (!result)
            return reject(new Error('No result returned from Cloudinary'));
          resolve(result);
        },
      );
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }
}

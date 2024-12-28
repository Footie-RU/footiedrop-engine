import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor() {
    // Log Cloudinary configuration setup
    // console.log('Configuring Cloudinary...');
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    // Log to verify config is loaded
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      // console.log('Cloudinary configuration loaded successfully');
    } else {
      console.error('Error: Cloudinary configuration is missing');
      throw new InternalServerErrorException(
        'Cloudinary configuration is missing!',
      );
    }
  }

  async uploadImage(
    file: Express.Multer.File,
    folder: string,
    filename: string = folder,
  ): Promise<UploadApiResponse> {
    const base64Image = file.buffer.toString('base64');
    const mimeType = file.mimetype; // Get the MIME type from the uploaded file

    const dataUrl = `data:${mimeType};base64,${base64Image}`;

    // Log the start of the upload process
    // console.log('Uploading image to Cloudinary...');
    // console.log(`Folder: footiedrop/${folder}`);

    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        dataUrl,
        {
          folder: `footiedrop/${folder}`,
          resource_type: 'auto',
          filename_override: filename,
        },
        (error, result) => {
          if (error) {
            // Log error if the upload fails
            console.error(
              'Error uploading image to Cloudinary:',
              error.message,
            );
            return reject(error);
          }

          // Log the success of the upload and the returned result
          // console.log('Image uploaded successfully:', result);

          resolve(result);
        },
      );
    });
  }
}

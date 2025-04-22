import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

interface MediaItem {
  url: string;
  type: 'image' | 'video';
  width: number;
  height: number;
}

const IMAGE_WIDTH = 900; // 3:1 aspect ratio at 300px height
const IMAGE_HEIGHT = 300;

export async function GET() {
  try {
    const mediaDirectory = path.join(process.cwd(), 'public', 'images', 'media');
    
    // Check if directory exists
    if (!fs.existsSync(mediaDirectory)) {
      return NextResponse.json(
        { error: 'Media directory not found' },
        { status: 404 }
      );
    }
    
    // Read files from directory, ignoring already optimized files
    const fileNames = fs.readdirSync(mediaDirectory).filter((name) => !name.startsWith('optimized-'));
    
    const items: MediaItem[] = await Promise.all(
      fileNames.map(async (fileName) => {
        const filePath = `/images/media/${fileName}`;
        const fullPath = path.join(mediaDirectory, fileName);
        const fileExtension = path.extname(fileName).toLowerCase();
        const isVideo = ['.mp4', '.webm', '.mov'].includes(fileExtension);

        if (isVideo) {
          // For videos, we'll return the original file
          return {
            url: filePath,
            type: 'video',
            width: IMAGE_WIDTH,
            height: IMAGE_HEIGHT,
          };
        } else {
          // For images, optimize and resize
          try {
            const optimizedFileName = `optimized-${fileName}`;
            const optimizedPath = path.join(mediaDirectory, optimizedFileName);
            
            // Only optimize if not already optimized
            if (!fs.existsSync(optimizedPath)) {
              await sharp(fullPath)
                .resize(IMAGE_WIDTH, IMAGE_HEIGHT, {
                  fit: 'cover',
                  position: 'attention' // Focus on the important parts of the image
                })
                .webp({ quality: 85 }) // Convert to WebP for better compression
                .toFile(optimizedPath);
            }
            
            return {
              url: `/images/media/${optimizedFileName}`,
              type: 'image',
              width: IMAGE_WIDTH,
              height: IMAGE_HEIGHT,
            };
          } catch (error) {
            console.error(`Error optimizing image ${fileName}:`, error);
            // Fallback to original image if optimization fails
            return {
              url: filePath,
              type: 'image',
              width: IMAGE_WIDTH,
              height: IMAGE_HEIGHT,
            };
          }
        }
      })
    );
    
    return NextResponse.json({ items });
  } catch (error) {
    console.error('Error fetching media:', error);
    return NextResponse.json(
      { error: 'Failed to fetch media' },
      { status: 500 }
    );
  }
} 
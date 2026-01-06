/**
 * Image Optimization Script
 * Optimizes images from Buisiness-Branding-Elements for production
 * Converts to WebP and creates responsive variants
 */

import { readdir, mkdir, stat } from 'fs/promises';
import { join, dirname, extname, basename } from 'path';
import { existsSync } from 'fs';
import sharp from 'sharp';

const BRANDING_DIR = './Buisiness-Branding-Elements';
const OUTPUT_DIR = './public/optimized-images';
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.svg'];

async function optimizeImage(inputPath, outputDir) {
  try {
    const ext = extname(inputPath).toLowerCase();
    const baseName = basename(inputPath, ext);
    
    // Skip if already optimized
    if (ext === '.webp') return;

    // Create WebP version
    const webpPath = join(outputDir, `${baseName}.webp`);
    await sharp(inputPath)
      .webp({ quality: 85, effort: 6 })
      .toFile(webpPath);
    console.log(`✓ Optimized: ${baseName}.webp`);

    // Create responsive variants for large images
    const metadata = await sharp(inputPath).metadata();
    if (metadata.width > 800) {
      const widths = [480, 800, 1200];
      for (const width of widths) {
        if (width < metadata.width) {
          const variantPath = join(outputDir, `${baseName}_${width}w.webp`);
          await sharp(inputPath)
            .resize(width, null, { withoutEnlargement: true })
            .webp({ quality: 85 })
            .toFile(variantPath);
          console.log(`  → Variant: ${baseName}_${width}w.webp`);
        }
      }
    }
  } catch (error) {
    console.error(`Error optimizing ${inputPath}:`, error.message);
  }
}

async function processDirectory(dir, outputDir) {
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      
      if (entry.isDirectory()) {
        // Recursively process subdirectories
        const subOutputDir = join(outputDir, entry.name);
        if (!existsSync(subOutputDir)) {
          await mkdir(subOutputDir, { recursive: true });
        }
        await processDirectory(fullPath, subOutputDir);
      } else if (entry.isFile()) {
        const ext = extname(entry.name).toLowerCase();
        if (IMAGE_EXTENSIONS.includes(ext)) {
          await optimizeImage(fullPath, outputDir);
        }
      }
    }
  } catch (error) {
    console.error(`Error processing directory ${dir}:`, error.message);
  }
}

async function main() {
  console.log('🔄 Starting image optimization...\n');
  
  // Check if sharp is available
  try {
    await sharp({ create: { width: 1, height: 1, channels: 3 } }).toBuffer();
  } catch (error) {
    console.error('❌ Sharp not available. Installing...');
    console.log('Run: npm install --save-dev sharp');
    process.exit(1);
  }

  // Create output directory
  if (!existsSync(OUTPUT_DIR)) {
    await mkdir(OUTPUT_DIR, { recursive: true });
  }

  // Process dashboard_assets/images directory
  const imagesDir = join(BRANDING_DIR, 'dashboard_assets', 'assets', 'images');
  if (existsSync(imagesDir)) {
    console.log(`Processing: ${imagesDir}\n`);
    await processDirectory(imagesDir, join(OUTPUT_DIR, 'images'));
  }

  console.log('\n✅ Image optimization complete!');
  console.log(`Optimized images saved to: ${OUTPUT_DIR}`);
}

main().catch(console.error);


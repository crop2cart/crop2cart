import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    console.log('[Cloudinary] ========== IMAGE UPLOAD START ==========');

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    console.log('[Cloudinary] Files received:', files.length);
    files.forEach((file, idx) => {
      console.log(`  [${idx}] ${file.name} - ${file.size} bytes - ${file.type}`);
    });

    if (!files || files.length === 0) {
      console.log('[Cloudinary] ❌ No files provided');
      return NextResponse.json(
        { success: false, error: 'No files provided' },
        { status: 400 }
      );
    }

    // Check Cloudinary config
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    console.log('[Cloudinary] Environment Check:');
    console.log(`  cloudName: ${cloudName ? '✓ ' + cloudName : '✗ MISSING'}`);
    console.log(`  apiKey: ${apiKey ? '✓ Set' : '✗ MISSING'}`);
    console.log(`  apiSecret: ${apiSecret ? '✓ Set' : '✗ MISSING'}`);

    if (!cloudName || !apiKey || !apiSecret) {
      console.log('[Cloudinary] ❌ Missing Cloudinary credentials');
      return NextResponse.json(
        { success: false, error: 'Missing Cloudinary credentials' },
        { status: 500 }
      );
    }

    const imageUrls: string[] = [];
    const uploadErrors: string[] = [];

    console.log('[Cloudinary] Starting file uploads...\n');

    // Upload each file to Cloudinary
    for (let fileIdx = 0; fileIdx < files.length; fileIdx++) {
      const file = files[fileIdx];

      try {
        console.log(`\n[Cloudinary] File ${fileIdx + 1}/${files.length}: ${file.name}`);
        console.log(`  Size: ${file.size} bytes`);
        console.log(`  Type: ${file.type}`);

        // Convert file to buffer
        const buffer = Buffer.from(await file.arrayBuffer());

        // Upload to Cloudinary
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: 'freshmart/products',
              resource_type: 'auto',
              public_id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            },
            (error: any, result: any) => {
              if (error) reject(error);
              else resolve(result);
            }
          );

          stream.end(buffer);
        });

        const uploadedFile = result as any;
        console.log(`  ✓ Cloudinary Public ID: ${uploadedFile.public_id}`);
        console.log(`  ✓ URL: ${uploadedFile.secure_url}`);

        imageUrls.push(uploadedFile.secure_url);

      } catch (fileError) {
        console.error(`  ❌ Exception uploading file:`, fileError);
        uploadErrors.push(
          `${file.name}: ${fileError instanceof Error ? fileError.message : 'Unknown error'}`
        );
      }
    }

    console.log(`\n[Cloudinary] ========== UPLOAD SUMMARY ==========`);
    console.log(`  Total files: ${files.length}`);
    console.log(`  Successful: ${imageUrls.length}`);
    console.log(`  Failed: ${uploadErrors.length}`);

    if (uploadErrors.length > 0) {
      console.log(`  Errors:`);
      uploadErrors.forEach((err, idx) => console.log(`    [${idx + 1}] ${err}`));
    }

    if (imageUrls.length === 0) {
      console.log('[Cloudinary] ❌ NO IMAGES UPLOADED');
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to upload any images',
          details: uploadErrors.join('; '),
        },
        { status: 500 }
      );
    }

    console.log('[Cloudinary] ✓ SUCCESS - All images uploaded to Cloudinary');
    console.log('[Cloudinary] ========== END ==========\n');

    return NextResponse.json({
      success: true,
      data: {
        imageUrls,
        count: imageUrls.length,
      },
    });

  } catch (error) {
    console.error('[Cloudinary] ========== FATAL ERROR ==========');
    console.error('[Cloudinary] Error:', error);
    if (error instanceof Error) {
      console.error('[Cloudinary] Message:', error.message);
      console.error('[Cloudinary] Stack:', error.stack);
    }
    console.error('[Cloudinary] ========== END ==========\n');

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to upload images',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

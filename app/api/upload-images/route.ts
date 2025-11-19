import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('[Upload] ========== IMAGE UPLOAD START ==========');
    
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    console.log('[Upload] Files received:', files.length);
    files.forEach((file, idx) => {
      console.log(`  [${idx}] ${file.name} - ${file.size} bytes - ${file.type}`);
    });

    if (!files || files.length === 0) {
      console.log('[Upload] ❌ No files provided');
      return NextResponse.json(
        { success: false, error: 'No files provided' },
        { status: 400 }
      );
    }

    const bucketId = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID;
    const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
    const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
    const apiKey = process.env.APPWRITE_API_KEY;

    console.log('[Upload] Environment Check:');
    console.log(`  bucketId: ${bucketId ? '✓ ' + bucketId.substring(0, 10) + '...' : '✗ MISSING'}`);
    console.log(`  endpoint: ${endpoint ? '✓ ' + endpoint : '✗ MISSING'}`);
    console.log(`  projectId: ${projectId ? '✓ ' + projectId.substring(0, 10) + '...' : '✗ MISSING'}`);
    console.log(`  apiKey: ${apiKey ? '✓ Set' : '✗ MISSING'}`);

    if (!bucketId || !endpoint || !projectId || !apiKey) {
      console.log('[Upload] ❌ Missing environment variables');
      return NextResponse.json(
        { success: false, error: 'Missing environment variables', missing: {bucketId: !bucketId, endpoint: !endpoint, projectId: !projectId, apiKey: !apiKey} },
        { status: 500 }
      );
    }

    const imageUrls: string[] = [];
    const uploadErrors: string[] = [];
    const baseUrl = endpoint.replace('/v1', '');

    console.log('[Upload] Base URL:', baseUrl);
    console.log('[Upload] Starting file uploads...\n');

    // Upload each file to Appwrite storage via REST API
    for (let fileIdx = 0; fileIdx < files.length; fileIdx++) {
      const file = files[fileIdx];
      
      try {
        console.log(`\n[Upload] File ${fileIdx + 1}/${files.length}: ${file.name}`);
        console.log(`  Size: ${file.size} bytes`);
        console.log(`  Type: ${file.type}`);

        // Generate unique fileId
        const fileId = 'unique()';
        console.log(`  File ID: ${fileId}`);

        const fileFormData = new FormData();
        fileFormData.append('fileId', fileId);
        fileFormData.append('file', file);
        // CRITICAL: Set permissions to make file publicly readable
        fileFormData.append('permissions[]', 'read("any")');

        const uploadUrl = `${endpoint}/storage/buckets/${bucketId}/files`;
        console.log(`  Upload URL: ${uploadUrl}`);

        const uploadResponse = await fetch(uploadUrl, {
          method: 'POST',
          headers: {
            'X-Appwrite-Key': apiKey,
            'X-Appwrite-Project': projectId,
          },
          body: fileFormData,
        });

        console.log(`  Response Status: ${uploadResponse.status} ${uploadResponse.statusText}`);

        const responseText = await uploadResponse.text();
        console.log(`  Response Body Length: ${responseText.length} chars`);

        if (!uploadResponse.ok) {
          console.error(`  ❌ Upload failed!`);
          console.error(`  Error Response: ${responseText.substring(0, 500)}`);
          uploadErrors.push(`${file.name}: ${responseText.substring(0, 100)}`);
          continue;
        }

        let uploadedFile;
        try {
          uploadedFile = JSON.parse(responseText);
        } catch (e) {
          console.error(`  ❌ Failed to parse response as JSON`);
          console.error(`  Raw response: ${responseText.substring(0, 200)}`);
          uploadErrors.push(`${file.name}: Invalid response format`);
          continue;
        }

        console.log(`  ✓ File ID: ${uploadedFile.$id}`);

        // Generate public view URL for the uploaded image file
        // Use /view endpoint (works on free plan) instead of /preview (requires paid plan)
        const imageUrl = `${baseUrl}/v1/storage/buckets/${bucketId}/files/${uploadedFile.$id}/view?project=${projectId}`;
        imageUrls.push(imageUrl);
        console.log(`  ✓ Image URL: ${imageUrl}`);

      } catch (fileError) {
        console.error(`  ❌ Exception uploading file:`, fileError);
        uploadErrors.push(`${file.name}: ${fileError instanceof Error ? fileError.message : 'Unknown error'}`);
      }
    }

    console.log(`\n[Upload] ========== UPLOAD SUMMARY ==========`);
    console.log(`  Total files: ${files.length}`);
    console.log(`  Successful: ${imageUrls.length}`);
    console.log(`  Failed: ${uploadErrors.length}`);

    if (uploadErrors.length > 0) {
      console.log(`  Errors:`);
      uploadErrors.forEach((err, idx) => console.log(`    [${idx + 1}] ${err}`));
    }

    if (imageUrls.length === 0) {
      console.log('[Upload] ❌ NO IMAGES UPLOADED');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to upload any images',
          details: uploadErrors.join('; ')
        },
        { status: 500 }
      );
    }

    console.log('[Upload] ✓ SUCCESS - Images uploaded');
    console.log('[Upload] ========== END ==========\n');
    
    return NextResponse.json({
      success: true,
      data: {
        imageUrls,
        count: imageUrls.length,
      },
    });

  } catch (error) {
    console.error('[Upload] ========== FATAL ERROR ==========');
    console.error('[Upload] Error:', error);
    if (error instanceof Error) {
      console.error('[Upload] Message:', error.message);
      console.error('[Upload] Stack:', error.stack);
    }
    console.error('[Upload] ========== END ==========\n');

    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to upload images',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

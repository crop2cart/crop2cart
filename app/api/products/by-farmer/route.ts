// app/api/products/by-farmer/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerAppwrite, DATABASE_ID } from '@/lib/appwrite';

// Farmer collection mapping
const FARMER_COLLECTIONS: Record<string, string> = {
  '691d71728aae9e02a5a7': 'yakoge_products',
  '691d7173228d6f9d54a0': 'greenvalley_products',
  '691d7173bc793e81f6e0': 'freshharvest_products'
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const farmerId = searchParams.get('farmer_id');

    if (!farmerId) {
      return NextResponse.json(
        { error: 'farmer_id query parameter is required' },
        { status: 400 }
      );
    }

    // Get the correct farmer collection
    const collectionId = FARMER_COLLECTIONS[farmerId];
    if (!collectionId) {
      return NextResponse.json(
        { error: 'Invalid farmer_id' },
        { status: 400 }
      );
    }

    // Get products from farmer-specific collection
    const databases = getServerAppwrite();
    const response = await databases.listDocuments(
      DATABASE_ID,
      collectionId
    );

    // Format response
    const products = response.documents.map((doc: any) => ({
      id: doc.$id,
      name: doc.name,
      variant: doc.variant || "",
      fullPrice: doc.fullPrice,
      discount: doc.discount || 0,
      finalPrice: doc.finalPrice,
      stock: doc.stock || 0,
      description: doc.description || "",
      images: doc.images ? JSON.parse(doc.images) : [],
      createdAt: doc.createdAt,
    }));

    return NextResponse.json(products);
  } catch (error) {
    console.error('[API] Error fetching farmer products:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

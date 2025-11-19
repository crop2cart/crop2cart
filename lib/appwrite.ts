import { Client, Databases, ID, Query } from 'appwrite';

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

export const appwriteClient = client;
export const databases = new Databases(client);

// For server-side operations with API key, use fetch directly
export const getServerAppwrite = () => {
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!.replace('/v1', '');
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;
  const apiKey = process.env.APPWRITE_API_KEY!;

  return {
    async listDocuments(databaseId: string, collectionId: string, queries: any[] = []) {
      // Convert query objects to SDK Query strings
      // The Query class generates JSON string format: {"method":"equal","attribute":"email","values":["value"]}
      const queryStrings = queries.map((q: any) => {
        // If it's already a string (SDK Query output), use it directly
        if (typeof q === 'string') {
          return q;
        }
        // Otherwise, build the JSON format
        if (q.method === 'equal') {
          return JSON.stringify({
            method: 'equal',
            attribute: q.attribute,
            values: Array.isArray(q.value) ? q.value : [q.value]
          });
        } else if (q.method === 'orderDesc') {
          return JSON.stringify({
            method: 'orderDesc',
            attribute: q.attribute
          });
        } else if (q.method === 'orderAsc') {
          return JSON.stringify({
            method: 'orderAsc',
            attribute: q.attribute
          });
        } else if (q.method === 'limit') {
          return JSON.stringify({
            method: 'limit',
            values: [q.value]
          });
        } else if (q.method === 'offset') {
          return JSON.stringify({
            method: 'offset',
            values: [q.value]
          });
        } else if (q.method === 'greaterThan') {
          return JSON.stringify({
            method: 'greaterThan',
            attribute: q.attribute,
            values: [q.value]
          });
        } else if (q.method === 'greaterThanOrEqual') {
          return JSON.stringify({
            method: 'greaterThanOrEqual',
            attribute: q.attribute,
            values: [q.value]
          });
        } else if (q.method === 'lessThan') {
          return JSON.stringify({
            method: 'lessThan',
            attribute: q.attribute,
            values: [q.value]
          });
        } else if (q.method === 'lessThanOrEqual') {
          return JSON.stringify({
            method: 'lessThanOrEqual',
            attribute: q.attribute,
            values: [q.value]
          });
        } else if (q.method === 'isNotNull') {
          return JSON.stringify({
            method: 'isNotNull',
            attribute: q.attribute
          });
        } else if (q.method === 'isNull') {
          return JSON.stringify({
            method: 'isNull',
            attribute: q.attribute
          });
        }
        return '';
      }).filter(q => q);

      // Build query string with proper URL encoding
      const queryParams = queryStrings
        .map((queryStr: string, index: number) => `queries[${index}]=${encodeURIComponent(queryStr)}`)
        .join('&');

      const url = `${endpoint}/v1/databases/${databaseId}/collections/${collectionId}/documents${queryParams ? '?' + queryParams : ''}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-Appwrite-Project': projectId,
          'X-Appwrite-Key': apiKey,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Appwrite API Error:', errorText);
        throw new Error(`Appwrite error: ${response.statusText} - ${errorText}`);
      }

      return response.json();
    },

    async createDocument(databaseId: string, collectionId: string, documentId: string, data: any) {
      const url = `${endpoint}/v1/databases/${databaseId}/collections/${collectionId}/documents`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'X-Appwrite-Project': projectId,
          'X-Appwrite-Key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId,
          data,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Appwrite API Error:', errorText);
        throw new Error(`Appwrite error: ${response.statusText} - ${errorText}`);
      }

      return response.json();
    },

    async updateDocument(databaseId: string, collectionId: string, documentId: string, data: any) {
      const url = `${endpoint}/v1/databases/${databaseId}/collections/${collectionId}/documents/${documentId}`;

      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'X-Appwrite-Project': projectId,
          'X-Appwrite-Key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: data  // Wrap data in 'data' field for Appwrite REST API
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Appwrite API Error:', errorText);
        throw new Error(`Appwrite error: ${response.statusText} - ${errorText}`);
      }

      return response.json();
    },

    async deleteDocument(databaseId: string, collectionId: string, documentId: string) {
      const url = `${endpoint}/v1/databases/${databaseId}/collections/${collectionId}/documents/${documentId}`;

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'X-Appwrite-Project': projectId,
          'X-Appwrite-Key': apiKey,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Appwrite API Error:', errorText);
        throw new Error(`Appwrite error: ${response.statusText} - ${errorText}`);
      }

      // DELETE returns empty response, not JSON
      const text = await response.text();
      if (!text) {
        return { success: true };
      }
      try {
        return JSON.parse(text);
      } catch {
        return { success: true };
      }
    },
  };
};

export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
export const BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!;
export const COLLECTIONS = {
  USERS: 'users',
  SIGNUP_OTP_TOKENS: 'signup_otp_tokens',
  USER_SESSIONS: 'user_sessions',
  PRODUCTS: 'products',
  ORDERS: 'orders',
  FARMERS: 'farmers',
};

// Re-export Appwrite utilities for use in routes
export { ID, Query };

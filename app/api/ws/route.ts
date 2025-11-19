import { NextRequest } from 'next/server';
import { registerSSEClient } from '@/lib/sse-broadcast';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const channelId = searchParams.get('channel') || 'global';

    console.log('[SSE] New connection request for channel:', channelId);

    // Create a ReadableStream for Server-Sent Events
    const stream = new ReadableStream<string>({
      start(controller) {
        // Register this client
        const cleanup = registerSSEClient(channelId, controller);

        // Send connection acknowledgment
        try {
          controller.enqueue('data: {"type":"CONNECTION_OPEN","data":{"connected":true}}\n\n');
        } catch (error) {
          console.error('[SSE] Failed to send connection ack:', error);
        }

        // Send heartbeat every 30 seconds to keep connection alive
        const heartbeat = setInterval(() => {
          try {
            controller.enqueue('data: {"type":"HEARTBEAT","data":{}}\n\n');
          } catch (error) {
            console.error('[SSE] Heartbeat failed, closing connection:', error);
            clearInterval(heartbeat);
            cleanup();
          }
        }, 30000);

        // Handle client disconnect
        const abortHandler = () => {
          clearInterval(heartbeat);
          cleanup();
        };
        
        req.signal.addEventListener('abort', abortHandler);
      },
      cancel() {
        console.log(`[SSE] Stream cancelled for channel: ${channelId}`);
      }
    });

    return new Response(stream, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    console.error('[SSE] Error in GET handler:', error);
    return new Response(`data: ${JSON.stringify({ type: 'ERROR', data: { message: error instanceof Error ? error.message : 'Unknown error' } })}\n\n`, {
      status: 500,
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
      },
    });
  }
}

export async function OPTIONS(req: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

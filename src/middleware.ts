import { NextResponse } from 'next/server';

import getOrCreateDB from './models/server/dbSetup';
import getOrCreateStorage from './models/server/storageSetup';

/**
 * Middleware to ensure the database and storage are set up before processing requests.
 * Executes before all requests except for paths excluded by the matcher.
 */
export async function middleware() {
  try {
    console.log('Initializing resources...');

    // Run database and storage setup concurrently
    await Promise.all([getOrCreateDB(), getOrCreateStorage()]);

    console.log('Resources initialized successfully.');
  } catch (error) {
    console.error('Error during resource initialization:', error);

    // Optionally, you can return a response in case of critical errors
    // return new NextResponse('Internal Server Error', { status: 500 });
  }

  // Continue with the next middleware or request handler
  return NextResponse.next();
}

/**
 * Configures the paths the middleware should match.
 * Excludes paths for API routes, static files, and common assets like favicon.
 */
export const config = {
  matcher: [
    // Match all paths except for the ones listed below
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

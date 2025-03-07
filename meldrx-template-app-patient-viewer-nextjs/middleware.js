// import { NextResponse } from "next/server";

// export function middleware(req) {
//     const res = NextResponse.next();
    
//     res.headers.set("Access-Control-Allow-Origin", "*");
//     res.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
//     res.headers.set("Access-Control-Allow-Headers", "Content-Type");

//     return res;
// }

import { NextResponse } from "next/server";

export function middleware(NextRequest) {
    // Handle CORS preflight request (OPTIONS)
    if (NextRequest.method === "OPTIONS") {
        const preflight = new NextResponse(null, { status: 204 });
        preflight.headers.set("Access-Control-Allow-Origin", "*");
        preflight.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        preflight.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
        return preflight;
    }

    // Normal request handling
    const res = NextResponse.next();
    res.headers.set("Access-Control-Allow-Origin", "*");
    res.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

    return res;
}

// Apply middleware to all routes
export const config = {
    matcher: "/:path*",  // Ensures middleware runs on all routes
};

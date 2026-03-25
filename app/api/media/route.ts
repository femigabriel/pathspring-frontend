const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const isAllowedAssetUrl = (targetUrl: URL) => {
  const backendOrigin = new URL(API_BASE_URL).origin;

  return (
    targetUrl.origin === backendOrigin &&
    targetUrl.pathname.startsWith("/generated-content/")
  );
};

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const src = requestUrl.searchParams.get("src");

  if (!src) {
    return new Response("Missing src parameter.", { status: 400 });
  }

  let targetUrl: URL;

  try {
    targetUrl = new URL(src);
  } catch {
    return new Response("Invalid src parameter.", { status: 400 });
  }

  if (!isAllowedAssetUrl(targetUrl)) {
    return new Response("Asset URL is not allowed.", { status: 403 });
  }

  const upstream = await fetch(targetUrl.toString(), {
    cache: "no-store",
  });

  if (!upstream.ok) {
    return new Response("Failed to fetch media asset.", {
      status: upstream.status,
    });
  }

  const headers = new Headers();
  const contentType = upstream.headers.get("content-type");
  const contentLength = upstream.headers.get("content-length");

  if (contentType) {
    headers.set("Content-Type", contentType);
  }

  if (contentLength) {
    headers.set("Content-Length", contentLength);
  }

  headers.set("Cache-Control", "no-store");

  return new Response(await upstream.arrayBuffer(), {
    status: 200,
    headers,
  });
}

import { NextResponse } from "next/server";

// ... existing imports ...

export async function GET(request: Request) {
  try {
    // Validate the request (e.g., check headers, query parameters)
    const url = new URL(request.url);
    const param = url.searchParams.get("param");
    if (!param) {
      return NextResponse.json({ error: "Missing parameter" }, { status: 400 });
    }

    // Use environment variable for the base URL
    const baseUrl = process.env.DATA_STRUCTURE_URL;
    if (!baseUrl) {
      throw new Error("DATA_STRUCTURE_URL environment variable is not defined");
    }

    // Fetch data securely
    const fetchUrl = `${baseUrl}?param=${param}`;
    const response = await fetch(fetchUrl);
    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in GET route:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

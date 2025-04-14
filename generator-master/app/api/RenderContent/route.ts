import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const collection = url.searchParams.get("collection");
    const attribute = url.searchParams.get("attribute");
    const index = url.searchParams.get("index");

    if (!collection || !attribute || !index) {
      return NextResponse.json(
        { error: "Missing parameters" },
        { status: 400 }
      );
    }

    const imageSrc = `${collection}${attribute}/${index}.png`;

    return NextResponse.json(
      { url: imageSrc },
      {
        headers: {
          "Cache-Control": "public, max-age=31536000",
        },
      }
    );
  } catch (error) {
    console.error("Error in RenderContent route:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

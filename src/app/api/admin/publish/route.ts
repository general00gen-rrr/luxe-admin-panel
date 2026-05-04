import { NextRequest, NextResponse } from "next/server";

async function writeJSONToGitHub(filePath: string, content: any[], message: string) {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || "main";

  if (!token || !repo) {
    throw new Error("GITHUB_TOKEN او GITHUB_REPO غير موجود");
  }

  const base64Content = Buffer.from(JSON.stringify(content, null, 2)).toString("base64");

  const getRes = await fetch(
    `https://api.github.com/repos/${repo}/contents/${filePath}`,
    { headers: { Authorization: `Bearer ${token}`, "User-Agent": "luxe-cms" } }
  );
  const current = getRes.ok ? await getRes.json() : null;

  const res = await fetch(
    `https://api.github.com/repos/${repo}/contents/${filePath}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "User-Agent": "luxe-cms",
      },
      body: JSON.stringify({
        message,
        content: base64Content,
        sha: current?.sha,
        branch,
      }),
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "GitHub write failed");
  }
  return res.json();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { products } = body;

    if (!Array.isArray(products)) {
      return NextResponse.json(
        { success: false, error: "products يجب ان يكون array" },
        { status: 400 }
      );
    }

    await writeJSONToGitHub(
      "public/data/products.json",
      products,
      `CMS: Update products — ${new Date().toISOString()}`
    );

    return NextResponse.json({
      success: true,
      message: "تم النشر! Vercel يعيد بناء الموقع خلال 90 ثانية",
      count: products.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "خطأ غير معروف" },
      { status: 500 }
    );
  }
}

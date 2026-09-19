import { revalidatePath } from "next/cache";

// 发文章后主动刷新 ISR 缓存，让新内容立刻生效（不用等 1 小时到期）。
// 只接受本机调用：nginx 不对外暴露这个路径，且需要带 REVALIDATE_TOKEN。
//
//   curl -X POST -H "x-revalidate-token: $TOKEN" http://127.0.0.1:3000/api/revalidate

export async function POST(request: Request) {
  const expected = process.env.REVALIDATE_TOKEN;

  if (!expected) {
    return Response.json(
      { revalidated: false, error: "服务端未配置 REVALIDATE_TOKEN" },
      { status: 500 }
    );
  }

  if (request.headers.get("x-revalidate-token") !== expected) {
    return Response.json({ revalidated: false, error: "forbidden" }, { status: 403 });
  }

  // 第二个参数 "layout" 表示连该 layout 下的所有子路由一起失效，
  // 即首页、文章列表、所有文章详情页一次刷完。
  revalidatePath("/", "layout");
  revalidatePath("/sitemap.xml");

  return Response.json({ revalidated: true, at: new Date().toISOString() });
}

export function GET() {
  return Response.json({ error: "use POST" }, { status: 405 });
}

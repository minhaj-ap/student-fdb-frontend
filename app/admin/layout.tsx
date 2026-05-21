// app/super_admin/layout.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = (await cookies()).get("access_token")?.value;

  if (!token) {
    redirect("/");
  }

  const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}api/me/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Cookie: `access_token=${token}`,
    },
    cache: "no-store",
  });
  if (!res?.ok) {
    redirect("/");
  }

  const data = await res.json().catch(() => null);
  if (!data || data.is_staff !== true) {
    redirect("/");
  }

  return <>{children}</>;
}

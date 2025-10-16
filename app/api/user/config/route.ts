import { NextResponse } from "next/server";
import { getUserConfig } from "@/lib/db/config";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");

  if (!username) {
    return NextResponse.json(
      { error: "Username é obrigatório" },
      { status: 400 }
    );
  }

  try {
    const config = await getUserConfig(username);
    return NextResponse.json(config);
  } catch {
    return NextResponse.json(
      { error: "Erro ao buscar configuração" },
      { status: 500 }
    );
  }
}

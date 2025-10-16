import { NextResponse } from "next/server";
import { getUserProjects } from "@/lib/db/projects";

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
    const projects = await getUserProjects(username);
    return NextResponse.json(projects);
  } catch {
    return NextResponse.json(
      { error: "Erro ao buscar projetos" },
      { status: 500 }
    );
  }
}

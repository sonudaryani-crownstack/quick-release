import { privacyResponse, privacyResponseArray } from "@/Utils";
import { ApiError } from "@/Utils/ApiError";
import { ApiResponse } from "@/Utils/ApiResponse";
import { asyncHandler } from "@/Utils/asyncHandler";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { create } from "domain";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(req: Request, res: Response) {
  return asyncHandler(async () => {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    const userId = session?.user?.id;
    const user = await db.users.findUnique({
      where: {
        cuid: userId,
      },
    })
    if (!userId) {
      throw new ApiError(401, "Unauthorized request");
    }

    const query: { [key: string]: any } = { createdById: user?.id };

    const projects = privacyResponseArray(
      await db.projects.findMany({ 
        where: query,
        select: {
          cuid: true,
          name: true,
          createdAt: true,
          updatedAt: true,
        }
       })
    );
    const totalProjects = await db.projects.count({ where: query });
    return NextResponse.json(
      new ApiResponse(
        200,
        { projects, totalProjects },
        "Projects fetched successfully"
      )
    );
  });
}

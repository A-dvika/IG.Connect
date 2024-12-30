import { answerCollection, db } from "@/models/name";
import { databases, users } from "@/models/server/config";
import { UserPrefs } from "@/store/Auth";
import { NextRequest, NextResponse } from "next/server";
import { ID } from "node-appwrite";

// Define a custom error type
type ApiError = {
    message: string;
    status?: number;
    code?: number;
};

export async function POST(request: NextRequest) {
    try {
        const { questionId, answer, authorId } = await request.json();

        // Create a new answer document
        const response = await databases.createDocument(db, answerCollection, ID.unique(), {
            content: answer,
            authorId,
            questionId,
        });

        // Increase author's reputation
        const prefs = await users.getPrefs<UserPrefs>(authorId);
        await users.updatePrefs(authorId, {
            reputation: Number(prefs.reputation) + 1,
        });

        return NextResponse.json(response, {
            status: 201,
        });
    } catch (error: unknown) {
        // Refine error handling
        if (error instanceof Error) {
            const apiError: ApiError = {
                message: error.message,
                status: 500, // Default status
            };
            return NextResponse.json(
                apiError,
                { status: apiError.status }
            );
        } else {
            return NextResponse.json(
                { message: "Unknown error occurred" },
                { status: 500 }
            );
        }
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { answerId } = await request.json();

        // Fetch the answer document
        const answer = await databases.getDocument(db, answerCollection, answerId);

        // Delete the answer document
        const response = await databases.deleteDocument(db, answerCollection, answerId);

        // Decrease the author's reputation
        const prefs = await users.getPrefs<UserPrefs>(answer.authorId);
        await users.updatePrefs(answer.authorId, {
            reputation: Number(prefs.reputation) - 1,
        });

        return NextResponse.json(
            { data: response },
            { status: 200 }
        );
    } catch (error: unknown) {
        // Refine error handling
        if (error instanceof Error) {
            const apiError: ApiError = {
                message: error.message,
                status: 500, // Default status
            };
            return NextResponse.json(
                apiError,
                { status: apiError.status }
            );
        } else {
            return NextResponse.json(
                { message: "Unknown error occurred" },
                { status: 500 }
            );
        }
    }
}

import { answerCollection, db, questionCollection, voteCollection } from "@/models/name";
import { databases, users } from "@/models/server/config";
import { UserPrefs } from "@/store/Auth";
import { NextRequest, NextResponse } from "next/server";
import { ID, Query } from "node-appwrite";

// Define a custom error type
type ApiError = {
    message: string;
    status?: number;
    code?: number;
};

export async function POST(request: NextRequest) {
    try {
        const { votedById, voteStatus, type, typeId } = await request.json();

        // Fetch existing votes for the user on the specified item
        const existingVotes = await databases.listDocuments(db, voteCollection, [
            Query.equal("type", type),
            Query.equal("typeId", typeId),
            Query.equal("votedById", votedById),
        ]);

        const existingVote = existingVotes.documents[0];

        if (existingVote) {
            // Remove the existing vote
            await databases.deleteDocument(db, voteCollection, existingVote.$id);

            // Adjust reputation for the author based on the previous vote status
            const targetItem = await databases.getDocument(
                db,
                type === "question" ? questionCollection : answerCollection,
                typeId
            );

            const authorPrefs = await users.getPrefs<UserPrefs>(targetItem.authorId);
            const reputationAdjustment = existingVote.voteStatus === "upvoted" ? -1 : 1;

            await users.updatePrefs<UserPrefs>(targetItem.authorId, {
                reputation: Number(authorPrefs.reputation) + reputationAdjustment,
            });
        }

        // Create or update vote if the status has changed
        if (!existingVote || existingVote.voteStatus !== voteStatus) {
            await databases.createDocument(db, voteCollection, ID.unique(), {
                type,
                typeId,
                voteStatus,
                votedById,
            });

            // Adjust reputation for the new vote
            const targetItem = await databases.getDocument(
                db,
                type === "question" ? questionCollection : answerCollection,
                typeId
            );

            const authorPrefs = await users.getPrefs<UserPrefs>(targetItem.authorId);
            const reputationAdjustment = voteStatus === "upvoted" ? 1 : -1;

            await users.updatePrefs<UserPrefs>(targetItem.authorId, {
                reputation: Number(authorPrefs.reputation) + reputationAdjustment,
            });
        }

        // Calculate the updated vote totals
        const [upvotes, downvotes] = await Promise.all([ 
            databases.listDocuments(db, voteCollection, [
                Query.equal("type", type),
                Query.equal("typeId", typeId),
                Query.equal("voteStatus", "upvoted"),
            ]), 
            databases.listDocuments(db, voteCollection, [
                Query.equal("type", type),
                Query.equal("typeId", typeId),
                Query.equal("voteStatus", "downvoted"),
            ])
        ]);

        const voteResult = upvotes.total - downvotes.total;
        const message = existingVote ? (existingVote.voteStatus !== voteStatus ? "Vote Status Updated" : "Vote Withdrawn") : "Voted";

        return NextResponse.json(
            {
                data: { voteResult },
                message,
            },
            { status: existingVote ? 200 : 201 }
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

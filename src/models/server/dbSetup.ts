import { db } from "../name";
import createAnswerCollection from "./answer.collection";
import createCommentCollection from "./comments.collection";
import createQuestionCollection from "./question.collection";
import createVoteCollection from "./vote.collection";

import { databases } from "./config";

export default async function getOrCreateDB() {
  try {
    console.log("Checking if database exists...");
    await databases.get(db);
    console.log(`Database '${db}' connection established successfully.`);
  } catch (error) {
    console.warn(`Database '${db}' not found. Attempting to create...`);
    try {
      await databases.create(db, db);
      console.log(`Database '${db}' created successfully.`);

      console.log("Creating collections...");
      await Promise.all([
        createQuestionCollection(),
        createAnswerCollection(),
        createCommentCollection(),
        createVoteCollection(),
      ]);
      console.log("All collections created successfully.");
      console.log(`Database '${db}' is now ready for use.`);
    } catch (creationError) {
      if (creationError instanceof Error) {
        console.error(
          "Error creating database or collections:",
          creationError.message
        );
      } else {
        console.error(
          "Unexpected error while creating database or collections:",
          creationError
        );
      }
    }
  }

  return databases;
}

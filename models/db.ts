import { CourseSchema, SemesterSchema, AiInsightSchema } from "./realmSchemas";
import Realm from "realm";

let realm: Realm | null = null;

const realmConfig = {
  schema: [SemesterSchema, CourseSchema, AiInsightSchema],
  schemaVersion: 8,
  // deleteRealmIfMigrationNeeded: true, // ⚠️ this clears old data
};

export const openRealm = async () => {
  if (!realm) {
    realm = await Realm.open(realmConfig);
  }
  // console.log("Realm file path:", realm.path);
  return realm;
};

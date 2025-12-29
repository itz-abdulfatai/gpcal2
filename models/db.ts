import { CourseSchema, SemesterSchema, AiInsightSchema } from "./realmSchemas";
import Realm from "realm";

let realm: Realm | null = null;
let opening: Promise<Realm> | null = null;

const realmConfig = {
  schema: [SemesterSchema, CourseSchema, AiInsightSchema],
  schemaVersion: 9,
  // deleteRealmIfMigrationNeeded: true, // ⚠️ this clears old data
};

export const openRealm = async () => {
  if (realm) return realm;

  if (!opening) {
    opening = Realm.open(realmConfig).then((r) => {
      realm = r;
      opening = null;
      return r;
    });
  }

  return opening;
};
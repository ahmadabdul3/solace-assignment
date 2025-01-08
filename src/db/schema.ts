import { sql, SQL } from "drizzle-orm";
import {
    pgTable,
    integer,
    text,
    jsonb,
    timestamp,
    bigint,
    uuid,
    AnyPgColumn
} from "drizzle-orm/pg-core";

export const advocates = pgTable("advocates", {
    id: uuid("id").defaultRandom().primaryKey(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    city: text("city").notNull(),
    degree: text("degree").notNull(),
    specialties: jsonb("payload").default([]).notNull(),
    yearsOfExperience: integer("years_of_experience").notNull(),
    phoneNumber: bigint("phone_number", { mode: "number" }).notNull(),
    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// custom lower function
export function lower(col: AnyPgColumn): SQL {
    return sql`(lower(${col}))`;
}

import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const checkIns = pgTable("check_ins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  // Lead guest details
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  phoneCountryCode: text("phone_country_code").notNull(),
  dateOfBirth: text("date_of_birth").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  postalCode: text("postal_code").notNull(),
  country: text("country").notNull(),
  
  // Arrival & departure
  arrivalDate: text("arrival_date").notNull(),
  arrivalTime: text("arrival_time").notNull(),
  travelingBy: text("traveling_by").notNull(),
  arrivalNotes: text("arrival_notes"),
  departureDate: text("departure_date").notNull(),
  departureTime: text("departure_time").notNull(),
  
  // Guests (JSON array)
  guests: json("guests").$type<Array<{
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
  }>>().notNull(),
  
  // Identity document
  identityDocumentPath: text("identity_document_path"),
  
  // Signature
  signatureData: text("signature_data"),
  termsAccepted: text("terms_accepted").notNull(),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCheckInSchema = createInsertSchema(checkIns).omit({
  id: true,
  createdAt: true,
});

export type InsertCheckIn = z.infer<typeof insertCheckInSchema>;
export type CheckIn = typeof checkIns.$inferSelect;

// Country codes for phone numbers
export const countryCodes = [
  { code: "+1", country: "US", flag: "🇺🇸", name: "United States" },
  { code: "+44", country: "GB", flag: "🇬🇧", name: "United Kingdom" },
  { code: "+33", country: "FR", flag: "🇫🇷", name: "France" },
  { code: "+49", country: "DE", flag: "🇩🇪", name: "Germany" },
  { code: "+61", country: "AU", flag: "🇦🇺", name: "Australia" },
  { code: "+81", country: "JP", flag: "🇯🇵", name: "Japan" },
  { code: "+86", country: "CN", flag: "🇨🇳", name: "China" },
  { code: "+91", country: "IN", flag: "🇮🇳", name: "India" },
  { code: "+55", country: "BR", flag: "🇧🇷", name: "Brazil" },
  { code: "+7", country: "RU", flag: "🇷🇺", name: "Russia" },
] as const;

export const countries = [
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "FR", name: "France" },
  { code: "DE", name: "Germany" },
  { code: "JP", name: "Japan" },
  { code: "CN", name: "China" },
  { code: "IN", name: "India" },
  { code: "BR", name: "Brazil" },
] as const;

export const transportationMethods = [
  { value: "car", label: "Car" },
  { value: "taxi", label: "Taxi/Rideshare" },
  { value: "public-transport", label: "Public Transportation" },
  { value: "walking", label: "Walking" },
  { value: "other", label: "Other" },
] as const;

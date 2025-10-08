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
  country: text("country").notNull(),
  
  // Arrival & departure
  arrivalDate: text("arrival_date").notNull(),
  arrivalTime: text("arrival_time").notNull(),
  arrivalNotes: text("arrival_notes"),
  departureDate: text("departure_date").notNull(),
  departureTime: text("departure_time").notNull(),
  
  // Guests (JSON array)
  guests: json("guests").$type<Array<{
    firstName: string;
    lastName: string;
    age: number;
  }>>(),
  
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
  { code: "+54", country: "AR", flag: "🇦🇷", name: "Argentina" },
  { code: "+61", country: "AU", flag: "🇦🇺", name: "Australia" },
  { code: "+43", country: "AT", flag: "🇦🇹", name: "Austria" },
  { code: "+880", country: "BD", flag: "🇧🇩", name: "Bangladesh" },
  { code: "+32", country: "BE", flag: "🇧🇪", name: "Belgium" },
  { code: "+55", country: "BR", flag: "🇧🇷", name: "Brazil" },
  { code: "+1", country: "CA", flag: "🇨🇦", name: "Canada" },
  { code: "+56", country: "CL", flag: "🇨🇱", name: "Chile" },
  { code: "+86", country: "CN", flag: "🇨🇳", name: "China" },
  { code: "+57", country: "CO", flag: "🇨🇴", name: "Colombia" },
  { code: "+420", country: "CZ", flag: "🇨🇿", name: "Czech Republic" },
  { code: "+45", country: "DK", flag: "🇩🇰", name: "Denmark" },
  { code: "+593", country: "EC", flag: "🇪🇨", name: "Ecuador" },
  { code: "+20", country: "EG", flag: "🇪🇬", name: "Egypt" },
  { code: "+358", country: "FI", flag: "🇫🇮", name: "Finland" },
  { code: "+33", country: "FR", flag: "🇫🇷", name: "France" },
  { code: "+49", country: "DE", flag: "🇩🇪", name: "Germany" },
  { code: "+30", country: "GR", flag: "🇬🇷", name: "Greece" },
  { code: "+852", country: "HK", flag: "🇭🇰", name: "Hong Kong" },
  { code: "+36", country: "HU", flag: "🇭🇺", name: "Hungary" },
  { code: "+91", country: "IN", flag: "🇮🇳", name: "India" },
  { code: "+62", country: "ID", flag: "🇮🇩", name: "Indonesia" },
  { code: "+972", country: "IL", flag: "🇮🇱", name: "Israel" },
  { code: "+39", country: "IT", flag: "🇮🇹", name: "Italy" },
  { code: "+81", country: "JP", flag: "🇯🇵", name: "Japan" },
  { code: "+254", country: "KE", flag: "🇰🇪", name: "Kenya" },
  { code: "+60", country: "MY", flag: "🇲🇾", name: "Malaysia" },
  { code: "+52", country: "MX", flag: "🇲🇽", name: "Mexico" },
  { code: "+212", country: "MA", flag: "🇲🇦", name: "Morocco" },
  { code: "+31", country: "NL", flag: "🇳🇱", name: "Netherlands" },
  { code: "+64", country: "NZ", flag: "🇳🇿", name: "New Zealand" },
  { code: "+234", country: "NG", flag: "🇳🇬", name: "Nigeria" },
  { code: "+47", country: "NO", flag: "🇳🇴", name: "Norway" },
  { code: "+92", country: "PK", flag: "🇵🇰", name: "Pakistan" },
  { code: "+51", country: "PE", flag: "🇵🇪", name: "Peru" },
  { code: "+63", country: "PH", flag: "🇵🇭", name: "Philippines" },
  { code: "+48", country: "PL", flag: "🇵🇱", name: "Poland" },
  { code: "+351", country: "PT", flag: "🇵🇹", name: "Portugal" },
  { code: "+7", country: "RU", flag: "🇷🇺", name: "Russia" },
  { code: "+966", country: "SA", flag: "🇸🇦", name: "Saudi Arabia" },
  { code: "+65", country: "SG", flag: "🇸🇬", name: "Singapore" },
  { code: "+27", country: "ZA", flag: "🇿🇦", name: "South Africa" },
  { code: "+82", country: "KR", flag: "🇰🇷", name: "South Korea" },
  { code: "+34", country: "ES", flag: "🇪🇸", name: "Spain" },
  { code: "+94", country: "LK", flag: "🇱🇰", name: "Sri Lanka" },
  { code: "+46", country: "SE", flag: "🇸🇪", name: "Sweden" },
  { code: "+41", country: "CH", flag: "🇨🇭", name: "Switzerland" },
  { code: "+66", country: "TH", flag: "🇹🇭", name: "Thailand" },
  { code: "+90", country: "TR", flag: "🇹🇷", name: "Turkey" },
  { code: "+380", country: "UA", flag: "🇺🇦", name: "Ukraine" },
  { code: "+971", country: "AE", flag: "🇦🇪", name: "United Arab Emirates" },
  { code: "+44", country: "GB", flag: "🇬🇧", name: "United Kingdom" },
  { code: "+1", country: "US", flag: "🇺🇸", name: "United States" },
  { code: "+58", country: "VE", flag: "🇻🇪", name: "Venezuela" },
  { code: "+84", country: "VN", flag: "🇻🇳", name: "Vietnam" },
] as const;

export const countries = [
  { code: "AR", name: "Argentina" },
  { code: "AU", name: "Australia" },
  { code: "AT", name: "Austria" },
  { code: "BD", name: "Bangladesh" },
  { code: "BE", name: "Belgium" },
  { code: "BR", name: "Brazil" },
  { code: "CA", name: "Canada" },
  { code: "CL", name: "Chile" },
  { code: "CN", name: "China" },
  { code: "CO", name: "Colombia" },
  { code: "CZ", name: "Czech Republic" },
  { code: "DK", name: "Denmark" },
  { code: "EC", name: "Ecuador" },
  { code: "EG", name: "Egypt" },
  { code: "FI", name: "Finland" },
  { code: "FR", name: "France" },
  { code: "DE", name: "Germany" },
  { code: "GR", name: "Greece" },
  { code: "HK", name: "Hong Kong" },
  { code: "HU", name: "Hungary" },
  { code: "IN", name: "India" },
  { code: "ID", name: "Indonesia" },
  { code: "IE", name: "Ireland" },
  { code: "IL", name: "Israel" },
  { code: "IT", name: "Italy" },
  { code: "JP", name: "Japan" },
  { code: "KE", name: "Kenya" },
  { code: "LU", name: "Luxembourg" },
  { code: "MY", name: "Malaysia" },
  { code: "MX", name: "Mexico" },
  { code: "MA", name: "Morocco" },
  { code: "NL", name: "Netherlands" },
  { code: "NZ", name: "New Zealand" },
  { code: "NG", name: "Nigeria" },
  { code: "NO", name: "Norway" },
  { code: "PK", name: "Pakistan" },
  { code: "PE", name: "Peru" },
  { code: "PH", name: "Philippines" },
  { code: "PL", name: "Poland" },
  { code: "PT", name: "Portugal" },
  { code: "RU", name: "Russia" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "SG", name: "Singapore" },
  { code: "ZA", name: "South Africa" },
  { code: "KR", name: "South Korea" },
  { code: "ES", name: "Spain" },
  { code: "LK", name: "Sri Lanka" },
  { code: "SE", name: "Sweden" },
  { code: "CH", name: "Switzerland" },
  { code: "TH", name: "Thailand" },
  { code: "TR", name: "Turkey" },
  { code: "UA", name: "Ukraine" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "GB", name: "United Kingdom" },
  { code: "US", name: "United States" },
  { code: "VE", name: "Venezuela" },
  { code: "VN", name: "Vietnam" },
] as const;

export const transportationMethods = [
  { value: "car", label: "Car" },
  { value: "taxi", label: "Taxi/Rideshare" },
  { value: "public-transport", label: "Public Transportation" },
  { value: "walking", label: "Walking" },
  { value: "other", label: "Other" },
] as const;

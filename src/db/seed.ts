import * as dotenv from "dotenv";
// See src/db/migrate.ts for why this is needed for standalone tsx scripts.
dotenv.config({ path: ".env.local" });

import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import bcrypt from "bcryptjs";
import path from "path";
import * as schema from "./schema";

const url =
  process.env.DATABASE_URL ||
  `file:${path.join(process.cwd(), "data", "teambrz.db")}`;

const client = createClient({
  url,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});
const db = drizzle(client, { schema });

function id() {
  return crypto.randomUUID();
}

function daysFromNow(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

async function main() {
  console.log("Seeding Team Brz demo data...");

  const passwordHash = await bcrypt.hash("password123", 10);

  // ---------- Users ----------
  const admin = {
    id: id(),
    name: "Rafiq Ahmed",
    email: "admin@teambrz.com",
    passwordHash,
    phone: "+880 1711-000001",
    bikeModel: "Yamaha R15M",
    bio: "Founder of Team Brz. Been riding since 2012, started this club so Dhaka riders had a real home.",
    city: "Dhaka",
    role: "ADMIN" as const,
    approved: true,
    verified: true,
    emailVerified: true,
    joinedAt: daysFromNow(-720),
  };

  const members = [
    {
      id: id(),
      name: "Nusrat Jahan",
      email: "nusrat@teambrz.com",
      passwordHash,
      phone: "+880 1711-000002",
      bikeModel: "Suzuki Gixxer SF 155",
      bio: "Weekend tourer, coffee addict. Leads most of our Sylhet runs.",
      city: "Dhaka",
      role: "MEMBER" as const,
      approved: true,
      verified: true,
      emailVerified: true,
      joinedAt: daysFromNow(-540),
    },
    {
      id: id(),
      name: "Tanvir Hasan",
      email: "tanvir@teambrz.com",
      passwordHash,
      phone: "+880 1711-000003",
      bikeModel: "TVS Apache RTR 160 4V",
      bio: "New to touring, here for the long rides and the community.",
      city: "Narayanganj",
      role: "MEMBER" as const,
      approved: true,
      verified: true,
      emailVerified: true,
      joinedAt: daysFromNow(-300),
    },
    {
      id: id(),
      name: "Farhan Kabir",
      email: "farhan@teambrz.com",
      passwordHash,
      phone: "+880 1711-000004",
      bikeModel: "Yamaha MT15 V2",
      bio: "Photographer on two wheels — I usually bring the drone.",
      city: "Gazipur",
      role: "MEMBER" as const,
      approved: true,
      verified: false,
      emailVerified: true,
      joinedAt: daysFromNow(-120),
    },
    {
      id: id(),
      name: "Sadia Islam",
      email: "sadia@teambrz.com",
      passwordHash,
      phone: "+880 1711-000005",
      bikeModel: "Honda CB Hornet 160R",
      bio: null,
      city: "Dhaka",
      role: "MEMBER" as const,
      approved: true,
      verified: false,
      emailVerified: true,
      joinedAt: daysFromNow(-45),
    },
    {
      id: id(),
      name: "Imran Chowdhury",
      email: "imran@teambrz.com",
      passwordHash,
      phone: "+880 1711-000006",
      bikeModel: "Bajaj Pulsar NS200",
      bio: null,
      city: "Chattogram",
      role: "MEMBER" as const,
      approved: false, // pending approval, to demo the admin queue
      verified: false,
      emailVerified: true, // still lets them log in — "approved" gates the club, not the login itself
      joinedAt: daysFromNow(-2),
    },
  ];

  // Second admin-tier account (identical permissions to ADMIN) and a
  // Moderator (approve members + remove listings only) —
  // see src/lib/require-admin.ts for exactly what each role can do.
  const coAdmin = {
    id: id(),
    name: "Mahdi Rahman",
    email: "coadmin@teambrz.com",
    passwordHash,
    phone: "+880 1711-000007",
    bikeModel: "Kawasaki Ninja 250",
    bio: "Co-runs the club with Rafiq — handles logistics for the bigger tours.",
    city: "Dhaka",
    role: "CO_ADMIN" as const,
    approved: true,
    verified: true,
    emailVerified: true,
    joinedAt: daysFromNow(-600),
  };

  const moderator = {
    id: id(),
    name: "Priya Das",
    email: "moderator@teambrz.com",
    passwordHash,
    phone: "+880 1711-000008",
    bikeModel: "Yamaha FZS-Fi",
    bio: "Keeps the member queue and marketplace tidy.",
    city: "Dhaka",
    role: "MODERATOR" as const,
    approved: true,
    verified: true,
    emailVerified: true,
    joinedAt: daysFromNow(-200),
  };

  await db
    .insert(schema.users)
    .values([admin, coAdmin, moderator, ...members]);
  console.log(`Created ${3 + members.length} users`);

  const [nusrat, tanvir, farhan, sadia] = members;

  // ---------- Medals ----------
  const medalDefs = [
    { id: id(), name: "Founder", icon: "👑", color: "#ffb703", description: "Founded Team Brz" },
    { id: id(), name: "Host", icon: "🎪", color: "#f5251f", description: "Hosted a club event" },
    { id: id(), name: "Leader", icon: "🧭", color: "#3b82f6", description: "Led a tour group" },
    { id: id(), name: "100 Rides", icon: "🏁", color: "#22c55e", description: "Completed 100 club rides" },
    { id: id(), name: "Road Guardian", icon: "🛡️", color: "#a855f7", description: "Helped a fellow rider in need" },
  ];
  await db.insert(schema.medals).values(medalDefs);
  const [founder, host, leader, hundredRides, guardian] = medalDefs;

  await db.insert(schema.userMedals).values([
    { userId: admin.id, medalId: founder.id, awardedById: admin.id },
    { userId: admin.id, medalId: leader.id, awardedById: admin.id },
    { userId: nusrat.id, medalId: leader.id, awardedById: admin.id, note: "Led the Sylhet tea garden tour" },
    { userId: nusrat.id, medalId: host.id, awardedById: admin.id },
    { userId: tanvir.id, medalId: hundredRides.id, awardedById: admin.id },
    { userId: farhan.id, medalId: guardian.id, awardedById: admin.id, note: "Helped a stranded rider on the highway" },
  ]);
  console.log("Created medals and awards");

  // ---------- Marketplace listings ----------
  await db.insert(schema.listings).values([
    {
      id: id(),
      sellerId: tanvir.id,
      type: "BIKE",
      category: "Naked",
      title: "2021 TVS Apache RTR 160 4V — Single Owner",
      description:
        "Well maintained, all services done at authorized center. New chain sprocket set installed last month. Selling because I'm upgrading to a bigger bike. Papers clear, tax token updated.",
      price: 185000,
      condition: "GOOD",
      images: "[]",
      location: "Narayanganj",
      status: "ACTIVE",
    },
    {
      id: id(),
      sellerId: nusrat.id,
      type: "ACCESSORY",
      category: "Helmet",
      title: "LS2 FF320 Full Face Helmet (M size)",
      description:
        "Used for about 6 months, no accidents, no cracks. Comes with the original bag. Selling because I upgraded to a modular helmet.",
      price: 4500,
      condition: "LIKE_NEW",
      images: "[]",
      location: "Dhaka",
      status: "ACTIVE",
    },
    {
      id: id(),
      sellerId: admin.id,
      type: "ACCESSORY",
      category: "Engine Oil",
      title: "Motul 5100 10W40 (2x1L, sealed)",
      description:
        "Bought extra during a group order, have two sealed 1L bottles I don't need. Genuine, sealed, receipt available.",
      price: 1400,
      condition: "NEW",
      images: "[]",
      location: "Dhaka",
      status: "ACTIVE",
    },
    {
      id: id(),
      sellerId: farhan.id,
      type: "ACCESSORY",
      category: "Riding Jacket",
      title: "Mesh Riding Jacket with Armor (L)",
      description:
        "Summer mesh jacket, CE-rated shoulder and elbow armor included. Great for Dhaka heat. Barely used.",
      price: 3200,
      condition: "LIKE_NEW",
      images: "[]",
      location: "Gazipur",
      status: "ACTIVE",
    },
    {
      id: id(),
      sellerId: sadia.id,
      type: "BIKE",
      category: "Commuter",
      title: "2019 Honda CB Hornet 160R",
      description:
        "Daily driven, minor scratches on the tank from parking. Engine in great condition, recently serviced. Reasonable price for a quick sale.",
      price: 140000,
      condition: "FAIR",
      images: "[]",
      location: "Dhaka",
      status: "SOLD",
    },
  ]);
  console.log("Created marketplace listings");

  console.log("\nSeed complete!");
  console.log("Admin login: admin@teambrz.com / password123");
  console.log("Co-admin login: coadmin@teambrz.com / password123");
  console.log("Moderator login: moderator@teambrz.com / password123");
  console.log("Member login (approved): nusrat@teambrz.com / password123");
  console.log("Member login (pending approval): imran@teambrz.com / password123");

  client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

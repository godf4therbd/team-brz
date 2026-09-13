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
      joinedAt: daysFromNow(-2),
    },
  ];

  await db.insert(schema.users).values([admin, ...members]);
  console.log(`Created ${1 + members.length} users`);

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

  // ---------- Events ----------
  const eventDefs = [
    {
      id: id(),
      slug: "sylhet-tea-garden-tour",
      title: "Sylhet Tea Garden Tour",
      description:
        "Our flagship 2-day tour through Sylhet's tea gardens. We ride out early Friday, stop for breakfast in Bhairab, and reach Srimangal by afternoon. Overnight stay arranged at a resort — details in the WhatsApp group. Bring rain gear, it's monsoon season.",
      type: "TOUR" as const,
      location: "Srimangal, Sylhet",
      startDate: daysFromNow(21),
      endDate: daysFromNow(22),
      capacity: 25,
      status: "PUBLISHED" as const,
      createdById: admin.id,
    },
    {
      id: id(),
      slug: "dhaka-night-meetup-october",
      title: "Dhaka Night Meetup",
      description:
        "Monthly casual meetup at our usual spot — Hatirjheel lakeside. Come hang out, show off any new gear, and plan the next tour over cha and fuchka.",
      type: "MEETUP" as const,
      location: "Hatirjheel, Dhaka",
      startDate: daysFromNow(7),
      endDate: null,
      capacity: null,
      status: "PUBLISHED" as const,
      createdById: nusrat.id,
    },
    {
      id: id(),
      slug: "basic-bike-maintenance-workshop",
      title: "Basic Bike Maintenance Workshop",
      description:
        "Hands-on workshop covering chain lube, tyre pressure checks, oil changes, and pre-ride inspection. Great for new riders. We'll have a mechanic from our partner garage running the session.",
      type: "WORKSHOP" as const,
      location: "Team Brz Garage, Banani, Dhaka",
      startDate: daysFromNow(14),
      endDate: null,
      capacity: 15,
      status: "PUBLISHED" as const,
      createdById: admin.id,
    },
    {
      id: id(),
      slug: "flood-relief-supply-ride",
      title: "Flood Relief Supply Ride",
      description:
        "We're organizing a charity ride to deliver dry food and medicine to flood-affected families near Sunamganj. Every rider who can carry supplies is welcome — panniers and top boxes especially useful.",
      type: "CHARITY" as const,
      location: "Sunamganj",
      startDate: daysFromNow(35),
      endDate: null,
      capacity: null,
      status: "PUBLISHED" as const,
      createdById: admin.id,
    },
    {
      id: id(),
      slug: "cox-bazar-coastal-run",
      title: "Cox's Bazar Coastal Run",
      description:
        "Our biggest tour of the year — three days along the coastal highway ending at the world's longest sea beach. Unforgettable ride, unforgettable sunsets.",
      type: "TOUR" as const,
      location: "Cox's Bazar",
      startDate: daysFromNow(-45),
      endDate: daysFromNow(-42),
      capacity: 30,
      status: "PUBLISHED" as const,
      createdById: admin.id,
    },
    {
      id: id(),
      slug: "monsoon-ride-safety-briefing",
      title: "Monsoon Ride Safety Briefing",
      description:
        "A pre-monsoon safety session covering wet-road braking, visibility gear, and route planning around flood-prone areas.",
      type: "WORKSHOP" as const,
      location: "Team Brz Garage, Banani, Dhaka",
      startDate: daysFromNow(-90),
      endDate: null,
      capacity: 20,
      status: "PUBLISHED" as const,
      createdById: admin.id,
    },
  ];
  await db.insert(schema.events).values(eventDefs);
  console.log(`Created ${eventDefs.length} events`);

  const [sylhet, meetup, workshop, , coxsbazar, safety] = eventDefs;

  await db.insert(schema.eventRegistrations).values([
    { id: id(), eventId: sylhet.id, userId: nusrat.id, status: "CONFIRMED" },
    { id: id(), eventId: sylhet.id, userId: tanvir.id, status: "CONFIRMED" },
    { id: id(), eventId: sylhet.id, userId: farhan.id, status: "CONFIRMED" },
    { id: id(), eventId: meetup.id, userId: nusrat.id, status: "CONFIRMED" },
    { id: id(), eventId: meetup.id, userId: sadia.id, status: "CONFIRMED" },
    { id: id(), eventId: workshop.id, userId: tanvir.id, status: "CONFIRMED" },
    { id: id(), eventId: coxsbazar.id, userId: nusrat.id, status: "CONFIRMED" },
    { id: id(), eventId: coxsbazar.id, userId: tanvir.id, status: "CONFIRMED" },
    { id: id(), eventId: coxsbazar.id, userId: farhan.id, status: "CONFIRMED" },
    { id: id(), eventId: coxsbazar.id, userId: admin.id, status: "CONFIRMED" },
    { id: id(), eventId: safety.id, userId: sadia.id, status: "CONFIRMED" },
  ]);
  console.log("Created event registrations");

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
  console.log("Member login (approved): nusrat@teambrz.com / password123");
  console.log("Member login (pending approval): imran@teambrz.com / password123");

  client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

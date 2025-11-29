import { PrismaClient } from "@prisma/client";
import { doctors } from "../lib/types/doctor";
import { allServices } from "../lib/types/services-data";

const prisma = new PrismaClient();

// Enhanced dentist data with full profiles
const dentistProfiles = [
  {
    ...doctors[0],
    email: "Kath.estrada@dentalucare.com",
    phone: "+63 912 345 6789",
    qualifications: "Doctor of Dental Medicine (DMD), Orthodontics Specialist",
    experience: 8,
  },
  {
    ...doctors[1],
    email: "Jewel.mendano@dentalucare.com",
    phone: "+63 912 345 6790",
    qualifications:
      "Doctor of Dental Surgery (DDS), Cosmetic Dentistry Specialist",
    experience: 6,
  },
  {
    ...doctors[2],
    email: "Jedd.offianga@dentalucare.com",
    phone: "+63 912 345 6791",
    qualifications: "Doctor of Dental Medicine (DMD), Oral Surgery Specialist",
    experience: 10,
  },
  {
    ...doctors[3],
    email: "Marthaliza.herher@dentalucare.com",
    phone: "+63 912 345 6792",
    qualifications: "Doctor of Dental Surgery (DDS), Periodontics Specialist",
    experience: 7,
  },
];

async function main() {
  console.log("🌱 Starting database seeding...");

  // Clear existing data (optional - comment out if you want to keep existing data)
  console.log("🗑️  Cleaning existing data...");
  await prisma.service.deleteMany({});
  await prisma.user.deleteMany({
    where: {
      role: "dentist",
    },
  });

  // Seed Dentists
  console.log("👨‍⚕️  Seeding dentists...");
  const createdDentists = [];
  const password = "dentalucaredentist@123"; // Plain text password (better-auth will hash it)

  for (const doctor of dentistProfiles) {
    const dentist = await prisma.user.create({
      data: {
        id: doctor.id,
        name: doctor.name,
        email: doctor.email,
        emailVerified: true,
        role: "dentist",
        image: doctor.avatar,
        specialization: doctor.role,
        isAvailable: true,
        phone: doctor.phone,
        qualifications: doctor.qualifications,
        experience: doctor.experience,
        workingHours: {
          monday: { start: "09:00", end: "17:00" },
          tuesday: { start: "09:00", end: "17:00" },
          wednesday: { start: "09:00", end: "17:00" },
          thursday: { start: "09:00", end: "17:00" },
          friday: { start: "09:00", end: "17:00" },
          saturday: { start: "09:00", end: "13:00" },
          sunday: { closed: true },
        },
      },
    });

    // Create account with password for the dentist (better-auth uses "credential" as providerId)
    await prisma.account.create({
      data: {
        id: `${dentist.id}:credential`,
        userId: dentist.id,
        accountId: `${dentist.id}:credential`,
        providerId: "credential",
        password: password,
      },
    });

    createdDentists.push(dentist);
    console.log(
      `  ✓ Created dentist: ${dentist.name} (${dentist.specialization}) - email: ${doctor.email}`
    );
    console.log(`     Password: dentalucaredentist@123`);
  }

  // Seed Services
  console.log("🦷  Seeding services...");
  const createdServices = [];

  for (const service of allServices) {
    const createdService = await prisma.service.create({
      data: {
        id: service.id, // Use the ID from the service data
        name: service.name,
        description: service.description || service.name,
        duration: service.duration,
        price: service.price, // Keep price as string (e.g., "₱1,500 – ₱3,000")
        category: service.category,
        isActive: service.isActive,
      },
    });
    createdServices.push(createdService);
    console.log(
      `  ✓ Created service: ${createdService.name} (${createdService.price})`
    );
  }

  console.log("\n✅ Seeding completed successfully!");
  console.log(`📊 Summary:`);
  console.log(`   - Dentists created: ${createdDentists.length}`);
  console.log(`   - Services created: ${createdServices.length}`);
  console.log("\n👨‍⚕️  Dentists:");
  createdDentists.forEach((dentist) => {
    console.log(`   - ${dentist.name} (${dentist.specialization})`);
  });
  console.log("\n🦷  Service Categories:");
  const categoryCounts = createdServices.reduce(
    (acc: Record<string, number>, service) => {
      acc[service.category] = (acc[service.category] || 0) + 1;
      return acc;
    },
    {}
  );
  Object.entries(categoryCounts).forEach(([category, count]) => {
    console.log(`   - ${category}: ${count} services`);
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Error during seeding:", e);
    await prisma.$disconnect();
    process.exit(1);
  });

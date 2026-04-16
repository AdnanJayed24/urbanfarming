require("dotenv").config();

const bcrypt = require("bcryptjs");
const { PrismaClient, Role, CertificationStatus, ProduceCategory, RentalAvailability } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Password123!", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@urbanfarming.local" },
    update: {},
    create: {
      name: "Platform Admin",
      email: "admin@urbanfarming.local",
      password: passwordHash,
      role: Role.ADMIN
    }
  });

  const customer = await prisma.user.upsert({
    where: { email: "customer@urbanfarming.local" },
    update: {},
    create: {
      name: "City Gardener",
      email: "customer@urbanfarming.local",
      password: passwordHash,
      role: Role.CUSTOMER
    }
  });

  const vendorUser = await prisma.user.upsert({
    where: { email: "vendor@urbanfarming.local" },
    update: {},
    create: {
      name: "Rooftop Farmer",
      email: "vendor@urbanfarming.local",
      password: passwordHash,
      role: Role.VENDOR
    }
  });

  const vendorProfile = await prisma.vendorProfile.upsert({
    where: { userId: vendorUser.id },
    update: {},
    create: {
      userId: vendorUser.id,
      farmName: "Skyline Greens",
      farmLocation: "Downtown Rooftop District",
      certificationStatus: CertificationStatus.APPROVED,
      isApproved: true
    }
  });

  const existingCertification = await prisma.sustainabilityCert.findFirst({
    where: {
      vendorId: vendorProfile.id,
      certifyingAgency: "Urban Organic Council"
    }
  });

  if (!existingCertification) {
    await prisma.sustainabilityCert.create({
      data: {
        vendorId: vendorProfile.id,
        certifyingAgency: "Urban Organic Council",
        certificationDate: new Date("2026-01-15T00:00:00.000Z"),
        certificationStatus: CertificationStatus.APPROVED,
        notes: "Seeded certification record for demo usage."
      }
    });
  }

  const produceSeedData = [
    {
      vendorId: vendorProfile.id,
      name: "Organic Basil Bundle",
      description: "Fresh rooftop-grown basil harvested within 24 hours.",
      price: 6.5,
      category: ProduceCategory.ORGANIC_PRODUCE,
      certificationStatus: CertificationStatus.APPROVED,
      availableQuantity: 40,
      isApproved: true
    },
    {
      vendorId: vendorProfile.id,
      name: "Heritage Tomato Seeds",
      description: "High-germination seeds suited for balcony gardens.",
      price: 4.25,
      category: ProduceCategory.SEEDS,
      certificationStatus: CertificationStatus.APPROVED,
      availableQuantity: 120,
      isApproved: true
    }
  ];

  for (const item of produceSeedData) {
    const existingProduce = await prisma.produce.findFirst({
      where: {
        vendorId: vendorProfile.id,
        name: item.name
      }
    });

    if (!existingProduce) {
      await prisma.produce.create({ data: item });
    }
  }

  const existingRentalSpace = await prisma.rentalSpace.findFirst({
    where: {
      vendorId: vendorProfile.id,
      location: "Block A Rooftop Bay 3"
    }
  });

  if (!existingRentalSpace) {
    await prisma.rentalSpace.create({
      data: {
        vendorId: vendorProfile.id,
        location: "Block A Rooftop Bay 3",
        size: "2m x 2m",
        price: 75,
        availability: RentalAvailability.AVAILABLE
      }
    });
  }

  const communityPosts = [
    {
      userId: customer.id,
      postContent: "What compost mix works best for leafy greens in containers?"
    },
    {
      userId: vendorUser.id,
      postContent: "Tip: Use drip irrigation timers to keep rooftop beds consistent during hot weeks."
    }
  ];

  for (const post of communityPosts) {
    const existingPost = await prisma.communityPost.findFirst({
      where: {
        userId: post.userId,
        postContent: post.postContent
      }
    });

    if (!existingPost) {
      await prisma.communityPost.create({ data: post });
    }
  }

  console.log("Seed completed with admin, vendor, customer, produce, and community starter data.");
  console.log({
    adminEmail: admin.email,
    vendorEmail: vendorUser.email,
    customerEmail: customer.email,
    password: "Password123!"
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

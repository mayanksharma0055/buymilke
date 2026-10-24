import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const cars = [
  {
    slug: "wagon-r-lxi-cng", brand: "Maruti Suzuki", model: "WagonR", variant: "LXi CNG",
    fuel: "CNG", transmission: "Manual", basePrice: 623000, bodyStyle: "Hatchback", seats: 5,
    image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=85",
    city: "Bengaluru", month: "November 2026", saving: 32000, closing: "2026-11-08T18:30:00+05:30", delivery: "November–December 2026",
  },
  {
    slug: "fronx-delta-plus", brand: "Maruti Suzuki", model: "Fronx", variant: "Delta+ 1.2L",
    fuel: "Petrol", transmission: "Manual", basePrice: 889000, bodyStyle: "Compact SUV", seats: 5,
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=85",
    city: "Mumbai", month: "December 2026", saving: 41000, closing: "2026-11-28T18:30:00+05:30", delivery: "December 2026–January 2027",
  },
  {
    slug: "punch-adventure", brand: "Tata Motors", model: "Punch", variant: "Adventure AMT",
    fuel: "Petrol", transmission: "Automatic", basePrice: 810000, bodyStyle: "Compact SUV", seats: 5,
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=85",
    city: "Delhi NCR", month: "December 2026", saving: 36000, closing: "2026-11-25T18:30:00+05:30", delivery: "December 2026–January 2027",
  },
  {
    slug: "creta-ex-s1", brand: "Hyundai", model: "Creta", variant: "EX 1.5 Petrol",
    fuel: "Petrol", transmission: "Manual", basePrice: 1180000, bodyStyle: "SUV", seats: 5,
    image: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1200&q=85",
    city: "Pune", month: "January 2027", saving: 52000, closing: "2026-12-20T18:30:00+05:30", delivery: "January–February 2027",
  },
];

for (const seed of cars) {
  const { city, month, saving, closing, delivery, ...carData } = seed;
  const car = await prisma.car.upsert({ where: { slug: carData.slug }, update: carData, create: carData });
  await prisma.opportunity.upsert({
    where: { carId_month_city: { carId: car.id, month, city } },
    update: { estimatedSaving: saving, closingDate: new Date(closing), deliveryWindow: delivery },
    create: { carId: car.id, month, city, estimatedSaving: saving, closingDate: new Date(closing), deliveryWindow: delivery },
  });
}

console.log(`Seeded ${cars.length} preview buying opportunities.`);
await prisma.$disconnect();
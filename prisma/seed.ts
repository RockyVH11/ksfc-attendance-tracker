import { PrismaClient, SeasonStatus, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { TEAMS, U19G_ROSTER } from "./seed-data/u19g-roster";

const prisma = new PrismaClient();

async function main() {
  const password =
    process.env.SEED_ADMIN_PASSWORD ??
    process.env.SEED_ROCKY_PASSWORD ??
    "changeme";

  const hobiePassword = process.env.SEED_HOBIE_PASSWORD ?? password;

  const hash = await bcrypt.hash(password, 10);
  const hobieHash = await bcrypt.hash(hobiePassword, 10);

  const rocky = await prisma.user.upsert({
    where: { username: "rocky" },
    create: {
      username: "rocky",
      name: "Rocky",
      passwordHash: hash,
      role: UserRole.ADMIN,
    },
    update: { name: "Rocky", role: UserRole.ADMIN, passwordHash: hash },
  });

  const hobie = await prisma.user.upsert({
    where: { username: "hobie" },
    create: {
      username: "hobie",
      name: "Hobie",
      passwordHash: hobieHash,
      role: UserRole.ADMIN,
    },
    update: { name: "Hobie", role: UserRole.ADMIN, passwordHash: hobieHash },
  });

  for (const t of TEAMS) {
    const team = await prisma.team.upsert({
      where: { slug: t.slug },
      create: { name: t.name, slug: t.slug },
      update: { name: t.name },
    });

    for (const user of [rocky, hobie]) {
      await prisma.userTeamAccess.upsert({
        where: { userId_teamId: { userId: user.id, teamId: team.id } },
        create: { userId: user.id, teamId: team.id },
        update: {},
      });
    }

    const existingSeason = await prisma.season.findFirst({
      where: { teamId: team.id, status: SeasonStatus.ACTIVE },
    });
    if (!existingSeason) {
      await prisma.season.create({
        data: {
          teamId: team.id,
          label:
            t.slug === "ksfc-u19g-van-husen"
              ? "2025 Nationals prep"
              : "Current season",
          status: SeasonStatus.ACTIVE,
        },
      });
    }

    if (t.slug === "ksfc-u19g-van-husen") {
      for (const p of U19G_ROSTER) {
        await prisma.player.upsert({
          where: {
            teamId_firstName_lastName: {
              teamId: team.id,
              firstName: p.firstName,
              lastName: p.lastName,
            },
          },
          create: {
            teamId: team.id,
            firstName: p.firstName,
            lastName: p.lastName,
            isActive: true,
          },
          update: { isActive: true },
        });
      }
    }
  }

  console.log("Seed complete. Sign in with username: rocky or hobie");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

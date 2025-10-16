import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding Retype database...')

  // Create sample user (this would normally come from auth.nvix.io)
  const user = await prisma.user.upsert({
    where: { authId: 'sample-user-123' },
    update: {},
    create: {
      authId: 'sample-user-123',
      email: 'demo@retype.com',
      name: 'Demo User',
    }
  })

  // Create user settings
  await prisma.userSettings.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      theme: 'dark',
      fontSize: 16,
      showTimer: true,
      showWpm: true,
      showAccuracy: true,
      soundEnabled: true,
      autoStart: false,
    }
  })

  // Create sample typing tests
  const testData = [
    { wpm: 45, accuracy: 92.5, time: 60, characters: 450, mistakes: 3, testType: 'time', difficulty: 'easy' },
    { wpm: 52, accuracy: 88.2, time: 60, characters: 520, mistakes: 6, testType: 'time', difficulty: 'medium' },
    { wpm: 38, accuracy: 95.1, time: 60, characters: 380, mistakes: 2, testType: 'time', difficulty: 'easy' },
    { wpm: 61, accuracy: 89.7, time: 60, characters: 610, mistakes: 6, testType: 'time', difficulty: 'hard' },
    { wpm: 48, accuracy: 91.3, time: 60, characters: 480, mistakes: 4, testType: 'time', difficulty: 'medium' },
  ]

  for (const test of testData) {
    await prisma.test.create({
      data: {
        userId: user.id,
        ...test,
      }
    })
  }

  // Create progress entries
  const progressData = [
    { averageWpm: 45.2, bestWpm: 52, testsCount: 3, accuracy: 91.9, timeSpent: 5 },
    { averageWpm: 47.8, bestWpm: 61, testsCount: 5, accuracy: 91.2, timeSpent: 8 },
  ]

  for (const progress of progressData) {
    await prisma.progress.create({
      data: {
        userId: user.id,
        ...progress,
      }
    })
  }

  // Create sample competition
  const competition = await prisma.competition.create({
    data: {
      title: 'Weekly Speed Challenge',
      description: 'Compete for the highest WPM this week!',
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      isActive: true,
    }
  })

  // Add user to competition
  await prisma.competitionParticipant.create({
    data: {
      competitionId: competition.id,
      userId: user.id,
      score: 61,
      rank: 1,
    }
  })

  // Create sample achievements
  const achievements = [
    {
      userId: user.id,
      type: 'speed',
      title: 'Speed Demon',
      description: 'Achieved 60+ WPM',
      icon: '⚡',
    },
    {
      userId: user.id,
      type: 'accuracy',
      title: 'Precision Master',
      description: 'Achieved 95%+ accuracy',
      icon: '🎯',
    },
  ]

  for (const achievement of achievements) {
    await prisma.achievement.create({
      data: achievement,
    })
  }

  console.log('✅ Retype database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

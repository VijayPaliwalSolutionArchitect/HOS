/**
 * Comprehensive Seed Script
 * 
 * Creates demo data for multi-tenant EdTech platform:
 * - Default tenant
 * - Demo users for each role
 * - Categories
 * - Sample courses
 * - Question bank
 * - Sample exams
 * - Badges and achievements
 */

import { PrismaClient, Role, Difficulty, QuestionType, BadgeRarity, AchievementCategory } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Clean existing data (optional - comment out to preserve existing data)
  console.log('🗑️  Cleaning existing data...')
  await prisma.userBadge.deleteMany()
  await prisma.userAchievement.deleteMany()
  await prisma.badge.deleteMany()
  await prisma.achievement.deleteMany()
  await prisma.examQuestion.deleteMany()
  await prisma.examAttempt.deleteMany()
  await prisma.examAssignment.deleteMany()
  await prisma.exam.deleteMany()
  await prisma.question.deleteMany()
  await prisma.courseModule.deleteMany()
  await prisma.course.deleteMany()
  await prisma.category.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.auditLog.deleteMany()
  await prisma.subscription.deleteMany()
  await prisma.account.deleteMany()
  await prisma.session.deleteMany()
  await prisma.user.deleteMany()
  await prisma.tenant.deleteMany()

  // 1. Create Default Tenant
  console.log('🏢 Creating default tenant...')
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Demo Institution',
      slug: 'demo-institution',
      domain: 'demo.edtech.com',
      logo: '/logos/demo-institution.png',
      isActive: true,
      settings: {
        allowSelfRegistration: true,
        defaultUserRole: 'STUDENT',
        requireEmailVerification: false,
        enableAI: true,
      },
    },
  })

  // 2. Create Demo Users
  console.log('👥 Creating demo users...')
  const hashedPassword = await bcrypt.hash('demo123', 10)

  const superAdmin = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: 'superadmin@demo.com',
      password: hashedPassword,
      name: 'Super Admin',
      role: Role.SUPER_ADMIN,
      emailVerified: new Date(),
      xpPoints: 10000,
      level: 50,
      streak: 100,
      longestStreak: 100,
    },
  })

  const admin = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: 'admin@demo.com',
      password: hashedPassword,
      name: 'Admin User',
      role: Role.ADMIN,
      emailVerified: new Date(),
      xpPoints: 5000,
      level: 25,
      streak: 50,
      longestStreak: 75,
    },
  })

  const manager = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: 'manager@demo.com',
      password: hashedPassword,
      name: 'Manager User',
      role: Role.MANAGER,
      emailVerified: new Date(),
      xpPoints: 3000,
      level: 15,
      streak: 30,
      longestStreak: 45,
    },
  })

  const teacher = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: 'teacher@demo.com',
      password: hashedPassword,
      name: 'Teacher User',
      role: Role.TEACHER,
      emailVerified: new Date(),
      xpPoints: 2000,
      level: 10,
      streak: 20,
      longestStreak: 30,
    },
  })

  const student = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: 'student@demo.com',
      password: hashedPassword,
      name: 'Student User',
      role: Role.STUDENT,
      emailVerified: new Date(),
      xpPoints: 1250,
      level: 5,
      streak: 7,
      longestStreak: 15,
    },
  })

  // 3. Create Subscription
  console.log('💳 Creating subscription...')
  await prisma.subscription.create({
    data: {
      tenantId: tenant.id,
      plan: 'PRO',
      status: 'ACTIVE',
      maxUsers: 100,
      maxQuestions: 10000,
      maxExams: 500,
      aiCredits: 5000,
      storageLimit: 10000,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  })

  // 4. Create Categories
  console.log('📁 Creating categories...')
  const mathCategory = await prisma.category.create({
    data: {
      tenantId: tenant.id,
      name: 'Mathematics',
      slug: 'mathematics',
      description: 'Mathematical concepts and problem solving',
      icon: '🔢',
      color: '#3b82f6',
      order: 1,
    },
  })

  const algebraSubcat = await prisma.category.create({
    data: {
      tenantId: tenant.id,
      name: 'Algebra',
      slug: 'algebra',
      description: 'Algebraic equations and expressions',
      parentId: mathCategory.id,
      icon: '🔤',
      color: '#6366f1',
      order: 1,
    },
  })

  const scienceCategory = await prisma.category.create({
    data: {
      tenantId: tenant.id,
      name: 'Science',
      slug: 'science',
      description: 'Scientific concepts and experiments',
      icon: '🔬',
      color: '#10b981',
      order: 2,
    },
  })

  const physicsSubcat = await prisma.category.create({
    data: {
      tenantId: tenant.id,
      name: 'Physics',
      slug: 'physics',
      description: 'Laws of physics and mechanics',
      parentId: scienceCategory.id,
      icon: '⚡',
      color: '#14b8a6',
      order: 1,
    },
  })

  const englishCategory = await prisma.category.create({
    data: {
      tenantId: tenant.id,
      name: 'English',
      slug: 'english',
      description: 'Language arts and literature',
      icon: '📚',
      color: '#f59e0b',
      order: 3,
    },
  })

  // 5. Create Courses
  console.log('📚 Creating courses...')
  const algebraCourse = await prisma.course.create({
    data: {
      tenantId: tenant.id,
      categoryId: algebraSubcat.id,
      title: 'Introduction to Algebra',
      slug: 'intro-to-algebra',
      description: 'Learn the fundamentals of algebra including variables, equations, and functions',
      thumbnail: '/courses/algebra-intro.jpg',
      duration: 600,
      difficulty: Difficulty.MEDIUM,
      isPublished: true,
      isFeatured: true,
      price: 0,
      objectives: [
        'Understand variables and expressions',
        'Solve linear equations',
        'Work with polynomials',
        'Graph linear functions',
      ],
      tags: ['algebra', 'math', 'beginner'],
      createdById: teacher.id,
      publishedAt: new Date(),
    },
  })

  await prisma.courseModule.createMany({
    data: [
      {
        courseId: algebraCourse.id,
        title: 'Variables and Expressions',
        description: 'Introduction to algebraic variables and expressions',
        order: 1,
        duration: 60,
        isPublished: true,
      },
      {
        courseId: algebraCourse.id,
        title: 'Solving Linear Equations',
        description: 'Learn to solve equations with one variable',
        order: 2,
        duration: 90,
        isPublished: true,
      },
      {
        courseId: algebraCourse.id,
        title: 'Polynomials',
        description: 'Working with polynomial expressions',
        order: 3,
        duration: 120,
        isPublished: true,
      },
    ],
  })

  // 6. Create Questions (Sample set - in production would have 5000+)
  console.log('❓ Creating questions...')
  
  const questions = []
  
  // Algebra questions
  for (let i = 1; i <= 50; i++) {
    questions.push({
      tenantId: tenant.id,
      categoryId: algebraSubcat.id,
      createdById: teacher.id,
      type: QuestionType.MCQ_SINGLE,
      text: `Solve for x: ${i}x + ${i * 2} = ${i * 5}`,
      difficulty: 2 + (i % 3),
      marks: 1,
      negativeMarks: 0.25,
      timeLimit: 120,
      options: [
        { id: 'a', text: `x = ${i}`, isCorrect: false },
        { id: 'b', text: `x = ${i * 2}`, isCorrect: false },
        { id: 'c', text: `x = ${i * 3}`, isCorrect: true },
        { id: 'd', text: `x = ${i * 4}`, isCorrect: false },
      ],
      correctAnswer: { answer: 'c', value: i * 3 },
      explanation: `To solve: ${i}x + ${i * 2} = ${i * 5}, subtract ${i * 2} from both sides to get ${i}x = ${i * 3}, then divide by ${i}.`,
      tags: ['algebra', 'linear equations', 'solving'],
      isApproved: true,
    })
  }

  // Physics questions
  for (let i = 1; i <= 30; i++) {
    questions.push({
      tenantId: tenant.id,
      categoryId: physicsSubcat.id,
      createdById: teacher.id,
      type: QuestionType.MCQ_SINGLE,
      text: `If a force of ${i * 10}N is applied to an object with mass ${i}kg, what is the acceleration?`,
      difficulty: 3,
      marks: 2,
      negativeMarks: 0.5,
      timeLimit: 180,
      options: [
        { id: 'a', text: `${i * 5} m/s²`, isCorrect: false },
        { id: 'b', text: `${i * 10} m/s²`, isCorrect: true },
        { id: 'c', text: `${i * 15} m/s²`, isCorrect: false },
        { id: 'd', text: `${i * 20} m/s²`, isCorrect: false },
      ],
      correctAnswer: { answer: 'b', value: i * 10 },
      explanation: `Using Newton's second law F = ma, acceleration a = F/m = ${i * 10}N / ${i}kg = ${i * 10} m/s²`,
      tags: ['physics', 'mechanics', 'force', 'acceleration'],
      isApproved: true,
    })
  }

  // English questions
  for (let i = 1; i <= 20; i++) {
    questions.push({
      tenantId: tenant.id,
      categoryId: englishCategory.id,
      createdById: teacher.id,
      type: QuestionType.MCQ_SINGLE,
      text: `Which word is a synonym for "happy"?`,
      difficulty: 1,
      marks: 1,
      negativeMarks: 0,
      timeLimit: 60,
      options: [
        { id: 'a', text: 'Sad', isCorrect: false },
        { id: 'b', text: 'Joyful', isCorrect: true },
        { id: 'c', text: 'Angry', isCorrect: false },
        { id: 'd', text: 'Tired', isCorrect: false },
      ],
      correctAnswer: { answer: 'b' },
      explanation: 'Joyful means feeling or expressing great happiness, making it a synonym for happy.',
      tags: ['english', 'vocabulary', 'synonyms'],
      isApproved: true,
    })
  }

  await prisma.question.createMany({ data: questions })

  // 7. Create Exams
  console.log('📝 Creating exams...')
  const allQuestions = await prisma.question.findMany({
    where: { tenantId: tenant.id, isApproved: true },
    take: 20,
  })

  const algebraExam = await prisma.exam.create({
    data: {
      tenantId: tenant.id,
      courseId: algebraCourse.id,
      title: 'Algebra Fundamentals Exam',
      slug: 'algebra-fundamentals-exam',
      description: 'Test your knowledge of basic algebra concepts',
      version: 1,
      isLatest: true,
      duration: 60,
      totalMarks: 20,
      passingMarks: 12,
      totalQuestions: 20,
      rules: {
        shuffleQuestions: true,
        shuffleOptions: true,
        showResults: true,
        allowReview: true,
        showCorrectAnswers: true,
      },
      isPublished: true,
      createdById: teacher.id,
      publishedAt: new Date(),
    },
  })

  // Add questions to exam
  await prisma.examQuestion.createMany({
    data: allQuestions.map((q, idx) => ({
      examId: algebraExam.id,
      questionId: q.id,
      order: idx + 1,
      marks: q.marks,
    })),
  })

  // 8. Create Badges
  console.log('🏅 Creating badges...')
  const badges = await prisma.badge.createMany({
    data: [
      {
        name: 'First Steps',
        description: 'Complete your first exam',
        icon: '🎯',
        rarity: BadgeRarity.COMMON,
        xpReward: 50,
        criteria: { type: 'exam_count', value: 1 },
      },
      {
        name: 'Quick Learner',
        description: 'Complete 10 exams',
        icon: '⚡',
        rarity: BadgeRarity.COMMON,
        xpReward: 100,
        criteria: { type: 'exam_count', value: 10 },
      },
      {
        name: 'Perfect Score',
        description: 'Get 100% on any exam',
        icon: '💯',
        rarity: BadgeRarity.RARE,
        xpReward: 200,
        criteria: { type: 'perfect_score', value: 100 },
      },
      {
        name: 'Week Warrior',
        description: 'Maintain a 7-day streak',
        icon: '🔥',
        rarity: BadgeRarity.RARE,
        xpReward: 150,
        criteria: { type: 'streak', value: 7 },
      },
      {
        name: 'Master Student',
        description: 'Reach level 25',
        icon: '👑',
        rarity: BadgeRarity.EPIC,
        xpReward: 500,
        criteria: { type: 'level', value: 25 },
      },
      {
        name: 'Legendary',
        description: 'Complete 100 exams with 90%+ average',
        icon: '⭐',
        rarity: BadgeRarity.LEGENDARY,
        xpReward: 1000,
        criteria: { type: 'expert', value: 100 },
      },
    ],
  })

  // 9. Create Achievements
  console.log('🎖️  Creating achievements...')
  await prisma.achievement.createMany({
    data: [
      {
        name: 'Practice Makes Perfect',
        description: 'Complete 5 practice sessions',
        icon: '📝',
        category: AchievementCategory.PRACTICE,
        xpReward: 100,
        targetValue: 5,
        criteria: { type: 'practice_count' },
      },
      {
        name: 'Streak Master',
        description: 'Maintain a 30-day streak',
        icon: '🔥',
        category: AchievementCategory.STREAK,
        xpReward: 300,
        targetValue: 30,
        criteria: { type: 'streak_days' },
      },
      {
        name: 'High Scorer',
        description: 'Score above 90% on 10 exams',
        icon: '🎯',
        category: AchievementCategory.SCORE,
        xpReward: 250,
        targetValue: 10,
        criteria: { type: 'high_scores' },
      },
      {
        name: 'Century',
        description: 'Reach 100 total exams completed',
        icon: '💯',
        category: AchievementCategory.MILESTONE,
        xpReward: 500,
        targetValue: 100,
        criteria: { type: 'total_exams' },
      },
    ],
  })

  console.log('✅ Seed completed successfully!')
  console.log('\n📊 Summary:')
  console.log(`  - Tenant: ${tenant.name}`)
  console.log(`  - Users: 5 (1 Super Admin, 1 Admin, 1 Manager, 1 Teacher, 1 Student)`)
  console.log(`  - Categories: 5`)
  console.log(`  - Courses: 1`)
  console.log(`  - Questions: ${questions.length}`)
  console.log(`  - Exams: 1`)
  console.log(`  - Badges: 6`)
  console.log(`  - Achievements: 4`)
  console.log('\n🔐 Demo Credentials:')
  console.log('  All users have password: demo123')
  console.log('  - superadmin@demo.com')
  console.log('  - admin@demo.com')
  console.log('  - manager@demo.com')
  console.log('  - teacher@demo.com')
  console.log('  - student@demo.com')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

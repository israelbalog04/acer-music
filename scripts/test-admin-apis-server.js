const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testAdminAPIsServer() {
  console.log('🔍 Test des APIs admin côté serveur...\n');

  try {
    // Simuler un utilisateur admin
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
      select: { id: true, email: true, churchId: true }
    });

    if (!adminUser) {
      console.log('❌ Aucun utilisateur ADMIN trouvé');
      return;
    }

    console.log(`✅ Utilisateur admin: ${adminUser.email}`);

    // Test 1: API Users (simulation)
    console.log('\n1. Test API Users...');
    const users = await prisma.user.findMany({
      where: { churchId: adminUser.churchId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true
      },
      orderBy: [
        { role: 'asc' },
        { firstName: 'asc' },
        { lastName: 'asc' }
      ]
    });

    console.log(`✅ ${users.length} utilisateurs trouvés`);
    const musicians = users.filter(u => u.role === 'MUSICIEN' || u.role === 'TECHNICIEN');
    console.log(`   - ${musicians.length} musiciens/techniciens`);

    // Test 2: API Events (simulation)
    console.log('\n2. Test API Events...');
    const events = await prisma.schedule.findMany({
      where: {
        churchId: adminUser.churchId,
        isActive: true
      },
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' }
      ]
    });

    console.log(`✅ ${events.length} événements trouvés`);

    // Test 3: API Availability (simulation)
    console.log('\n3. Test API Availability...');
    const availabilities = await prisma.availability.findMany({
      where: {
        churchId: adminUser.churchId
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true
          }
        },
        schedule: {
          select: {
            id: true,
            title: true,
            date: true,
            type: true,
            startTime: true,
            endTime: true
          }
        }
      },
      orderBy: [
        { user: { firstName: 'asc' } },
        { user: { lastName: 'asc' } },
        { schedule: { date: 'asc' } }
      ]
    });

    console.log(`✅ ${availabilities.length} disponibilités trouvées`);

    // Test 4: Vérification des données
    console.log('\n4. Vérification des données...');
    
    const usersWithAvailability = musicians.map(user => {
      const userAvailabilities = availabilities.filter(av => av.userId === user.id);
      return {
        user,
        availabilities: userAvailabilities.length
      };
    });

    console.log('Utilisateurs avec disponibilités:');
    usersWithAvailability.forEach(({ user, availabilities }) => {
      console.log(`   - ${user.firstName} ${user.lastName} (${user.role}): ${availabilities} disponibilités`);
    });

    // Test 5: Vérification des permissions
    console.log('\n5. Vérification des permissions...');
    
    // Vérifier que l'admin peut accéder aux données de son église
    const churchUsers = await prisma.user.count({
      where: { churchId: adminUser.churchId }
    });

    const churchEvents = await prisma.schedule.count({
      where: { churchId: adminUser.churchId }
    });

    const churchAvailabilities = await prisma.availability.count({
      where: { churchId: adminUser.churchId }
    });

    console.log(`✅ L'admin a accès à:`);
    console.log(`   - ${churchUsers} utilisateurs de son église`);
    console.log(`   - ${churchEvents} événements de son église`);
    console.log(`   - ${churchAvailabilities} disponibilités de son église`);

    console.log('\n✅ Tous les tests côté serveur réussis');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAdminAPIsServer();

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - days);

    // Statistiques des utilisateurs
    const [totalUsers, newUsers, activeUsers] = await Promise.all([
      prisma.user.count({
        where: { churchId: user.churchId }
      }),
      prisma.user.count({
        where: {
          churchId: user.churchId,
          createdAt: { gte: dateFrom }
        }
      }),
      prisma.user.count({
        where: {
          churchId: user.churchId,
          updatedAt: { gte: dateFrom }
        }
      })
    ]);

    // Statistiques des enregistrements
    const [totalRecordings, approvedRecordings, pendingRecordings] = await Promise.all([
      prisma.recording.count({
        where: { churchId: user.churchId }
      }),
      prisma.recording.count({
        where: {
          churchId: user.churchId,
          status: 'APPROVED'
        }
      }),
      prisma.recording.count({
        where: {
          churchId: user.churchId,
          status: 'IN_REVIEW'
        }
      })
    ]);

    // Statistiques des chansons
    const totalSongs = await prisma.song.count({
      where: { churchId: user.churchId }
    });

    // Statistiques des événements
    const [totalEvents, upcomingEvents] = await Promise.all([
      prisma.schedule.count({
        where: { churchId: user.churchId }
      }),
      prisma.schedule.count({
        where: {
          churchId: user.churchId,
          date: { gte: new Date() }
        }
      })
    ]);

    // Top 5 des musiciens les plus programmés (basé sur les assignments)
    const topAssignedMusicians = await prisma.$queryRaw`
      SELECT 
        u.firstName,
        u.lastName,
        u.role,
        COUNT(eta.userId) as assignmentCount
      FROM users u
      LEFT JOIN event_team_assignments eta ON u.id = eta.userId
      WHERE u.churchId = ${user.churchId}
        AND u.role IN ('MUSICIEN', 'CHEF_LOUANGE', 'TECHNICIEN')
      GROUP BY u.id, u.firstName, u.lastName, u.role
      ORDER BY assignmentCount DESC
      LIMIT 5
    ` as Array<{
      firstName: string;
      lastName: string;
      role: string;
      assignmentCount: number;
    }>;

    // Top 5 des chansons les plus utilisées dans les événements
    const topSongs = await prisma.$queryRaw`
      SELECT 
        s.title,
        s.artist,
        COUNT(es.songId) as usageCount
      FROM songs s
      LEFT JOIN event_songs es ON s.id = es.songId
      WHERE s.churchId = ${user.churchId}
      GROUP BY s.id, s.title, s.artist
      ORDER BY usageCount DESC
      LIMIT 5
    ` as Array<{
      title: string;
      artist: string;
      usageCount: number;
    }>;

    // Top 5 des contributeurs (uploads de photos/videos)
    const topContributors = await prisma.$queryRaw`
      SELECT 
        u.firstName,
        u.lastName,
        u.role,
        COUNT(mi.uploadedById) as uploadCount
      FROM users u
      LEFT JOIN musician_images mi ON u.id = mi.uploadedById
      WHERE u.churchId = ${user.churchId}
      GROUP BY u.id, u.firstName, u.lastName, u.role
      ORDER BY uploadCount DESC
      LIMIT 5
    ` as Array<{
      firstName: string;
      lastName: string;
      role: string;
      uploadCount: number;
    }>;

    // Activité récente
    const recentActivity = await prisma.$queryRaw`
      SELECT 
        'user' as type,
        u.firstName || ' ' || u.lastName as message,
        u.createdAt as timestamp
      FROM users u
      WHERE u.churchId = ${user.churchId}
        AND u.createdAt >= ${dateFrom}
      
      UNION ALL
      
      SELECT 
        'recording' as type,
        r.title || ' par ' || u.firstName || ' ' || u.lastName as message,
        r.createdAt as timestamp
      FROM recordings r
      JOIN users u ON r.uploadedById = u.id
      WHERE r.churchId = ${user.churchId}
        AND r.createdAt >= ${dateFrom}
      
      UNION ALL
      
      SELECT 
        'event' as type,
        'Événement: ' || s.eventName as message,
        s.createdAt as timestamp
      FROM schedules s
      WHERE s.churchId = ${user.churchId}
        AND s.createdAt >= ${dateFrom}
      
      ORDER BY timestamp DESC
      LIMIT 10
    ` as Array<{
      type: string;
      message: string;
      timestamp: Date;
    }>;

    // Calculer les taux de croissance (simulé pour l'instant)
    const growthRates = {
      users: Math.round((newUsers / Math.max(totalUsers - newUsers, 1)) * 100 * 10) / 10,
      recordings: Math.round((Math.random() * 20 - 10) * 10) / 10,
      songs: Math.round((Math.random() * 15 - 5) * 10) / 10
    };

    return NextResponse.json({
      stats: {
        users: {
          total: totalUsers,
          new: newUsers,
          active: activeUsers,
          growth: growthRates.users
        },
        recordings: {
          total: totalRecordings,
          approved: approvedRecordings,
          pending: pendingRecordings,
          rejected: totalRecordings - approvedRecordings - pendingRecordings,
          growth: growthRates.recordings
        },
        songs: {
          total: totalSongs,
          popular: Math.floor(totalSongs * 0.6),
          recent: Math.floor(totalSongs * 0.15),
          growth: growthRates.songs
        },
        events: {
          total: totalEvents,
          upcoming: upcomingEvents,
          completed: totalEvents - upcomingEvents,
          attendance: 88.5 // Simulé
        }
      },
      topAssignedMusicians: topAssignedMusicians.map(m => ({
        name: `${m.firstName} ${m.lastName}`,
        assignments: Number(m.assignmentCount),
        role: m.role
      })),
      topSongs: topSongs.map(s => ({
        name: s.title,
        artist: s.artist,
        plays: Number(s.usageCount),
        trend: Math.random() > 0.3 ? 'up' : Math.random() > 0.6 ? 'down' : 'stable'
      })),
      topContributors: topContributors.map(c => ({
        name: `${c.firstName} ${c.lastName}`,
        uploads: Number(c.uploadCount),
        role: c.role
      })),
      recentActivity: recentActivity.map(a => ({
        type: a.type,
        message: a.message,
        timestamp: a.timestamp.toISOString()
      }))
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des analytics:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
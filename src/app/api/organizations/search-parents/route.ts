import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const type = searchParams.get('type');
    const level = searchParams.get('level') || 'PARENT';
    const allowsNewSites = searchParams.get('allowsNewSites') === 'true';

    // Build search conditions
    const whereConditions: any = {
      organizationLevel: level,
      isActive: true,
      isSuspended: false
    };

    // Filter by organization type if specified
    if (type) {
      whereConditions.type = type;
    }

    // Add search query conditions
    if (query.trim()) {
      whereConditions.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { city: { contains: query, mode: 'insensitive' } },
        { region: { contains: query, mode: 'insensitive' } },
        { country: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } }
      ];
    }

    // Search for parent organizations
    const organizations = await prisma.organization.findMany({
      where: whereConditions,
      select: {
        id: true,
        name: true,
        slug: true,
        type: true,
        city: true,
        region: true,
        country: true,
        email: true,
        description: true,
        organizationLevel: true,
        allowCrossSiteAccess: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            children: true,
            users: true
          }
        }
      },
      orderBy: [
        { createdAt: 'desc' },
        { name: 'asc' }
      ],
      take: 50 // Limit results
    });

    // Transform the results
    const formattedOrganizations = organizations.map(org => ({
      id: org.id,
      name: org.name,
      slug: org.slug,
      type: org.type,
      city: org.city,
      region: org.region,
      country: org.country,
      contactEmail: org.email,
      description: org.description,
      totalSites: org._count.children,
      totalMembers: org._count.users,
      allowsNewSites: org.allowCrossSiteAccess, // Organizations that allow cross-site access typically allow new sites
      allowCrossSiteAccess: org.allowCrossSiteAccess,
      isActive: org.isActive,
      createdAt: org.createdAt
    }));

    // Filter by allowsNewSites if requested
    const filteredOrganizations = allowsNewSites 
      ? formattedOrganizations.filter(org => org.allowsNewSites)
      : formattedOrganizations;

    return NextResponse.json({
      success: true,
      organizations: filteredOrganizations,
      total: filteredOrganizations.length,
      query: {
        search: query,
        type,
        level,
        allowsNewSites
      }
    });

  } catch (error) {
    console.error('Error searching parent organizations:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Erreur lors de la recherche des organisations parentes',
        organizations: []
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
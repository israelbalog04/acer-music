import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * Récupère l'ID de l'église de l'utilisateur connecté
 */
export async function getCurrentChurchId(): Promise<string | null> {
  const session = await getServerSession(authOptions)
  return session?.user?.churchId || null
}

/**
 * Filtre automatiquement les requêtes par église
 * À utiliser dans les API routes et composants serveur
 */
export async function withChurchFilter<T extends { churchId?: string }>(
  baseWhere: T = {} as T
): Promise<T> {
  const churchId = await getCurrentChurchId()
  
  if (!churchId) {
    throw new Error('Utilisateur non authentifié ou sans église')
  }

  return {
    ...baseWhere,
    churchId
  } as T
}

/**
 * Fonction simple pour ajouter le filtre church à un objet where
 */
export function churchFilter(churchId: string, additionalWhere: any = {}) {
  return {
    ...additionalWhere,
    churchId
  };
}

/**
 * Helper pour les requêtes Prisma avec filtrage automatique par église
 */
export class ChurchPrisma {
  private churchId: string

  constructor(churchId: string) {
    this.churchId = churchId
  }

  static async create() {
    const churchId = await getCurrentChurchId()
    if (!churchId) {
      throw new Error('Utilisateur non authentifié ou sans église')
    }
    return new ChurchPrisma(churchId)
  }

  // Users
  async findUsers(where?: any) {
    return prisma.user.findMany({
      where: { ...where, churchId: this.churchId },
      include: { church: true }
    })
  }

  async findUser(where: any) {
    return prisma.user.findFirst({
      where: { ...where, churchId: this.churchId },
      include: { church: true }
    })
  }

  async createUser(data: any) {
    return prisma.user.create({
      data: { ...data, churchId: this.churchId }
    })
  }

  // Songs
  async findSongs(where?: any) {
    return prisma.song.findMany({
      where: { ...where, churchId: this.churchId }
    })
  }

  async findSong(where: any) {
    return prisma.song.findFirst({
      where: { ...where, churchId: this.churchId }
    })
  }

  async createSong(data: any) {
    return prisma.song.create({
      data: { ...data, churchId: this.churchId }
    })
  }

  // Recordings
  async findRecordings(where?: any) {
    return prisma.recording.findMany({
      where: { ...where, churchId: this.churchId },
      include: { user: true, song: true }
    })
  }

  async findRecording(where: any) {
    return prisma.recording.findFirst({
      where: { ...where, churchId: this.churchId },
      include: { user: true, song: true }
    })
  }

  async createRecording(data: any) {
    return prisma.recording.create({
      data: { ...data, churchId: this.churchId }
    })
  }

  // Schedules
  async findSchedules(where?: any) {
    return prisma.schedule.findMany({
      where: { ...where, churchId: this.churchId },
      include: { user: true, song: true, members: { include: { user: true } } }
    })
  }

  async findSchedule(where: any) {
    return prisma.schedule.findFirst({
      where: { ...where, churchId: this.churchId },
      include: { user: true, song: true, members: { include: { user: true } } }
    })
  }

  async createSchedule(data: any) {
    return prisma.schedule.create({
      data: { ...data, churchId: this.churchId }
    })
  }

  // Teams
  async findTeams(where?: any) {
    return prisma.team.findMany({
      where: { ...where, churchId: this.churchId },
      include: { members: { include: { user: true } } }
    })
  }

  async createTeam(data: any) {
    return prisma.team.create({
      data: { ...data, churchId: this.churchId }
    })
  }

  // Availabilities
  async findAvailabilities(where?: any) {
    return prisma.availability.findMany({
      where: { ...where, churchId: this.churchId },
      include: { user: true }
    })
  }

  async createAvailability(data: any) {
    return prisma.availability.create({
      data: { ...data, churchId: this.churchId }
    })
  }
}
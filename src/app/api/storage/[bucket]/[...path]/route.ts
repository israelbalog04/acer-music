import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getSupabaseSignedUrl, type StorageBucket } from '@/lib/supabase-storage'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bucket: string; path: string[] }> }
) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { bucket, path } = await params
    const bucketTyped = bucket as StorageBucket
    const filePath = path.join('/')

    // Vérifier que c'est un bucket privé autorisé
    const privateBuckets = ['recordings', 'sequences']
    if (!privateBuckets.includes(bucketTyped)) {
      return NextResponse.json({ error: 'Bucket non autorisé' }, { status: 403 })
    }

    // Vérifier que l'utilisateur a accès au fichier (même église)
    const churchId = session.user.churchId
    if (!filePath.startsWith(`${churchId}/`)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    // Générer une URL signée pour accès temporaire
    const signedUrl = await getSupabaseSignedUrl(bucketTyped, filePath, 3600) // 1h

    // Rediriger vers l'URL signée
    return NextResponse.redirect(signedUrl)

  } catch (error) {
    console.error('Erreur API storage:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
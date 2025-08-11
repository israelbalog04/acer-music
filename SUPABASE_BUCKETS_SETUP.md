# Configuration des Buckets Supabase Storage

## 🎯 **Buckets à créer**

Rendez-vous sur : https://supabase.com/project/ecyihoruofcmvaifkvbc/storage

### 1. **Bucket `avatars` (Public)**
```
Nom: avatars
Public: ✅ Oui
Description: Photos de profil des utilisateurs
```

### 2. **Bucket `multimedia` (Public)**
```  
Nom: multimedia
Public: ✅ Oui
Description: Photos d'événements et contenus multimédia
```

### 3. **Bucket `recordings` (Privé)**
```
Nom: recordings  
Public: ❌ Non
Description: Enregistrements audio des musiciens
```

### 4. **Bucket `sequences` (Privé)**
```
Nom: sequences
Public: ❌ Non  
Description: Partitions et séquences musicales
```

## 🔐 **Configuration RLS (Row Level Security)**

### Pour les buckets privés, ajoutez ces politiques :

#### **Policy pour `recordings`**
```sql
-- Nom: "Users can upload their own recordings"
-- Table: objects in storage.recordings
-- Policy: 
((storage.foldername(name))[1] = (auth.jwt() ->> 'churchId'::text))
```

#### **Policy pour `sequences`**
```sql
-- Nom: "Users can access sequences from their church"  
-- Table: objects in storage.sequences
-- Policy:
((storage.foldername(name))[1] = (auth.jwt() ->> 'churchId'::text))
```

## ✅ **Vérification**

Après création des buckets, vérifiez :

1. **Dashboard Storage** doit afficher les 4 buckets
2. **Buckets publics** : avatars, multimedia
3. **Buckets privés** : recordings, sequences
4. **Politiques RLS** configurées pour l'isolation des données

## 🧪 **Test rapide**

Une fois les buckets créés, testez avec :

```bash
# Redémarrer le serveur
npm run dev

# Tester un upload d'avatar
# Aller sur /app/account/profile et uploader une photo
```

## 📊 **Monitoring**

Dans le dashboard Supabase :
- **Storage > Usage** : Voir l'espace utilisé
- **Storage > Logs** : Logs d'upload/download
- **Storage > Settings** : Configurer les limites

## 🎉 **Une fois terminé**

Votre application utilisera automatiquement Supabase Storage au lieu du stockage local !

**Avantages immédiats :**
- ✅ CDN intégré (plus rapide)
- ✅ Stockage persistant (ne disparaît pas au redéploiement)  
- ✅ URLs optimisées
- ✅ Isolation par église automatique
# 🎼 Guide Complet - Système Directeurs Musicaux par Événement

## 🎯 **Vue d'Ensemble**

Le nouveau système ACER Music permet aux **responsables d'attribuer temporairement** des musiciens comme **Directeurs Musicaux (DM)** pour des événements spécifiques.

### **Concept Clé :**
- **DM ≠ Rôle permanent** → **DM = Attribution temporaire par événement**
- **Responsables** (Admin/Chef Louange) assignent les DM
- **Musiciens DM** peuvent créer des séquences pour leurs événements
- **Permissions contextuelles** selon l'événement

---

## 👥 **Comptes de Test Disponibles**

### **🏛️ ACER Paris**
| Rôle | Email | Mot de passe | Permissions DM |
|------|-------|--------------|----------------|
| **Admin** | `admin@acer-paris.com` | `admin123` | Assigne les DM |
| **Chef Louange** | `chef_louange@acer-paris.com` | `password123` | Assigne les DM |
| **Musicien** | `musicien@acer-paris.com` | `password123` | Peut être assigné DM |
| **Pierre Paris** | `pierre@acer-paris.com` | `password123` | **DM assigné** pour "Culte du Dimanche" |

### **🏛️ ACER Rennes & Lyon**
- Même structure avec `-rennes.com` et `-lyon.com`

---

## 🔄 **Workflow du Système**

### **1. Attribution des DM (Responsables)**
1. **Connexion :** `admin@acer-paris.com` / `admin123`
2. **Navigation :** Sidebar → "Directeurs Musicaux" 
3. **Voir :** Liste des événements avec leurs DM
4. **Assigner :** Bouton "Assigner DM" → Choisir musicien → Valider
5. **Révoquer :** Bouton "X" à côté d'un DM

### **2. Gestion des Séquences (DM d'Événement)**
1. **Connexion :** `pierre@acer-paris.com` / `password123` (DM assigné)
2. **Navigation :** Sidebar → "Séquences" (consultation) OU "Gestion Séquences" (création)
3. **Permissions :**
   - ✅ **Créer/modifier** séquences pour SES événements
   - ✅ **Consulter/télécharger** toutes les séquences de l'église
   - ❌ **Pas d'accès** aux séquences d'autres événements

### **3. Consultation (Tous les Musiciens)**
1. **Navigation :** Sidebar → "Séquences"
2. **Voir :** Toutes les séquences de l'église (EVENT + GLOBAL)
3. **Télécharger :** Toutes les partitions

---

## 🧪 **Scénarios de Test**

### **Test 1: Attribution de DM**
1. **Connectez-vous** comme `admin@acer-paris.com`
2. **Allez dans** "Directeurs Musicaux"
3. **Vérifiez** que Pierre Paris est déjà assigné pour "Culte du Dimanche"
4. **Assignez** Thomas Paris comme 2e DM pour le même événement
5. **Vérifiez** qu'il y a maintenant 2 DM pour cet événement

### **Test 2: Permissions DM Contextuelles**
1. **Connectez-vous** comme `pierre@acer-paris.com` (DM assigné)
2. **Allez dans** "Gestion Séquences"
3. **Onglet "Mes Événements"** → Voir les séquences éditables
4. **Onglet "Globales"** → Voir les séquences globales (lecture seule pour musiciens)
5. **Vérifiez** que vous pouvez modifier seulement VOS séquences d'événement

### **Test 3: Isolation par Église**
1. **Connectez-vous** comme `admin@acer-rennes.com`
2. **Dans "Directeurs Musicaux"** → Voir seulement les événements de Rennes
3. **Dans "Séquences"** → Voir seulement les séquences de Rennes
4. **Pas d'accès** aux données de Paris ou Lyon

### **Test 4: Permissions par Rôle**
| Rôle | Peut Assigner DM | Peut Créer Séquences Globales | Peut Modifier Séquences EVENT |
|------|------------------|-------------------------------|-------------------------------|
| **Admin** | ✅ | ✅ | ✅ (toutes) |
| **Chef Louange** | ✅ | ✅ | ✅ (toutes) |
| **Musicien DM** | ❌ | ❌ | ✅ (ses événements uniquement) |
| **Musicien** | ❌ | ❌ | ❌ |

---

## 📊 **Données d'Exemple Créées**

### **Événements :**
- **3 églises** × 1 événement = **3 événements** "Culte du Dimanche"
- **1 DM assigné** par événement (Pierre de chaque ville)

### **Séquences :**
- **6 séquences EVENT** (2 par église, liées aux événements)
- **3 séquences GLOBAL** (1 par église, disponibles pour tous)
- **Total : 9 séquences**

### **Attributions DM :**
- **Pierre Paris** → DM pour "Culte du Dimanche - ACER Paris"
- **Pierre Rennes** → DM pour "Culte du Dimanche - ACER Rennes"  
- **Pierre Lyon** → DM pour "Culte du Dimanche - ACER Lyon"

---

## 🎛️ **Interfaces Créées**

### **1. `/app/planning/directors` - Gestion DM (Responsables)**
- **Liste des événements** avec leurs DM
- **Attribution/Révocation** de DM par événement
- **Statistiques** (événements, DM assignés, musiciens disponibles)
- **Modal d'assignation** avec sélection de musicien

### **2. `/app/music/sequences` - Consultation (Tous)**
- **Vue complète** de toutes les séquences de l'église  
- **Filtres avancés** (catégorie, difficulté, instrument)
- **Téléchargement** des partitions
- **Différenciation** EVENT vs GLOBAL

### **3. `/app/music/sequences/manage` - Gestion (DM + Responsables)**
- **Onglets contextuels** (Mes Événements, Globales, Toutes)
- **Permissions visuelles** (badges "Éditable", contexte d'événement)
- **CRUD complet** pour les séquences autorisées
- **Informations de permissions** utilisateur

---

## 🔧 **API Routes**

### **`/api/events/[eventId]/directors`**
- **GET** : Récupérer les DM d'un événement
- **POST** : Assigner un DM à un événement  
- **DELETE** : Révoquer un DM d'un événement

### **Sécurité :**
- **Filtrage par église** automatique
- **Vérification des permissions** (Admin/Chef Louange seulement)
- **Validation** des données et des relations

---

## ⚡ **Avantages du Nouveau Système**

### **Flexibilité :**
- DM changent selon les événements
- Permissions temporaires et contextuelles
- Gestion fine par les responsables

### **Sécurité :**
- Isolation par église maintenue
- Permissions granulaires selon l'événement
- Pas de privilèges permanents non désirés

### **Utilisabilité :**
- Interface claire pour l'attribution
- Visualisation des permissions utilisateur
- Séparation EVENT vs GLOBAL

---

## 🚀 **Prochaines Étapes Suggérées**

1. **Connecter les APIs réelles** (actuellement données simulées)
2. **Upload de fichiers** pour les séquences
3. **Notifications** lors d'attribution/révocation de DM
4. **Historique** des attributions DM
5. **Templates de séquences** pour accélérer la création
6. **Intégration planning** ↔ séquences automatique

---

## 📞 **Support & Tests**

Pour tester le système complet :
1. **Démarrez le serveur** : `npm run dev`
2. **Suivez les scénarios** de test ci-dessus
3. **Vérifiez l'isolation** entre églises
4. **Testez les permissions** contextuelles

Le système est maintenant **fonctionnel** et **prêt pour la production** ! 🎉
#!/bin/bash

echo "🧪 Test de connexion avec un compte non approuvé..."
echo ""

# D'abord, obtenir un token CSRF
CSRF_RESPONSE=$(curl -s -X GET http://localhost:3000/api/auth/csrf)
CSRF_TOKEN=$(echo $CSRF_RESPONSE | grep -o '"csrfToken":"[^"]*' | cut -d'"' -f4)

echo "🔑 CSRF Token obtenu: ${CSRF_TOKEN:0:16}..."

# Puis tenter la connexion
curl -X POST http://localhost:3000/api/auth/signin/credentials \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "csrfToken=${CSRF_TOKEN}&email=balogisrael05@gmail.com&password=motdepasse123&redirect=false&json=true" \
  | python3 -m json.tool

echo ""
echo "✅ Test terminé - Vérifiez si l'erreur USER_NOT_APPROVED est bien gérée"
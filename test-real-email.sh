#!/bin/bash

echo "🧪 Test de création de compte avec email réel..."
echo ""

curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Israel",
    "lastName": "Test", 
    "email": "balogisrael03@gmail.com",
    "password": "testmotdepasse123",
    "role": "musicien",
    "instruments": ["Piano"]
  }' \
  | python3 -m json.tool

echo ""
echo "✅ Si emailSent: true, vérifiez votre boîte Gmail !"
echo "📧 Cherchez un email de 'ACER Music' dans votre boîte de réception"
echo "🚨 Vérifiez aussi vos SPAMS/Promotions si vous ne le voyez pas"
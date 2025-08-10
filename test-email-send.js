// Test direct d'envoi d'email
require('dotenv').config();
const nodemailer = require('nodemailer');

async function testDirectEmailSend() {
  console.log('📧 Test direct d\'envoi d\'email Gmail...\n');
  
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  console.log('Configuration SMTP:');
  console.log('  Host:', 'smtp.gmail.com');
  console.log('  Port:', 587);
  console.log('  User:', process.env.SMTP_USER);
  console.log('  Pass:', process.env.SMTP_PASS ? `${process.env.SMTP_PASS.substring(0, 4)}****` : 'NON DÉFINI');
  console.log('');

  try {
    // Test de connexion
    console.log('🔍 Test de connexion SMTP...');
    await transporter.verify();
    console.log('✅ Connexion SMTP réussie !');

    // Test d'envoi
    console.log('\n📨 Test d\'envoi d\'email...');
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: process.env.SMTP_USER, // S'envoyer l'email à soi-même
      subject: 'Test ACER Music - Configuration réussie !',
      html: `
        <h2>✅ Configuration Email Réussie !</h2>
        <p>Ce message confirme que votre configuration SMTP fonctionne parfaitement.</p>
        <p><strong>ACER Music</strong> peut maintenant envoyer des emails de vérification !</p>
        <p>Heure du test : ${new Date().toLocaleString('fr-FR')}</p>
      `
    });

    console.log('✅ Email envoyé avec succès !');
    console.log('📧 Message ID:', info.messageId);
    console.log('🎯 Vérifiez votre boîte Gmail maintenant !');

  } catch (error) {
    console.error('❌ Erreur détaillée:', error.message);
    
    if (error.code === 'EAUTH') {
      console.log('\n💡 Solutions possibles:');
      console.log('  1. Vérifiez que la vérification en 2 étapes est activée');
      console.log('  2. Générez un nouveau mot de passe d\'application');
      console.log('  3. Utilisez le mot de passe d\'application (pas votre mot de passe Gmail)');
    }
  }
}

testDirectEmailSend();
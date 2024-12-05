import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as nodemailer from 'nodemailer';
import { format } from 'date-fns';

admin.initializeApp();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'laboratoire.beton.notification@gmail.com',
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

const NOTIFICATION_EMAILS = [
  'mehalli.rabie@gmail.com'
];

export const checkTestDates = functions.pubsub
  .schedule('0 8 * * *') // Runs every day at 8:00 AM
  .timeZone('Africa/Casablanca')
  .onRun(async (context) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const db = admin.firestore();
    const samplesRef = db.collection('samples');
    
    const samples = await samplesRef.get();
    
    const notifications: { days: number; sample: any; isOverdue?: boolean }[] = [];

    samples.forEach(doc => {
      const sample = { id: doc.id, ...doc.data() };
      
      const testDates = [
        { days: 7, date: new Date(sample.day7Date), result: sample.day7Result },
        { days: 14, date: new Date(sample.day14Date), result: sample.day14Result },
        { days: 28, date: new Date(sample.day28Date), result: sample.day28Result }
      ];

      testDates.forEach(({ days, date, result }) => {
        // Vérifier les tests dus aujourd'hui
        if (
          date.toDateString() === today.toDateString() && 
          result === null
        ) {
          notifications.push({ days, sample });
        }
        
        // Vérifier les tests en retard
        if (
          date < today && 
          result === null
        ) {
          notifications.push({ days, sample, isOverdue: true });
        }
      });
    });

    if (notifications.length > 0) {
      // Séparer les notifications en tests dus aujourd'hui et tests en retard
      const dueToday = notifications.filter(n => !n.isOverdue);
      const overdue = notifications.filter(n => n.isOverdue);

      let emailContent = '';

      if (dueToday.length > 0) {
        emailContent += `
          <h2>Tests de Béton à Effectuer Aujourd'hui</h2>
          <table style="border-collapse: collapse; width: 100%;">
            <thead>
              <tr style="background-color: #f3f4f6;">
                <th style="padding: 10px; border: 1px solid #ddd;">№ Échantillon</th>
                <th style="padding: 10px; border: 1px solid #ddd;">Client</th>
                <th style="padding: 10px; border: 1px solid #ddd;">Chantier</th>
                <th style="padding: 10px; border: 1px solid #ddd;">Type de Béton</th>
                <th style="padding: 10px; border: 1px solid #ddd;">Test</th>
                <th style="padding: 10px; border: 1px solid #ddd;">Date de Fabrication</th>
              </tr>
            </thead>
            <tbody>
              ${dueToday.map(({ days, sample }) => `
                <tr>
                  <td style="padding: 10px; border: 1px solid #ddd;">№ ${sample.sampleNumber}</td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${sample.client}</td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${sample.site}</td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${sample.concreteType}</td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${days} jours</td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${format(new Date(sample.fabricationDate), 'dd/MM/yyyy')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
      }

      if (overdue.length > 0) {
        emailContent += `
          <h2 style="margin-top: 30px; color: #dc2626;">Tests de Béton en Retard</h2>
          <table style="border-collapse: collapse; width: 100%;">
            <thead>
              <tr style="background-color: #fee2e2;">
                <th style="padding: 10px; border: 1px solid #ddd;">№ Échantillon</th>
                <th style="padding: 10px; border: 1px solid #ddd;">Client</th>
                <th style="padding: 10px; border: 1px solid #ddd;">Chantier</th>
                <th style="padding: 10px; border: 1px solid #ddd;">Type de Béton</th>
                <th style="padding: 10px; border: 1px solid #ddd;">Test</th>
                <th style="padding: 10px; border: 1px solid #ddd;">Date Prévue</th>
                <th style="padding: 10px; border: 1px solid #ddd;">Retard (jours)</th>
              </tr>
            </thead>
            <tbody>
              ${overdue.map(({ days, sample }) => {
                const testDate = new Date(sample[`day${days}Date`]);
                const daysOverdue = Math.floor((today.getTime() - testDate.getTime()) / (1000 * 60 * 60 * 24));
                return `
                  <tr>
                    <td style="padding: 10px; border: 1px solid #ddd;">№ ${sample.sampleNumber}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${sample.client}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${sample.site}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${sample.concreteType}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${days} jours</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${format(testDate, 'dd/MM/yyyy')}</td>
                    <td style="padding: 10px; border: 1px solid #ddd; color: #dc2626; font-weight: bold;">${daysOverdue} jours</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        `;
      }

      const html = `
        ${emailContent}
        <p style="margin-top: 20px; color: #666;">
          Cet email est envoyé automatiquement par le système de gestion du laboratoire de béton.
        </p>
      `;

      await transporter.sendMail({
        from: 'Laboratoire de Béton <laboratoire.beton.notification@gmail.com>',
        to: NOTIFICATION_EMAILS.join(', '),
        subject: `Tests de Béton - Rapport Journalier ${format(today, 'dd/MM/yyyy')}`,
        html
      });
    }

    return null;
  });
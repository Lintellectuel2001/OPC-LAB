import { isToday, isSameDay } from 'date-fns';

export type TestNotification = {
  sampleNumber: string;
  days: number;
  date: Date;
};

export function checkDueTests(samples: any[]): TestNotification[] {
  const today = new Date();
  const notifications: TestNotification[] = [];

  samples.forEach(sample => {
    const testDates = [
      { days: 7, date: new Date(sample.day7Date), result: sample.day7Result },
      { days: 14, date: new Date(sample.day14Date), result: sample.day14Result },
      { days: 28, date: new Date(sample.day28Date), result: sample.day28Result }
    ];

    testDates.forEach(({ days, date, result }) => {
      if (isSameDay(date, today) && result === null) {
        notifications.push({
          sampleNumber: sample.sampleNumber,
          days,
          date
        });
      }
    });
  });

  return notifications;
}
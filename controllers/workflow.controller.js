import { createRequire } from 'module';
import dayjs from 'dayjs';
const require = createRequire(import.meta.url);
const { serve } = require('@upstash/workflow/express');

import Subscription from '../models/subscription.model.js';


const REMINDERS = [7, 5, 2, 1]; // Days before renewal to send reminders

export const sendReminders = serve(async (context) => {
    const { subscriptionId } = context.requestPayload;
    const subscription = await fetchSubscription(context, subscriptionId);

    if (!subscription || subscription.status !== 'active') return;

    // Send reminder logic here
    const renewalDate = dayjs(subscription.renewalDate);
    if (renewalDate.isBefore(dayjs())) {
        // Subscription has expired, no need to send a reminder
        context.log(`Renewal date has passed for subscription ${subscriptionId}. Stopping workflow.`);
        return;
    }

    for (const daysBefore of REMINDERS) {
        const reminderDate = renewalDate.subtract(daysBefore, 'day');
        // renewal date = 22 feb, reminder date = 15 feb, 17, 20, 21
        if (reminderDate.isAfter(dayjs())) {
            await sleepUntilReminder(context, `Reminder ${daysBefore} days before`, reminderDate);
        }

        await triggerReminder(context, `Reminder ${daysBefore} days before`);
    }
});

const fetchSubscription = async (context, subscriptionId) => {
    return await context.run('get subscription', async () => {
        return Subscription.findById(subscriptionId).populate('user', 'name email');
    });
}

const sleepUntilReminder = async (context, label, date) => {
    console.log(`Sleeping until ${label} reminder at ${date}`);
    await context.sleepUntil(label, date.toDate());
}

const triggerReminder = async (context, label) => {
    return await context.run(label, () => {
        console.log(`Triggering ${label} reminder`);
        // send email, sms, push notification, etc.
        // it could be anything we want to run periodically
    })
}


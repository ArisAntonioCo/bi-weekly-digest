# Newsletter Cron Job Setup

This application uses Vercel's cron job feature to automatically send newsletters on a schedule. Due to Vercel's free plan limitations (2 cron jobs max), we've implemented a two-tier approach.

## Configuration

### 1. Production Cron Job
- **Schedule**: Every Monday at 9:00 AM UTC (`0 9 * * 1`)
- **Endpoint**: `/api/cron/newsletter`
- **Purpose**: Sends the weekly newsletter to all active subscribers
- **Recipients**: All active subscribers in the database

### 2. Test Cron Job
- **Schedule**: Daily at 9:00 AM UTC (`0 9 * * *`)
- **Endpoint**: `/api/cron/test`
- **Purpose**: Daily testing to verify the system works correctly
- **Recipients**: Fixed test emails (kulaizki@gmail.com, arisantonioco@gmail.com)

## Environment Variables

Add the following to your `.env.local` and Vercel environment variables:

```bash
# Generate a secure random string
CRON_SECRET=your_secure_random_string_here
```

Generate a secure secret:
```bash
openssl rand -base64 32
```

## How It Works

### Database-Driven Scheduling
While Vercel cron jobs run on fixed schedules, our system uses database configuration to determine whether to actually send newsletters:

1. **Cron triggers** at the configured time in `vercel.json`
2. **API checks database** for schedule configuration
3. **Determines if should send** based on:
   - Is schedule active?
   - Is it the right day/time based on frequency settings?
   - When was the last newsletter sent?
4. **Sends newsletter** if conditions are met

### Testing Features

#### 1. Automated Daily Test
- Runs every day at 9:00 AM UTC
- Sends to test recipients only
- Helps verify system health without waiting for weekly schedule

#### 2. Manual Test Button
- Available in the admin panel
- Sends test email to admin immediately
- Located at `/newsletter/schedule`

#### 3. Manual Trigger Button
- "Send Now" button in the testing section
- Sends to test recipients immediately
- Useful for immediate testing

## Admin Interface

The schedule page (`/newsletter/schedule`) provides:

1. **Schedule Configuration**
   - Set frequency (daily, weekly, biweekly, monthly)
   - Choose specific day and time
   - Enable/disable schedule

2. **Testing Tools**
   - Test button: Sends test to admin email
   - Send Now button: Immediate test to fixed recipients
   - Visual feedback for all operations

3. **Status Information**
   - Current schedule summary
   - Testing information panel
   - Next scheduled send time

## Deployment

1. Ensure `CRON_SECRET` is set in Vercel environment variables
2. Deploy to Vercel
3. Vercel will automatically register the cron jobs from `vercel.json`
4. Configure schedule in admin panel
5. Use test features to verify setup

## Monitoring

### Vercel Dashboard
- Monitor cron job executions in Vercel dashboard
- Check function logs for debugging

### Admin Panel
- View sent newsletters in `/blogs` (marked with [TEST] for test sends)
- Check schedule configuration status

### Database
The `newsletter_schedule` table tracks:
- `is_active`: Whether schedule is enabled
- `frequency`: How often to send
- `last_sent_at`: Last successful send
- `next_scheduled_at`: Calculated next send time

## Troubleshooting

### Newsletter Not Sending
1. Check if schedule is active in admin panel
2. Verify `CRON_SECRET` is set correctly
3. Check Vercel function logs for errors
4. Ensure database has correct schedule configuration

### Test Emails Not Received
1. Check spam/junk folders
2. Verify Resend API key is valid
3. Check recipient email addresses are correct
4. Review Vercel function logs for send errors

### Cron Job Not Running
1. Verify deployment succeeded in Vercel
2. Check `vercel.json` syntax is correct
3. Ensure you haven't exceeded 2 cron jobs limit
4. Check Vercel dashboard for cron job status
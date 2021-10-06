# sit-booking

Sit Booking Bot

## Disclaimer: It may be illegal to use this script. The author of this script definitely can't be held accountable for whatever you're using it for.

This repo consists of a flutter app and a node script. Firebase is used as database.

The flutter app lets you select what time you want to book slots.

The node project consists of two scripts. One script that resets the password for users that has booked gym slot for the upcoming booking period (starting 00 and 30 over every hour),
and one script that books the slot at every period (00 and 30 min over every hour). The script books slots 2 days ahead (When SIT opens for booking). Each of these scripts should be ran with some kind of CRON job, either locally or on a cloud architecture-
Make sure that the resetPassword script is executed between 15 to 5 minutes before every period starts.

## Setup
Make sure to add a file called serviceAccount.json with a firebase admin service account in the server folder.

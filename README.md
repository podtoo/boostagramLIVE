# Boostagram.LIVE
Boostagram, is an open-source tool that will allow your fans to send boosts to your show. Our goal is to create boostagram live to be a standalone app, that can accept voice &amp; video messages as well as text messages.

Demo/Development Site: https://Boostagram.live

# Powered by L402 & SecureRSS
Boostagram.live software utilises the L402.org idea, &amp; SecureRSS by PodToo to allow users to boost a podcast.
The L402 idea is that a item is not accessible unless paid for, in this purist form this is what Boostagram LIVE does, it store the boost in the database as pending, and the expire as 5 minutes, if the payment is not made within the 5 minutes the document is deleted from the server. Thus meaning that the comment will not be able to be seen by apps or in your boostagram live dashboard until payment is made.

# Development Stack
This software uses the following software/plugins, note that this may change as development goes.

- noSQL (MongoDB Atlas - FREE VERSION, Firebase)
- nostr+connect (to connect to your wallet)
- NextJS (to make development fast - but might be swapped later)
- MUI (Simple UI interface)
- Docker (we will provide a Dockerfile to make spinning it up easy)

# TO DO LIST
## Basic features
- [x] Setup Page
- [x] MongoDB Integration
- [ ] Firebase Integration (Integrated but not tested - as I don't use Firebase)
- [ ] SQLite
- [x] LNURL lookup Page (.well-known/)
- [x] LNURLP callback Page
- [x] Store internal walletname in the database (Tracking multiple shows via the same server)
- [ ] Integrate option url path
- [ ] Set suggested amount for min-boost (based on boost type)
- [ ] Set boost to private or public (unsure about this idea)
- [ ] Public Boost JSON (allows apps to access episodeGUID comments)
- [x] Dashboard UI
- [x] Admin Login Integration
- [x] LIVE Boost Page
- [x] Demo Payment Page
- [ ] Settings Page
- [ ] Support for audio messages (Will need AWS/GCS)
- [ ] Support for video messages (Will need AWS/GCS)
- [x] Interactive Audio Alerts for boosts (allows you to set different audio sounds depending on type &amp; / or amount of boostagram - BoostagramSF sounds donated by PodToo)


## Social Plugins 
- [ ] nostr-tools (npm package)
- [ ] oAuth (for Mastodon servers)


# Setup instructions .env file

Depending on your database you will need to use one of these in your database you can blank or delete the one you don't use.

Note that the encryption key is generated when you run /setup please copy and past that into the .env file. You will need to restart the app once you have edited the .env file to add the encyption key


```
# DATABASE

DB_TYPE=mongodb
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/<dbname>?retryWrites=true&w=majority
DB_NAME=boostagram

NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# ADMIN AREA
ENCRYPTION_KEY=your-32-byte-hex-key  // IF YOU DON'T MANUALLY CREATE THIS DURING SETUP IT WILL CREATE THIS AND YOU WILL NEED TO ADD IT MANUALLY TO YOUR .ENV FILE OTHERWISE YOUR BOOSTAGRAM LIVE SERVER WON'T WORK.
```


# NGNIX Setup
We use Docker and Dockerfile, you will need to work out how to add your domain to your server, but the way we do it is if the OS has NGINX setup installed with certbot then we create in site-available a new conf called boostagram and then add this to it, note you may want to add more to redirect if user types in www. or goes to http over https this is just a simple example.

```
server {
    listen 443 ssl;
    server_name INSERT YOUR DOMAIN HERE;


    location / {

      # Common headers for all proxied requests
      proxy_pass http://0.0.0.0:9000;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;

      proxy_connect_timeout 60s; // NOTE THESE CAN BE ADJUSTED
      proxy_send_timeout 300; // NOTE THESE CAN BE ADJUSTED
      proxy_read_timeout 300s; // NOTE THESE CAN BE ADJUSTED
    }

    ssl_certificate /etc/letsencrypt/live/(YOUR DOMAIN)/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/(YOUR DOMAIN)/privkey.pem;
}
```
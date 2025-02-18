## Create environment file

Create a `.env` file in this directory with the following lines:

`NEXT_PRIVATE_SPOTIFY_CLIENT_ID=`\
`NEXT_PRIVATE_SPOTIFY_CLIENT_SECRET=`

These values can be accessed from creating a Spotify application in the developer dashboard.

## Run Next.JS App
`npm install` - to install all dependencies.\
`npm run build` - to build the Next.JS app.\
`npm run start` - to start the Next.JS app in production mode.

You can use a process manager like [PM2](https://github.com/Unitech/pm2) to manage this process for you.

If you want to change the port from the default 3000, modify the start command in the `package.json` file. If you wanted to use port `1234`, you would change it to the following:

`"start": "next start -p 1234",`

## Extra Info
NodeJS version I used: `v20.18.0`
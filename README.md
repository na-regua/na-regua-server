# na-regua-server

Na Régua API Server

## Development server

To run the development server, run the following commands:

```bash
$ npm install
$ npm run dev
```

Check de dev.env file to see the environment variables needed to run the server.

## Deploy

The application is hosted on [render](https://na-regua-api.onrender.com/). 

To deploy the application, run the following commands:

```bash
$ npm install
$ npm run build
$ npm run start
$ git subtree push --prefix=dist origin build
```


# Yedidim Bot

This is the a Facebook Bot that communicates with the user, collects all details and opens a call on the server

### Prerequisites

[Firebase Tools](https://github.com/firebase/firebase-tools)

## Create development work space
To create a work space for development, **run only the following commands**

```
npm install expo-cli --global
npm install
cd app || any of the other projects
npm start
```

### Installing

Run npn install in the functions directory and in the app directory

Copy the json key files to the functions directory

### Running the functions emulator locally

```
cd functions
firebase serve --only functions
```

### Deploying to Firebase

```
firebase deploy --only functions
firebase deploy --only hosting
```

### Deploying to Firebase (specific project/instance)

```
firebase functions:config:set instance.name=sandbox2
firebase deploy --only functions  --project sandbox-2
```

## Acknowledgments

This is a StartAch project

# Yedidim Bot

This is the a Facebook Bot that communicates with the user, collects all details and opens a call on the server

### Prerequisites

[Firebase Tools](https://github.com/firebase/firebase-tools)

### Installing

Run npn install in the functions directory and in the app directory

Copy the json key files to the functions directory

### Running the functions emulator locally

```
cd functions
firebase serve --only functions
```

### Running the app locally

```
cd app
npm start
```

### Deploying to Firebase

```
firebase deploy --only functions
firebase deploy --only hosting
```

## Acknowledgments

This is a StartAch project

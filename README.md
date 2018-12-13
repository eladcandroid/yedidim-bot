# Yedidim Bot

This is the a Facebook Bot that communicates with the user, collects all details and opens a call on the server

### Prerequisites

[Firebase Tools](https://github.com/firebase/firebase-tools)

## Create development work space
To create a work space for development -
Run
```
npm install expo-cli --global
```
Run cd to the desired path and then run
```
npm install
```
To run the apps on Android studio Emulator 
Run The emulator and then Run - 
```
react-native run android
```
To run the apps via Expo app on your device -> 
Download expo app to your device
And then run
```
npm start
```
That will give you a link 

Copy the link to the search bar in the expo app

Notice - That your phone need to be on the same network as your computer.

GOOD LUCK ;}

### Installing

Run npm install in the functions directory and in the app directory

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

import { AppRegistry } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import App from './src/App';
import { handleBackgroundMessage } from './src/services/push';
import { name as appName } from './app.json';

// Handle FCM messages when the app is in the background or killed.
// Must be registered outside of React component lifecycle.
messaging().setBackgroundMessageHandler(handleBackgroundMessage);

AppRegistry.registerComponent(appName, () => App);

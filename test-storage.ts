import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';
import { readFileSync } from 'fs';

const config = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf8'));
config.storageBucket = 'gen-lang-client-0069007329.appspot.com';
const app = initializeApp(config);
const storage = getStorage(app);
const testRef = ref(storage, 'test-upload.txt');

console.log("Starting test upload to bucket:", config.storageBucket);

uploadString(testRef, 'test upload content').then(() => {
  console.log("Upload succeeded!");
  return getDownloadURL(testRef);
}).then((url) => {
  console.log("URL:", url);
  process.exit(0);
}).catch((e) => {
  console.error("Upload failed:", e);
  process.exit(1);
});

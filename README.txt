# Your Rating + Upload — starter project

## What it does
- Shows **Your Rating + Upload** and **Cancel** buttons.
- Requests camera permission and shows a live preview.
- Clicking **Your Rating + Upload** captures the current frame, uploads it to this server, then displays a playful score.
- Clicking **Cancel** stops the camera and does not upload anything.

The score is randomly generated for entertainment; it is not an AI analysis of appearance.

## Run locally
1. Install Node.js 18 or newer.
2. Open a terminal in this folder.
3. Run `node server.js`.
4. Open `http://localhost:3000`.

Camera access works on localhost for testing. For people opening a public link, deploy the project to a host that supports Node.js and HTTPS. The deployed site must use HTTPS for camera access.

## Important before sharing
- The upload server saves images in `uploads/` on the server, not automatically to your phone.
- To receive the images on your phone, deploy the server online and sign in to the hosting provider to view/download the `uploads/` files, or add a secure private gallery.
- Explain who receives the images, why, and how long they are kept. Share the link only with people who understand and agree to the upload.
- This starter has no login or deletion dashboard, so do not publish it for real users until you add access controls and a deletion method.
- Do not expose the `uploads/` folder as a public static directory.

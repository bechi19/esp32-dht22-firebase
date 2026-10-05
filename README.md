# ESP32 + DHT22 → Firebase Realtime Database

This project is the original ESP32/DHT22/Firebase project with a multi-page web dashboard added.

## Structure

```text
.
├── config.example.h
├── esp32_dht22_firebase.ino
├── index.html
├── history.html
├── connection.html
├── settings.html
├── about.html
├── css/
│   └── style.css
├── js/
│   └── app.js
└── README.md
```

## Hardware

| DHT22 | ESP32 |
|---|---|
| VCC | 3V3 |
| DATA | GPIO 4 |
| GND | GND |

## Firmware

1. Install the Adafruit DHT sensor library in Arduino IDE.
2. Copy `config.example.h` to `config.h`.
3. Fill in Wi-Fi and Firebase values.
4. Upload `esp32_dht22_firebase.ino` to the ESP32.

The existing firmware reads the DHT22 every 2 seconds and sends:

```json
{
  "humidity": 52.3,
  "temperature": 24.5
}
```

to the Firebase Realtime Database root using HTTP PATCH.

## Web dashboard

Open `index.html`.

Use **Connection** to enter your Firebase host, for example:

`test-1d6cf-default-rtdb.europe-west1.firebasedatabase.app`

The host must not include `https://`.

The dashboard reads:

`https://YOUR_FIREBASE_HOST/.json`

The pages are:

- `index.html` — live dashboard
- `history.html` — chart and readings table
- `connection.html` — Firebase host configuration
- `settings.html` — refresh interval and local-data controls
- `about.html` — project information

The browser stores the Firebase host, settings, and up to 60 recent readings in localStorage.

## GitHub Pages

If this repository is deployed from the repository root, `index.html` can be used directly as the Pages entry point.

If your GitHub Pages setup is configured to deploy `/docs`, move/copy the web files into `/docs` and keep the Arduino firmware outside that folder.

## Security

Do not commit `config.h` or real credentials.

For a real deployment, use appropriate Firebase Authentication and Realtime Database security rules. Public read/write test rules are suitable only for a temporary classroom/simulation setup.


## Firebase preconfiguration

This version is preconfigured for:

`https://test-1d6cf-default-rtdb.europe-west1.firebasedatabase.app`

The web dashboard uses this host automatically unless a different host is explicitly saved in the Connection page.

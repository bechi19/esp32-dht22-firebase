#include <DHT.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include "config.h"

#define DHTPIN 4
#define DHTTYPE DHT22
DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connexion au WiFi...");
  }
  Serial.println("Connecté au WiFi");
  dht.begin();
}

void loop() {
  delay(2000);
  float humidity = dht.readHumidity();
  float temperature = dht.readTemperature();

  if (isnan(humidity) || isnan(temperature)) {
    Serial.println("Échec de la lecture du capteur DHT !");
    return;
  }
  Serial.println("Humidité : " + String(humidity) + "%");
  Serial.println("Température : " + String(temperature) + "°C");

  String url = String("https://") + FIREBASE_HOST + "/.json";
  if (String(FIREBASE_AUTH).length() > 0) url += String("?auth=") + FIREBASE_AUTH;
  String data = "{\"humidity\": " + String(humidity) + ", \"temperature\": " + String(temperature) + "}";

  HTTPClient http;
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  int code = http.PATCH(data);  // PATCH updates keys without wiping the rest of the DB

  if (code > 0) Serial.println("Envoyé, code HTTP : " + String(code));
  else Serial.println("Échec de l'envoi, code : " + String(code));
  http.end();
}

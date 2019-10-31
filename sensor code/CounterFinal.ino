#include <Wire.h>

#define trigPin1 2
#define echoPin1 3
#define trigPin2 4
#define echoPin2 5
#define PIN_NUMBER 6
#define AVERAGE 1

long upper = 150; 
long lower = 2; 
double duration, distance;
long interval = 1000;
unsigned int doppler_div = 19;
unsigned int samples[AVERAGE];
unsigned int x;

void setup() {
  Wire.begin(); // allows for trnsfer to uno
  Serial.begin(9600);
  pinMode(trigPin1, OUTPUT);
  pinMode(echoPin1, INPUT);
  pinMode(trigPin2, OUTPUT);
  pinMode(echoPin2, INPUT);
  pinMode(PIN_NUMBER, INPUT);
    
}

byte a;

/*
 * this function is where the main sensing happens first left sonar is turned on if an object is in range 
 * then the doppler device measures speed if below it is a left pedestrian and otherwise it is a left cyclist.
 * if left ultrasonic not in range then the right ultrasonc is turned on an does the same thing as the 
 * left one did. at the end a byte is sent to the uno with lora shield , the byte is dependant on the type of object 
 * that goes past. then byte a become 0 again and the process starts anew
 */

void loop() {

  bool test = true;
  if( SonarSensor( trigPin1, echoPin1 ) )
  {
    test = false;
    int Speed = Doppler();
    if( Speed <= 12 )
    {
      Serial.println("lp");
      a=1;
      delay(interval);
    }
    else
    {
      Serial.println("lc");
      a=2;
      delay(interval);
    }
  }  
  if( SonarSensor(trigPin2, echoPin2) && test )
  {
    int Speed = Doppler();
    if( Speed <= 12 )
    {
      Serial.println("rp");
      a=3;
      delay(interval);
    }
    else
    {
      Serial.println("rc");
      a=4;
      delay(interval);
    }
  }
  
  Wire.beginTransmission(8);  
  Wire.write(a);               
  Wire.endTransmission();
  delay(500);
  a=0;
}

/*
 * this method returns a bool variable when callled which is true or false 
 * dending on if the ultraasonic device being used is within the upper and l
 * ower values set at the begining of the code
 */
bool SonarSensor(int trigPin,int echoPin )
{
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  duration = pulseIn(echoPin, HIGH);
  distance = (duration/2) / 29.1;
  if( distance <= upper && distance >= lower)
  {
    return true;
  }  
  else
  {
    return false;
  }
}

/*
 * this method returns the speed value of an object
 */

int Doppler()
{
  noInterrupts();
  pulseIn(PIN_NUMBER, HIGH);
  unsigned int pulse_length = 0;
  for (x = 0; x < AVERAGE; x++)
  {
    pulse_length = pulseIn(PIN_NUMBER, HIGH); 
    pulse_length += pulseIn(PIN_NUMBER, LOW);    
    samples[x] =  pulse_length;
  }
  interrupts();

  // Check for consistency
  bool samples_ok = true;
  unsigned int nbPulsesTime = samples[0];
  for (x = 1; x < AVERAGE; x++)
  {
    nbPulsesTime += samples[x];
    if ((samples[x] > samples[0] * 2) || (samples[x] < samples[0] / 2))
    {
      samples_ok = false;
    }
  }

  if (samples_ok)
  {
    unsigned int Ttime = nbPulsesTime / AVERAGE;
    unsigned int Freq = 1000000 / Ttime;
    unsigned int Speed = Freq/doppler_div;
    return Speed;
  }
  else
  {
    return 0;
  }
}

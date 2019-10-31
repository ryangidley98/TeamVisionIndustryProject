/*******************************************************************************
 * Modified by Thomas Laurenson, 2017
 * Specific modifications for use of Dragino LoRaSHield on AU915, sub-band 2
 *
 * Copyright (c) 2015 Thomas Telkamp and Matthijs Kooijman
 *
 * Permission is hereby granted, free of charge, to anyone
 * obtaining a copy of this document and accompanying files,
 * to do whatever they want with them without any restriction,
 * including, but not limited to, copying, modification and redistribution.
 * NO WARRANTY OF ANY KIND IS PROVIDED.
 *
 * This example sends a valid LoRaWAN packet with payload "Hello,
 * world!", using frequency and encryption settings matching those of
 * the (early prototype version of) The Things Network.
 *
 * Note: LoRaWAN per sub-band duty-cycle limitation is enforced (1% in g1,
 *  0.1% in g2).
 *
 * Change DEVADDR to a unique address!
 * See http://thethingsnetwork.org/wiki/AddressSpace
 *
 * Do not forget to define the radio type correctly in config.h.
 *
 *******************************************************************************/

#include <lmic.h>
#include <hal/hal.h>
#include <SPI.h>
#include <Wire.h> 

int p;

int LP = 0;
int LC = 0;
int RP = 0;
int RC = 0; 

// LoRaWAN NwkSKey, network session key
// This is the default Semtech key, which is used by the prototype TTN
// network initially.
static const PROGMEM u1_t NWKSKEY[16] = { 0x06, 0xFA, 0x3C, 0x3E, 0x7E, 0x50, 0x3F, 0x70, 0x30, 0xE3, 0xE6, 0x31, 0x4C, 0xB1, 0x6D, 0xA5 };
//{ 0xC0, 0xD3, 0x43, 0xBA, 0x05, 0x57, 0x92, 0x0C, 0x11, 0x8F, 0x27, 0xF0, 0xFA, 0x8F, 0xB3, 0xBE };

// LoRaWAN AppSKey, application session key
// This is the default Semtech key, which is used by the prototype TTN
// network initially.
static const u1_t PROGMEM APPSKEY[16] = { 0xB0, 0x78, 0xF9, 0x57, 0x5E, 0xBC, 0x5D, 0x38, 0xCE, 0x4D, 0x2E, 0x28, 0xCD, 0xAA, 0xF7, 0x2A };
//{ 0xF1, 0x21, 0x06, 0x38, 0x14, 0x57, 0xB0, 0xEF, 0x64, 0xDB, 0x61, 0x01, 0xFE, 0x43, 0x22, 0x57 };

// LoRaWAN end-device address (DevAddr)
// See http://thethingsnetwork.org/wiki/AddressSpace
static const u4_t DEVADDR = 0x26041A92;
//0x2604191D ; 

// These callbacks are only used in over-the-air activation, so they are
// left empty here (we cannot leave them out completely unless
// DISABLE_JOIN is set in config.h, otherwise the linker will complain).
void os_getArtEui (u1_t* buf) { }
void os_getDevEui (u1_t* buf) { }
void os_getDevKey (u1_t* buf) { }

static osjob_t sendjob;

// Schedule TX every this many seconds (might become longer due to duty
// cycle limitations).
const unsigned TX_INTERVAL = 20;

// Pin mapping
const lmic_pinmap lmic_pins = {
    .nss = 10,
    .rxtx = LMIC_UNUSED_PIN,
    .rst = 9,
    .dio = {2, 6, 7},
};

void onEvent (ev_t ev) {
    Serial.print(os_getTime());
    Serial.print(": ");
    switch(ev) {
        case EV_SCAN_TIMEOUT:
            Serial.println(F("EV_SCAN_TIMEOUT"));
            break;
        case EV_BEACON_FOUND:
            Serial.println(F("EV_BEACON_FOUND"));
            break;
        case EV_BEACON_MISSED:
            Serial.println(F("EV_BEACON_MISSED"));
            break;
        case EV_BEACON_TRACKED:
            Serial.println(F("EV_BEACON_TRACKED"));
            break;
        case EV_JOINING:
            Serial.println(F("EV_JOINING"));
            break;
        case EV_JOINED:
            Serial.println(F("EV_JOINED"));
            break;
        case EV_RFU1:
            Serial.println(F("EV_RFU1"));
            break;
        case EV_JOIN_FAILED:
            Serial.println(F("EV_JOIN_FAILED"));
            break;
        case EV_REJOIN_FAILED:
            Serial.println(F("EV_REJOIN_FAILED"));
            break;
            break;
        case EV_TXCOMPLETE:
            Serial.println(F("EV_TXCOMPLETE (includes waiting for RX windows)"));
            if(LMIC.dataLen) {
                // data received in rx slot after tx
                Serial.print(F("Data Received: "));
                Serial.write(LMIC.frame+LMIC.dataBeg, LMIC.dataLen);
                Serial.println();
            }
            // Schedule next transmission
            os_setTimedCallback(&sendjob, os_getTime()+sec2osticks(TX_INTERVAL), do_send);
            break;
        case EV_LOST_TSYNC:
            Serial.println(F("EV_LOST_TSYNC"));
            break;
        case EV_RESET:
            Serial.println(F("EV_RESET"));
            break;
        case EV_RXCOMPLETE:
            // data received in ping slot
            Serial.println(F("EV_RXCOMPLETE"));
            break;
        case EV_LINK_DEAD:
            Serial.println(F("EV_LINK_DEAD"));
            break;
        case EV_LINK_ALIVE:
            Serial.println(F("EV_LINK_ALIVE"));
            break;
         default:
            Serial.println(F("Unknown event"));
            break;
    }
}

void do_send(osjob_t* j){
    // Check if there is not a current TX/RX job running
    if (LMIC.opmode & OP_TXRXPEND) {
        //Serial.println(F("OP_TXRXPEND, not sending"));
        Serial.print("OP_TXRXPEND, not sending; at freq: ");
        Serial.println(LMIC.freq);        
    } else {
        // Prepare upstream data transmission at the next possible time.
        uint32_t Lped = LP;
        uint32_t Lcyc = LC;
        uint32_t Rped = RP;
        uint32_t Rcyc = RC;
        
        byte payload[8];
        payload[0] = highByte(Lped);
        payload[1] = lowByte(Lped);
        payload[2] = highByte(Lcyc);
        payload[3] = lowByte(Lcyc);
        payload[4] = highByte(Rped);
        payload[5] = lowByte(Rped);
        payload[6] = highByte(Rcyc);
        payload[7] = lowByte(Rcyc); 

        LMIC_setTxData2(1, payload, sizeof(payload), 0);
        Serial.print(F("Packet queued for freq: "));
        Serial.println(LMIC.freq);

        LP = 0;
        LC = 0;
        RP = 0;
        RC = 0;
    }
    // Next TX is scheduled after TX_COMPLETE event.
}

void setup() {
    Wire.begin(8); // ready to recieve trnasfer on channel 8             
    Wire.onReceive(receiveEvent); // when tranfer recieved call receiveEvent method
    Serial.begin(9600);
    Serial.println(F("Starting"));

    #ifdef VCC_ENABLE
    // For Pinoccio Scout boards
    pinMode(VCC_ENABLE, OUTPUT);
    digitalWrite(VCC_ENABLE, HIGH);
    delay(1000);
    #endif

    // LMIC init
    os_init();
    // Reset the MAC state. Session and pending data transfers will be discarded.
    LMIC_reset();

    // Set static session parameters. Instead of dynamically establishing a session
    // by joining the network, precomputed session parameters are be provided.
    #ifdef PROGMEM
    // On AVR, these values are stored in flash and only copied to RAM
    // once. Copy them to a temporary buffer here, LMIC_setSession will
    // copy them into a buffer of its own again.
    uint8_t appskey[sizeof(APPSKEY)];
    uint8_t nwkskey[sizeof(NWKSKEY)];
    memcpy_P(appskey, APPSKEY, sizeof(APPSKEY));
    memcpy_P(nwkskey, NWKSKEY, sizeof(NWKSKEY));
    LMIC_setSession (0x1, DEVADDR, nwkskey, appskey);
    #else
    // If not running an AVR with PROGMEM, just use the arrays directly 
    LMIC_setSession (0x1, DEVADDR, NWKSKEY, APPSKEY);
    #endif

    // THIS IS WHERE THE AUSTRALIA FREQUENCY MAGIC HAPPENS!
    // The frequency plan is hard-coded
    // But the band (or selected 8 channels) is configured here!
    // This is the same AU915 band as used by TTN
    
    // First, disable channels 0-7
    for (int channel=0; channel<8; ++channel) {
      LMIC_disableChannel(channel);
    }
    // Now, disable channels 16-72 (is there 72 ??)
    for (int channel=16; channel<72; ++channel) {
       LMIC_disableChannel(channel);
    }
    // This means only channels 8-15 are up

    // Disable link check validation
    LMIC_setLinkCheckMode(0);

    // Set data rate and transmit power (note: txpow seems to be ignored by the library)
    LMIC_setDrTxpow(DR_SF7,14);

    // Start job
    do_send(&sendjob);
}

void loop() {
  os_runloop_once();
}

/* 
 *  this method is called when a transmission is recieved from arduino nano it reads 
 *  the number and adds one to the variable depending on the number recieved 
 */

void receiveEvent(int howMany) {
  p = Wire.read(); 

  if( p == 1 )
  {
    LP++;
  }
  else if( p == 3 )
  {
    RP++;
  }
  else if( p == 2 )
  {
    LC++;
  }
  else if( p == 4 )
  {
    RC++; 
  }
}

# Kiosk controller (later phase)
ESP32 + ToF (or PIR) sensor -> WebSocket -> React /kiosk.
Also build a keyboard/button fallback that simulates "person detected".
State machine: IDLE -> PERSON_DETECTED -> GREETING -> LISTENING -> PROCESSING -> SPEAKING -> IDLE

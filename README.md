# Drive Me App

Simple app that offers passengers to find drivers for travel between cities in Macedonia (21 cities)
So far only the api is done (no frontend) => nodejs + postgresql


### driver routes:
    POST: __drivers/register__ => driver registration
        required fields
            (body-json) "name":"driver",
                        "surname":"driver",
                        "email":"driver@driver.com",
                        "password":"123456", (>5)
                        "age":"22", (>0 && <150)
                        "driverLicense":"123456789AA",
                        "vehicleType":"audi",
                        "vehicleGas":"12.3",
                        "vehicleYear":"2001",
                        "vehicleSeats":"4"
                                
    POST: __drivers/login__ => driver login
        required fields
            (body-json)  "email":"driver@driver.com",
                         "password":"1234"
     
    GET: __drivers/me__ => get my info (driver)
        required fields
            (headers)   "x-auth":jwt-token
            
    POST: __drivers/trip__ => add new trip
        required fields
            (headers)   "x-auth":jwt-token
            (body-json) "route":"struga-ohrid-resen",
                        "startTime":"100" (minutes)
    
### user routes:
    POST: __users/register__ => user registration
        required fields
            (body-json) "name":"user",
                        "surname":"user",
                        "email":"test@test.com",
                        "password":"123456", (>5)
                        "age":"23"  (>0 && <150)
                        
    POST: __users/login__ => user login
        required fields
            (body-json) "email":"test@test.com",
                        "password":"123456"
### other routes:

### test routes:
for debugging purposes

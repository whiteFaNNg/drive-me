# Drive Me App

Simple app that offers passengers to find drivers for travel between cities in Macedonia (21 cities)
So far only the api is done (no frontend) => _nodejs + postgresql_


### Driver Routes:
_POST_:  ___"/drivers/register"___ => driver registration

required fields:

(body-json) 

    "name":"driver",
    "surname":"driver",
    "email":"driver@driver.com",
    "password":"123456", (>5)
    "age":"22", (>0 && <150)
    "driverLicense":"123456789AA",
    "vehicleType":"audi",
    "vehicleGas":"12.3",
    "vehicleYear":"2001",
    "vehicleSeats":"4"
    
_POST_: ___"/drivers/login"___ => driver login

required fields

(body-json)  

    "email":"driver@driver.com",
    "password":"1234"

_GET_: ___"/drivers/me"___ => get my info (driver)

required fields

(headers)   

    "x-auth":jwt-token

_POST_: ___"/drivers/trip"___ => add new trip

required fields

(headers)   

    "x-auth":jwt-token
    
(body-json) 

    "route":"struga-ohrid-resen",
    "startTime":"100" (minutes)
    
### User Routes:
_POST_: ___"/users/register"___ => user registration

required fields

(body-json) 

    "name":"user",
    "surname":"user",
    "email":"test@test.com",
    "password":"123456", (>5)
    "age":"23"  (>0 && <150)

_POST_: ___"/users/login"___ => user login

required fields

(body-json) 

    "email":"test@test.com",
    "password":"123456"

_GET_: ___"/users/me"___ => get my info (user)

required fields:

(headers)

    "x-auth":jwt-token
    
_POST_: ___"/users/find"___ => find trips/routes

required fields:

(body-json)

    	"startTimeRange":{
    		"from":"110",
    		"to":"999"
    	},
    	"priceRange":{
    		"from":"200",
    		"to":"500"
    	},
    	"destination":{
    		"from":"ohrid",
    		"to":"resen"
    	}
    	
(headers)

    "x-auth":jwt-token
    
_POST_: ___"/users/ticket"___ => reserve new ticket

required fields

(headers)

    "x-auth":jwt-token
    
(body-json)

    	"tripId":"1",
    	"startIndex":"1",
    	"endIndex":"2"
    	
_GET_: ___"/users/ticket"___ => retrieve my tickets

(headers)

    "x-auth":jwt-token
    	
_GET_: ___"/users/ticket/:id"___ => retrieve ticket with the specified id

(headers)

    "x-auth":jwt-token
    
_DELETE_: ___"/users/ticket/:id"___ => delete ticket with the specified id

(headers)

    "x-auth":jwt-token
    
_POST_: ___"/users/ticket/rate/:id"___ => rate ticket(driver) with the specified id

(headers)

    "x-auth":jwt-token
    
(body-json)

    "rating":"4" (>=1 && <=5)
    


### Other Routes:

_GET_: ___"/others/destinations"___ => get top 10 popular destinations

_GET_: ___"/others/age-history"___ => get most travelled age

_GET_: ___"/others/popular-drivers"___ => get most popular drivers by number of passengers transported 

_GET_: ___"/others/best-rated-drivers"___ => get top rated drivers

_GET_: ___"/others/most-experienced-drivers"___ => get most experienced drivers by total distance travelled

### test routes: (for debugging purposes)


const pool = require('./postgres');
const {initMapData} = require('../functions/map-data');

let initSchema = ()=>{
    initUsers();
    initCities();
    initConnections();
    initDrivers();
    initAgeHistory();
//  initPreferences();
    initTrips();
    initTickets();
};

let initUsers = ()=>{
    pool.query('CREATE TABLE IF NOT EXISTS users (' +
        'id serial primary key not null,'+
        'name varchar not null,' +
        'surname varchar,'+
        'email varchar unique not null,'+
        'password varchar,'+
        'token varchar,'+
        'age int)')
        .then(data=>{
            console.log('table >users< created');
        },err=>{
            console.log('error while creating table >users<\n'+err);
            }
        );
};

let initCities = ()=>{
    pool.query('CREATE TABLE IF NOT EXISTS cities ('+
        'id serial primary key not null, '+
        'name varchar unique not null, '+
        'popularity int not null default 0)')
        .then(data=>{
            console.log('Table >cities< created');
            pool.query('SELECT count(*) from cities')
                .then(data=>{
                    if(parseInt(data.rows[0].count)===0){
                       addCities();
                    }
                },err=>{
                    console.log(err);
                })
        },err=>{
            console.log(err);
        });
};

let initConnections = ()=>{
    pool.query('CREATE TABLE IF NOT EXISTS connections ('+
        'id serial primary key not null, '+
        'first int not null, '+
        'second int not null, '+
        'distance int not null, '+
        'time int not null)')
        .then(data=>{
            console.log('table >connections< created');
            pool.query('SELECT count(*) from connections')
                .then(data=>{
                    if(parseInt(data.rows[0].count)===0){
                        addConnections();
                    }else{
                        initMapData();
                    }
                },err=>{
                    console.log(err);
                })
        },err=>{
            console.log('error while creating table >connections<\n'+err);
        });
};

let initDrivers = ()=>{
    pool.query('CREATE TABLE IF NOT EXISTS drivers ('+
        'id serial primary key not null, '+
        'name varchar not null, '+
        'surname varchar not null, '+
        'email varchar unique not null, '+
        'password varchar not null, '+
        'token varchar, '+
        'driver_license varchar not null, '+
        'phone_number varchar not null, '+
        'age int not null, '+
        'short_info text not null, '+
        'vehicle_type varchar not null, '+
        'vehicle_seats int not null, '+
        'vehicle_year int not null, '+
        'vehicle_gas real not null, '+
        'pets boolean not null default false, '+
        'smoking boolean not null default false, '+
        'music boolean not null default false, '+
        'chatty boolean not null default false, '+
        'total_km int not null default 0, '+
        'total_passengers int not null default 0, '+
        'total_rating int not null default 3, '+
        'total_votes int not null default 1 )')
        .then(data=>{
            console.log('table >drivers< created')
        },err=>{
            console.log('error while creating table >drivers<\n'+err);
        });
};

let initAgeHistory = ()=>{
    pool.query('CREATE TABLE IF NOT EXISTS age_history ('+
        'id serial primary key not null, '+
        'total int not null default 0)')
        .then(data=>{
            console.log('table >age_history< created');
            pool.query('SELECT count(*) FROM age_history')
                .then(data=>{
                    if(parseInt(data.rows[0].count)===0){
                        addInitialAgeHistory();
                    }
                },err=>{
                    console.log(err);
                });
        },err=>{
            console.log('error while creating table >age_history<\n'+err);
        })
};

let addInitialAgeHistory = ()=>{
    let qr = 'INSERT INTO age_history (total) VALUES ';
    for(let i = 0;i<149;i++){
        qr+='(0), '
    }
    qr+='(0)';
    pool.query(qr)
        .then(data=>{
            //
        },err=>{
            console.error(err);
        });
};

//unused
let initPreferences = ()=>{
    pool.query('CREATE TABLE IF NOT EXISTS preferences ('+
        'id serial primary key not null, '+
        'driver_id int not null, '+
        'pets boolean not null default false, '+
        'smoking boolean not null default false, '+
        'music boolean not null default false, '+
        'chatty boolean not null default false )')
        .then(data=>{
            console.log('table >preferences< created');
        },err=>{
            console.log('error while creating table >preferences<\n'+err);
        })
};

let initVehicles = ()=>{
    pool.query('CREATE TABLE IF NOT EXISTS vehicles ('+
        'id serial primary key not null, '+
        'type varchar not null,'+
        'year int not null, '+
        'seats int not null, '+
        'gas real not null, '+
        'driver_id int not null )')
        .then(data=>{
            console.log('table >vehicles< created');
        },err=>{
            console.log('error while creating table >vehicles<\n'+err);
        });
};

let addCities = ()=>{
    pool.query("INSERT INTO cities (name) VALUES ('ohrid'),('struga'),('debar'),('kicevo'),('resen'),('bitola'),('prilep'),"+
        "('krusevo'),('gostivar'),('tetovo'),('skopje'),('kumanovo'),('veles'),('kriva palanka'),('stip'),('kocani'),"+
        "('berovo'),('strumica'),('kavadarci'),('demir kapija'),('gevgelija');")
        .then(data=>{
            console.log("cities added");
        },err=>{
            console.log('error while adding cities\n'+err);
        });
};

let addConnections = ()=>{
    pool.query('INSERT INTO connections (first,second,distance,time) VALUES (2,3,52,60), (1,2,15,18), (2,4,62,58), (1,4,62,58), '+
        '(1,5,36,39), (5,6,37,53), (4,6,79,76), (6,8,53,58), (6,7,44,38), (7,8,33,42), (4,8,68,70), (4,9,46,48), (20,21,51,41), '+
        '(9,10,27,25), (10,11,43,42), (11,13,55,48), (11,12,40,40), (12,13,59,50), (12,14,63,60), (12,15,67,66), (7,13,81,78), '+
        '(7,19,48,50), (13,19,43,40), (13,15,44,46), (13,20,60,47), (19,20,30,36), (18,19,85,82), (18,21,48,49), (15,18,66,56), '+
        '(17,18,55,65), (16,17,55,57), (15,16,32,35)')
        .then(data=>{
            console.log('connections added');
            initMapData();
        },err=>{
            console.log('error while adding connections\n'+err);
        })
};

let initTrips = ()=>{
    pool.query('CREATE TABLE IF NOT EXISTS trips ('+
        'id serial primary key not null, '+
        'route varchar not null, '+
        'driver_id int not null, '+
        'start_time int not null, '+
        'end_time int not null, '+
        'finished boolean not null default false)')
        .then(data=>{
            console.log('table >trips< created');
        },err=>{
            console.log('error while creating table >trips<\n'+err);
        })
};

let initTickets = ()=>{
    pool.query('CREATE TABLE IF NOT EXISTS tickets ('+
        'id serial primary key not null, '+
        'start_location varchar not null, '+
        'end_location varchar not null, '+
        'start_position int not null, '+
        'end_position int not null, '+
        'start_time int not null, '+
        'trip_id int not null, '+
        'user_id int not null, ' +
        'rated boolean not null default false)')
        .then(data=>{
            console.log('table >tickets< created');
        },err=>{
            console.log('error while creating table >tickets<\n'+err);
        });
};

module.exports = initSchema;
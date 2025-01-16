import { Eigen } from "Library/services/eigen.service.js";

function main ()
{    
    const pixels =
    [
        { r : 250, g : 250, b : 250 },
        { r : 200, g : 200, b : 200 },
        { r : 150, g : 100, b :  50 }
    ];

    const result = Eigen.getAveragePixelColor( pixels );

    console.log( "Results from Eigen", result );
}

self.onmessage = ev =>
{
    console.log( "[WORKER] I got a message", ev );
    self.postMessage( { message: "I am sending back a message" } );
}

main();

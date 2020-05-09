var AWS = require('aws-sdk'); // Load the AWS SDK for Node.js

AWS.config.update({
    accessKeyId: 'AKIATNEENNUFRCNNE264',                            // Key ID for AWS
    secretAccessKey: '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',    // Secret Key ID for AWS
    region: 'us-east-2'
});

var debug = 1; // Enable 1 for debugging

var refreshButton = document.getElementById("refresh-button"); // Refresh button - click to retrieve info from db
var updateButton = document.getElementById("edit-price");      // Update button - click to send info to db

updateButton.addEventListener("click", function(){        //When update button clicked, this function will fire 
    
    var buttons = []; 
    var input = [];

    buttons[0] = document.getElementById('MP-1-corn');
    buttons[1] = document.getElementById('MP-2-corn');
    buttons[2] = document.getElementById('MP-1-soybean');
    buttons[3] = document.getElementById('MP-2-soybean');
    buttons[4] = document.getElementById('MP-1-wheat');
    buttons[5] = document.getElementById('MP-2-wheat');
    
    input[0] = buttons[0].value;
    input[1] = buttons[1].value;
    input[2] = buttons[2].value;
    input[3] = buttons[3].value;
    input[4] = buttons[4].value;
    input[5] = buttons[5].value;

    var uploadArray = []; // Array of values to be stored in database

    for (j=0; j<6; j++){

            let seller = input[j].split(":")[0];
        
            if (seller == "Heritage Co-op") {

                let price = input[j].split("$")[1];
                uploadArray.push([seller, price]);    
            }
    }

    for (j=0; j<6; j++){

        let seller = input[j].split(":")[0];
    
        if (seller == "LE Sommer") {
            let price = input[j].split("$")[1];
            uploadArray.push([seller, price]);    
        }
    }

    if (debug) console.table(uploadArray);

    setCost('Heritage Co-op', uploadArray); // Upload new info for Heritage Co-op
    setCost('LE Sommer', uploadArray); // Upload new info for LE Sommer
});

refreshButton.addEventListener("click", function(){ //When refresh button clicked, fire these events
    getCost('Heritage Co-op');
    getCost('LE Sommer');
});

var myPriceArray = [0, 0, 0, 0, 0, 0];

function getCost(seller){ // This retrieves data previously that previously exists data in the database

    function displayToProgram(priceArray) {

            if (priceArray[0] < priceArray[3]) {
                document.getElementById("MP-1-corn").value = 'Heritage Co-op'.concat(': $', priceArray[0]);
                document.getElementById("MP-2-corn").value = 'LE Sommer'.concat(': $', priceArray[3]);
            } else {
                document.getElementById("MP-2-corn").value = 'Heritage Co-op'.concat(': $', priceArray[0]);
                document.getElementById("MP-1-corn").value = 'LE Sommer'.concat(': $', priceArray[3]);
            }
            
            if (priceArray[1] < priceArray[4]) {
                document.getElementById("MP-1-soybean").value = 'Heritage Co-op'.concat(': $', priceArray[1]);
                document.getElementById("MP-2-soybean").value = 'LE Sommer'.concat(': $', priceArray[4]);
            } else {
                document.getElementById("MP-2-soybean").value = 'Heritage Co-op'.concat(': $', priceArray[1]);
                document.getElementById("MP-1-soybean").value = 'LE Sommer'.concat(': $', priceArray[4]);
            }

            if (priceArray[2] < priceArray[5]) {
                document.getElementById("MP-1-wheat").value = 'Heritage Co-op'.concat(': $', priceArray[2]);
                document.getElementById("MP-2-wheat").value = 'LE Sommer'.concat(': $', priceArray[5]);
            } else {
                document.getElementById("MP-2-wheat").value = 'Heritage Co-op'.concat(': $', priceArray[2]);
                document.getElementById("MP-1-wheat").value = 'LE Sommer'.concat(': $', priceArray[5]);
            }

            if (debug) console.table(myPriceArray);
    }

    function processResponse(response){

        if (seller == 'Heritage Co-op') { // update the Heritage price in array that will be used to display prices
            myPriceArray[0] = response.corn.toString(10);
            myPriceArray[1] = response.beans.toString(10);
            myPriceArray[2] = response.wheat.toString(10);
        } else if (seller = 'LE Sommer') { // update the LE Sommer price in array that will be used to display prices
            myPriceArray[3] = response.corn.toString(10);
            myPriceArray[4] = response.beans.toString(10);
            myPriceArray[5] = response.wheat.toString(10);
        }
        
        if (seller = 'LE Sommer' && debug) {
            displayToProgram(myPriceArray);
        }
    }

    var ddb = new AWS.DynamoDB.DocumentClient(); //Create new Document Client obj to do GET request

    var params = {

        Key: {
            'Marketplace': seller   
        },
        TableName: 'CNProject',
        AttributesToGet: ["beans", 'corn', "wheat"]
    };

    ddb.get(params, function(err, data) {
        if (err) {
            console.log("Error", err);
        } else {
            if (debug) console.log("Success", data.Item);
            processResponse(data.Item);           
        }
    });
}

function setCost(seller, newInfoArray){ // This fuction updates previously existing data in the database

    var k=0;

    if (seller == "LE Sommer") {
        k = k + 3;
    }

    var newCorn = parseFloat(newInfoArray[k][1]); // Conevert array string to a number
    var newBeans = parseFloat(newInfoArray[k+1][1]);
    var newWheat = parseFloat(newInfoArray[k+2][1]);

    var ddb = new AWS.DynamoDB.DocumentClient(); //Create new Document Client obj to do update request
    
    if (debug) console.log("newBeans");
    if (debug) console.log(newBeans);
    if (debug) console.log("newWheat");
    if (debug) console.log(newWheat);
    if (debug) console.log("newCorn");
    if (debug) console.log(newCorn);
    
    var params = {
    
        TableName: 'CNProject',
        Key: {
            "Marketplace": seller,
        },
        UpdateExpression: "set beans=:r, corn=:p, wheat=:a",
        ExpressionAttributeValues:{
            ":r": newBeans, // Set new value
            ":p": newCorn, // Set new value
            ":a": newWheat // Set new value
        },
        ReturnValues:"UPDATED_NEW"
    };

    ddb.update(params, function(err, data) {
        if (err) {
            console.log("Error", err);
        } else {
            if (debug) console.log("Success", data);           
        }
    });
}
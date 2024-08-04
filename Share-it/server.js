// using express JS
var express = require("express");
var app = express();
var { MongoClient } = require('mongodb');

// express formidable is used to parse the form data values
var formidable = require("express-formidable");
app.use(formidable());

// use mongo DB as database
var mongodb = require("mongodb");
// var mongoClient = mongodb.MongoClient;
var mongoClient = new MongoClient("mongodb://127.0.0.1:27017", { useUnifiedTopology: true });

// the unique ID for each mongo DB document
var ObjectId = mongodb.ObjectId;

// receiving http requests
var httpObj = require("http");
var http = httpObj.createServer(app);

// to encrypt/decrypt passwords
var bcrypt = require("bcrypt");

// to store files
var fileSystem = require("fs");


// to start the session
var session = require("express-session");
app.use(session({
    secret: 'secret key',
    resave: false,
    saveUninitialized: false
}));

// define the publically accessible folders
app.use("/public/css", express.static(__dirname + "/public/css"));
app.use("/public/js", express.static(__dirname + "/public/js"));
app.use("/public/img", express.static(__dirname + "/public/img"));
app.use("/public/font-awesome-4.7.0", express.static(__dirname + "/public/font-awesome-4.7.0"));
app.use("/public/fonts", express.static(__dirname + "/public/fonts"));

// using EJS as templating engine
app.set("view engine", "ejs");

// main URL of website
var mainURL = "http://localhost:3000";

// global database object
var database = null;

// app middleware to attach main URL and user object with each request
app.use(function (request, result, next) {
    request.mainURL = mainURL;
    request.isLogin = (typeof request.session.user !== "undefined");
    request.user = request.session.user;

    // continue the request
    next();
});

// recursive function to get the file from uploaded
function recursiveGetFile (files, _id) {
    var singleFile = null;

    for (var a = 0; a < files.length; a++) {
        const file = files[a];

        // return if file type is not folder and ID is found
        if (file.type != "folder") {
            if (file._id == _id) {
                return file;
            }
        }

        // if it is a folder and have files, then do the recursion
        if (file.type == "folder" && file.files.length > 0) {
            singleFile = recursiveGetFile(file.files, _id);
            // return the file if found in sub-folders
            if (singleFile != null) {
                return singleFile;
            }
        }
    }
}

// recursive function to remove the file and return the updated array
function removeFileReturnUpdated(arr, _id) {
    for (var a = 0; a < arr.length; a++) {
        if (arr[a].type != "folder" && arr[a]._id == _id) {
            // remove the file from uploads folder
            try {
                fileSystem.unlinkSync(arr[a].filePath);
            } catch (exp) {
                // 
            }
            // remove the file from array
            arr.splice(a, 1);
            break;
        }

        // do the recursion if it has sub-folders
        if (arr[a].type == "folder" && arr[a].files.length > 0) {
            arr[a]._id = ObjectId(arr[a]._id);
            removeFileReturnUpdated(arr[a].files, _id);
        }
    }

    return arr;
}

function generateEncryptionKey() {
    const length = Math.floor(Math.random() * 7) + 6; // Random length between 6 and 12
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let key = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        key += characters.charAt(randomIndex);
    }

    return key;
}


//encrypted
function encryptFile(fileData, key) {
    // Convert file data to Buffer
    const bufferData = Buffer.from(fileData);

    // Convert key to Buffer
    const bufferKey = Buffer.from(key);

    // Encrypt file data using XOR operation
    for (let i = 0; i < bufferData.length; i++) {
        bufferData[i] ^= bufferKey[i % bufferKey.length];
    }

    // Return encrypted file data
    return bufferData;
}

//decrypted
function decryptFile(encryptedData, key) {
    // Convert encrypted data to Buffer
    const bufferData = Buffer.from(encryptedData);

    // Convert key to Buffer
    const bufferKey = Buffer.from(key);

    // Decrypt encrypted data using XOR operation
    for (let i = 0; i < bufferData.length; i++) {
        bufferData[i] ^= bufferKey[i % bufferKey.length];
    }

    // Return decrypted file data
    return bufferData;
}





// start the http server
http.listen(3000, function () {
    console.log("Server started at " + mainURL);

    // connect with mongo DB server
    mongoClient.connect( 
        function (error, client) {
        if (error) {
                console.error("Error connecting to MongoDB:", error);
                return;
            }
        // connect database (it will automatically create the database if not exists)
        
        database = client.db("file_transfer");
        console.log("Database connected.");

        
        
//Links related
        app.post("/DeleteLink", async function (request, result) {

            const _id = request.fields._id;

            if (request.session.user) {
                var link = await database.collection("public_links").findOne({
                    $and: [{
                        "uploadedBy._id": ObjectId(request.session.user._id)
                    }, {
                        "_id": ObjectId(_id)
                    }]
                });

                if (link == null) {
                    request.session.status = "error";
                    request.session.message = "Link does not exists.";

                    const backURL = request.header("Referer") || "/";
                    result.redirect(backURL);
                    return false;
                }

                await database.collection("public_links").deleteOne({
                    $and: [{
                        "uploadedBy._id": ObjectId(request.session.user._id)
                    }, {
                        "_id": ObjectId(_id)
                    }]
                });

                request.session.status = "success";
                request.session.message = "Link has been deleted.";

                const backURL = request.header("Referer") || "/";
                result.redirect(backURL);
                return false;
            }

            result.redirect("/Login");
        });

        app.get("/MySharedLinks", async function (request, result) {
            if (request.session.user) {
                var links = await database.collection("public_links").find({
                    "uploadedBy._id": ObjectId(request.session.user._id)
                }).toArray();

                result.render("MySharedLinks", {
                    "request": request,
                    "links": links
                });
                return false;
            }

            result.redirect("/Login");
        });

        //to show the link
        app.get("/SharedViaLink/:hash", async function (request, result) {
            const hash = request.params.hash;

            var link = await database.collection("public_links").findOne({
                "hash": hash
            });

            if (link == null) {
                request.session.status = "error";
                request.session.message = "Link expired.";

                result.render("SharedViaLink", {
                    "request": request
                });
                return false;
            }

            result.render("SharedViaLink", {
                "request": request,
                "link": link
            });
        });

        app.post("/ShareViaLink", async function (request, result) {
            const _id = request.fields._id;

            if (request.session.user) {
                var user = await database.collection("users").findOne({
                    "_id": ObjectId(request.session.user._id)
                });
                var file = await recursiveGetFile(user.uploaded, _id);

                if (file == null) {
                    request.session.status = "error";
                    request.session.message = "File does not exists";

                    const backURL = request.header("Referer") || "/";
                    result.redirect(backURL);
                    return false;
                }

                bcrypt.hash(file.name, 10, async function (error, hash) {
                    hash = hash.substring(10, 20);
                    const link = mainURL + "/SharedViaLink/" + hash;
                    await database.collection("public_links").insertOne({
                        "hash": hash,
                        "file": file,
                        "uploadedBy": {
                            "_id": user._id,
                            "name": user.name,
                            "email": user.email
                        },
                        "createdAt": new Date().getTime()
                    });

                    request.session.status = "success";
                    request.session.message = "Share link: " + link;

                    const backURL = request.header("Referer") || "/";
                    result.redirect(backURL);
                });

                return false;
            }

            result.redirect("/Login");
        });
//additional
        // delete uploaded file
        app.post("/DeleteFile", async function (request, result) {
            const _id = request.fields._id;

            if (request.session.user) {
                var user = await database.collection("users").findOne({
                    "_id": ObjectId(request.session.user._id)
                });

                var updatedArray = await removeFileReturnUpdated(user.uploaded, _id);
                for (var a = 0; a < updatedArray.length; a++) {
                    updatedArray[a]._id = ObjectId(updatedArray[a]._id);
                }

                await database.collection("users").updateOne({
                    "_id": ObjectId(request.session.user._id)
                }, {
                    $set: {
                        "uploaded": updatedArray
                    }
                });

                const backURL = request.header('Referer') || '/';
                result.redirect(backURL);
                return false;
            }

            result.redirect("/Login");
        });

        // download file
        app.post("/DownloadFile", async function (request, result) {
            const _id = request.fields._id;

            var link = await database.collection("public_links").findOne({
                "file._id": ObjectId(_id)
            });
            // using link
            if (link != null) {
                fileSystem.readFile(link.file.filePath, function (error, data) {
                    if (error) {
                        result.json({
                            "status": "error",
                            "message": "Error reading file."
                        });
                    } else {
                        // Decrypt the file data using the user's encryption key
                        const decryptedData = decryptFile(data, request.session.user.encryptionKey);
        
                        result.json({
                            "status": "success",
                            "message": "Download file successfully",
                            "arrayBuffer": decryptedData,
                            "fileType": link.file.type,
                            "fileName": link.file.name
                        });
                    }
                });
                return false;
            }

            if (request.session.user) {

                var user = await database.collection("users").findOne({
                    "_id": ObjectId(request.session.user._id)
                });

                var fileUploaded = await recursiveGetFile(user.uploaded, _id);
                
                if (fileUploaded == null) {
                    result.json({
                        "status": "error",
                        "message": "File is neither uploaded nor shared with you."
                    });
                    return false;
                }

                var file = fileUploaded;
        //By User
                fileSystem.readFile(file.filePath, function (error, data) {
                    if (error) {
                        result.json({
                            "status": "error",
                            "message": "Error reading file."
                        });
                    } else {
                        // Decrypt the file data using the user's encryption key
                        const decryptedData = decryptFile(data, request.session.user.encryptionKey);
        
                        result.json({
                            "status": "success",
                            "message": "Data has been fetched.",
                            "arrayBuffer": decryptedData,
                            "fileType": file.type,
                            "fileName": file.name
                        });
                    }
                });
                return false;
            }

            result.json({
                "status": "error",
                "message": "Please login to perform this action."
            });
            return false;
        });

//Uploading Case
        // view all files uploaded by logged-in user
        app.get("/MyUploads", async function (request, result) {
            if (request.session.user) {

                var user = await database.collection("users").findOne({
                    "_id": ObjectId(request.session.user._id)
                });

                var uploaded = user.uploaded;

                result.render("MyUploads", {
                    "request": request,
                    "uploaded": uploaded
                });
                return false;
            }

            result.redirect("/Login");
        });

        // upload new file
        app.post("/UploadFile", async function (request, result) {
            if (request.session.user) {

                var user = await database.collection("users").findOne({
                    "_id": ObjectId(request.session.user._id)
                });
                
                if (request.files.file.size > 0) {

                    const _id = request.fields._id;

                    var uploadedObj = {
                        "_id": ObjectId(),
                        "size": request.files.file.size, // in bytes
                        "name": request.files.file.name,
                        "type": request.files.file.type,
                        "filePath": "",
                        "createdAt": new Date().getTime()
                    };

                    var filePath = "public/uploads/" + user.email + "/" + new Date().getTime() + "-" + request.files.file.name;
                    uploadedObj.filePath = filePath;

                    if (!fileSystem.existsSync("public/uploads/" + user.email)){
                        fileSystem.mkdirSync("public/uploads/" + user.email);
                    }

                    // Read the file
                    fileSystem.readFile(request.files.file.path, function (err, data) {
                        if (err) throw err;
                        console.log('File read!');

                        const encryptedData = encryptFile(data, user.encryptionKey);

                        // Write the file
                        fileSystem.writeFile(filePath, encryptedData, async function (err) {
                            if (err) throw err;
                            console.log('encrypted file written!');

                            await database.collection("users").updateOne({
                                "_id": ObjectId(request.session.user._id)
                            }, {
                                $push: {
                                    "uploaded": uploadedObj
                                }
                            });

                            request.session.status = "success";
                            request.session.message = "Uploaded successfully";

                            result.redirect("/MyUploads/" + _id);
                        });

                        // Delete the file
                        fileSystem.unlink(request.files.file.path, function (err) {
                            if (err) throw err;
                            console.log('File deleted!');
                        });
                    });
                    
                } else {
                    request.status = "error";
                    request.message = "Please select valid image.";

                    result.render("MyUploads", {
                        "request": request
                    });
                }

                return false;
            }

            result.redirect("/Login");
        });


//Basic Authentication
        // logout the user
        app.get("/Logout", function (request, result) {
            request.session.destroy();
            result.redirect("/");
        });

        // show page to login
        app.get("/Login", function (request, result) {
            result.render("Login", {
                "request": request
            });
        });

        // authenticate the user
        app.post("/Login", async function (request, result) {
            var email = request.fields.email;
            var password = request.fields.password;

            var user = await database.collection("users").findOne({
                "email": email
            });

            if (user == null) {
                request.status = "error";
                request.message = "Email does not exist.";
                result.render("Login", {
                    "request": request
                });
                
                return false;
            }

            bcrypt.compare(password, user.password, function (error, isVerify) {
                if (isVerify) {
                    request.session.user = user;
                    result.redirect("/");

                    return false;
                }

                request.status = "error";
                request.message = "Password is not correct.";
                result.render("Login", {
                    "request": request
                });
            });
        });

        // register the user
        app.post("/Register", async function (request, result) {

            var name = request.fields.name;
            var email = request.fields.email;
            var password = request.fields.password;
            var reset_token = "";
            var isVerified = true;
            var verification_token = new Date().getTime();

            var user = await database.collection("users").findOne({
                "email": email
            });

            var key = generateEncryptionKey();

            if (user == null) {
                bcrypt.hash(password, 10, async function (error, hash) {
                    await database.collection("users").insertOne({
                        "name": name,
                        "email": email,
                        "password": hash,
                        "reset_token": reset_token,
                        "uploaded": [],
                        "isVerified": isVerified,
                        "verification_token": verification_token,
                        "encryptionKey": key
                    }, async function (error, data) {

                        request.status = "success";
                        request.message = "Signed up successfully. You can login now.";

                        result.render("Register", {
                            "request": request
                        });
                        
                    });
                });
            } else {
                request.status = "error";
                request.message = "Email already exist.";

                result.render("Register", {
                    "request": request
                });
            }
        });

        // show page to do the registration
        app.get("/Register", function (request, result) {
            result.render("Register", {
                "request": request
            });
        });

        // home page
        app.get("/", function (request, result) {
            result.render("index", {
                "request": request
            });
        });
    });
});
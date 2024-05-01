const express = require('express');
const cors = require("cors");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')

const crypto = require('crypto');
const mongoose = require('mongoose');

const User = require('./models/Users')

mongoose.connect("mongodb+srv://zachnichols1313:9oSX5pfBMtfmKoxj@cluster0.bmmsdjq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")


const secret = crypto.randomBytes(32).toString('hex')

const app = express();

app.use(express.json());
app.use(cookieParser())
app.use(cors({ credentials: true, origin: "http://localhost:3000" })); 


const salt = bcrypt.genSaltSync(10);

app.post("/register", async (req, res) => {
    const { username, password } = req.body;
    try {
        const userDoc = await User.create ({
            username,
            password: bcrypt.hashSync(password, salt),
        });
        res.json(userDoc)
    } catch (error) {
        console.log(error);
        res.status(400).json(error)
    }
})

app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const userDoc = await User.findOne({ username });
    const passOk = bcrypt.compareSync(password, userDoc.password); 

    if (passOk) {
        jwt.sign({ username, id: userDoc._id}, secret, {}, (err, token) => {
            if (err) throw err;
            res.cookie("token", token).json({
                id: userDoc._id,
                username,
            })
        })
    } else {
    res.status(400).json("Wrong creds");
    }
})


app.post("/logout", (req, res) => {
    res.cookie("token", "").json("ok");
})

app.listen(4000)
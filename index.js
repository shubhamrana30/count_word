const express =  require('express')
const app = express()
const stripeprivatekey="sk_test_51HEnkZCicyXaTSAXf2lpznlbzApAH6jKUDOBZNvIgmBV1RGDVrmrSfrE6d3hekAIFRyv4OJ42Zfe3OfFrDEtidQT00z0TSQlyP"
const stripepublickey="pk_test_51HEnkZCicyXaTSAXzjXy4TS06lX4SL0dVhwM8yiPKNbKOfhUUjKaBnbAIS8AoG2vBCShofphpo2jukwNCgiULHmw00WLhkOxJu"
const path = require('path')
const bodyparser=require('body-parser')
const stripe=require('stripe')(stripeprivatekey)
const cookieparser = require('cookie-parser')
const session = require('express-session')
const fs = require('fs')
const { json } = require('body-parser')

app.set('view engine','ejs')

app.use(bodyparser.urlencoded({extended:false}))
app.use(express.json({limit:"1mb"}));
app.use(express.static('public'))
app.use(cookieparser());
app.use(session(
    {
        secret: 'your secret key',
        resave: true,
        saveUninitialized: true
    }
));
app.use(express.json({limit:"1mb"}));


app.get('/',(req,res)=>{
    if(req.session.user)
    {
        fs.readFile('documents/top_donater.json',(err,data)=>{
            if(err)
                res.status(500).end()
            else
            {
                res.render('home1.ejs',{
                    donaters: JSON.parse(data)
                })
            }
        })
    }
    else
    {
        fs.readFile('documents/top_donater.json',(err,data)=>{
            if(err)
                res.status(500).end()
            else
            {
                res.render('home.ejs',{
                    donaters: JSON.parse(data)
                })
            }
        })
    }
})
app.post('/donate',(req,res)=>{
    res.render('donate.ejs',{
        stripepublickey: stripepublickey
    })
})
app.get('/signin',(req,res)=>{
    if(req.session.user)
    {
        fs.readFile('documents/top_donater.json',(err,data)=>{
            if(err)
                res.status(500).end()
            else
            {
                res.render('home1.ejs',{
                    donaters: JSON.parse(data)
                })
            }
        })
    }
    else
        res.render('signin.ejs',{
            invalid: ""
        })
})
app.post('/loginchk',(req,res)=>{
    const username=req.body.username;
    const password=req.body.password;
    fs.readFile('documents/users.json',(err,data)=>{
        if(err)
            res.status(500).end("<h1>server error</h1>")
        else
        {
            var users=JSON.parse(data)
            flag = false
            users.forEach(element => {
                if(element.username==username && element.password==password)
                    flag=true
            });
            if(flag==true)
            {
                req.session.user={username:username,password:password}
                fs.readFile('documents/top_donater.json',(err,data)=>{
                    if(err)
                        res.status(500).end()
                    else
                    {
                        res.render('home1.ejs',{
                            donaters: JSON.parse(data)
                        })
                    }
                })
            }
            else
                res.render('signin.ejs',{
                    invalid: "invalid username or password"
                })
        }
    })
    
})

app.get('/signup',(req,res)=>{
    res.render('signup.ejs',{
        invalid: ""
    })
})

app.post('/signupchk',(req,res)=>{
    const username = req.body.username
    const password = req.body.password
    fs.readFile('documents/users.json',(err,data)=>{
        if(err)
            res.status(500).end("error while signup")
        else
        {
            const users = JSON.parse(data)
            flag = true
            users.forEach(user=>{
                if(user.username == username)
                {
                    flag = false;
                }  
            })
            if(flag==false)
            {
                res.render('signup.ejs',{
                    invalid: 'same username exist'
                })
            }
            else
            {
                users.push({
                    "username": username,
                    "password": password
                })
                const str = JSON.stringify(users)
                fs.writeFile('documents/users.json',str,(err)=>{
                    if(err)
                        res.status(500).end("error while singup")
                    else
                        res.render('signin.ejs',{
                            invalid: "helo"
                        })
                })
            }
        }
    })
})


app.get('/logout',function(req,res){
    req.session.destroy(function(){
        console.log("user logged out");
        fs.readFile('documents/top_donater.json',(err,data)=>{
            if(err)
                res.status(500).end()
            else
            {
                res.render('home.ejs',{
                    donaters: JSON.parse(data)
                })
            }
        })
    })
})

app.post('/donatefinal',(req,res)=>{
    console.log(req.body.token_id)
    //console.log(req.body.user_info)
    const user_info = req.body.user_info
    //console.log(user_info[0])
    stripe.charges.create({
        description: 'Software development services',
        shipping: {
            name: user_info[0],
            address: {
            line1: user_info[1],
            postal_code: user_info[2],
            city: user_info[3],
            state: user_info[4],
            country: user_info[5],
            },
        },
        amount: parseInt(user_info[6]),
        source: req.body.token_id,
        currency: 'inr'
    }).then(()=>{
        fs.readFile('documents/top_donater.json',(err,data)=>{
            if(err)
                console.log("error while reading doanters file")
            else
            {
                const donaters = JSON.parse(data)
                if(donaters[2].amount<user_info[6])
                {
                    donaters.pop()
                    console.log(user_info[0].toUpperCase())
                    donaters.push({
                        "id": 1,
                        "name": user_info[0].toUpperCase(),
                        "amount": user_info[6]
                    })
                    donaters.sort((e1,e2)=>{
                        return (e2.amount-e1.amount)
                    })
                    const str = JSON.stringify(donaters)
                    fs.writeFile('documents/top_donater.json',str,(err)=>{
                        if(err)
                            console.log("err while writing")
                    })
                }
            }
        })
        console.log('successfully charged')
        res.json({message:"successfully charged"})

    })
    .catch((error)=>{
        console.log(error)
        res.status(500).end()
    })  
})

app.get('/about',(req,res)=>{
   
    fs.readFile('views/about.ejs',(err,data)=>{
        if(err)
            res.status(500).end()
        else
        {
            res.render('about.ejs')
        }
})
})


app.listen(3000,()=>{
    console.log("listening to port 3000")
})


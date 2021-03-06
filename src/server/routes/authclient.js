let router = require("express").Router();
var { fetch } = require("rovel.js");
let auth = require("@utils/auth.js");
const validate = require("validator");
router.use(require("express").json());

router.get("/", async (req, res) => {
 try {
  const key = await auth.getAccess(req.query.code);
  const user = await auth.getUser(key).catch(e => {
   console.log(e);
   return res.redirect("/logout");
  });
  console.log(user.tag);
  /* try{
    fetch(`https://discord.com/api/v7/`)
   }
   catch(e){
    console.log(e);
   }*/
   if(BannedList.includes(user.id)){
    try{
    Users.deleteOne({id: user.id});
    }
    catch(e){}
   }
   if(!BannedList.includes(user.id)){
  Users.findOne({ id: user.id }).then(async result => {
   if (!result) {
    /*
        tempdis = user.discriminator;
        dis = "";
        while (3 - dis.length > 0) {
         dis += "0";
        }
        dis += tempdis;*/
    const User = new Users({
     id: user.id,
     username: user.username,
     discriminator: user.discriminator,
     email: (user.emailId || undefined),
     avatar: (user.avatarHash) ? user.avatarHash : (user.discriminator % 5)
    }).save(async (err, userr) => {
     if (err) return console.log(err);
     fetch(`${process.env.DOMAIN}/api/client/log`, {
      method: "POST",
      headers: {
       "content-type": "application/json"
      },
      body: JSON.stringify({
       "secret": process.env.SECRET,
       "title": `${userr.tag} account created!`,
       "desc": `${userr.tag} (${user.id}) has got a new account automatically on RDL after logining for the first time! So Hey new user **${user.username}**\nWelcome to Rovel Discord List!\nHere you can add your bots, servers, emojis, find your friends, and earn money to vote for your favourite bot!\nSo let's get started on your new journey on RDL!`,
       "owners": user.id,
       "img": user.avatarUrl(128),
       "url": `${process.env.DOMAIN}/users/${user.id}`
      })
     })
     res.cookie('key', key, {
      maxAge: 90 * 3600 * 24 * 1000, //90days
      httpOnly: true,
      secure: true
     });
     
     if (req.cookies["return"]) {
   try {
    await res.cookie("return", req.cookies["return"], { maxAge: 0 });
    await res.redirect(req.cookies["return"]);
   } catch (e) {}
  }
  else {
   await res.redirect("/");
  }
    });
   }
   if (result) {
    fetch(`${process.env.DOMAIN}/api/client/log`, {
     method: "POST",
     headers: {
      "content-type": "application/json"
     },
     body: JSON.stringify({
      "secret": process.env.SECRET,
      "title": `${result.tag} Logined!`,
      "desc": `Hello ${result.tag}!\nWelcome to RDL!`,
      "color": "#1FD816",
      "img": user.avatarUrl(128),
      "owners": user.id
     })
    });
    res.cookie('key', key, {
     maxAge: 90 * 3600 * 24 * 1000, //90days
     httpOnly: true,
     secure: true
    });
    if ((result.email == undefined) && (user.emailId != undefined)) {
     result.email = user.emailId;
     result.save();
    }
    
    if (req.cookies["return"]) {
   try {
    await res.cookie("return", req.cookies["return"], { maxAge: 0 });
    await res.redirect(req.cookies["return"]);
   } catch (e) {}
  }
  else {
   await res.redirect("/");
  }
   }
  })
   }
   else{
    res.cookie('key', key, {
      maxAge: 90 * 3600 * 24 * 1000, //90days
      httpOnly: true,
      secure: true
     });
     
     if (req.cookies["return"]) {
   try {
    await res.cookie("return", req.cookies["return"], { maxAge: 0 });
    await res.redirect(req.cookies["return"]);
   } catch (e) {}
  }
  else {
   await res.redirect("/");
  }
   }
 } catch (e) {
  res.redirect("/");
  console.log(e);
 }
});
router.get("/key", async (req, res) => {
 res.json({ key: req.cookies['key'] || null });
});

router.get("/email", async (req, res) => {
 if (req.query.email) {
  Users.findOne({ id: req.user.id }).then(user => {
   if (user == undefined) {
    res.json({ err: "user_not_found" });
   }
   else {
    if (validate.isEmail(req.query.email) || req.query.email == "undefined") {
     user.email = (req.query.email == "undefined") ? undefined : req.query.email;
     user.save();
     res.json({ email: user.email });
    }
    else {
     res.json({ err: "invalid_email" });
    }
   }
  });
 }
 else {
  Users.findOne({ id: req.user.id }).then(user => {
   if (user == undefined) {
    res.json({ err: "user_not_found" });
   }
   else {
    res.json({ email: user.email });
   }
  });
 }
});

router.get("/user", async (req, res) => {
 if (req.query.key || req.cookies['key']) {
  try {
   const user = await auth.getUser(req.query.key || req.cookies['key']).catch(e => {
    return res.json({ err: "invalid_key" });
   });
   await res.json(user);
  }
  catch {
   res.json({ error: "invalid_key" });
  }
 }
 else res.json({ error: "no_key" });
});
module.exports = router;
module.exports = function(app, fs){
    app.get('/', function(req, res){
        var sess = req.session;
        res.render('index', {
            title: "MY HOMEPAGE",
            length: 5,
            name: sess.name,
            username : sess.username
        })
    });

    app.get('/list', function(req, res){
        fs.readFile(__dirname + "/../data/" + "user.json", 'utf8', function(err, data){
            console.log(data);
            res.end(data);
        })
    });

    app.get('/getUser/:username', function(req, res){
        fs.readFile( __dirname + "/../data/user.json", 'utf8', function (err, data) {
             var users = JSON.parse(data);
             res.json(users[req.params.username]);
        });
     });
 
     app.post('/addUser/:username', function(req, res){
         var result = {};
         var username = req.params.username;

         if(!req.body["password"] || !req.body["name"]){
             result["success"] = 0;
             result["error"] = "invalid request";
             res.json(result);
             return;
         }

         //load data & 중복 검사
         fs.readFile(__dirname + "/../data/user.json", 'utf8', function(err, data){
             var users = JSON.parse(data);
             if(users[username]){
                 //중복 찾음
                 result["success"] = 0;
                 result["error"] = "중복";
                 res.json(result);
                 return;
             }
             //add to data
             users[username] = req.body;

             //data save
             fs.writeFile(__dirname + "/../data/user.json", 
                JSON.stringify(users, null, '\t'), 'utf8', function(err, data){
                    result["success"] = 1;
                    res.json(result);
            });
         });
     });

     app.put('/updateUser/:username', function(req, res){
         var result = {};
         var username = req.params.username;

         if(!req.body["password"] || !req.body["name"]){
             result["success"] = 0;
             result["error"] = "invalid request";
             res.json(result);
             return;
         }

         fs.readFile(__dirname +"/../data/user.json", 'utf8', function(err, data){
             var users = JSON.parse(data);
             //add/modify data
             users[username] = req.body;

             fs.writeFile(__dirname + "/../data/user.json",
                    JSON.stringify(users, null, '\t'), "utf8", function(err, data){
                result = {"success" : 1};
                res.json(result);
                    })
         })
     })

     app.delete('/deleteUser/:username', function(req, res){
         var result = {};
         fs.readFile(__dirname + "/../data/user.json", "utf8", function(err, data){
             var users = JSON.parse(data);

             //if not found
             if(!users[req.params.username]){
                 result["success"] = 0;
                 result["error"] = "not found"
                 res.json(result);
                 return;
             }
             delete users[req.params.username];
             fs.writeFile(__dirname + "/../data/user.json",
                    JSON.stringify(users, null, '\t'), "utf8", function(err, data){
                    result["success"] = 1;
                    res.json(result);
                    return;
                    })
         })
     })

     //login get
     app.get('/login/:username/:password', function(req, res){
         var sess;
         sess = req.session;
         var username = req.params.username;
         var password = req.params.password;
         var result = {};

         fs.readFile(__dirname + "/../data/user.json", "utf8", function(err, data){
             var users = JSON.parse(data);
             if(!users[username]){
                 //not found
                 result["success"] = 0;
                 result["error"] = "not found";
                 res.json(result);
                 return;
             }
             if(users[username]["password"] == password){
                 result["success"] = 1;
                 sess.username = username;
                 sess.name = users[username]["name"];
                 res.json(result);
             }else{
                 result["success"] = 0;
                 result["error"] = "incorrect";
                 res.json(result);
             }
         })
     })

     //logout
     app.get('/logout', function(req, res){
         sess = req.session;
         if(sess.useraname){
             req.session.destory(function(err){
                 if(err) console.log(err);
                 else res.redirect('/');
             })
         }else{
             res.redirect('/');
         }
     })

     //store
     app.get('/storeList', function(req, res){
        fs.readFile(__dirname + "/../data/" + "store.json", 'utf8', function(err, data){
            console.log(data);
            res.end(data);
        })
    });
     app.put('/buy/:goods/:username', function(req, res){
        var result = {};
         var goods = req.params.goods;
         var username = req.params.username;
         var sess = req.session;
         var cost = 0;

        if(sess.username){
            var items = JSON.parse(fs.readFileSync(__dirname +"/../data/store.json", 'utf8'));
            cost = items[goods]["price"];
            console.log(items)
            console.log("cost : " + cost); //0원으로 들어옴 수정 요함
            fs.readFile(__dirname + "/../data/user.json", "utf8", function(err, data){
                var users = JSON.parse(data);
                if(cost > users[username]["money"]){
                    result["succcess"] = 0;
                    result["error"] = "거지";
                    res.json(result);
                    return
                }

                let a = users[username]["hasItem"];
                
                if(a.includes(goods))
                {
                    result["succcess"] = 0;
                    result["error"] = "부자";
                    res.json(result);
                    return

                a = a.push(goods);
                users[username]["money"] = users[username]["money"] - cost;
                console.log("cost : " + users[username]["money"]);
                fs.writeFile(__dirname + "/../data/user.json",
                            JSON.stringify(users, null, '\t'), "utf8", function(err, data){
                        result = {"success" : 1};
                        res.json(result);
                })

                } else{
                    result["success"] = 0;
                    result["error"] = "please login";
                    res.json(result);
                }      
            })
         }
    })

//board
    app.get('/boardList', function(req, res){
    fs.readFile(__dirname + "/../data/" + "board.json", 'utf8', function(err, data){
        console.log(data);
        res.end(data);
    })
    });

    app.get('/getBoard/:boardid', function(req, res){
    fs.readFile( __dirname + "/../data/board.json", 'utf8', function (err, data) {
            var users = JSON.parse(data);
            res.json(users[req.params.boardid]);
    });
    });

    app.post('/addBoard/:boardid', function(req, res){
        var result = {};
        var boardid = req.params.boardid;
        var sess = req.session;

        if(sess.username){
        fs.readFile(__dirname + "/../data/board.json", 'utf8', function(err, data){
            var lists = JSON.parse(data);
            if(lists[boardid]){
                //중복 찾음
                result["success"] = 0;
                result["error"] = "중복";
                res.json(result);
                return;
            }
            //add to data
            lists[boardid] = req.body;

            //data save
            fs.writeFile(__dirname + "/../data/board.json", 
                JSON.stringify(lists, null, '\t'), 'utf8', function(err, data){
                    result["success"] = 1;
                    res.json(result);
            });
        });    
        }else{
        result["success"] = 0;
        result["error"] = "please login";
        res.json(result);
        }
    });

    app.put('/updateBoard/:boardid/:username', function(req, res){
        var result = {};
        var boardid = req.params.boardid;
        var username = req.params.username;
        var sess = req.session;

        if(sess.username){
            if(sess.username == username){
                fs.readFile(__dirname +"/../data/board.json", 'utf8', function(err, data){
            var lists = JSON.parse(data);
            //add/modify data
            lists[boardid] = req.body;

            fs.writeFile(__dirname + "/../data/board.json",
                    JSON.stringify(lists, null, '\t'), "utf8", function(err, data){
                result = {"success" : 1};
                res.json(result);
                    })
            })
            }else{
            result["success"] = 0;
            result["error"] = "no access";
            res.json(result);
            }
        
        }else{
        result["success"] = 0;
        result["error"] = "please login";
        res.json(result);
        }

    })

    app.delete('/deleteBoard/:boardid', function(req, res){
        var result = {};

        fs.readFile(__dirname + "/../data/board.json", "utf8", function(err, data){
            var lists = JSON.parse(data);

            //if not found
            if(!lists[req.params.boardid]){
                result["success"] = 0;
                result["error"] = "not found"
                res.json(result);
                return;
            }
            delete lists[req.params.boardid];
            fs.writeFile(__dirname + "/../data/board.json",
                JSON.stringify(lists, null, '\t'), "utf8", function(err, data){
                result["success"] = 1;
                res.json(result);
                return;
                })
        })
    })

    // app.get('/result/:money/:username', function(req, res){
    //     var result = {};
    //     fs.readFile(__dirname + "/../data/user.json", "utf8", function(err, data){
    //         var users = JSON.parse(data);
    //         if(!users[req.params.username]){
    //             result["success"] = 0;
    //             result["error"] = "not found"
    //             res.json(result);
    //             return;
    //         }
    //         users[username].money += money;
    //         fs.write(__dirname + "/../data/user.json", 
    //             JSON.srtringify(users, null, '\t'), "utf8", function(err, data){
    //             result["success"] = 1;
    //             res.json(result);
    //             return;
    //         })
    //     })
    // })
}
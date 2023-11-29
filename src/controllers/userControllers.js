const userDatabase = require("../../database");
//afterAll(() => userDatabase.end());

const getUsers = (req, res) => {
    userDatabase
    .query("select * from users")
    .then(([users]) => {
        res.json(users);
        console.log(users);
    })
    .catch((err) => {
        console.error(err);
        res.sendStatus(500);
    })
}

const getUserById = (req, res) => {
    const userId = parseInt(req.params.id);
    userDatabase
        .query("select * from users where id = ?", [userId])
        .then(([users]) => {
           if(users[0] != null){
            res.json(users[0]);
           } else {
            console.log(userId)
            res.sendStatus(404);
            
           }
        })
        .catch((err) => {
            console.error(err);
            res.sendStatus(500);
        })
}

const postUser = (req, res) => {
    const { firstname, lastname, email, city, language } = req.body;
    userDatabase
    .query("INSERT INTO users(firstname, lastname, email, city, language) VALUES (?, ?, ?, ?, ?)",
    [firstname, lastname, email, city, language]
    )
    .then(([result]) => {
        res.status(201).send({id: result.insertId});
    })
    .catch((err) => {
        console.error(err);
        res.sendStatus(500);
    })
}

const updateUser = (req, res) => {
    const id = parseInt(req.params.id);
    const { firstname, lastname, email, city, language } = req.body;
    
    userDatabase
    .query("update users set firstname = ?, lastname = ?, email = ?, city = ?, language = ? where id = ?",
    [firstname, lastname, email, city, language, id]
    )
    .then(([result]) => {
        if(result.affectedRows === 0){
            res.sendStatus(404);
        } else{
            res.sendStatus(204);
        }
    })
    .catch((err) => {
        console.error(err);
        res.sendStatus(500);
    })
}

const deleteUser = (req, res) => {
    const id = parseInt(req.params.id);

    userDatabase
        .query("delete from users where id = ? ", [id])
        .then(([result]) => {
            if(result.affectedRows === 0){
                res.sendStatus(404);
            } else {
                res.sendStatus(204);
            }
        })
        .catch((err) => {
            console.error(err);
            res.sendStatus(500);
        })
}


module.exports = {
    getUsers,
    getUserById,
    postUser,
    updateUser,
    deleteUser
  };
  

  
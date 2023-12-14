const express = require('express');
const app = express();
const port = 8080;
const path = require('path');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const session = require('express-session');


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

const connection = mysql.createConnection({
  host: '192.168.1.161',
  user: 'petr.vavra',
  password: 'petrvavra2000',
  database: 'checklist',
  port: 3001,
});

connection.connect();
//-------------------------------------------
app.use(session({
  secret: 'Č48r4kad48r4k4',
  resave: false,
  saveUninitialized: true
  }));
//-------------------------------------------
app.post('/', (req, res) => {
  const task = req.body.task;
  const deadline = req.body.deadline;
  const priority = req.body.priority;

  connection.query(
    'INSERT INTO tasks (tasks, deadline, priority) VALUES (?, ?, ?)',
    [task, deadline, priority],
    function (error) {
      if (error) throw error;
      res.redirect('/');
    }
  );
});

app.post('/update/:id', (req, res) => {
  const taskId = req.params.id;
  const isCompleted = req.query.completed === '1'; // Ensure it's '1'

  // Update the task status in the database
  connection.query(
    'UPDATE tasks SET is_completed = ? WHERE id = ?',
    [isCompleted, taskId],
    function (error) {
      if (error) {
        console.error(error);
        res.status(500).send('Error updating task status.');
      } else {
        res.status(200).send('Task status updated.');
      }
    }
  );
});

app.get('/', (req, res) => {
  //---------------------------------------------------------------------------
  if (req.session.username === undefined){                                    //
    res.redirect('/login')                                                    //
  }                                                                           //
  console.log('Ahoj, jsi přihlášen jako ' + req.session.username);            //
  //---------------------------------------------------------------------------

  connection.query('SELECT * FROM tasks', function (error, results) {
    if (error) {
      console.error(error);
      return res.status(500).send('Error retrieving tasks.');
    }

    const tasks = results;
    const todoTasks = tasks.filter((task) => task.is_completed === 0);
    const doneTasks = tasks.filter((task) => task.is_completed === 1);

    res.render('main.ejs', { todoTasks, doneTasks });
  });
});
//--------------------------------------------------------------------------------------------
app.get('/register',(req, res) =>{                                                          //
  res.render("register.ejs")                                                                //
});                                                                                         //
                                                                                            //
app.post('/register',(req, res) =>{                                                         //
  const { prezdivka, heslo, hesloznovu } = req.body;                                        //
                                                                                            //  
                                                                                            //
  connection.query('INSERT INTO register (uzivatelskeJmeno, heslo)VALUES (?, ?)',           //
  [prezdivka, hesloznovu],                                                                  //
  (err, result, fields) => {                                                                //
    if (err) {                                                                              //
      console.error(err);                                                                   //
      return;                                                                               //
    }                                                                                       //
    console.log(result);                                                                    //
    
  });
  res.render("login.ejs");
  
});

app.get('/login', (req, res) =>{
  res.render('login.ejs')
});

app.post('/login', (req, res) => {
  const { prezdivka, heslo } = req.body;

  // Check if username and password match in the database
  connection.query('SELECT * FROM register WHERE uzivatelskeJmeno = ? AND BINARY heslo = ?', [prezdivka, heslo], (error, results, fields) => {
    console.log(prezdivka, heslo);
    if (error) {
      console.error(error);
      res.status(500).send('Chyba při přihlášení.'); // Error handling for database query
    } else {
      if (results.length > 0) {
        req.session.authenticated = true;
        req.session.username = prezdivka;
        res.cookie('username', prezdivka,);
        res.cookie('authenticated', true,);
        res.redirect('/'); // Redirect to main page after successful login
      } else {
        res.send('Nesprávné uživatelské jméno nebo heslo.'); // Incorrect username or password
      }
    }
  });
});

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);                                                                  //
      res.redirect('/');                                                                   //
    } else {                                                                               //
      res.redirect('/login');                                                              //     
    }                                                                                      //
  });                                                                                      //
});                                                                                        //
//-------------------------------------------------------------------------------------------
app.get('/kruh', (req, res) => {

  connection.query("SELECT * FROM canvas_hodnoty WHERE idcanvas_hodnoty = 1",(err, result, fields) => {
        if (err) {
          console.error(err);
          return;
        }
        res.render('canvas.ejs',{result})
  });

app.get('/tasks', (req, res) => {
  connection.query('SELECT * FROM tasks', function (error, results) {
    if (error) {
      console.error(error);
      res.status(500).json({ error: 'Error retrieving tasks.' });
    } else {
      res.status(200).json(results);
    }
  });
});

  
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
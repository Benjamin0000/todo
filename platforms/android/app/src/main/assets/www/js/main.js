//create database.
var db_name = 'task';
var db_version = '1.0';
var db_describe = 'Task DB';
var db_size = 20000000;
var db = openDatabase(db_name, db_version, db_describe, db_size, function(db) {
    console.log(db);
    console.log("Database opened Successfully! Or created for the first time !");
    createTable(db);
});
function Uni_id()
{
    return Date.now();
}
displayNotes(db);
function createTable(db) {
    db.transaction(function(tx) {
        tx.executeSql('CREATE TABLE IF NOT EXISTS notes(id int primary key, data text, status int)', [], function(transaction, result) {
            console.log(result);
            console.log('Table created Successfully!');
        }, function(transaction, error) {
            console.log(error);
        });
    }, transError, transSuccess);
}

function transError(t, e) {
    console.log(t);
    console.log(e);
    console.error("Error occured ! Code:" + e.code + " Message : " + e.message);
}

function transSuccess(t, r) {
    console.info("Transaction completed Successfully!");
    console.log(t);
    console.log(r);
}

function insertRecords(db, note) {
    if (db) {
        db.transaction(function(tx) {
            tx.executeSql('insert into notes(id, data, status) values(?,?,?)', [Uni_id(), note, 0], function(transaction, result) {
                window.ID = result.id;
            }, function(transaction, error) {
                console.log(error);
            });
        }, transError, transSuccess);
    } else {
        console.log('No Database man! wait creating it for you!');
    }
}

function displayNotes(db) {
    db.transaction(function(tx) {
        tx.executeSql("SELECT id, data, status FROM notes", [], function(sqlTransaction, sqlResultSet) {
            var rows = sqlResultSet.rows;
            var len = rows.length;
            for (var i = 0; i < len; i++) {
                var cur_item = rows[i]; // or u can use the item methid ---> var cur_item = rows.item(i);
                var li = document.createElement("li");
                var t = document.createTextNode(cur_item.data);
                if(cur_item.status == 1){
                    li.classList.add('checked');
                }
                li.appendChild(t);
                document.getElementById("myUL").appendChild(li);
                var span = document.createElement("SPAN");
                var txt = document.createTextNode("\u00D7");
                span.className = "close";
                span.id = cur_item.id;
                span.appendChild(txt);
                li.appendChild(span);
                span.onclick = function () {
                    var div = this.parentElement;
                    div.style.display = "none";
                    deleteNote(db, this.id);
                };
                li.onclick = function(){
                    var status = 1;
                    if(li.classList.contains('checked')){
                        status = 0;
                    }
                    console.log(this.childNodes[1]);
                    UpdateNote(db, status, this.childNodes[1].id);
                }
            }
        }, function(sqlTransaction, sqlError) {
            switch (sqlError.code) {
                case sqlError.SYNTAX_ERR:
                    console.error("Syntax error has occurred. " + sqlError.message);
                    break;
                default:
                    console.error("Other error");
            }
        });
    }, transError, transSuccess);
}

function UpdateNote(db, status, id) {
    db.transaction(function(tx) {
        tx.executeSql('update notes set status=? where id=?', [status, id], function(transaction, result) {
            console.info('Record Updated Successfully!');
        }, function(transaction, error) {
            console.log(error);
        });
    }, transError, transSuccess);
}

function deleteNote(db,id) {
    db.transaction(function(tx) {
        tx.executeSql('delete from notes where id=?', [id], function(transaction, result) {
            console.log(result);
            console.info('Record Deleted Successfully!');
        }, function(transaction, error) {
            console.log(error);
        });
    }, transError, transSuccess);
}
// Add a "checked" symbol when clicking on a list item

if(document.querySelector('ul')){
    var list = document.querySelector('ul');
    list.addEventListener('click', function (ev) {
        if (ev.target.tagName === 'LI') {
            ev.target.classList.toggle('checked');
        }
    }, false);
}

// Create a new list item when clicking on the "Add" button
function newElement() {
    var li = document.createElement("li");
    var inputValue = document.getElementById("myInput").value;
    if (inputValue == '') {
        alert("You must write something!");
        return; //kil the script
    }
    db.transaction(function(tx) {
        var id = Uni_id();
        tx.executeSql('insert into notes(id, data, status) values(?,?,?)', [id, inputValue, 0], function(transaction, result) {    
            var t = document.createTextNode(inputValue);
            li.appendChild(t);
            document.getElementById("myUL").appendChild(li);    
            document.getElementById("myInput").value = "";
            var span = document.createElement("SPAN");
            var txt = document.createTextNode("\u00D7");
            span.className = "close";
            span.appendChild(txt);
            span.id = id;
            span.onclick = function () {
                var div = this.parentElement;
                div.style.display = "none";
                deleteNote(db,id)
            }
            li.appendChild(span);
            li.onclick = function(){
                var status = 1;
                if(li.classList.contains('checked')){
                    status = 0;
                }
                UpdateNote(db, status, id);
            }
        }, function(transaction, error) {
            console.log(error);
        });
    }, transError, transSuccess);

}
if(document.getElementById('add_list')){
    document.getElementById('add_list').addEventListener('click', function(e){
        newElement();
    });
}
// Create a "close" button and append it to each list item
// var myNodelist = document.getElementsByTagName("LI");
// for (var i = 0; i < myNodelist.length; i++) 
// {
//     var span = document.createElement("SPAN");
//     var txt = document.createTextNode("\u00D7");
//     span.className = "close";
//     span.appendChild(txt);
//     myNodelist[i].appendChild(span);
// }
//get the close && delete button
var exit_btn = document.getElementsByClassName("close");
for (var i = 0; i < exit_btn.length; i++) {
    exit_btn[i].onclick = function () {
        //delete task from db.
        var div = this.parentElement;
        div.style.display = "none";
        deleteNote(db, exit_btn[i].id);
    }
}
//setting default values for initial app launch
if(!localStorage.getItem("app_background")){
    localStorage.setItem("app_background", " ");
}
if(!localStorage.getItem("todo_background_color")){
    localStorage.setItem("todo_background_color", "red");
}
if(!localStorage.getItem("text_color")){
    localStorage.setItem("text_color", '');
}
if(document.getElementById("myDIV")){
    document.getElementById("myDIV").style.backgroundColor = localStorage.getItem("todo_background_color");
}
//update the UI Imediatly from storage
document.getElementById("body").style.backgroundColor = localStorage.getItem("app_background");
document.getElementById("body").style.color = localStorage.getItem("text_color");
//making sure the users in the settings page
if(document.getElementById('settings')){
    var app_background = document.getElementById('app-background');
    var todo_title_background = document.getElementById('todo_title_background');
    var text_color = document.getElementById('text-color');

    text_color.value = localStorage.getItem("text_color");
    app_background.value =  localStorage.getItem("app_background");
    todo_title_background.value = localStorage.getItem("todo_background_color");
    //updat the ui once it is clicked
    document.getElementById("update_settings").addEventListener('click', function(e){
        e.preventDefault();
        localStorage.setItem("app_background", app_background.value);
        localStorage.setItem("todo_background_color", todo_title_background.value);
        localStorage.setItem("text_color", text_color.value);
        document.getElementById("body").style.backgroundColor = app_background.value;
        document.getElementById("body").style.color  = text_color.value;
    });
}





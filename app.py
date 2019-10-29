
from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3 as sql
from pprint import pprint
import smtplib, ssl

port = 465  # For SSL
smtp_server = "smtp.gmail.com"
sender_email = "aaronalmeida19@gmail.com"  # Enter your address
receiver_email = "aaronalmeida19@gmail.com"  # Enter receiver address
password = "qpalzm12#"

app = Flask(__name__)
cors = CORS(app)

@app.route('/')
def hello_world():
    return 'Hello, World!'

@app.route('/login',  methods=['POST'])
def login():
    user_name = request.form['user_name']
    password = request.form['password']
    
    con = sql.connect("ip.db")
    con.row_factory = sql.Row

    cur = con.cursor()
    cur.execute("select * from users WHERE user_name=?;",(user_name,))

    rows = cur.fetchall()

    if(len(rows)==0):
        return "no user"
    else:
        row =rows[0]
        password_db=row["password"]
        user_type=row["type"]

        if password ==password_db:
            return user_type
        else:
            return "incorrect password"

    return ""


@app.route('/book_appointment',  methods=['POST'])
def book_appointment():
    name = request.form['name']
    phone = request.form['phone']
    datepicker = request.form['datepicker']
    time = request.form['time']
    message = request.form['message']
    doctor = request.form['doctor']
    
    with sql.connect("ip.db") as con:
            cur = con.cursor()
            cur.execute("select * from appointments where date = ? and name=? and time=?;", (datepicker,name,time,))
            rows = cur.fetchall()
            if(len(rows)>0):
                return "cannot book an appointment for patient"

    with sql.connect("ip.db") as con:
            cur = con.cursor()
            cur.execute("select * from appointments where date = ? and doctor=? and time=?;", (datepicker,doctor,time,))
            rows = cur.fetchall()

            if(len(rows)>0):
                return "cannot book an appointment for doctor"
            else:
                cur.execute("INSERT INTO appointments (name,phone,date,message,doctor,time) VALUES (?,?,?,?,?,?);",(name,phone,datepicker,message,doctor,time))
                con.commit()
                    
                message="Appointment has been booked"
                context = ssl.create_default_context()
                with smtplib.SMTP_SSL(smtp_server, port, context=context) as server:
                    server.login(sender_email, password)
                    server.sendmail(sender_email, receiver_email, message)


    return 'thanks for booking'


@app.route('/get_appointments',  methods=['GET'])
def get_appointments():
    user_name = request.args['user_name']
    user_type = request.args['type']
      
    con = sql.connect("ip.db")
    con.row_factory = sql.Row

    cur = con.cursor()

    if (user_type == "patient"):
        cur.execute("select * from appointments where name = ?;", (user_name,))
    else:
        cur.execute("select * from appointments where doctor = ?;", (user_name,))
    
    ret = []
    rows = cur.fetchall()
    for row in rows:
        r = {
                "name": row["name"],
                "phone": row["phone"],
                "date": row["date"],
                "message": row["message"],
                "doctor": row["doctor"],
                "time": row["time"],
                }
        ret.append(r)

    return jsonify(ret)

@app.route('/register_appointment',  methods=['POST'])
def register_appointment():
    user_name = request.form['user_name']
    password = request.form['password']
    name = request.form['name']
    user_type =request.form['type']
    
    with sql.connect("ip.db") as con:
            cur = con.cursor()
            cur.execute("INSERT INTO users (user_name,password,name,type) VALUES (?,?,?,?);",(user_name,password,name,user_type,))
            con.commit()

    return 'thanks for registering'


@app.route('/cancel_appointment',  methods=['POST'])
def cancel_appointment():
    name = request.form['name']
    date = request.form['date']
    doctor = request.form['doctor']
    
    
    with sql.connect("ip.db") as con:
            cur = con.cursor()
            cur.execute("DELETE FROM appointments WHERE name = ? and date = ? and doctor = ?;", (name,date,doctor))

            con.commit()

    return 'OK - via AJAX python'

if __name__ == "__main__":
    app.run()


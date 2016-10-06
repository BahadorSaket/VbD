import csv
import json
from numpy import genfromtxt
from numpy import matrix
from numpy import linalg
import numpy as np
from scipy.spatial import distance
from flask import Flask, render_template, redirect, url_for,request
from flask import make_response
from functools import wraps
from flask import request, Response


### AUTHENTICATOR ###
def check_auth(username, password):
    # check if a user/pass combination is valid
    return username == 'bahador' and password == ''

def authenticate():
    # Sends a 401 response that enables basic auth
    return Response(
    'Could not verify your access level for that URL.\n'
    'You have to login with proper credentials', 401,
    {'WWW-Authenticate': 'Basic realm="Login Required"'})

def requires_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth = request.authorization
        if not auth or not check_auth(auth.username, auth.password):
            return authenticate()
        return f(*args, **kwargs)
    return decorated
#####################

app = Flask(__name__)
 
@app.route("/")
def default():
    return "Hello World!"

	
@app.route('/home', methods=['GET', 'POST'])
@requires_auth
def home():
    message = None
    if request.method == 'POST':
        matrixfromjs = request.form['mydata']
        checker=request.form['counter']
        print(checker)
        np.set_printoptions(precision=1)
        matrix = np.asmatrix(genfromtxt('car_real.csv', delimiter=','))
        matrix = matrix.T
				
        if checker=='0':
            result= matrix.tolist()
            result=json.dumps(result) 	
        elif checker=='1':
            output = []
            f = open( 'car.csv', 'rU' ) #open the file in read universal mode
            for line in f:
                 cells = line.split( "," )
                 output.append( ( cells[ 0 ]) ) #since we want the first, second and third column
            f.close()
            result=json.dumps(output) 
           # print(result)
        resp = make_response(result)
        resp.headers['Content-Type'] = "application/json"
        return resp
    return render_template('home.html', message='')
if __name__ == "__main__":
    app.run(host='0.0.0.0', debug = True)

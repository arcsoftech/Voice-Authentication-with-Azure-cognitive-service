"""Name:Wav Converter
Author:Arihant Chhajed
Description:This moudle converts input wav into microsoft supported wav file."""
import os
from subprocess import Popen, PIPE
from flask import Flask, request, send_file
from flask_cors import CORS
from flask_login import LoginManager, UserMixin, login_required
from dotenv import load_dotenv, find_dotenv
import glob

load_dotenv(find_dotenv())
APP = Flask(__name__)
CORS(APP)
login_manager = LoginManager()
login_manager.init_app(APP)
print(os.getenv("USER"))
print(os.getenv("PASSWORD"))


class User(UserMixin):
    # proxy for a database of users
    user_database = {"guest": (os.getenv("USER"), os.getenv("PASSWORD"))}

    def __init__(self, username, password):
        self.id = username
        self.password = password

    @classmethod
    def get(cls, id):
        return cls.user_database.get(id)


@login_manager.request_loader
def load_user(request):
    token = request.headers.get('Authorization')
    try:
        if token is None:
            token = request.args.get('token')

        else:
            token = request.authorization
            username = token['username']
            password = token['password']
            user_entry = User.get(username)
            if (user_entry is not None):
                user = User(user_entry[0], user_entry[1])
                if (user.password == password):
                    return user
        return None
    except:
        return None


@APP.route('/convert', methods=['POST'])
@login_required
def input_wav_2_output_wav():
    """
    Convert input wav file to ms supported wav file.
    """
    print("Request recieved for file conversion")
    if request.data:
        save_path = "temp/"
        files = glob.glob('temp/*')
        for f in files:
            os.remove(f)
        input_file_name = "input"
        file_url = os.path.join(save_path, input_file_name + ".wav")
        print(file_url)
        with open(file_url, "w+b") as file:
            file.write(request.data)

        convert = Popen("ffmpeg -i temp/input.wav -acodec pcm_s16le -ac 1 -ar 16000 temp/output.wav",
                        shell=True, stdin=PIPE, stdout=PIPE, universal_newlines=True)
        newline = os.linesep
        commands = ['y']
        convert.communicate(newline.join(commands))
        if convert.returncode == 0:
            return send_file('temp/output.wav', attachment_filename='ouput.wav')
        return "File conversion failed", 400

    return "No file found", 422


@APP.route('/test', methods=['GET'])
@login_required
def test():
    """
    Test Method
    """
    return "Test Succesfull", 200


if __name__ == "__main__":
    try:
        print("Server started")
        APP.run(host='0.0.0.0', port=80)
        print("app started at port 80")
    except():
        print("An unexpected error occured")

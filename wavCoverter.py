"""Name:Query Interpretor
Author:Arihant Chhajed
Description:This module is for calculation of semantic similarity using bag of word approach
between two sentenses using nltk tools."""
import os
from subprocess import Popen, PIPE
from flask import Flask, request
from flask_cors import CORS
import glob


APP = Flask(__name__)
CORS(APP)


@APP.route('/convert', methods=['POST'])
def input_wav_2_output_wav():
    """
    Convert input wav file to ms supported wav file.
    """
    if request.data:
        save_path = "temp/"
        files = glob.glob('/YOUR/PATH/*')
        for f in files:
            os.remove(f)

        input_file_name = "input"
        file_url = os.path.join(save_path, input_file_name + ".wav")
        with open(file_url, "w+b") as file:
            file.write(request.data)

        convert = Popen("ffmpeg -i temp/input.wav -acodec pcm_s16le -ac 1 -ar 16000 temp/output.wav",
                        shell=True, stdin=PIPE, stdout=PIPE, universal_newlines=True)
        newline = os.linesep
        commands = ['y']
        convert.communicate(newline.join(commands))
        if convert.returncode == 0:
            return "file successfully saved", 200
        return "File conversion failed", 400

    return "No file found", 422


if __name__ == "__main__":
    try:
        print("Server started")
        APP.run(host='0.0.0.0', port=4244)
        print("app started at port 4244")
    except():
        print("An unexpected error occured")

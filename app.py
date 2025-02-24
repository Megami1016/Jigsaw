from flask import Flask, render_template, send_from_directory
import os 
from flask import Flask, jsonify, request, re

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('PictureSelect.html')

def natural_sort_key(s):
    """ファイル名を自然順ソートするためのキーを生成"""
    return [int(text) if text.isdigit() else text.lower() for text in re.split(r'(\d+)', s)]


@app.route('/get_images/<unit>/<character>')
def get_images(unit, character):
    folder_path = os.path.join('static', 'image', unit, character)
    print(f"画像フォルダの確認: {folder_path}")

    if not os.path.exists(folder_path):  
        print("フォルダが存在しません")
        return jsonify([])  

    # 画像ファイルを取得し、自然順ソート
    images = sorted(
        [
            f"/static/image/{unit}/{character}/{file}"
            for file in os.listdir(folder_path)
            if file.lower().endswith(('.jpg', '.png'))
        ],
        key=lambda x: natural_sort_key(x.split('/')[-1])  # ファイル名を基準に自然順ソート
    )

    return jsonify(images)

@app.route('/Jigsaw')
def jigsaw():
    image_url = request.args.get('image')  # クエリパラメータから 'image' を取得
    if image_url:
        print(f"選択された画像 URL: {image_url}")
    else:
        print("画像が選択されていません")
    
    return render_template('Jigsaw.html', image_url=image_url)

if __name__ == '__main__':
    app.run(debug=True)

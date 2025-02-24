from flask import Flask, render_template, send_from_directory
import os 
from flask import Flask, jsonify, request

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('PictureSelect.html')

@app.route('/get_images/<unit>/<character>')
def get_images(unit, character):
    folder_path = os.path.join('static', 'image', unit, character)  # 正しいパスの生成
    print(f"画像フォルダの確認: {folder_path}")  # デバッグ用

    if not os.path.exists(folder_path):  
        print("フォルダが存在しません")  # デバッグ用
        return jsonify([])  

    images = [
        f"/static/image/{unit}/{character}/{file}"  
        for file in os.listdir(folder_path)  
        if file.lower().endswith(('.jpg', '.png'))  # 大文字小文字対応
    ]

    print(f"取得した画像リスト: {images}")  # デバッグ用
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

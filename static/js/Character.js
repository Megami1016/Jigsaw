document.getElementById("Unit").addEventListener("change", function() {
    let CharacterSelect = document.getElementById("Character");
    let selectedCategory = this.value;
    console.log("選択された部隊:", selectedCategory); // デバッグ用

    // キャラの選択肢をクリア
    CharacterSelect.innerHTML = "";

    // 部隊ごとのキャラリスト
    let Character = {
        "第31A部隊": [
            { value: "茅森月歌", text: "茅森月歌" },
            { value: "和泉ユキ", text: "和泉ユキ" },
            { value: "東城つかさ", text: "東城つかさ" },
            { value: "朝倉可憐", text: "朝倉可憐" },
            { value: "逢川めぐみ", text: "逢川めぐみ" },
            { value: "國見タマ", text: "國見タマ" },
            { value: "その他", text: "その他" }
        ],
        "第31B部隊": [
            { value: "蒼井えりか", text: "蒼井えりか" },
            { value: "ビャッコ", text: "ビャッコ" },
            { value: "水瀬いちご", text: "水瀬いちご" },
            { value: "水瀬すもも", text: "水瀬すもも" },
            { value: "樋口聖華", text: "樋口聖華" },
            { value: "柊木梢", text: "柊木梢" },
            { value: "その他", text: "その他" }
        ],
        "第31C部隊": [
            { value: "山脇・ボン・イヴァ―ル", text: "山脇・ボン・イヴァ―ル" },
            { value: "豊後弥生", text: "豊後弥生" },
            { value: "天音巫呼", text: "天音巫呼" },
            { value: "桜庭聖羅", text: "桜庭聖羅" },
            { value: "神崎アーデルハイド", text: "神崎アーデルハイド" },
            { value: "佐月マリ", text: "佐月マリ" },
            { value: "その他", text: "その他" }
        ],
        "第31D部隊": [
            { value: "二階堂三郷", text: "二階堂三郷" },
            { value: "石井色葉", text: "石井色葉" },
            { value: "命吹雪", text: "命吹雪" },
            { value: "伊達朱里", text: "伊達朱里" },
            { value: "室伏理沙", text: "室伏理沙" },
            { value: "瑞原あいな", text: "瑞原あいな" },
            { value: "その他", text: "その他" }
        ],
        "第31E部隊": [
            { value: "大島一千子", text: "大島一千子" },
            { value: "大島二似奈", text: "大島二似奈" },
            { value: "大島三野里", text: "大島三野里" },
            { value: "大島四ツ葉", text: "大島四ツ葉" },
            { value: "大島五十鈴", text: "大島五十鈴" },
            { value: "大島六宇亜", text: "大島六宇亜" },
            { value: "その他", text: "その他" }
        ],
        "第31F部隊": [
            { value: "柳美音", text: "柳美音" },
            { value: "丸山奏多", text: "丸山奏多" },
            { value: "華村詩記", text: "華村詩記" },
            { value: "夏目祈", text: "夏目祈" },
            { value: "松岡チロル", text: "松岡チロル" },
            { value: "黒沢真希", text: "黒沢真希" },
            { value: "その他", text: "その他" }
        ],
        "第30G部隊": [
            { value: "白河ユイナ", text: "白河ユイナ" },
            { value: "桐生美也", text: "桐生美也" },
            { value: "小笠原緋雨", text: "小笠原緋雨" },
            { value: "菅原千恵", text: "菅原千恵" },
            { value: "月城最中", text: "月城最中" },
            { value: "蔵里見", text: "蔵里見" },
            { value: "その他", text: "その他" }
        ],
        "第31X部隊": [
            { value: "キャロル・リーパー", text: "キャロル・リーパー" },
            { value: "李映夏", text: "李映夏" },
            { value: "アイリーン・レドメイン", text: "アイリーン・レドメイン" },
            { value: "マリア・デ・アンジェリス", text: "マリア・デ・アンジェリス" },
            { value: "ヴリティカ・バラクリシュナン", text: "ヴリティカ・バラクリシュナン" },
            { value: "シャルロッタ・スコポフスカヤ", text: "シャルロッタ・スコポフスカヤ" },
            { value: "その他", text: "その他" }
        ],
        "司令部": [
            { value: "手塚咲", text: "手塚咲" },
            { value: "七瀬七海", text: "七瀬七海" },
            { value: "浅見真紀子", text: "浅見真紀子" }
        ],
        "AngelBeets": [
            { value: "立華かなで", text: "立華かなで" },
            { value: "仲村ゆり", text: "仲村ゆり" },
            { value: "入江みゆき", text: "入江みゆき" },
            { value: "渕田ひさ子", text: "渕田ひさ子" },
            { value: "関根しおり", text: "関根しおり" },
            { value: "岩沢雅美", text: "岩沢雅美" },
            { value: "芳岡ユイ", text: "芳岡ユイ" },
            { value: "その他", text: "その他" }
        ],
        "キャンサー": [
            { value: "デススラッグ", text: "デススラッグ" },
            { value: "ロータリーモール", text: "ロータリーモール" },
            { value: "レッドクリムゾン", text: "レッドクリムゾン" }
        ],
        "ストーリー限定": [
            { value: "ルミちゃん", text: "ルミちゃん" },
            { value: "シュワシュワ", text: "シュワシュワ" },
            { value: "ネタバレ注意", text: "ネタバレ注意(1~5章前編)" },
            { value: "その他", text: "その他" }
        ]
    };

    // デフォルトの選択肢
    let defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "-- キャラクターを選択 --";
    CharacterSelect.appendChild(defaultOption);

    // 選択されたカテゴリに対応するキャラクターを追加
    console.log("キャラリスト:", Character[selectedCategory]); // デバッグ用
    if (Character[selectedCategory]) {
        Character[selectedCategory].forEach(function(Character) {
            let option = document.createElement("option");
            option.value = Character.value;
            option.textContent = Character.text;
            CharacterSelect.appendChild(option);
        });
    }
});

document.getElementById("Character").addEventListener("change", function() {
    let selectedImage = null;  // 現在選択されている画像
    let unit = document.getElementById("Unit").value;
    let character = this.value;
    let imageContainer = document.getElementById("characterImage");
    console.log("選択したキャラクター:", unit, character);

    // 画像をクリア
    imageContainer.innerHTML = "";

    // キャラが選択されていなければ処理しない
    if (!unit || !character) return;

    // リクエストのURLをログに出力して確認
    let url = `/get_images/${unit}/${character}`;
    console.log("リクエストURL:", url);

    // Flask のエンドポイントにリクエストを送る
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTPエラー: ${response.status}`);
            }
            return response.json();
        })
        .then(images => {
            console.log("取得した画像リスト:", images);

            if (images.length === 0) {
                imageContainer.innerHTML = "<p>画像が見つかりません。</p>";
                return;
            }

            // 画像をループして追加
            images.forEach((imgSrc, index) => {
                console.log("取得した画像src:", imgSrc);
                let imgElement = document.createElement("img");
                imgElement.src = imgSrc;
                imgElement.alt = `${character}の画像 ${index + 1}`;
                imgElement.style.width = "200px";  // 画像サイズを調整
                imgElement.style.margin = "5px";
                imgElement.style.display = "block";  // 画像を表示

                // 画像クリック時の処理
                imgElement.addEventListener("click", function() {
                    // すでに別の画像が選択されている場合、クリックを無効にする
                    if (selectedImage !== null) {
                        selectedImage.style.border = "";  // 以前選択した画像の枠線を削除
                    }

                    // 新しくクリックされた画像が選択される
                    selectedImage = imgElement;
                    imgElement.style.border = "5px solid red";  // 選択された画像に赤い枠をつける

                    // クリックされた画像の URL をログに表示
                    console.log("選択された画像:", imgElement.src);
                });

                // 画像をコンテナに追加
                imageContainer.appendChild(imgElement);
            });
        })
        .catch(error => console.error("画像取得エラー:", error));
        
        // 作戦開始ボタンの処理
        document.getElementById("start").addEventListener("click", function() {
            if (selectedImage !== null) {
                // 選択された画像の URL を取得
                let selectedImageUrl = selectedImage.src;
                console.log("送信する画像の URL:", selectedImageUrl);
        
                // 画像の URL を sessionStorage に保存
                sessionStorage.setItem('selectedImageUrl', selectedImageUrl);
        
                // /Jigsaw に遷移
                window.location.href = '/Jigsaw';
            } else {
                // alert("画像を選択してください。");
            }
        });
});




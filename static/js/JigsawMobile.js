let pieceContainerWidth = 1;//PC-Full時のピース置き場サイズ
let pieceContainerHeight = 1;
let Terminal = 0;
// CSS切り替え関数        
function switchCSS() {
    const width = document.documentElement.clientWidth;
      
    if(width<=750){
        pieceContainerWidth = 0.6;
        pieceContainerHeight = 400;
        Terminal=1;
        console.log(`画面幅: ${width}px - iPhone.css 適用`);
    }else if(750 < width && width <= 800){
        pieceContainerWidth = 200;
        pieceContainerHeight = 1;
        Terminal=0;
    }else if (800 < width && width <= 1300) {
      pieceContainerWidth = 0.8;
      pieceContainerHeight = 500;
      Terminal=1;
    } else if (1300 < width) {
      pieceContainerWidth = 300;
      pieceContainerHeight = 1;
      Terminal=0;
    } 
  }

  // 初期化時とリサイズ時に適用
  document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
      switchCSS();
    }, 100);
  });

  window.addEventListener("resize", () => {
    switchCSS();
  });

// sessionStorage から画像の URL を取得
const selectedImageUrl = sessionStorage.getItem('selectedImageUrl');
// 画像が存在すれば表示する
if (selectedImageUrl) {
    const imageContainer = document.getElementById('image-container');
    const imgElement = document.createElement('img');
    imgElement.src = selectedImageUrl;
    imgElement.alt = "選択された画像";
    imgElement.style.maxWidth = "100%";
    imgElement.style.height = "auto";
    imageContainer.appendChild(imgElement);
} else {
    alert("画像が選択されていません。");
}

// 難易度ごとのランキングデータのキー
const RANKING_KEY = {
    easy: "ranking_easy",
    normal: "ranking_normal",
    hard: "ranking_hard",
    veryHard: "ranking_veryHard"
};

// 難易度ごとのデフォルトランキング（5位までのデフォルトタイム）
const DEFAULT_RANKING = {
    easy: [60, 60, 60, 60, 60],
    normal: [300, 300, 300, 300, 300],
    hard: [1200, 1200, 1200, 1200, 1200],
    veryHard: [3000, 3000, 3000, 3000, 3000]
};

// 初回のみデフォルトのランキングをセット
function initializeRanking() {
    Object.keys(RANKING_KEY).forEach(difficulty => {
        let storedData = localStorage.getItem(RANKING_KEY[difficulty]);

        // データがnull, undefined, 空文字, もしくは無効なJSONの場合にデフォルトをセット
        if (!storedData || storedData === "null" || storedData === "undefined") {
            localStorage.setItem(RANKING_KEY[difficulty], JSON.stringify(DEFAULT_RANKING[difficulty]));
        } else {
            try {
                // データが正しくパースできるか確認し、不正ならデフォルトをセット
                let parsedData = JSON.parse(storedData);
                if (!Array.isArray(parsedData) || parsedData.length !== 5) {
                    throw new Error("Invalid data format");
                }
            } catch (error) {
                localStorage.setItem(RANKING_KEY[difficulty], JSON.stringify(DEFAULT_RANKING[difficulty]));
            }
        }
    });
}
// 初期化処理を実行
initializeRanking();
let currentDifficulty = "easy";
let rows = 3, cols = 5, rotaON = 0; 
const puzzleContainer = document.getElementById("puzzle-container");
let pieces = [];

// 難易度の変更を監視
document.querySelectorAll('input[name="level"]').forEach(radio => {
    radio.addEventListener("change", () => {
        console.log("選択難易度:", radio.value);
        currentDifficulty = radio.value;
        updateRankingDisplay();
        switch(radio.value){
            case "easy":
                rows = 3, cols = 5, rotaON = 0;
                break;
            case "normal":
                rows = 4, cols = 6, rotaON = 1;
                break; 
            case "hard":
                rows = 6, cols = 8, rotaON = 1;
                break;
            case "veryHard":
                rows = 10, cols = 12, rotaON = 1;
                break;
        }
        
    });
});

let timerInterval;
let startTime;


function startTimer() {
    clearInterval(timerInterval); // 既存のタイマーをリセット
    startTime = Date.now();
    timerInterval = setInterval(updateTimer, 100);
}

function updateTimer() {
    const elapsedTime = Date.now() - startTime;
    const seconds = (elapsedTime / 1000).toFixed(3); // 秒を小数で表示
    document.getElementById("timer").innerText = `${seconds} 秒`;
}

function stopTimer() {
    clearInterval(timerInterval);
    const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(3);
    
    // パズルが完成した場合のみランキングを更新
    if (checkCompletion()) {
        updateRanking(elapsedTime);
    }
}

function updateRanking(clearTime) {
    const key = RANKING_KEY[currentDifficulty];
    let ranking = JSON.parse(localStorage.getItem(key)) || [];

    ranking.push(parseFloat(clearTime));
    ranking.sort((a, b) => a - b); // 昇順ソート
    ranking = ranking.slice(0, 5); // 上位5件のみ保持

    localStorage.setItem(key, JSON.stringify(ranking));
    updateRankingDisplay();
}

// ランキングの表示更新
function updateRankingDisplay() {
    const key = RANKING_KEY[currentDifficulty];
    let ranking = JSON.parse(localStorage.getItem(key)) || [];
    
    const rankingContainer = document.getElementById("ranking");
    rankingContainer.innerHTML = `<h2>ランキング <br>(${currentDifficulty})</h2>`;
    
    ranking.forEach((time, index) => {
        let rankClass = "";
        if (index === 0) rankClass = "gold";
        else if (index === 1) rankClass = "silver";
        else if (index === 2) rankClass = "bronze";

        rankingContainer.innerHTML += `<p class="rank ${rankClass}">${index + 1}位: ${time} 秒</p>`;
    });
}

let timerStarted = false; // タイマーが開始されたかどうかを追跡
// ----------------------------------
function loadPuzzle() {
    //toggleDrag(true);
    stopTimer();
    timerStarted = false;

    puzzleContainer.innerHTML = "";
    pieces = [];
    const imageUrl = selectedImageUrl;

    const image = new Image();
    image.src = imageUrl;
    image.onload = function () {
        const imageWidth = image.width;
        const imageHeight = image.height;

        const pieceWidth = imageWidth / cols;
        const pieceHeight = imageHeight / rows;

        // コンテナのサイズ設定 (CSSで制御)
        puzzleContainer.style.width = `${imageWidth}px`;
        puzzleContainer.style.height = `${imageHeight}px`;

        // 枠線用のフレームを追加
        const puzzleFrame = document.createElement("div");
        puzzleFrame.classList.add("puzzle-frame");
        puzzleContainer.appendChild(puzzleFrame);

        // 背景のグリッド (CSSで制御)
        puzzleContainer.classList.add("puzzle-grid");
        puzzleContainer.style.setProperty("--piece-width", `${pieceWidth}px`);
        puzzleContainer.style.setProperty("--piece-height", `${pieceHeight}px`);

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const piece = document.createElement("div");
                piece.classList.add("piece");
                piece.style.backgroundImage = `url('${imageUrl}')`;
                piece.style.backgroundPosition = `-${col * pieceWidth}px -${row * pieceHeight}px`;
                piece.style.width = `${pieceWidth}px`;
                piece.style.height = `${pieceHeight}px`;

                // 正解位置を保存
                piece.dataset.correctX = col * pieceWidth;
                piece.dataset.correctY = row * pieceHeight;

                // 初期位置をランダムに設定 (CSSで制御)
                if(Terminal===0){//横並び
                    piece.style.setProperty("--random-left", `${imageWidth + Math.random() * pieceContainerWidth}px`);
                    piece.style.setProperty("--random-top", `${Math.random() * (imageHeight - pieceHeight)}px`);
                }else{//縦並び
                    piece.style.left = `${Math.random() * imageWidth * pieceContainerWidth}px`;
                    piece.style.top = `${imageHeight + Math.random() * pieceContainerHeight}px`;
                }
                if (rotaON === 1) {
                    // ランダム回転
                    const rotation = Math.floor(Math.random() * 4) * 90;
                    piece.style.transform = `rotate(${rotation}deg)`;
                }
                // タッチイベント追加
                addTouchEvents(piece);

                pieces.push(piece);
                puzzleContainer.appendChild(piece);
            }
        }
    };
}
function addTouchEvents(piece) {
    let touchStartTime = 0;
    let isDragging = false;
    let startX = 0, startY = 0, offsetX = 0, offsetY = 0;

    piece.addEventListener("touchstart", function (e) {
        touchStartTime = Date.now();
        isDragging = false;

        let touch = e.touches[0];
        startX = touch.clientX;
        startY = touch.clientY;
        offsetX = piece.offsetLeft;
        offsetY = piece.offsetTop;
        if (!timerStarted) {
            startTimer(); // ✅ 初回のピース移動時にタイマーを開始
            timerStarted = true;
        }
        // 長押し判定
        setTimeout(() => {
            if (Date.now() - touchStartTime >= 500) {
                isDragging = true;
                piece.classList.add("dragging");
            }
        }, 500);
    });

    piece.addEventListener("touchmove", function (e) {
        if (isDragging) {
            e.preventDefault(); // スクロール防止
            let touch = e.touches[0];

            let newX = offsetX + (touch.clientX - startX);
            let newY = offsetY + (touch.clientY - startY);

            piece.style.left = `${newX}px`;
            piece.style.top = `${newY}px`;
        }
    });

    piece.addEventListener("touchend", function (e) {
        let touchTime = Date.now() - touchStartTime;

        if (!isDragging && touchTime < 500) {
            // タップなら回転
            if (rotaON === 1) {
                let currentRotation = parseInt(piece.style.transform.replace("rotate(", "").replace("deg)", "")) || 0;
                piece.style.transform = `rotate(${(currentRotation + 90) % 360}deg)`;
            }
        } else {
            // スナップ処理
            snapToGrid(piece);
        }

        isDragging = false;
        piece.classList.remove("dragging");

        // パズルの完成判定
        if (checkCompletion()) {
            stopTimer();
        }
    });
}

function snapToGrid(piece) {
    const correctX = parseInt(piece.dataset.correctX);
    const correctY = parseInt(piece.dataset.correctY);
    const currentX = parseInt(piece.style.left);
    const currentY = parseInt(piece.style.top);

    const threshold = 20; // スナップ許容範囲
    // 現在の回転角度を取得（デフォルトは0度）
    const transformValue = piece.style.transform;
    const rotationMatch = transformValue.match(/rotate\((\d+)deg\)/);
    const currentRotation = rotationMatch ? parseInt(rotationMatch[1]) % 360 : 0;

    if (Math.abs(currentX - correctX) < threshold && Math.abs(currentY - correctY) < threshold && currentRotation === 0) {
        piece.style.left = correctX + "px";
        piece.style.top = correctY + "px";
        piece.classList.add("correct"); // 正しく配置されたことを示す
    }
}

function checkCompletion() {
    let completed = pieces.every(piece => piece.classList.contains("correct"));
    
    if (completed) {
        return true;
    } else {
        return false;
    }
}

window.onload = function() {
    loadPuzzle(); // ✅ パズルをロード
    document.getElementById("message").innerText = ""; // ✅ メッセージをクリア
};

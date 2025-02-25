let pieceContainerWidth = 400;//PC-Full時のピース置き場サイズ
let pieceContainerHeight = 1;
let Terminal = 0;//0=PCFULL~3/4 , 1=iPhone,Android
// CSS切り替え関数        
function switchCSS() {
    const cssSwitcher = document.getElementById("css-switcher");
    const width = document.documentElement.clientWidth;
    const PCFull_width = 2880;
      
    if(width<=440){
        cssSwitcher.href = "/static/css/iPhone/~440/Jigsaw_iPhone.css";
        pieceContainerWidth = 0.6;
        pieceContainerHeight = 500;
        Terminal=1;
        console.log(`画面幅: ${width}px - iPhone.css 適用`);
    }else if(440 < width && width <= 1260){
        cssSwitcher.href = "/static/css/iPhone/Jigsaw_iPhone.css";
        pieceContainerWidth = 0.6;
        pieceContainerHeight = 500;
        Terminal=1;
        console.log(`画面幅: ${width}px - iPhone.css 適用`);
    }else if (1260 < width && width <= PCFull_width * 0.5) {
      cssSwitcher.href = "/static/css/PC/Half/Jigsaw_PC-Half.css";
      pieceContainerWidth = 0.8;
      pieceContainerHeight = 500;
      Terminal=1;
      console.log(`画面幅: ${width}px - PCHalf.css 適用`);
    } else if (PCFull_width * 0.5 < width && width <= PCFull_width * 0.75) {
      cssSwitcher.href = "/static/css/PC/3Quarters/Jigsaw_PC-3Q.css";
      pieceContainerWidth = 300;
      Terminal=0;
      console.log(`画面幅: ${width}px - PC3Q.css 適用`);
    } else if(PCFull_width*0.75 < width){
      cssSwitcher.href = "/static/css/PC/Full/Jigsaw_PC-Full.css";
      pieceContainerWidth = 600;
      Terminal=0;
      console.log(`画面幅: ${width}px - PCFull.css 適用`);
    }
  }

  // 初期化時とリサイズ時に適用
  document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
      switchCSS();
      console.log("初期画面幅:", window.innerWidth);
    }, 100);
  });

  window.addEventListener("resize", () => {
    switchCSS();
    console.log("リサイズ後の画面幅:", window.innerWidth);
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

// 初回のみデフォルトのランキングをセット
function initializeRanking() {
    Object.keys(RANKING_KEY).forEach(difficulty => {
        if (!localStorage.getItem(RANKING_KEY[difficulty])) {
            const defaultRanking = Array(5).fill(getDefaultTime(difficulty));
            localStorage.setItem(RANKING_KEY[difficulty], JSON.stringify(defaultRanking));
        }
    });
}

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
    console.log(`クリアタイム (${currentDifficulty}): ${elapsedTime} 秒`);
    
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
    console.log(`更新後のランキング (${currentDifficulty}):`, ranking);

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

function loadPuzzle() {
    toggleDrag(true);
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
                if(Terminal===0){
                    piece.style.setProperty("--random-left", `${imageWidth + Math.random() * pieceContainerWidth}px`);
                    piece.style.setProperty("--random-top", `${Math.random() * (imageHeight - pieceHeight)}px`);
                }else{
                    piece.style.left = `${Math.random() * imageWidth * pieceContainerWidth}px`;
                    piece.style.top = `${imageHeight + Math.random() * pieceContainerHeight}px`;
                }
                piece.style.setProperty("--random-left", `${imageWidth + Math.random() * pieceContainerWidth}px`);
                piece.style.setProperty("--random-top", `${Math.random() * (imageHeight - pieceHeight)}px`);

                if (rotaON === 1) {
                    // ランダム回転
                    const rotation = Math.floor(Math.random() * 4) * 90;
                    piece.style.transform = `rotate(${rotation}deg)`;

                    // クリックで90度回転
                    piece.addEventListener("click", function () {
                        let currentRotation = parseInt(piece.style.transform.replace("rotate(", "").replace("deg)", "")) || 0;
                        currentRotation = (currentRotation + 90) % 360;
                        piece.style.transform = `rotate(${currentRotation}deg)`;
                    });
                }

                // ドラッグ可能にする
                piece.draggable = true;
                piece.addEventListener("dragstart", dragStart);
                piece.addEventListener("dragend", dragEnd);

                pieces.push(piece);
                puzzleContainer.appendChild(piece);
            }
        }
    };
}


let draggedPiece = null;
let offsetX, offsetY;

function toggleDrag(isEnabled) {
    pieces.forEach(piece => {
        if (isEnabled) {
            piece.draggable = true;
            piece.style.cursor = "grab";
            // ドラッグのリスナーを再度設定
            piece.addEventListener("dragstart", dragStart);
            piece.addEventListener("dragend", dragEnd);
            if(rotaON===1){
              piece.addEventListener("click", rotatePiece);  
            }
        } else {
            piece.draggable = false;
            piece.style.cursor = "not-allowed";
            // ドラッグのリスナーを削除
            piece.removeEventListener("dragstart", dragStart);
            piece.removeEventListener("dragend", dragEnd);
            if(rotaON===1){
                piece.removeEventListener("click", rotatePiece);
              }
        }
    });
}

// ピースの回転を管理する関数
function rotatePiece(event) {
    let piece = event.target;
    let currentRotation = parseInt(piece.style.transform.replace('rotate(', '').replace('deg)', '')) || 0;
    currentRotation = (currentRotation + 90) % 360;
    piece.style.transform = `rotate(${currentRotation}deg)`;
}

function dragStart(event) {
    draggedPiece = event.target;
    offsetX = event.clientX - draggedPiece.offsetLeft;
    offsetY = event.clientY - draggedPiece.offsetTop;
}

function dragEnd(event) {
    if (!draggedPiece) return;

    // 新しい位置を設定
    const newX = event.clientX - offsetX;
    const newY = event.clientY - offsetY;
    draggedPiece.style.left = newX + "px";
    draggedPiece.style.top = newY + "px";

    // スナップ処理
    snapToGrid(draggedPiece);

    if (!timerStarted) {
        startTimer(); // ✅ 初回のピース移動時にタイマーを開始
        timerStarted = true;
    }

    // すべてのピースが正しく配置されたかチェック
    if(checkCompletion()===true){
        toggleDrag(false); // 完成したらドラッグを無効化
        stopTimer();
    }

    draggedPiece = null;
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
    const messageElement = document.getElementById("message");

    if (completed) {
        messageElement.innerText = "完成しました！";
        messageElement.style.display = "block"; // ✅ 表示
        setTimeout(() => {
            messageElement.classList.add("show"); // ✅ 徐々に表示
        }, 10); // 少し遅らせてアニメーションを適用
        return true;
    } else {
        messageElement.classList.remove("show"); // ✅ アニメーションをリセット
        setTimeout(() => {
            messageElement.style.display = "none"; // ✅ 非表示
        }, 1000); // アニメーション後に完全に消す
        return false;
    }
}

window.onload = function() {
    loadPuzzle(); // ✅ パズルをロード
    document.getElementById("message").innerText = ""; // ✅ メッセージをクリア
};

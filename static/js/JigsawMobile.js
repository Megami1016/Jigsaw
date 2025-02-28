let pieceContainerWidth = 1;//PC-Full時のピース置き場サイズ
let pieceContainerHeight = 1;
let Terminal = 0;
let isTimerRunning = false; // タイマーが動作中かを管理
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
    switchCSS();
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
    isTimerRunning = true;
}

function updateTimer() {
    const elapsedTime = Date.now() - startTime;
    const seconds = (elapsedTime / 1000).toFixed(3); // 秒を小数で表示
    document.getElementById("timer").innerText = `${seconds} 秒`;
}

function stopTimer() {
    clearInterval(timerInterval);
    const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(3);
    isTimerRunning = false;  // ✅ タイマーを停止済みにする
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
    switchCSS();
    console.log("フレームの下幅",pieceContainerHeight);
    stopTimer();
    timerStarted = false;

    puzzleContainer.innerHTML = "";
    pieces = [];
    frames = [];
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

                const frame = document.createElement("div");
                frame.classList.add("puzzle-frame");
                frame.style.width = `${pieceWidth}px`;
                frame.style.height = `${pieceHeight}px`;
                frame.style.left = `${col * pieceWidth}px`;
                frame.style.top = `${row * pieceHeight}px`;
                frame.dataset.correctX = col * pieceWidth;
                frame.dataset.correctY = row * pieceHeight;
                addFrameEvents(frame);

                frames.push(frame);
                puzzleContainer.appendChild(frame);

                piece.dataset.correctX = col * pieceWidth;
                piece.dataset.correctY = row * pieceHeight;

                if(Terminal===0){//横並び
                    piece.style.setProperty("--random-left", `${imageWidth + Math.random() * pieceContainerWidth}px`);
                    piece.style.setProperty("--random-top", `${Math.random() * (imageHeight - pieceHeight)}px`);
                }else{//縦並び
                    piece.style.left = `${Math.random() * imageWidth * pieceContainerWidth}px`;
                    piece.style.top = `${imageHeight + Math.random() * pieceContainerHeight}px`;
                }

                piece.dataset.originalLeft = piece.style.left;
                piece.dataset.originalTop = piece.style.top;

                if (rotaON === 1) {
                    const rotation = Math.floor(Math.random() * 4) * 90;
                    piece.style.transform = `rotate(${rotation}deg)`;
                }

                addTouchEvents(piece);

                // fit 変数を追加
                piece.dataset.fit = "0";

                pieces.push(piece);
                puzzleContainer.appendChild(piece);
            }
        }
    };
}

let selectedPiece = null;
let selectedFrame = null;
let lastTapTime = 0;

function addTouchEvents(piece) {
    
    piece.addEventListener("touchstart", function (e) {
        let currentTime = Date.now();
        let tapDuration = currentTime - lastTapTime;
        lastTapTime = currentTime;
        if (!timerStarted) {
            startTimer(); // ✅ 初回のピース移動時にタイマーを開始
            timerStarted = true;
        }
        if (tapDuration < 400) {
            if(rotaON===1){
                rotatePiece(piece);
            }
            return;
        }

        if (selectedFrame) {
            //console.log("枠が選択されているのでピースを配置");
            placePiece(piece, selectedFrame);
        } else {
            // ピース選択
            selectPiece(piece);
        }
    });
}

function addFrameEvents(frame) {
    frame.addEventListener("touchstart", function () {
        if (selectedPiece) {
            //console.log("選択中のピースをフレームに配置");
            placePiece(selectedPiece, frame);
        } else {
            //console.log("フレーム選択");
            selectFrame(frame);
        }
    });
}

function selectPiece(piece) {
    if (selectedPiece) {
        //console.log("以前のピース選択解除:", selectedPiece);
        selectedPiece.classList.remove("selected");
        selectedPiece.style.zIndex = "";
    }

    if (piece.dataset.fit === "0") {
        // fitが0なら選択し、フレームに配置
        selectedPiece = piece;
        selectedPiece.classList.add("selected");
        selectedPiece.style.zIndex = "10";
        piece.dataset.fit = "1"; // fitを1に設定
        console.log(`選択中のピース - 元の座標: left=${piece.offsetLeft}, top=${piece.offsetTop}`);
    } else {
        // fitが1なら元の位置に戻す
        returnToOriginalPosition(piece);
    }
}

function selectFrame(frame) {
    frame.style.zIndex = "5";
    if (selectedFrame) {
        selectedFrame.classList.remove("selected-frame");
        selectedFrame.style.zIndex = "";
    }
    selectedFrame = frame;
    selectedFrame.classList.add("selected-frame");
    console.log(`選択中の枠 - 座標: left=${frame.offsetLeft}, top=${frame.offsetTop}`);
}

function placePiece(piece, frame = selectedFrame) {
    if (!frame) {
        console.log("枠が選択されていないため配置不可");
        return;
    }

    console.log("ピースを枠の位置にセット");

    const scaleFactor = puzzleContainer.getBoundingClientRect().width / puzzleContainer.offsetWidth;
    const frameRect = frame.getBoundingClientRect();
    const containerRect = puzzleContainer.getBoundingClientRect();

    const adjustedX = (frameRect.left - containerRect.left) / scaleFactor;
    const adjustedY = (frameRect.top - containerRect.top) / scaleFactor;

    piece.style.position = "absolute";
    piece.style.left = `${adjustedX}px`;
    piece.style.top = `${adjustedY}px`;

    setTimeout(() => {
        piece.classList.remove("selected");
        frame.classList.remove("selected-frame");
        selectedPiece = null;
        selectedFrame = null;

        console.log("ピース配置完了。完成チェック実行");
        checkCompletion();
    }, 100);
}

function returnToOriginalPosition(piece) {
    piece.style.left = piece.dataset.originalLeft;
    piece.style.top = piece.dataset.originalTop;
    piece.classList.remove("selected");
    piece.dataset.fit = "0"; // fitを0に戻す
    selectedPiece = null;
    console.log("ピースが元の位置に戻りました");
}

function getRotation(piece) {
    let transformValue = piece.style.transform;
    let rotationMatch = transformValue.match(/rotate\((\d+)deg\)/);
    return rotationMatch ? parseInt(rotationMatch[1]) % 360 : 0;
}

function rotatePiece(piece) {
    let currentRotation = getRotation(piece);
    let newRotation = (currentRotation + 90) % 360;
    piece.style.transform = `rotate(${newRotation}deg)`;
}


function checkCompletion() {
    pieces.forEach(piece => {
        let correctX = parseInt(piece.dataset.correctX);
        let correctY = parseInt(piece.dataset.correctY);
    
        // 位置を比較する際の許容範囲
        let allowedPositionDeviation = 10; // ±10pxのズレを許容
        let allowedRotationDeviation = 10; // ±10度の回転ズレを許容
    
        let currentX = parseInt(piece.style.left); // style.left を使って位置比較
        let currentY = parseInt(piece.style.top);
    
        // 回転を比較する際の許容範囲
        let currentRotation = getRotation(piece);
        let isCorrectPosition = Math.abs(currentX - correctX) <= allowedPositionDeviation &&
                                Math.abs(currentY - correctY) <= allowedPositionDeviation;
        let isCorrectRotation = Math.abs(currentRotation - 0) <= allowedRotationDeviation; // 回転が0度に近いか
    
        // 位置と回転が正しい場合、correctクラスを追加
        if (isCorrectPosition && isCorrectRotation) {
            piece.classList.add("correct"); // 正しい位置に配置されているピースに緑の縁取りを追加
            piece.classList.remove("uncorrect");
        } else {
            piece.classList.remove("correct"); // 間違った位置の場合はremove
            piece.classList.add("uncorrect");
        }
    });
    
    let completed = pieces.every(piece => {
        let correctX = parseInt(piece.dataset.correctX);
        let correctY = parseInt(piece.dataset.correctY);

        // 位置を比較する際の許容範囲
        let allowedPositionDeviation = 10; // ±5pxのズレを許容
        let allowedRotationDeviation = 10; // ±5度の回転ズレを許容

        let currentX = parseInt(piece.style.left); // style.left を使って位置比較
        let currentY = parseInt(piece.style.top);

        // 回転を比較する際の許容範囲
        let currentRotation = getRotation(piece);
        let isCorrectPosition = Math.abs(currentX - correctX) <= allowedPositionDeviation &&
                                Math.abs(currentY - correctY) <= allowedPositionDeviation;
        let isCorrectRotation = Math.abs(currentRotation - 0) <= allowedRotationDeviation; // 回転が0度に近いか

        // 位置と回転が正しい場合、correctクラスを追加
        if (isCorrectPosition && isCorrectRotation) {
            piece.classList.remove("correct"); 
        } 

        return isCorrectPosition && isCorrectRotation;
    });

    if (completed) {
        if (isTimerRunning) {
            console.log("パズル完成！タイマーを停止");
            stopTimer();
        }
        return true;
    } else {
        console.log("未完成のピースあり");
        return false;
    }
}

window.onload = function() {
    loadPuzzle(); // ✅ パズルをロード
    document.getElementById("message").innerText = ""; // ✅ メッセージをクリア
};

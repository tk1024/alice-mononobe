const medias = {audio: false, video: true}
const video = document.getElementById("video")
const range = document.getElementById("range")
const bgImage = document.getElementById("bgImage")
const bgImageSelect = document.getElementById("bgImageSelect")
const currentValue = document.getElementById("currentValue")
const videoCanvas = document.getElementById("video-canvas")
const videoCanvasCtx = videoCanvas.getContext("2d")
const backgroundCanvas = document.getElementById("background-canvas")
const backgroundCanvasCtx = backgroundCanvas.getContext("2d")
const diffCanvas = document.getElementById("diff-canvas")
const diffCanvasCtx = diffCanvas.getContext("2d")
const subscribeBackgroundImage = document.getElementById("subscribeBackgroundImage")
let backgroundImageData = null
let threshold = 0

function successCallback(stream) {
  video.srcObject = stream;
}

function errorCallback(err) {
  alert(err);
}

function getPictureFromVideo(video) {
  backgroundCanvas.getContext("2d").drawImage(video, 0, 0, 640, 480)
  return backgroundCanvasCtx.getImageData(0, 0, 640, 480)
}

(async function() {
  const stream = await navigator.mediaDevices.getUserMedia(medias)
  console.log(stream)
  const video = document.getElementById('video')
  video.srcObject = stream
  await new Promise((resolve) => {
    video.onloadedmetadata = function(e) {
      video.play()
      resolve()
    }
  })

  subscribeBackgroundImage.addEventListener("click", () => {
    backgroundImageData = getPictureFromVideo(video)
  })

  range.addEventListener("change", () => {
    threshold = Number(range.value)
    currentValue.textContent = threshold
  })

  bgImageSelect.addEventListener("change", (ev) => {
    const file = ev.target.files[0]
    var reader = new FileReader();
    reader.onload = function(ev) {
      bgImage.style.backgroundImage = `url(${reader.result})`
    }
    reader.readAsDataURL(file);
  })

  function drawLoop() {
    videoCanvasCtx.drawImage(video, 0, 0, 640, 480);
    const videoImageData = videoCanvasCtx.getImageData(0, 0, 640, 480)
    const length = videoImageData.data.length
    for(let i = 0;i < length;i = i+4) {
      if(backgroundImageData) {
        if(
          (videoImageData.data[i] + threshold > backgroundImageData.data[i] && videoImageData.data[i] - threshold < backgroundImageData.data[i]) && 
          (videoImageData.data[i+1] + threshold > backgroundImageData.data[i+1] && videoImageData.data[i+1] - threshold < backgroundImageData.data[i+1]) && 
          (videoImageData.data[i+2] + threshold > backgroundImageData.data[i+2] && videoImageData.data[i+2] - threshold < backgroundImageData.data[i+2])
        ) {
          videoImageData.data[i]   = 0
          videoImageData.data[i+1] = 0
          videoImageData.data[i+2] = 0
          videoImageData.data[i+3] = 0
        }
      }
    }
    diffCanvasCtx.putImageData(videoImageData, 0, 0)
    requestAnimationFrame(drawLoop);
  }
  drawLoop();
})()
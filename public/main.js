// =================================
// methods
// =================================

function fieldIds() {
    return [
    'image_text',
    'font',
    'preset',
    'image_bgcolor',
    'image_text_color',
    'image_text_size',
    'image_width',
    'image_height',
    'stroke_color',
    'stroke_size',
  ];
}

function serialize(obj) {
  var str = [];
  for (var p in obj)
    if (obj.hasOwnProperty(p)) {
      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
    }
  return str.join("&");
}

function copyStringToClipboard(str) {
  // Create new element
  var el = document.createElement('textarea');
  // Set value (string to be copied)
  el.value = str;
  // Set non-editable to avoid focus and move outside of view
  el.setAttribute('readonly', '');
  el.style = {position: 'absolute', left: '-9999px'};
  document.body.appendChild(el);
  // Select text inside element
  el.select();
  // Copy text to clipboard
  document.execCommand('copy');
  // Remove temporary element
  document.body.removeChild(el);
}

function restoreState() {
  var ids = fieldIds();
  var params = new URLSearchParams(window.location.hash.slice(2));
  for (var i=0; i<ids.length; i++) {
    var id = ids[i];
    var f = document.getElementById(id);
    var value = params.get(id);
    if (value) {
      if (id === 'font' || id === 'preset') {
        for (var j=0; f.options.length; j++) {
          var option = f.options[j];
          if (option && option.innerText === value) {
            option.selected = true;
            break;
          }
        }
      } else {
        f.value = value;
      }
    }
  }
}

function saveState() {
  var state = {};
  var ids = fieldIds();
  for (var i=0; i<ids.length; i++) {
    var id = ids[i];
    var f = document.getElementById(id);
    if (id === 'font' || id === 'preset') {
      state[id] = f.selectedOptions[0].innerText;
    } else {
      state[id] = f.value;
    }
  }
  window.history.replaceState('', '', '#!' + serialize(state));
}

// =================================
// events
// =================================

function changeFont() {
  console.log(event);
  createImage();
}

function changePreset() {
  console.log(event);
  var option = event.target.selectedOptions[0];
  var params = JSON.parse(option.value);
  if (params.image_width) {
    document.getElementById('image_width').value = params.image_width;
  }
  if (params.image_height) {
    document.getElementById('image_height').value = params.image_height;
  }

  createImage();
}

function copyUrl() {
  copyStringToClipboard(window.location.href);
  alert('URLをコピーしました');
}

function resetSettings() {
  if (window.confirm("リセットして大丈夫ですか？\nテキストのみ保持されます。")) {
    var text = document.getElementById('image_text').value;
    window.history.replaceState('', '', '#!' + serialize({'image_text': text}));
    window.location.reload();
  }
}

function createImage() {
  saveState();
  var text = document.getElementById('image_text').value;

  // canvasを白色で初期化
  var imageWidth = document.getElementById('image_width').value;
  var imageHeight = document.getElementById('image_height').value;
  var canvas = document.getElementById('dummy_canvas');
  canvas.width = imageWidth;
  canvas.height = imageHeight;
  var ctx = canvas.getContext('2d');
  ctx.fillStyle = document.getElementById('image_bgcolor').value;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // canvasにテキストを書き込み
  var fontSize = document.getElementById('image_text_size').value;
  var fontFamily = document.getElementById('font').selectedOptions[0].value;
  ctx.font = '900 ' + fontSize + 'px ' + fontFamily;
  ctx.fillStyle = document.getElementById('image_text_color').value;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  var strokeColor = document.getElementById('stroke_color').value;
  var strokeSize = parseInt(document.getElementById('stroke_size').value);
  if (strokeColor && strokeSize > 0) {
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeSize;
    ctx.fillText(text, imageWidth / 2, imageHeight / 2);
    ctx.strokeText(text, imageWidth / 2, imageHeight / 2);
  } else {
    ctx.fillText(text, imageWidth / 2, imageHeight / 2);
  }


  // canvasからdataURLをimgにコピー
  var dataURL = canvas.toDataURL();
  document.getElementById('preview').src = dataURL;

  // ダウンロードリンク更新
  var downloadLink = document.getElementById('download_link');
  download_link.href = dataURL;
  download_link.download = text + ".png";
}

// =================================
// init
// =================================

(function() {
  // fonts
  var fonts = [
    { label: 'M PLUS 1p', value: "'M PLUS 1p', sans-serif" },
    { label: 'Noto Sans JP', value: "'Noto Sans JP', sans-serif" },
    { label: 'Verdana', value: "Verdana" },
  ];
  var font = document.getElementById('font');
  for (var i=0; i<fonts.length; i++) {
    var r = fonts[i];
    var option = document.createElement('option');
    option.innerText = r.label;
    option.value = r.value;
    font.append(option);
  }

  // presets
  var presets = [
    { label: 'YouTube (1280x720)', value: {image_width: 1280, image_height: 720} },
    { label: '16:9 (1920x1080)', value: {image_width: 1920, image_height: 1080} },
    { label: '4:3 (800x600)', value: {image_width: 800, image_height: 600} },
    { label: '1:1 (1024x1024)', value: {image_width: 1024, image_height: 1024} },
    { label: '1:1 (512x512)', value: {image_width: 512, image_height: 512} },
  ];
  var preset = document.getElementById('preset');
  for (var i=0; i<presets.length; i++) {
    var r = presets[i];
    var option = document.createElement('option');
    option.innerText = r.label;
    option.value = JSON.stringify(r.value);
    preset.append(option);
  }

  restoreState();

  //TODO 指定のフォントがロードされたのを確認してから描画する
  createImage();
  setTimeout(function() {
    createImage();
  }, 1000);
})();

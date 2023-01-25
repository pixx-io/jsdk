function codeModal() {
  var codeModal = document.querySelector('#pixxio-integration-example');
  var closeModal= document.querySelector('#pixxio-integration-example .close');
  var showCodeLink = document.querySelector('#showCode');
  showCodeLink.addEventListener('click', function(event) {
    event.preventDefault();
    document.querySelector('#pixxio-integration-example code').innerHTML = codeTemplate();
    hljs.highlightAll();
    codeModal.classList.add('show');
  });
  closeModal.addEventListener('click', function(event) {
    event.preventDefault();
    codeModal.classList.remove('show');
  });
}

codeModal();

// default setup
var pixxioConfiguration = {
  appKey: '123',
  appUrl: '',
  refreshToken: '',
  modal: true,
  language: 'de',
  askForProxy: false,
};

var pixxioConfigurationGetMedia = {
  max: 0,
  allowTypes: [],
  allowFormats: null,
  additionalResponseFields: null,
  showFileName: false,
  showFileType: false,
  showFileSize: false,
  showSubject: true
}

function codeTemplate() {
  return `var p = new PIXXIO(${JSON.stringify(pixxioConfiguration, null, 2)});
p.getMedia(${JSON.stringify(pixxioConfigurationGetMedia, null, 2)})`;
}

function config() {

}

function mapConfig(config) {
  var keys = Object.keys(config);
  keys.forEach(function (key) {
    var el = document.querySelector('[name="'+ key +'"]');
    console.log(el, el.hasOwnProperty('checked'));
    if (el && el.getAttribute('type') === 'checkbox') {
      el.checked = config[key];
    }
    else if (el) {
      el.value = config[key];
    }
  })
}

mapConfig(pixxioConfiguration);

var p = new PIXXIO({
  element: document.querySelector('#pixxio-jsdk'),
  modal: false,
  appKey: '70aK0pH090EyxHgS1sSg3Po8M',
  language: 'de',
  askForProxy: true,
  compact: false,
  appUrl: 'https://version2-stage.pixx.io',
  refreshToken: 'uOCvE1NBv33BLAnflITdhQpV75qwtH'
});

function setImage(file) {
  var image = new Image();
  image.src = file.url;
  document.body.appendChild(image);
}
		
document.querySelector('#btn').addEventListener('click', (e) => {
  e.preventDefault();
  p.getMedia({ 
    max: -1, 
    allowTypes: ['jpg', 'png'],
    showSelection: false,
    showFileName: false,
    showFileType: false,
    showFileSize: true
    // allowedFormats: ['preview']
    }).then((selectedFiles) => {
    selectedFiles.forEach(f => setImage(f));
  }).catch(() => {
  });
})

document.querySelector('input[type=file]').addEventListener('change', (event) => {
    var file = document.querySelector('input[type=file]').files[0];
    p.pushMedia({ 
      file: file,
    }).then((response) => {
      console.log('pushMedia response: ', response)
    }).catch(() => {
      document.querySelector('input[type=file]').value = '';
    });
  })
console.log("Loaded compressor script")

var modal = document.getElementById("myModal");
var progress = document.getElementById("progress");
const uploader_picker = document.querySelector('[type=file]')
const folder_selector = document.getElementById('selector-folder')
const files_selector = document.getElementById('selector-files')
const format_picker = document.getElementById('format-picker')
const quality_picker = document.getElementById('compression-factor')
const max_file_size_check = document.getElementById('max-file-check')
const max_file_size = document.getElementById('max-file')
const uploader_text = document.getElementById('select-text') 

let out_format;
let out_quality;
let out_size = 0;

const canvas = document.createElement('canvas')
const ctx = canvas.getContext('2d')
let zip_file = null

folder_selector.addEventListener('click', () => {
    uploader_picker.setAttribute("webkitdirectory", "")
    uploader_picker.setAttribute("directory", "")
    uploader_picker.removeAttribute("accept")
    uploader_picker.removeAttribute("multiple")
    folder_selector.classList.add("active")
    files_selector.classList.remove("active")
    uploader_text.textContent = "Select a folder"
})

files_selector.addEventListener('click', () => {
    uploader_picker.removeAttribute("webkitdirectory", "")
    uploader_picker.removeAttribute("directory", "")
    uploader_picker.setAttribute("accept", "image/*")
    uploader_picker.setAttribute("multiple", "")
    folder_selector.classList.remove("active")
    files_selector.classList.add("active")
    uploader_text.textContent = "Select your files"
})

async function compress_file(file) {
    if (file['type'].split('/')[0] === 'image') {
        if (file.size >= out_size) {
            let url = URL.createObjectURL(file)
            let img = new Image()
            img.src = url;
            await img.decode()

            canvas.width = img.naturalWidth
            canvas.height = img.naturalHeight

            ctx.drawImage(img, 0, 0)

            await new Promise(resolve => canvas.toBlob((blob) => {
                resolve(zip_file.file(`${file.name.split('.')[0]}.${out_format}`, blob))
            }, 'image/' + out_format, out_quality))

            img.src = ''
            img = null
            url = null
        } else {
            console.log(file)
            await zip_file.file(`${file.name.split('.')[0]}.${out_format}`, file)
        }
    }
}

async function compress() {

    zip_file = new JSZip()
    modal.style.display = "block";
    progress.textContent = `0/${uploader_picker.files.length}`;

    if (uploader_picker.files.length === 0) {
        console.log("No files to compress")
        modal.style.display = "none";
        return
    }

    if (max_file_size_check.checked)
        out_size = parseFloat(max_file_size.value) * 1_000_000

    out_format = format_picker.value
    out_quality = parseFloat(quality_picker.value)

    for (let [i, file] of Array.from(uploader_picker.files).entries()) {
        try {
            await compress_file(file)
        } catch {
            console.error(`Error procesando imagen ${file}`)
        }
        progress.textContent = `${i}/${uploader_picker.files.length}`
    }

    zip_file.generateAsync({
        type: 'blob',
        streamFiles: true
    }).then(data => {
        const link = document.createElement('a')
        link.href = URL.createObjectURL(data)
        link.download = 'compressed_imgs.zip'
        link.click()
        modal.style.display = "none";
    })
    zip_file = null;
}




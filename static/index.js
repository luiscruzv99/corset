console.log("Loaded compressor script")

const uploader_picker = document.querySelector('[type=file]')
const folder_selector = document.getElementById('selector-folder')
const files_selector = document.getElementById('selector-files')
const format_picker = document.getElementById('format-picker')
const quality_picker = document.getElementById('compression-factor')

let out_format;
let out_quality;

const canvas = document.createElement('canvas')
const ctx = canvas.getContext('2d')
const zip_file = new JSZip()

folder_selector.addEventListener('click', () => {
    uploader_picker.setAttribute("webkitdirectory", "")
    uploader_picker.setAttribute("directory", "")
    uploader_picker.removeAttribute("accept")
    uploader_picker.removeAttribute("multiple")
})

files_selector.addEventListener('click', () => {
    uploader_picker.removeAttribute("webkitdirectory", "")
    uploader_picker.removeAttribute("directory", "")
    uploader_picker.setAttribute("accept", "image/*")
    uploader_picker.setAttribute("multiple", "")
})

async function compress_file(file) {
    if (file['type'].split('/')[0] === 'image') {
        let url = URL.createObjectURL(file)
        let img = new Image()
        img.src = url;
        await img.decode()

        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight

        ctx.drawImage(img, 0, 0)

        await new Promise(resolve => canvas.toBlob((blob) => {
            resolve(zip_file.file(`${file.name.split('.')[0]}.` + out_format, blob))
        }, 'image/' + out_format, out_quality))

        img.src = ''
        img = null
        url = null
    }
}

async function compress() {

    if (uploader_picker.files.length === 0) {
        console.log("No files to compress")
        return
    }

    out_format = format_picker.value
    out_quality = parseFloat(quality_picker.value)

    for (let [i,file] of Array.from(uploader_picker.files).entries()) {
        await compress_file(file)
        console.log(i)
    }

    zip_file.generateAsync({
        type: 'blob',
        streamFiles: true
    }).then(data => {
        const link = document.createElement('a')
        link.href = URL.createObjectURL(data)
        link.download = 'compressed_imgs.zip'
        link.click()
    })
}



